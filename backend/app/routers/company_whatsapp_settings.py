from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.models import CompanyWhatsAppSettings

router = APIRouter(prefix="/companies", tags=["whatsapp-settings"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


def _can_access(current_user: dict, company_id: int) -> bool:
    return current_user["role"] == "super_admin" or current_user["company_id"] == company_id


def _normalize_number(number: str) -> str:
    """Ensure number is stored as whatsapp:+XXXXXXXXXXX"""
    n = number.strip()
    if not n.startswith("whatsapp:"):
        n = f"whatsapp:{n}"
    if not n[9:].startswith("+"):
        n = f"whatsapp:+{n[9:]}"
    return n


class WhatsAppSettingsIn(BaseModel):
    whatsapp_number: str
    is_active: bool = True

    @field_validator("whatsapp_number")
    @classmethod
    def validate_number(cls, v: str) -> str:
        digits = v.replace("whatsapp:", "").replace("+", "").strip()
        if not digits.isdigit() or len(digits) < 7:
            raise ValueError("Número inválido — usa formato internacional, ej: +15551234567")
        return v


class WhatsAppSettingsOut(BaseModel):
    id: int
    company_id: int
    whatsapp_number: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


@router.get("/{company_id}/whatsapp-settings", response_model=WhatsAppSettingsOut | None)
async def get_whatsapp_settings(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not _can_access(current_user, company_id):
        raise HTTPException(status_code=403, detail="Sin acceso")

    result = await db.execute(
        select(CompanyWhatsAppSettings).where(
            CompanyWhatsAppSettings.company_id == company_id
        )
    )
    return result.scalar_one_or_none()


@router.put("/{company_id}/whatsapp-settings", response_model=WhatsAppSettingsOut)
async def upsert_whatsapp_settings(
    company_id: int,
    body: WhatsAppSettingsIn,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not _can_access(current_user, company_id):
        raise HTTPException(status_code=403, detail="Sin acceso")

    normalized = _normalize_number(body.whatsapp_number)

    # Check number not already used by another company
    conflict = await db.execute(
        select(CompanyWhatsAppSettings).where(
            CompanyWhatsAppSettings.whatsapp_number == normalized,
            CompanyWhatsAppSettings.company_id != company_id,
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="Ese número ya está asignado a otra empresa",
        )

    result = await db.execute(
        select(CompanyWhatsAppSettings).where(
            CompanyWhatsAppSettings.company_id == company_id
        )
    )
    settings = result.scalar_one_or_none()

    if settings:
        settings.whatsapp_number = normalized
        settings.is_active = body.is_active
        settings.updated_at = datetime.now(timezone.utc)
    else:
        settings = CompanyWhatsAppSettings(
            company_id=company_id,
            whatsapp_number=normalized,
            is_active=body.is_active,
        )
        db.add(settings)

    await db.flush()
    await db.refresh(settings)
    return settings


@router.delete("/{company_id}/whatsapp-settings")
async def delete_whatsapp_settings(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not _can_access(current_user, company_id):
        raise HTTPException(status_code=403, detail="Sin acceso")

    result = await db.execute(
        select(CompanyWhatsAppSettings).where(
            CompanyWhatsAppSettings.company_id == company_id
        )
    )
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")

    await db.delete(settings)
    return {"ok": True}
