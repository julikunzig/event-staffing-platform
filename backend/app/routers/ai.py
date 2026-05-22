from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc
from pydantic import BaseModel
from typing import Annotated
from app.core.database import get_db
from app.core.auth import require_role, get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])
AdminDep = Annotated[dict, Depends(require_role("super_admin", "admin"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


# ─────────────────────────────────────────────────────────────────────────────
# #5 — Generate event notes (admin)
# ─────────────────────────────────────────────────────────────────────────────

class GenerateNotesRequest(BaseModel):
    event_name: str
    event_date: str
    start_time: str
    address: str
    city: str = ""
    state: str = ""
    dress_code: str | None = None
    roles: list[dict]
    language: str = "es"  # "es" or "en"


class GenerateNotesResponse(BaseModel):
    notes: str


@router.post("/generate-notes", response_model=GenerateNotesResponse)
async def generate_event_notes(
    body: GenerateNotesRequest,
    current_user: AdminDep,
):
    """Generate additional notes for an event using AI (admin only)."""
    from app.services.ai_service import generate_event_notes
    try:
        notes = await generate_event_notes(
            event_name=body.event_name,
            event_date=body.event_date,
            start_time=body.start_time,
            address=body.address,
            city=body.city,
            state=body.state,
            dress_code=body.dress_code,
            roles=body.roles,
            language=body.language,
        )
        return GenerateNotesResponse(notes=notes)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando notas: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# #3 — Employee chatbot
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def employee_chat(
    body: ChatRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Employee chatbot — answers questions about shifts, events and payments."""
    from app.models import EventAssignment, Event, Shift, JobRole, Company, UserCompanyMembership, User
    from app.services.ai_service import chat_with_employee_assistant

    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]

    # Get employee name
    user = await db.get(User, user_id)
    employee_name = user.name if user else "Empleado"

    # Get company name
    company = await db.get(Company, company_id)
    company_name = company.name if company else "la empresa"

    # Get upcoming approved assignments with event info
    from datetime import date
    today = date.today()

    upcoming_result = await db.execute(
        select(EventAssignment, Event, JobRole)
        .join(Event, Event.id == EventAssignment.event_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            EventAssignment.status.in_(["approved", "invited", "pending"]),
            Event.event_date >= today,
        )
        .order_by(Event.event_date)
        .limit(5)
    )
    upcoming_rows = upcoming_result.all()
    upcoming_events = [
        {
            "name": ev.name,
            "date": str(ev.event_date),
            "time": str(ev.start_time),
            "address": f"{ev.address}, {ev.city or ''}, {ev.state or ''}".strip(", "),
            "role": role.name,
        }
        for _, ev, role in upcoming_rows
    ]

    # Get recent completed shifts
    recent_result = await db.execute(
        select(Shift, Event, JobRole)
        .join(EventAssignment, EventAssignment.id == Shift.assignment_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            Shift.clock_out.isnot(None),
        )
        .order_by(Event.event_date.desc())
        .limit(5)
    )
    recent_rows = recent_result.all()
    recent_shifts = [
        {
            "event_name": ev.name,
            "date": str(ev.event_date),
            "hours": float(shift.hours_worked or 0),
            "pay": float(shift.total_pay or 0),
        }
        for shift, ev, _ in recent_rows
    ]

    # Monthly totals
    first_of_month = today.replace(day=1)
    from sqlalchemy import cast, Float as SAFloat
    monthly_result = await db.execute(
        select(
            sqlfunc.sum(cast(Shift.hours_worked, SAFloat)),
            sqlfunc.sum(cast(Shift.total_pay, SAFloat)),
        )
        .join(EventAssignment, EventAssignment.id == Shift.assignment_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            Shift.clock_out.isnot(None),
            Event.event_date >= first_of_month,
        )
    )
    monthly = monthly_result.one()
    total_hours = float(monthly[0] or 0)
    total_pay = float(monthly[1] or 0)

    context = {
        "upcoming_events": upcoming_events,
        "recent_shifts": recent_shifts,
        "total_hours_this_month": total_hours,
        "total_pay_this_month": total_pay,
    }

    try:
        reply = await chat_with_employee_assistant(
            message=body.message,
            employee_name=employee_name,
            company_name=company_name,
            context=context,
        )
        return ChatResponse(reply=reply)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el asistente: {str(e)}")
