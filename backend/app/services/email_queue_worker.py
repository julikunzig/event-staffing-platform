import asyncio
from datetime import datetime

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import EmailQueue
from app.services.email_service import _send_template_email


_worker_task: asyncio.Task | None = None
_stop_event: asyncio.Event | None = None


async def process_email_queue_once(limit: int = 20) -> int:
    processed = 0

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(EmailQueue)
            .where(
                EmailQueue.status == "pending",
                EmailQueue.scheduled_at <= datetime.utcnow(),
                EmailQueue.attempts < EmailQueue.max_attempts,
            )
            .order_by(EmailQueue.created_at.asc())
            .limit(limit)
        )
        items = result.scalars().all()

    for item in items:
        async with AsyncSessionLocal() as db:
            fresh = await db.get(EmailQueue, item.id)
            if not fresh or fresh.status != "pending":
                continue

            fresh.status = "processing"
            fresh.attempts += 1
            fresh.error_message = None
            await db.commit()

        try:
            ok = await _send_template_email(
                company_id=item.company_id,
                template_code=item.template_code,
                to_email=item.recipient_email,
                variables=item.variables_json or {},
            )

            async with AsyncSessionLocal() as db:
                fresh = await db.get(EmailQueue, item.id)
                if fresh:
                    fresh.processed_at = datetime.utcnow()
                    fresh.status = "sent" if ok else (
                        "failed" if fresh.attempts >= fresh.max_attempts else "pending"
                    )
                    if not ok:
                        fresh.error_message = "El servicio de correo devolvió False"
                    await db.commit()

            processed += 1

        except Exception as exc:
            async with AsyncSessionLocal() as db:
                fresh = await db.get(EmailQueue, item.id)
                if fresh:
                    fresh.error_message = str(exc)
                    fresh.status = "failed" if fresh.attempts >= fresh.max_attempts else "pending"
                    fresh.processed_at = datetime.utcnow() if fresh.status == "failed" else None
                    await db.commit()

            print(f"[EmailQueueWorker] Error procesando email_queue.id={item.id}: {exc}")

    return processed


async def email_queue_worker_loop(interval_seconds: int = 5, batch_size: int = 20):
    global _stop_event
    _stop_event = asyncio.Event()

    print("[EmailQueueWorker] Iniciado")

    while not _stop_event.is_set():
        try:
            count = await process_email_queue_once(limit=batch_size)
            if count:
                print(f"[EmailQueueWorker] Procesados: {count}")
        except Exception as exc:
            print(f"[EmailQueueWorker] Error general: {exc}")

        try:
            await asyncio.wait_for(_stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            pass

    print("[EmailQueueWorker] Detenido")


def start_email_queue_worker():
    global _worker_task

    if _worker_task and not _worker_task.done():
        return

    _worker_task = asyncio.create_task(email_queue_worker_loop())


async def stop_email_queue_worker():
    global _stop_event, _worker_task

    if _stop_event:
        _stop_event.set()

    if _worker_task:
        await _worker_task
        _worker_task = None
