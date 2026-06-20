from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from collections import defaultdict

from app.core.database import get_db
from app.core.auth import require_role
from app.models import (
    Event, EventAssignment, Shift, User, JobRole,
    Payment, PaymentEvent, PaymentItem, PayrollSettlement, PayrollSettlementItem,
)

router = APIRouter(prefix="/payments", tags=["payments"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


class PayRequest(BaseModel):
    event_ids: list[int]


# ─── Listar eventos liquidados (disponibles para pago) ───
@router.get("/settled-events")
async def get_settled_events(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Listar eventos en estado 'settled' (liquidados) que aún no han sido pagados."""
    company_id = current_user["company_id"]
    result = await db.execute(
        select(Event).where(
            Event.company_id == company_id,
            Event.status == "settled",
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


# ─── Detalle de evento para modal informativo ───
@router.get("/events/{event_id}/detail")
async def get_event_payment_detail(event_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Detalle del evento con roles y empleados para el modal informativo."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

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

    roles_map: dict[str, dict] = {}
    for shift, assignment, user, role in rows:
        if role.name not in roles_map:
            roles_map[role.name] = {"role_name": role.name, "base_rate": float(role.hourly_rate), "employees": []}
        roles_map[role.name]["employees"].append({
            "user_id": user.id,
            "user_name": user.name,
            "hours_worked": float(shift.hours_worked) if shift.hours_worked else 0,
            "hourly_rate": float(shift.hourly_rate_snapshot),
            "total_pay": float(shift.total_pay) if shift.total_pay else 0,
        })

    return {
        "id": event.id,
        "event_code": event.event_code,
        "name": event.name,
        "event_date": event.event_date.isoformat(),
        "start_time": str(event.start_time),
        "address": event.address,
        "city": event.city,
        "roles": list(roles_map.values()),
    }


# ─── Procesar pago ───
@router.post("/pay", status_code=status.HTTP_201_CREATED)
async def pay_events(
    body: PayRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """
    Pagar eventos seleccionados. Crea registros de pago por empleado
    (sumatoria de todos los eventos pagados para cada empleado).
    Cambia estado de eventos a 'paid'.
    """
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    if not body.event_ids:
        raise HTTPException(status_code=400, detail="Selecciona al menos un evento")

    # 1. Validar eventos
    events_to_pay = []
    for eid in body.event_ids:
        event = await db.get(Event, eid)
        if not event or event.company_id != company_id:
            raise HTTPException(status_code=404, detail=f"Evento {eid} no encontrado")
        if event.status != "settled":
            raise HTTPException(status_code=400, detail=f"Evento '{event.name}' no está en estado liquidado")
        events_to_pay.append(event)

    # 2. Obtener todos los turnos completados de estos eventos
    employee_totals: dict[int, dict] = defaultdict(lambda: {"hours": Decimal("0"), "amount": Decimal("0"), "events": 0})

    for event in events_to_pay:
        shifts_result = await db.execute(
            select(Shift, EventAssignment)
            .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
            .where(
                EventAssignment.event_id == event.id,
                Shift.clock_out.isnot(None),
                Shift.hours_worked.isnot(None),
            )
        )
        event_employees = set()
        for shift, assignment in shifts_result.all():
            uid = assignment.user_id
            employee_totals[uid]["hours"] += shift.hours_worked or Decimal("0")
            employee_totals[uid]["amount"] += shift.total_pay or Decimal("0")
            event_employees.add(uid)

        # Contar eventos por empleado
        for uid in event_employees:
            employee_totals[uid]["events"] += 1

    if not employee_totals:
        raise HTTPException(status_code=400, detail="No hay turnos completados en los eventos seleccionados")

    # 3. Crear registro de pago
    total_amount = sum(v["amount"] for v in employee_totals.values())
    payment = Payment(
        company_id=company_id,
        created_by=user_id,
        status="pagado",
        total_amount=total_amount,
        events_count=len(events_to_pay),
        employees_count=len(employee_totals),
    )
    db.add(payment)
    await db.flush()

    # 4. Crear registros de eventos pagados
    for event in events_to_pay:
        pe = PaymentEvent(payment_id=payment.id, event_id=event.id)
        db.add(pe)

    # 5. Crear registros por empleado
    for uid, totals in employee_totals.items():
        item = PaymentItem(
            payment_id=payment.id,
            user_id=uid,
            total_hours=totals["hours"],
            total_amount=totals["amount"],
            events_count=totals["events"],
        )
        db.add(item)

    # 6. Cambiar estado de eventos a 'paid'
    for event in events_to_pay:
        event.status = "paid"

    await db.flush()

    # 7. Preparar respuesta con detalle por empleado
    items_detail = []
    for uid, totals in employee_totals.items():
        user = await db.get(User, uid)
        items_detail.append({
            "user_id": uid,
            "user_name": user.name if user else "—",
            "total_hours": float(totals["hours"]),
            "total_amount": float(totals["amount"]),
            "events_count": totals["events"],
        })

    items_detail.sort(key=lambda x: x["user_name"])

    return {
        "payment_id": payment.id,
        "events_paid": len(events_to_pay),
        "employees_paid": len(employee_totals),
        "total_amount": float(total_amount),
        "items": items_detail,
    }


# ─── Historial de pagos ───
@router.get("/history")
async def list_payments(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Listar historial de pagos realizados."""
    company_id = current_user["company_id"]
    result = await db.execute(
        select(Payment)
        .where(Payment.company_id == company_id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    output = []
    for p in payments:
        creator = await db.get(User, p.created_by)
        # Obtener eventos asociados
        events_result = await db.execute(
            select(Event.name, Event.event_date)
            .join(PaymentEvent, PaymentEvent.event_id == Event.id)
            .where(PaymentEvent.payment_id == p.id)
            .order_by(Event.event_date)
        )
        event_names = [f"{name} ({edate.isoformat()})" for name, edate in events_result.all()]

        output.append({
            "id": p.id,
            "status": p.status,
            "total_amount": float(p.total_amount),
            "events_count": p.events_count,
            "employees_count": p.employees_count,
            "created_at": p.created_at.isoformat(),
            "creator_name": creator.name if creator else None,
            "event_names": event_names,
        })
    return output


# ─── Detalle de un pago (para modal del historial) ───
@router.get("/history/{payment_id}")
async def get_payment_detail(payment_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Detalle de un pago: empleados pagados con sus montos."""
    company_id = current_user["company_id"]
    payment = await db.get(Payment, payment_id)
    if not payment or payment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    items_result = await db.execute(
        select(PaymentItem, User)
        .join(User, PaymentItem.user_id == User.id)
        .where(PaymentItem.payment_id == payment_id)
        .order_by(User.name)
    )

    items = []
    for item, user in items_result.all():
        items.append({
            "user_id": user.id,
            "user_name": user.name,
            "total_hours": float(item.total_hours),
            "total_amount": float(item.total_amount),
            "events_count": item.events_count,
        })

    # Eventos pagados
    events_result = await db.execute(
        select(Event)
        .join(PaymentEvent, PaymentEvent.event_id == Event.id)
        .where(PaymentEvent.payment_id == payment_id)
        .order_by(Event.event_date)
    )
    events = [
        {"id": e.id, "name": e.name, "event_date": e.event_date.isoformat(), "city": e.city}
        for e in events_result.scalars().all()
    ]

    return {
        "payment_id": payment.id,
        "total_amount": float(payment.total_amount),
        "events_count": payment.events_count,
        "employees_count": payment.employees_count,
        "created_at": payment.created_at.isoformat(),
        "items": items,
        "events": events,
    }
