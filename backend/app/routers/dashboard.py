"""
Dashboard endpoint — returns summary metrics for the current month.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc, cast, Float as SAFloat, text as satext
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from datetime import date
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import Event, EventAssignment, Shift, JobRole, User, UserCompanyMembership

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
AuthDep = Annotated[dict, Depends(get_current_user)]


class StaffByRole(BaseModel):
    role_name: str
    count: int


class UpcomingEvent(BaseModel):
    id: int
    name: str
    event_date: date
    start_time: str
    status: str


class DashboardResponse(BaseModel):
    events_this_month: int
    events_completed: int
    events_upcoming: int
    events_in_progress: int
    total_staff_assigned: int
    staff_by_role: list[StaffByRole]
    total_hours_worked: float
    total_pay: float
    next_events: list[UpcomingEvent]
    total_employees: int
    total_events_all_time: int


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    today = date.today()
    first_of_month = today.replace(day=1)

    if today.month == 12:
        last_of_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        last_of_month = today.replace(month=today.month + 1, day=1)

    events_month_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            Event.status != "cancelled",
        )
    )
    events_this_month = events_month_result.scalar() or 0

    events_completed_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            Event.status == "finished",
        )
    )
    events_completed = events_completed_result.scalar() or 0

    events_upcoming_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= today,
            Event.status.in_(["published", "filled", "filled_pending", "created"]),
        )
    )
    events_upcoming = events_upcoming_result.scalar() or 0

    events_in_progress_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.status == "started",
        )
    )
    events_in_progress = events_in_progress_result.scalar() or 0

    total_staff_result = await db.execute(
        select(sqlfunc.count(EventAssignment.id))
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            EventAssignment.status == "approved",
        )
    )
    total_staff_assigned = total_staff_result.scalar() or 0

    staff_by_role_result = await db.execute(
        select(JobRole.name, sqlfunc.count(EventAssignment.id))
        .join(Event, Event.id == EventAssignment.event_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            EventAssignment.status == "approved",
        )
        .group_by(JobRole.name)
        .order_by(sqlfunc.count(EventAssignment.id).desc())
    )
    staff_by_role = [
        StaffByRole(role_name=name, count=count)
        for name, count in staff_by_role_result.all()
    ]

    pay_result = await db.execute(
        select(
            sqlfunc.coalesce(sqlfunc.sum(cast(Shift.hours_worked, SAFloat)), 0),
            sqlfunc.coalesce(sqlfunc.sum(cast(Shift.total_pay, SAFloat)), 0),
        )
        .join(EventAssignment, EventAssignment.id == Shift.assignment_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            Shift.clock_out.isnot(None),
        )
    )
    pay_row = pay_result.one()
    total_hours_worked = float(pay_row[0])
    total_pay = float(pay_row[1])

    next_events_result = await db.execute(
        select(Event).where(
            Event.company_id == company_id,
            Event.event_date >= today,
            Event.status.in_(["published", "filled", "filled_pending", "started", "created"]),
        )
        .order_by(Event.event_date, Event.start_time)
        .limit(5)
    )
    next_events = [
        UpcomingEvent(
            id=ev.id, name=ev.name, event_date=ev.event_date,
            start_time=str(ev.start_time), status=ev.status,
        )
        for ev in next_events_result.scalars().all()
    ]

    from app.models import Profile
    total_employees_result = await db.execute(
        select(sqlfunc.count(UserCompanyMembership.id))
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            UserCompanyMembership.company_id == company_id,
            UserCompanyMembership.is_active == True,
            Profile.code == "employee",
        )
    )
    total_employees = total_employees_result.scalar() or 0

    total_events_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.status != "cancelled",
        )
    )
    total_events_all_time = total_events_result.scalar() or 0

    return DashboardResponse(
        events_this_month=events_this_month,
        events_completed=events_completed,
        events_upcoming=events_upcoming,
        events_in_progress=events_in_progress,
        total_staff_assigned=total_staff_assigned,
        staff_by_role=staff_by_role,
        total_hours_worked=round(total_hours_worked, 2),
        total_pay=round(total_pay, 2),
        next_events=next_events,
        total_employees=total_employees,
        total_events_all_time=total_events_all_time,
    )


# ── Charts endpoint ──────────────────────────────────────────────────────────

class EventsByMonth(BaseModel):
    month: str
    count: int
    revenue: float

class PayrollByMonth(BaseModel):
    month: str
    total: float

class CostByRole(BaseModel):
    role: str
    total: float
    hours: float

class TopEmployee(BaseModel):
    name: str
    total_pay: float
    events: int
    role: str

class BiggestEvent(BaseModel):
    name: str
    staff_count: int
    total_pay: float
    date: str

class ChartsResponse(BaseModel):
    events_by_month:  list[EventsByMonth]
    payroll_by_month: list[PayrollByMonth]
    cost_by_role:     list[CostByRole]
    top_employees:    list[TopEmployee]
    biggest_events:   list[BiggestEvent]


@router.get("/charts", response_model=ChartsResponse)
async def get_dashboard_charts(
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]

    _today = date.today()
    _m = _today.month - 11
    _y = _today.year + (_m - 1) // 12
    _m = ((_m - 1) % 12) + 1
    twelve_months_ago = date(_y, _m, 1)

    # ── Eventos por mes ──────────────────────────────────────────────────────
    events_by_month_result = await db.execute(
        satext("""
            SELECT
                to_char(date_trunc('month', e.event_date), 'Mon YYYY') AS month,
                date_trunc('month', e.event_date) AS month_dt,
                COUNT(DISTINCT e.id) AS count,
                COALESCE(SUM(s.total_pay::float), 0) AS revenue
            FROM events e
            LEFT JOIN event_assignments ea ON ea.event_id = e.id
            LEFT JOIN shifts s ON s.assignment_id = ea.id
            WHERE e.company_id = :company_id
              AND e.status != 'cancelled'
              AND e.event_date >= :since
            GROUP BY date_trunc('month', e.event_date)
            ORDER BY date_trunc('month', e.event_date)
        """),
        {"company_id": company_id, "since": twelve_months_ago}
    )
    events_by_month = [
        EventsByMonth(month=row.month, count=row.count, revenue=round(float(row.revenue), 2))
        for row in events_by_month_result.mappings().all()
    ]

    # ── Nómina por mes ───────────────────────────────────────────────────────
    payroll_by_month_result = await db.execute(
        satext("""
            SELECT
                to_char(date_trunc('month', e.event_date), 'Mon YYYY') AS month,
                date_trunc('month', e.event_date) AS month_dt,
                COALESCE(SUM(s.total_pay::float), 0) AS total
            FROM events e
            JOIN event_assignments ea ON ea.event_id = e.id
            JOIN shifts s ON s.assignment_id = ea.id
            WHERE e.company_id = :company_id
              AND s.clock_out IS NOT NULL
              AND e.event_date >= :since
            GROUP BY date_trunc('month', e.event_date)
            ORDER BY date_trunc('month', e.event_date)
        """),
        {"company_id": company_id, "since": twelve_months_ago}
    )
    payroll_by_month = [
        PayrollByMonth(month=row.month, total=round(float(row.total), 2))
        for row in payroll_by_month_result.mappings().all()
    ]

    # ── Costo por rol ────────────────────────────────────────────────────────
    cost_by_role_result = await db.execute(
        satext("""
            SELECT
                jr.name AS role,
                COALESCE(SUM(s.total_pay::float), 0) AS total,
                COALESCE(SUM(s.hours_worked::float), 0) AS hours
            FROM shifts s
            JOIN event_assignments ea ON ea.id = s.assignment_id
            JOIN job_roles jr ON jr.id = ea.job_role_id
            JOIN events e ON e.id = ea.event_id
            WHERE e.company_id = :company_id
              AND s.clock_out IS NOT NULL
            GROUP BY jr.name
            ORDER BY total DESC
        """),
        {"company_id": company_id}
    )
    cost_by_role = [
        CostByRole(role=row.role, total=round(float(row.total), 2), hours=round(float(row.hours), 2))
        for row in cost_by_role_result.mappings().all()
    ]

    # ── Top 10 empleados ─────────────────────────────────────────────────────
    top_employees_result = await db.execute(
        satext("""
            SELECT
                u.name AS name,
                jr.name AS role,
                COALESCE(SUM(s.total_pay::float), 0) AS total_pay,
                COUNT(DISTINCT ea.event_id) AS events
            FROM shifts s
            JOIN event_assignments ea ON ea.id = s.assignment_id
            JOIN users u ON u.id = ea.user_id
            JOIN job_roles jr ON jr.id = ea.job_role_id
            JOIN events e ON e.id = ea.event_id
            WHERE e.company_id = :company_id
              AND s.clock_out IS NOT NULL
            GROUP BY u.name, jr.name
            ORDER BY total_pay DESC
            LIMIT 10
        """),
        {"company_id": company_id}
    )
    top_employees = [
        TopEmployee(name=row.name, role=row.role, total_pay=round(float(row.total_pay), 2), events=row.events)
        for row in top_employees_result.mappings().all()
    ]

    # ── Eventos más grandes ──────────────────────────────────────────────────
    biggest_events_result = await db.execute(
        satext("""
            SELECT
                e.name AS name,
                e.event_date AS date,
                COUNT(ea.id) AS staff_count,
                COALESCE(SUM(s.total_pay::float), 0) AS total_pay
            FROM events e
            JOIN event_assignments ea ON ea.event_id = e.id
            LEFT JOIN shifts s ON s.assignment_id = ea.id
            WHERE e.company_id = :company_id
              AND ea.status IN ('confirmed', 'completed')
            GROUP BY e.id, e.name, e.event_date
            ORDER BY staff_count DESC
            LIMIT 10
        """),
        {"company_id": company_id}
    )
    biggest_events = [
        BiggestEvent(name=row.name, staff_count=row.staff_count, total_pay=round(float(row.total_pay), 2), date=str(row.date))
        for row in biggest_events_result.mappings().all()
    ]

    return ChartsResponse(
        events_by_month=events_by_month,
        payroll_by_month=payroll_by_month,
        cost_by_role=cost_by_role,
        top_employees=top_employees,
        biggest_events=biggest_events,
    )