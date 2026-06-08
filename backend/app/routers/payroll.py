from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from datetime import date, timedelta
from collections import defaultdict

from app.core.database import get_db
from app.core.auth import require_role
from app.models import (
    Shift, EventAssignment, Event, WeeklyHoursConfig, User, JobRole,
    PayrollSettlement, PayrollSettlementItem, EventJobRole,
)

router = APIRouter(prefix="/payroll", tags=["payroll"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]

DAY_MAP = {
    "monday": 0, "tuesday": 1, "wednesday": 2,
    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6,
}


def get_week_boundaries(event_date: date, week_start_day: str) -> tuple[date, date]:
    start_offset = DAY_MAP.get(week_start_day, 0)
    event_weekday = event_date.weekday()
    days_since_start = (event_weekday - start_offset) % 7
    week_start = event_date - timedelta(days=days_since_start)
    week_end = week_start + timedelta(days=6)
    return week_start, week_end


class SettleRequest(BaseModel):
    event_ids: list[int]


class SettleResponse(BaseModel):
    settlement_id: int
    events_settled: int
    total_regular: float
    total_overtime: float
    total_general: float
    by_role: list[dict]


@router.get("/finished-events")
async def get_finished_events(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """List finished events that can be settled (not yet settled)."""
    company_id = current_user["company_id"]
    result = await db.execute(
        select(Event).where(
            Event.company_id == company_id,
            Event.status == "finished",
        ).order_by(Event.event_date.desc())
    )
    events = result.scalars().all()
    return [
        {
            "id": e.id,
            "event_code": e.event_code,
            "name": e.name,
            "event_date": e.event_date.isoformat(),
            "start_time": str(e.start_time),
            "address": e.address,
            "city": e.city,
            "status": e.status,
        }
        for e in events
    ]


@router.get("/events/{event_id}/detail")
async def get_event_payroll_detail(event_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Get event detail with roles and employees for informational modal."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Get shifts with employee and role info
    shifts_result = await db.execute(
        select(Shift, EventAssignment, User, JobRole)
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .join(User, EventAssignment.user_id == User.id)
        .join(JobRole, EventAssignment.job_role_id == JobRole.id)
        .where(
            EventAssignment.event_id == event_id,
            Shift.clock_out.isnot(None),
        )
        .order_by(JobRole.name, User.name)
    )
    rows = shifts_result.all()

    # Group by role
    roles_map: dict[str, dict] = {}
    for shift, assignment, user, role in rows:
        if role.name not in roles_map:
            roles_map[role.name] = {"role_name": role.name, "base_rate": float(role.hourly_rate), "employees": []}
        roles_map[role.name]["employees"].append({
            "user_id": user.id,
            "user_name": user.name,
            "hours_worked": float(shift.hours_worked) if shift.hours_worked else 0,
            "hourly_rate": float(shift.hourly_rate_snapshot),
        })

    return {
        "id": event.id,
        "event_code": event.event_code,
        "name": event.name,
        "event_date": event.event_date.isoformat(),
        "start_time": str(event.start_time),
        "address": event.address,
        "city": event.city,
        "dress_code": event.dress_code,
        "roles": list(roles_map.values()),
    }


@router.post("/settle", response_model=SettleResponse, status_code=status.HTTP_201_CREATED)
async def settle_events(
    body: SettleRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """
    Settle selected events. Calculates weekly overtime considering already-settled events.
    Changes event status to 'settled'. Cannot be undone.
    """
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    if not body.event_ids:
        raise HTTPException(status_code=400, detail="Selecciona al menos un evento")

    # 1. Get config
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    weekly_hours_limit = float(config.weekly_hours_limit) if config else 40.0
    overtime_multiplier = float(config.overtime_multiplier) if config else 1.5
    week_start_day = config.week_start_day if config else "monday"

    # 2. Validate events belong to company and are finished
    events_to_settle = []
    for eid in body.event_ids:
        event = await db.get(Event, eid)
        if not event or event.company_id != company_id:
            raise HTTPException(status_code=404, detail=f"Evento {eid} no encontrado")
        if event.status != "finished":
            raise HTTPException(status_code=400, detail=f"Evento '{event.name}' no está en estado finalizado")
        events_to_settle.append(event)

    # 3. Get all shifts from these events
    shifts_data = []
    for event in events_to_settle:
        shifts_result = await db.execute(
            select(Shift, EventAssignment, JobRole)
            .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
            .join(JobRole, EventAssignment.job_role_id == JobRole.id)
            .where(
                EventAssignment.event_id == event.id,
                Shift.clock_out.isnot(None),
                Shift.hours_worked.isnot(None),
            )
        )
        for shift, assignment, role in shifts_result.all():
            shifts_data.append({
                "shift": shift,
                "user_id": assignment.user_id,
                "event_id": event.id,
                "event_date": event.event_date,
                "hours_worked": float(shift.hours_worked),
                "hourly_rate": float(shift.hourly_rate_snapshot),
                "role_name": role.name,
            })

    if not shifts_data:
        raise HTTPException(status_code=400, detail="No hay turnos completados en los eventos seleccionados")

    # 4. Get already-settled shifts in the same weeks (for overtime calculation)
    # Find all weeks involved
    weeks_involved = set()
    for sd in shifts_data:
        ws, we = get_week_boundaries(sd["event_date"], week_start_day)
        weeks_involved.add((ws, we))

    # Get settled shifts from other events in same weeks
    settled_hours_by_user_week: dict[tuple[int, date, date], float] = defaultdict(float)
    for ws, we in weeks_involved:
        settled_result = await db.execute(
            select(Shift, EventAssignment, Event)
            .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
            .join(Event, EventAssignment.event_id == Event.id)
            .where(
                EventAssignment.company_id == company_id,
                Event.status == "settled",
                Event.event_date >= ws,
                Event.event_date <= we,
                Shift.clock_out.isnot(None),
                Shift.hours_worked.isnot(None),
            )
        )
        for shift, assignment, ev in settled_result.all():
            key = (assignment.user_id, ws, we)
            settled_hours_by_user_week[key] += float(shift.hours_worked)

    # 5. Group new shifts by user and week
    user_week_shifts: dict[tuple[int, date, date], list] = defaultdict(list)
    for sd in shifts_data:
        ws, we = get_week_boundaries(sd["event_date"], week_start_day)
        user_week_shifts[(sd["user_id"], ws, we)].append(sd)

    # 6. Calculate pay with overtime
    all_dates = [sd["event_date"] for sd in shifts_data]
    period_start = min(all_dates)
    period_end = max(all_dates)

    settlement = PayrollSettlement(
        company_id=company_id,
        created_by=user_id,
        status="liquidado",
        period_start=period_start,
        period_end=period_end,
        total_amount=Decimal("0"),
    )
    db.add(settlement)
    await db.flush()

    total_regular = 0.0
    total_overtime = 0.0
    role_totals: dict[str, dict] = defaultdict(lambda: {"regular": 0.0, "overtime": 0.0, "total": 0.0})

    for (uid, ws, we), week_shifts in user_week_shifts.items():
        # Hours already settled this week from other events
        already_settled = settled_hours_by_user_week.get((uid, ws, we), 0.0)
        # New hours this week from events being settled now
        # Process shift by shift, tracking cumulative hours
        cumulative_hours = already_settled

        for sd in week_shifts:
            shift_hours = sd["hours_worked"]
            rate = sd["hourly_rate"]
            role_name = sd["role_name"]

            # Determine regular vs overtime for this shift
            hours_before = cumulative_hours
            hours_after = cumulative_hours + shift_hours

            if hours_before >= weekly_hours_limit:
                # All overtime
                regular_hours = 0.0
                overtime_hours = shift_hours
            elif hours_after <= weekly_hours_limit:
                # All regular
                regular_hours = shift_hours
                overtime_hours = 0.0
            else:
                # Split
                regular_hours = weekly_hours_limit - hours_before
                overtime_hours = shift_hours - regular_hours

            regular_pay = round(regular_hours * rate, 2)
            overtime_pay = round(overtime_hours * rate * overtime_multiplier, 2)
            item_total = regular_pay + overtime_pay

            item = PayrollSettlementItem(
                settlement_id=settlement.id,
                user_id=uid,
                shift_id=sd["shift"].id,
                week_start=ws,
                week_end=we,
                hours_worked=Decimal(str(shift_hours)),
                hourly_rate=Decimal(str(rate)),
                regular_hours=Decimal(str(round(regular_hours, 2))),
                overtime_hours=Decimal(str(round(overtime_hours, 2))),
                regular_pay=Decimal(str(regular_pay)),
                overtime_pay=Decimal(str(overtime_pay)),
                total_pay=Decimal(str(item_total)),
            )
            db.add(item)

            total_regular += regular_pay
            total_overtime += overtime_pay
            role_totals[role_name]["regular"] += regular_pay
            role_totals[role_name]["overtime"] += overtime_pay
            role_totals[role_name]["total"] += item_total

            cumulative_hours = hours_after
            sd["shift"].settlement_id = settlement.id

    settlement.total_amount = Decimal(str(round(total_regular + total_overtime, 2)))

    # 7. Change event status to 'settled'
    for event in events_to_settle:
        event.status = "settled"

    await db.flush()

    return SettleResponse(
        settlement_id=settlement.id,
        events_settled=len(events_to_settle),
        total_regular=round(total_regular, 2),
        total_overtime=round(total_overtime, 2),
        total_general=round(total_regular + total_overtime, 2),
        by_role=[
            {"role": k, "regular": round(v["regular"], 2), "overtime": round(v["overtime"], 2), "total": round(v["total"], 2)}
            for k, v in sorted(role_totals.items())
        ],
    )


@router.get("/settlements")
async def list_settlements(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """List past settlements."""
    company_id = current_user["company_id"]
    result = await db.execute(
        select(PayrollSettlement)
        .where(PayrollSettlement.company_id == company_id)
        .order_by(PayrollSettlement.created_at.desc())
    )
    settlements = result.scalars().all()
    output = []
    for s in settlements:
        creator = await db.get(User, s.created_by)
        items_result = await db.execute(
            select(func.count(PayrollSettlementItem.id), func.count(func.distinct(PayrollSettlementItem.user_id)))
            .where(PayrollSettlementItem.settlement_id == s.id)
        )
        row = items_result.one()
        output.append({
            "id": s.id, "status": s.status,
            "period_start": s.period_start.isoformat(), "period_end": s.period_end.isoformat(),
            "total_amount": float(s.total_amount),
            "created_at": s.created_at.isoformat(),
            "creator_name": creator.name if creator else None,
            "shifts_count": row[0], "employees_count": row[1],
        })
    return output
