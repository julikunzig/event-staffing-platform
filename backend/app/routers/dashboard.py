"""
Dashboard endpoint — returns summary metrics for the current month.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc, cast, Float as SAFloat
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
    # Metrics del mes actual
    events_this_month: int
    events_completed: int
    events_upcoming: int
    events_in_progress: int
    total_staff_assigned: int
    staff_by_role: list[StaffByRole]
    total_hours_worked: float
    total_pay: float
    # Próximos eventos
    next_events: list[UpcomingEvent]
    # Totales generales
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

    # Último día del mes
    if today.month == 12:
        last_of_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        last_of_month = today.replace(month=today.month + 1, day=1)

    # ── Eventos del mes ──────────────────────────────────────────────────────
    events_month_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            Event.status != "cancelled",
        )
    )
    events_this_month = events_month_result.scalar() or 0

    # Eventos completados este mes
    events_completed_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= first_of_month,
            Event.event_date < last_of_month,
            Event.status == "finished",
        )
    )
    events_completed = events_completed_result.scalar() or 0

    # Eventos próximos (publicados o llenos, fecha >= hoy)
    events_upcoming_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.event_date >= today,
            Event.status.in_(["published", "filled", "filled_pending", "created"]),
        )
    )
    events_upcoming = events_upcoming_result.scalar() or 0

    # Eventos en progreso
    events_in_progress_result = await db.execute(
        select(sqlfunc.count(Event.id)).where(
            Event.company_id == company_id,
            Event.status == "started",
        )
    )
    events_in_progress = events_in_progress_result.scalar() or 0

    # ── Personal asignado este mes ───────────────────────────────────────────
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

    # Personal por rol
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

    # ── Horas y pagos del mes ────────────────────────────────────────────────
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

    # ── Próximos eventos ─────────────────────────────────────────────────────
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

    # ── Totales generales ────────────────────────────────────────────────────
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
