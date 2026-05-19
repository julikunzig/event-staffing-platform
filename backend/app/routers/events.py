from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, field_validator
from decimal import Decimal
from typing import Annotated
from datetime import date, time, datetime
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import Event, EventJobRole, JobRole, EventAssignment

router = APIRouter(prefix="/events", tags=["events"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AdminCoordDep = Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class EventJobRoleIn(BaseModel):
    job_role_id: int
    slots_required: int


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

    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: int
    company_id: int
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
    status: str
    is_public: bool

    model_config = {"from_attributes": True}


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
        is_public=True,   # siempre True internamente; visibilidad se controla por invitaciones
        status="created",
        created_by=user_id,
    )
    db.add(event)
    await db.flush()

    for jr in body.job_roles:
        ejr = EventJobRole(
            event_id=event.id,
            job_role_id=jr.job_role_id,
            slots_required=jr.slots_required,
            slots_filled=0,
        )
        db.add(ejr)

    await db.flush()
    await db.refresh(event)
    return event


@router.get("", response_model=list[EventOut])
async def list_events(
    current_user: AuthDep,
    event_status: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    role = current_user.get("role", "employee")
    user_id = int(current_user["sub"])

    query = select(Event).where(Event.company_id == company_id)

    if role in ("admin", "super_admin", "coordinator"):
        # Admin/coord ven todos los eventos
        if event_status:
            query = query.where(Event.status == event_status)
    else:
        # Empleados NO ven eventos en estado 'created' o 'cancelled'
        query = query.where(Event.status.notin_(["created", "cancelled"]))
        if event_status:
            query = query.where(Event.status == event_status)

        # Lógica de visibilidad:
        # - Si el evento tiene TODOS sus cupos cubiertos por invitaciones → solo ven los invitados
        # - Si el evento tiene cupos libres (sin invitación) → visible para todos con el rol requerido
        # - Si el evento no tiene ninguna invitación → visible para todos con el rol requerido
        from sqlalchemy import or_, and_, func as sqlfunc

        # Subquery: eventos donde el empleado tiene asignación activa
        has_assignment = select(EventAssignment.event_id).where(
            EventAssignment.user_id == user_id,
            EventAssignment.status.notin_(["removed", "rejected"]),
        )

        # Subquery: eventos donde todos los cupos están cubiertos por invitaciones
        # (para esos, solo los invitados pueden verlos)
        # Un evento está "cerrado por invitaciones" si para CADA rol,
        # el número de invitados >= slots_required
        # Simplificamos: si el empleado tiene asignación, siempre puede ver el evento.
        # Si no tiene asignación, puede ver el evento solo si hay cupos libres (no todos invitados).

        # Subquery: contar invitaciones activas por evento
        invited_count_sq = (
            select(
                EventAssignment.event_id,
                sqlfunc.count(EventAssignment.id).label("invited_count")
            )
            .where(EventAssignment.status.in_(["invited", "pending", "approved"]))
            .group_by(EventAssignment.event_id)
            .subquery()
        )

        # Subquery: total de cupos requeridos por evento
        required_count_sq = (
            select(
                EventJobRole.event_id,
                sqlfunc.sum(EventJobRole.slots_required).label("total_required")
            )
            .group_by(EventJobRole.event_id)
            .subquery()
        )

        query = query.outerjoin(
            invited_count_sq, invited_count_sq.c.event_id == Event.id
        ).outerjoin(
            required_count_sq, required_count_sq.c.event_id == Event.id
        ).where(
            or_(
                # El empleado ya tiene asignación → siempre puede ver
                Event.id.in_(has_assignment),
                # No todos los cupos están cubiertos por invitaciones → evento abierto
                or_(
                    invited_count_sq.c.invited_count == None,  # sin invitaciones
                    invited_count_sq.c.invited_count < required_count_sq.c.total_required,  # cupos libres
                )
            )
        )

    result = await db.execute(query.order_by(Event.event_date.desc()))
    return result.scalars().all()


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
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="No se puede editar un evento cancelado")

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
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status != "created":
        raise HTTPException(status_code=400, detail="Solo se pueden publicar eventos en estado 'creado'")

    event.status = "published"
    await db.flush()
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
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status != "started":
        raise HTTPException(status_code=400, detail="El evento debe estar iniciado para finalizarse")
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

    # Calcular slots_pending para cada rol
    output = []
    for role in roles:
        pending_result = await db.execute(
            select(sqlfunc.count(EventAssignment.id)).where(
                EventAssignment.event_id == event_id,
                EventAssignment.job_role_id == role.job_role_id,
                EventAssignment.status.in_(["pending", "invited"]),
            )
        )
        slots_pending = pending_result.scalar() or 0
        output.append(EventJobRoleOut(
            id=role.id,
            job_role_id=role.job_role_id,
            slots_required=role.slots_required,
            slots_filled=role.slots_filled,
            slots_pending=slots_pending,
            hourly_rate_override=role.hourly_rate_override,
        ))
    return output


class EventJobRoleRateUpdate(BaseModel):
    hourly_rate_override: Decimal


@router.patch("/{event_id}/job-roles/{job_role_id}/rate", response_model=EventJobRoleOut)
async def update_event_job_role_rate(
    event_id: int,
    job_role_id: int,
    body: EventJobRoleRateUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza la tarifa por hora para un rol específico en este evento (no modifica la tarifa global)."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status not in ("created", "published"):
        raise HTTPException(status_code=400, detail="Solo se puede modificar la tarifa en eventos creados o publicados")

    result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == job_role_id,
        )
    )
    ejr = result.scalar_one_or_none()
    if not ejr:
        raise HTTPException(status_code=404, detail="Rol no encontrado en este evento")

    ejr.hourly_rate_override = body.hourly_rate_override
    await db.flush()
    return ejr


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
    """Actualiza la cantidad de cupos requeridos para un rol en el evento."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="No se puede modificar un evento cancelado")

    result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == job_role_id,
        )
    )
    ejr = result.scalar_one_or_none()
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

    # Verificar que el rol no existe ya en el evento
    existing = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event_id,
            EventJobRole.job_role_id == body.job_role_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Este rol ya existe en el evento")

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
