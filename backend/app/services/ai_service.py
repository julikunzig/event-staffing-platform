"""
AI service using OpenAI API.
- generate_event_notes: generates additional notes for an event (admin feature)
- chat_with_assistant: employee chatbot that answers questions about their shifts/events
"""

from app.core.config import settings


async def generate_event_notes(
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    dress_code: str | None,
    roles: list[dict],
    language: str = "es",
) -> str:
    """
    Generate additional notes for an event using OpenAI.
    Falls back to a template if OpenAI is unavailable.
    language: "es" for Spanish, "en" for English.
    """
    roles_text = ", ".join([f"{r['name']} ({r['slots']} slots)" for r in roles])
    dress_text = dress_code or ("Not specified" if language == "en" else "No especificado")
    lang_instruction = "in English" if language == "en" else "en español"

    # Try OpenAI first
    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

            prompt = f"""You are an assistant for a social event staffing platform.

The administrator is creating an event:
- Name: {event_name}
- Date: {event_date}
- Start time: {start_time}
- Address: {address}, {city}, {state}
- Dress code: {dress_text}
- Required staff: {roles_text}

Generate concise and professional additional notes for the staff. Include:
1. Arrival instructions (arrive 30 min early)
2. Staff meeting point or entrance
3. Dress code reminder
4. General professional behavior instructions
5. Emergency contact (leave a blank space to fill in)

Reply ONLY with the notes, no titles or extra explanations. Max 150 words. Write {lang_instruction}."""

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7,
            )
            notes = response.choices[0].message.content.strip()
            return notes.upper()
        except Exception:
            pass  # Fall through to template

    # Template fallback
    if language == "en":
        notes = f"""ALL STAFF MUST ARRIVE 30 MINUTES BEFORE THE EVENT STARTS ({start_time}).

MEETING POINT: MAIN ENTRANCE AT {address.upper()}, {city.upper()}, {state.upper()}.

MANDATORY DRESS CODE: {dress_text.upper()}. ENTRY WILL NOT BE PERMITTED WITHOUT COMPLYING WITH THE DRESS CODE.

REQUIRED STAFF: {roles_text.upper()}.

PROFESSIONAL BEHAVIOR: MAINTAIN A CORDIAL AND PROFESSIONAL ATTITUDE AT ALL TIMES. NO CELL PHONE USE DURING SERVICE.

EMERGENCY CONTACT: ___________________________

REPORT ANY ISSUES IMMEDIATELY TO THE EVENT COORDINATOR."""
    else:
        notes = f"""TODO EL PERSONAL DEBE LLEGAR 30 MINUTOS ANTES DEL INICIO DEL EVENTO ({start_time}).

PUNTO DE ENCUENTRO: ENTRADA PRINCIPAL DE {address.upper()}, {city.upper()}, {state.upper()}.

DRESS CODE OBLIGATORIO: {dress_text.upper()}. NO SE PERMITIRÁ EL INGRESO SIN CUMPLIR EL DRESS CODE.

PERSONAL REQUERIDO: {roles_text.upper()}.

COMPORTAMIENTO PROFESIONAL: MANTENER ACTITUD CORDIAL Y PROFESIONAL EN TODO MOMENTO. NO USO DE CELULAR DURANTE EL SERVICIO.

CONTACTO DE EMERGENCIA: ___________________________

CUALQUIER INCONVENIENTE REPORTARLO INMEDIATAMENTE AL COORDINADOR DEL EVENTO."""

    return notes


async def chat_with_employee_assistant(
    message: str,
    employee_name: str,
    company_name: str,
    context: dict,  # assignments, upcoming events, recent shifts
) -> str:
    """
    Employee chatbot. Answers questions about shifts, events, payments.
    context = {
        "assignments": [...],
        "upcoming_events": [...],
        "recent_shifts": [...],
        "total_hours_this_month": float,
        "total_pay_this_month": float,
    }
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured")

    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    # Build context string
    ctx_parts = []

    if context.get("upcoming_events"):
        events_str = "\n".join([
            f"  - {e['name']} el {e['date']} a las {e['time']} en {e['address']} (rol: {e['role']})"
            for e in context["upcoming_events"]
        ])
        ctx_parts.append(f"Próximos eventos asignados:\n{events_str}")

    if context.get("recent_shifts"):
        shifts_str = "\n".join([
            f"  - {s['event_name']} el {s['date']}: {s['hours']}h trabajadas, ${s['pay']} ganados"
            for s in context["recent_shifts"]
        ])
        ctx_parts.append(f"Turnos recientes:\n{shifts_str}")

    if context.get("total_hours_this_month") is not None:
        ctx_parts.append(f"Horas trabajadas este mes: {context['total_hours_this_month']:.1f}h")

    if context.get("total_pay_this_month") is not None:
        ctx_parts.append(f"Pago estimado este mes: ${context['total_pay_this_month']:.2f}")

    context_text = "\n\n".join(ctx_parts) if ctx_parts else "No hay datos disponibles aún."

    system_prompt = f"""Eres un asistente amigable para empleados de la plataforma EventsControl de la empresa {company_name}.
Estás hablando con {employee_name}.

Información actual del empleado:
{context_text}

Responde de forma concisa y amigable. Solo responde preguntas relacionadas con sus turnos, eventos, horarios y pagos.
Si no tienes la información exacta, dilo claramente. No inventes datos.
Responde en el mismo idioma que el empleado use (español o inglés)."""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        max_tokens=300,
        temperature=0.8,
    )

    return response.choices[0].message.content.strip()
