from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.models import Company, CompanyEmailSettings, EmailDeliveryLog, EmailTemplate
from app.schemas.email_templates import (
    EmailTemplateCreate,
    EmailTemplateOut,
    EmailTemplateTestRequest,
    EmailTemplateUpdate,
)
from app.services.company_email_service import send_email


router = APIRouter(prefix="/companies", tags=["email-templates"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


def user_can_access_company(current_user: dict, company_id: int) -> bool:
    return current_user["role"] == "super_admin" or current_user["company_id"] == company_id


def render_template(content: str, variables: dict[str, str]) -> str:
    rendered = content

    for key, value in variables.items():
        rendered = rendered.replace("{{" + key + "}}", str(value))

    return rendered


@router.get("/{company_id}/email-templates", response_model=list[EmailTemplateOut])
async def list_email_templates(
    company_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    result = await db.execute(
        select(EmailTemplate)
        .where(EmailTemplate.company_id == company_id)
        .order_by(EmailTemplate.name.asc())
    )

    return result.scalars().all()


@router.post("/{company_id}/email-templates", response_model=EmailTemplateOut)
async def create_email_template(
    company_id: int,
    body: EmailTemplateCreate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    existing = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == company_id,
            EmailTemplate.code == body.code,
        )
    )

    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe una plantilla con ese código")

    template = EmailTemplate(
        company_id=company_id,
        code=body.code.strip().upper(),
        name=body.name.strip(),
        subject=body.subject.strip(),
        html_body=body.html_body,
        text_body=body.text_body,
        variables=body.variables,
        is_active=body.is_active,
    )

    db.add(template)
    await db.flush()
    await db.refresh(template)

    return template


@router.get("/{company_id}/email-templates/{template_id}", response_model=EmailTemplateOut)
async def get_email_template(
    company_id: int,
    template_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    template = await db.get(EmailTemplate, template_id)

    if not template or template.company_id != company_id:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    return template


@router.put("/{company_id}/email-templates/{template_id}", response_model=EmailTemplateOut)
async def update_email_template(
    company_id: int,
    template_id: int,
    body: EmailTemplateUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    template = await db.get(EmailTemplate, template_id)

    if not template or template.company_id != company_id:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    data = body.model_dump(exclude_unset=True)

    if "code" in data and data["code"]:
        new_code = data["code"].strip().upper()

        existing = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.company_id == company_id,
                EmailTemplate.code == new_code,
                EmailTemplate.id != template_id,
            )
        )

        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ya existe una plantilla con ese código")

        data["code"] = new_code

    if "name" in data and data["name"]:
        data["name"] = data["name"].strip()

    if "subject" in data and data["subject"]:
        data["subject"] = data["subject"].strip()

    for key, value in data.items():
        setattr(template, key, value)

    await db.flush()
    await db.refresh(template)

    return template


@router.delete("/{company_id}/email-templates/{template_id}")
async def delete_email_template(
    company_id: int,
    template_id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    template = await db.get(EmailTemplate, template_id)

    if not template or template.company_id != company_id:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    await db.delete(template)

    return {"success": True, "message": "Plantilla eliminada correctamente"}


@router.post("/{company_id}/email-templates/{template_id}/test")
async def test_email_template(
    company_id: int,
    template_id: int,
    body: EmailTemplateTestRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    if not user_can_access_company(current_user, company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    template = await db.get(EmailTemplate, template_id)

    if not template or template.company_id != company_id:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    if not template.is_active:
        raise HTTPException(status_code=400, detail="La plantilla está inactiva")

    smtp_settings_result = await db.execute(
        select(CompanyEmailSettings).where(
            CompanyEmailSettings.company_id == company_id,
            CompanyEmailSettings.is_active == True,
        )
    )
    smtp_settings = smtp_settings_result.scalar_one_or_none()

    if not smtp_settings:
        raise HTTPException(status_code=404, detail="Configuración SMTP activa no encontrada")

    subject = render_template(template.subject, body.variables)
    html_body = render_template(template.html_body, body.variables)
    text_body = render_template(template.text_body or "", body.variables)

    log = EmailDeliveryLog(
        company_id=company_id,
        template_id=template.id,
        recipient_email=body.to_email,
        subject=subject,
        status="pending",
        provider="smtp",
    )
    db.add(log)
    await db.flush()

    try:
        send_email(
            smtp_host=smtp_settings.smtp_host,
            smtp_port=smtp_settings.smtp_port,
            smtp_username=smtp_settings.smtp_username,
            smtp_password=smtp_settings.smtp_password,
            from_email=smtp_settings.from_email,
            from_name=smtp_settings.from_name,
            to_email=body.to_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
            use_tls=smtp_settings.use_tls,
            use_ssl=smtp_settings.use_ssl,
        )

        log.status = "success"
        log.sent_at = datetime.now(timezone.utc)
        log.error_message = None

        return {"success": True, "message": "Correo de prueba enviado correctamente"}

    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)

        return {"success": False, "message": str(exc)}