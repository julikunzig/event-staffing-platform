"""Scheduled reminder jobs.

Two recurring jobs:
  - invitation_reminders: every hour — remind invited employees who haven't responded.
  - shift_reminders: daily at 08:00 UTC — remind employees with a shift tomorrow.
"""

import asyncio
from datetime import date, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.core.database import AsyncSessionLocal
from app.models import Event, EventAssignment, User, JobRole
from app.models.enums import AssignmentStatus, EventStatus
from app.services.email_queue_service import queue_template_email

_scheduler: AsyncIOScheduler | None = None


# ---------------------------------------------------------------------------
# Job 1 — invitation reminders (every hour)
# ---------------------------------------------------------------------------

async def _send_invitation_reminders() -> None:
    today = date.today()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(EventAssignment)
            .options(
                joinedload(EventAssignment.event),
                joinedload(EventAssignment.user),
                joinedload(EventAssignment.job_role),
            )
            .join(Event, Event.id == EventAssignment.event_id)
            .join(User, User.id == EventAssignment.user_id)
            .where(
                EventAssignment.status == AssignmentStatus.invited,
                Event.status == EventStatus.published,
                Event.event_date >= today,
                User.is_active == True,
            )
        )
        assignments = result.scalars().all()

        count = 0
        for a in assignments:
            event = a.event
            user = a.user
            role = a.job_role

            if not user.email:
                continue

            await queue_template_email(
                db=db,
                company_id=event.company_id,
                template_code="INVITATION_REMINDER",
                to_email=user.email,
                variables={
                    "event_name": event.name,
                    "event_date": event.event_date.strftime("%B %d, %Y"),
                    "start_time": event.start_time.strftime("%I:%M %p"),
                    "address": event.address,
                    "city": event.city or "",
                    "state": event.state or "",
                    "zip_code": event.zip_code or "",
                    "role_name": role.name if role else "",
                    "dress_code": event.dress_code or "No especificado",
                },
            )
            count += 1

    if count:
        print(f"[ReminderScheduler] Recordatorios de invitación enviados: {count}")


# ---------------------------------------------------------------------------
# Job 2 — shift reminders (daily at 08:00 UTC)
# ---------------------------------------------------------------------------

async def _send_shift_reminders() -> None:
    tomorrow = date.today() + timedelta(days=1)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(EventAssignment)
            .options(
                joinedload(EventAssignment.event),
                joinedload(EventAssignment.user),
                joinedload(EventAssignment.job_role),
            )
            .join(Event, Event.id == EventAssignment.event_id)
            .join(User, User.id == EventAssignment.user_id)
            .where(
                EventAssignment.status == AssignmentStatus.approved,
                Event.event_date == tomorrow,
                Event.status.in_([EventStatus.published, "filled", "filled_pending"]),
                User.is_active == True,
            )
        )
        assignments = result.scalars().all()

        count = 0
        for a in assignments:
            event = a.event
            user = a.user
            role = a.job_role

            if not user.email:
                continue

            await queue_template_email(
                db=db,
                company_id=event.company_id,
                template_code="SHIFT_REMINDER",
                to_email=user.email,
                variables={
                    "event_name": event.name,
                    "event_date": event.event_date.strftime("%B %d, %Y"),
                    "start_time": event.start_time.strftime("%I:%M %p"),
                    "address": event.address,
                    "city": event.city or "",
                    "state": event.state or "",
                    "zip_code": event.zip_code or "",
                    "role_name": role.name if role else "",
                    "dress_code": event.dress_code or "No especificado",
                },
            )
            count += 1

    if count:
        print(f"[ReminderScheduler] Recordatorios de turno enviados: {count}")


# ---------------------------------------------------------------------------
# Wrappers síncronos para APScheduler
# ---------------------------------------------------------------------------

def _run_invitation_reminders():
    asyncio.create_task(_send_invitation_reminders())


def _run_shift_reminders():
    asyncio.create_task(_send_shift_reminders())


# ---------------------------------------------------------------------------
# Start / Stop
# ---------------------------------------------------------------------------

def start_reminder_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _run_invitation_reminders,
        trigger="interval",
        hours=1,
        id="invitation_reminders",
        replace_existing=True,
    )
    _scheduler.add_job(
        _run_shift_reminders,
        trigger="cron",
        hour=8,
        minute=0,
        id="shift_reminders",
        replace_existing=True,
    )
    _scheduler.start()
    print("✅ Reminder scheduler iniciado (invitaciones: cada hora | turnos: 08:00 UTC diario)")


def stop_reminder_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        print("✅ Reminder scheduler detenido")
