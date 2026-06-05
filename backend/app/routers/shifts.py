from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.core.config import settings
from app.models import Shift, EventAssignment, Event, JobRole, WeeklyHoursConfig, Company, EventJobRole
from app.services.geo import is_within_radius
from app.services.payment import calculate_shift_pay

router = APIRouter(prefix="/shifts", tags=["shifts"])
AdminCoordDep = Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


def _now_naive() -> datetime:
    return datetime.utcnow()


def _get_timezone_from_state(state: str | None) -> ZoneInfo:
    """
    Retorna la zona horaria basada en el estado USA.
    Si no se puede determinar, retorna UTC.
    """
    if not state:
        return ZoneInfo("UTC")
    
    # Mapeo de estados USA a zonas horarias
    state_to_tz = {
        # Eastern Time
        "CT": ZoneInfo("America/Chicago"),
        "ET": ZoneInfo("America/New_York"),
        "ME": ZoneInfo("America/New_York"),
        "NH": ZoneInfo("America/New_York"),
        "VT": ZoneInfo("America/New_York"),
        "MA": ZoneInfo("America/New_York"),
        "RI": ZoneInfo("America/New_York"),
        "CT": ZoneInfo("America/New_York"),
        "NY": ZoneInfo("America/New_York"),
        "NJ": ZoneInfo("America/New_York"),
        "PA": ZoneInfo("America/New_York"),
        "DE": ZoneInfo("America/New_York"),
        "MD": ZoneInfo("America/New_York"),
        "VA": ZoneInfo("America/New_York"),
        "WV": ZoneInfo("America/New_York"),
        "OH": ZoneInfo("America/New_York"),
        "MI": ZoneInfo("America/New_York"),
        "IN": ZoneInfo("America/Indiana/Indianapolis"),
        "KY": ZoneInfo("America/Kentucky/Louisville"),
        "TN": ZoneInfo("America/Chicago"),
        "NC": ZoneInfo("America/New_York"),
        "SC": ZoneInfo("America/New_York"),
        "GA": ZoneInfo("America/New_York"),
        "FL": ZoneInfo("America/New_York"),
        # Central Time
        "AL": ZoneInfo("America/Chicago"),
        "AR": ZoneInfo("America/Chicago"),
        "IA": ZoneInfo("America/Chicago"),
        "IL": ZoneInfo("America/Chicago"),
        "LA": ZoneInfo("America/Chicago"),
        "MN": ZoneInfo("America/Chicago"),
        "MO": ZoneInfo("America/Chicago"),
        "MS": ZoneInfo("America/Chicago"),
        "OK": ZoneInfo("America/Chicago"),
        "TX": ZoneInfo("America/Chicago"),
        "WI": ZoneInfo("America/Chicago"),
        # Mountain Time
        "CO": ZoneInfo("America/Denver"),
        "ID": ZoneInfo("America/Boise"),
        "KS": ZoneInfo("America/Denver"),
        "MT": ZoneInfo("America/Denver"),
        "NE": ZoneInfo("America/Denver"),
        "NM": ZoneInfo("America/Denver"),
        "ND": ZoneInfo("America/Denver"),
        "SD": ZoneInfo("America/Denver"),
        "UT": ZoneInfo("America/Denver"),
        "WY": ZoneInfo("America/Denver"),
        # Pacific Time
        "AZ": ZoneInfo("America/Phoenix"),
        "CA": ZoneInfo("America/Los_Angeles"),
        "NV": ZoneInfo("America/Los_Angeles"),
        "OR": ZoneInfo("America/Los_Angeles"),
        "WA": ZoneInfo("America/Los_Angeles"),
        # Alaska & Hawaii
        "AK": ZoneInfo("America/Anchorage"),
        "HI": ZoneInfo("Pacific/Honolulu"),
    }
    
    state_upper = state.upper()
    return state_to_tz.get(state_upper, ZoneInfo("UTC"))


def _duration_hours(start: datetime, end: datetime) -> Decimal:
    s = start.replace(tzinfo=None) if start.tzinfo else start
    e = end.replace(tzinfo=None) if end.tzinfo else end
    duration = e - s
    return Decimal(str(round(duration.total_seconds() / 3600, 4)))


# ── Schemas ───────────────────────────────────────────────────────────────

class ClockInRequest(BaseModel):
    latitude: float
    longitude: float


class ClockOutRequest(BaseModel):
    latitude: float
    longitude: float


class ShiftUpdateRequest(BaseModel):
    clock_in: datetime | None = None
    clock_out: datetime | None = None


class CloseEventRequest(BaseModel):
    end_time: str  # HH:MM


class ShiftClockInUpdate(BaseModel):
    clock_in: datetime


class ShiftOut(BaseModel):
    id: int
    assignment_id: int
    clock_in: datetime | None
    clock_in_lat: Decimal | None
    clock_in_lng: Decimal | None
    clock_out: datetime | None
    clock_out_lat: Decimal | None
    clock_out_lng: Decimal | None
    is_paused: bool
    pause_start: datetime | None
    total_pause_minutes: Decimal
    hours_worked: Decimal | None
    hourly_rate_snapshot: Decimal
    regular_pay: Decimal | None
    overtime_pay: Decimal
    total_pay: Decimal | None

    model_config = {"from_attributes": True}


# ── Helpers ───────────────────────────────────────────────────────────────

async def _get_assignment(assignment_id: int, user_id: int, company_id: int, db: AsyncSession) -> EventAssignment:
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    if assignment.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta asignación")
    if assignment.status != "approved":
        raise HTTPException(status_code=400, detail="La asignación no está aprobada")
    return assignment


async def _get_company_config(company_id: int, db: AsyncSession) -> WeeklyHoursConfig | None:
    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    return result.scalar_one_or_none()


async def _get_weekly_hours(user_id: int, company_id: int, event_date, db: AsyncSession) -> tuple[Decimal, Decimal, Decimal]:
    """Retorna (weekly_hours_limit, hours_worked_this_week, min_shift_hours)."""
    config = await _get_company_config(company_id, db)
    limit = config.weekly_hours_limit if config else Decimal("40.00")
    min_shift = config.min_shift_hours if config else Decimal("0.00")

    week_start_day = config.week_start_day if config else "monday"
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    start_offset = days.index(week_start_day)
    event_weekday = event_date.weekday()
    days_since_start = (event_weekday - start_offset) % 7
    week_start = event_date - timedelta(days=days_since_start)
    week_end = week_start + timedelta(days=6)

    result = await db.execute(
        select(func.coalesce(func.sum(Shift.hours_worked), 0))
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .join(Event, EventAssignment.event_id == Event.id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            Event.event_date >= week_start,
            Event.event_date <= week_end,
            Shift.hours_worked.isnot(None),
        )
    )
    hours_this_week = Decimal(str(result.scalar() or 0))
    return limit, hours_this_week, min_shift


async def _check_all_finished(event_id: int, db: AsyncSession) -> bool:
    approved_result = await db.execute(
        select(func.count(EventAssignment.id)).where(
            EventAssignment.event_id == event_id,
            EventAssignment.status == "approved",
        )
    )
    total_approved = approved_result.scalar() or 0
    if total_approved == 0:
        return False

    completed_result = await db.execute(
        select(func.count(Shift.id))
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .where(
            EventAssignment.event_id == event_id,
            Shift.clock_out.isnot(None),
        )
    )
    total_completed = completed_result.scalar() or 0
    return total_completed >= total_approved


# ── Endpoints del empleado ────────────────────────────────────────────────

@router.post("/{assignment_id}/clock-in", response_model=ShiftOut, status_code=status.HTTP_201_CREATED)
async def clock_in(
    assignment_id: int,
    body: ClockInRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timedelta
    
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    assignment = await _get_assignment(assignment_id, user_id, company_id, db)

    existing = await db.execute(select(Shift).where(Shift.assignment_id == assignment_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya registraste el inicio de turno")

    event = await db.get(Event, assignment.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Verificar si el empleado puede iniciar el turno basado en minutos_antes_para_iniciar_turno
    company = await db.get(Company, company_id)
    if company and company.shift_start_minutes_before:
        try:
            event_start = datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M")
            minutes_before = company.shift_start_minutes_before
            earliest_clock_in = event_start - timedelta(minutes=minutes_before)
            now = datetime.utcnow()
            
            if now < earliest_clock_in:
                minutes_remaining = int((earliest_clock_in - now).total_seconds() / 60)
                raise HTTPException(
                    status_code=400,
                    detail=f"Aún no puedes iniciar el turno. Disponible en {minutes_remaining} minutos (a las {earliest_clock_in.strftime('%H:%M')})"
                )
        except ValueError:
            # Si hay error en parsing, continuar
            pass

    # Check if geolocation is enabled for this company
    from app.models import WeeklyHoursConfig
    geo_config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == assignment.company_id)
    )
    geo_config = geo_config_result.scalar_one_or_none()
    geolocation_enabled = geo_config.geolocation_enabled if geo_config else True

    if geolocation_enabled and event.latitude and event.longitude and body.latitude != 0 and body.longitude != 0:
        within, distance = is_within_radius(
            body.latitude, body.longitude,
            float(event.latitude), float(event.longitude),
            settings.MAX_DISTANCE_METERS,
        )
        if not within:
            raise HTTPException(
                status_code=400,
                detail=f"Estás a {distance:.0f}m del evento. Debes estar a menos de {settings.MAX_DISTANCE_METERS}m para iniciar el turno."
            )

    role = await db.get(JobRole, assignment.job_role_id)
    now = _now_naive()

    # Obtener EventJobRole para verificar si existe override de tarifa
    event_job_role_result = await db.execute(
        select(EventJobRole).where(
            EventJobRole.event_id == event.id,
            EventJobRole.job_role_id == assignment.job_role_id
        )
    )
    event_job_role = event_job_role_result.scalars().first()
    
    # Jerarquía de tarifas:
    # 1. Override por evento (event_job_role.hourly_rate_override)
    # 2. Override por empleado (employee_job_role.hourly_rate_override)
    # 3. Tarifa base del rol (role.hourly_rate)
    hourly_rate = role.hourly_rate  # default

    # Check employee-level override
    from app.models import EmployeeJobRole
    emp_role_result = await db.execute(
        select(EmployeeJobRole).where(
            EmployeeJobRole.user_id == assignment.user_id,
            EmployeeJobRole.company_id == assignment.company_id,
            EmployeeJobRole.job_role_id == assignment.job_role_id,
        )
    )
    emp_role = emp_role_result.scalars().first()
    if emp_role and emp_role.hourly_rate_override:
        hourly_rate = emp_role.hourly_rate_override

    # Event-level override takes highest priority
    if event_job_role and event_job_role.hourly_rate_override:
        hourly_rate = event_job_role.hourly_rate_override

    shift = Shift(
        assignment_id=assignment_id,
        clock_in=now,
        clock_in_lat=Decimal(str(body.latitude)),
        clock_in_lng=Decimal(str(body.longitude)),
        hourly_rate_snapshot=hourly_rate,
        overtime_pay=Decimal("0.00"),
        is_paused=False,
        total_pause_minutes=Decimal("0"),
    )
    db.add(shift)
    await db.flush()
    await db.refresh(shift)

    if event.status in ("published", "filled", "filled_pending"):
        event.status = "started"
        await db.flush()

    return shift


@router.post("/{assignment_id}/pause", response_model=ShiftOut)
async def pause_shift(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Empleado pausa su turno (inicio de break)."""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    await _get_assignment(assignment_id, user_id, company_id, db)

    result = await db.execute(select(Shift).where(Shift.assignment_id == assignment_id))
    shift = result.scalar_one_or_none()
    if not shift or not shift.clock_in:
        raise HTTPException(status_code=400, detail="Debes iniciar el turno primero")
    if shift.clock_out:
        raise HTTPException(status_code=400, detail="El turno ya fue finalizado")
    if shift.is_paused:
        raise HTTPException(status_code=400, detail="El turno ya está pausado")

    shift.is_paused = True
    shift.pause_start = _now_naive()
    await db.flush()
    return shift


@router.post("/{assignment_id}/resume", response_model=ShiftOut)
async def resume_shift(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Empleado reanuda su turno (fin de break)."""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    await _get_assignment(assignment_id, user_id, company_id, db)

    result = await db.execute(select(Shift).where(Shift.assignment_id == assignment_id))
    shift = result.scalar_one_or_none()
    if not shift or not shift.clock_in:
        raise HTTPException(status_code=400, detail="Debes iniciar el turno primero")
    if not shift.is_paused:
        raise HTTPException(status_code=400, detail="El turno no está pausado")

    now = _now_naive()
    pause_start = shift.pause_start.replace(tzinfo=None) if shift.pause_start.tzinfo else shift.pause_start
    pause_minutes = Decimal(str(round((now - pause_start).total_seconds() / 60, 2)))
    shift.total_pause_minutes = (shift.total_pause_minutes or Decimal("0")) + pause_minutes
    shift.is_paused = False
    shift.pause_start = None
    await db.flush()
    return shift


@router.post("/{assignment_id}/clock-out", response_model=ShiftOut)
async def clock_out(
    assignment_id: int,
    body: ClockOutRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    assignment = await _get_assignment(assignment_id, user_id, company_id, db)

    result = await db.execute(select(Shift).where(Shift.assignment_id == assignment_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=400, detail="Debes registrar el inicio de turno primero")
    if shift.clock_out:
        raise HTTPException(status_code=400, detail="Ya registraste el fin de turno")

    # Si está pausado, cerrar la pausa automáticamente
    if shift.is_paused and shift.pause_start:
        now_temp = _now_naive()
        pause_start = shift.pause_start.replace(tzinfo=None) if shift.pause_start.tzinfo else shift.pause_start
        extra_pause = Decimal(str(round((now_temp - pause_start).total_seconds() / 60, 2)))
        shift.total_pause_minutes = (shift.total_pause_minutes or Decimal("0")) + extra_pause
        shift.is_paused = False
        shift.pause_start = None

    event = await db.get(Event, assignment.event_id)
    if event and event.latitude and event.longitude and body.latitude != 0 and body.longitude != 0:
        within, distance = is_within_radius(
            body.latitude, body.longitude,
            float(event.latitude), float(event.longitude),
            settings.MAX_DISTANCE_METERS,
        )
        if not within:
            raise HTTPException(
                status_code=400,
                detail=f"Estás a {distance:.0f}m del evento. Debes estar a menos de {settings.MAX_DISTANCE_METERS}m para finalizar el turno."
            )

    now = _now_naive()
    # Calcular horas brutas (clock_in → clock_out)
    gross_hours = _duration_hours(shift.clock_in, now)
    # Descontar pausas
    pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
    hours_worked = max(Decimal("0"), gross_hours - pause_hours)

    # Obtener configuración de la empresa
    config = await _get_company_config(company_id, db)
    min_shift = config.min_shift_hours if config else Decimal("0.00")
    
    # Aplicar mínimo de horas si es necesario
    if hours_worked < min_shift:
        hours_worked = min_shift

    # Obtener límite semanal para calcular overtime
    if event:
        limit, hours_this_week, _ = await _get_weekly_hours(user_id, company_id, event.event_date, db)
    else:
        # Si no hay evento, usar valores por defecto
        limit = Decimal("40.00")
        hours_this_week = Decimal("0.00")
    
    # Calcular pago con overtime
    pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)

    shift.clock_out = now
    shift.clock_out_lat = Decimal(str(body.latitude))
    shift.clock_out_lng = Decimal(str(body.longitude))
    shift.hours_worked = pay.hours_billed   # guardamos las horas a cobrar (puede incluir mínimo)
    shift.regular_pay = pay.regular_pay
    shift.overtime_pay = pay.overtime_pay
    shift.total_pay = pay.total_pay

    await db.flush()

    if event and event.status == "started":
        all_done = await _check_all_finished(assignment.event_id, db)
        if all_done:
            event.status = "finished"
            await db.flush()

    return shift


@router.get("/{assignment_id}/my-shift", response_model=ShiftOut | None)
async def get_my_shift(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        return None
    result = await db.execute(select(Shift).where(Shift.assignment_id == assignment_id))
    return result.scalar_one_or_none()


# ── Endpoints admin/coord ─────────────────────────────────────────────────

@router.patch("/{shift_id}", response_model=ShiftOut)
async def update_shift(
    shift_id: int,
    body: ShiftUpdateRequest,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    modifier_id = int(current_user["sub"])

    shift = await db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    assignment = await db.get(EventAssignment, shift.assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a este turno")

    if body.clock_in:
        shift.clock_in = body.clock_in.replace(tzinfo=None)
    if body.clock_out:
        shift.clock_out = body.clock_out.replace(tzinfo=None)

    if shift.clock_in and shift.clock_out:
        if shift.clock_out <= shift.clock_in:
            raise HTTPException(status_code=400, detail="La hora de fin debe ser posterior al inicio")
        gross_hours = _duration_hours(shift.clock_in, shift.clock_out)
        pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
        hours_worked = max(Decimal("0"), gross_hours - pause_hours)
        event = await db.get(Event, assignment.event_id)
        limit, hours_this_week, min_shift = await _get_weekly_hours(
            assignment.user_id, company_id, event.event_date, db
        )
        pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)
        shift.hours_worked = pay.hours_billed
        shift.regular_pay = pay.regular_pay
        shift.overtime_pay = pay.overtime_pay
        shift.total_pay = pay.total_pay

    shift.modified_by = modifier_id
    await db.flush()
    return shift


@router.patch("/{shift_id}/clock-in", response_model=ShiftOut)
async def update_shift_clock_in(
    shift_id: int,
    body: ShiftClockInUpdate,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Admin/coord modifican la hora de entrada (solo en evento finalizado)."""
    company_id = current_user["company_id"]
    modifier_id = int(current_user["sub"])

    shift = await db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    assignment = await db.get(EventAssignment, shift.assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a este turno")

    event = await db.get(Event, assignment.event_id)
    if not event or event.status != "finished":
        raise HTTPException(status_code=400, detail="Solo se puede modificar la hora de entrada cuando el evento está finalizado")

    new_clock_in = body.clock_in.replace(tzinfo=None)
    if shift.clock_out and new_clock_in >= shift.clock_out.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="La hora de entrada debe ser anterior a la hora de salida")

    shift.clock_in = new_clock_in
    shift.modified_by = modifier_id

    if shift.clock_out:
        gross_hours = _duration_hours(shift.clock_in, shift.clock_out)
        pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
        hours_worked = max(Decimal("0"), gross_hours - pause_hours)
        limit, hours_this_week, min_shift = await _get_weekly_hours(
            assignment.user_id, company_id, event.event_date, db
        )
        pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)
        shift.hours_worked = pay.hours_billed
        shift.regular_pay = pay.regular_pay
        shift.overtime_pay = pay.overtime_pay
        shift.total_pay = pay.total_pay

    await db.flush()
    return shift


@router.post("/events/{event_id}/close", response_model=list[ShiftOut])
async def close_event_shifts(
    event_id: int,
    body: CloseEventRequest,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Cierre masivo: aplica hora de fin a TODOS los empleados y cambia evento a finished."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status not in ("started", "finished"):
        raise HTTPException(status_code=400, detail="El evento debe estar iniciado para cerrarlo")

    try:
        h, m = map(int, body.end_time.split(':'))
        close_naive = datetime(
            event.event_date.year, event.event_date.month, event.event_date.day,
            h, m, 0
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Formato de hora inválido. Use HH:MM")

    result = await db.execute(
        select(Shift)
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .where(EventAssignment.event_id == event_id, Shift.clock_in.isnot(None))
    )
    shifts = result.scalars().all()
    updated = []

    for shift in shifts:
        assignment = await db.get(EventAssignment, shift.assignment_id)
        clock_in_naive = shift.clock_in.replace(tzinfo=None) if shift.clock_in.tzinfo else shift.clock_in

        # Validación defensiva: si hourly_rate_snapshot es None, obtener del rol
        if shift.hourly_rate_snapshot is None:
            role = await db.get(JobRole, assignment.job_role_id)
            if not role or not role.hourly_rate:
                raise HTTPException(
                    status_code=400,
                    detail=f"El empleado {assignment.user_id} no tiene tarifa horaria configurada"
                )
            shift.hourly_rate_snapshot = role.hourly_rate

        # Lógica de detección de medianoche:
        # Convertir clock_in de UTC a la zona horaria local del evento
        # Luego comparar SOLO las horas (ignorando zona horaria)
        # Regla:
        # - Si hora_inicio < hora_fin → mismo día
        # - Si hora_inicio > hora_fin → día siguiente
        
        # Obtener la zona horaria del evento basada en el estado
        tz = _get_timezone_from_state(event.state)
        
        # Convertir clock_in de UTC a la zona horaria local
        clock_in_utc = clock_in_naive.replace(tzinfo=ZoneInfo("UTC"))
        clock_in_local = clock_in_utc.astimezone(tz)
        
        # Extraer horas en la zona horaria local
        clock_in_hour = clock_in_local.hour
        clock_in_minute = clock_in_local.minute
        close_hour = int(body.end_time.split(':')[0])
        close_minute = int(body.end_time.split(':')[1])
        
        # Crear close_adj con la fecha del clock_in (local) y la hora ingresada
        close_adj_local = datetime(
            clock_in_local.year, clock_in_local.month, clock_in_local.day,
            close_hour, close_minute, 0
        )
        
        # Si hora_inicio > hora_fin, significa que cruzó medianoche
        if clock_in_hour > close_hour or (clock_in_hour == close_hour and clock_in_minute > close_minute):
            # close_time es del día siguiente
            close_adj_local = close_adj_local + timedelta(days=1)
        
        # Convertir close_adj de vuelta a UTC para almacenar en la BD
        # Usar localize para asignar correctamente la zona horaria
        close_adj_local_tz = close_adj_local.replace(tzinfo=tz)
        close_adj_utc = close_adj_local_tz.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)

        # Cerrar pausa activa si existe
        if shift.is_paused and shift.pause_start:
            ps = shift.pause_start.replace(tzinfo=None) if shift.pause_start.tzinfo else shift.pause_start
            extra = Decimal(str(round((close_adj_utc - ps).total_seconds() / 60, 2)))
            shift.total_pause_minutes = (shift.total_pause_minutes or Decimal("0")) + max(Decimal("0"), extra)
            shift.is_paused = False
            shift.pause_start = None

        gross_hours = _duration_hours(clock_in_naive, close_adj_utc)
        pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
        hours_worked = max(Decimal("0"), gross_hours - pause_hours)

        limit, hours_this_week, min_shift = await _get_weekly_hours(
            assignment.user_id, company_id, event.event_date, db
        )
        pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)
        shift.clock_out = close_adj_utc
        shift.hours_worked = pay.hours_billed
        shift.regular_pay = pay.regular_pay
        shift.overtime_pay = pay.overtime_pay
        shift.total_pay = pay.total_pay
        updated.append(shift)

    from datetime import time as time_type
    event.end_time = time_type(h, m, 0)
    event.status = "finished"
    await db.flush()
    return updated


# ── Vista de turnos del evento para admin/coord ───────────────────────────

class EventShiftOut(BaseModel):
    shift_id: int
    assignment_id: int
    user_id: int
    user_name: str
    job_role_name: str
    clock_in: datetime
    clock_out: datetime | None
    is_paused: bool
    total_pause_minutes: Decimal
    hours_worked: Decimal | None
    hourly_rate_snapshot: Decimal
    total_pay: Decimal | None


@router.get("/events/{event_id}/active", response_model=list[EventShiftOut])
async def get_event_active_shifts(
    event_id: int,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    from app.models import User
    company_id = current_user["company_id"]

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    result = await db.execute(
        select(Shift, EventAssignment, User, JobRole)
        .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
        .join(User, User.id == EventAssignment.user_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(EventAssignment.event_id == event_id)
        .order_by(Shift.clock_in)
    )
    rows = result.all()

    return [
        EventShiftOut(
            shift_id=shift.id,
            assignment_id=shift.assignment_id,
            user_id=user.id,
            user_name=user.name,
            job_role_name=role.name,
            clock_in=shift.clock_in,
            clock_out=shift.clock_out,
            is_paused=shift.is_paused,
            total_pause_minutes=shift.total_pause_minutes or Decimal("0"),
            hours_worked=shift.hours_worked,
            hourly_rate_snapshot=shift.hourly_rate_snapshot,
            total_pay=shift.total_pay,
        )
        for shift, assignment, user, role in rows
    ]


# ── Bulk clock-in by admin/coordinator ─────────────────────────────────────

class BulkClockInRequest(BaseModel):
    event_id: int
    clock_in_time: str  # HH:MM format


@router.post("/bulk-clock-in", status_code=200)
async def bulk_clock_in(
    body: BulkClockInRequest,
    current_user: Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))],
    db: AsyncSession = Depends(get_db),
):
    """Admin/coordinator registers clock-in for all approved employees of an event.
    Only works if admin_can_clock_in_all is enabled in company config."""
    from app.models import WeeklyHoursConfig
    from datetime import datetime as dt_class

    company_id = current_user["company_id"]

    # Check config
    config_result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = config_result.scalar_one_or_none()
    if not config or not config.admin_can_clock_in_all:
        raise HTTPException(status_code=403, detail="La funcionalidad de registro masivo de hora inicio no está habilitada para esta empresa")

    event = await db.get(Event, body.event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Parse the clock-in time
    try:
        clock_in_time = dt_class.strptime(body.clock_in_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de hora inválido. Use HH:MM")

    # Combine event date + provided time
    clock_in_dt = dt_class.combine(event.event_date, clock_in_time)

    # Get all approved assignments without existing shifts
    assignments_result = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == body.event_id,
            EventAssignment.status == "approved",
        )
    )
    assignments = assignments_result.scalars().all()

    created = 0
    skipped = 0
    for assignment in assignments:
        # Check if shift already exists
        existing_shift = await db.execute(
            select(Shift).where(Shift.assignment_id == assignment.id)
        )
        if existing_shift.scalar_one_or_none():
            skipped += 1
            continue

        # Get hourly rate
        role = await db.get(JobRole, assignment.job_role_id)
        ejr = None
        if assignment.event_job_role_id:
            ejr = await db.get(EventJobRole, assignment.event_job_role_id)
        if not ejr:
            ejr_q = await db.execute(
                select(EventJobRole).where(EventJobRole.event_id == body.event_id, EventJobRole.job_role_id == assignment.job_role_id)
            )
            ejr = ejr_q.scalars().first()

        # Rate hierarchy: event override > employee override > role base
        hourly_rate = role.hourly_rate if role else Decimal("0")
        if ejr and ejr.hourly_rate_override:
            hourly_rate = ejr.hourly_rate_override
        else:
            from app.models import EmployeeJobRole
            emp_role_result = await db.execute(
                select(EmployeeJobRole).where(
                    EmployeeJobRole.user_id == assignment.user_id,
                    EmployeeJobRole.company_id == company_id,
                    EmployeeJobRole.job_role_id == assignment.job_role_id,
                )
            )
            emp_role = emp_role_result.scalars().first()
            if emp_role and emp_role.hourly_rate_override:
                hourly_rate = emp_role.hourly_rate_override

        shift = Shift(
            assignment_id=assignment.id,
            clock_in=clock_in_dt,
            clock_in_lat=Decimal("0"),
            clock_in_lng=Decimal("0"),
            hourly_rate_snapshot=hourly_rate,
            overtime_pay=Decimal("0.00"),
            is_paused=False,
            total_pause_minutes=Decimal("0"),
        )
        db.add(shift)
        created += 1

    await db.flush()

    # Update event status to started if not already
    if event.status in ("published", "filled", "filled_pending"):
        event.status = "started"
        await db.flush()

    return {"created": created, "skipped": skipped, "message": f"Turno iniciado para {created} empleado(s)"}
