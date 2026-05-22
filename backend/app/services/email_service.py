"""
Email service - uses Resend API to send bilingual notifications.
"""

from typing import Optional, List

# Resend API key - hardcoded to avoid Docker env issues
RESEND_API_KEY = "re_cNaePJ7i_DiJJVEyDKSMAYGAufwtcpBQw"
FROM_ADDRESS = "EventsControl <onboarding@resend.dev>"
# Resend test mode: can only send to the account owner's email.
# All emails are redirected here until a domain is verified in resend.com/domains
TEST_RECIPIENT = "julian.kunzig@gmail.com"


class EmailTemplates:
    """Email templates in English and Spanish"""

    @staticmethod
    def event_published_to_roles(
        event_name: str,
        event_date: str,
        start_time: str,
        address: str,
        city: str,
        state: str,
        zip_code: str,
        roles: List[dict],  # [{"name": "Server", "rate": "20.00"}, ...]
        dress_code: Optional[str] = None,
    ) -> tuple[str, str]:
        """Email sent to employees with required roles when event is published"""

        roles_text_en = "\n".join(
            [f"• {role['name']}: ${role['rate']}/hour" for role in roles]
        )
        roles_text_es = "\n".join(
            [f"• {role['name']}: ${role['rate']}/hora" for role in roles]
        )

        html_en = f"""
        <h2>New Event Available: {event_name}</h2>
        <p>A new event has been published and is looking for staff with your qualifications!</p>
        
        <h3>Event Details:</h3>
        <ul>
            <li><strong>Event:</strong> {event_name}</li>
            <li><strong>Date:</strong> {event_date}</li>
            <li><strong>Time:</strong> {start_time}</li>
            <li><strong>Location:</strong> {address}, {city}, {state} {zip_code}</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <h3>Positions Available:</h3>
        <pre>{roles_text_en}</pre>
        
        <p>Log in to the system to apply for this event!</p>
        """

        html_es = f"""
        <h2>Nuevo Evento Disponible: {event_name}</h2>
        <p>¡Se ha publicado un nuevo evento y está buscando personal con tus calificaciones!</p>
        
        <h3>Detalles del Evento:</h3>
        <ul>
            <li><strong>Evento:</strong> {event_name}</li>
            <li><strong>Fecha:</strong> {event_date}</li>
            <li><strong>Hora:</strong> {start_time}</li>
            <li><strong>Ubicación:</strong> {address}, {city}, {state} {zip_code}</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <h3>Posiciones Disponibles:</h3>
        <pre>{roles_text_es}</pre>
        
        <p>¡Inicia sesión en el sistema para aplicar a este evento!</p>
        """

        return html_en, html_es

    @staticmethod
    def event_invitation(
        event_name: str,
        event_date: str,
        start_time: str,
        address: str,
        city: str,
        state: str,
        zip_code: str,
        role_name: str,
        hourly_rate: str,
        dress_code: Optional[str] = None,
    ) -> tuple[str, str]:
        """Email sent to invited employees"""

        html_en = f"""
        <h2>You're Invited to Work: {event_name}</h2>
        <p>You have been invited to work at an event!</p>
        
        <h3>Event Details:</h3>
        <ul>
            <li><strong>Event:</strong> {event_name}</li>
            <li><strong>Date:</strong> {event_date}</li>
            <li><strong>Time:</strong> {start_time}</li>
            <li><strong>Location:</strong> {address}, {city}, {state} {zip_code}</li>
            <li><strong>Position:</strong> {role_name}</li>
            <li><strong>Pay Rate:</strong> ${hourly_rate}/hour</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <p>Log in to the system to accept or decline this invitation.</p>
        """

        html_es = f"""
        <h2>¡Has Sido Invitado a Trabajar: {event_name}</h2>
        <p>¡Has sido invitado a trabajar en un evento!</p>
        
        <h3>Detalles del Evento:</h3>
        <ul>
            <li><strong>Evento:</strong> {event_name}</li>
            <li><strong>Fecha:</strong> {event_date}</li>
            <li><strong>Hora:</strong> {start_time}</li>
            <li><strong>Ubicación:</strong> {address}, {city}, {state} {zip_code}</li>
            <li><strong>Posición:</strong> {role_name}</li>
            <li><strong>Tarifa:</strong> ${hourly_rate}/hora</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>
        """

        return html_en, html_es

    @staticmethod
    def employee_applied_to_event(
        employee_name: str,
        event_name: str,
        role_name: str,
        event_date: str,
    ) -> tuple[str, str]:
        """Email sent to admin when employee applies to event"""

        html_en = f"""
        <h2>New Application: {event_name}</h2>
        <p><strong>{employee_name}</strong> has applied to work as a <strong>{role_name}</strong> for your event.</p>
        
        <h3>Event Details:</h3>
        <ul>
            <li><strong>Event:</strong> {event_name}</li>
            <li><strong>Date:</strong> {event_date}</li>
            <li><strong>Position:</strong> {role_name}</li>
            <li><strong>Applicant:</strong> {employee_name}</li>
        </ul>
        
        <p>Log in to the system to approve or reject this application.</p>
        """

        html_es = f"""
        <h2>Nueva Aplicación: {event_name}</h2>
        <p><strong>{employee_name}</strong> ha aplicado para trabajar como <strong>{role_name}</strong> en tu evento.</p>
        
        <h3>Detalles del Evento:</h3>
        <ul>
            <li><strong>Evento:</strong> {event_name}</li>
            <li><strong>Fecha:</strong> {event_date}</li>
            <li><strong>Posición:</strong> {role_name}</li>
            <li><strong>Solicitante:</strong> {employee_name}</li>
        </ul>
        
        <p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>
        """

        return html_en, html_es

    @staticmethod
    def invitation_response(
        employee_name: str,
        event_name: str,
        role_name: str,
        event_date: str,
        accepted: bool,
    ) -> tuple[str, str]:
        """Email sent to admin when employee accepts/rejects invitation"""

        status_en = "accepted" if accepted else "declined"
        status_es = "aceptó" if accepted else "rechazó"

        html_en = f"""
        <h2>Invitation Response: {event_name}</h2>
        <p><strong>{employee_name}</strong> has <strong>{status_en}</strong> the invitation to work as a <strong>{role_name}</strong>.</p>
        
        <h3>Event Details:</h3>
        <ul>
            <li><strong>Event:</strong> {event_name}</li>
            <li><strong>Date:</strong> {event_date}</li>
            <li><strong>Position:</strong> {role_name}</li>
            <li><strong>Employee:</strong> {employee_name}</li>
            <li><strong>Response:</strong> {status_en.upper()}</li>
        </ul>
        
        {f'<p>You may need to invite another employee if this position is still open.</p>' if not accepted else '<p>This employee is confirmed for the event.</p>'}
        """

        html_es = f"""
        <h2>Respuesta a Invitación: {event_name}</h2>
        <p><strong>{employee_name}</strong> ha <strong>{status_es}</strong> la invitación para trabajar como <strong>{role_name}</strong>.</p>
        
        <h3>Detalles del Evento:</h3>
        <ul>
            <li><strong>Evento:</strong> {event_name}</li>
            <li><strong>Fecha:</strong> {event_date}</li>
            <li><strong>Posición:</strong> {role_name}</li>
            <li><strong>Empleado:</strong> {employee_name}</li>
            <li><strong>Respuesta:</strong> {status_es.upper()}</li>
        </ul>
        
        {f'<p>Es posible que debas invitar a otro empleado si esta posición aún está disponible.</p>' if not accepted else '<p>Este empleado está confirmado para el evento.</p>'}
        """

        return html_en, html_es

    @staticmethod
    def application_approved(
        event_name: str,
        event_date: str,
        start_time: str,
        address: str,
        city: str,
        state: str,
        zip_code: str,
        role_name: str,
        hourly_rate: str,
        dress_code: Optional[str] = None,
    ) -> tuple[str, str]:
        """Email sent to employee when application is approved"""

        html_en = f"""
        <h2>Application Approved: {event_name}</h2>
        <p>Congratulations! Your application has been approved.</p>
        
        <h3>Event Details:</h3>
        <ul>
            <li><strong>Event:</strong> {event_name}</li>
            <li><strong>Date:</strong> {event_date}</li>
            <li><strong>Time:</strong> {start_time}</li>
            <li><strong>Location:</strong> {address}, {city}, {state} {zip_code}</li>
            <li><strong>Position:</strong> {role_name}</li>
            <li><strong>Pay Rate:</strong> ${hourly_rate}/hour</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <p>Log in to the system to view more details and prepare for the event.</p>
        """

        html_es = f"""
        <h2>Aplicación Aprobada: {event_name}</h2>
        <p>¡Felicidades! Tu aplicación ha sido aprobada.</p>
        
        <h3>Detalles del Evento:</h3>
        <ul>
            <li><strong>Evento:</strong> {event_name}</li>
            <li><strong>Fecha:</strong> {event_date}</li>
            <li><strong>Hora:</strong> {start_time}</li>
            <li><strong>Ubicación:</strong> {address}, {city}, {state} {zip_code}</li>
            <li><strong>Posición:</strong> {role_name}</li>
            <li><strong>Tarifa:</strong> ${hourly_rate}/hora</li>
            {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
        </ul>
        
        <p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>
        """

        return html_en, html_es

    @staticmethod
    def password_reset(reset_link: str) -> tuple[str, str]:
        """Email sent to user for password reset"""

        html_en = f"""
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        
        <p><a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        
        <p>This link will expire in 2 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
        """

        html_es = f"""
        <h2>Solicitud de Restablecimiento de Contraseña</h2>
        <p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>
        
        <p><a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a></p>
        
        <p>Este enlace expirará en 2 horas.</p>
        <p>Si no solicitaste esto, por favor ignora este correo.</p>
        """

        return html_en, html_es


async def send_email(
    to_email: str,
    subject_en: str,
    subject_es: str,
    html_en: str,
    html_es: str,
) -> bool:
    """
    Send bilingual email via Resend API.
    In test mode (no verified domain), all emails are redirected to TEST_RECIPIENT
    with the original recipient noted in the subject line.
    """
    try:
        import resend
        resend.api_key = RESEND_API_KEY

        combined_html = f"""<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
    .lang-header {{ font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }}
    .section {{ margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #eee; }}
    h2 {{ color: #2563eb; }}
  </style>
</head>
<body>
  <div class="section">
    <div class="lang-header">🇺🇸 English</div>
    {html_en}
  </div>
  <div class="section">
    <div class="lang-header">🇪🇸 Español</div>
    {html_es}
  </div>
</body>
</html>"""

        # Resend test mode: redirect to TEST_RECIPIENT, note original in subject
        actual_to = TEST_RECIPIENT
        subject = f"{subject_en} / {subject_es}"
        if actual_to != to_email:
            subject = f"[Para: {to_email}] {subject}"

        response = resend.Emails.send({
            "from": FROM_ADDRESS,
            "to": [actual_to],
            "subject": subject,
            "html": combined_html,
        })

        email_id = response.get("id")
        print(f"✅ Email sent via Resend | to={actual_to} | original={to_email} | id={email_id}")
        return email_id is not None

    except Exception as e:
        print(f"❌ Resend error sending to {to_email}: {str(e)}")
        return False


async def send_event_published_email(
    employee_emails: List[str],
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    roles: List[dict],
    dress_code: Optional[str] = None,
) -> int:
    """Send event published notification to employees with required roles"""
    html_en, html_es = EmailTemplates.event_published_to_roles(
        event_name, event_date, start_time, address, city, state, zip_code, roles, dress_code
    )

    sent_count = 0
    for email in employee_emails:
        if await send_email(
            email,
            f"New Event Available: {event_name}",
            f"Nuevo Evento Disponible: {event_name}",
            html_en,
            html_es,
        ):
            sent_count += 1

    return sent_count


async def send_event_invitation_email(
    employee_emails: List[str],
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    role_name: str,
    hourly_rate: str,
    dress_code: Optional[str] = None,
) -> int:
    """Send event invitation to specific employees"""
    html_en, html_es = EmailTemplates.event_invitation(
        event_name, event_date, start_time, address, city, state, zip_code, role_name, hourly_rate, dress_code
    )

    sent_count = 0
    for email in employee_emails:
        if await send_email(
            email,
            f"You're Invited: {event_name}",
            f"¡Has Sido Invitado: {event_name}",
            html_en,
            html_es,
        ):
            sent_count += 1

    return sent_count


async def send_application_notification_email(
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
) -> bool:
    """Send notification to admin when employee applies"""
    html_en, html_es = EmailTemplates.employee_applied_to_event(
        employee_name, event_name, role_name, event_date
    )

    return await send_email(
        admin_email,
        f"New Application: {event_name}",
        f"Nueva Aplicación: {event_name}",
        html_en,
        html_es,
    )


async def send_invitation_response_email(
    admin_email: str,
    employee_name: str,
    event_name: str,
    role_name: str,
    event_date: str,
    accepted: bool,
) -> bool:
    """Send notification to admin when employee responds to invitation"""
    html_en, html_es = EmailTemplates.invitation_response(
        employee_name, event_name, role_name, event_date, accepted
    )

    status_en = "Accepted" if accepted else "Declined"
    status_es = "Aceptada" if accepted else "Rechazada"

    return await send_email(
        admin_email,
        f"Invitation Response: {event_name} - {status_en}",
        f"Respuesta a Invitación: {event_name} - {status_es}",
        html_en,
        html_es,
    )


async def send_application_approved_email(
    employee_email: str,
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    role_name: str,
    hourly_rate: str,
    dress_code: Optional[str] = None,
) -> bool:
    """Send confirmation email to employee when application is approved"""
    html_en, html_es = EmailTemplates.application_approved(
        event_name, event_date, start_time, address, city, state, zip_code, role_name, hourly_rate, dress_code
    )

    return await send_email(
        employee_email,
        f"Application Approved: {event_name}",
        f"Aplicación Aprobada: {event_name}",
        html_en,
        html_es,
    )


async def send_password_reset_email(
    user_email: str,
    reset_link: str,
) -> bool:
    """Send password reset email to user"""
    html_en, html_es = EmailTemplates.password_reset(reset_link)

    return await send_email(
        user_email,
        "Password Reset Request",
        "Solicitud de Restablecimiento de Contraseña",
        html_en,
        html_es,
    )


async def send_event_published_email_personalized(
    employee_email: str,
    employee_name: str,
    event_name: str,
    event_date: str,
    start_time: str,
    address: str,
    city: str,
    state: str,
    zip_code: str,
    roles: List[dict],
    dress_code: Optional[str] = None,
) -> bool:
    """Send a personalized event published notification to a single employee."""

    roles_text_en = "\n".join(
        [f"• {role['name']}: ${role['rate']}/hour" for role in roles]
    )
    roles_text_es = "\n".join(
        [f"• {role['name']}: ${role['rate']}/hora" for role in roles]
    )

    greeting_en = f"Hi {employee_name}," if employee_name else "Hello,"
    greeting_es = f"Hola {employee_name}," if employee_name else "Hola,"

    html_en = f"""
    <h2>{greeting_en}</h2>
    <h3>New Event Available: {event_name}</h3>
    <p>A new event has been published and is looking for staff with your qualifications!</p>

    <h4>Event Details:</h4>
    <ul>
        <li><strong>Event:</strong> {event_name}</li>
        <li><strong>Date:</strong> {event_date}</li>
        <li><strong>Time:</strong> {start_time}</li>
        <li><strong>Location:</strong> {address}, {city}, {state} {zip_code}</li>
        {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
    </ul>

    <h4>Positions Available:</h4>
    <pre>{roles_text_en}</pre>

    <p>Log in to the system to apply for this event!</p>
    """

    html_es = f"""
    <h2>{greeting_es}</h2>
    <h3>Nuevo Evento Disponible: {event_name}</h3>
    <p>¡Se ha publicado un nuevo evento y está buscando personal con tus calificaciones!</p>

    <h4>Detalles del Evento:</h4>
    <ul>
        <li><strong>Evento:</strong> {event_name}</li>
        <li><strong>Fecha:</strong> {event_date}</li>
        <li><strong>Hora:</strong> {start_time}</li>
        <li><strong>Ubicación:</strong> {address}, {city}, {state} {zip_code}</li>
        {f'<li><strong>Dress Code:</strong> {dress_code}</li>' if dress_code else ''}
    </ul>

    <h4>Posiciones Disponibles:</h4>
    <pre>{roles_text_es}</pre>

    <p>¡Inicia sesión en el sistema para aplicar a este evento!</p>
    """

    return await send_email(
        employee_email,
        f"New Event Available: {event_name}",
        f"Nuevo Evento Disponible: {event_name}",
        html_en,
        html_es,
    )
