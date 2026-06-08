from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from datetime import date, timedelta
from collections import defaultdict

from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import (
    Shift, EventAssignment, Event, WeeklyHoursConfig, User,
    PayrollSettlement, PayrollSettlementItem,
)

router = APIRouter(prefix="/payroll", tags=["payroll"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


# ── Schemas ───────────────────────────────────────────────────────────────

class SettlementItemOut(BaseModel):
    id: int
    user_id: int
    user_name: str | None = None
    shift_id: int
    week_start: date
    week_end: date
    hours_worked: Decimal
    hourly_rate: Decimal
    regular_hours: Decimal
    overtime_hours: Decimal
    regular_pay: Decimal
    overtime_pay: Decimal
    total_pay: Decimal

    model_config = {"from_attributes": True}


class SettlementOut(BaseModel):
    id: int
    company_id: int
    created_by: int
    creator_name: str | None = None
    status: str
    period_start: date
    period_end: date
    total_amount: Decimal
    created_at: str
    updated_at: str
    item_count: int = 0
    employee_count: int = 0

    model_config = {"from_attributes": True}


class SettlementDetailOut(BaseModel):
    id: int
    company_id: int
    created_by: int
    creator_name: str | None = None
    status: str
    period_start: date
    period_end: date
    total_amount: Decimal
    created_at: str
    updated_at: str
    employees: list[dict] = []

    model_config = {"from_attributes": True}


class SettleResponse(BaseModel):
    settlement_id: int
    status: str
    total_amount: Decimal
    period_start: date
    period_end: date
    employees_count: int
    shifts_count: int


# ── Helpers ───────────────────────────────────────────────────────────────

DAY_MAP = {
    "monday": 0, "tuesday": 1, "wednesday": 2,
    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6,
}


def get_week_boundaries(event_date: date, week_start_day: str) -> tuple[date, date]:
    """Calculate the week start and end dates for a given event_date based on config."""
    start_offset = DAY_MAP.get(week_start_day, 0)
    event_weekday = event_date.weekday()
    days_since_start = (event_weekday - start_offset) % 7
    week_start = event_date - timedelta(days=days_since_start)
    week_end = week_start + timedelta(days=6)
    return week_start, week_end


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/settle", response_model=SettleResponse, status_code=status.HTTP_201_CREATED)
async def run_settlement(
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """
    Run payroll settlement for all unsettled/re-settlable shifts.
    
    Logic:
    1. Find all shifts with clock_out that are either unsettled or belong to a "liquidado" settlement
    2. Delete old "liquidado" settlements for this company (they get recalculated)
    3. Group shifts by employee, then by week
    4. Calculate regular and overtime pay per employee-week
    5. Create new settlement with all items
    6. Update shift.settlement_id
    """
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    # 1. Get config
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    weekly_hours_limit = config.weekly_hours_limit if config else Decimal("40.00")
    overtime_multiplier = config.overtime_multiplier if config else Decimal("1.50")
    week_start_day = config.week_start_day if config else "monday"

    # 2. Find all settlable shifts:
    #    - Have clock_out (finished)
    #    - Either settlement_id IS NULL OR settlement status is "liquidado"
    settlable_shifts_query = (
        select(Shift)
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .join(Event, EventAssignment.event_id == Event.id)
        .outerjoin(PayrollSettlement, Shift.settlement_id == PayrollSettlement.id)
        .where(
            EventAssignment.company_id == company_id,
            Event.status == "finished",
            Shift.clock_out.isnot(None),
            Shift.hours_worked.isnot(None),
            # Either no settlement or settlement is "liquidado" (re-settlable)
            (
                (Shift.settlement_id.is_(None)) |
                (PayrollSettlement.status == "liquidado")
            ),
        )
    )
    result = await db.execute(settlable_shifts_query)
    shifts = result.scalars().all()

    if not shifts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay turnos pendientes de liquidar"
        )

    # 3. Delete old "liquidado" settlements for this company (will be recalculated)
    old_settlements_result = await db.execute(
        select(PayrollSettlement).where(
            PayrollSettlement.company_id == company_id,
            PayrollSettlement.status == "liquidado",
        )
    )
    old_settlements = old_settlements_result.scalars().all()
    for old_settlement in old_settlements:
        # Clear settlement_id from shifts that referenced this settlement
        await db.execute(
            Shift.__table__.update()
            .where(Shift.settlement_id == old_settlement.id)
            .values(settlement_id=None)
        )
        await db.delete(old_settlement)
    await db.flush()

    # 4. Get event dates for each shift (needed for week grouping)
    # Build a map: shift_id -> (user_id, event_date, hours_worked, hourly_rate)
    shift_data = []
    for shift in shifts:
        assignment = await db.get(EventAssignment, shift.assignment_id)
        event = await db.get(Event, assignment.event_id)
        shift_data.append({
            "shift": shift,
            "user_id": assignment.user_id,
            "event_date": event.event_date,
            "hours_worked": shift.hours_worked,
            "hourly_rate": shift.hourly_rate_snapshot,
        })

    # 5. Group by employee, then by week
    # Structure: { user_id: { (week_start, week_end): [shift_data_list] } }
    employee_weeks: dict[int, dict[tuple[date, date], list]] = defaultdict(lambda: defaultdict(list))

    for sd in shift_data:
        ws, we = get_week_boundaries(sd["event_date"], week_start_day)
        employee_weeks[sd["user_id"]][(ws, we)].append(sd)

    # 6. Calculate period start/end
    all_dates = [sd["event_date"] for sd in shift_data]
    period_start = min(all_dates)
    period_end = max(all_dates)

    # 7. Create settlement
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

    # 8. For each employee-week, calculate pay
    total_amount = Decimal("0")
    items_created = 0

    for emp_user_id, weeks in employee_weeks.items():
        for (ws, we), week_shifts in weeks.items():
            # Sum total hours for this employee in this week
            total_hours_week = sum(sd["hours_worked"] for sd in week_shifts)

            # For each shift in this week, calculate its contribution
            for sd in week_shifts:
                shift_hours = sd["hours_worked"]
                rate = sd["hourly_rate"]

                # Determine how many regular vs overtime hours this shift contributes
                # We process shifts proportionally based on their share of the weekly total
                if total_hours_week <= weekly_hours_limit:
                    # All hours are regular
                    regular_hours = shift_hours
                    overtime_hours = Decimal("0")
                else:
                    # Some hours are overtime
                    # Regular hours for this shift = shift_hours * (limit / total_week) proportionally
                    ratio = weekly_hours_limit / total_hours_week
                    regular_hours = (shift_hours * ratio).quantize(Decimal("0.01"))
                    overtime_hours = (shift_hours - regular_hours).quantize(Decimal("0.01"))

                regular_pay = (regular_hours * rate).quantize(Decimal("0.01"))
                overtime_pay = (overtime_hours * rate * overtime_multiplier).quantize(Decimal("0.01"))
                item_total = regular_pay + overtime_pay

                item = PayrollSettlementItem(
                    settlement_id=settlement.id,
                    user_id=emp_user_id,
                    shift_id=sd["shift"].id,
                    week_start=ws,
                    week_end=we,
                    hours_worked=shift_hours,
                    hourly_rate=rate,
                    regular_hours=regular_hours,
                    overtime_hours=overtime_hours,
                    regular_pay=regular_pay,
                    overtime_pay=overtime_pay,
                    total_pay=item_total,
                )
                db.add(item)
                total_amount += item_total
                items_created += 1

                # Update shift settlement_id
                sd["shift"].settlement_id = settlement.id

    settlement.total_amount = total_amount
    await db.flush()

    return SettleResponse(
        settlement_id=settlement.id,
        status=settlement.status,
        total_amount=total_amount,
        period_start=period_start,
        period_end=period_end,
        employees_count=len(employee_weeks),
        shifts_count=items_created,
    )


@router.get("/settlements", response_model=list[SettlementOut])
async def list_settlements(
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """List all settlements for the current company."""
    company_id = current_user["company_id"]

    result = await db.execute(
        select(PayrollSettlement)
        .where(PayrollSettlement.company_id == company_id)
        .order_by(PayrollSettlement.created_at.desc())
    )
    settlements = result.scalars().all()

    output = []
    for s in settlements:
        # Get creator name
        creator = await db.get(User, s.created_by)
        creator_name = creator.name if creator else None

        # Count items and unique employees
        items_result = await db.execute(
            select(
                func.count(PayrollSettlementItem.id),
                func.count(func.distinct(PayrollSettlementItem.user_id)),
            ).where(PayrollSettlementItem.settlement_id == s.id)
        )
        row = items_result.one()
        item_count = row[0]
        employee_count = row[1]

        output.append(SettlementOut(
            id=s.id,
            company_id=s.company_id,
            created_by=s.created_by,
            creator_name=creator_name,
            status=s.status,
            period_start=s.period_start,
            period_end=s.period_end,
            total_amount=s.total_amount,
            created_at=s.created_at.isoformat(),
            updated_at=s.updated_at.isoformat(),
            item_count=item_count,
            employee_count=employee_count,
        ))

    return output


@router.get("/settlements/{settlement_id}", response_model=SettlementDetailOut)
async def get_settlement_detail(
    settlement_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Get settlement detail with items grouped by employee."""
    company_id = current_user["company_id"]

    settlement = await db.get(PayrollSettlement, settlement_id)
    if not settlement or settlement.company_id != company_id:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")

    creator = await db.get(User, settlement.created_by)
    creator_name = creator.name if creator else None

    # Get all items
    items_result = await db.execute(
        select(PayrollSettlementItem)
        .where(PayrollSettlementItem.settlement_id == settlement_id)
        .order_by(PayrollSettlementItem.user_id, PayrollSettlementItem.week_start)
    )
    items = items_result.scalars().all()

    # Group by employee
    employees_map: dict[int, dict] = {}
    for item in items:
        if item.user_id not in employees_map:
            user = await db.get(User, item.user_id)
            employees_map[item.user_id] = {
                "user_id": item.user_id,
                "user_name": user.name if user else f"User #{item.user_id}",
                "total_hours": Decimal("0"),
                "total_regular_hours": Decimal("0"),
                "total_overtime_hours": Decimal("0"),
                "total_regular_pay": Decimal("0"),
                "total_overtime_pay": Decimal("0"),
                "total_pay": Decimal("0"),
                "items": [],
            }

        emp = employees_map[item.user_id]
        emp["total_hours"] += item.hours_worked
        emp["total_regular_hours"] += item.regular_hours
        emp["total_overtime_hours"] += item.overtime_hours
        emp["total_regular_pay"] += item.regular_pay
        emp["total_overtime_pay"] += item.overtime_pay
        emp["total_pay"] += item.total_pay
        emp["items"].append({
            "id": item.id,
            "shift_id": item.shift_id,
            "week_start": item.week_start.isoformat(),
            "week_end": item.week_end.isoformat(),
            "hours_worked": str(item.hours_worked),
            "hourly_rate": str(item.hourly_rate),
            "regular_hours": str(item.regular_hours),
            "overtime_hours": str(item.overtime_hours),
            "regular_pay": str(item.regular_pay),
            "overtime_pay": str(item.overtime_pay),
            "total_pay": str(item.total_pay),
        })

    # Convert decimals to strings for JSON
    employees_list = []
    for emp in employees_map.values():
        employees_list.append({
            "user_id": emp["user_id"],
            "user_name": emp["user_name"],
            "total_hours": str(emp["total_hours"]),
            "total_regular_hours": str(emp["total_regular_hours"]),
            "total_overtime_hours": str(emp["total_overtime_hours"]),
            "total_regular_pay": str(emp["total_regular_pay"]),
            "total_overtime_pay": str(emp["total_overtime_pay"]),
            "total_pay": str(emp["total_pay"]),
            "items": emp["items"],
        })

    return SettlementDetailOut(
        id=settlement.id,
        company_id=settlement.company_id,
        created_by=settlement.created_by,
        creator_name=creator_name,
        status=settlement.status,
        period_start=settlement.period_start,
        period_end=settlement.period_end,
        total_amount=settlement.total_amount,
        created_at=settlement.created_at.isoformat(),
        updated_at=settlement.updated_at.isoformat(),
        employees=employees_list,
    )


@router.patch("/settlements/{settlement_id}/process", response_model=SettlementOut)
async def process_settlement(
    settlement_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Change settlement status from 'liquidado' to 'procesando_pago'."""
    company_id = current_user["company_id"]

    settlement = await db.get(PayrollSettlement, settlement_id)
    if not settlement or settlement.company_id != company_id:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")

    if settlement.status != "liquidado":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden procesar liquidaciones en estado 'liquidado'"
        )

    settlement.status = "procesando_pago"
    await db.flush()

    creator = await db.get(User, settlement.created_by)
    creator_name = creator.name if creator else None

    items_result = await db.execute(
        select(
            func.count(PayrollSettlementItem.id),
            func.count(func.distinct(PayrollSettlementItem.user_id)),
        ).where(PayrollSettlementItem.settlement_id == settlement.id)
    )
    row = items_result.one()

    return SettlementOut(
        id=settlement.id,
        company_id=settlement.company_id,
        created_by=settlement.created_by,
        creator_name=creator_name,
        status=settlement.status,
        period_start=settlement.period_start,
        period_end=settlement.period_end,
        total_amount=settlement.total_amount,
        created_at=settlement.created_at.isoformat(),
        updated_at=settlement.updated_at.isoformat(),
        item_count=row[0],
        employee_count=row[1],
    )
