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

    # El cierre del turno por el empleado NO finaliza el evento. La finalización
    # es una acción explícita del admin/coordinador desde el cierre de evento,
    # que valida que todos los turnos estén cerrados.

    return shift


class ShiftClockOutUpdate(BaseModel):
    clock_out: datetime


@router.patch("/{shift_id}/clock-out", response_model=ShiftOut)
async def update_shift_clock_out(
    shift_id: int,
    body: ShiftClockOutUpdate,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Admin/coord modify clock-out time for a shift in started/finished events."""
    company_id = current_user["company_id"]
    modifier_id = int(current_user["sub"])

    shift = await db.get(Shift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    assignment = await db.get(EventAssignment, shift.assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=403, detail="Sin acceso a este turno")

    event = await db.get(Event, assignment.event_id)
    if not event or event.status not in ("started", "finished"):
        raise HTTPException(status_code=400, detail="Solo se puede modificar la hora de salida cuando el evento está iniciado o finalizado")

    new_clock_out = body.clock_out.replace(tzinfo=None)
    if shift.clock_in and new_clock_out <= shift.clock_in.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="La hora de salida debe ser posterior a la hora de entrada")

    shift.clock_out = new_clock_out
    shift.modified_by = modifier_id

    # Recalculate pay
    if shift.clock_in:
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
    if not event or event.status not in ("started", "finished"):
        raise HTTPException(status_code=400, detail="Solo se puede modificar la hora de entrada cuando el evento está iniciado o finalizado")

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


# ════════════════════════════════════════════════════════════════════════════
# ── Cierre de evento por turnos (admin/coordinador) ─────────────────────────
# ════════════════════════════════════════════════════════════════════════════
# Un "turno" se deriva del start_time del EventJobRole asociado a cada
# asignación (fallback: start_time del evento). Los empleados con el mismo
# start_time pertenecen al mismo turno.

from datetime import date as date_type


def _parse_hhmm(value: str) -> tuple[int, int]:
    try:
        parts = value.strip().split(":")
        h = int(parts[0])
        m = int(parts[1])
        if h < 0 or h > 23 or m < 0 or m > 59:
            raise ValueError
        return h, m
    except Exception:
        raise HTTPException(status_code=400, detail=f"Formato de hora inválido: '{value}'. Use HH:MM")


def _utc_to_local(dt_utc: datetime, tz: ZoneInfo) -> datetime:
    naive = dt_utc.replace(tzinfo=None) if dt_utc.tzinfo else dt_utc
    return naive.replace(tzinfo=ZoneInfo("UTC")).astimezone(tz)


def _local_to_utc_naive(dt_local: datetime, tz: ZoneInfo) -> datetime:
    return dt_local.replace(tzinfo=tz).astimezone(ZoneInfo("UTC")).replace(tzinfo=None)


def _clock_out_from_hhmm(clock_in: datetime, hhmm: str, tz: ZoneInfo) -> datetime:
    """Construye el clock_out (UTC naive) a partir de HH:MM en hora local del
    evento.

    Regla: el clock_out es la PRÓXIMA vez que ocurre esa hora de pared a partir
    del clock_in (estrictamente después). Premisa del negocio: ningún turno
    dura más de 24h, por lo que la próxima ocurrencia es siempre la correcta.
      - entrada 23:00, salida 01:00 → +1 día (cruza medianoche)
      - entrada 05:00, salida 07:00 → mismo día
      - entrada 23:00, salida 23:30 → mismo día (30 min después)
      - entrada 23:00, salida 23:00 → +1 día (turno de 24h exactas)
    """
    h, m = _parse_hhmm(hhmm)
    clock_in_local = _utc_to_local(clock_in, tz)
    out_local = datetime(clock_in_local.year, clock_in_local.month, clock_in_local.day, h, m, 0)
    # Si la hora de salida cae en o antes del instante de entrada, es del día siguiente.
    if out_local <= clock_in_local.replace(tzinfo=None):
        out_local = out_local + timedelta(days=1)
    return _local_to_utc_naive(out_local, tz)


def _clock_in_from_hhmm(event: Event, hhmm: str, tz: ZoneInfo) -> datetime:
    """Construye el clock_in (UTC naive) combinando la fecha del evento con
    HH:MM en hora local del evento."""
    h, m = _parse_hhmm(hhmm)
    in_local = datetime(event.event_date.year, event.event_date.month, event.event_date.day, h, m, 0)
    return _local_to_utc_naive(in_local, tz)


async def _resolve_turno_start(assignment: EventAssignment, event: Event, db: AsyncSession):
    """start_time del turno al que pertenece la asignación."""
    ejr = None
    if assignment.event_job_role_id:
        ejr = await db.get(EventJobRole, assignment.event_job_role_id)
    if not ejr:
        q = await db.execute(
            select(EventJobRole).where(
                EventJobRole.event_id == event.id,
                EventJobRole.job_role_id == assignment.job_role_id,
            )
        )
        ejr = q.scalars().first()
    if ejr and ejr.start_time:
        return ejr.start_time
    return event.start_time


async def _resolve_hourly_rate(assignment: EventAssignment, company_id: int, db: AsyncSession) -> Decimal:
    """Jerarquía de tarifa: override del evento > override del empleado > base del rol.
    (Misma lógica que bulk_clock_in.)"""
    from app.models import EmployeeJobRole
    role = await db.get(JobRole, assignment.job_role_id)
    hourly_rate = role.hourly_rate if role and role.hourly_rate else Decimal("0")
    ejr = None
    if assignment.event_job_role_id:
        ejr = await db.get(EventJobRole, assignment.event_job_role_id)
    if not ejr:
        q = await db.execute(
            select(EventJobRole).where(
                EventJobRole.event_id == assignment.event_id,
                EventJobRole.job_role_id == assignment.job_role_id,
            )
        )
        ejr = q.scalars().first()
    if ejr and ejr.hourly_rate_override:
        return ejr.hourly_rate_override
    emp_q = await db.execute(
        select(EmployeeJobRole).where(
            EmployeeJobRole.user_id == assignment.user_id,
            EmployeeJobRole.company_id == company_id,
            EmployeeJobRole.job_role_id == assignment.job_role_id,
        )
    )
    emp_role = emp_q.scalars().first()
    if emp_role and emp_role.hourly_rate_override:
        return emp_role.hourly_rate_override
    return hourly_rate


async def _recalc_pay(shift: Shift, assignment: EventAssignment, event: Event, company_id: int, db: AsyncSession) -> None:
    """Recalcula horas y pago (con overtime) de un shift. Si falta entrada o
    salida, limpia los campos calculados."""
    if not shift.clock_in or not shift.clock_out:
        shift.hours_worked = None
        shift.regular_pay = None
        shift.overtime_pay = Decimal("0.00")
        shift.total_pay = None
        return
    clock_in_naive = shift.clock_in.replace(tzinfo=None) if shift.clock_in.tzinfo else shift.clock_in
    clock_out_naive = shift.clock_out.replace(tzinfo=None) if shift.clock_out.tzinfo else shift.clock_out
    gross_hours = _duration_hours(clock_in_naive, clock_out_naive)
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


async def _get_closing_targets(event: Event, db: AsyncSession):
    """Todas las asignaciones aprobadas del evento con su shift (si existe),
    usuario, rol y turno. Incluye empleados SIN clock_in (shift = None)."""
    from app.models import User
    result = await db.execute(
        select(EventAssignment, User, JobRole)
        .join(User, User.id == EventAssignment.user_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(
            EventAssignment.event_id == event.id,
            EventAssignment.status == "approved",
        )
        .order_by(User.name)
    )
    rows = result.all()
    targets = []
    for assignment, user, role in rows:
        sq = await db.execute(select(Shift).where(Shift.assignment_id == assignment.id))
        shift = sq.scalar_one_or_none()
        turno = await _resolve_turno_start(assignment, event, db)
        targets.append({
            "assignment": assignment,
            "user": user,
            "role": role,
            "shift": shift,
            "turno": turno,
        })
    return targets


# ── Schemas de cierre ──────────────────────────────────────────────────────

class ClosingEmployeeOut(BaseModel):
    assignment_id: int
    shift_id: int | None
    user_id: int
    user_name: str
    job_role_name: str
    turno_start: str                       # HH:MM
    clock_in: datetime | None
    clock_out: datetime | None
    is_paused: bool
    total_pause_minutes: Decimal
    hours_worked: Decimal | None
    hourly_rate_snapshot: Decimal | None
    total_pay: Decimal | None


class ClosingTurnoOut(BaseModel):
    turno_start: str                       # HH:MM
    total: int
    sin_entrada: int
    sin_salida: int
    employees: list[ClosingEmployeeOut]


class ClosingSummaryOut(BaseModel):
    event_id: int
    event_name: str
    event_date: date_type
    event_status: str
    turnos: list[ClosingTurnoOut]
    total_employees: int
    total_sin_entrada: int
    total_sin_salida: int
    ready_to_finish: bool


class ClosingOperation(BaseModel):
    action: str                            # set_clock_in | set_clock_out | adjust_hours
    scope: str                             # event | turno | targets
    turno_start: str | None = None         # HH:MM (requerido si scope=turno)
    shift_ids: list[int] | None = None     # scope=targets
    assignment_ids: list[int] | None = None  # scope=targets (empleados sin shift)
    time: str | None = None                # HH:MM (set_clock_in / set_clock_out)
    delta_hours: Decimal | None = None     # adjust_hours (+/-)


class ClosingBulkRequest(BaseModel):
    operations: list[ClosingOperation]


class ClosingOperationResult(BaseModel):
    action: str
    scope: str
    detail: str
    affected: int
    skipped: int
    employees: list[str]
    notes: list[str]


class ClosingBulkResponse(BaseModel):
    results: list[ClosingOperationResult]
    total_employees: int
    total_sin_entrada: int
    total_sin_salida: int
    ready_to_finish: bool


def _closing_counters(targets) -> tuple[int, int, int]:
    total = len(targets)
    sin_entrada = sum(1 for t in targets if not t["shift"] or not t["shift"].clock_in)
    sin_salida = sum(1 for t in targets if not t["shift"] or not t["shift"].clock_out)
    return total, sin_entrada, sin_salida


# ── GET resumen de cierre ──────────────────────────────────────────────────

@router.get("/events/{event_id}/closing-summary", response_model=ClosingSummaryOut)
async def get_event_closing_summary(
    event_id: int,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Resumen del evento agrupado por turnos para la pantalla de cierre."""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    targets = await _get_closing_targets(event, db)

    turnos_map: dict[str, list] = {}
    for tgt in targets:
        key = tgt["turno"].strftime("%H:%M")
        if key not in turnos_map:
            turnos_map[key] = []
        turnos_map[key].append(tgt)

    turnos_out = []
    for key in sorted(turnos_map.keys()):
        group = turnos_map[key]
        employees = []
        for tgt in group:
            shift = tgt["shift"]
            employees.append(ClosingEmployeeOut(
                assignment_id=tgt["assignment"].id,
                shift_id=shift.id if shift else None,
                user_id=tgt["user"].id,
                user_name=tgt["user"].name,
                job_role_name=tgt["role"].name,
                turno_start=key,
                clock_in=shift.clock_in if shift else None,
                clock_out=shift.clock_out if shift else None,
                is_paused=shift.is_paused if shift else False,
                total_pause_minutes=(shift.total_pause_minutes if shift else Decimal("0")) or Decimal("0"),
                hours_worked=shift.hours_worked if shift else None,
                hourly_rate_snapshot=shift.hourly_rate_snapshot if shift else None,
                total_pay=shift.total_pay if shift else None,
            ))
        g_total, g_sin_in, g_sin_out = _closing_counters(group)
        turnos_out.append(ClosingTurnoOut(
            turno_start=key,
            total=g_total,
            sin_entrada=g_sin_in,
            sin_salida=g_sin_out,
            employees=employees,
        ))

    total, sin_entrada, sin_salida = _closing_counters(targets)
    return ClosingSummaryOut(
        event_id=event.id,
        event_name=event.name,
        event_date=event.event_date,
        event_status=event.status,
        turnos=turnos_out,
        total_employees=total,
        total_sin_entrada=sin_entrada,
        total_sin_salida=sin_salida,
        ready_to_finish=(total > 0 and sin_entrada == 0 and sin_salida == 0),
    )


# ── POST aplicar operaciones de cierre ─────────────────────────────────────

@router.post("/events/{event_id}/bulk-update", response_model=ClosingBulkResponse)
async def bulk_update_event_shifts(
    event_id: int,
    body: ClosingBulkRequest,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Aplica operaciones de cierre sobre los shifts del evento sin cambiar el
    estado del evento. Acciones:
      - set_clock_in: fija hora de entrada (crea el shift si no existe)
      - set_clock_out: fija hora de salida (detecta cruce de medianoche)
      - adjust_hours: suma/resta horas moviendo la hora de salida
    Alcances (scope): event (todos), turno (por turno_start), targets
    (shift_ids y/o assignment_ids específicos).
    Devuelve un resumen de lo aplicado por operación."""
    company_id = current_user["company_id"]
    modifier_id = int(current_user["sub"])

    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.status not in ("started", "finished"):
        raise HTTPException(status_code=400, detail="Solo se pueden ajustar turnos en eventos iniciados o finalizados (un evento liquidado no admite cambios)")
    if not body.operations:
        raise HTTPException(status_code=400, detail="No se recibieron operaciones")

    tz = _get_timezone_from_state(event.state)
    results: list[ClosingOperationResult] = []

    for op in body.operations:
        if op.action not in ("set_clock_in", "set_clock_out", "adjust_hours"):
            raise HTTPException(status_code=400, detail=f"Acción inválida: '{op.action}'")
        if op.scope not in ("event", "turno", "targets"):
            raise HTTPException(status_code=400, detail=f"Alcance inválido: '{op.scope}'")
        if op.action in ("set_clock_in", "set_clock_out") and not op.time:
            raise HTTPException(status_code=400, detail=f"La acción {op.action} requiere el campo 'time' (HH:MM)")
        if op.action == "adjust_hours" and (op.delta_hours is None or op.delta_hours == 0):
            raise HTTPException(status_code=400, detail="La acción adjust_hours requiere 'delta_hours' distinto de 0")

        # Targets se recargan en cada operación para encadenar efectos
        # (ej: set_clock_in seguido de set_clock_out sobre shifts recién creados)
        targets = await _get_closing_targets(event, db)

        if op.scope == "turno":
            if not op.turno_start:
                raise HTTPException(status_code=400, detail="El alcance 'turno' requiere 'turno_start' (HH:MM)")
            th, tm = _parse_hhmm(op.turno_start)
            targets = [t for t in targets if t["turno"].hour == th and t["turno"].minute == tm]
            scope_label = f"turno {op.turno_start}"
        elif op.scope == "targets":
            sids = set(op.shift_ids or [])
            aids = set(op.assignment_ids or [])
            if not sids and not aids:
                raise HTTPException(status_code=400, detail="El alcance 'targets' requiere 'shift_ids' y/o 'assignment_ids'")
            targets = [
                t for t in targets
                if (t["shift"] and t["shift"].id in sids) or t["assignment"].id in aids
            ]
            scope_label = "empleados seleccionados"
        else:
            scope_label = "todo el evento"

        affected = 0
        skipped = 0
        employees: list[str] = []
        notes: list[str] = []

        for tgt in targets:
            assignment = tgt["assignment"]
            shift = tgt["shift"]
            uname = tgt["user"].name

            if op.action == "set_clock_in":
                new_in = _clock_in_from_hhmm(event, op.time, tz)
                if shift is None:
                    rate = await _resolve_hourly_rate(assignment, company_id, db)
                    if not rate or rate <= 0:
                        skipped += 1
                        notes.append(f"{uname}: sin tarifa horaria configurada, omitido")
                        continue
                    shift = Shift(
                        assignment_id=assignment.id,
                        clock_in=new_in,
                        clock_in_lat=Decimal("0"),
                        clock_in_lng=Decimal("0"),
                        hourly_rate_snapshot=rate,
                        overtime_pay=Decimal("0.00"),
                        is_paused=False,
                        total_pause_minutes=Decimal("0"),
                        modified_by=modifier_id,
                    )
                    db.add(shift)
                else:
                    if shift.clock_out:
                        out_naive = shift.clock_out.replace(tzinfo=None) if shift.clock_out.tzinfo else shift.clock_out
                        if new_in >= out_naive:
                            skipped += 1
                            notes.append(f"{uname}: la nueva entrada queda después de su salida, omitido")
                            continue
                    shift.clock_in = new_in
                    shift.modified_by = modifier_id
                await db.flush()
                await _recalc_pay(shift, assignment, event, company_id, db)
                affected += 1
                employees.append(uname)

            elif op.action == "set_clock_out":
                if shift is None or not shift.clock_in:
                    skipped += 1
                    notes.append(f"{uname}: sin hora de entrada, omitido (fije primero la entrada)")
                    continue
                new_out = _clock_out_from_hhmm(shift.clock_in, op.time, tz)
                # Cerrar pausa activa si existe
                if shift.is_paused and shift.pause_start:
                    ps = shift.pause_start.replace(tzinfo=None) if shift.pause_start.tzinfo else shift.pause_start
                    extra = Decimal(str(round((new_out - ps).total_seconds() / 60, 2)))
                    shift.total_pause_minutes = (shift.total_pause_minutes or Decimal("0")) + max(Decimal("0"), extra)
                    shift.is_paused = False
                    shift.pause_start = None
                shift.clock_out = new_out
                shift.modified_by = modifier_id
                await _recalc_pay(shift, assignment, event, company_id, db)
                affected += 1
                employees.append(uname)

            else:  # adjust_hours
                if shift is None or not shift.clock_in or not shift.clock_out:
                    skipped += 1
                    notes.append(f"{uname}: sin cierre registrado, omitido (fije primero la salida)")
                    continue
                out_naive = shift.clock_out.replace(tzinfo=None) if shift.clock_out.tzinfo else shift.clock_out
                in_naive = shift.clock_in.replace(tzinfo=None) if shift.clock_in.tzinfo else shift.clock_in
                # Horas reales actuales (descontando pausas): es el máximo que se puede restar.
                pause_hours = float(shift.total_pause_minutes or 0) / 60
                current_hours = (out_naive - in_naive).total_seconds() / 3600 - pause_hours
                delta = float(op.delta_hours)
                if delta < 0 and abs(delta) > current_hours + 1e-9:
                    skipped += 1
                    notes.append(
                        f"{uname}: no se pueden restar {abs(delta):.1f}h, solo trabajó {current_hours:.2f}h, omitido"
                    )
                    continue
                new_out = out_naive + timedelta(hours=delta)
                if new_out <= in_naive:
                    skipped += 1
                    notes.append(f"{uname}: el ajuste dejaría la salida antes de la entrada, omitido")
                    continue
                shift.clock_out = new_out
                shift.modified_by = modifier_id
                await _recalc_pay(shift, assignment, event, company_id, db)
                affected += 1
                employees.append(uname)

        if op.action == "set_clock_in":
            detail = f"Entrada {op.time} aplicada a {scope_label}"
        elif op.action == "set_clock_out":
            detail = f"Salida {op.time} aplicada a {scope_label}"
        else:
            signo = "+" if op.delta_hours > 0 else ""
            detail = f"Ajuste de {signo}{op.delta_hours}h aplicado a {scope_label}"

        results.append(ClosingOperationResult(
            action=op.action,
            scope=op.scope,
            detail=detail,
            affected=affected,
            skipped=skipped,
            employees=employees,
            notes=notes,
        ))

    await db.flush()

    final_targets = await _get_closing_targets(event, db)
    total, sin_entrada, sin_salida = _closing_counters(final_targets)
    return ClosingBulkResponse(
        results=results,
        total_employees=total,
        total_sin_entrada=sin_entrada,
        total_sin_salida=sin_salida,
        ready_to_finish=(total > 0 and sin_entrada == 0 and sin_salida == 0),
    )