from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import JobRole, EmployeeJobRole, User, WeeklyHoursConfig

router = APIRouter(prefix="/job-roles", tags=["job-roles"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class JobRoleCreate(BaseModel):
    name: str
    hourly_rate: Decimal


class JobRoleUpdate(BaseModel):
    name: str | None = None
    hourly_rate: Decimal | None = None


class JobRoleOut(BaseModel):
    id: int
    company_id: int
    name: str
    hourly_rate: Decimal
    is_active: bool
    model_config = {"from_attributes": True}


class WeeklyConfigUpdate(BaseModel):
    weekly_hours_limit: Decimal
    week_start_day: str = "monday"
    week_end_day: str = "sunday"
    min_shift_hours: Decimal = Decimal("0.00")


class WeeklyConfigOut(BaseModel):
    id: int
    company_id: int
    weekly_hours_limit: Decimal
    week_start_day: str
    week_end_day: str
    min_shift_hours: Decimal = Decimal("0.00")
    model_config = {"from_attributes": True}


class BulkAssignRequest(BaseModel):
    user_ids: list[int]
    hourly_rates: dict[str, float] | None = None  # {"user_id": rate} — optional per-employee rates


# ── Rutas estáticas PRIMERO (antes de /{role_id}) ──────────────────────────

@router.post("", response_model=JobRoleOut, status_code=status.HTTP_201_CREATED)
async def create_job_role(body: JobRoleCreate, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    # Convertir nombre a mayúsculas
    name_upper = body.name.upper().strip()
    existing = await db.execute(select(JobRole).where(JobRole.company_id == company_id, JobRole.name == name_upper))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre en esta empresa")
    role = JobRole(company_id=company_id, name=name_upper, hourly_rate=body.hourly_rate)
    db.add(role)
    await db.flush()
    await db.refresh(role)
    return role


@router.get("", response_model=list[JobRoleOut])
async def list_job_roles(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    result = await db.execute(select(JobRole).where(JobRole.company_id == company_id))
    return result.scalars().all()


@router.get("/weekly-config", response_model=WeeklyConfigOut | None)
async def get_weekly_config(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    result = await db.execute(select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id))
    return result.scalar_one_or_none()


@router.put("/weekly-config", response_model=WeeklyConfigOut)
async def upsert_weekly_config(body: WeeklyConfigUpdate, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    valid_days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
    if body.week_start_day not in valid_days or body.week_end_day not in valid_days:
        raise HTTPException(status_code=400, detail="Día de semana no válido")
    company_id = current_user["company_id"]
    result = await db.execute(select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id))
    config = result.scalar_one_or_none()
    if config:
        config.weekly_hours_limit = body.weekly_hours_limit
        config.week_start_day = body.week_start_day
        config.week_end_day = body.week_end_day
        config.min_shift_hours = body.min_shift_hours
    else:
        config = WeeklyHoursConfig(company_id=company_id, weekly_hours_limit=body.weekly_hours_limit,
                                   week_start_day=body.week_start_day, week_end_day=body.week_end_day,
                                   min_shift_hours=body.min_shift_hours)
        db.add(config)
    await db.flush()
    await db.refresh(config)
    return config


@router.get("/employees-with-roles")
async def get_employees_with_roles(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    """Empleados de la empresa con al menos un rol asignado."""
    from app.models import UserCompanyMembership
    company_id = current_user["company_id"]
    result = await db.execute(
        select(User, JobRole)
        .join(EmployeeJobRole, EmployeeJobRole.user_id == User.id)
        .join(JobRole, JobRole.id == EmployeeJobRole.job_role_id)
        .join(UserCompanyMembership,
              (UserCompanyMembership.user_id == User.id) & (UserCompanyMembership.company_id == company_id))
        .where(EmployeeJobRole.company_id == company_id, JobRole.is_active == True,
               User.is_active == True, UserCompanyMembership.is_active == True)
        .order_by(User.name)
    )
    rows = result.all()
    employees: dict[int, dict] = {}
    for user, role in rows:
        if user.id not in employees:
            employees[user.id] = {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "roles": []}
        employees[user.id]["roles"].append({"id": role.id, "name": role.name, "hourly_rate": str(role.hourly_rate)})
    return list(employees.values())


@router.get("/my-roles", response_model=list[JobRoleOut])
async def get_my_roles(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    """Roles laborales asignados al empleado autenticado."""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    result = await db.execute(
        select(JobRole).join(EmployeeJobRole, EmployeeJobRole.job_role_id == JobRole.id)
        .where(EmployeeJobRole.user_id == user_id, EmployeeJobRole.company_id == company_id, JobRole.is_active == True)
    )
    return result.scalars().all()


# ── Rutas dinámicas /{role_id} DESPUÉS ────────────────────────────────────

@router.patch("/{role_id}", response_model=JobRoleOut)
async def update_job_role(role_id: int, body: JobRoleUpdate, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    role = await db.get(JobRole, role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    # Actualizar nombre si se proporciona
    if body.name:
        name_upper = body.name.upper().strip()
        # Verificar que no exista otro rol con el mismo nombre
        existing = await db.execute(
            select(JobRole).where(
                JobRole.company_id == company_id,
                JobRole.name == name_upper,
                JobRole.id != role_id  # Excluir el rol actual
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre en esta empresa")
        role.name = name_upper
    
    # Actualizar tarifa horaria si se proporciona
    if body.hourly_rate is not None:
        role.hourly_rate = body.hourly_rate
    
    await db.flush()
    await db.refresh(role)
    return role


@router.delete("/{role_id}/deactivate", response_model=JobRoleOut)
async def deactivate_job_role(role_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    role = await db.get(JobRole, role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    role.is_active = False
    await db.flush()
    return role


@router.post("/{role_id}/employees/{user_id}", status_code=status.HTTP_201_CREATED)
async def assign_role_to_employee(role_id: int, user_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    role = await db.get(JobRole, role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    existing = await db.execute(
        select(EmployeeJobRole).where(EmployeeJobRole.user_id == user_id,
                                      EmployeeJobRole.company_id == company_id,
                                      EmployeeJobRole.job_role_id == role_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El empleado ya tiene este rol asignado")
    db.add(EmployeeJobRole(user_id=user_id, company_id=company_id, job_role_id=role_id))
    await db.flush()
    return {"message": "Rol asignado correctamente"}


@router.delete("/{role_id}/employees/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_employee(role_id: int, user_id: int, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    result = await db.execute(
        select(EmployeeJobRole).where(EmployeeJobRole.user_id == user_id,
                                      EmployeeJobRole.company_id == company_id,
                                      EmployeeJobRole.job_role_id == role_id)
    )
    ejr = result.scalar_one_or_none()
    if not ejr:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    await db.delete(ejr)


@router.post("/bulk-assign/{role_id}", status_code=status.HTTP_200_OK)
async def bulk_assign_role_to_employees(role_id: int, body: BulkAssignRequest, current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    if not body.user_ids:
        raise HTTPException(status_code=400, detail="Debe seleccionar al menos un empleado")
    role = await db.get(JobRole, role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    assigned, skipped = [], []
    for uid in body.user_ids:
        existing = await db.execute(
            select(EmployeeJobRole).where(EmployeeJobRole.user_id == uid,
                                          EmployeeJobRole.company_id == company_id,
                                          EmployeeJobRole.job_role_id == role_id)
        )
        if existing.scalar_one_or_none():
            skipped.append(uid)
        else:
            # Check if a custom rate was provided for this employee
            rate_override = None
            if body.hourly_rates and str(uid) in body.hourly_rates:
                rate_override = Decimal(str(body.hourly_rates[str(uid)]))
            db.add(EmployeeJobRole(user_id=uid, company_id=company_id, job_role_id=role_id, hourly_rate_override=rate_override))
            assigned.append(uid)
    await db.flush()
    return {"assigned": assigned, "skipped": skipped, "total": len(body.user_ids)}


class EmployeeRateUpdate(BaseModel):
    hourly_rate_override: Decimal | None = None


class EmployeeJobRoleOut(BaseModel):
    id: int
    user_id: int
    company_id: int
    job_role_id: int
    hourly_rate_override: Decimal | None
    model_config = {"from_attributes": True}


@router.patch("/employee-rate/{employee_job_role_id}", response_model=EmployeeJobRoleOut)
async def update_employee_rate(
    employee_job_role_id: int,
    body: EmployeeRateUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Update the hourly rate override for a specific employee-role assignment.
    Set to null to use the default role rate."""
    company_id = current_user["company_id"]
    ejr = await db.get(EmployeeJobRole, employee_job_role_id)
    if not ejr or ejr.company_id != company_id:
        raise HTTPException(status_code=404, detail="Asignación de rol no encontrada")
    ejr.hourly_rate_override = body.hourly_rate_override
    await db.flush()
    await db.refresh(ejr)
    return ejr


@router.get("/employees/{role_id}", response_model=list[dict])
async def get_employees_with_role(
    role_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Get all employees assigned to a role with their rate override info."""
    company_id = current_user["company_id"]
    role = await db.get(JobRole, role_id)
    if not role or role.company_id != company_id:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    result = await db.execute(
        select(EmployeeJobRole, User)
        .join(User, User.id == EmployeeJobRole.user_id)
        .where(
            EmployeeJobRole.company_id == company_id,
            EmployeeJobRole.job_role_id == role_id,
        )
        .order_by(User.name)
    )
    rows = result.all()

    return [
        {
            "id": ejr.id,
            "user_id": ejr.user_id,
            "user_name": user.name,
            "user_email": user.email,
            "job_role_id": ejr.job_role_id,
            "hourly_rate_override": float(ejr.hourly_rate_override) if ejr.hourly_rate_override else None,
            "effective_rate": float(ejr.hourly_rate_override) if ejr.hourly_rate_override else float(role.hourly_rate),
        }
        for ejr, user in rows
    ]
