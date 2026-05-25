from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Annotated
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/push", tags=["push"])
AuthDep = Annotated[dict, Depends(get_current_user)]


class PushSubscribeRequest(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


class VapidPublicKeyResponse(BaseModel):
    public_key: str


@router.get("/vapid-public-key", response_model=VapidPublicKeyResponse)
async def get_vapid_public_key():
    """Return the VAPID public key for the frontend to use when subscribing."""
    from app.services.push_service import VAPID_PUBLIC_KEY
    return VapidPublicKeyResponse(public_key=VAPID_PUBLIC_KEY)


@router.post("/subscribe", status_code=201)
async def subscribe(
    body: PushSubscribeRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Save a push subscription for the current user."""
    from app.models import PushSubscription

    user_id = int(current_user["sub"])

    # Upsert: update if endpoint exists, insert if not
    existing = await db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == body.endpoint)
    )
    sub = existing.scalar_one_or_none()

    if sub:
        sub.user_id = user_id
        sub.p256dh = body.p256dh
        sub.auth = body.auth
    else:
        sub = PushSubscription(
            user_id=user_id,
            endpoint=body.endpoint,
            p256dh=body.p256dh,
            auth=body.auth,
        )
        db.add(sub)

    await db.commit()
    return {"status": "subscribed"}


@router.delete("/unsubscribe")
async def unsubscribe(
    body: PushSubscribeRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Remove a push subscription."""
    from app.models import PushSubscription

    await db.execute(
        delete(PushSubscription).where(PushSubscription.endpoint == body.endpoint)
    )
    await db.commit()
    return {"status": "unsubscribed"}


@router.post("/test")
async def test_push(
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Send a test push notification to the current user."""
    from app.services.push_service import send_push_to_user
    user_id = int(current_user["sub"])
    sent = await send_push_to_user(
        user_id=user_id,
        title="🔔 EventsControl",
        body="Las notificaciones push están funcionando correctamente.",
        url="/dashboard",
        db=db,
    )
    return {"sent": sent}
