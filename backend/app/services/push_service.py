"""
Web Push notification service using VAPID + pywebpush.
"""
import json
import os

# Read from environment variables (set in backend/.env)
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "mailto:admin@eventscontrol.com")


async def send_push_to_user(user_id: int, title: str, body: str, url: str = "/", db=None) -> int:
    """Send a push notification to all subscriptions of a user."""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("[Push] VAPID keys not configured")
        return 0
    if db is None:
        return 0

    from app.models import PushSubscription
    from sqlalchemy import select

    result = await db.execute(
        select(PushSubscription).where(PushSubscription.user_id == user_id)
    )
    subscriptions = result.scalars().all()
    if not subscriptions:
        return 0

    sent = 0
    for sub in subscriptions:
        try:
            _send_push(sub.endpoint, sub.p256dh, sub.auth, title, body, url)
            sent += 1
        except Exception as e:
            print(f"[Push] Error sending to subscription {sub.id}: {e}")
            if "410" in str(e) or "404" in str(e):
                await db.delete(sub)
                await db.flush()
    return sent


def _send_push(endpoint: str, p256dh: str, auth: str, title: str, body: str, url: str = "/"):
    """Send a single push notification via pywebpush."""
    from pywebpush import webpush

    payload = json.dumps({
        "title": title, "body": body, "url": url,
        "icon": "/icon-192.png", "badge": "/badge-72.png",
    })

    webpush(
        subscription_info={"endpoint": endpoint, "keys": {"p256dh": p256dh, "auth": auth}},
        data=payload,
        vapid_private_key=VAPID_PRIVATE_KEY,
        vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
    )


async def send_push_to_users(user_ids: list[int], title: str, body: str, url: str = "/", db=None) -> int:
    """Send push notification to multiple users. Returns total sent count."""
    total = 0
    for uid in user_ids:
        total += await send_push_to_user(uid, title, body, url, db)
    return total
