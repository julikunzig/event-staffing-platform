from datetime import datetime
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.models import EmailDeliveryLog, EmailTemplate, CompanyEmailSettings
from app.schemas.email_delivery_logs import EmailDeliveryLogOut
from app.services.email_service import _send_smtp_email


router = APIRouter(prefix="/companies", tags=["email-delivery-logs"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


class EmailDeliveryLogListResponse(BaseModel):
    items: list[EmailDeliveryLogOut]
    total: int
    page: int
    page_size: int
    pages: int


def user_can_access_company(current_user: dict, company_id: int) -> bool:
    return current_user["role"] == "super_admin" or current_user["company_id"] == company_id


@router.get("/{company_id}/email-delivery-logs", response_model=EmailDeliveryLogListResponse)
async def list_email_delivery_logs(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    template_id: int | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    filters = [EmailDeliveryLog.company_id == company_id]

    if search and search.strip():
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                EmailDeliveryLog.recipient_email.ilike(term),
                EmailDeliveryLog.subject.ilike(term),
                EmailDeliveryLog.error_message.ilike(term),
            )
        )

    if status and status.strip():
        filters.append(EmailDeliveryLog.status == status.strip())

    if template_id:
        filters.append(EmailDeliveryLog.template_id == template_id)

    if date_from:
        filters.append(EmailDeliveryLog.created_at >= date_from.replace(tzinfo=None))

    if date_to:
        filters.append(EmailDeliveryLog.created_at <= date_to.replace(tzinfo=None))

    total_result = await db.execute(select(func.count(EmailDeliveryLog.id)).where(*filters))
    total = total_result.scalar() or 0

    result = await db.execute(
        select(EmailDeliveryLog)
        .where(*filters)
        .order_by(desc(EmailDeliveryLog.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    items = result.scalars().all()
    pages = max(1, ceil(total / page_size)) if total else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.get("/{company_id}/email-delivery-logs/{log_id}", response_model=EmailDeliveryLogOut)
async def get_email_delivery_log(
    company_id: int,
    log_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(EmailDeliveryLog).where(
            EmailDeliveryLog.id == log_id,
            EmailDeliveryLog.company_id == company_id,
        )
    )
    log = result.scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    return log


@router.post("/{company_id}/email-delivery-logs/{log_id}/resend", response_model=EmailDeliveryLogOut)
async def resend_email_delivery_log(
    company_id: int,
    log_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(EmailDeliveryLog).where(
            EmailDeliveryLog.id == log_id,
            EmailDeliveryLog.company_id == company_id,
        )
    )
    original = result.scalar_one_or_none()

    if not original:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    smtp_result = await db.execute(
        select(CompanyEmailSettings).where(
            CompanyEmailSettings.company_id == company_id,
            CompanyEmailSettings.is_active == True,
        )
    )
    smtp_settings = smtp_result.scalar_one_or_none()

    new_log = EmailDeliveryLog(
        company_id=company_id,
        template_id=original.template_id,
        recipient_email=original.recipient_email,
        subject=original.subject,
        status="pending",
        provider="smtp",
        html_body=original.html_body,
        text_body=original.text_body,
        variables_json=original.variables_json,
    )
    db.add(new_log)
    await db.flush()

    if not smtp_settings:
        new_log.status = "failed"
        new_log.error_message = "Configuración SMTP activa no encontrada"
        await db.commit()
        await db.refresh(new_log)
        return new_log

    try:
        _send_smtp_email(
            smtp_host=smtp_settings.smtp_host,
            smtp_port=smtp_settings.smtp_port,
            smtp_username=smtp_settings.smtp_username,
            smtp_password=smtp_settings.smtp_password,
            from_email=smtp_settings.from_email,
            from_name=smtp_settings.from_name,
            to_email=original.recipient_email,
            subject=original.subject,
            html_body=original.html_body,
            text_body=original.text_body,
            use_tls=smtp_settings.use_tls,
            use_ssl=smtp_settings.use_ssl,
        )

        new_log.status = "success"
        new_log.sent_at = datetime.utcnow()
        new_log.error_message = None
    except Exception as exc:
        new_log.status = "failed"
        new_log.error_message = str(exc)

    await db.commit()
    await db.refresh(new_log)
    return new_log


@router.get("/{company_id}/email-delivery-log-template-options")
async def list_email_delivery_log_template_options(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(EmailTemplate.id, EmailTemplate.code, EmailTemplate.name)
        .where(EmailTemplate.company_id == company_id)
        .order_by(EmailTemplate.name.asc())
    )

    return [{"id": row.id, "code": row.code, "name": row.name} for row in result.all()]