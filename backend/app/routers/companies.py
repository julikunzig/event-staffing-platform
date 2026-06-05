from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from decimal import Decimal
from typing import Annotated
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import Company, WeeklyHoursConfig

router = APIRouter(prefix="/companies", tags=["companies"])
SuperAdminDep = Annotated[dict, Depends(require_role("super_admin"))]
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class CompanyCreate(BaseModel):
    name: str
    slug: str
    contact_email: EmailStr
    contact_phone: str | None = None


class CompanyOut(BaseModel):
    id: int
    name: str
    slug: str
    contact_email: str
    contact_phone: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class CompanyUpdateResponse(BaseModel):
    id: int
    name: str
    email: str | None
    phone: str | None

    model_config = {"from_attributes": True}


class CompanyConfigUpdate(BaseModel):
    weekly_hours_limit: Decimal = Decimal("40.00")
    min_shift_hours: Decimal = Decimal("0.00")
    week_start_day: str = "monday"
    week_end_day: str = "sunday"
    horas_entre_eventos: int = 0


class ShiftStartConfigUpdate(BaseModel):
    shift_start_minutes_before: int  # Minutos antes del evento para iniciar turno (15, 30, 40, 60, etc)


class CompanyConfigOut(BaseModel):
    id: int | None = None
    company_id: int
    weekly_hours_limit: Decimal
    min_shift_hours: Decimal
    week_start_day: str
    week_end_day: str
    shift_start_minutes: int | None = None  # From Company.shift_start_minutes_before
    horas_entre_eventos: int = 0

    model_config = {"from_attributes": True}


@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
async def create_company(body: CompanyCreate, _: SuperAdminDep, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Company).where(Company.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug ya existe")
    company = Company(**body.model_dump())
    db.add(company)
    await db.flush()
    await db.refresh(company)
    return company


@router.get("", response_model=list[CompanyOut])
async def list_companies(_: SuperAdminDep, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company))
    return result.scalars().all()


@router.patch("/{company_id}/activate", response_model=CompanyOut)
async def activate_company(company_id: int, _: SuperAdminDep, db: AsyncSession = Depends(get_db)):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    company.is_active = True
    await db.flush()
    return company


@router.patch("/{company_id}/deactivate", response_model=CompanyOut)
async def deactivate_company(company_id: int, _: SuperAdminDep, db: AsyncSession = Depends(get_db)):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    company.is_active = False
    await db.flush()
    return company


@router.get("/{company_id}", response_model=dict)
async def get_company(company_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Obtiene los datos de una empresa."""
    # Verificar que el usuario pertenece a esta empresa
    if current_user["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return {
        "id": company.id,
        "name": company.name,
        "email": company.contact_email,
        "phone": company.contact_phone,
    }


class CompanyUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None


@router.patch("/{company_id}", response_model=dict)
async def update_company(
    company_id: int,
    body: CompanyUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza los datos de una empresa."""
    # Verificar que el usuario pertenece a esta empresa
    if current_user["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    if body.name is not None:
        company.name = body.name
    if body.email is not None:
        company.contact_email = body.email
    if body.phone is not None:
        company.contact_phone = body.phone
    
    await db.flush()
    await db.refresh(company)
    return {
        "id": company.id,
        "name": company.name,
        "email": company.contact_email,
        "phone": company.contact_phone,
    }


@router.get("/{company_id}/config", response_model=CompanyConfigOut | None)
async def get_company_config(company_id: int, _: SuperAdminDep, db: AsyncSession = Depends(get_db)):
    """Obtiene la configuración de turnos de una empresa."""
    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        # Retornar defaults si no existe
        return CompanyConfigOut(
            company_id=company_id,
            weekly_hours_limit=Decimal("40.00"),
            min_shift_hours=Decimal("0.00"),
            week_start_day="monday",
            week_end_day="sunday",
        )
    return config


@router.get("/current/weekly-config", response_model=dict)
async def get_current_company_weekly_config(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    """Obtiene la configuración semanal de la empresa actual del usuario (accesible para todos los roles)."""
    company_id = current_user.get("company_id")
    if not company_id:
        raise HTTPException(status_code=400, detail="Usuario no tiene empresa asignada")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = result.scalar_one_or_none()
    
    if config:
        return {
            "id": config.id,
            "company_id": config.company_id,
            "weekly_hours_limit": config.weekly_hours_limit,
            "min_shift_hours": config.min_shift_hours,
            "shift_start_minutes": company.shift_start_minutes_before,
            "horas_entre_eventos": config.horas_entre_eventos,
        }
    else:
        # Retornar defaults si no existe
        return {
            "id": None,
            "company_id": company_id,
            "weekly_hours_limit": Decimal("40.00"),
            "min_shift_hours": Decimal("0.00"),
            "shift_start_minutes": company.shift_start_minutes_before,
            "horas_entre_eventos": 0,
        }


@router.get("/{company_id}/weekly-config", response_model=dict)
async def get_company_weekly_config(company_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Alias para get_company_config - obtiene la configuración semanal de una empresa."""
    # Verificar que el usuario pertenece a esta empresa
    if current_user["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = result.scalar_one_or_none()
    
    if config:
        return {
            "id": config.id,
            "company_id": config.company_id,
            "weekly_hours_limit": config.weekly_hours_limit,
            "min_shift_hours": config.min_shift_hours,
            "shift_start_minutes": company.shift_start_minutes_before,
            "horas_entre_eventos": config.horas_entre_eventos,
        }
    else:
        # Retornar defaults si no existe
        return {
            "id": None,
            "company_id": company_id,
            "weekly_hours_limit": Decimal("40.00"),
            "min_shift_hours": Decimal("0.00"),
            "shift_start_minutes": company.shift_start_minutes_before,
            "horas_entre_eventos": 0,
        }


@router.put("/{company_id}/config", response_model=CompanyConfigOut)
async def upsert_company_config(
    company_id: int,
    body: CompanyConfigUpdate,
    _: SuperAdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Crea o actualiza la configuración de turnos de una empresa."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = result.scalar_one_or_none()
    if config:
        config.weekly_hours_limit = body.weekly_hours_limit
        config.min_shift_hours = body.min_shift_hours
        config.week_start_day = body.week_start_day
        config.week_end_day = body.week_end_day
        config.horas_entre_eventos = body.horas_entre_eventos
    else:
        config = WeeklyHoursConfig(
            company_id=company_id,
            weekly_hours_limit=body.weekly_hours_limit,
            min_shift_hours=body.min_shift_hours,
            week_start_day=body.week_start_day,
            week_end_day=body.week_end_day,
            horas_entre_eventos=body.horas_entre_eventos,
        )
        db.add(config)
    await db.flush()
    await db.refresh(config)
    return config


class WeeklyConfigUpdate(BaseModel):
    weekly_hours_limit: int | None = None
    min_shift_hours: int | None = None
    shift_start_minutes: int | None = None
    horas_entre_eventos: int | None = None
    admin_can_clock_in_all: bool | None = None
    days_to_reject_event: int | None = None
    geolocation_enabled: bool | None = None
    overtime_multiplier: float | None = None
    week_start_day: str | None = None
    week_end_day: str | None = None


@router.patch("/{company_id}/weekly-config", response_model=dict)
async def update_weekly_config(
    company_id: int,
    body: WeeklyConfigUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza la configuración semanal de una empresa."""
    # Verificar que el usuario pertenece a esta empresa
    if current_user["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    result = await db.execute(
        select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
    )
    config = result.scalar_one_or_none()
    
    if config:
        if body.weekly_hours_limit is not None:
            config.weekly_hours_limit = Decimal(str(body.weekly_hours_limit))
        if body.min_shift_hours is not None:
            config.min_shift_hours = Decimal(str(body.min_shift_hours))
        if body.horas_entre_eventos is not None:
            config.horas_entre_eventos = body.horas_entre_eventos
        if body.admin_can_clock_in_all is not None:
            config.admin_can_clock_in_all = body.admin_can_clock_in_all
        if body.days_to_reject_event is not None:
            config.days_to_reject_event = body.days_to_reject_event
        if body.geolocation_enabled is not None:
            config.geolocation_enabled = body.geolocation_enabled
        if body.overtime_multiplier is not None:
            config.overtime_multiplier = Decimal(str(body.overtime_multiplier))
        if body.week_start_day is not None:
            config.week_start_day = body.week_start_day
        if body.week_end_day is not None:
            config.week_end_day = body.week_end_day
    else:
        config = WeeklyHoursConfig(
            company_id=company_id,
            weekly_hours_limit=Decimal(str(body.weekly_hours_limit or 40)),
            min_shift_hours=Decimal(str(body.min_shift_hours or 0)),
            week_start_day="monday",
            week_end_day="sunday",
            horas_entre_eventos=body.horas_entre_eventos or 0,
            admin_can_clock_in_all=body.admin_can_clock_in_all or False,
            days_to_reject_event=body.days_to_reject_event or 0,
            geolocation_enabled=body.geolocation_enabled if body.geolocation_enabled is not None else True,
        )
        db.add(config)
    
    # Actualizar shift_start_minutes_before en la empresa si se proporciona
    if body.shift_start_minutes is not None:
        company.shift_start_minutes_before = body.shift_start_minutes
    
    await db.flush()
    await db.refresh(config)
    await db.refresh(company)
    
    return {
        "id": config.id,
        "company_id": config.company_id,
        "weekly_hours_limit": config.weekly_hours_limit,
        "min_shift_hours": config.min_shift_hours,
        "shift_start_minutes": company.shift_start_minutes_before,
        "horas_entre_eventos": config.horas_entre_eventos,
        "admin_can_clock_in_all": config.admin_can_clock_in_all,
        "days_to_reject_event": config.days_to_reject_event,
        "geolocation_enabled": config.geolocation_enabled,
        "overtime_multiplier": float(config.overtime_multiplier),
        "week_start_day": config.week_start_day,
        "week_end_day": config.week_end_day,
    }


@router.patch("/{company_id}/shift-start-config", response_model=CompanyOut)
async def update_shift_start_config(
    company_id: int,
    body: ShiftStartConfigUpdate,
    _: SuperAdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza el tiempo permitido antes del evento para iniciar turno."""
    if body.shift_start_minutes_before < 0:
        raise HTTPException(status_code=400, detail="Los minutos no pueden ser negativos")
    
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    company.shift_start_minutes_before = body.shift_start_minutes_before
    await db.flush()
    await db.refresh(company)
    return company


# TODO: Endpoints de logo comentados temporalmente
# Requieren python-multipart que será instalado cuando se levante Docker
# @router.post("/{company_id}/logo", response_model=CompanyOut)
# async def upload_company_logo(...)
# @router.delete("/{company_id}/logo", response_model=CompanyOut)
# async def delete_company_logo(...)
