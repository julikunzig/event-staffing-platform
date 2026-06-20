"""
Email service.

Nuevo motor de correo:
- Usa SMTP por empresa desde company_email_settings.
- Usa plantillas desde email_templates.
- Registra envíos en email_delivery_logs.
- Mantiene las funciones públicas antiguas para no romper routers existentes.
"""

import smtplib
from datetime import datetime
from email.message import EmailMessage
from typing import Any, Optional, List

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import (
    Company,
    User,
    UserCompanyMembership,
    CompanyEmailSettings,
    EmailTemplate,
    EmailDeliveryLog,
)


def _now_utc():
    return datetime.utcnow()


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def _render_template(content: str | None, variables: dict[str, Any]) -> str:
    rendered = content or ""

    for key, value in variables.items():
        rendered = rendered.replace(
            "{{" + key + "}}",
            "" if value is None else str(value),
        )

    return rendered


def _roles_to_text(roles: List[dict] | None) -> str:
    if not roles:
        return ""

    lines = []

    for role in roles:
        name = role.get("name", "")
        slots = role.get("slots", 1)
        start_time = role.get("start_time", "")
        rate = role.get("rate", "")

        parts = [f"• {name}"]

        if slots:
            parts.append(f"{slots} cupo(s)")

        if start_time:
            parts.append(f"a las {start_time}")

        if rate:
            parts.append(f"${rate}/hora")

        lines.append(" — ".join(parts))

    return "\n".join(lines)


def _send_smtp_email(
    *,
    smtp_host: str,
    smtp_port: int,
    smtp_username: str | None,
    smtp_password: str | None,
    from_email: str,
    from_name: str | None,
    to_email: str,
    subject: str,
    html_body: str | None,
    text_body: str | None,
    use_tls: bool,
    use_ssl: bool,
) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    msg["To"] = to_email

    if text_body:
        msg.set_content(text_body)
    else:
        msg.set_content("Este correo requiere un cliente compatible con HTML.")

    if html_body:
        msg.add_alternative(html_body, subtype="html")

    if use_ssl:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=20)

    try:
        server.ehlo()

        if use_tls and not use_ssl:
            server.starttls()
            server.ehlo()

        if smtp_username and smtp_password:
            server.login(smtp_username, smtp_password)

        server.send_message(msg)
    finally:
        server.quit()


async def _find_company_id_for_email(
    *,
    db,
    to_email: str,
    company_name: str | None = None,
) -> int | None:
    email = _normalize_email(to_email)

    if company_name:
        result = await db.execute(
            select(Company)
            .where(Company.name.ilike(company_name.strip()))
            .order_by(Company.id.asc())
            .limit(1)
        )
        company = result.scalar_one_or_none()
        if company:
            return company.id

    if email:
        result = await db.execute(
            select(UserCompanyMembership.company_id)
            .join(User, User.id == UserCompanyMembership.user_id)
            .where(
                User.email == email,
                User.is_active == True,
                UserCompanyMembership.is_active == True,
            )
            .order_by(UserCompanyMembership.company_id.asc())
            .limit(1)
        )
        company_id = result.scalar_one_or_none()
        if company_id:
            return int(company_id)

    result = await db.execute(
        select(Company.id)
        .where(Company.is_active == True)
        .order_by(Company.id.asc())
        .limit(1)
    )
    company_id = result.scalar_one_or_none()
    return int(company_id) if company_id else None


async def _send_template_email(
    *,
    company_id: int,
    template_code: str,
    to_email: str,
    variables: dict[str, Any],
) -> bool:
    code = template_code.strip().upper()
    recipient = _normalize_email(to_email)

    async with AsyncSessionLocal() as db:
        template_result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.company_id == company_id,
                EmailTemplate.code == code,
                EmailTemplate.is_active == True,
            )
        )
        template = template_result.scalar_one_or_none()

        if not template:
            print(
                f"[EmailService] Plantilla no encontrada o inactiva: "
                f"company_id={company_id}, code={code}"
            )
            return False

        smtp_result = await db.execute(
            select(CompanyEmailSettings).where(
                CompanyEmailSettings.company_id == company_id,
                CompanyEmailSettings.is_active == True,
            )
        )
        smtp_settings = smtp_result.scalar_one_or_none()

        subject = _render_template(template.subject, variables)
        html_body = _render_template(template.html_body, variables)
        text_body = _render_template(template.text_body or "", variables)

        log = EmailDeliveryLog(
            company_id=company_id,
            template_id=template.id,
            recipient_email=recipient,
            subject=subject,
            status="pending",
            provider="smtp",
            html_body=html_body,
            text_body=text_body,
            variables_json=variables,
        )
        db.add(log)
        await db.flush()

        if not smtp_settings:
            log.status = "failed"
            log.error_message = "Configuración SMTP activa no encontrada"
            await db.commit()
            print(f"[EmailService] SMTP no configurado para company_id={company_id}")
            return False

        try:
            _send_smtp_email(
                smtp_host=smtp_settings.smtp_host,
                smtp_port=smtp_settings.smtp_port,
                smtp_username=smtp_settings.smtp_username,
                smtp_password=smtp_settings.smtp_password,
                from_email=smtp_settings.from_email,
                from_name=smtp_settings.from_name,
                to_email=recipient,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
                use_tls=smtp_settings.use_tls,
                use_ssl=smtp_settings.use_ssl,
            )

            log.status = "success"
            log.sent_at = _now_utc()
            log.error_message = None
            await db.commit()

            print(
                f"[EmailService] Email enviado: "
                f"template={code}, to={recipient}, company_id={company_id}"
            )
            return True

        except Exception as exc:
            log.status = "failed"
            log.error_message = str(exc)
            await db.commit()

            print(
                f"[EmailService] Error enviando email: "
                f"template={code}, to={recipient}, error={exc}"
            )
            return False


async def _send_template_email_inferred_company(
    *,
    template_code: str,
    to_email: str,
    variables: dict[str, Any],
    company_name: str | None = None,
    company_id: int | None = None,
) -> bool:
    if not company_id:
        async with AsyncSessionLocal() as db:
            company_id = await _find_company_id_for_email(
                db=db,
                to_email=to_email,
                company_name=company_name,
            )

    if not company_id:
        print(f"[EmailService] No se pudo determinar empresa para {to_email}")
        return False

    return await _send_template_email(
        company_id=company_id,
        template_code=template_code,
        to_email=to_email,
        variables=variables,
    )


async def send_email(
    to_email: str,
    subject_en: str,
    subject_es: str,
    html_en: str,
    html_es: str,
) -> bool:
    """
    Compatibilidad con llamadas antiguas.

    Ya no usa Resend. Este método intenta enviar un correo genérico usando
    SMTP de la empresa inferida por el destinatario.

    Idealmente, las llamadas deben migrarse a plantillas.
    """
    async with AsyncSessionLocal() as db:
        company_id = await _find_company_id_for_email(db=db, to_email=to_email)

        if not company_id:
            print(f"[EmailService] No se pudo determinar empresa para {to_email}")
            return False

        smtp_result = await db.execute(
            select(CompanyEmailSettings).where(
                CompanyEmailSettings.company_id == company_id,
                CompanyEmailSettings.is_active == True,
            )
        )
        smtp_settings = smtp_result.scalar_one_or_none()

        subject = f"{subject_es} / {subject_en}"
        recipient = _normalize_email(to_email)

        combined_html = f"""
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 640px;
      margin: 0 auto;
      padding: 20px;
    }}
    .section {{
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }}
    .lang-header {{
      font-size: 11px;
      color: #667085;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: bold;
    }}
  </style>
</head>
<body>
  <div class="section">
    <div class="lang-header">Español</div>
    {html_es}
  </div>
  <div class="section">
    <div class="lang-header">English</div>
    {html_en}
  </div>
</body>
</html>
""".strip()

        text_body = f"{subject_es}\n\n{subject_en}"

        log = EmailDeliveryLog(
            company_id=company_id,
            template_id=None,
            recipient_email=recipient,
            subject=subject,
            status="pending",
            provider="smtp",
            html_body=combined_html,
            text_body=text_body,
            variables_json=None,
        )
        db.add(log)
        await db.flush()

        if not smtp_settings:
            log.status = "failed"
            log.error_message = "Configuración SMTP activa no encontrada"
            await db.commit()
            return False

        try:
            _send_smtp_email(
                smtp_host=smtp_settings.smtp_host,
                smtp_port=smtp_settings.smtp_port,
                smtp_username=smtp_settings.smtp_username,
                smtp_password=smtp_settings.smtp_password,
                from_email=smtp_settings.from_email,
                from_name=smtp_settings.from_name,
                to_email=recipient,
                subject=subject,
                html_body=combined_html,
                text_body=text_body,
                use_tls=smtp_settings.use_tls,
                use_ssl=smtp_settings.use_ssl,
            )

            log.status = "success"
            log.sent_at = _now_utc()
            log.error_message = None
            await db.commit()
            return True

        except Exception as exc:
            log.status = "failed"
            log.error_message = str(exc)
            await db.commit()
            return False


async def send_event_published_email(
    employee_emails: List[str],
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    roles: List[dict],
    dress_code: Optional[str] = None,
) -> int:
    sent_count = 0

    for email in employee_emails:
        ok = await send_event_published_email_personalized(
            employee_email=email,
            employee_name="",
            event_name=event_name,
            event_date=event_date,
            start_time=start_time,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            roles=roles,
            dress_code=dress_code,
        )

        if ok:
            sent_count += 1

    return sent_count


async def send_event_published_email_personalized(
    employee_email: str,
    employee_name: str,
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    roles: List[dict],
    dress_code: Optional[str] = None,
    company_id: Optional[int] = None,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="EVENT_PUBLISHED",
        to_email=employee_email,
        company_id=company_id,
        variables={
            "employee_name": employee_name or "",
            "event_name": event_name,
            "event_date": event_date,
            "start_time": start_time,
            "address": address,
            "city": city,
            "state": state,
            "zip_code": zip_code,
            "roles": _roles_to_text(roles),
            "dress_code": dress_code or "No especificado",
        },
    )


async def send_event_invitation_email(
    employee_emails: List[str],
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    role_name: str,
    hourly_rate: str,
    dress_code: Optional[str] = None,
    company_id: Optional[int] = None,
) -> int:
    sent_count = 0

    for email in employee_emails:
        ok = await _send_template_email_inferred_company(
            template_code="EVENT_INVITATION",
            to_email=email,
            company_id=company_id,
            variables={
                "event_name": event_name,
                "event_date": event_date,
                "start_time": start_time,
                "address": address,
                "city": city,
                "state": state,
                "zip_code": zip_code,
                "role_name": role_name,
                "hourly_rate": hourly_rate,
                "dress_code": dress_code or "No especificado",
            },
        )

        if ok:
            sent_count += 1

    return sent_count


async def send_application_notification_email(
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
    company_id: Optional[int] = None,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="APPLICATION_RECEIVED",
        to_email=admin_email,
        company_id=company_id,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
        },
    )


async def send_invitation_response_email(
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
    accepted: bool,
    company_id: Optional[int] = None,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="INVITATION_RESPONSE",
        to_email=admin_email,
        company_id=company_id,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
            "response": "Aceptada" if accepted else "Rechazada",
        },
    )


async def send_application_approved_email(
    employee_email: str,
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    role_name: str,
    hourly_rate: str,
    dress_code: Optional[str] = None,
    company_id: Optional[int] = None,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="APPLICATION_APPROVED",
        to_email=employee_email,
        company_id=company_id,
        variables={
            "event_name": event_name,
            "event_date": event_date,
            "start_time": start_time,
            "address": address,
            "city": city,
            "state": state,
            "zip_code": zip_code,
            "role_name": role_name,
            "hourly_rate": hourly_rate,
            "dress_code": dress_code or "No especificado",
        },
    )


async def send_password_reset_email(
    user_email: str,
    reset_link: str,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="PASSWORD_RESET",
        to_email=user_email,
        variables={
            "reset_link": reset_link,
            "password_reset_link": reset_link,
        },
    )


async def send_employee_withdrew_email(
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
    company_id: Optional[int] = None,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="EMPLOYEE_WITHDREW",
        to_email=admin_email,
        company_id=company_id,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
        },
    )


async def send_welcome_email(
    to_email: str,
    user_name: str,
    username: str,
    password: str,
    company_name: str,
    login_url: str,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="WELCOME_USER",
        to_email=to_email,
        company_name=company_name,
        variables={
            "user_name": user_name,
            "employee_name": user_name,
            "username": username,
            "password": password,
            "company_name": company_name,
            "login_url": login_url,
        },
    )


async def send_existing_user_new_company_email(
    to_email: str,
    user_name: str,
    company_name: str,
    login_url: str,
) -> bool:
    return await _send_template_email_inferred_company(
        template_code="EXISTING_USER_NEW_COMPANY",
        to_email=to_email,
        company_name=company_name,
        variables={
            "user_name": user_name,
            "employee_name": user_name,
            "company_name": company_name,
            "login_url": login_url,
        },
    )