"""Servicio de notificaciones por email usando Resend."""
import asyncio
from app.core.config import settings


async def send_invitation_email(
    to_email: str,
    employee_name: str,
    event_name: str,
    event_date: str,
    event_address: str,
    role_name: str,
    hourly_rate: str,
) -> bool:
    """Envía email de invitación a un empleado."""
    if not settings.RESEND_API_KEY:
        print(f"[NOTIF] Email no enviado (sin API key): {to_email} — {event_name}")
        return False

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Invitación a Evento</h2>
          <p>Hola <strong>{employee_name}</strong>,</p>
          <p>Has sido invitado/a a trabajar en el siguiente evento:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Evento:</strong> {event_name}</p>
            <p><strong>Fecha:</strong> {event_date}</p>
            <p><strong>Dirección:</strong> {event_address}</p>
            <p><strong>Tu rol:</strong> {role_name}</p>
            <p><strong>Tarifa:</strong> ${hourly_rate}/hora</p>
          </div>
          <p>Por favor ingresa a la plataforma para aceptar o rechazar esta invitación.</p>
          <p style="color: #6b7280; font-size: 12px;">Event Staffing Platform</p>
        </div>
        """

        resend.Emails.send({
            "from": "noreply@eventstaff.app",
            "to": to_email,
            "subject": f"Invitación: {event_name}",
            "html": html,
        })
        return True
    except Exception as e:
        print(f"[NOTIF] Error enviando email a {to_email}: {e}")
        return False


async def send_bulk_invitations(invitations: list[dict]) -> dict:
    """Envía emails de invitación en paralelo."""
    tasks = [
        send_invitation_email(
            to_email=inv["email"],
            employee_name=inv["name"],
            event_name=inv["event_name"],
            event_date=inv["event_date"],
            event_address=inv["event_address"],
            role_name=inv["role_name"],
            hourly_rate=inv["hourly_rate"],
        )
        for inv in invitations
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    sent = sum(1 for r in results if r is True)
    return {"sent": sent, "total": len(invitations)}
