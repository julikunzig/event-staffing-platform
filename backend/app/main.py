from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import settings
from app.services.email_queue_worker import (
    start_email_queue_worker,
    stop_email_queue_worker,
)
from app.services.reminder_scheduler import (
    start_reminder_scheduler,
    stop_reminder_scheduler,
)

from app.routers import (
    auth,
    companies,
    users,
    job_roles,
    events,
    assignments,
    shifts,
    reports,
    news,
    ai,
    whatsapp,
    push,
    dashboard,
    payroll,
    payments,
    company_email_settings,
    email_templates,
    email_delivery_logs,
    email_queue,
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"

        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from scripts.seed_email_templates import seed_all_email_templates

        await seed_all_email_templates()
        print("✅ Email templates seed ejecutado correctamente")
    except Exception as exc:
        print(f"⚠️ No se pudo ejecutar seed de email templates: {exc}")

    try:
        start_email_queue_worker()
        print("✅ Email queue worker iniciado correctamente")
    except Exception as exc:
        print(f"⚠️ No se pudo iniciar email queue worker: {exc}")

    try:
        start_reminder_scheduler()
    except Exception as exc:
        print(f"⚠️ No se pudo iniciar reminder scheduler: {exc}")

    try:
        yield
    finally:
        try:
            await stop_email_queue_worker()
            print("✅ Email queue worker detenido correctamente")
        except Exception as exc:
            print(f"⚠️ No se pudo detener email queue worker: {exc}")

        try:
            stop_reminder_scheduler()
        except Exception as exc:
            print(f"⚠️ No se pudo detener reminder scheduler: {exc}")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://10.0.0.13:5173",
        "http://10.0.0.13:5174",
        "http://10.0.0.13:3000",
        "http://10.0.0.13:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://kalirio.kalimasgroup.net",
        "https://api.kalirio.kalimasgroup.net",
        "http://kalirio.kalimasgroup.net",
        "http://api.kalirio.kalimasgroup.net",
        "https://suite.kalimasgroup.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

app.add_middleware(SecurityHeadersMiddleware)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount(
    settings.UPLOAD_PUBLIC_PREFIX,
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(companies.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(job_roles.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(assignments.router, prefix=settings.API_PREFIX)
app.include_router(shifts.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(news.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(whatsapp.router, prefix=settings.API_PREFIX)
app.include_router(push.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(payroll.router, prefix=settings.API_PREFIX)
app.include_router(payments.router, prefix=settings.API_PREFIX)
app.include_router(company_email_settings.router, prefix=settings.API_PREFIX)
app.include_router(email_templates.router, prefix=settings.API_PREFIX)
app.include_router(email_delivery_logs.router, prefix=settings.API_PREFIX)
app.include_router(email_queue.router, prefix=settings.API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}