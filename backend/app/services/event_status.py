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
    if not event or event.status not in ("created", "published", "filled_pending", "filled"):
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

    # Agrupar por job_role_id para contar correctamente
    # (un rol puede tener múltiples shifts/event_job_roles)
    from collections import defaultdict
    role_groups: dict[int, list] = defaultdict(list)
    for role in roles:
        role_groups[role.job_role_id].append(role)

    all_slots_covered = True
    all_slots_approved = True

    for job_role_id, role_list in role_groups.items():
        total_required_for_role = sum(r.slots_required for r in role_list)

        # Count ALL approved assignments for this job_role_id in this event
        approved_result = await db.execute(
            select(func.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == job_role_id,
                EventAssignment.status == "approved",
            )
        )
        approved = approved_result.scalar() or 0

        # Count ALL pending/invited assignments for this job_role_id in this event
        pending_result = await db.execute(
            select(func.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == job_role_id,
                EventAssignment.status.in_(["pending", "invited"]),
            )
        )
        pending = pending_result.scalar() or 0

        total_for_role = approved + pending

        # Sync slots_filled across the role's shifts
        # Distribute approved among the shifts (cap each at its slots_required)
        remaining_approved = approved
        for role in role_list:
            fill = min(remaining_approved, role.slots_required)
            role.slots_filled = fill
            remaining_approved -= fill

        if total_for_role < total_required_for_role:
            all_slots_covered = False
        if approved < total_required_for_role:
            all_slots_approved = False

    # Determinar nuevo estado
    if all_slots_approved:
        event.status = "filled"
    elif all_slots_covered:
        event.status = "filled_pending"
    else:
        event.status = "published"

    await db.flush()
