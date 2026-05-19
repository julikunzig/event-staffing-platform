"""
Lógica de cambio automático de estado del evento según cupos y aprobaciones.

Estados posibles del evento:
- published: publicado, aceptando solicitudes
- filled_pending: todos los cupos cubiertos (pending+approved) pero hay pendientes sin aprobar
- filled: todos los cupos cubiertos y TODOS aprobados
- published: vuelve a este si se libera un cupo
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import Event, EventJobRole, EventAssignment


async def check_and_update_event_status(event_id: int, db: AsyncSession) -> None:
    event = await db.get(Event, event_id)
    if not event or event.status not in ("published", "filled_pending", "filled"):
        return
    roles_result = await db.execute(
        select(EventJobRole).where(EventJobRole.event_id == event_id)
    )
    roles = roles_result.scalars().all()
    if not roles:
        return

    total_required = sum(r.slots_required for r in roles)
    if total_required == 0:
        return

    # Contar aprobados y pendientes por rol
    all_slots_covered = True   # todos los roles tienen suficientes (approved + pending)
    all_slots_approved = True  # todos los roles tienen suficientes solo con approved

    for role in roles:
        approved_result = await db.execute(
            select(func.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == role.job_role_id,
                EventAssignment.status == "approved",
            )
        )
        approved = approved_result.scalar() or 0

        pending_result = await db.execute(
            select(func.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == role.job_role_id,
                EventAssignment.status.in_(["pending", "invited"]),
            )
        )
        pending = pending_result.scalar() or 0

        total_for_role = approved + pending

        # Sincronizar slots_filled con aprobados reales
        role.slots_filled = approved

        if total_for_role < role.slots_required:
            all_slots_covered = False
        if approved < role.slots_required:
            all_slots_approved = False

    # Determinar nuevo estado
    if all_slots_approved:
        event.status = "filled"
    elif all_slots_covered:
        event.status = "filled_pending"
    else:
        event.status = "published"
