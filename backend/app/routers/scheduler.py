from datetime import timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select

import app.services.reminder_scheduler as _sched_module
from app.core.auth import require_role
from app.core.database import get_db
from app.models import CompanyEmailSettings, EmailDeliveryLog, EmailTemplate
from app.services.company_email_service import send_email as _send_smtp
from app.services.reminder_scheduler import (
    _run_invitation_reminders,
    _run_shift_reminders,
)
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/scheduler", tags=["scheduler"])

AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]

_JOB_RUNNERS = {
    "invitation_reminders": _run_invitation_reminders,
    "shift_reminders": _run_shift_reminders,
}

_JOB_TEMPLATE_CODE = {
    "invitation_reminders": "INVITATION_REMINDER",
    "shift_reminders": "SHIFT_REMINDER",
}


class TemplateUpdate(BaseModel):
    subject: str
    html_body: str
    text_body: str | None = None


class TemplateTestRequest(BaseModel):
    to_email: str


_SAMPLE_VARIABLES = {
    "event_name": "Evento de Prueba — Kalirio",
    "event_date": "July 15, 2026",
    "start_time": "09:00 AM",
    "address": "Calle Ejemplo 123",
    "city": "Ciudad de Prueba",
    "state": "Estado",
    "zip_code": "00000",
    "role_name": "Coordinador",
    "dress_code": "Formal",
}


def _job_info(job) -> dict:
    next_run = job.next_run_time
    return {
        "id": job.id,
        "name": job.name,
        "next_run": next_run.astimezone(timezone.utc).isoformat() if next_run else None,
        "trigger": str(job.trigger),
        "paused": next_run is None,
    }


# ---------------------------------------------------------------------------
# Job management
# ---------------------------------------------------------------------------

@router.get("/jobs")
async def list_jobs(_: AdminDep):
    s = _sched_module._scheduler
    if not s or not s.running:
        return {"running": False, "jobs": []}
    jobs = [_job_info(j) for j in s.get_jobs()]
    return {"running": True, "jobs": jobs}


@router.post("/jobs/{job_id}/run")
async def run_job_now(job_id: str, _: AdminDep):
    runner = _JOB_RUNNERS.get(job_id)
    if not runner:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    runner()
    return {"ok": True, "job_id": job_id}


@router.post("/jobs/{job_id}/pause")
async def pause_job(job_id: str, _: AdminDep):
    s = _sched_module._scheduler
    if not s:
        raise HTTPException(status_code=503, detail="Scheduler no iniciado")
    s.pause_job(job_id)
    return {"ok": True, "job_id": job_id, "paused": True}


@router.post("/jobs/{job_id}/resume")
async def resume_job(job_id: str, _: AdminDep):
    s = _sched_module._scheduler
    if not s:
        raise HTTPException(status_code=503, detail="Scheduler no iniciado")
    s.resume_job(job_id)
    return {"ok": True, "job_id": job_id, "paused": False}


# ---------------------------------------------------------------------------
# Template endpoints
# ---------------------------------------------------------------------------

@router.get("/jobs/{job_id}/template")
async def get_job_template(
    job_id: str,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    code = _JOB_TEMPLATE_CODE.get(job_id)
    if not code:
        raise HTTPException(status_code=404, detail="Job no encontrado")

    company_id = current_user["company_id"]
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == company_id,
            EmailTemplate.code == code,
        )
    )
    tpl = result.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada para esta empresa")

    return {
        "id": tpl.id,
        "code": tpl.code,
        "name": tpl.name,
        "subject": tpl.subject,
        "html_body": tpl.html_body,
        "text_body": tpl.text_body,
        "variables": tpl.variables,
        "is_active": tpl.is_active,
    }


@router.put("/jobs/{job_id}/template")
async def update_job_template(
    job_id: str,
    body: TemplateUpdate,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    code = _JOB_TEMPLATE_CODE.get(job_id)
    if not code:
        raise HTTPException(status_code=404, detail="Job no encontrado")

    company_id = current_user["company_id"]
    result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == company_id,
            EmailTemplate.code == code,
        )
    )
    tpl = result.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    tpl.subject = body.subject.strip()
    tpl.html_body = body.html_body
    if body.text_body is not None:
        tpl.text_body = body.text_body

    await db.flush()
    await db.refresh(tpl)

    return {"ok": True, "id": tpl.id, "subject": tpl.subject}


# ---------------------------------------------------------------------------
# Send log endpoint
# ---------------------------------------------------------------------------

@router.get("/jobs/{job_id}/logs")
async def get_job_logs(
    job_id: str,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
):
    code = _JOB_TEMPLATE_CODE.get(job_id)
    if not code:
        raise HTTPException(status_code=404, detail="Job no encontrado")

    company_id = current_user["company_id"]

    # Find template IDs for this code within accessible companies
    if current_user["role"] == "super_admin":
        tpl_result = await db.execute(
            select(EmailTemplate.id).where(EmailTemplate.code == code)
        )
    else:
        tpl_result = await db.execute(
            select(EmailTemplate.id).where(
                EmailTemplate.code == code,
                EmailTemplate.company_id == company_id,
            )
        )
    template_ids = [row[0] for row in tpl_result.all()]

    if not template_ids:
        return {"items": [], "total": 0}

    logs_result = await db.execute(
        select(EmailDeliveryLog)
        .where(EmailDeliveryLog.template_id.in_(template_ids))
        .order_by(desc(EmailDeliveryLog.created_at))
        .limit(limit)
    )
    logs = logs_result.scalars().all()

    return {
        "items": [
            {
                "id": l.id,
                "recipient_email": l.recipient_email,
                "subject": l.subject,
                "status": l.status,
                "sent_at": l.sent_at.isoformat() if l.sent_at else None,
                "created_at": l.created_at.isoformat(),
                "error_message": l.error_message,
            }
            for l in logs
        ],
        "total": len(logs),
    }


# ---------------------------------------------------------------------------
# Test send endpoint
# ---------------------------------------------------------------------------

@router.post("/jobs/{job_id}/template/test")
async def test_job_template(
    job_id: str,
    body: TemplateTestRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    code = _JOB_TEMPLATE_CODE.get(job_id)
    if not code:
        raise HTTPException(status_code=404, detail="Job no encontrado")

    company_id = current_user["company_id"]

    tpl_result = await db.execute(
        select(EmailTemplate).where(
            EmailTemplate.company_id == company_id,
            EmailTemplate.code == code,
        )
    )
    tpl = tpl_result.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada para esta empresa")

    smtp_result = await db.execute(
        select(CompanyEmailSettings).where(
            CompanyEmailSettings.company_id == company_id,
            CompanyEmailSettings.is_active == True,
        )
    )
    smtp = smtp_result.scalar_one_or_none()
    if not smtp:
        raise HTTPException(status_code=404, detail="No hay configuración SMTP activa para esta empresa")

    def _render(content: str) -> str:
        for k, v in _SAMPLE_VARIABLES.items():
            content = content.replace("{{" + k + "}}", v)
        return content

    subject = _render(tpl.subject)
    html_body = _render(tpl.html_body)
    text_body = _render(tpl.text_body or "")

    try:
        _send_smtp(
            smtp_host=smtp.smtp_host,
            smtp_port=smtp.smtp_port,
            smtp_username=smtp.smtp_username,
            smtp_password=smtp.smtp_password,
            from_email=smtp.from_email,
            from_name=smtp.from_name,
            to_email=body.to_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body or None,
            use_tls=smtp.use_tls,
            use_ssl=smtp.use_ssl,
        )
        return {"ok": True, "message": f"Correo de prueba enviado a {body.to_email}"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error al enviar: {exc}")
