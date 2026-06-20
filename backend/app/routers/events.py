from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel, field_validator
from decimal import Decimal
from typing import Annotated
from datetime import date, time, datetime
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import Event, EventJobRole, JobRole, EventAssignment, User, EmployeeJobRole

router = APIRouter(prefix="/events", tags=["events"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AdminCoordDep = Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class EventJobRoleIn(BaseModel):
    job_role_id: int
    slots_required: int
    hourly_rate_override: Decimal | None = None
    start_time: time | None = None


def parse_date(value: str | date) -> date:
    """Parsear fecha en múltiples formatos: yyyy-mm-dd, mm/dd/yyyy, dd/mm/yyyy"""
    if isinstance(value, date):
        return value
    if not isinstance(value, str):
        raise ValueError(f"Fecha inválida: {value}")
    
    value = value.strip()
    
    # Intentar formato ISO (yyyy-mm-dd)
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        pass
    
    # Intentar formato mm/dd/yyyy (inglés)
    try:
        return datetime.strptime(value, "%m/%d/%Y").date()
    except ValueError:
        pass
    
    # Intentar formato dd/mm/yyyy (español)
    try:
        return datetime.strptime(value, "%d/%m/%Y").date()
    except ValueError:
        pass
    
    raise ValueError(f"Formato de fecha no válido: {value}. Use yyyy-mm-dd, mm/dd/yyyy o dd/mm/yyyy")


class EventCreate(BaseModel):
    name: str
    event_date: date
    start_time: time
    end_time: time | None = None
    address: str
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    dress_code: str | None = None
    job_roles: list[EventJobRoleIn]
    
    @field_validator('event_date', mode='before')
    @classmethod
    def validate_event_date(cls, v):
        return parse_date(v)


class EventUpdate(BaseModel):
    name: str | None = None
    event_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    dress_code: str | None = None
    
    @field_validator('event_date', mode='before')
    @classmethod
    def validate_event_date(cls, v):
        if v is None:
            return v
        return parse_date(v)


class EndTimeUpdate(BaseModel):
    end_time: time


class EventJobRoleOut(BaseModel):
    id: int
    job_role_id: int
    slots_required: int
    slots_filled: int
    slots_pending: int = 0   # pending + invited (esperando aprobación)
    hourly_rate_override: Decimal | None = None
    start_time: time | None = None

    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: int
    company_id: int
    event_code: str | None = None
    name: str
    event_date: date
    start_time: time
    end_time: time | None
    address: str
    city: str | None
    state: str | None
    zip_code: str | None
    latitude: Decimal | None
    longitude: Decimal | None
    dress_code: str | None
    notes: str | None
    status: str
    is_public: bool

    model_config = {"from_attributes": True}


class CoordinatorOut(BaseModel):
    user_id: int
    name: str
    email: str
    model_config = {"from_attributes": True}


class SetCoordinatorsBody(BaseModel):
    user_ids: list[int]


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    body: EventCreate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    if not body.job_roles:
        raise HTTPException(status_code=400, detail="Se requiere al menos un rol")

    # Validar que los roles pertenecen a la empresa
    for jr in body.job_roles:
        role = await db.get(JobRole, jr.job_role_id)
        if not role or role.company_id != company_id or not role.is_active:
            raise HTTPException(status_code=400, detail=f"Rol {jr.job_role_id} no válido")
        if jr.slots_required < 1:
            raise HTTPException(status_code=400, detail="slots_required debe ser mayor a 0")

    # Geocodificar automáticamente la dirección
    from app.services.geocoding import geocode_address
    lat, lng = await geocode_address(body.address, body.city or "", body.state or "", body.zip_code or "")
    if lat is None or lng is None:
        # Intentar solo con dirección + estado si falla la búsqueda completa
        lat, lng = await geocode_address(body.address, "", body.state or "", "")

    event = Event(
        company_id=company_id,
        name=body.name.strip().upper(),
        event_date=body.event_date,
        start_time=body.start_time,
        end_time=body.end_time,
        address=body.address.strip().upper() if body.address else body.address,
        city=body.city.strip().upper() if body.city else body.city,
        state=body.state.strip().upper() if body.state else body.state,
        zip_code=body.zip_code.strip().upper() if body.zip_code else body.zip_code,
        latitude=lat,
        longitude=lng,
        dress_code=body.dress_code.strip().upper() if body.dress_code else body.dress_code,
        is_public=True,
        status="created",
        created_by=user_id,
    )
    db.add(event)
    await db.flush()

    # Generate event_code: {company_id}-{consecutive}
    from sqlalchemy import func as sqlfunc
    max_code_result = await db.execute(
        select(sqlfunc.max(Event.id)).where(
            Event.company_id == company_id,
            Event.event_code.isnot(None),
        )
    )
    # Find the max consecutive number from existing codes
    existing_codes_result = await db.execute(
        select(Event.event_code).where(
            Event.company_id == company_id,
            Event.event_code.isnot(None),
        )
    )
    max_consecutive = 0
    for (code,) in existing_codes_result.all():
        try:
            num = int(code.split("-")[-1])
            if num > max_consecutive:
                max_consecutive = num
        except (ValueError, IndexError):
            pass
    event.event_code = f"{company_id}-{max_consecutive + 1}"
    await db.flush()

    for jr in body.job_roles:
        ejr = EventJobRole(
            event_id=event.id,
            job_role_id=jr.job_role_id,
            slots_required=jr.slots_required,
            slots_filled=0,
            hourly_rate_override=jr.hourly_rate_override,
            start_time=jr.start_time,
        )
        db.add(ejr)

    await db.flush()
    await db.refresh(event)
    return event


@router.get("", response_model=list[EventOut])
async def list_events(
    current_user: AuthDep,
    event_status: str | None = Query(None, alias="status"),
    search: str | None = Query(None, description="Buscar por nombre o ID"),
    from_date: str | None = Query(None, description="Fecha inicio YYYY-MM-DD"),
    to_date: str | None = Query(None, description="Fecha fin YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import or_, cast, String
    company_id = current_user["company_id"]
    role = current_user.get("role", "employee")
    user_id = int(current_user["sub"])

    query = select(Event).where(Event.company_id == company_id)

    # Filtro de búsqueda por nombre o ID
    if search:
        search_stripped = search.strip()
        # Search by name, ID, or event_code
        if search_stripped.isdigit():
            query = query.where(
                or_(
                    Event.name.ilike(f"%{search_stripped}%"),
                    Event.id == int(search_stripped),
                    Event.event_code.ilike(f"%{search_stripped}%"),
                )
            )
        else:
            query = query.where(
                or_(
                    Event.name.ilike(f"%{search_stripped}%"),
                    Event.event_code.ilike(f"%{search_stripped}%"),
                )
            )

    # Filtro por rango de fechas
    if from_date:
        try:
            query = query.where(Event.event_date >= date.fromisoformat(from_date))
        except ValueError:
            pass
    if to_date:
        try:
            query = query.where(Event.event_date <= date.fromisoformat(to_date))
        except ValueError:
            pass

    if role in ("admin", "super_admin", "coordinator"):
        # Admin ven todos los eventos; coordinadores solo los asignados a ellos
        if role == "coordinator":
            from app.models import EventCoordinator
            query = query.join(
                EventCoordinator,
                (EventCoordinator.event_id == Event.id) & (EventCoordinator.user_id == user_id)
            )
        if event_status:
            query = query.where(Event.status == event_status)
    else:
        # Empleados: filtro especial por rol y asignación

        # Subquery: IDs de eventos donde el empleado tiene asignación activa
        assigned_event_ids = select(EventAssignment.event_id).where(
            EventAssignment.user_id == user_id,
            EventAssignment.status.notin_(["removed", "rejected"]),
        ).scalar_subquery()

        # Subquery: IDs de roles laborales del empleado en esta empresa
        employee_role_ids = select(EmployeeJobRole.job_role_id).where(
            EmployeeJobRole.user_id == user_id,
            EmployeeJobRole.company_id == company_id,
        ).scalar_subquery()

        # Subquery: IDs de eventos publicados que requieren roles del empleado
        published_with_matching_roles = select(EventJobRole.event_id).where(
            EventJobRole.job_role_id.in_(employee_role_ids),
        ).scalar_subquery()

        # Empleado ve:
        # 1. Eventos "published" que requieran su(s) rol(es)
        # 2. Eventos "filled_pending", "filled", "started", "finished" donde esté asignado
        query = query.where(
            or_(
                # Published events matching employee's roles
                (Event.status == "published") & (Event.id.in_(published_with_matching_roles)),
                # Non-published events where employee is assigned
                (Event.status.in_(["filled_pending", "filled", "started", "finished"])) & (Event.id.in_(assigned_event_ids)),
            )
        )

        if event_status:
            query = query.where(Event.status == event_status)

    result = await db.execute(query.order_by(Event.event_date.desc()))
    return result.scalars().all()


@router.get("/company-coordinators", response_model=list[CoordinatorOut])
async def list_company_coordinators(
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Return all active coordinators in the company (for the selector)."""
    from app.models import UserCompanyMembership, Profile
    company_id = current_user["company_id"]

    result = await db.execute(
        select(User)
        .join(UserCompanyMembership, UserCompanyMembership.user_id == User.id)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            UserCompanyMembership.company_id == company_id,
            UserCompanyMembership.is_active == True,
            User.is_active == True,
            Profile.code == "coordinator",
        )
        .order_by(User.name)
    )
    users = result.scalars().all()
    return [CoordinatorOut(user_id=u.id, name=u.name, email=u.email) for u in users]


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return event


@router.patch("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: int,
    body: EventUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status in ("cancelled", "finished", "settled"):
        raise HTTPException(status_code=400, detail="No se puede editar un evento cancelado, finalizado o liquidado")

    update_data = body.model_dump(exclude_none=True)

    # Normalizar campos de texto a mayúsculas
    text_upper_fields = {"name", "address", "city", "state", "zip_code", "dress_code"}
    for field in text_upper_fields:
        if field in update_data and isinstance(update_data[field], str):
            update_data[field] = update_data[field].strip().upper()

    # Si cambia algún campo de dirección, re-geocodificar
    address_fields = {"address", "city", "state", "zip_code"}
    if address_fields & set(update_data.keys()):
        new_address = update_data.get("address", event.address)
        new_city = update_data.get("city", event.city or "")
        new_state = update_data.get("state", event.state or "")
        new_zip = update_data.get("zip_code", event.zip_code or "")
        from app.services.geocoding import geocode_address
        lat, lng = await geocode_address(new_address, new_city, new_state, new_zip)
        if lat is None:
            lat, lng = await geocode_address(new_address, "", new_state, "")
        if lat is not None:
            update_data["latitude"] = lat
            update_data["longitude"] = lng

    for field, value in update_data.items():
        setattr(event, field, value)
    await db.flush()
    return event


@router.post("/{event_id}/publish", response_model=EventOut)
async def publish_event(
    event_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from app.models import EmployeeJobRole, UserCompanyMembership, Profile, EventAssignment
    from app.services.email_queue_service import queue_event_published_email
    from app.services.whatsapp_service import send_whatsapp

    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status != "created":
        raise HTTPException(status_code=400, detail="Solo se pueden publicar eventos en estado 'creado'")

    # Get event job roles
    result = await db.execute(
        select(EventJobRole).where(EventJobRole.event_id == event_id)
    )
    event_roles = result.scalars().all()

    # Update event status
    event.status = "published"
    await db.flush()

    if not event_roles:
        await db.commit()
        await db.refresh(event)
        return event

    job_role_ids = [er.job_role_id for er in event_roles]

    # Build roles info for emails — include start_time and rate override
    roles_info = []
    for er in event_roles:
        role = await db.get(JobRole, er.job_role_id)
        if role:
            effective_rate = str(er.hourly_rate_override) if er.hourly_rate_override else str(role.hourly_rate)
            role_start = str(er.start_time)[:5] if er.start_time else str(event.start_time)[:5] if event.start_time else ""
            roles_info.append({
                "name": role.name,
                "rate": effective_rate,
                "slots": er.slots_required,
                "start_time": role_start,
            })

    # ── Get invited employees (status = 'invited') ──────────────────────────
    invited_result = await db.execute(
        select(EventAssignment, User)
        .join(User, User.id == EventAssignment.user_id)
        .where(
            EventAssignment.event_id == event_id,
            EventAssignment.status == "invited",
        )
    )
    invited_rows = invited_result.all()
    invited_employees = [user for _, user in invited_rows]
    invited_assignments = [a for a, _ in invited_rows]

    # ── Check if invitations fill all slots ─────────────────────────────────
    from collections import defaultdict
    invited_per_role: dict = defaultdict(int)
    for a in invited_assignments:
        invited_per_role[a.job_role_id] += 1

    # Are all slots covered by invitations?
    all_slots_filled = bool(invited_assignments) and all(
        invited_per_role.get(er.job_role_id, 0) >= er.slots_required
        for er in event_roles
    )

    # Deduplicate invited employees by user_id
    seen_invited: set = set()
    unique_invited: list = []
    for emp in invited_employees:
        if emp.id not in seen_invited and emp.email:
            seen_invited.add(emp.id)
            unique_invited.append(emp)

    event_date_str = event.event_date.strftime("%Y-%m-%d")
    start_time_str = str(event.start_time)

    try:
        # Helper: send WhatsApp invitation to an invited employee
        async def notify_invited_via_whatsapp(emp, assignment_id: int):
            if not emp.phone:
                return
            first_name = emp.name.split()[0].capitalize() if emp.name else ""
            wa_msg = (
                f"👋 Hola {first_name}!\n\n"
                f"Has sido invitado/a a trabajar en el evento *{event.name}*.\n"
                f"📅 Fecha: {event_date_str}\n"
                f"🕐 Hora: {start_time_str}\n"
                f"📍 {event.address}, {event.city or ''} {event.state or ''}\n\n"
                f"Responde con:\n"
                f"*1* ✅ para ACEPTAR la invitación\n"
                f"*2* ❌ para RECHAZAR la invitación\n\n"
                f"(ID de asignación: {assignment_id})"
            )
            send_whatsapp(emp.phone, wa_msg)

        # Helper: send push notification to an employee
        from app.services.push_service import send_push_to_user
        async def notify_push(user_id: int, title: str, body: str):
            await send_push_to_user(user_id, title, body, "/profile", db)

        # Build map: user_id → assignment (for WhatsApp with assignment_id)
        user_assignment_map = {a.user_id: a for a in invited_assignments}

        if all_slots_filled and unique_invited:
            # ── CASE A: All slots filled by invitations ──────────────────────
            # Send email + WhatsApp to invited employees
            for emp in unique_invited:
                first_name = emp.name.split()[0].capitalize() if emp.name else ""
                try:
                    queued = await queue_event_published_email(
                        db=db,
                        company_id=company_id,
                        employee_email=emp.email,
                        employee_name=first_name,
                        event_name=event.name,
                        event_date=event_date_str,
                        start_time=start_time_str,
                        address=event.address,
                        city=event.city or "",
                        state=event.state or "",
                        zip_code=event.zip_code or "",
                        roles=roles_info,
                        dress_code=event.dress_code,
                        company_id=event.company_id,
                    )
                    print(f"[EVENT_PUBLISHED QUEUED] to={emp.email} event={event.name} queue_id={queued.id}")
                except Exception as e:
                    print(f"[EVENT_PUBLISHED QUEUE ERROR] to={emp.email} event={event.name}: {e}")

                assignment = user_assignment_map.get(emp.id)
                if assignment:
                    await notify_invited_via_whatsapp(emp, assignment.id)

        elif unique_invited:
            # ── CASE B: Invitations exist but don't fill all slots ────────────
            # Send email + WhatsApp + push to invited employees
            for emp in unique_invited:
                first_name = emp.name.split()[0].capitalize() if emp.name else ""
                try:
                    queued = await queue_event_published_email(
                        db=db,
                        company_id=company_id,
                        employee_email=emp.email,
                        employee_name=first_name,
                        event_name=event.name,
                        event_date=event_date_str,
                        start_time=start_time_str,
                        address=event.address,
                        city=event.city or "",
                        state=event.state or "",
                        zip_code=event.zip_code or "",
                        roles=roles_info,
                        dress_code=event.dress_code,
                        company_id=event.company_id,
                    )
                    print(f"[EVENT_PUBLISHED QUEUED] to={emp.email} event={event.name} queue_id={queued.id}")
                except Exception as e:
                    print(f"[EVENT_PUBLISHED QUEUE ERROR] to={emp.email} event={event.name}: {e}")

                assignment = user_assignment_map.get(emp.id)
                if assignment:
                    await notify_invited_via_whatsapp(emp, assignment.id)
                await notify_push(emp.id, f"📋 {event.name}", f"Has sido invitado a trabajar el {event_date_str}")

            # Also send email to remaining eligible employees (not already invited)
            eligible_result = await db.execute(
                select(User).join(
                    UserCompanyMembership, User.id == UserCompanyMembership.user_id
                ).join(
                    Profile, Profile.id == UserCompanyMembership.profile_id
                ).where(
                    UserCompanyMembership.company_id == company_id,
                    User.id.in_(
                        select(EmployeeJobRole.user_id).where(
                            EmployeeJobRole.company_id == company_id,
                            EmployeeJobRole.job_role_id.in_(job_role_ids)
                        )
                    ),
                    User.is_active == True,
                    UserCompanyMembership.is_active == True,
                    Profile.code == "employee",
                    User.id.notin_(seen_invited),  # exclude already invited
                ).distinct()
            )
            other_employees = eligible_result.scalars().all()
            seen_other: set = set()
            for emp in other_employees:
                if emp.id not in seen_other and emp.email:
                    seen_other.add(emp.id)
                    first_name = emp.name.split()[0].capitalize() if emp.name else ""
                    try:
                        queued = await queue_event_published_email(
                            db=db,
                            company_id=company_id,
                            employee_email=emp.email,
                            employee_name=first_name,
                            event_name=event.name,
                            event_date=event_date_str,
                            start_time=start_time_str,
                            address=event.address,
                            city=event.city or "",
                            state=event.state or "",
                            zip_code=event.zip_code or "",
                            roles=roles_info,
                            dress_code=event.dress_code,
                            company_id=event.company_id,
                        )
                        print(f"[EVENT_PUBLISHED QUEUED] to={emp.email} event={event.name} queue_id={queued.id}")
                    except Exception as e:
                        print(f"[EVENT_PUBLISHED QUEUE ERROR] to={emp.email} event={event.name}: {e}")
                    

        else:
            # ── CASE C: No invitations — send per-role emails to eligible employees ─
            # For each event_job_role, find employees with that role and send individual email
            for er in event_roles:
                role = await db.get(JobRole, er.job_role_id)
                if not role:
                    continue
                effective_rate = str(er.hourly_rate_override) if er.hourly_rate_override else str(role.hourly_rate)
                role_start_time = str(er.start_time)[:5] if er.start_time else start_time_str

                # Find employees with this specific role
                role_employees_result = await db.execute(
                    select(User).join(
                        EmployeeJobRole, EmployeeJobRole.user_id == User.id
                    ).join(
                        UserCompanyMembership, (UserCompanyMembership.user_id == User.id) & (UserCompanyMembership.company_id == company_id)
                    ).join(
                        Profile, Profile.id == UserCompanyMembership.profile_id
                    ).where(
                        EmployeeJobRole.company_id == company_id,
                        EmployeeJobRole.job_role_id == er.job_role_id,
                        User.is_active == True,
                        UserCompanyMembership.is_active == True,
                        Profile.code == "employee",
                    ).distinct()
                )
                role_employees = role_employees_result.scalars().all()

                for emp in role_employees:
                    if not emp.email:
                        continue
                    first_name = emp.name.split()[0].capitalize() if emp.name else ""
                    role_info = [{"name": role.name, "rate": effective_rate}]
                    try:
                        queued = await queue_event_published_email(
                            db=db,
                            company_id=company_id,
                            employee_email=emp.email,
                            employee_name=first_name,
                            event_name=event.name,
                            event_date=event_date_str,
                            start_time=start_time_str,
                            address=event.address,
                            city=event.city or "",
                            state=event.state or "",
                            zip_code=event.zip_code or "",
                            roles=roles_info,
                            dress_code=event.dress_code,
                            company_id=event.company_id,
                        )
                        print(f"[EVENT_PUBLISHED QUEUED] to={emp.email} event={event.name} queue_id={queued.id}")
                    except Exception as e:
                        print(f"[EVENT_PUBLISHED QUEUE ERROR] to={emp.email} event={event.name}: {e}")
                    
                    await notify_push(emp.id, f"🎉 {event.name}", f"{role.name} a las {role_start_time} — ${effective_rate}/h")

    except Exception as e:
        print(f"❌ Error sending notifications on publish: {str(e)}")

    await db.commit()
    await db.refresh(event)
    return event


@router.post("/{event_id}/cancel", response_model=EventOut)
async def cancel_event(
    event_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="El evento ya está cancelado")
    event.status = "cancelled"
    await db.flush()
    return event


@router.patch("/{event_id}/end-time", response_model=EventOut)
async def update_end_time(
    event_id: int,
    body: EndTimeUpdate,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event.end_time = body.end_time
    await db.flush()
    return event


@router.post("/{event_id}/start", response_model=EventOut)
async def start_event(event_id: int, current_user: AdminCoordDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status not in ("published", "filled_pending", "filled"):
        raise HTTPException(status_code=400, detail="El evento debe estar publicado o lleno para iniciarse")
    event.status = "started"
    await db.flush()
    return event


@router.post("/{event_id}/finish", response_model=EventOut)
async def finish_event(event_id: int, current_user: AdminCoordDep, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func as sqlfunc
    from app.models import Shift
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status != "started":
        raise HTTPException(status_code=400, detail="El evento debe estar iniciado para finalizarse")

    # Validación de cierre: todos los empleados aprobados deben tener
    # hora de entrada Y hora de salida registradas antes de finalizar.
    total_q = await db.execute(
        select(sqlfunc.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.status == "approved",
        )
    )
    total_approved = total_q.scalar() or 0
    closed_q = await db.execute(
        select(sqlfunc.count(Shift.id))
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .where(
            EventAssignment.event_id == event_id,
            EventAssignment.status == "approved",
            Shift.clock_in.isnot(None),
            Shift.clock_out.isnot(None),
        )
    )
    closed = closed_q.scalar() or 0
    pending = total_approved - closed
    if pending > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede finalizar: {pending} empleado(s) sin hora de entrada y/o salida registrada. Cierre todos los turnos primero.",
        )

    event.status = "finished"
    await db.flush()
    return event


class EligibleEmployee(BaseModel):
    user_id: int
    name: str
    email: str
    phone: str | None
    job_role_id: int
    job_role_name: str


@router.get("/{event_id}/eligible-employees", response_model=list[EligibleEmployee])
async def get_eligible_employees(
    event_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Retorna empleados con roles asociados que coinciden con los roles requeridos por el evento."""
    from app.models import EmployeeJobRole, EventJobRole
    company_id = current_user["company_id"]

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Obtener roles requeridos por el evento
    ejr_result = await db.execute(
        select(EventJobRole).where(EventJobRole.event_id == event_id)
    )
    event_role_ids = {ejr.job_role_id for ejr in ejr_result.scalars().all()}

    if not event_role_ids:
        return []

    # Obtener empleados que tienen esos roles en la empresa
    from app.models import User, UserCompanyMembership, Profile
    result = await db.execute(
        select(User, EmployeeJobRole, JobRole)
        .join(EmployeeJobRole, EmployeeJobRole.user_id == User.id)
        .join(JobRole, JobRole.id == EmployeeJobRole.job_role_id)
        .join(UserCompanyMembership, (UserCompanyMembership.user_id == User.id) &
              (UserCompanyMembership.company_id == company_id))
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            EmployeeJobRole.company_id == company_id,
            EmployeeJobRole.job_role_id.in_(event_role_ids),
            User.is_active == True,
            UserCompanyMembership.is_active == True,
            Profile.code == "employee",
        )
    )
    rows = result.all()

    # Excluir los que ya tienen asignación en este evento
    from app.models import EventAssignment
    assigned_result = await db.execute(
        select(EventAssignment.user_id).where(
            EventAssignment.event_id == event_id,
            EventAssignment.status.notin_(["removed", "rejected"]),
        )
    )
    already_assigned = {row[0] for row in assigned_result.all()}

    return [
        EligibleEmployee(
            user_id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            job_role_id=ejr.job_role_id,
            job_role_name=role.name,
        )
        for user, ejr, role in rows
        if user.id not in already_assigned
    ]


@router.get("/{event_id}/job-roles", response_model=list[EventJobRoleOut])
async def get_event_job_roles(
    event_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func as sqlfunc
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    result = await db.execute(
        select(EventJobRole).where(EventJobRole.event_id == event_id)
    )
    roles = result.scalars().all()

    # Calcular slots_pending para cada rol (usando event_job_role_id si disponible)
    output = []
    for role in roles:
        # Count assignments specifically for this event_job_role
        from sqlalchemy import or_
        pending_result = await db.execute(
            select(sqlfunc.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.status.in_(["pending", "invited"]),
                or_(
                    EventAssignment.event_job_role_id == role.id,
                    # Fallback: count by job_role_id for assignments without event_job_role_id
                    (EventAssignment.event_job_role_id == None) & (EventAssignment.job_role_id == role.job_role_id),
                ),
            )
        )
        slots_pending = pending_result.scalar() or 0
        
        # Count filled (approved) for this specific event_job_role
        filled_result = await db.execute(
            select(sqlfunc.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.status == "approved",
                or_(
                    EventAssignment.event_job_role_id == role.id,
                    (EventAssignment.event_job_role_id == None) & (EventAssignment.job_role_id == role.job_role_id),
                ),
            )
        )
        actual_filled = filled_result.scalar() or 0
        
        output.append(EventJobRoleOut(
            id=role.id,
            job_role_id=role.job_role_id,
            slots_required=role.slots_required,
            slots_filled=actual_filled,
            slots_pending=slots_pending,
            hourly_rate_override=role.hourly_rate_override,
            start_time=role.start_time,
        ))
    return output


class EventJobRoleRateUpdate(BaseModel):
    hourly_rate_override: Decimal | None = None
    start_time: time | None = None


@router.patch("/{event_id}/job-roles/{job_role_id}/rate", response_model=EventJobRoleOut)
async def update_event_job_role_rate(
    event_id: int,
    job_role_id: int,
    body: EventJobRoleRateUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza la tarifa por hora para un rol específico en este evento (no modifica la tarifa global).
    job_role_id here is actually the event_job_role.id (the row ID) for unique identification."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Try by event_job_role.id first (new behavior)
    ejr = await db.get(EventJobRole, job_role_id)
    if not ejr or ejr.event_id != event_id:
        # Fallback: try by job_role_id (legacy behavior)
        result = await db.execute(
            select(EventJobRole).where(
                EventJobRole.event_id == event_id,
                EventJobRole.job_role_id == job_role_id,
            )
        )
        ejr = result.scalars().first()
    
    if not ejr:
        raise HTTPException(status_code=404, detail="Rol no encontrado en este evento")

    if body.hourly_rate_override is not None:
        ejr.hourly_rate_override = body.hourly_rate_override
    elif 'hourly_rate_override' in (body.model_fields_set or set()):
        ejr.hourly_rate_override = None
    
    if body.start_time is not None:
        ejr.start_time = body.start_time
    elif 'start_time' in (body.model_fields_set or set()):
        ejr.start_time = None

    await db.flush()
    from sqlalchemy import func as sqlfunc
    pending_result = await db.execute(
        select(sqlfunc.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.job_role_id == ejr.job_role_id,
            EventAssignment.status.in_(["pending", "invited"]),
        )
    )
    slots_pending = pending_result.scalar() or 0
    return EventJobRoleOut(
        id=ejr.id, job_role_id=ejr.job_role_id,
        slots_required=ejr.slots_required, slots_filled=ejr.slots_filled,
        slots_pending=slots_pending, hourly_rate_override=ejr.hourly_rate_override,
        start_time=ejr.start_time,
    )

class EventJobRoleSlotsUpdate(BaseModel):
    slots_required: int


@router.patch("/{event_id}/job-roles/{job_role_id}/slots", response_model=EventJobRoleOut)
async def update_event_job_role_slots(
    event_id: int,
    job_role_id: int,
    body: EventJobRoleSlotsUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza la cantidad de cupos requeridos para un rol en el evento.
    job_role_id can be the event_job_role.id (row ID) for unique identification."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="No se puede modificar un evento cancelado")

    # Try by event_job_role.id first (new behavior for repeated roles)
    ejr = await db.get(EventJobRole, job_role_id)
    if not ejr or ejr.event_id != event_id:
        # Fallback: try by job_role_id (legacy)
        result = await db.execute(
            select(EventJobRole).where(
                EventJobRole.event_id == event_id,
                EventJobRole.job_role_id == job_role_id,
            )
        )
        ejr = result.scalars().first()
    
    if not ejr:
        raise HTTPException(status_code=404, detail="Rol no encontrado en este evento")

    if body.slots_required < ejr.slots_filled:
        raise HTTPException(
            status_code=400,
            detail=f"No puedes reducir a {body.slots_required} cupos porque ya hay {ejr.slots_filled} empleados aprobados. Quita empleados primero."
        )
    if body.slots_required < 1:
        raise HTTPException(status_code=400, detail="Se requiere al menos 1 cupo")

    old_slots = ejr.slots_required
    ejr.slots_required = body.slots_required
    await db.flush()

    # Re-evaluar el estado del evento según la nueva cantidad de cupos
    event = await db.get(Event, event_id)
    if event and event.status in ("filled", "filled_pending", "published"):
        if body.slots_required > old_slots:
            # Se aumentaron cupos → siempre volver a publicado (hay vacantes nuevas)
            event.status = "published"
            await db.flush()
        else:
            # Se redujeron cupos → re-evaluar: puede quedar filled, filled_pending o published
            from app.services.event_status import check_and_update_event_status
            await check_and_update_event_status(event_id, db)

    return ejr


@router.delete("/{event_id}/job-roles/{ejr_id}", status_code=204)
async def delete_event_job_role(
    event_id: int,
    ejr_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Delete a job role row from an event. Only allowed if no employees are assigned to it."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    ejr = await db.get(EventJobRole, ejr_id)
    if not ejr or ejr.event_id != event_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado en este evento")

    if ejr.slots_filled > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar: hay {ejr.slots_filled} empleado(s) aprobado(s) en este rol. Quítalos primero."
        )

    # Check for pending/invited assignments specifically for THIS event_job_role
    from sqlalchemy import or_
    pending_result = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == event_id,
            EventAssignment.status.in_(["pending", "invited"]),
            or_(
                EventAssignment.event_job_role_id == ejr_id,
                # Fallback: if no event_job_role_id set, check by job_role_id (legacy)
                (EventAssignment.event_job_role_id == None) & (EventAssignment.job_role_id == ejr.job_role_id),
            ),
        )
    )
    pending = pending_result.scalars().all()
    if pending:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar: hay {len(pending)} empleado(s) pendientes/invitados en este turno. Quítalos primero."
        )

    await db.delete(ejr)
    await db.flush()


class AddEventJobRoleRequest(BaseModel):
    job_role_id: int
    slots_required: int


@router.post("/{event_id}/job-roles", response_model=EventJobRoleOut, status_code=201)
async def add_event_job_role(
    event_id: int,
    body: AddEventJobRoleRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Agrega un nuevo rol al evento."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="No se puede modificar un evento cancelado")

    # Verificar que el rol pertenece a la empresa
    role = await db.get(JobRole, body.job_role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=400, detail="Rol no válido")

    ejr = EventJobRole(
        event_id=event_id,
        job_role_id=body.job_role_id,
        slots_required=body.slots_required,
        slots_filled=0,
    )
    db.add(ejr)
    await db.flush()
    await db.refresh(ejr)
    # Si el evento estaba 'filled' o 'filled_pending', volver a 'published' porque hay nuevos cupos
    event = await db.get(Event, event_id)
    if event and event.status in ("filled", "filled_pending"):
        event.status = "published"
        await db.flush()
    return ejr


# ─────────────────────────────────────────────────────────────────────────────
# COORDINATOR ASSIGNMENT
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{event_id}/coordinators", response_model=list[CoordinatorOut])
@router.get("/{event_id}/coordinators", response_model=list[CoordinatorOut])
async def get_event_coordinators(
    event_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Return coordinators assigned to this event. Accessible to all authenticated users."""
    from app.models import EventCoordinator
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    result = await db.execute(
        select(User)
        .join(EventCoordinator, EventCoordinator.user_id == User.id)
        .where(EventCoordinator.event_id == event_id)
    )
    users = result.scalars().all()
    return [CoordinatorOut(user_id=u.id, name=u.name, email=u.email) for u in users]


@router.put("/{event_id}/coordinators", response_model=list[CoordinatorOut])
async def set_event_coordinators(
    event_id: int,
    body: SetCoordinatorsBody,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Replace the full list of coordinators for this event (admin only)."""
    from app.models import EventCoordinator, UserCompanyMembership, Profile
    company_id = current_user["company_id"]
    admin_id = int(current_user["sub"])

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Validate all user_ids are coordinators in this company
    if body.user_ids:
        result = await db.execute(
            select(User)
            .join(UserCompanyMembership, UserCompanyMembership.user_id == User.id)
            .join(Profile, Profile.id == UserCompanyMembership.profile_id)
            .where(
                User.id.in_(body.user_ids),
                UserCompanyMembership.company_id == company_id,
                UserCompanyMembership.is_active == True,
                Profile.code == "coordinator",
            )
        )
        valid_users = result.scalars().all()
        valid_ids = {u.id for u in valid_users}
        invalid = set(body.user_ids) - valid_ids
        if invalid:
            raise HTTPException(
                status_code=400,
                detail=f"Los siguientes usuarios no son coordinadores activos: {list(invalid)}"
            )
    else:
        valid_users = []

    # Delete existing coordinators for this event
    existing = await db.execute(
        select(EventCoordinator).where(EventCoordinator.event_id == event_id)
    )
    for ec in existing.scalars().all():
        await db.delete(ec)
    await db.flush()

    # Insert new ones
    for uid in body.user_ids:
        db.add(EventCoordinator(event_id=event_id, user_id=uid, assigned_by=admin_id))
    await db.flush()

    return [CoordinatorOut(user_id=u.id, name=u.name, email=u.email) for u in valid_users]




# ─────────────────────────────────────────────────────────────────────────────
# EVENT NOTES
# ─────────────────────────────────────────────────────────────────────────────

class NotesUpdate(BaseModel):
    notes: str | None = None


@router.patch("/{event_id}/notes", response_model=EventOut)
async def update_event_notes(
    event_id: int,
    body: NotesUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Update the additional notes for an event (admin only)."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event.notes = body.notes.strip().upper() if body.notes else body.notes
    await db.flush()
    return event


# ─────────────────────────────────────────────────────────────────────────────
# EVENT DOCUMENTS
# ─────────────────────────────────────────────────────────────────────────────

class EventDocumentOut(BaseModel):
    id: int
    name: str
    url: str
    created_at: str
    model_config = {"from_attributes": True}


class EventDocumentCreate(BaseModel):
    name: str
    url: str


@router.get("/{event_id}/documents", response_model=list[EventDocumentOut])
async def get_event_documents(
    event_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Return documents for an event. Accessible to all authenticated users of the company."""
    from app.models import EventDocument
    company_id = current_user["company_id"]

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    result = await db.execute(
        select(EventDocument)
        .where(EventDocument.event_id == event_id)
        .order_by(EventDocument.created_at)
    )
    docs = result.scalars().all()
    return [
        EventDocumentOut(
            id=d.id,
            name=d.name,
            url=d.url,
            created_at=d.created_at.isoformat(),
        )
        for d in docs
    ]


@router.post("/{event_id}/documents", response_model=EventDocumentOut, status_code=201)
async def add_event_document(
    event_id: int,
    body: EventDocumentCreate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Add a document/link to an event (admin only)."""
    from app.models import EventDocument
    company_id = current_user["company_id"]
    user_id = int(current_user["sub"])

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    doc = EventDocument(
        event_id=event_id,
        name=body.name.strip(),
        url=body.url.strip(),
        uploaded_by=user_id,
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return EventDocumentOut(id=doc.id, name=doc.name, url=doc.url, created_at=doc.created_at.isoformat())


@router.delete("/{event_id}/documents/{document_id}", status_code=204)
async def delete_event_document(
    event_id: int,
    document_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Delete a document from an event (admin only)."""
    from app.models import EventDocument
    company_id = current_user["company_id"]

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    doc = await db.get(EventDocument, document_id)
    if not doc or doc.event_id != event_id:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    await db.delete(doc)
    await db.flush()