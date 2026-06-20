import asyncio
import os

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Company, EmailTemplate


OVERWRITE_EXISTING = os.getenv("OVERWRITE_EMAIL_TEMPLATES", "false").lower() == "true"


DEFAULT_EMAIL_TEMPLATES = [
    {
        "code": "WELCOME_USER",
        "name": "Bienvenida de usuario",
        "subject": "Bienvenido a {{company_name}} - Tu cuenta",
        "variables": ["user_name", "username", "password", "company_name", "login_url"],
        "html_body": """
<h2>¡Bienvenido a EventsControl, {{user_name}}!</h2>

<p>Tu cuenta ha sido creada por <strong>{{company_name}}</strong>. A continuación tus credenciales de acceso:</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0 0 8px;"><strong>Usuario/Email:</strong> {{username}}</p>
  <p style="margin:0 0 8px;"><strong>Contraseña temporal:</strong> {{password}}</p>
  <p style="margin:0;"><strong>Empresa:</strong> {{company_name}}</p>
</div>

<p>⚠️ <strong>Importante:</strong> Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.</p>

<p>
  <a href="{{login_url}}" style="display:inline-block;background:#2db84b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ingresar a EventsControl
  </a>
</p>

<p style="font-size:12px;color:#6b7280;">Si el botón no funciona, copia y pega este enlace: {{login_url}}</p>
""",
        "text_body": """
Bienvenido a EventsControl, {{user_name}}.

Tu cuenta ha sido creada por {{company_name}}.

Usuario/Email: {{username}}
Contraseña temporal: {{password}}
Empresa: {{company_name}}

Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.

Ingresa aquí:
{{login_url}}
""",
    },
    {
        "code": "EXISTING_USER_NEW_COMPANY",
        "name": "Usuario existente agregado a empresa",
        "subject": "Has sido agregado a {{company_name}}",
        "variables": ["user_name", "company_name", "login_url"],
        "html_body": """
<h2>¡Has sido agregado a una nueva empresa, {{user_name}}!</h2>

<p>Has sido asociado a <strong>{{company_name}}</strong> en EventsControl.</p>

<p>Puedes iniciar sesión con tus credenciales actuales y seleccionar <strong>{{company_name}}</strong> como tu empresa durante el login.</p>

<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0 0 8px;"><strong>Nueva empresa:</strong> {{company_name}}</p>
  <p style="margin:0;">Usa tu email/usuario y contraseña actuales para ingresar.</p>
</div>

<p>
  <a href="{{login_url}}" style="display:inline-block;background:#2db84b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ingresar a EventsControl
  </a>
</p>
""",
        "text_body": """
Hola {{user_name}}.

Has sido asociado a {{company_name}} en EventsControl.

Puedes iniciar sesión con tus credenciales actuales y seleccionar {{company_name}} durante el login.

{{login_url}}
""",
    },
    {
        "code": "PASSWORD_RESET",
        "name": "Recuperación de contraseña",
        "subject": "Solicitud de restablecimiento de contraseña",
        "variables": ["reset_link"],
        "html_body": """
<h2>Solicitud de restablecimiento de contraseña</h2>

<p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>

<p>
  <a href="{{reset_link}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
    Restablecer contraseña
  </a>
</p>

<p>Este enlace expirará en 2 horas.</p>
<p>Si no solicitaste esto, puedes ignorar este correo.</p>
""",
        "text_body": """
Solicitaste restablecer tu contraseña.

Haz clic en este enlace para crear una nueva contraseña:
{{reset_link}}

Este enlace expirará en 2 horas.
Si no solicitaste esto, puedes ignorar este correo.
""",
    },
    {
        "code": "EVENT_PUBLISHED",
        "name": "Nuevo evento disponible",
        "subject": "Nuevo evento disponible: {{event_name}}",
        "variables": [
            "employee_name",
            "event_name",
            "event_date",
            "start_time",
            "address",
            "city",
            "state",
            "zip_code",
            "roles",
            "dress_code",
        ],
        "html_body": """
<h2>Hola {{employee_name}},</h2>

<h3>Nuevo evento disponible: {{event_name}}</h3>

<p>Se ha publicado un nuevo evento y está buscando personal con tus calificaciones.</p>

<h4>Detalles del evento:</h4>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{address}}, {{city}}, {{state}} {{zip_code}}</li>
  <li><strong>Código de vestimenta:</strong> {{dress_code}}</li>
</ul>

<h4>Posiciones disponibles:</h4>
<pre>{{roles}}</pre>

<p>Inicia sesión en el sistema para aplicar a este evento.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Nuevo evento disponible: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Código de vestimenta: {{dress_code}}

Posiciones disponibles:
{{roles}}

Inicia sesión en el sistema para aplicar.
""",
    },
    {
        "code": "EVENT_INVITATION",
        "name": "Invitación a evento",
        "subject": "Has sido invitado: {{event_name}}",
        "variables": [
            "event_name",
            "event_date",
            "start_time",
            "address",
            "city",
            "state",
            "zip_code",
            "role_name",
            "hourly_rate",
            "dress_code",
        ],
        "html_body": """
<h2>Has sido invitado a trabajar: {{event_name}}</h2>

<p>Has recibido una invitación para trabajar en un evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{address}}, {{city}}, {{state}} {{zip_code}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Tarifa:</strong> ${{hourly_rate}}/hora</li>
  <li><strong>Código de vestimenta:</strong> {{dress_code}}</li>
</ul>

<p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>
""",
        "text_body": """
Has sido invitado a trabajar: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para aceptar o rechazar esta invitación.
""",
    },
    {
        "code": "APPLICATION_RECEIVED",
        "name": "Aplicación recibida",
        "subject": "Nueva aplicación: {{event_name}}",
        "variables": ["employee_name", "event_name", "role_name", "event_date"],
        "html_body": """
<h2>Nueva aplicación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> ha aplicado para trabajar como <strong>{{role_name}}</strong> en tu evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Solicitante:</strong> {{employee_name}}</li>
</ul>

<p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>
""",
        "text_body": """
Nueva aplicación: {{event_name}}

{{employee_name}} ha aplicado para trabajar como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Solicitante: {{employee_name}}

Inicia sesión para aprobar o rechazar esta aplicación.
""",
    },
    {
        "code": "INVITATION_RESPONSE",
        "name": "Respuesta a invitación",
        "subject": "Respuesta a invitación: {{event_name}} - {{response}}",
        "variables": ["employee_name", "event_name", "role_name", "event_date", "response"],
        "html_body": """
<h2>Respuesta a invitación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> respondió <strong>{{response}}</strong> a la invitación para trabajar como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
  <li><strong>Respuesta:</strong> {{response}}</li>
</ul>
""",
        "text_body": """
Respuesta a invitación: {{event_name}}

{{employee_name}} respondió {{response}} a la invitación.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}
Respuesta: {{response}}
""",
    },
    {
        "code": "APPLICATION_APPROVED",
        "name": "Aplicación aprobada",
        "subject": "Aplicación aprobada: {{event_name}}",
        "variables": [
            "event_name",
            "event_date",
            "start_time",
            "address",
            "city",
            "state",
            "zip_code",
            "role_name",
            "hourly_rate",
            "dress_code",
        ],
        "html_body": """
<h2>Aplicación aprobada: {{event_name}}</h2>

<p>¡Felicidades! Tu aplicación ha sido aprobada.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{address}}, {{city}}, {{state}} {{zip_code}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Tarifa:</strong> ${{hourly_rate}}/hora</li>
  <li><strong>Código de vestimenta:</strong> {{dress_code}}</li>
</ul>

<p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>
""",
        "text_body": """
Aplicación aprobada: {{event_name}}

Tu aplicación ha sido aprobada.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para ver más detalles.
""",
    },
    {
        "code": "EMPLOYEE_WITHDREW",
        "name": "Empleado se retiró",
        "subject": "Empleado se retiró: {{event_name}}",
        "variables": ["employee_name", "event_name", "role_name", "event_date"],
        "html_body": """
<h2>⚠️ Empleado se retiró: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> se ha retirado del evento donde estaba confirmado como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
</ul>

<p>Es posible que necesites encontrar un reemplazo para esta posición.</p>
""",
        "text_body": """
Empleado se retiró: {{event_name}}

{{employee_name}} se ha retirado del evento donde estaba confirmado como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}

Es posible que necesites encontrar un reemplazo.
""",
    },
    {
        "code": "EVENT_CANCELLED",
        "name": "Evento cancelado",
        "subject": "Evento cancelado: {{event_name}}",
        "variables": ["employee_name", "event_name", "event_date", "reason"],
        "html_body": """
<h2>Evento cancelado: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Te informamos que el evento <strong>{{event_name}}</strong>, programado para el <strong>{{event_date}}</strong>, ha sido cancelado.</p>

<p><strong>Motivo:</strong> {{reason}}</p>

<p>Gracias por tu comprensión.</p>
""",
        "text_body": """
Hola {{employee_name}}.

El evento {{event_name}}, programado para {{event_date}}, ha sido cancelado.

Motivo: {{reason}}

Gracias por tu comprensión.
""",
    },
    {
        "code": "EVENT_UPDATED",
        "name": "Evento actualizado",
        "subject": "Actualización de evento: {{event_name}}",
        "variables": ["employee_name", "event_name", "event_date", "start_time", "location"],
        "html_body": """
<h2>Actualización de evento: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Se han actualizado los detalles del evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{location}}</li>
</ul>

<p>Por favor revisa la información actualizada en la plataforma.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Se han actualizado los detalles del evento {{event_name}}.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{location}}

Revisa la información actualizada en la plataforma.
""",
    },
    {
        "code": "SHIFT_ASSIGNED",
        "name": "Turno asignado",
        "subject": "Turno asignado: {{event_name}}",
        "variables": ["employee_name", "event_name", "role_name", "shift_start", "shift_end"],
        "html_body": """
<h2>Turno asignado</h2>

<p>Hola {{employee_name}},</p>

<p>Se te ha asignado un turno para el evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Rol:</strong> {{role_name}}</li>
  <li><strong>Inicio:</strong> {{shift_start}}</li>
  <li><strong>Fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Se te ha asignado un turno para {{event_name}}.

Rol: {{role_name}}
Inicio: {{shift_start}}
Fin: {{shift_end}}

Revisa los detalles en la plataforma.
""",
    },
    {
        "code": "SHIFT_UPDATED",
        "name": "Turno actualizado",
        "subject": "Turno actualizado: {{event_name}}",
        "variables": ["employee_name", "event_name", "shift_start", "shift_end"],
        "html_body": """
<h2>Turno actualizado</h2>

<p>Hola {{employee_name}},</p>

<p>Tu turno para el evento <strong>{{event_name}}</strong> ha sido actualizado.</p>

<ul>
  <li><strong>Nuevo inicio:</strong> {{shift_start}}</li>
  <li><strong>Nuevo fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Tu turno para {{event_name}} ha sido actualizado.

Nuevo inicio: {{shift_start}}
Nuevo fin: {{shift_end}}

Revisa los detalles en la plataforma.
""",
    },
    {
        "code": "NEWS_PUBLISHED",
        "name": "Noticia publicada",
        "subject": "Nueva noticia: {{title}}",
        "variables": ["employee_name", "title", "summary", "link"],
        "html_body": """
<h2>{{title}}</h2>

<p>Hola {{employee_name}},</p>

<p>{{summary}}</p>

<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:white;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver noticia
  </a>
</p>
""",
        "text_body": """
Hola {{employee_name}}.

{{title}}

{{summary}}

Ver noticia:
{{link}}
""",
    },
    {
        "code": "PAYROLL_SETTLEMENT",
        "name": "Liquidación de nómina",
        "subject": "Liquidación de nómina - {{period}}",
        "variables": ["employee_name", "period", "amount"],
        "html_body": """
<h2>Liquidación de nómina</h2>

<p>Hola {{employee_name}},</p>

<p>Tu liquidación correspondiente al periodo <strong>{{period}}</strong> está disponible.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0;"><strong>Monto:</strong> {{amount}}</p>
</div>

<p>Ingresa a la plataforma para ver el detalle.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Tu liquidación correspondiente al periodo {{period}} está disponible.

Monto: {{amount}}

Ingresa a la plataforma para ver el detalle.
""",
    },
    {
        "code": "PAYMENT_NOTIFICATION",
        "name": "Notificación de pago",
        "subject": "Pago registrado - {{amount}}",
        "variables": ["employee_name", "amount", "payment_date"],
        "html_body": """
<h2>Pago registrado</h2>

<p>Hola {{employee_name}},</p>

<p>Se ha registrado un pago a tu favor.</p>

<ul>
  <li><strong>Monto:</strong> {{amount}}</li>
  <li><strong>Fecha de pago:</strong> {{payment_date}}</li>
</ul>

<p>Ingresa a la plataforma para revisar el detalle.</p>
""",
        "text_body": """
Hola {{employee_name}}.

Se ha registrado un pago a tu favor.

Monto: {{amount}}
Fecha de pago: {{payment_date}}

Ingresa a la plataforma para revisar el detalle.
""",
    },
]


async def seed_templates_for_company(db, company: Company) -> tuple[int, int]:
    created = 0
    updated = 0

    for item in DEFAULT_EMAIL_TEMPLATES:
        code = item["code"].strip().upper()

        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.company_id == company.id,
                EmailTemplate.code == code,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            if OVERWRITE_EXISTING:
                existing.name = item["name"]
                existing.subject = item["subject"]
                existing.html_body = item["html_body"].strip()
                existing.text_body = item["text_body"].strip()
                existing.variables = item["variables"]
                existing.is_active = True
                updated += 1
            continue

        template = EmailTemplate(
            company_id=company.id,
            code=code,
            name=item["name"],
            subject=item["subject"],
            html_body=item["html_body"].strip(),
            text_body=item["text_body"].strip(),
            variables=item["variables"],
            is_active=True,
        )
        db.add(template)
        created += 1

    return created, updated


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Company).order_by(Company.id.asc()))
        companies = result.scalars().all()

        if not companies:
            print("No hay empresas registradas. No se crearon plantillas.")
            return

        total_created = 0
        total_updated = 0

        for company in companies:
            created, updated = await seed_templates_for_company(db, company)
            total_created += created
            total_updated += updated
            print(
                f"Empresa {company.id} - {company.name}: "
                f"{created} creadas, {updated} actualizadas"
            )

        await db.commit()

        print(
            f"Seed finalizado. Total creadas: {total_created}. "
            f"Total actualizadas: {total_updated}."
        )


if __name__ == "__main__":
    asyncio.run(main())
    
async def seed_all_email_templates() -> None:
    await main()