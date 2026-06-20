from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.database import get_db
from app.models import EmailQueue
from app.schemas.email_queue import EmailQueueOut
from app.services.email_queue_worker import process_email_queue_once


router = APIRouter(prefix="/email-queue", tags=["email-queue"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]


def user_can_access_company(current_user: dict, company_id: int) -> bool:
    return current_user["role"] == "super_admin" or current_user["company_id"] == company_id


@router.get("", response_model=list[EmailQueueOut])
async def list_email_queue(
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
    company_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    target_company_id = company_id or current_user["company_id"]

    if not user_can_access_company(current_user, target_company_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta empresa")

    filters = [EmailQueue.company_id == target_company_id]
    if status:
        filters.append(EmailQueue.status == status)

    result = await db.execute(
        select(EmailQueue)
        .where(*filters)
        .order_by(desc(EmailQueue.created_at))
        .limit(limit)
    )

    return result.scalars().all()


@router.post("/process-once")
async def process_queue_once(current_user: AdminDep):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Solo super_admin puede ejecutar este proceso")

    count = await process_email_queue_once()
    return {"processed": count}
