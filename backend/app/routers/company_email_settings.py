from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import require_role
from app.models import Company, CompanyEmailSettings
from app.services.company_email_service import send_test_email


router = APIRouter(prefix="/companies", tags=["company-email-settings"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


class CompanyEmailSettingsIn(BaseModel):
    from_name: str | None = None
    from_email: EmailStr
    smtp_host: str
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    use_tls: bool = True
    use_ssl: bool = False
    is_active: bool = True


class CompanyEmailSettingsOut(BaseModel):
    id: int
    company_id: int
    from_name: str | None
    from_email: str
    smtp_host: str
    smtp_port: int
    smtp_username: str | None
    use_tls: bool
    use_ssl: bool
    is_active: bool
    last_test_at: datetime | None
    last_test_success: bool | None
    last_test_message: str | None

    model_config = {"from_attributes": True}


class TestEmailRequest(BaseModel):
    test_email: EmailStr


@router.get("/{company_id}/email-settings", response_model=CompanyEmailSettingsOut | None)
async def get_email_settings(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if current_user["company_id"] != company_id and current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(CompanyEmailSettings).where(CompanyEmailSettings.company_id == company_id)
    )
    return result.scalar_one_or_none()


@router.put("/{company_id}/email-settings", response_model=CompanyEmailSettingsOut)
async def upsert_email_settings(
    company_id: int,
    body: CompanyEmailSettingsIn,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if current_user["company_id"] != company_id and current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    result = await db.execute(
        select(CompanyEmailSettings).where(CompanyEmailSettings.company_id == company_id)
    )
    settings = result.scalar_one_or_none()

    data = body.model_dump()

    if settings:
        for key, value in data.items():
            setattr(settings, key, value)
    else:
        settings = CompanyEmailSettings(company_id=company_id, **data)
        db.add(settings)

    await db.flush()
    await db.refresh(settings)
    return settings


@router.post("/{company_id}/email-settings/test")
async def test_email_settings(
    company_id: int,
    body: TestEmailRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if current_user["company_id"] != company_id and current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(CompanyEmailSettings).where(CompanyEmailSettings.company_id == company_id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        raise HTTPException(status_code=404, detail="Configuración SMTP no encontrada")

    try:
        send_test_email(
            smtp_host=settings.smtp_host,
            smtp_port=settings.smtp_port,
            smtp_username=settings.smtp_username,
            smtp_password=settings.smtp_password,
            from_email=settings.from_email,
            from_name=settings.from_name,
            to_email=body.test_email,
            use_tls=settings.use_tls,
            use_ssl=settings.use_ssl,
        )

        settings.last_test_at = datetime.now(timezone.utc)
        settings.last_test_success = True
        settings.last_test_message = "Correo enviado correctamente"
        await db.commit()

        return {"success": True, "message": "Correo enviado correctamente"}

    except Exception as exc:
        settings.last_test_at = datetime.now(timezone.utc)
        settings.last_test_success = False
        settings.last_test_message = str(exc)
        await db.commit()

        return {"success": False, "message": str(exc)}