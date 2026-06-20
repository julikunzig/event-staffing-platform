from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EmailQueue, UserCompanyMembership, User, Company


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def _roles_to_text(roles: list[dict] | None) -> str:
    if not roles:
        return ""

    lines = []
    for role in roles:
        name = role.get("name", "")
        slots = role.get("slots", "")
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


async def find_company_id_for_email(
    *,
    db: AsyncSession,
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


async def queue_template_email(
    *,
    db: AsyncSession,
    company_id: int,
    template_code: str,
    to_email: str,
    variables: dict[str, Any],
    scheduled_at: datetime | None = None,
    max_attempts: int = 3,
) -> EmailQueue:
    item = EmailQueue(
        company_id=company_id,
        template_code=template_code.strip().upper(),
        recipient_email=_normalize_email(to_email),
        variables_json=variables or {},
        status="pending",
        attempts=0,
        max_attempts=max_attempts,
        scheduled_at=scheduled_at or datetime.utcnow(),
    )
    db.add(item)
    await db.flush()
    await db.commit()
    await db.refresh(item)
    return item


async def queue_template_email_inferred_company(
    *,
    db: AsyncSession,
    template_code: str,
    to_email: str,
    variables: dict[str, Any],
    company_name: str | None = None,
    scheduled_at: datetime | None = None,
    max_attempts: int = 3,
) -> EmailQueue | None:
    company_id = await find_company_id_for_email(
        db=db,
        to_email=to_email,
        company_name=company_name,
    )

    if not company_id:
        print(f"[EmailQueue] No se pudo determinar empresa para {to_email}")
        return None

    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code=template_code,
        to_email=to_email,
        variables=variables,
        scheduled_at=scheduled_at,
        max_attempts=max_attempts,
    )


async def queue_event_published_email(
    *,
    db: AsyncSession,
    company_id: int,
    employee_email: str,
    employee_name: str,
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    roles: list[dict] | str,
    dress_code: str | None = None,
):
    roles_text = roles if isinstance(roles, str) else _roles_to_text(roles)

    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="EVENT_PUBLISHED",
        to_email=employee_email,
        variables={
            "employee_name": employee_name or "",
            "event_name": event_name,
            "event_date": event_date,
            "start_time": start_time,
            "address": address,
            "city": city,
            "state": state,
            "zip_code": zip_code,
            "roles": roles_text,
            "dress_code": dress_code or "No especificado",
        },
    )


async def queue_event_invitation_email(
    *,
    db: AsyncSession,
    company_id: int,
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
    dress_code: str | None = None,
):
    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="EVENT_INVITATION",
        to_email=employee_email,
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


async def queue_application_received_email(
    *,
    db: AsyncSession,
    company_id: int,
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
):
    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="APPLICATION_RECEIVED",
        to_email=admin_email,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
        },
    )


async def queue_application_approved_email(
    *,
    db: AsyncSession,
    company_id: int,
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
    dress_code: str | None = None,
):
    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="APPLICATION_APPROVED",
        to_email=employee_email,
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


async def queue_invitation_response_email(
    *,
    db: AsyncSession,
    company_id: int,
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
    accepted: bool,
):
    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="INVITATION_RESPONSE",
        to_email=admin_email,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
            "response": "Aceptada" if accepted else "Rechazada",
        },
    )


async def queue_employee_withdrew_email(
    *,
    db: AsyncSession,
    company_id: int,
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
):
    return await queue_template_email(
        db=db,
        company_id=company_id,
        template_code="EMPLOYEE_WITHDREW",
        to_email=admin_email,
        variables={
            "employee_name": employee_name,
            "event_name": event_name,
            "role_name": role_name,
            "event_date": event_date,
        },
    )


async def queue_welcome_email(
    *,
    db: AsyncSession,
    to_email: str,
    user_name: str,
    username: str,
    password: str,
    company_name: str,
    login_url: str,
):
    return await queue_template_email_inferred_company(
        db=db,
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


async def queue_existing_user_new_company_email(
    *,
    db: AsyncSession,
    to_email: str,
    user_name: str,
    company_name: str,
    login_url: str,
):
    return await queue_template_email_inferred_company(
        db=db,
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


async def queue_password_reset_email(
    *,
    db: AsyncSession,
    to_email: str,
    reset_link: str,
):
    return await queue_template_email_inferred_company(
        db=db,
        template_code="PASSWORD_RESET",
        to_email=to_email,
        variables={
            "reset_link": reset_link,
            "password_reset_link": reset_link,
        },
    )

