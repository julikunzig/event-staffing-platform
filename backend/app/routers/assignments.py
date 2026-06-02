from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Annotated
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import EventAssignment, Event, EventJobRole, EmployeeJobRole, JobRole, User

router = APIRouter(prefix="/assignments", tags=["assignments"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class ApplyRequest(BaseModel):
    job_role_id: int


class DirectAssignRequest(BaseModel):
    user_id: int
    job_role_id: int
    event_job_role_id: int | None = None  # optional: specific shift/time slot


class AssignmentOut(BaseModel):
    id: int
    event_id: int
    user_id: int
    company_id: int
    job_role_id: int
    status: str
    assigned_by: int | None

    model_config = {"from_attributes": True}


async def _get_event_for_company(event_id: int, company_id: int, db: AsyncSession) -> Event:
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return event


async def _check_slots(event_id: int, job_role_id: int, db: AsyncSession) -> EventJobRole:
    """
    Verifica si hay cupos disponibles para un rol en un evento.
    Cuenta pending + invited + approved juntos contra la SUMA de slots_required
    de todos los event_job_roles con ese job_role_id (puede haber múltiples filas).
    """
    from sqlalchemy import func as sqlfunc
    result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == job_role_id,
        )
    )
    ejr = result.scalars().first()
    if not ejr:
        raise HTTPException(status_code=400, detail="El evento no requiere ese rol")

    # Sum total slots for this role (may have multiple rows with different start_times)
    total_slots_result = await db.execute(
        select(sqlfunc.sum(EventJobRole.slots_required)).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == job_role_id,
        )
    )
    total_slots = total_slots_result.scalar() or 0

    # Contar todas las asignaciones activas (pending + invited + approved)
    active_count_result = await db.execute(
        select(sqlfunc.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.job_role_id == job_role_id,
            EventAssignment.status.in_(["pending", "invited", "approved"]),
        )
    )
    active_count = active_count_result.scalar() or 0

    if active_count >= total_slots:
        raise HTTPException(
            status_code=409,
            detail=f"Cupos agotados para este rol ({active_count}/{total_slots} cupos ocupados)"
        )
    return ejr


@router.post("/events/{event_id}/apply", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def apply_to_event(
    event_id: int,
    body: ApplyRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timedelta
    from sqlalchemy import func as sqlfunc
    
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    event = await _get_event_for_company(event_id, company_id, db)
    if event.status != "published":
        raise HTTPException(status_code=400, detail="El evento no está publicado")

    # Verificar que el empleado tiene ese rol en la empresa
    ejr_check = await db.execute(
        select(EmployeeJobRole).where(
            EmployeeJobRole.user_id == user_id,
            EmployeeJobRole.company_id == company_id,
            EmployeeJobRole.job_role_id == body.job_role_id,
        )
    )
    if not ejr_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="No tienes asignado ese rol en esta empresa")

    # Verificar que no tiene ya una asignación en este evento
    existing = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == event_id,
            EventAssignment.user_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud para este evento")

    # Verificar horas mínimas entre eventos en el mismo día
    from app.models import WeeklyHoursConfig
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    horas_entre_eventos = config.horas_entre_eventos if config else 0

    if horas_entre_eventos > 0:
        # Buscar otros eventos del mismo día con asignaciones pendientes o aprobadas del usuario
        same_day_events = await db.execute(
            select(Event).where(
                Event.company_id == company_id,
                Event.event_date == event.event_date,
                Event.id != event_id,
            )
        )
        same_day_events_list = same_day_events.scalars().all()

        for other_event in same_day_events_list:
            # Verificar si el usuario tiene una asignación (pending, invited o approved) en ese evento
            other_assignment = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.event_id == other_event.id,
                    EventAssignment.user_id == user_id,
                    EventAssignment.status.in_(["pending", "invited", "approved"]),
                )
            )
            other_assign_obj = other_assignment.scalar_one_or_none()
            
            if other_assign_obj:
                # Calcular diferencia de tiempo entre eventos
                # start_time es de tipo Time, se convierte a datetime para comparar
                from datetime import datetime as dt_class
                event_start = dt_class.combine(event.event_date, event.start_time)
                other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                
                # Calcular diferencia en horas
                time_diff = abs((event_start - other_start).total_seconds() / 3600)
                
                if time_diff <= horas_entre_eventos:
                    raise HTTPException(
                        status_code=400,
                        detail=f"You cannot apply to this event. You have another event the same day with a difference of {time_diff:.1f} hours, but you need at least {horas_entre_eventos} hours difference. | No puedes aplicar a este evento. Tienes otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesitas al menos {horas_entre_eventos} horas de diferencia."
                    )

    # Verificar cupos: contar pending + invited + approved
    from sqlalchemy import func as sqlfunc
    ejr_result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == body.job_role_id,
        )
    )
    ejr = ejr_result.scalar_one_or_none()
    if not ejr:
        raise HTTPException(status_code=400, detail="El evento no requiere ese rol")

    active_count_result = await db.execute(
        select(sqlfunc.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.job_role_id == body.job_role_id,
            EventAssignment.status.in_(["pending", "invited", "approved"]),
        )
    )
    active_count = active_count_result.scalar() or 0

    if active_count >= ejr.slots_required:
        raise HTTPException(
            status_code=409,
            detail=f"Cupos agotados para este rol ({active_count}/{ejr.slots_required} cupos ocupados)"
        )

    # Verificar que el cupo no está reservado por una invitación a otro empleado
    # (cupos libres = slots_required - invited_count)
    invited_count_result = await db.execute(
        select(sqlfunc.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.job_role_id == body.job_role_id,
            EventAssignment.status == "invited",
        )
    )
    invited_count = invited_count_result.scalar() or 0
    approved_pending_count = active_count - invited_count  # pending + approved

    free_slots = ejr.slots_required - invited_count - approved_pending_count
    if free_slots <= 0:
        raise HTTPException(
            status_code=409,
            detail=f"No hay cupos libres para aplicar a este rol. Todos los cupos están reservados por invitaciones."
        )

    assignment = EventAssignment(
        event_id=event_id,
        user_id=user_id,
        company_id=company_id,
        job_role_id=body.job_role_id,
        status="pending",
    )
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    
    # Send notification email to admin
    from app.services.email_service import send_application_notification_email
    event_creator = await db.get(User, event.created_by)
    current_user_obj = await db.get(User, user_id)
    role = await db.get(JobRole, body.job_role_id)
    
    if event_creator and current_user_obj and role:
        await send_application_notification_email(
            admin_email=event_creator.email,
            employee_name=current_user_obj.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
        )
        # Push to admin
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(event.created_by, f"📋 Nueva aplicación: {event.name}", f"{current_user_obj.name} aplicó como {role.name}", "/events", db)
        except Exception: pass
    
    # Actualizar estado del evento
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(event_id, db)
    return assignment


@router.post("/events/{event_id}/assign", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def direct_assign(
    event_id: int,
    body: DirectAssignRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    
    company_id = current_user["company_id"]
    admin_id = int(current_user["sub"])

    event = await _get_event_for_company(event_id, company_id, db)
    if event.status not in ("published", "draft"):
        raise HTTPException(status_code=400, detail="No se puede asignar en este estado")

    existing = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == event_id,
            EventAssignment.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El empleado ya tiene una asignación en este evento")

    # Verificar horas mínimas entre eventos en el mismo día
    from app.models import WeeklyHoursConfig
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    horas_entre_eventos = config.horas_entre_eventos if config else 0

    if horas_entre_eventos > 0:
        # Buscar otros eventos del mismo día con asignaciones pendientes o aprobadas del usuario
        same_day_events = await db.execute(
            select(Event).where(
                Event.company_id == company_id,
                Event.event_date == event.event_date,
                Event.id != event_id,
            )
        )
        same_day_events_list = same_day_events.scalars().all()

        for other_event in same_day_events_list:
            # Verificar si el usuario tiene una asignación (pending, invited o approved) en ese evento
            other_assignment = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.event_id == other_event.id,
                    EventAssignment.user_id == body.user_id,
                    EventAssignment.status.in_(["pending", "invited", "approved"]),
                )
            )
            if other_assignment.scalar_one_or_none():
                # Calcular diferencia de tiempo entre eventos
                # start_time es de tipo Time, se convierte a datetime para comparar
                from datetime import datetime as dt_class
                event_start = dt_class.combine(event.event_date, event.start_time)
                other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                
                # Calcular diferencia en horas
                time_diff = abs((event_start - other_start).total_seconds() / 3600)
                
                if time_diff <= horas_entre_eventos:
                    raise HTTPException(
                        status_code=400,
                        detail=f"You cannot assign this employee. They have another event the same day with a difference of {time_diff:.1f} hours, but they need at least {horas_entre_eventos} hours difference. | No puedes asignar a este empleado. Tiene otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesita al menos {horas_entre_eventos} horas de diferencia."
                    )

    ejr = await _check_slots(event_id, body.job_role_id, db)

    assignment = EventAssignment(
        event_id=event_id,
        user_id=body.user_id,
        company_id=company_id,
        job_role_id=body.job_role_id,
        status="approved",
        assigned_by=admin_id,
    )
    db.add(assignment)
    ejr.slots_filled += 1
    await db.flush()
    await db.refresh(assignment)
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(event_id, db)
    return assignment


@router.post("/events/{event_id}/invite", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def invite_employee(
    event_id: int,
    body: DirectAssignRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timedelta
    from sqlalchemy import func as sqlfunc
    
    company_id = current_user["company_id"]
    admin_id = int(current_user["sub"])

    event = await _get_event_for_company(event_id, company_id, db)
    if event.status != "published":
        raise HTTPException(status_code=400, detail="El evento no está publicado")

    existing = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == event_id,
            EventAssignment.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El empleado ya tiene una asignación en este evento")

    # Verificar horas mínimas entre eventos en el mismo día
    from app.models import WeeklyHoursConfig
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    horas_entre_eventos = config.horas_entre_eventos if config else 0

    if horas_entre_eventos > 0:
        # Buscar otros eventos del mismo día con asignaciones aprobadas, invitadas, iniciadas o pendientes del usuario
        same_day_events = await db.execute(
            select(Event).where(
                Event.company_id == company_id,
                Event.event_date == event.event_date,
                Event.id != event_id,
            )
        )
        same_day_events_list = same_day_events.scalars().all()
        
        print(f"[INVITE_EMPLOYEE] horas_entre_eventos={horas_entre_eventos}, event_date={event.event_date}, same_day_events={len(same_day_events_list)}, user_id={body.user_id}")

        for other_event in same_day_events_list:
            # Verificar si el usuario tiene una asignación (pending, invited o approved) en ese evento
            other_assignment = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.event_id == other_event.id,
                    EventAssignment.user_id == body.user_id,
                    EventAssignment.status.in_(["pending", "invited", "approved"]),
                )
            )
            other_assign_obj = other_assignment.scalar_one_or_none()
            print(f"[INVITE_EMPLOYEE] other_event={other_event.id}, other_assign_obj={other_assign_obj}")
            
            if other_assign_obj:
                # Calcular diferencia de tiempo entre eventos
                # start_time es de tipo Time, se convierte a datetime para comparar
                from datetime import datetime as dt_class
                event_start = dt_class.combine(event.event_date, event.start_time)
                other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                
                # Calcular diferencia en horas
                time_diff = abs((event_start - other_start).total_seconds() / 3600)
                
                print(f"[INVITE_EMPLOYEE] time_diff={time_diff:.1f}, horas_entre_eventos={horas_entre_eventos}, comparison={time_diff} <= {horas_entre_eventos}")
                
                if time_diff <= horas_entre_eventos:
                    print(f"[INVITE_EMPLOYEE] RECHAZANDO - Diferencia insuficiente")
                    raise HTTPException(
                        status_code=400,
                        detail=f"You cannot invite this employee. They have another event the same day with a difference of {time_diff:.1f} hours, but they need at least {horas_entre_eventos} hours difference. | No puedes invitar a este empleado. Tiene otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesita al menos {horas_entre_eventos} horas de diferencia."
                    )

    await _check_slots(event_id, body.job_role_id, db)

    assignment = EventAssignment(
        event_id=event_id,
        user_id=body.user_id,
        company_id=company_id,
        job_role_id=body.job_role_id,
        status="invited",
        assigned_by=admin_id,
    )
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    
    # Send invitation email to employee
    from app.services.email_service import send_event_invitation_email
    employee = await db.get(User, body.user_id)
    role = await db.get(JobRole, body.job_role_id)
    
    if employee and role:
        # 1. Email al empleado
        await send_event_invitation_email(
            employee_emails=[employee.email],
            event_name=event.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            start_time=str(event.start_time),
            address=event.address,
            city=event.city or "",
            state=event.state or "",
            zip_code=event.zip_code or "",
            role_name=role.name,
            hourly_rate=str(role.hourly_rate),
            dress_code=event.dress_code,
        )
        # 2. WhatsApp al empleado con instrucciones para responder
        if employee.phone:
            try:
                from app.services.whatsapp_service import send_whatsapp
                wa_msg = (
                    f"📩 *¡Fuiste invitado a un evento!*\n\n"
                    f"📋 *{event.name}*\n"
                    f"📅 Fecha: {event.event_date.strftime('%Y-%m-%d')}\n"
                    f"🕐 Hora: {event.start_time}\n"
                    f"📍 {event.address}, {event.city or ''} {event.state or ''}\n"
                    f"👔 Dress code: {event.dress_code or 'No especificado'}\n"
                    f"💼 Rol: {role.name} — ${role.hourly_rate}/hora\n\n"
                    f"Responde con:\n"
                    f"*1 {assignment.id}* — ✅ Aceptar\n"
                    f"*2 {assignment.id}* — ❌ Rechazar"
                )
                send_whatsapp(employee.phone, wa_msg)
                print(f"[WhatsApp] Invitation sent to {employee.phone} for assignment {assignment.id}")
            except Exception as e:
                print(f"[WhatsApp] Error sending invitation to {employee.phone}: {e}")
        # 3. Push notification al empleado
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(
                body.user_id,
                f"📩 Invitación: {event.name}",
                f"Fuiste invitado como {role.name} el {event.event_date}",
                "/profile",
                db,
            )
        except Exception: pass

    return assignment


@router.patch("/{assignment_id}/approve", response_model=AssignmentOut)
async def approve_assignment(
    assignment_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    
    company_id = current_user["company_id"]
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    if assignment.status != "pending":
        raise HTTPException(status_code=400, detail="Solo se pueden aprobar asignaciones pendientes")

    # Verificar horas mínimas entre eventos en el mismo día
    event = await db.get(Event, assignment.event_id)
    if event:
        from app.models import WeeklyHoursConfig
        config_result = await db.execute(
            select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
        )
        config = config_result.scalar_one_or_none()
        horas_entre_eventos = config.horas_entre_eventos if config else 0

        if horas_entre_eventos > 0:
            # Buscar otros eventos del mismo día con asignaciones pendientes o aprobadas del usuario
            same_day_events = await db.execute(
                select(Event).where(
                    Event.company_id == company_id,
                    Event.event_date == event.event_date,
                    Event.id != assignment.event_id,
                )
            )
            same_day_events_list = same_day_events.scalars().all()

            for other_event in same_day_events_list:
                # Verificar si el usuario tiene una asignación (pending, invited o approved) en ese evento
                other_assignment = await db.execute(
                    select(EventAssignment).where(
                        EventAssignment.event_id == other_event.id,
                        EventAssignment.user_id == assignment.user_id,
                        EventAssignment.status.in_(["pending", "invited", "approved"]),
                    )
                )
                if other_assignment.scalar_one_or_none():
                    # Calcular diferencia de tiempo entre eventos
                    # start_time es de tipo Time, se convierte a datetime para comparar
                    from datetime import datetime as dt_class
                    event_start = dt_class.combine(event.event_date, event.start_time)
                    other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                    
                    # Calcular diferencia en horas
                    time_diff = abs((event_start - other_start).total_seconds() / 3600)
                    
                    if time_diff <= horas_entre_eventos:
                        raise HTTPException(
                            status_code=400,
                            detail=f"You cannot approve this assignment. The employee has another event the same day with a difference of {time_diff:.1f} hours, but they need at least {horas_entre_eventos} hours difference. | No puedes aprobar esta asignación. El empleado tiene otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesita al menos {horas_entre_eventos} horas de diferencia."
                        )

    # Al aprobar, verificar que hay cupo disponible excluyendo esta asignación
    # (ya está contada como pending en _check_slots, así que no necesitamos verificar de nuevo)
    ejr_result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == assignment.event_id,
            EventJobRole.job_role_id == assignment.job_role_id,
        )
    )
    ejr = ejr_result.scalar_one_or_none()
    if not ejr:
        raise HTTPException(status_code=400, detail="Rol no encontrado en el evento")

    assignment.status = "approved"
    ejr.slots_filled += 1
    await db.flush()
    
    # Send confirmation email to employee
    from app.services.email_service import send_application_approved_email
    employee = await db.get(User, assignment.user_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    if employee and role and event:
        await send_application_approved_email(
            employee_email=employee.email,
            event_name=event.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            start_time=str(event.start_time),
            address=event.address,
            city=event.city or "",
            state=event.state or "",
            zip_code=event.zip_code or "",
            role_name=role.name,
            hourly_rate=str(role.hourly_rate),
            dress_code=event.dress_code,
        )
        # Push to employee
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(assignment.user_id, f"✅ Aprobado: {event.name}", f"Tu aplicación como {role.name} fue aprobada", "/profile", db)
        except Exception: pass
    
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(assignment.event_id, db)
    return assignment


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_assignment(
    assignment_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")

    event_id = assignment.event_id
    # Si estaba aprobada, liberar el cupo
    if assignment.status == "approved":
        result = await db.execute(
            select(EventJobRole).where(
                EventJobRole.event_id == assignment.event_id,
                EventJobRole.job_role_id == assignment.job_role_id,
            )
        )
        ejr = result.scalar_one_or_none()
        if ejr and ejr.slots_filled > 0:
            ejr.slots_filled -= 1

    await db.delete(assignment)
    await db.flush()
    # Verificar si el evento debe volver a 'published'
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(event_id, db)


@router.get("/events/{event_id}", response_model=list[AssignmentOut])
async def list_event_assignments(
    event_id: int,
    current_user: Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))],
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    await _get_event_for_company(event_id, company_id, db)
    result = await db.execute(
        select(EventAssignment).where(EventAssignment.event_id == event_id)
    )
    return result.scalars().all()


class BulkInviteRequest(BaseModel):
    invitations: list[DirectAssignRequest]


@router.post("/events/{event_id}/bulk-invite", status_code=status.HTTP_201_CREATED)
async def bulk_invite(
    event_id: int,
    body: BulkInviteRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime as dt_class
    
    company_id = current_user["company_id"]
    admin_id = int(current_user["sub"])
    event = await _get_event_for_company(event_id, company_id, db)
    if event.status not in ("published", "created"):
        raise HTTPException(status_code=400, detail="El evento debe estar creado o publicado para invitar empleados")

    # Obtener configuración de horas_entre_eventos
    from app.models import WeeklyHoursConfig
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    horas_entre_eventos = config.horas_entre_eventos if config else 0

    created = []
    skipped = []
    email_tasks = []

    for inv in body.invitations:
        # Verificar si ya tiene asignación
        existing = await db.execute(
            select(EventAssignment).where(
                EventAssignment.event_id == event_id,
                EventAssignment.user_id == inv.user_id,
            )
        )
        if existing.scalar_one_or_none():
            skipped.append(inv.user_id)
            continue

        # Verificar horas mínimas entre eventos en el mismo día
        if horas_entre_eventos > 0:
            same_day_events = await db.execute(
                select(Event).where(
                    Event.company_id == company_id,
                    Event.event_date == event.event_date,
                    Event.id != event_id,
                )
            )
            same_day_events_list = same_day_events.scalars().all()

            for other_event in same_day_events_list:
                other_assignment = await db.execute(
                    select(EventAssignment).where(
                        EventAssignment.event_id == other_event.id,
                        EventAssignment.user_id == inv.user_id,
                        EventAssignment.status.in_(["pending", "invited", "approved"]),
                    )
                )
                if other_assignment.scalar_one_or_none():
                    event_start = dt_class.combine(event.event_date, event.start_time)
                    other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                    time_diff = abs((event_start - other_start).total_seconds() / 3600)
                    
                    if time_diff <= horas_entre_eventos:
                        raise HTTPException(
                            status_code=400,
                            detail=f"You cannot invite this employee. They have another event the same day with a difference of {time_diff:.1f} hours, but they need at least {horas_entre_eventos} hours difference. | No puedes invitar a este empleado. Tiene otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesita al menos {horas_entre_eventos} horas de diferencia."
                        )

        # Verificar cupos disponibles para este rol (pending + invited + approved)
        from sqlalchemy import func as sqlfunc
        active_count_result = await db.execute(
            select(sqlfunc.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == inv.job_role_id,
                EventAssignment.status.in_(["pending", "invited", "approved"]),
            )
        )
        active_count = active_count_result.scalar() or 0

        # Sum total slots_required for this job_role_id across all event_job_roles
        from sqlalchemy import func as sqlfunc2
        total_slots_result = await db.execute(
            select(sqlfunc.sum(EventJobRole.slots_required)).where(
                EventJobRole.event_id == event_id,
                EventJobRole.job_role_id == inv.job_role_id,
            )
        )
        total_slots = total_slots_result.scalar() or 0
        if total_slots == 0:
            skipped.append(inv.user_id)
            continue

        if active_count >= total_slots:
            raise HTTPException(
                status_code=409,
                detail=f"Cupos agotados para el rol solicitado ({active_count}/{total_slots}). No se pueden invitar más personas a ese rol."
            )

        assignment = EventAssignment(
            event_id=event_id, user_id=inv.user_id, company_id=company_id,
            job_role_id=inv.job_role_id, event_job_role_id=inv.event_job_role_id,
            status="invited", assigned_by=admin_id,
        )
        db.add(assignment)
        await db.flush()
        await db.refresh(assignment)
        created.append(inv.user_id)

        # Guardar datos del empleado/rol para notificaciones post-flush
        user_result = await db.get(User, inv.user_id)
        role_result = await db.get(JobRole, inv.job_role_id)
        if user_result and role_result:
            # Get specific event_job_role for time and rate
            specific_ejr = None
            if inv.event_job_role_id:
                specific_ejr = await db.get(EventJobRole, inv.event_job_role_id)
            if not specific_ejr:
                ejr_q = await db.execute(
                    select(EventJobRole).where(EventJobRole.event_id == event_id, EventJobRole.job_role_id == inv.job_role_id).limit(1)
                )
                specific_ejr = ejr_q.scalars().first()

            shift_time = str(specific_ejr.start_time)[:5] if specific_ejr and specific_ejr.start_time else str(event.start_time)
            effective_rate = str(specific_ejr.hourly_rate_override) if specific_ejr and specific_ejr.hourly_rate_override else str(role_result.hourly_rate)

            event_date_str = event.event_date.strftime("%B %d, %Y") if event.event_date else ""
            address_parts = [event.address, event.city, event.state, event.zip_code]
            address_str = ", ".join(p for p in address_parts if p)
            email_tasks.append({
                "email": user_result.email,
                "name": user_result.name,
                "phone": user_result.phone,
                "user_id": user_result.id,
                "event_name": event.name,
                "event_date": event_date_str,
                "event_date_raw": event.event_date.strftime("%Y-%m-%d"),
                "event_time": shift_time,
                "event_address": address_str,
                "event_address_raw": event.address,
                "event_city": event.city or "",
                "event_state": event.state or "",
                "event_dress_code": event.dress_code or "No especificado",
                "role_name": role_result.name,
                "hourly_rate": effective_rate,
                "assignment": assignment,
            })

    # Flush final para confirmar todo
    await db.flush()

    # Enviar notificaciones: email + WhatsApp + push por cada empleado invitado
    for task in email_tasks:
        assignment_obj = task["assignment"]

        # 1. Email
        try:
            from app.services.email_service import send_event_invitation_email
            await send_event_invitation_email(
                employee_emails=[task["email"]],
                event_name=task["event_name"],
                event_date=task["event_date_raw"],
                start_time=task["event_time"],
                address=task["event_address_raw"],
                city=task["event_city"],
                state=task["event_state"],
                zip_code="",
                role_name=task["role_name"],
                hourly_rate=task["hourly_rate"],
                dress_code=task["event_dress_code"],
            )
        except Exception as e:
            print(f"[NOTIF] Error enviando email a {task['email']}: {e}")

        # 2. WhatsApp al empleado
        print(f"[WhatsApp] phone={task.get('phone')}, assignment_id={assignment_obj.id}")
        if task.get("phone"):
            try:
                from app.services.whatsapp_service import send_whatsapp
                wa_msg = (
                    f"📩 *¡Fuiste invitado a un evento!*\n\n"
                    f"📋 *{task['event_name']}*\n"
                    f"📅 Fecha: {task['event_date_raw']}\n"
                    f"🕐 Hora: {task['event_time']}\n"
                    f"📍 {task['event_address']}\n"
                    f"👔 Dress code: {task['event_dress_code']}\n"
                    f"💼 Rol: {task['role_name']} — ${task['hourly_rate']}/hora\n\n"
                    f"Responde con:\n"
                    f"*1 {assignment_obj.id}* — ✅ Aceptar\n"
                    f"*2 {assignment_obj.id}* — ❌ Rechazar"
                )
                send_whatsapp(task["phone"], wa_msg)
                print(f"[WhatsApp] Invitation sent to {task['phone']} for assignment {assignment_obj.id}")
            except Exception as e:
                print(f"[WhatsApp] Error sending to {task['phone']}: {e}")

        # 3. Push notification al empleado
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(
                task["user_id"],
                f"📩 Invitación: {task['event_name']}",
                f"Fuiste invitado como {task['role_name']}",
                "/profile",
                db,
            )
        except Exception as e:
            print(f"[Push] Error sending to user {task['user_id']}: {e}")

    return {"invited": created, "skipped": skipped, "count": len(created)}


@router.patch("/{assignment_id}/accept", response_model=AssignmentOut)
async def accept_invitation(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime as dt_class
    
    user_id = int(current_user["sub"])
    company_id = current_user.get("company_id")
    
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    if assignment.status != "invited":
        raise HTTPException(status_code=400, detail="Solo puedes aceptar invitaciones pendientes")

    # Verificar horas mínimas entre eventos en el mismo día
    event = await db.get(Event, assignment.event_id)
    if event and company_id:
        from app.models import WeeklyHoursConfig
        config_result = await db.execute(
            select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
        )
        config = config_result.scalar_one_or_none()
        horas_entre_eventos = config.horas_entre_eventos if config else 0

        if horas_entre_eventos > 0:
            # Buscar otros eventos del mismo día con asignaciones pendientes o aprobadas del usuario
            same_day_events = await db.execute(
                select(Event).where(
                    Event.company_id == company_id,
                    Event.event_date == event.event_date,
                    Event.id != assignment.event_id,
                )
            )
            same_day_events_list = same_day_events.scalars().all()

            for other_event in same_day_events_list:
                # Verificar si el usuario tiene una asignación (pending, invited o approved) en ese evento
                other_assignment = await db.execute(
                    select(EventAssignment).where(
                        EventAssignment.event_id == other_event.id,
                        EventAssignment.user_id == user_id,
                        EventAssignment.status.in_(["pending", "invited", "approved"]),
                    )
                )
                if other_assignment.scalar_one_or_none():
                    # Calcular diferencia de tiempo entre eventos
                    event_start = dt_class.combine(event.event_date, event.start_time)
                    other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                    
                    # Calcular diferencia en horas (valor absoluto para ambas direcciones)
                    time_diff = abs((event_start - other_start).total_seconds() / 3600)
                    
                    if time_diff <= horas_entre_eventos:
                        raise HTTPException(
                            status_code=400,
                            detail=f"You cannot accept this invitation. You have another event the same day with a difference of {time_diff:.1f} hours, but you need at least {horas_entre_eventos} hours difference. | No puedes aceptar esta invitación. Tienes otro evento el mismo día con una diferencia de {time_diff:.1f} horas, pero necesitas al menos {horas_entre_eventos} horas de diferencia."
                        )

    # Al aceptar, la invitación ya estaba contada como 'pending' en los cupos activos
    ejr_result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == assignment.event_id,
            EventJobRole.job_role_id == assignment.job_role_id,
        )
    )
    ejr = ejr_result.scalar_one_or_none()
    if not ejr:
        raise HTTPException(status_code=400, detail="Rol no encontrado en el evento")

    assignment.status = "approved"
    ejr.slots_filled += 1
    await db.flush()
    
    # Send notification email to admin about acceptance
    from app.services.email_service import send_invitation_response_email
    event = await db.get(Event, assignment.event_id)
    event_creator = await db.get(User, event.created_by) if event else None
    employee = await db.get(User, assignment.user_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    if event_creator and employee and role and event:
        await send_invitation_response_email(
            admin_email=event_creator.email,
            employee_name=employee.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            accepted=True,
        )
        # Push to admin
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(event.created_by, f"✅ {employee.name} aceptó", f"Aceptó la invitación para {event.name}", "/events", db)
        except Exception: pass
    
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(assignment.event_id, db)
    return assignment


@router.patch("/{assignment_id}/reject", response_model=AssignmentOut)
async def reject_invitation(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    if assignment.status != "invited":
        raise HTTPException(status_code=400, detail="Solo puedes rechazar invitaciones pendientes")
    
    assignment.status = "rejected"
    await db.flush()
    
    # Send notification email to admin about rejection
    from app.services.email_service import send_invitation_response_email
    event = await db.get(Event, assignment.event_id)
    event_creator = await db.get(User, event.created_by) if event else None
    employee = await db.get(User, assignment.user_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    if event_creator and employee and role and event:
        await send_invitation_response_email(
            admin_email=event_creator.email,
            employee_name=employee.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            accepted=False,
        )
        # Push to admin
        try:
            from app.services.push_service import send_push_to_user
            await send_push_to_user(event.created_by, f"❌ {employee.name} rechazó", f"Rechazó la invitación para {event.name}", "/events", db)
        except Exception: pass
    
    # El cupo queda libre — actualizar estado del evento (puede volver a published)
    from app.services.event_status import check_and_update_event_status
    await check_and_update_event_status(assignment.event_id, db)
    return assignment


@router.get("/my-invitations", response_model=list[AssignmentOut])
async def my_invitations(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    result = await db.execute(
        select(EventAssignment).where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            EventAssignment.status == "invited",
        )
    )
    return result.scalars().all()


@router.get("/my-assignments", response_model=list[AssignmentOut])
async def my_assignments(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    result = await db.execute(
        select(EventAssignment).where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
        )
    )
    return result.scalars().all()


class AssignmentDetailOut(BaseModel):
    id: int
    event_id: int
    user_id: int
    user_name: str
    user_email: str
    user_phone: str | None
    company_id: int
    job_role_id: int
    job_role_name: str
    status: str
    assigned_by: int | None


@router.get("/events/{event_id}/details", response_model=list[AssignmentDetailOut])
async def list_event_assignments_detailed(
    event_id: int,
    current_user: Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))],
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    await _get_event_for_company(event_id, company_id, db)

    result = await db.execute(
        select(EventAssignment, User, JobRole)
        .join(User, User.id == EventAssignment.user_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(EventAssignment.event_id == event_id)
        .order_by(EventAssignment.status, User.name)
    )
    rows = result.all()

    return [
        AssignmentDetailOut(
            id=a.id,
            event_id=a.event_id,
            user_id=a.user_id,
            user_name=u.name,
            user_email=u.email,
            user_phone=u.phone,
            company_id=a.company_id,
            job_role_id=a.job_role_id,
            job_role_name=r.name,
            status=a.status,
            assigned_by=a.assigned_by,
        )
        for a, u, r in rows
    ]
