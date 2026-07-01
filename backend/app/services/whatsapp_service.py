"""
WhatsApp bot service.
"""

import json
import os

# Read from environment variables (set in backend/.env)
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")


def send_whatsapp(to: str, body: str, from_number: str | None = None) -> bool:
    """Send a WhatsApp message via Twilio.

    from_number: número de la empresa (whatsapp:+15551234567).
    Si no se pasa, usa TWILIO_WHATSAPP_FROM del entorno (fallback sandbox).
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print(f"[WhatsApp] Twilio not configured. Would send to {to}: {body}")
        return False
    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        from_= from_number or TWILIO_WHATSAPP_FROM
        if not from_.startswith("whatsapp:"):
            from_ = f"whatsapp:{from_}"
        client.messages.create(
            from_=from_,
            to=f"whatsapp:{to}" if not to.startswith("whatsapp:") else to,
            body=body,
        )
        return True
    except Exception as e:
        print(f"[WhatsApp] Error sending message: {e}")
        return False


async def extract_event_from_message(message: str, language: str = "es") -> dict | None:
    """Use GPT to extract event data from a natural language WhatsApp message."""
    if not OPENAI_API_KEY:
        return None

    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    today_hint = "Today's date context: use the year 2026 if no year is specified."

    prompt = f"""You are an assistant that extracts event data from natural language messages.

{today_hint}

Extract the following fields from this message and return ONLY a valid JSON object:
- name: event name (string, required)
- event_date: date in YYYY-MM-DD format (string, required)
- start_time: time in HH:MM format 24h (string, required)
- end_time: time in HH:MM format 24h or null (string or null)
- address: street address (string, required)
- city: city name (string or null)
- state: US state abbreviation like FL, NY, CA (string or null)
- zip_code: zip code (string or null)
- dress_code: dress code description (string or null)
- roles: array of objects with "name" (string) and "slots" (integer) fields

Message: "{message}"

Return ONLY the JSON, no explanation. If you cannot extract a required field, return null for that field.
Example: {{"name":"Wedding Smith","event_date":"2026-06-15","start_time":"18:00","end_time":null,"address":"123 Main St","city":"Miami","state":"FL","zip_code":null,"dress_code":"Formal","roles":[{{"name":"Bartender","slots":2}},{{"name":"Server","slots":3}}]}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        # Clean markdown code blocks if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        return data
    except Exception as e:
        print(f"[WhatsApp] GPT extraction error: {e}")
        return None


def format_event_confirmation(event_data: dict, event_id: int, language: str = "es") -> str:
    """Format a confirmation message after event creation."""
    roles_text = ""
    if event_data.get("roles"):
        roles_list = [f"  • {r['name']}: {r['slots']} cupos" for r in event_data["roles"]]
        roles_text = "\n".join(roles_list)

    if language == "en":
        msg = f"""✅ *Event created successfully!*

📋 *{event_data.get('name', 'Event')}*
📅 Date: {event_data.get('event_date', '')}
🕐 Time: {event_data.get('start_time', '')}
📍 {event_data.get('address', '')}, {event_data.get('city', '') or ''} {event_data.get('state', '') or ''}
👔 Dress code: {event_data.get('dress_code') or 'Not specified'}

👥 Required staff:
{roles_text or '  (none specified)'}

🔗 Event ID: #{event_id}

You can now invite employees from the app or publish the event so they can apply."""
    else:
        msg = f"""✅ *¡Evento creado exitosamente!*

📋 *{event_data.get('name', 'Evento')}*
📅 Fecha: {event_data.get('event_date', '')}
🕐 Hora: {event_data.get('start_time', '')}
📍 {event_data.get('address', '')}, {event_data.get('city', '') or ''} {event_data.get('state', '') or ''}
👔 Dress code: {event_data.get('dress_code') or 'No especificado'}

👥 Personal requerido:
{roles_text or '  (no especificado)'}

🔗 ID del evento: #{event_id}

Ahora puedes invitar empleados desde la app o publicar el evento para que puedan aplicar."""

    return msg


HELP_ES = """🤖 *Asistente EventsControl*

Puedo crear eventos para ti. Envíame un mensaje como:

_"Crear evento: Boda García, 15 de junio, 6pm, 123 Main St Miami FL, dress code formal, 2 bartenders y 3 servers"_

O simplemente descríbeme el evento con:
• Nombre del evento
• Fecha y hora
• Dirección
• Dress code (opcional)
• Personal necesario (rol y cantidad)

¡Eso es todo! 🎉"""

HELP_EN = """🤖 *EventsControl Assistant*

I can create events for you. Send me a message like:

_"Create event: Smith Wedding, June 15, 6pm, 123 Main St Miami FL, formal dress code, 2 bartenders and 3 servers"_

Or just describe the event with:
• Event name
• Date and time
• Address
• Dress code (optional)
• Required staff (role and quantity)

That's it! 🎉"""
