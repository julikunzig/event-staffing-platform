--
-- PostgreSQL database dump
--

\restrict VcwyapBdR9Z1p2Yrd4s2LgROOrxqujh4aKgnt6DoMgOpIT8ig3EsGWfwI9TyZfK

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.companies VALUES (1, 'platform', 'platform', 'admin@platform.com', '+1234567890', true, '2026-05-14 04:49:42.939039', '2026-05-14 04:49:42.939039', 30);
INSERT INTO public.companies VALUES (5, 'EMBARC EMPLOYMENT', 'embarc-employment', 'embarc@gmail.com', '1234567', true, '2026-05-14 11:29:04.924061', '2026-06-06 00:05:11.275004', 15);
INSERT INTO public.companies VALUES (6, 'JLR EVENTS LLC', 'jlr-events-llc', 'paul@gmail.com', '728200100', true, '2026-06-06 02:28:55.587867', '2026-06-06 02:28:55.58787', 15);
INSERT INTO public.companies VALUES (10, 'Elite Catering Miami', 'elite-catering', 'admin@elitecatering.com', '+13055551000', true, '2026-06-08 17:17:50.679591', '2026-06-08 17:17:50.679591', 30);


--
-- Data for Name: company_email_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.company_email_settings VALUES (1, 10, 'Kalirio Staff Platform', 'notifications@kalimas-group.com', 'smtp.zoho.com', 587, 'notifications@kalimas-group.com', 'JAGAL8XD3udC', true, false, true, '2026-06-20 03:42:30.285682+00', true, 'Correo enviado correctamente', '2026-06-20 03:38:01.917892+00', '2026-06-20 03:42:28.401745+00');


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.email_templates VALUES (1, 1, 'WELCOME_USER', 'Bienvenida de usuario', 'Bienvenido a {{company_name}} - Tu cuenta', '<h2>¡Bienvenido a EventsControl, {{user_name}}!</h2>

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

<p style="font-size:12px;color:#6b7280;">Si el botón no funciona, copia y pega este enlace: {{login_url}}</p>', 'Bienvenido a EventsControl, {{user_name}}.

Tu cuenta ha sido creada por {{company_name}}.

Usuario/Email: {{username}}
Contraseña temporal: {{password}}
Empresa: {{company_name}}

Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.

Ingresa aquí:
{{login_url}}', '["user_name", "username", "password", "company_name", "login_url"]', true, '2026-06-20 03:27:03.212356', '2026-06-20 03:27:03.212372');
INSERT INTO public.email_templates VALUES (2, 1, 'EXISTING_USER_NEW_COMPANY', 'Usuario existente agregado a empresa', 'Has sido agregado a {{company_name}}', '<h2>¡Has sido agregado a una nueva empresa, {{user_name}}!</h2>

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
</p>', 'Hola {{user_name}}.

Has sido asociado a {{company_name}} en EventsControl.

Puedes iniciar sesión con tus credenciales actuales y seleccionar {{company_name}} durante el login.

{{login_url}}', '["user_name", "company_name", "login_url"]', true, '2026-06-20 03:27:03.226871', '2026-06-20 03:27:03.226873');
INSERT INTO public.email_templates VALUES (3, 1, 'PASSWORD_RESET', 'Recuperación de contraseña', 'Solicitud de restablecimiento de contraseña', '<h2>Solicitud de restablecimiento de contraseña</h2>

<p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>

<p>
  <a href="{{reset_link}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
    Restablecer contraseña
  </a>
</p>

<p>Este enlace expirará en 2 horas.</p>
<p>Si no solicitaste esto, puedes ignorar este correo.</p>', 'Solicitaste restablecer tu contraseña.

Haz clic en este enlace para crear una nueva contraseña:
{{reset_link}}

Este enlace expirará en 2 horas.
Si no solicitaste esto, puedes ignorar este correo.', '["reset_link"]', true, '2026-06-20 03:27:03.228602', '2026-06-20 03:27:03.228603');
INSERT INTO public.email_templates VALUES (4, 1, 'EVENT_PUBLISHED', 'Nuevo evento disponible', 'Nuevo evento disponible: {{event_name}}', '<h2>Hola {{employee_name}},</h2>

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

<p>Inicia sesión en el sistema para aplicar a este evento.</p>', 'Hola {{employee_name}}.

Nuevo evento disponible: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Código de vestimenta: {{dress_code}}

Posiciones disponibles:
{{roles}}

Inicia sesión en el sistema para aplicar.', '["employee_name", "event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "roles", "dress_code"]', true, '2026-06-20 03:27:03.229802', '2026-06-20 03:27:03.229803');
INSERT INTO public.email_templates VALUES (5, 1, 'EVENT_INVITATION', 'Invitación a evento', 'Has sido invitado: {{event_name}}', '<h2>Has sido invitado a trabajar: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>', 'Has sido invitado a trabajar: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para aceptar o rechazar esta invitación.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.232253', '2026-06-20 03:27:03.232256');
INSERT INTO public.email_templates VALUES (6, 1, 'APPLICATION_RECEIVED', 'Aplicación recibida', 'Nueva aplicación: {{event_name}}', '<h2>Nueva aplicación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> ha aplicado para trabajar como <strong>{{role_name}}</strong> en tu evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Solicitante:</strong> {{employee_name}}</li>
</ul>

<p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>', 'Nueva aplicación: {{event_name}}

{{employee_name}} ha aplicado para trabajar como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Solicitante: {{employee_name}}

Inicia sesión para aprobar o rechazar esta aplicación.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.233798', '2026-06-20 03:27:03.233799');
INSERT INTO public.email_templates VALUES (7, 1, 'INVITATION_RESPONSE', 'Respuesta a invitación', 'Respuesta a invitación: {{event_name}} - {{response}}', '<h2>Respuesta a invitación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> respondió <strong>{{response}}</strong> a la invitación para trabajar como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
  <li><strong>Respuesta:</strong> {{response}}</li>
</ul>', 'Respuesta a invitación: {{event_name}}

{{employee_name}} respondió {{response}} a la invitación.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}
Respuesta: {{response}}', '["employee_name", "event_name", "role_name", "event_date", "response"]', true, '2026-06-20 03:27:03.234833', '2026-06-20 03:27:03.234834');
INSERT INTO public.email_templates VALUES (8, 1, 'APPLICATION_APPROVED', 'Aplicación aprobada', 'Aplicación aprobada: {{event_name}}', '<h2>Aplicación aprobada: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>', 'Aplicación aprobada: {{event_name}}

Tu aplicación ha sido aprobada.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para ver más detalles.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.235759', '2026-06-20 03:27:03.23576');
INSERT INTO public.email_templates VALUES (9, 1, 'EMPLOYEE_WITHDREW', 'Empleado se retiró', 'Empleado se retiró: {{event_name}}', '<h2>⚠️ Empleado se retiró: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> se ha retirado del evento donde estaba confirmado como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
</ul>

<p>Es posible que necesites encontrar un reemplazo para esta posición.</p>', 'Empleado se retiró: {{event_name}}

{{employee_name}} se ha retirado del evento donde estaba confirmado como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}

Es posible que necesites encontrar un reemplazo.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.237537', '2026-06-20 03:27:03.237538');
INSERT INTO public.email_templates VALUES (10, 1, 'EVENT_CANCELLED', 'Evento cancelado', 'Evento cancelado: {{event_name}}', '<h2>Evento cancelado: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Te informamos que el evento <strong>{{event_name}}</strong>, programado para el <strong>{{event_date}}</strong>, ha sido cancelado.</p>

<p><strong>Motivo:</strong> {{reason}}</p>

<p>Gracias por tu comprensión.</p>', 'Hola {{employee_name}}.

El evento {{event_name}}, programado para {{event_date}}, ha sido cancelado.

Motivo: {{reason}}

Gracias por tu comprensión.', '["employee_name", "event_name", "event_date", "reason"]', true, '2026-06-20 03:27:03.238273', '2026-06-20 03:27:03.238274');
INSERT INTO public.email_templates VALUES (11, 1, 'EVENT_UPDATED', 'Evento actualizado', 'Actualización de evento: {{event_name}}', '<h2>Actualización de evento: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Se han actualizado los detalles del evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{location}}</li>
</ul>

<p>Por favor revisa la información actualizada en la plataforma.</p>', 'Hola {{employee_name}}.

Se han actualizado los detalles del evento {{event_name}}.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{location}}

Revisa la información actualizada en la plataforma.', '["employee_name", "event_name", "event_date", "start_time", "location"]', true, '2026-06-20 03:27:03.238969', '2026-06-20 03:27:03.23897');
INSERT INTO public.email_templates VALUES (12, 1, 'SHIFT_ASSIGNED', 'Turno asignado', 'Turno asignado: {{event_name}}', '<h2>Turno asignado</h2>

<p>Hola {{employee_name}},</p>

<p>Se te ha asignado un turno para el evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Rol:</strong> {{role_name}}</li>
  <li><strong>Inicio:</strong> {{shift_start}}</li>
  <li><strong>Fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Se te ha asignado un turno para {{event_name}}.

Rol: {{role_name}}
Inicio: {{shift_start}}
Fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "role_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.240045', '2026-06-20 03:27:03.240046');
INSERT INTO public.email_templates VALUES (13, 1, 'SHIFT_UPDATED', 'Turno actualizado', 'Turno actualizado: {{event_name}}', '<h2>Turno actualizado</h2>

<p>Hola {{employee_name}},</p>

<p>Tu turno para el evento <strong>{{event_name}}</strong> ha sido actualizado.</p>

<ul>
  <li><strong>Nuevo inicio:</strong> {{shift_start}}</li>
  <li><strong>Nuevo fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Tu turno para {{event_name}} ha sido actualizado.

Nuevo inicio: {{shift_start}}
Nuevo fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.242533', '2026-06-20 03:27:03.242536');
INSERT INTO public.email_templates VALUES (14, 1, 'NEWS_PUBLISHED', 'Noticia publicada', 'Nueva noticia: {{title}}', '<h2>{{title}}</h2>

<p>Hola {{employee_name}},</p>

<p>{{summary}}</p>

<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:white;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver noticia
  </a>
</p>', 'Hola {{employee_name}}.

{{title}}

{{summary}}

Ver noticia:
{{link}}', '["employee_name", "title", "summary", "link"]', true, '2026-06-20 03:27:03.253434', '2026-06-20 03:27:03.253437');
INSERT INTO public.email_templates VALUES (15, 1, 'PAYROLL_SETTLEMENT', 'Liquidación de nómina', 'Liquidación de nómina - {{period}}', '<h2>Liquidación de nómina</h2>

<p>Hola {{employee_name}},</p>

<p>Tu liquidación correspondiente al periodo <strong>{{period}}</strong> está disponible.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0;"><strong>Monto:</strong> {{amount}}</p>
</div>

<p>Ingresa a la plataforma para ver el detalle.</p>', 'Hola {{employee_name}}.

Tu liquidación correspondiente al periodo {{period}} está disponible.

Monto: {{amount}}

Ingresa a la plataforma para ver el detalle.', '["employee_name", "period", "amount"]', true, '2026-06-20 03:27:03.254527', '2026-06-20 03:27:03.254528');
INSERT INTO public.email_templates VALUES (16, 1, 'PAYMENT_NOTIFICATION', 'Notificación de pago', 'Pago registrado - {{amount}}', '<h2>Pago registrado</h2>

<p>Hola {{employee_name}},</p>

<p>Se ha registrado un pago a tu favor.</p>

<ul>
  <li><strong>Monto:</strong> {{amount}}</li>
  <li><strong>Fecha de pago:</strong> {{payment_date}}</li>
</ul>

<p>Ingresa a la plataforma para revisar el detalle.</p>', 'Hola {{employee_name}}.

Se ha registrado un pago a tu favor.

Monto: {{amount}}
Fecha de pago: {{payment_date}}

Ingresa a la plataforma para revisar el detalle.', '["employee_name", "amount", "payment_date"]', true, '2026-06-20 03:27:03.256053', '2026-06-20 03:27:03.256054');
INSERT INTO public.email_templates VALUES (24, 5, 'APPLICATION_APPROVED', 'Aplicación aprobada', 'Aplicación aprobada: {{event_name}}', '<h2>Aplicación aprobada: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>', 'Aplicación aprobada: {{event_name}}

Tu aplicación ha sido aprobada.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para ver más detalles.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.266525', '2026-06-20 03:27:03.266526');
INSERT INTO public.email_templates VALUES (17, 5, 'WELCOME_USER', 'Bienvenida de usuario', 'Bienvenido a {{company_name}} - Tu cuenta', '<h2>¡Bienvenido a EventsControl, {{user_name}}!</h2>

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

<p style="font-size:12px;color:#6b7280;">Si el botón no funciona, copia y pega este enlace: {{login_url}}</p>', 'Bienvenido a EventsControl, {{user_name}}.

Tu cuenta ha sido creada por {{company_name}}.

Usuario/Email: {{username}}
Contraseña temporal: {{password}}
Empresa: {{company_name}}

Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.

Ingresa aquí:
{{login_url}}', '["user_name", "username", "password", "company_name", "login_url"]', true, '2026-06-20 03:27:03.256995', '2026-06-20 03:27:03.256996');
INSERT INTO public.email_templates VALUES (18, 5, 'EXISTING_USER_NEW_COMPANY', 'Usuario existente agregado a empresa', 'Has sido agregado a {{company_name}}', '<h2>¡Has sido agregado a una nueva empresa, {{user_name}}!</h2>

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
</p>', 'Hola {{user_name}}.

Has sido asociado a {{company_name}} en EventsControl.

Puedes iniciar sesión con tus credenciales actuales y seleccionar {{company_name}} durante el login.

{{login_url}}', '["user_name", "company_name", "login_url"]', true, '2026-06-20 03:27:03.258595', '2026-06-20 03:27:03.258599');
INSERT INTO public.email_templates VALUES (19, 5, 'PASSWORD_RESET', 'Recuperación de contraseña', 'Solicitud de restablecimiento de contraseña', '<h2>Solicitud de restablecimiento de contraseña</h2>

<p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>

<p>
  <a href="{{reset_link}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
    Restablecer contraseña
  </a>
</p>

<p>Este enlace expirará en 2 horas.</p>
<p>Si no solicitaste esto, puedes ignorar este correo.</p>', 'Solicitaste restablecer tu contraseña.

Haz clic en este enlace para crear una nueva contraseña:
{{reset_link}}

Este enlace expirará en 2 horas.
Si no solicitaste esto, puedes ignorar este correo.', '["reset_link"]', true, '2026-06-20 03:27:03.260807', '2026-06-20 03:27:03.260809');
INSERT INTO public.email_templates VALUES (20, 5, 'EVENT_PUBLISHED', 'Nuevo evento disponible', 'Nuevo evento disponible: {{event_name}}', '<h2>Hola {{employee_name}},</h2>

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

<p>Inicia sesión en el sistema para aplicar a este evento.</p>', 'Hola {{employee_name}}.

Nuevo evento disponible: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Código de vestimenta: {{dress_code}}

Posiciones disponibles:
{{roles}}

Inicia sesión en el sistema para aplicar.', '["employee_name", "event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "roles", "dress_code"]', true, '2026-06-20 03:27:03.262004', '2026-06-20 03:27:03.262006');
INSERT INTO public.email_templates VALUES (21, 5, 'EVENT_INVITATION', 'Invitación a evento', 'Has sido invitado: {{event_name}}', '<h2>Has sido invitado a trabajar: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>', 'Has sido invitado a trabajar: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para aceptar o rechazar esta invitación.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.263061', '2026-06-20 03:27:03.263063');
INSERT INTO public.email_templates VALUES (22, 5, 'APPLICATION_RECEIVED', 'Aplicación recibida', 'Nueva aplicación: {{event_name}}', '<h2>Nueva aplicación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> ha aplicado para trabajar como <strong>{{role_name}}</strong> en tu evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Solicitante:</strong> {{employee_name}}</li>
</ul>

<p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>', 'Nueva aplicación: {{event_name}}

{{employee_name}} ha aplicado para trabajar como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Solicitante: {{employee_name}}

Inicia sesión para aprobar o rechazar esta aplicación.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.264294', '2026-06-20 03:27:03.264296');
INSERT INTO public.email_templates VALUES (23, 5, 'INVITATION_RESPONSE', 'Respuesta a invitación', 'Respuesta a invitación: {{event_name}} - {{response}}', '<h2>Respuesta a invitación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> respondió <strong>{{response}}</strong> a la invitación para trabajar como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
  <li><strong>Respuesta:</strong> {{response}}</li>
</ul>', 'Respuesta a invitación: {{event_name}}

{{employee_name}} respondió {{response}} a la invitación.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}
Respuesta: {{response}}', '["employee_name", "event_name", "role_name", "event_date", "response"]', true, '2026-06-20 03:27:03.265687', '2026-06-20 03:27:03.265689');
INSERT INTO public.email_templates VALUES (25, 5, 'EMPLOYEE_WITHDREW', 'Empleado se retiró', 'Empleado se retiró: {{event_name}}', '<h2>⚠️ Empleado se retiró: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> se ha retirado del evento donde estaba confirmado como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
</ul>

<p>Es posible que necesites encontrar un reemplazo para esta posición.</p>', 'Empleado se retiró: {{event_name}}

{{employee_name}} se ha retirado del evento donde estaba confirmado como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}

Es posible que necesites encontrar un reemplazo.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.267434', '2026-06-20 03:27:03.267435');
INSERT INTO public.email_templates VALUES (26, 5, 'EVENT_CANCELLED', 'Evento cancelado', 'Evento cancelado: {{event_name}}', '<h2>Evento cancelado: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Te informamos que el evento <strong>{{event_name}}</strong>, programado para el <strong>{{event_date}}</strong>, ha sido cancelado.</p>

<p><strong>Motivo:</strong> {{reason}}</p>

<p>Gracias por tu comprensión.</p>', 'Hola {{employee_name}}.

El evento {{event_name}}, programado para {{event_date}}, ha sido cancelado.

Motivo: {{reason}}

Gracias por tu comprensión.', '["employee_name", "event_name", "event_date", "reason"]', true, '2026-06-20 03:27:03.268307', '2026-06-20 03:27:03.268308');
INSERT INTO public.email_templates VALUES (27, 5, 'EVENT_UPDATED', 'Evento actualizado', 'Actualización de evento: {{event_name}}', '<h2>Actualización de evento: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Se han actualizado los detalles del evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{location}}</li>
</ul>

<p>Por favor revisa la información actualizada en la plataforma.</p>', 'Hola {{employee_name}}.

Se han actualizado los detalles del evento {{event_name}}.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{location}}

Revisa la información actualizada en la plataforma.', '["employee_name", "event_name", "event_date", "start_time", "location"]', true, '2026-06-20 03:27:03.269077', '2026-06-20 03:27:03.269078');
INSERT INTO public.email_templates VALUES (28, 5, 'SHIFT_ASSIGNED', 'Turno asignado', 'Turno asignado: {{event_name}}', '<h2>Turno asignado</h2>

<p>Hola {{employee_name}},</p>

<p>Se te ha asignado un turno para el evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Rol:</strong> {{role_name}}</li>
  <li><strong>Inicio:</strong> {{shift_start}}</li>
  <li><strong>Fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Se te ha asignado un turno para {{event_name}}.

Rol: {{role_name}}
Inicio: {{shift_start}}
Fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "role_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.269994', '2026-06-20 03:27:03.269995');
INSERT INTO public.email_templates VALUES (29, 5, 'SHIFT_UPDATED', 'Turno actualizado', 'Turno actualizado: {{event_name}}', '<h2>Turno actualizado</h2>

<p>Hola {{employee_name}},</p>

<p>Tu turno para el evento <strong>{{event_name}}</strong> ha sido actualizado.</p>

<ul>
  <li><strong>Nuevo inicio:</strong> {{shift_start}}</li>
  <li><strong>Nuevo fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Tu turno para {{event_name}} ha sido actualizado.

Nuevo inicio: {{shift_start}}
Nuevo fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.270714', '2026-06-20 03:27:03.270715');
INSERT INTO public.email_templates VALUES (30, 5, 'NEWS_PUBLISHED', 'Noticia publicada', 'Nueva noticia: {{title}}', '<h2>{{title}}</h2>

<p>Hola {{employee_name}},</p>

<p>{{summary}}</p>

<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:white;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver noticia
  </a>
</p>', 'Hola {{employee_name}}.

{{title}}

{{summary}}

Ver noticia:
{{link}}', '["employee_name", "title", "summary", "link"]', true, '2026-06-20 03:27:03.271567', '2026-06-20 03:27:03.271568');
INSERT INTO public.email_templates VALUES (31, 5, 'PAYROLL_SETTLEMENT', 'Liquidación de nómina', 'Liquidación de nómina - {{period}}', '<h2>Liquidación de nómina</h2>

<p>Hola {{employee_name}},</p>

<p>Tu liquidación correspondiente al periodo <strong>{{period}}</strong> está disponible.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0;"><strong>Monto:</strong> {{amount}}</p>
</div>

<p>Ingresa a la plataforma para ver el detalle.</p>', 'Hola {{employee_name}}.

Tu liquidación correspondiente al periodo {{period}} está disponible.

Monto: {{amount}}

Ingresa a la plataforma para ver el detalle.', '["employee_name", "period", "amount"]', true, '2026-06-20 03:27:03.272252', '2026-06-20 03:27:03.272253');
INSERT INTO public.email_templates VALUES (32, 5, 'PAYMENT_NOTIFICATION', 'Notificación de pago', 'Pago registrado - {{amount}}', '<h2>Pago registrado</h2>

<p>Hola {{employee_name}},</p>

<p>Se ha registrado un pago a tu favor.</p>

<ul>
  <li><strong>Monto:</strong> {{amount}}</li>
  <li><strong>Fecha de pago:</strong> {{payment_date}}</li>
</ul>

<p>Ingresa a la plataforma para revisar el detalle.</p>', 'Hola {{employee_name}}.

Se ha registrado un pago a tu favor.

Monto: {{amount}}
Fecha de pago: {{payment_date}}

Ingresa a la plataforma para revisar el detalle.', '["employee_name", "amount", "payment_date"]', true, '2026-06-20 03:27:03.272874', '2026-06-20 03:27:03.272875');
INSERT INTO public.email_templates VALUES (33, 6, 'WELCOME_USER', 'Bienvenida de usuario', 'Bienvenido a {{company_name}} - Tu cuenta', '<h2>¡Bienvenido a EventsControl, {{user_name}}!</h2>

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

<p style="font-size:12px;color:#6b7280;">Si el botón no funciona, copia y pega este enlace: {{login_url}}</p>', 'Bienvenido a EventsControl, {{user_name}}.

Tu cuenta ha sido creada por {{company_name}}.

Usuario/Email: {{username}}
Contraseña temporal: {{password}}
Empresa: {{company_name}}

Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.

Ingresa aquí:
{{login_url}}', '["user_name", "username", "password", "company_name", "login_url"]', true, '2026-06-20 03:27:03.273653', '2026-06-20 03:27:03.273654');
INSERT INTO public.email_templates VALUES (41, 6, 'EMPLOYEE_WITHDREW', 'Empleado se retiró', 'Empleado se retiró: {{event_name}}', '<h2>⚠️ Empleado se retiró: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> se ha retirado del evento donde estaba confirmado como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
</ul>

<p>Es posible que necesites encontrar un reemplazo para esta posición.</p>', 'Empleado se retiró: {{event_name}}

{{employee_name}} se ha retirado del evento donde estaba confirmado como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}

Es posible que necesites encontrar un reemplazo.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.284022', '2026-06-20 03:27:03.284023');
INSERT INTO public.email_templates VALUES (34, 6, 'EXISTING_USER_NEW_COMPANY', 'Usuario existente agregado a empresa', 'Has sido agregado a {{company_name}}', '<h2>¡Has sido agregado a una nueva empresa, {{user_name}}!</h2>

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
</p>', 'Hola {{user_name}}.

Has sido asociado a {{company_name}} en EventsControl.

Puedes iniciar sesión con tus credenciales actuales y seleccionar {{company_name}} durante el login.

{{login_url}}', '["user_name", "company_name", "login_url"]', true, '2026-06-20 03:27:03.274387', '2026-06-20 03:27:03.274388');
INSERT INTO public.email_templates VALUES (35, 6, 'PASSWORD_RESET', 'Recuperación de contraseña', 'Solicitud de restablecimiento de contraseña', '<h2>Solicitud de restablecimiento de contraseña</h2>

<p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>

<p>
  <a href="{{reset_link}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
    Restablecer contraseña
  </a>
</p>

<p>Este enlace expirará en 2 horas.</p>
<p>Si no solicitaste esto, puedes ignorar este correo.</p>', 'Solicitaste restablecer tu contraseña.

Haz clic en este enlace para crear una nueva contraseña:
{{reset_link}}

Este enlace expirará en 2 horas.
Si no solicitaste esto, puedes ignorar este correo.', '["reset_link"]', true, '2026-06-20 03:27:03.275456', '2026-06-20 03:27:03.275458');
INSERT INTO public.email_templates VALUES (36, 6, 'EVENT_PUBLISHED', 'Nuevo evento disponible', 'Nuevo evento disponible: {{event_name}}', '<h2>Hola {{employee_name}},</h2>

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

<p>Inicia sesión en el sistema para aplicar a este evento.</p>', 'Hola {{employee_name}}.

Nuevo evento disponible: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Código de vestimenta: {{dress_code}}

Posiciones disponibles:
{{roles}}

Inicia sesión en el sistema para aplicar.', '["employee_name", "event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "roles", "dress_code"]', true, '2026-06-20 03:27:03.277664', '2026-06-20 03:27:03.27767');
INSERT INTO public.email_templates VALUES (37, 6, 'EVENT_INVITATION', 'Invitación a evento', 'Has sido invitado: {{event_name}}', '<h2>Has sido invitado a trabajar: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>', 'Has sido invitado a trabajar: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para aceptar o rechazar esta invitación.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.279361', '2026-06-20 03:27:03.279363');
INSERT INTO public.email_templates VALUES (38, 6, 'APPLICATION_RECEIVED', 'Aplicación recibida', 'Nueva aplicación: {{event_name}}', '<h2>Nueva aplicación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> ha aplicado para trabajar como <strong>{{role_name}}</strong> en tu evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Solicitante:</strong> {{employee_name}}</li>
</ul>

<p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>', 'Nueva aplicación: {{event_name}}

{{employee_name}} ha aplicado para trabajar como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Solicitante: {{employee_name}}

Inicia sesión para aprobar o rechazar esta aplicación.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.280413', '2026-06-20 03:27:03.280415');
INSERT INTO public.email_templates VALUES (39, 6, 'INVITATION_RESPONSE', 'Respuesta a invitación', 'Respuesta a invitación: {{event_name}} - {{response}}', '<h2>Respuesta a invitación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> respondió <strong>{{response}}</strong> a la invitación para trabajar como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
  <li><strong>Respuesta:</strong> {{response}}</li>
</ul>', 'Respuesta a invitación: {{event_name}}

{{employee_name}} respondió {{response}} a la invitación.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}
Respuesta: {{response}}', '["employee_name", "event_name", "role_name", "event_date", "response"]', true, '2026-06-20 03:27:03.281813', '2026-06-20 03:27:03.281815');
INSERT INTO public.email_templates VALUES (40, 6, 'APPLICATION_APPROVED', 'Aplicación aprobada', 'Aplicación aprobada: {{event_name}}', '<h2>Aplicación aprobada: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>', 'Aplicación aprobada: {{event_name}}

Tu aplicación ha sido aprobada.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para ver más detalles.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.282884', '2026-06-20 03:27:03.282886');
INSERT INTO public.email_templates VALUES (42, 6, 'EVENT_CANCELLED', 'Evento cancelado', 'Evento cancelado: {{event_name}}', '<h2>Evento cancelado: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Te informamos que el evento <strong>{{event_name}}</strong>, programado para el <strong>{{event_date}}</strong>, ha sido cancelado.</p>

<p><strong>Motivo:</strong> {{reason}}</p>

<p>Gracias por tu comprensión.</p>', 'Hola {{employee_name}}.

El evento {{event_name}}, programado para {{event_date}}, ha sido cancelado.

Motivo: {{reason}}

Gracias por tu comprensión.', '["employee_name", "event_name", "event_date", "reason"]', true, '2026-06-20 03:27:03.284689', '2026-06-20 03:27:03.28469');
INSERT INTO public.email_templates VALUES (43, 6, 'EVENT_UPDATED', 'Evento actualizado', 'Actualización de evento: {{event_name}}', '<h2>Actualización de evento: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Se han actualizado los detalles del evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{location}}</li>
</ul>

<p>Por favor revisa la información actualizada en la plataforma.</p>', 'Hola {{employee_name}}.

Se han actualizado los detalles del evento {{event_name}}.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{location}}

Revisa la información actualizada en la plataforma.', '["employee_name", "event_name", "event_date", "start_time", "location"]', true, '2026-06-20 03:27:03.28533', '2026-06-20 03:27:03.28533');
INSERT INTO public.email_templates VALUES (44, 6, 'SHIFT_ASSIGNED', 'Turno asignado', 'Turno asignado: {{event_name}}', '<h2>Turno asignado</h2>

<p>Hola {{employee_name}},</p>

<p>Se te ha asignado un turno para el evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Rol:</strong> {{role_name}}</li>
  <li><strong>Inicio:</strong> {{shift_start}}</li>
  <li><strong>Fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Se te ha asignado un turno para {{event_name}}.

Rol: {{role_name}}
Inicio: {{shift_start}}
Fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "role_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.286086', '2026-06-20 03:27:03.286087');
INSERT INTO public.email_templates VALUES (45, 6, 'SHIFT_UPDATED', 'Turno actualizado', 'Turno actualizado: {{event_name}}', '<h2>Turno actualizado</h2>

<p>Hola {{employee_name}},</p>

<p>Tu turno para el evento <strong>{{event_name}}</strong> ha sido actualizado.</p>

<ul>
  <li><strong>Nuevo inicio:</strong> {{shift_start}}</li>
  <li><strong>Nuevo fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Tu turno para {{event_name}} ha sido actualizado.

Nuevo inicio: {{shift_start}}
Nuevo fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.287358', '2026-06-20 03:27:03.28736');
INSERT INTO public.email_templates VALUES (46, 6, 'NEWS_PUBLISHED', 'Noticia publicada', 'Nueva noticia: {{title}}', '<h2>{{title}}</h2>

<p>Hola {{employee_name}},</p>

<p>{{summary}}</p>

<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:white;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver noticia
  </a>
</p>', 'Hola {{employee_name}}.

{{title}}

{{summary}}

Ver noticia:
{{link}}', '["employee_name", "title", "summary", "link"]', true, '2026-06-20 03:27:03.288933', '2026-06-20 03:27:03.288935');
INSERT INTO public.email_templates VALUES (47, 6, 'PAYROLL_SETTLEMENT', 'Liquidación de nómina', 'Liquidación de nómina - {{period}}', '<h2>Liquidación de nómina</h2>

<p>Hola {{employee_name}},</p>

<p>Tu liquidación correspondiente al periodo <strong>{{period}}</strong> está disponible.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0;"><strong>Monto:</strong> {{amount}}</p>
</div>

<p>Ingresa a la plataforma para ver el detalle.</p>', 'Hola {{employee_name}}.

Tu liquidación correspondiente al periodo {{period}} está disponible.

Monto: {{amount}}

Ingresa a la plataforma para ver el detalle.', '["employee_name", "period", "amount"]', true, '2026-06-20 03:27:03.290532', '2026-06-20 03:27:03.290534');
INSERT INTO public.email_templates VALUES (48, 6, 'PAYMENT_NOTIFICATION', 'Notificación de pago', 'Pago registrado - {{amount}}', '<h2>Pago registrado</h2>

<p>Hola {{employee_name}},</p>

<p>Se ha registrado un pago a tu favor.</p>

<ul>
  <li><strong>Monto:</strong> {{amount}}</li>
  <li><strong>Fecha de pago:</strong> {{payment_date}}</li>
</ul>

<p>Ingresa a la plataforma para revisar el detalle.</p>', 'Hola {{employee_name}}.

Se ha registrado un pago a tu favor.

Monto: {{amount}}
Fecha de pago: {{payment_date}}

Ingresa a la plataforma para revisar el detalle.', '["employee_name", "amount", "payment_date"]', true, '2026-06-20 03:27:03.291352', '2026-06-20 03:27:03.291353');
INSERT INTO public.email_templates VALUES (49, 10, 'WELCOME_USER', 'Bienvenida de usuario', 'Bienvenido a {{company_name}} - Tu cuenta', '<h2>¡Bienvenido a EventsControl, {{user_name}}!</h2>

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

<p style="font-size:12px;color:#6b7280;">Si el botón no funciona, copia y pega este enlace: {{login_url}}</p>', 'Bienvenido a EventsControl, {{user_name}}.

Tu cuenta ha sido creada por {{company_name}}.

Usuario/Email: {{username}}
Contraseña temporal: {{password}}
Empresa: {{company_name}}

Se te pedirá cambiar tu contraseña la primera vez que inicies sesión.

Ingresa aquí:
{{login_url}}', '["user_name", "username", "password", "company_name", "login_url"]', true, '2026-06-20 03:27:03.29244', '2026-06-20 03:27:03.292441');
INSERT INTO public.email_templates VALUES (50, 10, 'EXISTING_USER_NEW_COMPANY', 'Usuario existente agregado a empresa', 'Has sido agregado a {{company_name}}', '<h2>¡Has sido agregado a una nueva empresa, {{user_name}}!</h2>

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
</p>', 'Hola {{user_name}}.

Has sido asociado a {{company_name}} en EventsControl.

Puedes iniciar sesión con tus credenciales actuales y seleccionar {{company_name}} durante el login.

{{login_url}}', '["user_name", "company_name", "login_url"]', true, '2026-06-20 03:27:03.293381', '2026-06-20 03:27:03.293381');
INSERT INTO public.email_templates VALUES (51, 10, 'PASSWORD_RESET', 'Recuperación de contraseña', 'Solicitud de restablecimiento de contraseña', '<h2>Solicitud de restablecimiento de contraseña</h2>

<p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para crear una nueva contraseña:</p>

<p>
  <a href="{{reset_link}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
    Restablecer contraseña
  </a>
</p>

<p>Este enlace expirará en 2 horas.</p>
<p>Si no solicitaste esto, puedes ignorar este correo.</p>', 'Solicitaste restablecer tu contraseña.

Haz clic en este enlace para crear una nueva contraseña:
{{reset_link}}

Este enlace expirará en 2 horas.
Si no solicitaste esto, puedes ignorar este correo.', '["reset_link"]', true, '2026-06-20 03:27:03.294138', '2026-06-20 03:27:03.294139');
INSERT INTO public.email_templates VALUES (52, 10, 'EVENT_PUBLISHED', 'Nuevo evento disponible', 'Nuevo evento disponible: {{event_name}}', '<h2>Hola {{employee_name}},</h2>

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

<p>Inicia sesión en el sistema para aplicar a este evento.</p>', 'Hola {{employee_name}}.

Nuevo evento disponible: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Código de vestimenta: {{dress_code}}

Posiciones disponibles:
{{roles}}

Inicia sesión en el sistema para aplicar.', '["employee_name", "event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "roles", "dress_code"]', true, '2026-06-20 03:27:03.295192', '2026-06-20 03:27:03.295194');
INSERT INTO public.email_templates VALUES (53, 10, 'EVENT_INVITATION', 'Invitación a evento', 'Has sido invitado: {{event_name}}', '<h2>Has sido invitado a trabajar: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para aceptar o rechazar esta invitación.</p>', 'Has sido invitado a trabajar: {{event_name}}

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para aceptar o rechazar esta invitación.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.295984', '2026-06-20 03:27:03.295985');
INSERT INTO public.email_templates VALUES (54, 10, 'APPLICATION_RECEIVED', 'Aplicación recibida', 'Nueva aplicación: {{event_name}}', '<h2>Nueva aplicación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> ha aplicado para trabajar como <strong>{{role_name}}</strong> en tu evento.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Solicitante:</strong> {{employee_name}}</li>
</ul>

<p>Inicia sesión en el sistema para aprobar o rechazar esta aplicación.</p>', 'Nueva aplicación: {{event_name}}

{{employee_name}} ha aplicado para trabajar como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Solicitante: {{employee_name}}

Inicia sesión para aprobar o rechazar esta aplicación.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.296705', '2026-06-20 03:27:03.296706');
INSERT INTO public.email_templates VALUES (55, 10, 'INVITATION_RESPONSE', 'Respuesta a invitación', 'Respuesta a invitación: {{event_name}} - {{response}}', '<h2>Respuesta a invitación: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> respondió <strong>{{response}}</strong> a la invitación para trabajar como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
  <li><strong>Respuesta:</strong> {{response}}</li>
</ul>', 'Respuesta a invitación: {{event_name}}

{{employee_name}} respondió {{response}} a la invitación.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}
Respuesta: {{response}}', '["employee_name", "event_name", "role_name", "event_date", "response"]', true, '2026-06-20 03:27:03.298339', '2026-06-20 03:27:03.298344');
INSERT INTO public.email_templates VALUES (56, 10, 'APPLICATION_APPROVED', 'Aplicación aprobada', 'Aplicación aprobada: {{event_name}}', '<h2>Aplicación aprobada: {{event_name}}</h2>

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

<p>Inicia sesión en el sistema para ver más detalles y prepararte para el evento.</p>', 'Aplicación aprobada: {{event_name}}

Tu aplicación ha sido aprobada.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{address}}, {{city}}, {{state}} {{zip_code}}
Posición: {{role_name}}
Tarifa: ${{hourly_rate}}/hora
Código de vestimenta: {{dress_code}}

Inicia sesión para ver más detalles.', '["event_name", "event_date", "start_time", "address", "city", "state", "zip_code", "role_name", "hourly_rate", "dress_code"]', true, '2026-06-20 03:27:03.300071', '2026-06-20 03:27:03.300072');
INSERT INTO public.email_templates VALUES (57, 10, 'EMPLOYEE_WITHDREW', 'Empleado se retiró', 'Empleado se retiró: {{event_name}}', '<h2>⚠️ Empleado se retiró: {{event_name}}</h2>

<p><strong>{{employee_name}}</strong> se ha retirado del evento donde estaba confirmado como <strong>{{role_name}}</strong>.</p>

<h3>Detalles del evento:</h3>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Posición:</strong> {{role_name}}</li>
  <li><strong>Empleado:</strong> {{employee_name}}</li>
</ul>

<p>Es posible que necesites encontrar un reemplazo para esta posición.</p>', 'Empleado se retiró: {{event_name}}

{{employee_name}} se ha retirado del evento donde estaba confirmado como {{role_name}}.

Fecha: {{event_date}}
Posición: {{role_name}}
Empleado: {{employee_name}}

Es posible que necesites encontrar un reemplazo.', '["employee_name", "event_name", "role_name", "event_date"]', true, '2026-06-20 03:27:03.300801', '2026-06-20 03:27:03.300802');
INSERT INTO public.email_templates VALUES (58, 10, 'EVENT_CANCELLED', 'Evento cancelado', 'Evento cancelado: {{event_name}}', '<h2>Evento cancelado: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Te informamos que el evento <strong>{{event_name}}</strong>, programado para el <strong>{{event_date}}</strong>, ha sido cancelado.</p>

<p><strong>Motivo:</strong> {{reason}}</p>

<p>Gracias por tu comprensión.</p>', 'Hola {{employee_name}}.

El evento {{event_name}}, programado para {{event_date}}, ha sido cancelado.

Motivo: {{reason}}

Gracias por tu comprensión.', '["employee_name", "event_name", "event_date", "reason"]', true, '2026-06-20 03:27:03.301623', '2026-06-20 03:27:03.301624');
INSERT INTO public.email_templates VALUES (59, 10, 'EVENT_UPDATED', 'Evento actualizado', 'Actualización de evento: {{event_name}}', '<h2>Actualización de evento: {{event_name}}</h2>

<p>Hola {{employee_name}},</p>

<p>Se han actualizado los detalles del evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Fecha:</strong> {{event_date}}</li>
  <li><strong>Hora:</strong> {{start_time}}</li>
  <li><strong>Ubicación:</strong> {{location}}</li>
</ul>

<p>Por favor revisa la información actualizada en la plataforma.</p>', 'Hola {{employee_name}}.

Se han actualizado los detalles del evento {{event_name}}.

Fecha: {{event_date}}
Hora: {{start_time}}
Ubicación: {{location}}

Revisa la información actualizada en la plataforma.', '["employee_name", "event_name", "event_date", "start_time", "location"]', true, '2026-06-20 03:27:03.302496', '2026-06-20 03:27:03.302497');
INSERT INTO public.email_templates VALUES (60, 10, 'SHIFT_ASSIGNED', 'Turno asignado', 'Turno asignado: {{event_name}}', '<h2>Turno asignado</h2>

<p>Hola {{employee_name}},</p>

<p>Se te ha asignado un turno para el evento <strong>{{event_name}}</strong>.</p>

<ul>
  <li><strong>Rol:</strong> {{role_name}}</li>
  <li><strong>Inicio:</strong> {{shift_start}}</li>
  <li><strong>Fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Se te ha asignado un turno para {{event_name}}.

Rol: {{role_name}}
Inicio: {{shift_start}}
Fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "role_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.303281', '2026-06-20 03:27:03.303282');
INSERT INTO public.email_templates VALUES (61, 10, 'SHIFT_UPDATED', 'Turno actualizado', 'Turno actualizado: {{event_name}}', '<h2>Turno actualizado</h2>

<p>Hola {{employee_name}},</p>

<p>Tu turno para el evento <strong>{{event_name}}</strong> ha sido actualizado.</p>

<ul>
  <li><strong>Nuevo inicio:</strong> {{shift_start}}</li>
  <li><strong>Nuevo fin:</strong> {{shift_end}}</li>
</ul>

<p>Por favor revisa los detalles en la plataforma.</p>', 'Hola {{employee_name}}.

Tu turno para {{event_name}} ha sido actualizado.

Nuevo inicio: {{shift_start}}
Nuevo fin: {{shift_end}}

Revisa los detalles en la plataforma.', '["employee_name", "event_name", "shift_start", "shift_end"]', true, '2026-06-20 03:27:03.304762', '2026-06-20 03:27:03.304763');
INSERT INTO public.email_templates VALUES (62, 10, 'NEWS_PUBLISHED', 'Noticia publicada', 'Nueva noticia: {{title}}', '<h2>{{title}}</h2>

<p>Hola {{employee_name}},</p>

<p>{{summary}}</p>

<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:white;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver noticia
  </a>
</p>', 'Hola {{employee_name}}.

{{title}}

{{summary}}

Ver noticia:
{{link}}', '["employee_name", "title", "summary", "link"]', true, '2026-06-20 03:27:03.305722', '2026-06-20 03:27:03.305724');
INSERT INTO public.email_templates VALUES (63, 10, 'PAYROLL_SETTLEMENT', 'Liquidación de nómina', 'Liquidación de nómina - {{period}}', '<h2>Liquidación de nómina</h2>

<p>Hola {{employee_name}},</p>

<p>Tu liquidación correspondiente al periodo <strong>{{period}}</strong> está disponible.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
  <p style="margin:0;"><strong>Monto:</strong> {{amount}}</p>
</div>

<p>Ingresa a la plataforma para ver el detalle.</p>', 'Hola {{employee_name}}.

Tu liquidación correspondiente al periodo {{period}} está disponible.

Monto: {{amount}}

Ingresa a la plataforma para ver el detalle.', '["employee_name", "period", "amount"]', true, '2026-06-20 03:27:03.306633', '2026-06-20 03:27:03.306635');
INSERT INTO public.email_templates VALUES (64, 10, 'PAYMENT_NOTIFICATION', 'Notificación de pago', 'Pago registrado - {{amount}}', '<h2>Pago registrado</h2>

<p>Hola {{employee_name}},</p>

<p>Se ha registrado un pago a tu favor.</p>

<ul>
  <li><strong>Monto:</strong> {{amount}}</li>
  <li><strong>Fecha de pago:</strong> {{payment_date}}</li>
</ul>

<p>Ingresa a la plataforma para revisar el detalle.</p>', 'Hola {{employee_name}}.

Se ha registrado un pago a tu favor.

Monto: {{amount}}
Fecha de pago: {{payment_date}}

Ingresa a la plataforma para revisar el detalle.', '["employee_name", "amount", "payment_date"]', true, '2026-06-20 03:27:03.30753', '2026-06-20 03:27:03.307531');


--
-- Data for Name: email_delivery_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: job_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.job_roles VALUES (2, 1, 'Bartender', 25.00, true, '2026-05-14 04:53:34.853552', '2026-05-14 04:53:34.853552');
INSERT INTO public.job_roles VALUES (3, 1, 'Server', 20.00, true, '2026-05-14 04:53:34.853552', '2026-05-14 04:53:34.853552');
INSERT INTO public.job_roles VALUES (4, 1, 'Chef', 30.00, true, '2026-05-14 04:53:34.853552', '2026-05-14 04:53:34.853552');
INSERT INTO public.job_roles VALUES (5, 1, 'Host', 18.00, true, '2026-05-14 04:53:34.853552', '2026-05-14 04:53:34.853552');
INSERT INTO public.job_roles VALUES (10, 5, 'BARTENDER', 20.00, true, '2026-05-14 20:17:26.752135', '2026-05-14 20:17:26.752139');
INSERT INTO public.job_roles VALUES (11, 5, 'SERVER', 18.00, true, '2026-05-14 20:17:39.381481', '2026-05-14 20:17:39.381485');
INSERT INTO public.job_roles VALUES (12, 5, 'COCINERO', 20.00, true, '2026-05-14 20:17:50.789623', '2026-05-14 20:17:50.789628');
INSERT INTO public.job_roles VALUES (13, 5, 'LIMPIEZA', 15.00, true, '2026-05-14 20:18:04.667667', '2026-05-14 20:18:04.667671');
INSERT INTO public.job_roles VALUES (14, 5, 'DISWASHER', 17.00, true, '2026-06-01 22:12:48.085605', '2026-06-01 22:12:48.085607');
INSERT INTO public.job_roles VALUES (15, 6, 'BARTENDER', 25.00, true, '2026-06-06 02:33:43.178587', '2026-06-06 02:33:43.178589');
INSERT INTO public.job_roles VALUES (50, 10, 'BARTENDER', 25.00, true, '2026-06-08 17:17:50.76359', '2026-06-08 17:17:50.76359');
INSERT INTO public.job_roles VALUES (51, 10, 'SERVER', 20.00, true, '2026-06-08 17:17:50.76359', '2026-06-08 17:17:50.76359');
INSERT INTO public.job_roles VALUES (52, 10, 'CHEF', 35.00, true, '2026-06-08 17:17:50.76359', '2026-06-08 17:17:50.76359');
INSERT INTO public.job_roles VALUES (53, 10, 'HOST', 18.00, true, '2026-06-08 17:17:50.76359', '2026-06-08 17:17:50.76359');
INSERT INTO public.job_roles VALUES (54, 10, 'BUSSER', 15.00, true, '2026-06-08 17:17:50.76359', '2026-06-08 17:17:50.76359');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (25, 'KAREN CHAMORRO', 'karen@gmail.com', '$2b$12$6Omq0E824i630eVTSEAwxO2U5fTGN7oCK54dIRuwFvFeau7FPJi4K', '705205205', 'es', true, '2026-06-06 03:07:14.464417', '2026-06-06 03:07:14.46442', true, NULL, NULL, NULL, NULL, NULL, '333333');
INSERT INTO public.users VALUES (26, 'LUCIANO VANEGAS', 'luciano@gmail.com', '$2b$12$7eyJXv05zuO8honWf5mbV.jJJy61DCSYoThQQIeaPosiEiSvA1tSS', '7002022022', 'es', true, '2026-06-06 03:46:53.234993', '2026-06-06 03:48:29.418763', false, NULL, NULL, NULL, NULL, NULL, 'luciano@gmail.com');
INSERT INTO public.users VALUES (6, 'Super Admin', 'superadmin@platform.com', '$2b$12$qY9Kyb9XaGbOn.TCEd85Nu7VCAjkieWNy/FK.w/LyodKSSsa8D8a6', '+1234567890', 'es', true, '2026-05-14 10:43:23.452123', '2026-05-14 10:43:23.452123', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (16, 'HUGO BONILLA C', 'hbonillac80@gmail.com', '$2b$12$5qw20Y8pnAvKhAkpFW0E6Ow621RFYOksnkJAwCxvQtTCU2.dybk6e', '55555555', 'es', true, '2026-05-20 18:14:12.818646', '2026-05-23 14:35:14.919488', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (18, 'EMPLEADO TARIFA', 'empleado.tarifa@gmail.com', '$2b$12$QiJa6J2nDA9/OZ8AcpauouW0/IOTZQBCOY.tvm3Acj92rnRGXrRQK', '+12348674', 'es', true, '2026-06-01 22:11:39.097078', '2026-06-01 22:11:39.09708', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (10, 'EMPLEADO1', 'empleado1@gmail.com', '$2b$12$97aa31hTD6fT6TIgfWHez.0VIePPzK/zq6rwDw/ezR/PAx3aVQdKG', '123454567', 'es', true, '2026-05-14 11:34:16.902127', '2026-06-05 17:03:37.166019', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (13, 'COORDINADOR1', 'coordinador@gmail.com', '$2b$12$2adhJfHQErxFe6liELW4Z.YxkJIjvAUR8LuK/hHiezWw5eELjaWKy', NULL, 'es', true, '2026-05-20 04:02:49.308239', '2026-06-05 17:03:47.298259', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (17, 'COORDINADOR2', 'coordinador2@gmail.com', '$2b$12$cf2igeUmrmj5EPaStXTdLO5PcWW/JmtaMwjFlkOTa.29bhQSB4m2W', NULL, 'es', true, '2026-05-21 02:44:27.692571', '2026-06-05 17:03:53.823445', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (11, 'EMPLEADO2', 'empleado2@gmail.com', '$2b$12$4ZNichTMHjVV/W3vi.rlyu5cruq39rEf.jA6Gaq8Kdbib.BT/9uBy', '6597695788', 'es', true, '2026-05-14 11:34:50.884708', '2026-06-05 17:04:01.673279', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (12, 'EMPLEADO3', 'empleado3@empleado.com', '$2b$12$fIvyS52ANHrfRD9fr/0NiemdHsFVxYfcw7OB1ebAfZBfLfv4ugyju', NULL, 'es', true, '2026-05-14 20:16:31.604358', '2026-06-05 17:04:09.574814', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (19, 'JOSE ANDRES GOMEZ', 'jose@gmail.com', '$2b$12$KkAqj5zChmc.wRHjkt9XHeSZ0B68IJc1nalIi3/x6lbr33wXvWihW', '57316825100', 'es', true, '2026-06-05 22:59:00.280242', '2026-06-05 22:59:00.280247', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (20, 'PEPITO', 'pepito@gmail.con', '$2b$12$IeBK8cPE3IerGLj/CIGGwe7UPqKpjo8jaEu8dxeSdJvfcuDsK4AHW', '+573108403985', 'es', true, '2026-06-06 00:42:20.664974', '2026-06-06 00:42:20.664977', false, NULL, NULL, NULL, NULL, NULL, '3108403985');
INSERT INTO public.users VALUES (22, 'FULANITO', 'fulanito@gmail.com', '$2b$12$KIHssVCVu1G.rsD6tmA0WO73dkcwJAZZEOtTbWP6/ojQUsGo3LR8m', '12345678', 'es', true, '2026-06-06 01:35:02.625386', '2026-06-06 01:35:40.953564', false, NULL, NULL, NULL, NULL, NULL, 'fulanito@gmail.com');
INSERT INTO public.users VALUES (23, 'LUISA GALEANO', 'luisa@gmail.com', '$2b$12$DGWPB5BgJcvg9ERXdzKTs.q4XeXr/kix1mkqRAcsvBDneKJsP1bLm', '318542120', 'es', true, '2026-06-06 01:35:40.388621', '2026-06-06 01:36:50.973932', false, NULL, NULL, NULL, NULL, NULL, '11223344');
INSERT INTO public.users VALUES (24, 'PAUL WALKER', 'paul@gmail.com', '$2b$12$md2mjLPqgqSopiizTlxfbOIVqTeIi8s9SxpVRIvlI80DC6heBTrJG', '728200100', 'es', true, '2026-06-06 02:30:19.36869', '2026-06-06 02:31:14.951382', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (101, 'MARIA GONZALEZ', 'maria.g@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552001', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'mariag');
INSERT INTO public.users VALUES (7, 'AARON WIBRANOWSKY', 'aaron@gmail.com', '$2b$12$0xJaHPb/7CqVEUWc/KZjPeDKShb3.Mps.VsoBKSPr11EJe7WY/wSm', '+19546391742', 'es', true, '2026-05-14 11:31:13.98221', '2026-06-10 01:22:31.359872', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (15, 'ADMIN PRUEBA', 'juliandres1@hotmail.com', '$2b$12$qQgbi6OfMfMuEY4QsTFL8u/2rd0lwJuxVnjLh3mhuaOX2b1xbonfW', '+17282058379', 'es', true, '2026-05-20 15:58:48.605506', '2026-06-17 02:38:48.46989', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (9, 'JULIANK', 'julian@gmail.com', '$2b$12$Y8Q75EIUXIhyxJ8DaITyKez6zVsERIFq/roEh9V4wnXKfa0uKwUOS', '+17866308932', 'es', true, '2026-05-14 11:33:14.75831', '2026-06-17 02:47:54.285763', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (14, 'JULIAN KUNZIG F', 'julian.kunzig@gmail.com', '$2b$12$2Oxa37xFPLnV.D6HHdcdSuLmQKP9nT/wEwuoFqoWSUhzwdwlWjqpm', '+17866308933', 'es', true, '2026-05-20 13:55:35.187297', '2026-06-17 03:11:27.948383', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (100, 'CARLOS ADMIN', 'carlos@elitecatering.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+573166344862', 'es', true, '2026-06-08 17:17:50.709562', '2026-06-19 19:39:23.856029', false, NULL, NULL, NULL, NULL, NULL, 'carlosadmin');
INSERT INTO public.users VALUES (21, 'DIANA MARIN', 'diana@gmail.com', '$2b$12$4qbrwFIHQ1DKdbTY3tqkVemDyfnV2AF3wAj4j5O9W0Rn18a4jxisq', NULL, 'es', true, '2026-06-06 00:56:45.875965', '2026-06-19 20:39:34.418136', false, NULL, NULL, NULL, NULL, NULL, '7282058378');
INSERT INTO public.users VALUES (8, 'HUGOB', 'hugo@gmail.com', '$2b$12$40HTwYAtDuiauYmD9yWz6uWn098.W3.1Zvjxr89vcAp7zeMLhxoKK', '+17282058377', 'es', true, '2026-05-14 11:32:37.871615', '2026-06-19 20:45:27.645686', false, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (102, 'JUAN PEREZ', 'juan.p@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552002', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'juanp');
INSERT INTO public.users VALUES (103, 'ANA MARTINEZ', 'ana.m@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552003', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'anam');
INSERT INTO public.users VALUES (104, 'PEDRO LOPEZ', 'pedro.l@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552004', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'pedrol');
INSERT INTO public.users VALUES (105, 'SOFIA RODRIGUEZ', 'sofia.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552005', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'sofiar');
INSERT INTO public.users VALUES (106, 'DIEGO HERNANDEZ', 'diego.h@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552006', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'diegoh');
INSERT INTO public.users VALUES (107, 'LAURA GARCIA', 'laura.g@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552007', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'laurag');
INSERT INTO public.users VALUES (108, 'CARLOS SANCHEZ', 'carlos.s@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552008', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'carloss');
INSERT INTO public.users VALUES (109, 'VALENTINA TORRES', 'valentina.t@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552009', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'valentinat');
INSERT INTO public.users VALUES (110, 'MIGUEL RAMIREZ', 'miguel.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552010', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'miguelr');
INSERT INTO public.users VALUES (111, 'CAMILA FLORES', 'camila.f@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552011', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'camilaf');
INSERT INTO public.users VALUES (112, 'ANDRES MORALES', 'andres.m@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552012', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'andresm');
INSERT INTO public.users VALUES (113, 'ISABELLA DIAZ', 'isabella.d@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552013', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'isabellad');
INSERT INTO public.users VALUES (114, 'SEBASTIAN RUIZ', 'sebastian.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552014', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'sebastianr');
INSERT INTO public.users VALUES (115, 'DANIELA VARGAS', 'daniela.v@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552015', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'danielav');
INSERT INTO public.users VALUES (116, 'NICOLAS CASTRO', 'nicolas.c@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552016', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'nicolasc');
INSERT INTO public.users VALUES (117, 'PAULA MENDOZA', 'paula.m@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552017', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'paulam');
INSERT INTO public.users VALUES (118, 'ALEJANDRO ORTIZ', 'alejandro.o@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552018', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'alejandroo');
INSERT INTO public.users VALUES (119, 'NATALIA REYES', 'natalia.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552019', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'nataliar');
INSERT INTO public.users VALUES (120, 'FERNANDO SILVA', 'fernando.s@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552020', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'fernandos');
INSERT INTO public.users VALUES (121, 'MARIANA CRUZ', 'mariana.c@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552021', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'marianac');
INSERT INTO public.users VALUES (122, 'RICARDO PENA', 'ricardo.p@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552022', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'ricardop');
INSERT INTO public.users VALUES (123, 'CAROLINA ROJAS', 'carolina.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552023', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'carolinar');
INSERT INTO public.users VALUES (124, 'GABRIEL HERRERA', 'gabriel.h@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552024', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'gabrielh');
INSERT INTO public.users VALUES (125, 'ANDREA MOLINA', 'andrea.m@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552025', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'andream');
INSERT INTO public.users VALUES (127, 'VICTORIA LEON', 'victoria.l@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552027', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'victorial');
INSERT INTO public.users VALUES (128, 'DAVID ROMERO', 'david.r@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552028', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'davidr');
INSERT INTO public.users VALUES (129, 'ELENA NAVARRO', 'elena.n@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552029', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'elenan');
INSERT INTO public.users VALUES (130, 'OSCAR DELGADO', 'oscar.d@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+13055552030', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-08 17:17:50.766479', false, NULL, NULL, NULL, NULL, NULL, 'oscard');
INSERT INTO public.users VALUES (126, 'LUIS JIMENEZ', 'luis.j@elite.com', '$2b$12$sRA.u/y510ugxx1LXLFK1OzRhiMvAouIb7BC.NtUHF5pjzsBvex6.', '+17282058378', 'es', true, '2026-06-08 17:17:50.766479', '2026-06-19 20:46:16.175986', false, NULL, NULL, NULL, NULL, NULL, 'luisj');


--
-- Data for Name: employee_job_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employee_job_roles VALUES (3, 8, 5, 11, '2026-05-14 20:18:42.787167', NULL);
INSERT INTO public.employee_job_roles VALUES (4, 12, 5, 11, '2026-05-14 20:18:42.790759', NULL);
INSERT INTO public.employee_job_roles VALUES (5, 11, 5, 11, '2026-05-14 20:18:42.791971', NULL);
INSERT INTO public.employee_job_roles VALUES (7, 11, 5, 13, '2026-05-14 20:19:08.713053', NULL);
INSERT INTO public.employee_job_roles VALUES (8, 12, 5, 13, '2026-05-14 20:19:08.715834', NULL);
INSERT INTO public.employee_job_roles VALUES (12, 16, 5, 11, '2026-05-20 18:14:32.149813', NULL);
INSERT INTO public.employee_job_roles VALUES (6, 10, 5, 12, '2026-05-14 20:18:54.438386', 22.00);
INSERT INTO public.employee_job_roles VALUES (1, 8, 5, 10, '2026-05-14 20:18:22.368006', 20.00);
INSERT INTO public.employee_job_roles VALUES (13, 18, 5, 10, '2026-06-01 22:11:39.168965', 25.00);
INSERT INTO public.employee_job_roles VALUES (14, 18, 5, 12, '2026-06-01 22:11:39.195611', 22.00);
INSERT INTO public.employee_job_roles VALUES (15, 18, 5, 14, '2026-06-01 22:13:27.647084', 19.00);
INSERT INTO public.employee_job_roles VALUES (9, 10, 5, 10, '2026-05-20 01:16:31.622571', 24.00);
INSERT INTO public.employee_job_roles VALUES (11, 16, 5, 10, '2026-05-20 18:14:25.91532', 21.00);
INSERT INTO public.employee_job_roles VALUES (2, 9, 5, 10, '2026-05-14 20:18:22.376931', 19.00);
INSERT INTO public.employee_job_roles VALUES (10, 14, 5, 10, '2026-05-20 16:00:21.240569', 27.00);
INSERT INTO public.employee_job_roles VALUES (18, 21, 5, 11, '2026-06-06 02:16:52.258383', NULL);
INSERT INTO public.employee_job_roles VALUES (19, 19, 5, 10, '2026-06-06 02:17:17.528697', NULL);
INSERT INTO public.employee_job_roles VALUES (20, 23, 5, 10, '2026-06-06 02:17:17.531084', NULL);
INSERT INTO public.employee_job_roles VALUES (21, 20, 5, 11, '2026-06-06 02:17:37.18688', NULL);
INSERT INTO public.employee_job_roles VALUES (22, 16, 6, 15, '2026-06-06 02:47:57.260764', NULL);
INSERT INTO public.employee_job_roles VALUES (23, 26, 5, 10, '2026-06-06 03:46:53.558791', NULL);
INSERT INTO public.employee_job_roles VALUES (24, 26, 5, 11, '2026-06-06 03:46:53.584214', NULL);
INSERT INTO public.employee_job_roles VALUES (25, 101, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (26, 102, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (27, 103, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (28, 104, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (29, 105, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (30, 106, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (31, 107, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (32, 108, 10, 50, '2026-06-08 17:17:50.774645', NULL);
INSERT INTO public.employee_job_roles VALUES (33, 105, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (34, 106, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (35, 107, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (36, 108, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (37, 109, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (38, 110, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (39, 111, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (40, 112, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (41, 113, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (42, 114, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (43, 115, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (44, 116, 10, 51, '2026-06-08 17:17:50.779345', NULL);
INSERT INTO public.employee_job_roles VALUES (45, 117, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (46, 118, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (47, 119, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (48, 120, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (49, 121, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (50, 122, 10, 52, '2026-06-08 17:17:50.780511', NULL);
INSERT INTO public.employee_job_roles VALUES (51, 123, 10, 53, '2026-06-08 17:17:50.781069', NULL);
INSERT INTO public.employee_job_roles VALUES (52, 124, 10, 53, '2026-06-08 17:17:50.781069', NULL);
INSERT INTO public.employee_job_roles VALUES (53, 125, 10, 53, '2026-06-08 17:17:50.781069', NULL);
INSERT INTO public.employee_job_roles VALUES (54, 126, 10, 53, '2026-06-08 17:17:50.781069', NULL);
INSERT INTO public.employee_job_roles VALUES (55, 127, 10, 54, '2026-06-08 17:17:50.781529', NULL);
INSERT INTO public.employee_job_roles VALUES (56, 128, 10, 54, '2026-06-08 17:17:50.781529', NULL);
INSERT INTO public.employee_job_roles VALUES (57, 129, 10, 54, '2026-06-08 17:17:50.781529', NULL);
INSERT INTO public.employee_job_roles VALUES (58, 130, 10, 54, '2026-06-08 17:17:50.781529', NULL);
INSERT INTO public.employee_job_roles VALUES (59, 9, 10, 50, '2026-06-17 02:45:05.530649', NULL);
INSERT INTO public.employee_job_roles VALUES (60, 8, 10, 50, '2026-06-19 18:59:13.94786', NULL);
INSERT INTO public.employee_job_roles VALUES (61, 118, 10, 51, '2026-06-19 19:27:18.646066', NULL);
INSERT INTO public.employee_job_roles VALUES (62, 126, 10, 50, '2026-06-19 20:45:48.379861', NULL);


--
-- Data for Name: employee_profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.events VALUES (200, 10, 'Boda Smith #1', '2026-01-01', '10:00:00', '14:00:00', '123 Collins Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-08 23:40:52.36027', 'Miami', 'FL', '33139', true, NULL, '10-1');
INSERT INTO public.events VALUES (1, 5, 'EVENTO 1', '2026-05-19', '21:12:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 00:47:45.980943', '2026-05-20 01:05:35.482744', 'MIAMI', 'FL', '33161', true, NULL, '5-1');
INSERT INTO public.events VALUES (2, 5, 'EVENTO 2', '2026-05-19', '22:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 00:49:58.313464', '2026-05-20 03:08:08.785715', 'MIAMI', 'FL', '33161', true, NULL, '5-2');
INSERT INTO public.events VALUES (3, 5, 'EVENTO 3', '2026-05-19', '21:31:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 01:09:38.752763', '2026-05-20 01:20:03.052321', 'MIAMI', 'FL', '33161', true, NULL, '5-3');
INSERT INTO public.events VALUES (4, 5, 'EVENTO 4', '2026-05-19', '23:24:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 03:09:13.001555', '2026-05-20 04:34:40.769258', 'MIAMI', 'FL', '33161', true, NULL, '5-4');
INSERT INTO public.events VALUES (5, 5, 'EVENTO 5', '2026-05-20', '00:20:00', '07:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 04:01:02.857945', '2026-05-20 10:00:29.054555', 'MIAMI', 'FL', '33161', true, NULL, '5-5');
INSERT INTO public.events VALUES (73, 10, 'WEDDING BH', '2026-06-16', '23:00:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'TODO DE NEGRO', 'cancelled', 100, '2026-06-17 02:42:04.341907', '2026-06-17 02:57:39.165839', 'NORTH MIAMI BEACH', 'FL', '33180', true, NULL, '10-103');
INSERT INTO public.events VALUES (75, 10, 'BODA 190626 BH', '2026-06-19', '15:15:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'TODO DE NEGRO', 'started', 100, '2026-06-19 18:53:01.54372', '2026-06-19 19:03:02.840564', 'NORTH MIAMI BEACH', 'FL', '33180', true, NULL, '10-105');
INSERT INTO public.events VALUES (71, 10, 'BODA', '2026-06-09', '22:35:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'cancelled', 100, '2026-06-10 01:34:49.289846', '2026-06-19 19:58:45.278703', 'MIAMI', 'FL', '33161', true, NULL, '10-102');
INSERT INTO public.events VALUES (59, 5, 'BODA JUNIO 1', '2026-06-03', '21:30:00', NULL, '3501 S UNIVERSITY DR', 26.0776930, -80.2515666, 'NEGRO', 'published', 7, '2026-06-03 03:45:27.569596', '2026-06-17 02:48:19.906956', 'DAVIE', 'FL', '33328', true, 'POR FAVOR, LLEGUE 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDE QUE EL CÓDIGO DE VESTIMENTA ES NEGRO. SE ESPERA QUE MANTENGA UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SIENDO CORTÉS Y ATENTO CON LOS INVITADOS. EN CASO DE CUALQUIER EMERGENCIA, POR FAVOR CONTACTE A: __________.', '5-59');
INSERT INTO public.events VALUES (40, 5, 'EVENTO 36 WHATSAPP', '2026-05-25', '17:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'filled', 15, '2026-05-25 16:25:32.900377', '2026-06-17 02:53:12.46796', 'MIAMI', 'FL', '33161', true, NULL, '5-40');
INSERT INTO public.events VALUES (39, 5, 'EVENTOS 35 LLAVES', '2026-05-25', '14:00:00', NULL, '5091 NW 7TH ST. APT 803', NULL, NULL, 'BLACK', 'filled', 7, '2026-05-25 16:22:59.65925', '2026-06-17 02:53:19.590753', 'MIAMI', 'FL', '33126', true, NULL, '5-39');
INSERT INTO public.events VALUES (38, 5, 'EVENTO 34 LLAVES', '2026-05-25', '13:00:00', NULL, '5091 NW 7TH ST. APT 803', NULL, NULL, 'BLACK ON BLACK', 'filled', 7, '2026-05-25 16:19:08.79237', '2026-06-17 02:53:26.861305', 'MIAMI', 'FL', '33126', true, 'POR FAVOR, LLEGUE 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL EDIFICIO, 5091 NW 7TH ST. APT 803, MIAMI, FL. RECUERDE QUE EL CÓDIGO DE VESTIMENTA ES NEGRO SOBRE NEGRO, ASÍ QUE ASEGÚRESE DE CUMPLIR CON ESTA INDICACIÓN. DURANTE EL EVENTO, MANTENGA UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SEA CORTÉS CON LOS INVITADOS Y ESTÉ ATENTO A SUS NECESIDADES. EN CASO DE CUALQUIER EMERGENCIA, POR FAVOR, COMUNÍQUESE CON EL CONTACTO DE EMERGENCIA: __________.', '5-38');
INSERT INTO public.events VALUES (37, 5, 'EVENTO 33 BOTON TURNO', '2026-05-23', '23:25:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-24 03:08:16.480526', '2026-05-24 03:11:54.179069', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGA 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARTE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL EDIFICIO, DONDE TE RECIBIRÁN. RECUERDA QUE EL CÓDIGO DE VESTIMENTA ES NEGRO; ASEGÚRATE DE QUE TU ATUENDO CUMPLA CON ESTA ESPECIFICACIÓN. MANTÉN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SIENDO AMABLE Y SERVICIAL CON LOS INVITADOS. EN CASO DE CUALQUIER EMERGENCIA, CONTACTA A LA PERSONA DESIGNADA AL NÚMERO: __________.', '5-37');
INSERT INTO public.events VALUES (66, 10, 'WEDDING 08.JUN.2026', '2026-06-08', '22:30:00', NULL, 'BETH TORAH', 25.9264824, -80.1789357, 'NEGRO', 'filled', 100, '2026-06-09 02:05:56.106343', '2026-06-10 01:08:48.998992', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO SERÁ LA ENTRADA PRINCIPAL DE BETH TORAH, MIAMI, FL. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES NEGRO. 

ES FUNDAMENTAL MANTENER UNA CONDUCTA PROFESIONAL EN TODO MOMENTO, SER CORTÉS CON LOS INVITADOS Y TRABAJAR EN EQUIPO. ASEGÚRENSE DE ESTAR ATENTOS A LAS INSTRUCCIONES DEL COORDINADOR DEL EVENTO Y DE RESOLVER CUALQUIER PROBLEMA QUE PUEDA SURGIR DE MANERA RÁPIDA Y EFICIENTE.

PARA EMERGENCIAS, POR FAVOR CONTACTEN A: __________.', '10-101');
INSERT INTO public.events VALUES (67, 5, 'BODA 08.JUN.2026', '2026-06-08', '22:45:00', NULL, 'BETH TORAH', 25.9264824, -80.1789357, 'BLANCO', 'finished', 7, '2026-06-09 02:20:34.850916', '2026-06-10 01:52:51.257111', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO PARA EL PERSONAL ES LA ENTRADA PRINCIPAL DE BETH TORAH, MIAMI, FL. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES BLANCO, ASÍ QUE ASEGÚRENSE DE CUMPLIR CON ESTA INDICACIÓN. SE ESPERA QUE MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER PUNTUALES, AMABLES Y ATENTOS A LAS NECESIDADES DE LOS INVITADOS. EN CASO DE EMERGENCIA, POR FAVOR CONTACTEN A: __________.', '5-66');
INSERT INTO public.events VALUES (74, 10, 'BODA', '2026-06-16', '23:10:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'TODO DE NEGRO', 'finished', 100, '2026-06-17 02:58:20.32681', '2026-06-19 15:28:06.83763', 'NORTH MIAMI BEACH', 'FL', '33180', true, NULL, '10-104');
INSERT INTO public.events VALUES (72, 5, 'BODA JUN926', '2026-06-09', '23:00:00', NULL, '1251 NE', 25.8750721, -80.1726474, 'NEGRO', 'created', 7, '2026-06-10 04:13:40.282673', '2026-06-10 04:13:40.354279', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES NEGRO, ASÍ QUE ASEGÚRENSE DE CUMPLIR CON ESTA INDICACIÓN. 

ES FUNDAMENTAL MANTENER UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO: SEAN AMABLES, CORTESES Y MANTENGAN UNA ACTITUD POSITIVA. 

EN CASO DE CUALQUIER EMERGENCIA, POR FAVOR CONTACTEN A: __________.', '5-70');
INSERT INTO public.events VALUES (76, 10, 'DINNER 190626 BH', '2026-06-19', '16:15:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'TODO DE NEGRO', 'filled', 100, '2026-06-19 19:13:32.538798', '2026-06-19 19:40:52.84421', 'NORTH MIAMI BEACH', 'FL', '33180', true, NULL, '10-106');
INSERT INTO public.events VALUES (204, 10, 'Coctel VIP #5', '2026-01-07', '16:00:00', '20:00:00', '555 Lincoln Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:31:54.438506', 'Miami', 'FL', '33139', true, NULL, '10-5');
INSERT INTO public.events VALUES (209, 10, 'Brunch Ejecutivo #10', '2026-01-15', '11:00:00', '15:00:00', '800 NE 1st Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214261', 'Miami', 'FL', '33139', true, NULL, '10-10');
INSERT INTO public.events VALUES (210, 10, 'Conferencia Tech #11', '2026-01-17', '12:00:00', '16:00:00', '123 Collins Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214262', 'Miami', 'FL', '33139', true, NULL, '10-11');
INSERT INTO public.events VALUES (211, 10, 'Festival Gastronomico #12', '2026-01-18', '14:00:00', '18:00:00', '456 Ocean Dr', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214262', 'Miami', 'FL', '33139', true, NULL, '10-12');
INSERT INTO public.events VALUES (212, 10, 'Noche de Casino #13', '2026-01-20', '16:00:00', '20:00:00', '789 Brickell Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214262', 'Miami', 'FL', '33139', true, NULL, '10-13');
INSERT INTO public.events VALUES (213, 10, 'Boda Garcia #14', '2026-01-21', '18:00:00', '22:00:00', '321 NW 2nd Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214263', 'Miami', 'FL', '33139', true, NULL, '10-14');
INSERT INTO public.events VALUES (214, 10, 'Reunion Familiar #15', '2026-01-23', '19:00:00', '23:00:00', '555 Lincoln Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214263', 'Miami', 'FL', '33139', true, NULL, '10-15');
INSERT INTO public.events VALUES (215, 10, 'Fiesta Navideña #16', '2026-01-25', '20:00:00', '00:00:00', '900 Washington Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214263', 'Miami', 'FL', '33139', true, NULL, '10-16');
INSERT INTO public.events VALUES (216, 10, 'Año Nuevo Privado #17', '2026-01-26', '10:00:00', '14:00:00', '1200 Alton Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214263', 'Miami', 'FL', '33139', true, NULL, '10-17');
INSERT INTO public.events VALUES (217, 10, 'Super Bowl Party #18', '2026-01-28', '11:00:00', '15:00:00', '1500 Bay Rd', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214263', 'Miami', 'FL', '33139', true, NULL, '10-18');
INSERT INTO public.events VALUES (218, 10, 'Valentine Dinner #19', '2026-01-29', '12:00:00', '16:00:00', '200 SE 1st St', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214264', 'Miami', 'FL', '33139', true, NULL, '10-19');
INSERT INTO public.events VALUES (219, 10, 'St Patrick Gala #20', '2026-01-31', '14:00:00', '18:00:00', '800 NE 1st Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214264', 'Miami', 'FL', '33139', true, NULL, '10-20');
INSERT INTO public.events VALUES (220, 10, 'Easter Brunch #21', '2026-02-01', '16:00:00', '20:00:00', '123 Collins Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214264', 'Miami', 'FL', '33139', true, NULL, '10-21');
INSERT INTO public.events VALUES (221, 10, 'Cinco de Mayo #22', '2026-02-03', '18:00:00', '22:00:00', '456 Ocean Dr', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214264', 'Miami', 'FL', '33139', true, NULL, '10-22');
INSERT INTO public.events VALUES (222, 10, 'Memorial Day BBQ #23', '2026-02-05', '19:00:00', '23:00:00', '789 Brickell Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214265', 'Miami', 'FL', '33139', true, NULL, '10-23');
INSERT INTO public.events VALUES (223, 10, 'Pool Party VIP #24', '2026-02-06', '20:00:00', '00:00:00', '321 NW 2nd Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214265', 'Miami', 'FL', '33139', true, NULL, '10-24');
INSERT INTO public.events VALUES (224, 10, 'Boda Smith #25', '2026-02-08', '10:00:00', '14:00:00', '555 Lincoln Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214265', 'Miami', 'FL', '33139', true, NULL, '10-25');
INSERT INTO public.events VALUES (225, 10, 'Cumpleaños Johnson #26', '2026-02-09', '11:00:00', '15:00:00', '900 Washington Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214265', 'Miami', 'FL', '33139', true, NULL, '10-26');
INSERT INTO public.events VALUES (226, 10, 'Gala Corporativa #27', '2026-02-11', '12:00:00', '16:00:00', '1200 Alton Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214266', 'Miami', 'FL', '33139', true, NULL, '10-27');
INSERT INTO public.events VALUES (227, 10, 'Cena Privada #28', '2026-02-12', '14:00:00', '18:00:00', '1500 Bay Rd', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214266', 'Miami', 'FL', '33139', true, NULL, '10-28');
INSERT INTO public.events VALUES (228, 10, 'Coctel VIP #29', '2026-02-14', '16:00:00', '20:00:00', '200 SE 1st St', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214266', 'Miami', 'FL', '33139', true, NULL, '10-29');
INSERT INTO public.events VALUES (229, 10, 'Fiesta Graduación #30', '2026-02-16', '18:00:00', '22:00:00', '800 NE 1st Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214266', 'Miami', 'FL', '33139', true, NULL, '10-30');
INSERT INTO public.events VALUES (230, 10, 'Evento Caridad #31', '2026-02-17', '19:00:00', '23:00:00', '123 Collins Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214266', 'Miami', 'FL', '33139', true, NULL, '10-31');
INSERT INTO public.events VALUES (231, 10, 'Lanzamiento Producto #32', '2026-02-19', '20:00:00', '00:00:00', '456 Ocean Dr', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214267', 'Miami', 'FL', '33139', true, NULL, '10-32');
INSERT INTO public.events VALUES (232, 10, 'Aniversario Empresa #33', '2026-02-20', '10:00:00', '14:00:00', '789 Brickell Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214267', 'Miami', 'FL', '33139', true, NULL, '10-33');
INSERT INTO public.events VALUES (233, 10, 'Brunch Ejecutivo #34', '2026-02-22', '11:00:00', '15:00:00', '321 NW 2nd Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214267', 'Miami', 'FL', '33139', true, NULL, '10-34');
INSERT INTO public.events VALUES (234, 10, 'Conferencia Tech #35', '2026-02-23', '12:00:00', '16:00:00', '555 Lincoln Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214267', 'Miami', 'FL', '33139', true, NULL, '10-35');
INSERT INTO public.events VALUES (235, 10, 'Festival Gastronomico #36', '2026-02-25', '14:00:00', '18:00:00', '900 Washington Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214267', 'Miami', 'FL', '33139', true, NULL, '10-36');
INSERT INTO public.events VALUES (236, 10, 'Noche de Casino #37', '2026-02-27', '16:00:00', '20:00:00', '1200 Alton Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214268', 'Miami', 'FL', '33139', true, NULL, '10-37');
INSERT INTO public.events VALUES (237, 10, 'Boda Garcia #38', '2026-02-28', '18:00:00', '22:00:00', '1500 Bay Rd', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214268', 'Miami', 'FL', '33139', true, NULL, '10-38');
INSERT INTO public.events VALUES (238, 10, 'Reunion Familiar #39', '2026-03-02', '19:00:00', '23:00:00', '200 SE 1st St', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214268', 'Miami', 'FL', '33139', true, NULL, '10-39');
INSERT INTO public.events VALUES (239, 10, 'Fiesta Navideña #40', '2026-03-03', '20:00:00', '00:00:00', '800 NE 1st Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214268', 'Miami', 'FL', '33139', true, NULL, '10-40');
INSERT INTO public.events VALUES (240, 10, 'Año Nuevo Privado #41', '2026-03-05', '10:00:00', '14:00:00', '123 Collins Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214269', 'Miami', 'FL', '33139', true, NULL, '10-41');
INSERT INTO public.events VALUES (241, 10, 'Super Bowl Party #42', '2026-03-06', '11:00:00', '15:00:00', '456 Ocean Dr', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214269', 'Miami', 'FL', '33139', true, NULL, '10-42');
INSERT INTO public.events VALUES (242, 10, 'Valentine Dinner #43', '2026-03-08', '12:00:00', '16:00:00', '789 Brickell Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214269', 'Miami', 'FL', '33139', true, NULL, '10-43');
INSERT INTO public.events VALUES (243, 10, 'St Patrick Gala #44', '2026-03-10', '14:00:00', '18:00:00', '321 NW 2nd Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214269', 'Miami', 'FL', '33139', true, NULL, '10-44');
INSERT INTO public.events VALUES (244, 10, 'Easter Brunch #45', '2026-03-11', '16:00:00', '20:00:00', '555 Lincoln Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214269', 'Miami', 'FL', '33139', true, NULL, '10-45');
INSERT INTO public.events VALUES (245, 10, 'Cinco de Mayo #46', '2026-03-13', '18:00:00', '22:00:00', '900 Washington Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21427', 'Miami', 'FL', '33139', true, NULL, '10-46');
INSERT INTO public.events VALUES (251, 10, 'Cena Privada #52', '2026-03-22', '14:00:00', '18:00:00', '456 Ocean Dr', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214271', 'Miami', 'FL', '33139', true, NULL, '10-52');
INSERT INTO public.events VALUES (252, 10, 'Coctel VIP #53', '2026-03-24', '16:00:00', '20:00:00', '789 Brickell Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214271', 'Miami', 'FL', '33139', true, NULL, '10-53');
INSERT INTO public.events VALUES (253, 10, 'Fiesta Graduación #54', '2026-03-25', '18:00:00', '22:00:00', '321 NW 2nd Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214271', 'Miami', 'FL', '33139', true, NULL, '10-54');
INSERT INTO public.events VALUES (254, 10, 'Evento Caridad #55', '2026-03-27', '19:00:00', '23:00:00', '555 Lincoln Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214271', 'Miami', 'FL', '33139', true, NULL, '10-55');
INSERT INTO public.events VALUES (255, 10, 'Lanzamiento Producto #56', '2026-03-28', '20:00:00', '00:00:00', '900 Washington Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214272', 'Miami', 'FL', '33139', true, NULL, '10-56');
INSERT INTO public.events VALUES (256, 10, 'Aniversario Empresa #57', '2026-03-30', '10:00:00', '14:00:00', '1200 Alton Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214272', 'Miami', 'FL', '33139', true, NULL, '10-57');
INSERT INTO public.events VALUES (257, 10, 'Brunch Ejecutivo #58', '2026-03-31', '11:00:00', '15:00:00', '1500 Bay Rd', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214272', 'Miami', 'FL', '33139', true, NULL, '10-58');
INSERT INTO public.events VALUES (258, 10, 'Conferencia Tech #59', '2026-04-02', '12:00:00', '16:00:00', '200 SE 1st St', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214272', 'Miami', 'FL', '33139', true, NULL, '10-59');
INSERT INTO public.events VALUES (259, 10, 'Festival Gastronomico #60', '2026-04-04', '14:00:00', '18:00:00', '800 NE 1st Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214273', 'Miami', 'FL', '33139', true, NULL, '10-60');
INSERT INTO public.events VALUES (260, 10, 'Noche de Casino #61', '2026-04-05', '16:00:00', '20:00:00', '123 Collins Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214273', 'Miami', 'FL', '33139', true, NULL, '10-61');
INSERT INTO public.events VALUES (282, 10, 'Conferencia Tech #83', '2026-05-10', '12:00:00', '16:00:00', '789 Brickell Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:36:31.879679', 'Miami', 'FL', '33139', true, NULL, '10-83');
INSERT INTO public.events VALUES (283, 10, 'Festival Gastronomico #84', '2026-05-11', '14:00:00', '18:00:00', '321 NW 2nd Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:36:31.879681', 'Miami', 'FL', '33139', true, NULL, '10-84');
INSERT INTO public.events VALUES (284, 10, 'Noche de Casino #85', '2026-05-13', '16:00:00', '20:00:00', '555 Lincoln Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:36:31.879681', 'Miami', 'FL', '33139', true, NULL, '10-85');
INSERT INTO public.events VALUES (285, 10, 'Boda Garcia #86', '2026-05-14', '18:00:00', '22:00:00', '900 Washington Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:36:31.879682', 'Miami', 'FL', '33139', true, NULL, '10-86');
INSERT INTO public.events VALUES (286, 10, 'Reunion Familiar #87', '2026-05-16', '19:00:00', '23:00:00', '1200 Alton Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:36:31.879682', 'Miami', 'FL', '33139', true, NULL, '10-87');
INSERT INTO public.events VALUES (261, 10, 'Boda Garcia #62', '2026-04-07', '18:00:00', '22:00:00', '456 Ocean Dr', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214273', 'Miami', 'FL', '33139', true, NULL, '10-62');
INSERT INTO public.events VALUES (262, 10, 'Reunion Familiar #63', '2026-04-08', '19:00:00', '23:00:00', '789 Brickell Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214273', 'Miami', 'FL', '33139', true, NULL, '10-63');
INSERT INTO public.events VALUES (263, 10, 'Fiesta Navideña #64', '2026-04-10', '20:00:00', '00:00:00', '321 NW 2nd Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214273', 'Miami', 'FL', '33139', true, NULL, '10-64');
INSERT INTO public.events VALUES (264, 10, 'Año Nuevo Privado #65', '2026-04-11', '10:00:00', '14:00:00', '555 Lincoln Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214274', 'Miami', 'FL', '33139', true, NULL, '10-65');
INSERT INTO public.events VALUES (265, 10, 'Super Bowl Party #66', '2026-04-13', '11:00:00', '15:00:00', '900 Washington Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214274', 'Miami', 'FL', '33139', true, NULL, '10-66');
INSERT INTO public.events VALUES (266, 10, 'Valentine Dinner #67', '2026-04-15', '12:00:00', '16:00:00', '1200 Alton Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214274', 'Miami', 'FL', '33139', true, NULL, '10-67');
INSERT INTO public.events VALUES (267, 10, 'St Patrick Gala #68', '2026-04-16', '14:00:00', '18:00:00', '1500 Bay Rd', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214274', 'Miami', 'FL', '33139', true, NULL, '10-68');
INSERT INTO public.events VALUES (268, 10, 'Easter Brunch #69', '2026-04-18', '16:00:00', '20:00:00', '200 SE 1st St', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214274', 'Miami', 'FL', '33139', true, NULL, '10-69');
INSERT INTO public.events VALUES (269, 10, 'Cinco de Mayo #70', '2026-04-19', '18:00:00', '22:00:00', '800 NE 1st Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214275', 'Miami', 'FL', '33139', true, NULL, '10-70');
INSERT INTO public.events VALUES (270, 10, 'Memorial Day BBQ #71', '2026-04-21', '19:00:00', '23:00:00', '123 Collins Ave', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214275', 'Miami', 'FL', '33139', true, NULL, '10-71');
INSERT INTO public.events VALUES (271, 10, 'Pool Party VIP #72', '2026-04-22', '20:00:00', '00:00:00', '456 Ocean Dr', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214275', 'Miami', 'FL', '33139', true, NULL, '10-72');
INSERT INTO public.events VALUES (272, 10, 'Boda Smith #73', '2026-04-24', '10:00:00', '14:00:00', '789 Brickell Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214275', 'Miami', 'FL', '33139', true, NULL, '10-73');
INSERT INTO public.events VALUES (273, 10, 'Cumpleaños Johnson #74', '2026-04-26', '11:00:00', '15:00:00', '321 NW 2nd Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214275', 'Miami', 'FL', '33139', true, NULL, '10-74');
INSERT INTO public.events VALUES (274, 10, 'Gala Corporativa #75', '2026-04-27', '12:00:00', '16:00:00', '555 Lincoln Rd', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214276', 'Miami', 'FL', '33139', true, NULL, '10-75');
INSERT INTO public.events VALUES (275, 10, 'Cena Privada #76', '2026-04-29', '14:00:00', '18:00:00', '900 Washington Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214276', 'Miami', 'FL', '33139', true, NULL, '10-76');
INSERT INTO public.events VALUES (276, 10, 'Coctel VIP #77', '2026-04-30', '16:00:00', '20:00:00', '1200 Alton Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214276', 'Miami', 'FL', '33139', true, NULL, '10-77');
INSERT INTO public.events VALUES (277, 10, 'Fiesta Graduación #78', '2026-05-02', '18:00:00', '22:00:00', '1500 Bay Rd', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214276', 'Miami', 'FL', '33139', true, NULL, '10-78');
INSERT INTO public.events VALUES (278, 10, 'Evento Caridad #79', '2026-05-03', '19:00:00', '23:00:00', '200 SE 1st St', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214276', 'Miami', 'FL', '33139', true, NULL, '10-79');
INSERT INTO public.events VALUES (279, 10, 'Lanzamiento Producto #80', '2026-05-05', '20:00:00', '00:00:00', '800 NE 1st Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214277', 'Miami', 'FL', '33139', true, NULL, '10-80');
INSERT INTO public.events VALUES (280, 10, 'Aniversario Empresa #81', '2026-05-07', '10:00:00', '14:00:00', '123 Collins Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214277', 'Miami', 'FL', '33139', true, NULL, '10-81');
INSERT INTO public.events VALUES (281, 10, 'Brunch Ejecutivo #82', '2026-05-08', '11:00:00', '15:00:00', '456 Ocean Dr', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214277', 'Miami', 'FL', '33139', true, NULL, '10-82');
INSERT INTO public.events VALUES (287, 10, 'Fiesta Navideña #88', '2026-05-18', '20:00:00', '00:00:00', '1500 Bay Rd', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214277', 'Miami', 'FL', '33139', true, NULL, '10-88');
INSERT INTO public.events VALUES (288, 10, 'Año Nuevo Privado #89', '2026-05-19', '10:00:00', '14:00:00', '200 SE 1st St', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214277', 'Miami', 'FL', '33139', true, NULL, '10-89');
INSERT INTO public.events VALUES (289, 10, 'Super Bowl Party #90', '2026-05-21', '11:00:00', '15:00:00', '800 NE 1st Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214278', 'Miami', 'FL', '33139', true, NULL, '10-90');
INSERT INTO public.events VALUES (290, 10, 'Valentine Dinner #91', '2026-05-22', '12:00:00', '16:00:00', '123 Collins Ave', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214278', 'Miami', 'FL', '33139', true, NULL, '10-91');
INSERT INTO public.events VALUES (291, 10, 'St Patrick Gala #92', '2026-05-24', '14:00:00', '18:00:00', '456 Ocean Dr', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214278', 'Miami', 'FL', '33139', true, NULL, '10-92');
INSERT INTO public.events VALUES (292, 10, 'Easter Brunch #93', '2026-05-25', '16:00:00', '20:00:00', '789 Brickell Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214278', 'Miami', 'FL', '33139', true, NULL, '10-93');
INSERT INTO public.events VALUES (293, 10, 'Cinco de Mayo #94', '2026-05-27', '18:00:00', '22:00:00', '321 NW 2nd Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214278', 'Miami', 'FL', '33139', true, NULL, '10-94');
INSERT INTO public.events VALUES (77, 10, 'NUEVO ADMIN WHATSAPP', '2026-06-19', '04:30:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'started', 100, '2026-06-19 19:43:30.671411', '2026-06-19 20:06:05.043792', 'MIAMI', 'FL', '33161', true, NULL, '10-107');
INSERT INTO public.events VALUES (62, 5, 'GALA HOY', '2026-06-05', '22:30:00', NULL, '20350 NE 26TH AVE', 25.9653986, -80.1507651, 'FORMA DRESS CODE NEGRO', 'filled', 7, '2026-06-06 02:14:44.092639', '2026-06-06 03:29:23.658274', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, ASEGÚRESE DE LLEGAR 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO PARA EL PERSONAL SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDE QUE EL CÓDIGO DE VESTIMENTA ES FORMAL, ESPECÍFICAMENTE TRAJE NEGRO. MANTENGA UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER CORTÉS CON LOS INVITADOS Y TRABAJAR EN EQUIPO. EN CASO DE CUALQUIER EMERGENCIA, POR FAVOR CONTACTE A: __________.', '5-62');
INSERT INTO public.events VALUES (65, 5, 'EVENTO ASIGNACION DIRECTA', '2026-06-06', '12:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'published', 7, '2026-06-06 14:08:50.603397', '2026-06-06 14:23:30.065483', 'MIAMI', 'FL', '33161', true, NULL, '5-65');
INSERT INTO public.events VALUES (68, 5, 'CENA DE GALA 08.JUN.2026', '2026-06-09', '18:00:00', NULL, 'BETH TORAH', 25.9264824, -80.1789357, 'AZUL CON BLANCO', 'started', 7, '2026-06-09 04:03:27.263342', '2026-06-10 01:52:47.832325', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUE 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO PARA EL PERSONAL SERÁ EN LA ENTRADA PRINCIPAL DE BETH TORAH, MIAMI, FL. RECUERDE QUE EL CÓDIGO DE VESTIMENTA ES AZUL CON BLANCO. MANTENGA UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER PUNTUAL, CORTÉS Y ATENTO A LAS NECESIDADES DE LOS INVITADOS. EN CASO DE EMERGENCIA, COMUNÍQUESE CON EL SIGUIENTE CONTACTO: __________.', '5-67');
INSERT INTO public.events VALUES (78, 10, 'BAUTIZO CAL', '2026-06-19', '17:00:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'BLANCO', 'filled', 100, '2026-06-19 20:42:55.097088', '2026-06-19 21:15:27.038558', 'NORTH MIAMI', 'FL', '33180', true, NULL, '10-108');
INSERT INTO public.events VALUES (79, 10, 'CENA CALL', '2026-06-19', '17:20:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'BLANCO', 'created', 100, '2026-06-19 20:58:26.130309', '2026-06-19 20:58:26.148931', 'NORTH MIAMI', 'FL', '33180', true, NULL, '10-109');
INSERT INTO public.events VALUES (69, 5, 'WEDDING RUBELL MUSEUM 09JUN', '2026-06-09', '21:00:00', '03:00:00', '1100 NW 23 STREET', NULL, NULL, 'NEGRO', 'started', 7, '2026-06-10 00:42:49.239941', '2026-06-10 01:10:35.467191', 'MIAMI', 'FL', '33127', true, 'INSTRUCCIONES DE LLEGADA: POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO.  
PUNTO DE ENCUENTRO: REÚNANSE EN LA ENTRADA PRINCIPAL DEL RUBELL MUSEUM.  
RECORDATORIO DE CÓDIGO DE VESTIMENTA: TODOS DEBEN VESTIR DE NEGRO.  
COMPORTAMIENTO PROFESIONAL: MANTENGAN UNA ACTITUD CORDIAL Y PROFESIONAL EN TODO MOMENTO, RESPETEN A LOS INVITADOS Y SIGAN LAS INSTRUCCIONES DEL COORDINADOR DEL EVENTO.  
CONTACTO DE EMERGENCIA: __________.', '5-68');
INSERT INTO public.events VALUES (6, 5, 'EVENTO 6', '2026-05-20', '06:50:00', '10:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK AND WITHE', 'finished', 7, '2026-05-20 10:32:03.749133', '2026-05-20 10:38:28.591658', 'MIAMI', 'FL', '33161', true, NULL, '5-6');
INSERT INTO public.events VALUES (7, 5, 'EVENTO 7', '2026-05-20', '07:20:00', '11:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 11:00:23.109854', '2026-05-20 11:43:45.29581', 'MIAMI', 'FL', '33161', true, NULL, '5-7');
INSERT INTO public.events VALUES (8, 5, 'EVENTO 7', '2026-05-20', '09:00:00', '13:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 12:44:30.388934', '2026-05-20 12:49:01.975088', 'MIAMI', 'FL', '33161', true, NULL, '5-8');
INSERT INTO public.events VALUES (9, 5, 'EVENTO 8', '2026-05-20', '09:10:00', '10:15:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 12:50:38.689737', '2026-05-20 12:59:00.367918', 'MIAMI', 'FL', '33161', true, NULL, '5-9');
INSERT INTO public.events VALUES (10, 5, 'EVENTO 9', '2026-05-20', '09:11:00', '01:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 7, '2026-05-20 12:52:09.695167', '2026-05-20 12:59:48.275427', 'MIAMI', 'FL', '33161', true, NULL, '5-10');
INSERT INTO public.events VALUES (11, 5, 'EVENTO 10', '2026-05-20', '09:15:00', '17:00:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACL', 'finished', 7, '2026-05-20 13:01:31.8532', '2026-06-05 22:17:26.803767', 'MIAMI', 'FL', '33161', true, NULL, '5-11');
INSERT INTO public.events VALUES (12, 5, 'EVENTO 11', '2026-05-20', '13:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 7, '2026-05-20 13:13:00.766806', '2026-05-21 02:50:46.296974', 'MIAMI', 'FL', '33161', true, NULL, '5-12');
INSERT INTO public.events VALUES (13, 5, 'EVENTO 12 CON EMAIL', '2026-05-20', '19:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 15, '2026-05-20 16:01:32.689173', '2026-05-20 16:29:46.849266', 'MIAMI', 'FL', '33161', true, NULL, '5-13');
INSERT INTO public.events VALUES (14, 5, 'EVENTO 13 CON EMAIL', '2026-05-20', '21:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'AAA', 'filled', 15, '2026-05-20 17:48:46.91841', '2026-05-20 18:17:13.383469', 'MIAMI', 'FL', '33161', true, NULL, '5-14');
INSERT INTO public.events VALUES (15, 5, 'EVENTO 14 CON EMAIL', '2026-05-20', '21:30:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 15, '2026-05-20 18:18:46.503286', '2026-05-20 19:56:15.230125', 'MIAMI', 'FL', '33161', true, NULL, '5-15');
INSERT INTO public.events VALUES (16, 5, 'EVENTO 15 CON EMAIL', '2026-05-21', '07:00:00', '11:36:00', '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'finished', 15, '2026-05-20 20:29:30.265218', '2026-06-03 03:46:31.004855', 'MIAMI', 'FL', '33161', true, 'AAAAA', '5-16');
INSERT INTO public.events VALUES (17, 5, 'EVENTIO 16 CON EMAIL', '2026-05-21', '09:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK AND WITHE', 'finished', 15, '2026-05-21 00:56:49.235254', '2026-05-23 15:15:49.547488', 'MIAMI', 'FL', '33161', true, 'NOTA ADICIONAL', '5-17');
INSERT INTO public.events VALUES (18, 5, 'EVENTO 17 IA', '2026-05-21', '17:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'published', 7, '2026-05-21 20:26:05.901363', '2026-05-22 03:04:50.586082', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL EDIFICIO. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES TODO DE NEGRO. MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO; SEAN AMABLES, DISCRETOS Y ATENTOS CON LOS INVITADOS. SI NECESITAN ASISTENCIA O TIENEN ALGUNA PREGUNTA, NO DUDEN EN COMUNICARSE CON EL COORDINADOR DEL EVENTO. PARA SITUACIONES DE EMERGENCIA, POR FAVOR CONTACTEN A: __________. GRACIAS POR SU COLABORACIÓN Y DEDICACIÓN.', '5-18');
INSERT INTO public.events VALUES (19, 5, 'EVENTO 19 WHATSAPP', '2026-06-02', '19:00:00', NULL, '123 MAIN ST', 25.9131321, -80.3093750, 'FORMAL', 'filled', 15, '2026-05-22 01:14:13.253243', '2026-06-03 02:10:16.181285', 'MIAMI', 'FL', NULL, true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO PARA EL PERSONAL SERÁ EN LA ENTRADA PRINCIPAL DEL EVENTO. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES FORMAL, ASÍ QUE VÍSTANSE APROPIADAMENTE. 

SE ESPERA QUE TODOS LOS EMPLEADOS MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SEAN AMABLES CON LOS INVITADOS Y SIGAN LAS INSTRUCCIONES DEL COORDINADOR DEL EVENTO. 

EN CASO DE EMERGENCIA, POR FAVOR, CONTACTEN A: __________.', '5-19');
INSERT INTO public.events VALUES (20, 5, 'EVENTO 18 WHATSAPP', '2026-05-21', '22:30:00', NULL, '123 MAIN ST', 28.5438883, -81.3773943, 'PANTALON NEGRO CAMISA BLANCA Y CORBATA NEGRA', 'published', 15, '2026-05-22 01:31:03.053755', '2026-05-22 02:25:01.538971', 'MIAMI', 'FL', '33161', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL 123 MAIN ST, MIAMI, FL. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES PANTALÓN NEGRO, CAMISA BLANCA Y CORBATA NEGRA. MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO UNA ACTITUD AMIGABLE Y SERVICIAL HACIA LOS INVITADOS. EVITEN EL USO DE TELÉFONOS MÓVILES DURANTE EL EVENTO Y MANTENGAN EL ÁREA DE TRABAJO LIMPIA Y ORDENADA. EN CASO DE EMERGENCIA, POR FAVOR CONTACTEN A: __________.', '5-20');
INSERT INTO public.events VALUES (21, 5, 'EVENTO 20 WHATSAPP', '2026-05-22', '10:00:00', NULL, '1251 MAIN ST', 30.3384503, -81.6546500, 'PANTALON BLANCO Y CAMISA BLANCA', 'published', 15, '2026-05-22 03:08:30.444765', '2026-05-22 03:37:18.091696', 'MIAMI', 'FL', '33161', true, NULL, '5-21');
INSERT INTO public.events VALUES (22, 5, 'EVENTO 21WHATSAPP', '2026-05-22', '12:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA Y CHALECO', 'published', 15, '2026-05-22 03:56:04.145266', '2026-05-22 03:57:13.083267', 'MIAMI', 'FL', '33161', true, NULL, '5-22');
INSERT INTO public.events VALUES (23, 5, 'EVENTO 22 WHATSAPP', '2026-05-22', '15:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'published', 15, '2026-05-22 03:59:00.028441', '2026-05-22 04:04:07.105446', 'MIAMI', 'FL', '33161', true, NULL, '5-23');
INSERT INTO public.events VALUES (24, 5, 'EVENTO 23 WHATSAPP', '2026-05-22', '17:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA AZUL', 'published', 15, '2026-05-22 04:20:45.368699', '2026-05-22 04:21:05.851855', 'MIAMI', 'FL', '33161', true, NULL, '5-24');
INSERT INTO public.events VALUES (25, 5, 'EVENTO 24 WHATSAPP', '2026-05-22', '19:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'published', 15, '2026-05-22 04:24:38.818317', '2026-05-22 04:44:44.347716', 'MIAMI', 'FL', '33161', true, NULL, '5-25');
INSERT INTO public.events VALUES (26, 5, 'EVENTO 25 WHATSAPP 2', '2026-05-23', '14:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'filled', 15, '2026-05-22 04:24:56.008771', '2026-05-22 05:30:28.790279', 'MIAMI', 'FL', '33161', true, NULL, '5-26');
INSERT INTO public.events VALUES (27, 5, 'EVENTO 26 WHATSAPP', '2026-05-23', '17:00:00', NULL, '1251 MAIN ST', 30.3384529, -81.6546529, 'ROPA BLANCA', 'published', 15, '2026-05-22 04:25:58.517748', '2026-05-22 04:57:59.501196', 'MIAMI', 'FL', '33161', true, NULL, '5-27');
INSERT INTO public.events VALUES (28, 5, 'EVENTO 26 WHATSAPP', '2026-05-24', '11:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'published', 15, '2026-05-22 05:00:35.857148', '2026-05-22 06:00:28.002445', 'MIAMI', 'FL', '33161', true, NULL, '5-28');
INSERT INTO public.events VALUES (29, 5, 'EVENTO 27 WHATSAPP', '2026-05-23', '19:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA AZUL', 'filled', 15, '2026-05-22 05:00:56.759078', '2026-05-22 05:20:09.307727', 'MIAMI', 'FL', '33161', true, NULL, '5-29');
INSERT INTO public.events VALUES (30, 5, 'EVENTO 25 WHATSAPP', '2026-05-28', '19:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'published', 15, '2026-05-22 05:01:14.748277', '2026-05-22 05:59:02.008398', 'MIAMI', 'FL', '33161', true, NULL, '5-30');
INSERT INTO public.events VALUES (31, 5, 'EVENTO 28 WHATSAPP', '2026-05-25', '14:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'published', 15, '2026-05-22 05:07:53.300587', '2026-05-22 05:09:12.813627', 'MIAMI', 'FL', '33161', true, NULL, '5-31');
INSERT INTO public.events VALUES (32, 5, 'EVENTO 29 WHATSAPP', '2026-05-25', '17:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA AZUL', 'published', 15, '2026-05-22 05:08:15.23352', '2026-05-22 05:09:32.168699', 'MIAMI', 'FL', '33161', true, NULL, '5-32');
INSERT INTO public.events VALUES (33, 5, 'EVENTO 30 WHATSAPP', '2026-05-25', '19:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA NEGRA', 'filled_pending', 15, '2026-05-22 05:08:43.364627', '2026-05-22 21:30:10.773279', 'MIAMI', 'FL', '33161', true, NULL, '5-33');
INSERT INTO public.events VALUES (34, 5, 'EVENTO 31 WHATSAPP', '2026-05-26', '14:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'created', 15, '2026-05-22 06:00:36.718086', '2026-05-22 06:00:36.71809', 'MIAMI', 'FL', '33161', true, NULL, '5-34');
INSERT INTO public.events VALUES (35, 5, 'EVENTO 32 WHATSAPP', '2026-05-26', '19:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'created', 15, '2026-05-22 18:43:11.08842', '2026-05-22 18:43:11.088424', 'MIAMI', 'FL', '33161', true, NULL, '5-35');
INSERT INTO public.events VALUES (36, 5, 'EVENTO 33 WHATSAPP', '2026-05-23', '11:10:00', NULL, '1251 MAIN ST', 30.3384503, -81.6546500, 'ROPA BLANCA', 'filled', 15, '2026-05-23 14:10:46.929997', '2026-05-23 15:06:22.778268', 'MIAMI', 'FL', '33161', true, NULL, '5-36');
INSERT INTO public.events VALUES (41, 5, 'EVENTO 37 LLAVES', '2026-05-26', '17:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'created', 15, '2026-05-25 16:27:38.873145', '2026-05-25 16:27:38.873152', 'MIAMI', 'FL', '33161', true, NULL, '5-41');
INSERT INTO public.events VALUES (45, 5, 'EVENTO 41 WHATSAPP', '2026-05-25', '21:30:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'published', 7, '2026-05-25 20:44:53.819367', '2026-05-25 20:45:10.320633', 'MIAMI', 'FL', '33161', true, NULL, '5-45');
INSERT INTO public.events VALUES (46, 5, 'EVENTO 40 KAL', '2026-05-28', '00:00:00', NULL, '1251 MAIN ST', NULL, NULL, 'ROPA BLANCA', 'created', 15, '2026-05-29 03:48:47.766294', '2026-05-29 03:48:47.766299', 'MIAMI', 'FL', '33161', true, NULL, '5-46');
INSERT INTO public.events VALUES (47, 5, 'EVENTO TURNOS', '2026-06-01', '21:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'created', 7, '2026-06-02 00:48:47.586809', '2026-06-02 00:48:47.586814', 'MIAMI', 'FL', '33161', true, NULL, '5-47');
INSERT INTO public.events VALUES (48, 5, 'WEDDING BETH TORAH', '2026-06-01', '22:00:00', NULL, '20350 NE 26TH AVE', 25.9653986, -80.1507651, 'NEGRO', 'created', 7, '2026-06-02 01:23:45.858004', '2026-06-02 01:23:45.918428', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR, DONDE SE REUNIRÁN CON EL COORDINADOR DEL EVENTO. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES NEGRO, ASÍ QUE VISTAN DE MANERA FORMAL Y APROPIADA. MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SEAN CORTESES CON LOS INVITADOS Y TRABAJEN EN EQUIPO PARA ASEGURAR EL ÉXITO DEL EVENTO. ANTE CUALQUIER EMERGENCIA, CONTACTEN A LA PERSONA RESPONSABLE AL NÚMERO: __________.', '5-48');
INSERT INTO public.events VALUES (49, 5, '50TH BIRTHDAY', '2026-06-01', '23:30:00', NULL, '5000 ISLAND ESTATES DR', 25.9476204, -80.1303432, 'NEGRO', 'created', 7, '2026-06-02 02:09:03.861323', '2026-06-02 02:09:03.95684', 'MIAMI', 'FL', '33160', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES NEGRO, ASÍ QUE ASEGÚRENSE DE CUMPLIR CON ESTA INDICACIÓN. 

MANTENED UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INTERACTUANDO AMABLEMENTE CON LOS INVITADOS Y CUMPLIENDO CON SUS RESPONSABILIDADES DE MANERA EFICIENTE. 

EN CASO DE CUALQUIER EMERGENCIA, POR FAVOR, CONTACTEN A: __________.', '5-49');
INSERT INTO public.events VALUES (50, 5, 'TRURNO PRIMER REGISTRO', '2026-06-01', '23:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'created', 7, '2026-06-02 02:10:44.007672', '2026-06-02 02:10:44.007678', 'MIAMI', 'FL', '33161', true, NULL, '5-50');
INSERT INTO public.events VALUES (51, 5, 'STARBUCKS', '2026-06-02', '15:00:00', NULL, '20350 NE 26TH AVE NORTH', 25.9288342, -80.1474693, 'NEGRO', 'created', 7, '2026-06-02 02:12:23.74423', '2026-06-02 02:12:23.744235', 'MIAMI', 'FL', '33180', true, NULL, '5-51');
INSERT INTO public.events VALUES (52, 5, 'EVENTO ERROR DE HORA', '2026-06-01', '22:30:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'created', 7, '2026-06-02 02:24:40.671596', '2026-06-02 02:24:40.671604', 'MIAMI', 'FL', '33161', true, NULL, '5-52');
INSERT INTO public.events VALUES (53, 5, 'ERROR HORA', '2026-06-02', '21:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'created', 7, '2026-06-02 02:26:43.883168', '2026-06-02 02:26:43.883176', 'MIAMI', 'FL', '33161', true, NULL, '5-53');
INSERT INTO public.events VALUES (54, 5, 'WEDDING BETH TORAH 2', '2026-06-02', '16:00:00', NULL, '20350 NE 26TH AVE NORTH', 25.9288342, -80.1474693, 'BLANCO', 'published', 7, '2026-06-02 02:44:29.558868', '2026-06-02 03:01:07.123833', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO A LAS 16:00. EL PUNTO DE ENCUENTRO SERÁ LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES BLANCO, ASÍ QUE VISTAN ACORDE. 

SE ESPERA UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO; SEAN CORTESES Y ATENTOS CON LOS INVITADOS. MANTENGAN UN AMBIENTE POSITIVO Y COLABORATIVO.

EN CASO DE EMERGENCIAS, CONTACTEN A: __________.', '5-54');
INSERT INTO public.events VALUES (55, 5, 'EVENTO PUBLICACION', '2026-06-02', '13:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'published', 7, '2026-06-02 16:21:53.54477', '2026-06-02 16:42:49.080701', 'MIAMI', 'FL', '33161', true, NULL, '5-55');
INSERT INTO public.events VALUES (56, 5, 'PRUEBA TURNOS 2', '2026-06-02', '15:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'published', 7, '2026-06-02 17:28:56.693178', '2026-06-02 17:46:44.690067', 'MIAMI', 'FL', '33161', true, NULL, '5-56');
INSERT INTO public.events VALUES (57, 5, 'GALA DINNER', '2026-06-02', '23:00:00', NULL, '20350 NE 26TH AVE NORTH', 25.9288342, -80.1474693, 'BLANCO', 'published', 7, '2026-06-03 01:52:54.465291', '2026-06-03 02:06:09.601718', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL EDIFICIO. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES BLANCO, ASÍ QUE VISTAN DE ACUERDO A ESTO. MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, SIENDO CORTESES Y ATENTOS CON LOS INVITADOS. EN CASO DE CUALQUIER EMERGENCIA, CONTACTEN A: ________.', '5-57');
INSERT INTO public.events VALUES (58, 5, 'GALA 2 DINNER 2', '2026-06-03', '18:00:00', NULL, '3501 S UNIVERSITY DR', 26.0776920, -80.2515646, 'NEGRO', 'filled', 7, '2026-06-03 02:17:15.232531', '2026-06-03 03:45:33.463198', 'DAVIE', 'FL', '33328', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO PARA EL PERSONAL SERÁ EN LA ENTRADA PRINCIPAL DEL EDIFICIO. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES "NEGRO", ASÍ QUE ASEGÚRENSE DE CUMPLIR CON ELLO. 

MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER CORTESES CON LOS INVITADOS Y TRABAJAR EN EQUIPO. EVITEN DISTRACCIONES Y MANTENGAN UNA ACTITUD POSITIVA.

EN CASO DE EMERGENCIA, POR FAVOR, CONTACTEN A: __________.', '5-58');
INSERT INTO public.events VALUES (60, 5, 'EVENTO TURNOS MULTIPLES', '2026-06-05', '22:20:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'cancelled', 7, '2026-06-05 16:27:42.543066', '2026-06-06 02:11:46.806003', 'MIAMI', 'FL', '33161', true, NULL, '5-60');
INSERT INTO public.events VALUES (61, 5, 'EVENTO FUTURO', '2026-06-05', '21:30:00', NULL, '9580 ABBOTT AVE, SURFSIDE', 25.8865832, -80.1245879, 'FORMAL NEGRO', 'started', 7, '2026-06-05 21:56:08.222519', '2026-06-06 01:22:11.371144', 'MIAMI', 'FL', '33154', true, 'POR FAVOR, ASEGÚRESE DE SEGUIR LAS SIGUIENTES INSTRUCCIONES PARA EL EVENTO FUTURO:

1. **INSTRUCCIONES DE LLEGADA:** LLEGUE 30 MINUTOS ANTES DEL INICIO DEL EVENTO.
2. **PUNTO DE ENCUENTRO:** EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR.
3. **RECORDATORIO DE CÓDIGO DE VESTIMENTA:** EL CÓDIGO DE VESTIMENTA ES FORMAL NEGRO. ASEGÚRESE DE CUMPLIR CON ESTE REQUISITO.
4. **INSTRUCCIONES DE COMPORTAMIENTO PROFESIONAL:** MANTENGA UNA ACTITUD CORDIAL Y PROFESIONAL EN TODO MOMENTO. SIGA LAS INSTRUCCIONES DEL COORDINADOR DEL EVENTO Y TRATE A LOS INVITADOS CON RESPETO.
5. **CONTACTO DE EMERGENCIA:** __________

GRACIAS POR SU COLABORACIÓN.', '5-61');
INSERT INTO public.events VALUES (63, 5, 'WEEDING HOY', '2026-06-05', '23:30:00', NULL, '20350 NE 26TH AVE', 25.9653986, -80.1507651, 'NEGRO', 'published', 7, '2026-06-06 03:20:42.381693', '2026-06-06 03:25:05.290782', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, ASEGÚRATE DE LLEGAR 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO PARA EL PERSONAL SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDA QUE EL CÓDIGO DE VESTIMENTA ES NEGRO; ASEGÚRATE DE CUMPLIR CON ESTA INDICACIÓN. MANTÉN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO: SÉ PUNTUAL, AMABLE Y ATENTO CON LOS INVITADOS. SI SURGE ALGÚN INCONVENIENTE, POR FAVOR COMUNÍCATE CON EL CONTACTO DE EMERGENCIA: __________.', '5-63');
INSERT INTO public.events VALUES (44, 5, 'EVENTO 40 WHATSAPP INVITADO', '2026-05-25', '23:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 7, '2026-05-25 20:05:18.881105', '2026-06-17 02:51:57.933765', 'MIAMI', 'FL', '33161', true, NULL, '5-44');
INSERT INTO public.events VALUES (43, 5, 'EVENTO 39 LLAVE WHATSAPP', '2026-05-25', '19:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 7, '2026-05-25 18:14:28.593189', '2026-06-17 02:52:51.43171', 'MIAMI', 'FL', '33161', true, NULL, '5-43');
INSERT INTO public.events VALUES (42, 5, 'EVENTO 38 LLAVE WHATSAPP', '2026-05-25', '19:00:00', NULL, '1251 NE 108TH ST, APT 816', NULL, NULL, 'BLACK', 'filled', 7, '2026-05-25 17:57:37.170302', '2026-06-17 02:53:00.335772', 'MIAMI', 'FL', '33161', true, NULL, '5-42');
INSERT INTO public.events VALUES (80, 10, 'CENA CALL', '2026-06-19', '17:20:00', NULL, '20350 NE 26TH AVE', 25.9288342, -80.1474693, 'BLANCO', 'filled', 100, '2026-06-19 21:03:36.093948', '2026-06-19 22:34:47.188356', 'NORTH MIAMI', 'FL', '33180', true, NULL, '10-110');
INSERT INTO public.events VALUES (64, 5, 'BODA HOY 5JUN', '2026-06-05', '23:45:00', NULL, '20350 NE 26TH AVE', 25.9653986, -80.1507651, 'NEGRO', 'filled_pending', 7, '2026-06-06 03:42:08.069046', '2026-06-06 03:50:42.91561', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DE LA DIRECCIÓN INDICADA: 20350 NE 26TH AVE, MIAMI, FL. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES NEGRO, ASÍ QUE VÍSTANSE ACORDE. 

SE ESPERA QUE MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER AMABLES, ATENTOS Y MANTENER UNA BUENA COMUNICACIÓN CON EL EQUIPO Y LOS INVITADOS. 

EN CASO DE EMERGENCIA, POR FAVOR CONTACTEN A: __________.', '5-64');
INSERT INTO public.events VALUES (201, 10, 'Cumpleaños Johnson #2', '2026-01-03', '11:00:00', '15:00:00', '456 Ocean Dr', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-08 23:55:52.994713', 'Miami', 'FL', '33139', true, NULL, '10-2');
INSERT INTO public.events VALUES (202, 10, 'Gala Corporativa #3', '2026-01-04', '12:00:00', '16:00:00', '789 Brickell Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:24:43.109936', 'Miami', 'FL', '33139', true, NULL, '10-3');
INSERT INTO public.events VALUES (203, 10, 'Cena Privada #4', '2026-01-06', '14:00:00', '18:00:00', '321 NW 2nd Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:31:54.438503', 'Miami', 'FL', '33139', true, NULL, '10-4');
INSERT INTO public.events VALUES (205, 10, 'Fiesta Graduación #6', '2026-01-09', '18:00:00', '22:00:00', '900 Washington Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:33:57.331165', 'Miami', 'FL', '33139', true, NULL, '10-6');
INSERT INTO public.events VALUES (206, 10, 'Evento Caridad #7', '2026-01-10', '19:00:00', '23:00:00', '1200 Alton Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-09 03:33:57.331168', 'Miami', 'FL', '33139', true, NULL, '10-7');
INSERT INTO public.events VALUES (207, 10, 'Lanzamiento Producto #8', '2026-01-12', '20:00:00', '00:00:00', '1500 Bay Rd', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214246', 'Miami', 'FL', '33139', true, NULL, '10-8');
INSERT INTO public.events VALUES (208, 10, 'Aniversario Empresa #9', '2026-01-14', '10:00:00', '14:00:00', '200 SE 1st St', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214259', 'Miami', 'FL', '33139', true, NULL, '10-9');
INSERT INTO public.events VALUES (246, 10, 'Memorial Day BBQ #47', '2026-03-14', '19:00:00', '23:00:00', '1200 Alton Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21427', 'Miami', 'FL', '33139', true, NULL, '10-47');
INSERT INTO public.events VALUES (247, 10, 'Pool Party VIP #48', '2026-03-16', '20:00:00', '00:00:00', '1500 Bay Rd', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21427', 'Miami', 'FL', '33139', true, NULL, '10-48');
INSERT INTO public.events VALUES (248, 10, 'Boda Smith #49', '2026-03-17', '10:00:00', '14:00:00', '200 SE 1st St', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21427', 'Miami', 'FL', '33139', true, NULL, '10-49');
INSERT INTO public.events VALUES (249, 10, 'Cumpleaños Johnson #50', '2026-03-19', '11:00:00', '15:00:00', '800 NE 1st Ave', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21427', 'Miami', 'FL', '33139', true, NULL, '10-50');
INSERT INTO public.events VALUES (250, 10, 'Gala Corporativa #51', '2026-03-21', '12:00:00', '16:00:00', '123 Collins Ave', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214271', 'Miami', 'FL', '33139', true, NULL, '10-51');
INSERT INTO public.events VALUES (70, 5, 'WEDDING - BETH TORAH 09.JUN', '2026-06-09', '20:30:00', '01:30:00', '20350 NE 26TH AVE', 25.9653986, -80.1507651, 'BLANCO', 'filled', 7, '2026-06-10 01:14:41.659177', '2026-06-10 01:23:42.362284', 'MIAMI', 'FL', '33180', true, 'POR FAVOR, LLEGUEN 30 MINUTOS ANTES DEL INICIO DEL EVENTO PARA PREPARARSE ADECUADAMENTE. EL PUNTO DE ENCUENTRO SERÁ EN LA ENTRADA PRINCIPAL DEL LUGAR. RECUERDEN QUE EL CÓDIGO DE VESTIMENTA ES BLANCO, ASÍ QUE VISTAN DE ACUERDO A ELLO. 

SE ESPERA QUE MANTENGAN UN COMPORTAMIENTO PROFESIONAL EN TODO MOMENTO, INCLUYENDO SER CORTESES Y ATENTOS CON LOS INVITADOS. EVITEN EL USO DE TELÉFONOS MÓVILES DURANTE EL EVENTO Y MANTENGAN UN AMBIENTE DE TRABAJO POSITIVO. 

EN CASO DE EMERGENCIA, CONTACTEN A: __________.', '5-69');
INSERT INTO public.events VALUES (294, 10, 'Memorial Day BBQ #95', '2026-05-29', '19:00:00', '23:00:00', '555 Lincoln Rd', NULL, NULL, 'ALL BLACK', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214279', 'Miami', 'FL', '33139', true, NULL, '10-95');
INSERT INTO public.events VALUES (295, 10, 'Pool Party VIP #96', '2026-05-30', '20:00:00', '00:00:00', '900 Washington Ave', NULL, NULL, 'WHITE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214279', 'Miami', 'FL', '33139', true, NULL, '10-96');
INSERT INTO public.events VALUES (296, 10, 'Boda Smith #97', '2026-06-01', '10:00:00', '14:00:00', '1200 Alton Rd', NULL, NULL, 'BLACK TIE', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214279', 'Miami', 'FL', '33139', true, NULL, '10-97');
INSERT INTO public.events VALUES (297, 10, 'Cumpleaños Johnson #98', '2026-06-02', '11:00:00', '15:00:00', '1500 Bay Rd', NULL, NULL, 'FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214279', 'Miami', 'FL', '33139', true, NULL, '10-98');
INSERT INTO public.events VALUES (298, 10, 'Gala Corporativa #99', '2026-06-04', '12:00:00', '16:00:00', '200 SE 1st St', NULL, NULL, 'SEMI-FORMAL', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.214279', 'Miami', 'FL', '33139', true, NULL, '10-99');
INSERT INTO public.events VALUES (299, 10, 'Cena Privada #100', '2026-06-05', '14:00:00', '18:00:00', '800 NE 1st Ave', NULL, NULL, 'CASUAL ELEGANT', 'settled', 100, '2026-06-08 17:17:50.782361', '2026-06-16 22:14:09.21428', 'Miami', 'FL', '33139', true, NULL, '10-100');


--
-- Data for Name: event_job_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_job_roles VALUES (3, 2, 11, 1, 1, '2026-05-20 00:49:58.336233', '2026-05-20 00:53:19.043374', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (2, 2, 10, 1, 1, '2026-05-20 00:49:58.336219', '2026-05-20 00:53:20.195673', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (1, 1, 10, 1, 1, '2026-05-20 00:47:46.023537', '2026-05-20 00:53:35.174409', 25.00, NULL);
INSERT INTO public.event_job_roles VALUES (70, 48, 11, 1, 0, '2026-06-02 01:23:45.868641', '2026-06-02 01:23:45.868641', 20.00, '22:30:00');
INSERT INTO public.event_job_roles VALUES (4, 3, 10, 1, 1, '2026-05-20 01:09:38.769008', '2026-05-20 01:17:43.719267', 23.00, NULL);
INSERT INTO public.event_job_roles VALUES (5, 4, 10, 1, 1, '2026-05-20 03:09:13.020545', '2026-05-20 03:12:02.376887', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (6, 5, 10, 1, 1, '2026-05-20 04:01:02.868566', '2026-05-20 04:04:35.450227', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (71, 48, 11, 1, 0, '2026-06-02 01:23:45.868641', '2026-06-02 01:23:45.868641', 18.00, '23:00:00');
INSERT INTO public.event_job_roles VALUES (7, 6, 10, 1, 1, '2026-05-20 10:32:03.771558', '2026-05-20 10:33:14.442346', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (8, 7, 10, 1, 1, '2026-05-20 11:00:23.125255', '2026-05-20 11:01:11.923141', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (9, 8, 10, 1, 1, '2026-05-20 12:44:30.414627', '2026-05-20 12:45:20.678269', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (10, 9, 10, 1, 1, '2026-05-20 12:50:38.701794', '2026-05-20 12:55:49.232403', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (11, 10, 11, 1, 1, '2026-05-20 12:52:09.705719', '2026-05-20 12:55:56.439367', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (12, 11, 10, 1, 1, '2026-05-20 13:01:31.857762', '2026-05-20 13:02:19.60988', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (15, 13, 10, 1, 1, '2026-05-20 16:01:32.719271', '2026-05-20 16:29:46.715367', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (16, 14, 10, 1, 1, '2026-05-20 17:48:46.944657', '2026-05-20 18:17:12.933899', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (18, 15, 11, 1, 1, '2026-05-20 18:18:46.518955', '2026-05-20 19:53:21.468501', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (14, 12, 11, 1, 1, '2026-05-20 13:13:00.782644', '2026-05-20 19:54:23.773692', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (17, 15, 10, 1, 1, '2026-05-20 18:18:46.518932', '2026-05-20 19:56:14.863622', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (13, 12, 10, 1, 1, '2026-05-20 13:13:00.78264', '2026-05-21 02:50:45.181253', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (65, 47, 10, 2, 0, '2026-06-02 00:48:47.61795', '2026-06-02 02:03:39.981939', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (67, 47, 11, 2, 0, '2026-06-02 00:48:47.617958', '2026-06-02 02:03:39.980927', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (20, 17, 10, 1, 1, '2026-05-21 00:56:49.283591', '2026-05-21 10:53:07.103552', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (19, 16, 10, 1, 1, '2026-05-20 20:29:30.290203', '2026-05-21 10:53:18.708073', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (21, 17, 12, 1, 0, '2026-05-21 11:03:53.190399', '2026-05-21 11:03:53.190404', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (22, 18, 10, 1, 0, '2026-05-21 20:26:05.937466', '2026-05-21 20:26:05.93747', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (23, 18, 11, 1, 0, '2026-05-21 20:26:05.937473', '2026-05-21 20:26:05.937474', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (27, 20, 11, 1, 0, '2026-05-22 01:31:03.082187', '2026-05-22 02:20:04.933787', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (26, 20, 10, 1, 0, '2026-05-22 01:31:03.082182', '2026-05-22 02:20:04.937974', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (69, 48, 10, 1, 0, '2026-06-02 01:23:45.868637', '2026-06-02 02:05:17.258205', 25.00, '22:00:00');
INSERT INTO public.event_job_roles VALUES (72, 49, 10, 1, 0, '2026-06-02 02:09:03.876395', '2026-06-02 02:09:03.876401', 20.00, NULL);
INSERT INTO public.event_job_roles VALUES (28, 21, 10, 1, 0, '2026-05-22 03:08:30.46816', '2026-05-22 03:08:30.468163', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (29, 21, 11, 1, 0, '2026-05-22 03:08:30.468163', '2026-05-22 03:08:30.468164', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (30, 22, 10, 1, 0, '2026-05-22 03:56:04.161127', '2026-05-22 03:56:04.161129', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (31, 22, 11, 1, 0, '2026-05-22 03:56:04.161131', '2026-05-22 03:56:04.161131', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (33, 23, 11, 1, 0, '2026-05-22 03:59:00.036629', '2026-05-22 03:59:00.036629', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (35, 24, 11, 1, 0, '2026-05-22 04:20:45.390126', '2026-05-22 04:20:45.390126', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (36, 25, 10, 1, 0, '2026-05-22 04:24:38.827323', '2026-05-22 04:24:38.827326', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (37, 25, 11, 1, 0, '2026-05-22 04:24:38.827327', '2026-05-22 04:24:38.827327', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (40, 27, 10, 1, 0, '2026-05-22 04:25:58.529623', '2026-05-22 04:25:58.529627', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (41, 27, 11, 1, 0, '2026-05-22 04:25:58.529627', '2026-05-22 04:25:58.529628', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (38, 26, 10, 1, 1, '2026-05-22 04:24:56.013011', '2026-05-22 04:56:10.829663', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (42, 28, 10, 1, 0, '2026-05-22 05:00:35.865681', '2026-05-22 05:00:35.865683', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (43, 28, 11, 1, 0, '2026-05-22 05:00:35.865684', '2026-05-22 05:00:35.865684', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (47, 30, 11, 1, 0, '2026-05-22 05:01:14.752208', '2026-05-22 05:01:14.752208', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (44, 29, 10, 1, 1, '2026-05-22 05:00:56.762414', '2026-05-22 05:03:22.949', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (50, 33, 10, 1, 0, '2026-05-22 05:08:43.372183', '2026-05-22 05:08:43.372186', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (49, 32, 10, 1, 1, '2026-05-22 05:08:15.241038', '2026-05-22 05:10:05.117453', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (48, 31, 10, 1, 1, '2026-05-22 05:07:53.307688', '2026-05-22 05:10:38.404716', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (45, 29, 11, 1, 1, '2026-05-22 05:00:56.762417', '2026-05-22 05:20:08.914457', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (39, 26, 11, 1, 1, '2026-05-22 04:24:56.013013', '2026-05-22 05:30:28.483558', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (46, 30, 10, 1, 1, '2026-05-22 05:01:14.752205', '2026-05-22 05:59:22.462541', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (51, 34, 10, 1, 0, '2026-05-22 06:00:36.73659', '2026-05-22 06:00:36.736592', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (52, 35, 10, 1, 0, '2026-05-22 18:43:11.107859', '2026-05-22 18:43:11.107862', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (53, 36, 10, 1, 1, '2026-05-23 14:10:46.946086', '2026-05-23 14:46:32.004089', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (24, 19, 10, 1, 1, '2026-05-22 01:14:13.278649', '2026-05-23 14:59:15.876136', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (25, 19, 11, 1, 1, '2026-05-22 01:14:13.278653', '2026-05-23 14:59:20.081663', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (54, 37, 10, 1, 1, '2026-05-24 03:08:16.49313', '2026-05-24 03:09:19.890199', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (58, 41, 10, 1, 0, '2026-05-25 16:27:38.880754', '2026-05-25 16:27:38.880757', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (62, 45, 10, 1, 1, '2026-05-25 20:44:53.830744', '2026-05-25 21:36:58.652707', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (63, 46, 10, 1, 0, '2026-05-29 03:48:47.792325', '2026-05-29 03:48:47.792327', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (64, 46, 11, 1, 0, '2026-06-01 21:49:12.533634', '2026-06-01 21:49:12.533636', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (66, 47, 10, 1, 0, '2026-06-02 00:48:47.617956', '2026-06-02 00:48:47.617957', 25.00, '21:30:00');
INSERT INTO public.event_job_roles VALUES (68, 47, 11, 1, 0, '2026-06-02 00:48:47.617959', '2026-06-02 00:48:47.617959', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (73, 49, 11, 1, 0, '2026-06-02 02:09:03.876402', '2026-06-02 02:09:03.876402', 25.00, '23:45:00');
INSERT INTO public.event_job_roles VALUES (74, 50, 10, 1, 0, '2026-06-02 02:10:44.020068', '2026-06-02 02:10:44.020072', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (75, 50, 10, 1, 0, '2026-06-02 02:10:44.020074', '2026-06-02 02:10:44.020074', NULL, '23:30:00');
INSERT INTO public.event_job_roles VALUES (76, 50, 11, 1, 0, '2026-06-02 02:10:44.020075', '2026-06-02 02:10:44.020075', NULL, '23:00:00');
INSERT INTO public.event_job_roles VALUES (77, 51, 10, 1, 0, '2026-06-02 02:12:23.753556', '2026-06-02 02:12:23.753558', 20.00, NULL);
INSERT INTO public.event_job_roles VALUES (78, 51, 11, 1, 0, '2026-06-02 02:12:23.753559', '2026-06-02 02:12:23.753559', 20.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (79, 52, 10, 1, 0, '2026-06-02 02:24:40.681891', '2026-06-02 02:24:40.681895', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (80, 52, 10, 1, 0, '2026-06-02 02:24:40.681895', '2026-06-02 02:24:40.681895', 25.00, '23:00:00');
INSERT INTO public.event_job_roles VALUES (81, 52, 10, 1, 0, '2026-06-02 02:24:40.681896', '2026-06-02 02:24:40.681896', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (83, 53, 10, 1, 0, '2026-06-02 02:26:43.903444', '2026-06-02 02:26:43.903445', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (84, 53, 11, 1, 0, '2026-06-02 02:26:43.903446', '2026-06-02 02:40:46.831385', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (82, 53, 10, 1, 0, '2026-06-02 02:26:43.903439', '2026-06-02 02:40:46.83261', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (85, 54, 11, 1, 0, '2026-06-02 02:44:29.571755', '2026-06-02 02:44:29.571759', 20.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (86, 54, 10, 1, 0, '2026-06-02 02:44:29.57176', '2026-06-02 02:44:29.571761', 25.00, '18:00:00');
INSERT INTO public.event_job_roles VALUES (87, 55, 10, 1, 0, '2026-06-02 16:21:53.560458', '2026-06-02 16:21:53.560461', 25.00, '13:00:00');
INSERT INTO public.event_job_roles VALUES (88, 55, 11, 1, 0, '2026-06-02 16:21:53.560462', '2026-06-02 16:21:53.560463', NULL, '12:30:00');
INSERT INTO public.event_job_roles VALUES (89, 55, 11, 2, 0, '2026-06-02 16:21:53.560463', '2026-06-02 16:21:53.560464', NULL, '13:00:00');
INSERT INTO public.event_job_roles VALUES (90, 55, 12, 1, 0, '2026-06-02 16:21:53.560464', '2026-06-02 16:21:53.560464', NULL, '12:30:00');
INSERT INTO public.event_job_roles VALUES (92, 56, 10, 2, 0, '2026-06-02 17:28:56.713789', '2026-06-02 18:53:26.580166', NULL, '15:00:00');
INSERT INTO public.event_job_roles VALUES (91, 55, 13, 2, 0, '2026-06-02 17:06:17.498926', '2026-06-02 17:20:47.334679', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (95, 56, 11, 2, 0, '2026-06-02 17:28:56.713794', '2026-06-02 18:53:26.582142', 17.00, '15:00:00');
INSERT INTO public.event_job_roles VALUES (97, 57, 10, 1, 0, '2026-06-03 01:52:54.488815', '2026-06-03 01:52:54.488819', 20.00, '23:30:00');
INSERT INTO public.event_job_roles VALUES (98, 57, 11, 1, 0, '2026-06-03 01:52:54.488822', '2026-06-03 01:52:54.488823', 19.00, '23:15:00');
INSERT INTO public.event_job_roles VALUES (93, 56, 10, 1, 0, '2026-06-02 17:28:56.713793', '2026-06-02 18:34:42.484796', 25.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (94, 56, 11, 1, 0, '2026-06-02 17:28:56.713794', '2026-06-02 18:34:42.505302', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (103, 57, 10, 1, 0, '2026-06-03 03:01:10.935402', '2026-06-03 03:01:46.532604', 25.00, '23:45:00');
INSERT INTO public.event_job_roles VALUES (105, 59, 10, 2, 0, '2026-06-03 03:45:27.588647', '2026-06-03 03:45:27.588647', NULL, '22:30:00');
INSERT INTO public.event_job_roles VALUES (106, 59, 11, 1, 0, '2026-06-03 03:45:27.588648', '2026-06-03 03:45:27.588648', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (99, 58, 10, 1, 1, '2026-06-03 02:17:15.239851', '2026-06-03 03:45:33.019606', 22.00, '18:30:00');
INSERT INTO public.event_job_roles VALUES (100, 58, 10, 1, 1, '2026-06-03 02:17:15.239855', '2026-06-03 03:45:33.458387', 25.00, '19:00:00');
INSERT INTO public.event_job_roles VALUES (107, 16, 11, 1, 0, '2026-06-03 04:14:18.809223', '2026-06-03 04:14:18.809225', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (104, 59, 10, 1, 1, '2026-06-03 03:45:27.588642', '2026-06-17 02:48:19.904015', 22.00, '21:30:00');
INSERT INTO public.event_job_roles VALUES (108, 60, 10, 2, 2, '2026-06-05 16:27:42.571331', '2026-06-06 02:08:45.867191', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (61, 44, 10, 1, 1, '2026-05-25 20:05:18.898295', '2026-06-17 02:51:57.935323', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (60, 43, 10, 1, 1, '2026-05-25 18:14:28.601452', '2026-06-17 02:52:51.432363', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (59, 42, 10, 1, 1, '2026-05-25 17:57:37.187546', '2026-06-17 02:53:00.336288', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (57, 40, 10, 1, 1, '2026-05-25 16:25:32.906324', '2026-06-17 02:53:12.468965', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (56, 39, 10, 1, 1, '2026-05-25 16:22:59.667143', '2026-06-17 02:53:19.591198', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (55, 38, 10, 1, 1, '2026-05-25 16:19:08.815362', '2026-06-17 02:53:26.862469', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (34, 24, 10, 1, 1, '2026-05-22 04:20:45.39012', '2026-06-17 02:53:34.248565', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (32, 23, 10, 1, 1, '2026-05-22 03:59:00.036625', '2026-06-17 02:53:40.79429', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (110, 60, 11, 1, 1, '2026-06-05 16:27:42.571335', '2026-06-05 23:54:33.839701', 19.00, '14:00:00');
INSERT INTO public.event_job_roles VALUES (113, 61, 11, 1, 1, '2026-06-05 21:56:08.25153', '2026-06-06 01:11:47.822482', 20.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (112, 61, 10, 1, 1, '2026-06-05 21:56:08.251525', '2026-06-06 01:13:16.756786', 25.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (115, 62, 11, 1, 1, '2026-06-06 02:14:44.106595', '2026-06-06 02:50:56.514486', NULL, '22:30:00');
INSERT INTO public.event_job_roles VALUES (117, 63, 11, 1, 0, '2026-06-06 03:20:42.393514', '2026-06-06 03:20:42.393514', NULL, '23:30:00');
INSERT INTO public.event_job_roles VALUES (116, 63, 10, 1, 1, '2026-06-06 03:20:42.393511', '2026-06-06 03:22:24.643201', NULL, '23:30:00');
INSERT INTO public.event_job_roles VALUES (114, 62, 10, 1, 1, '2026-06-06 02:14:44.10659', '2026-06-06 03:29:22.679515', NULL, '22:30:00');
INSERT INTO public.event_job_roles VALUES (118, 64, 10, 1, 0, '2026-06-06 03:42:08.088116', '2026-06-06 03:42:08.088118', NULL, '23:45:00');
INSERT INTO public.event_job_roles VALUES (119, 64, 11, 1, 1, '2026-06-06 03:42:08.088121', '2026-06-06 03:48:42.157404', NULL, '23:45:00');
INSERT INTO public.event_job_roles VALUES (121, 65, 11, 1, 1, '2026-06-06 14:08:50.628085', '2026-06-06 14:09:21.804985', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (120, 65, 10, 1, 1, '2026-06-06 14:08:50.628081', '2026-06-06 14:23:11.740897', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (122, 200, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (123, 200, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (124, 200, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (125, 200, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (126, 201, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (127, 201, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (128, 201, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (129, 201, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (130, 202, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (131, 202, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (132, 202, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (133, 203, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (134, 203, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '14:00:00');
INSERT INTO public.event_job_roles VALUES (135, 204, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (136, 204, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (137, 205, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '18:00:00');
INSERT INTO public.event_job_roles VALUES (138, 205, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (139, 205, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (140, 205, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (141, 206, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (142, 206, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (143, 206, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (144, 206, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (145, 207, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (146, 207, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (147, 207, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (148, 208, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (149, 208, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (150, 209, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (151, 209, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (152, 210, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '12:00:00');
INSERT INTO public.event_job_roles VALUES (153, 210, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '12:00:00');
INSERT INTO public.event_job_roles VALUES (154, 210, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (155, 210, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (156, 211, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (157, 211, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (158, 211, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (159, 211, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (160, 212, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (161, 212, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (162, 212, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (163, 213, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (164, 213, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (165, 214, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (166, 214, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (167, 215, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '20:00:00');
INSERT INTO public.event_job_roles VALUES (168, 215, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (169, 215, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (170, 215, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (171, 216, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (172, 216, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (173, 216, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (174, 216, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (175, 217, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (176, 217, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '11:00:00');
INSERT INTO public.event_job_roles VALUES (177, 217, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (178, 218, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (179, 218, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (180, 219, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (181, 219, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (182, 220, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (183, 220, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (184, 220, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (185, 220, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (186, 221, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (187, 221, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (188, 221, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (189, 221, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (190, 222, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (191, 222, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (192, 222, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (193, 223, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (194, 223, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (195, 224, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (196, 224, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (197, 225, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '11:00:00');
INSERT INTO public.event_job_roles VALUES (198, 225, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (199, 225, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (200, 225, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (201, 226, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (202, 226, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (203, 226, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (204, 226, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (205, 227, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (206, 227, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (207, 227, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (208, 228, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (209, 228, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (210, 229, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (211, 229, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (212, 230, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '19:00:00');
INSERT INTO public.event_job_roles VALUES (213, 230, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (214, 230, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (215, 230, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (216, 231, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (217, 231, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '20:00:00');
INSERT INTO public.event_job_roles VALUES (218, 231, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (219, 231, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (220, 232, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (221, 232, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (222, 232, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (223, 233, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (224, 233, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (225, 234, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (226, 234, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (227, 235, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '14:00:00');
INSERT INTO public.event_job_roles VALUES (228, 235, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (229, 235, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (230, 235, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (231, 236, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (232, 236, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (233, 236, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (234, 236, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (235, 237, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (236, 237, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (237, 237, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (238, 238, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (239, 238, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '19:00:00');
INSERT INTO public.event_job_roles VALUES (240, 239, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (241, 239, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (242, 240, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (243, 240, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (244, 240, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (245, 240, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (246, 241, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (247, 241, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (248, 241, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (249, 241, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (250, 242, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (251, 242, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (252, 242, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (253, 243, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (254, 243, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (255, 244, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (256, 244, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (257, 245, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '18:00:00');
INSERT INTO public.event_job_roles VALUES (258, 245, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '18:00:00');
INSERT INTO public.event_job_roles VALUES (259, 245, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (260, 245, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (261, 246, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (262, 246, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (263, 246, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (264, 246, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (265, 247, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (266, 247, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (267, 247, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (268, 248, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (269, 248, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (270, 249, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (271, 249, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (272, 250, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '12:00:00');
INSERT INTO public.event_job_roles VALUES (273, 250, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (274, 250, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (275, 250, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (276, 251, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (277, 251, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (278, 251, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (279, 251, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (280, 252, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (281, 252, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (282, 252, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (283, 253, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (284, 253, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (285, 254, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (286, 254, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (287, 255, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '20:00:00');
INSERT INTO public.event_job_roles VALUES (288, 255, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (289, 255, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (290, 255, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (291, 256, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (292, 256, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (293, 256, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (294, 256, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (295, 257, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (296, 257, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (297, 257, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (298, 258, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (299, 258, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (300, 259, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (301, 259, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '14:00:00');
INSERT INTO public.event_job_roles VALUES (302, 260, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '16:00:00');
INSERT INTO public.event_job_roles VALUES (303, 260, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (304, 260, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (305, 260, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (306, 261, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (307, 261, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (308, 261, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (309, 261, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (310, 262, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (311, 262, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (312, 262, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (313, 263, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (314, 263, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (315, 264, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (316, 264, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (317, 265, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '11:00:00');
INSERT INTO public.event_job_roles VALUES (318, 265, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (319, 265, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (320, 265, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (321, 266, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (322, 266, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '12:00:00');
INSERT INTO public.event_job_roles VALUES (323, 266, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (324, 266, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (325, 267, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (326, 267, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (327, 267, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (328, 268, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (329, 268, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (330, 269, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (331, 269, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (332, 270, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '19:00:00');
INSERT INTO public.event_job_roles VALUES (333, 270, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (334, 270, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (335, 270, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (336, 271, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (337, 271, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (338, 271, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (339, 271, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (340, 272, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (341, 272, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (342, 272, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (343, 273, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (344, 273, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '11:00:00');
INSERT INTO public.event_job_roles VALUES (345, 274, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (346, 274, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (347, 275, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '14:00:00');
INSERT INTO public.event_job_roles VALUES (348, 275, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (349, 275, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (350, 275, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (351, 276, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (352, 276, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (353, 276, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (354, 276, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (355, 277, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (356, 277, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (357, 277, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (358, 278, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (359, 278, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (360, 279, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (361, 279, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (362, 280, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (363, 280, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '10:00:00');
INSERT INTO public.event_job_roles VALUES (364, 280, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (365, 280, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (366, 281, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (367, 281, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (368, 281, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (369, 281, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (370, 282, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (371, 282, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (372, 282, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (373, 283, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (374, 283, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (375, 284, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (376, 284, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (377, 285, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '18:00:00');
INSERT INTO public.event_job_roles VALUES (378, 285, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (379, 285, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (380, 285, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (381, 286, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (382, 286, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (383, 286, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (384, 286, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (385, 287, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (386, 287, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '20:00:00');
INSERT INTO public.event_job_roles VALUES (387, 287, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (388, 288, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (389, 288, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (390, 289, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (391, 289, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (392, 290, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '12:00:00');
INSERT INTO public.event_job_roles VALUES (393, 290, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (394, 290, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (395, 290, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (396, 291, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (397, 291, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (398, 291, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (399, 291, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (400, 292, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (401, 292, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (402, 292, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '16:00:00');
INSERT INTO public.event_job_roles VALUES (403, 293, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (404, 293, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '18:00:00');
INSERT INTO public.event_job_roles VALUES (405, 294, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '19:00:00');
INSERT INTO public.event_job_roles VALUES (406, 294, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 22.00, '19:00:00');
INSERT INTO public.event_job_roles VALUES (407, 295, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', 28.00, '20:00:00');
INSERT INTO public.event_job_roles VALUES (408, 295, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (409, 295, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (410, 295, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (411, 296, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (412, 296, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (413, 296, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (414, 296, 53, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '10:00:00');
INSERT INTO public.event_job_roles VALUES (415, 297, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (416, 297, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (417, 297, 52, 1, 1, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '11:00:00');
INSERT INTO public.event_job_roles VALUES (418, 298, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (419, 298, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (420, 299, 50, 2, 2, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (421, 299, 51, 3, 3, '2026-06-08 17:17:50.82782', '2026-06-08 17:17:50.82782', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (426, 67, 10, 1, 1, '2026-06-09 02:20:35.746616', '2026-06-09 02:21:15.529379', NULL, '20:45:00');
INSERT INTO public.event_job_roles VALUES (428, 67, 11, 1, 1, '2026-06-09 02:42:48.219377', '2026-06-09 02:43:46.50041', NULL, '21:45:00');
INSERT INTO public.event_job_roles VALUES (432, 68, 11, 1, 0, '2026-06-09 04:03:27.296307', '2026-06-09 04:03:27.296307', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (448, 75, 50, 2, 2, '2026-06-19 18:53:01.55926', '2026-06-19 18:59:26.167555', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (455, 80, 51, 1, 1, '2026-06-19 21:06:20.040567', '2026-06-19 21:44:59.502633', NULL, '17:00:00');
INSERT INTO public.event_job_roles VALUES (429, 68, 10, 1, 1, '2026-06-09 04:03:27.296301', '2026-06-09 21:16:16.784033', NULL, '12:00:00');
INSERT INTO public.event_job_roles VALUES (449, 76, 50, 1, 1, '2026-06-19 19:13:32.552009', '2026-06-19 19:30:33.637071', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (435, 69, 11, 1, 1, '2026-06-10 00:42:49.260043', '2026-06-10 00:46:23.761832', NULL, '20:00:00');
INSERT INTO public.event_job_roles VALUES (436, 69, 11, 1, 1, '2026-06-10 00:42:49.260043', '2026-06-10 00:46:24.50644', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (433, 69, 10, 1, 1, '2026-06-10 00:42:49.260041', '2026-06-10 00:48:06.300997', NULL, '21:00:00');
INSERT INTO public.event_job_roles VALUES (434, 69, 10, 1, 1, '2026-06-10 00:42:49.260042', '2026-06-10 00:48:06.925425', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (456, 80, 50, 2, 2, '2026-06-19 21:07:05.516248', '2026-06-19 22:34:47.179335', NULL, '17:30:00');
INSERT INTO public.event_job_roles VALUES (437, 69, 11, 1, 1, '2026-06-10 00:59:30.35124', '2026-06-10 01:00:43.882688', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (450, 76, 51, 1, 1, '2026-06-19 19:13:32.552012', '2026-06-19 19:40:52.84586', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (438, 69, 10, 1, 1, '2026-06-10 01:01:09.549468', '2026-06-10 01:02:42.779551', NULL, '22:00:00');
INSERT INTO public.event_job_roles VALUES (422, 66, 50, 1, 1, '2026-06-09 02:05:56.200969', '2026-06-10 01:08:47.229819', NULL, '22:00:00');
INSERT INTO public.event_job_roles VALUES (423, 66, 50, 1, 1, '2026-06-09 02:05:56.200971', '2026-06-10 01:08:48.136754', NULL, '22:30:00');
INSERT INTO public.event_job_roles VALUES (424, 66, 51, 1, 1, '2026-06-09 02:05:56.200972', '2026-06-10 01:08:48.583126', NULL, '21:30:00');
INSERT INTO public.event_job_roles VALUES (425, 66, 51, 1, 1, '2026-06-09 02:05:56.200972', '2026-06-10 01:08:48.989949', NULL, '22:00:00');
INSERT INTO public.event_job_roles VALUES (440, 70, 11, 1, 1, '2026-06-10 01:14:41.668054', '2026-06-10 01:15:09.892436', NULL, '20:30:00');
INSERT INTO public.event_job_roles VALUES (439, 70, 10, 1, 1, '2026-06-10 01:14:41.668052', '2026-06-10 01:23:42.357367', NULL, '20:30:00');
INSERT INTO public.event_job_roles VALUES (441, 71, 50, 1, 0, '2026-06-10 01:34:49.301024', '2026-06-10 01:34:49.301027', NULL, '22:35:00');
INSERT INTO public.event_job_roles VALUES (442, 71, 51, 1, 0, '2026-06-10 01:34:49.301027', '2026-06-10 01:34:49.301028', NULL, '22:35:00');
INSERT INTO public.event_job_roles VALUES (430, 68, 10, 1, 1, '2026-06-09 04:03:27.296304', '2026-06-10 01:45:04.146393', NULL, '14:00:00');
INSERT INTO public.event_job_roles VALUES (431, 68, 11, 1, 1, '2026-06-09 04:03:27.296306', '2026-06-10 01:52:29.680701', NULL, '13:00:00');
INSERT INTO public.event_job_roles VALUES (451, 77, 50, 1, 1, '2026-06-19 19:43:30.706237', '2026-06-19 20:02:41.870041', NULL, '04:30:00');
INSERT INTO public.event_job_roles VALUES (443, 72, 10, 1, 0, '2026-06-10 04:13:40.306728', '2026-06-10 04:13:40.30673', NULL, '23:00:00');
INSERT INTO public.event_job_roles VALUES (453, 79, 50, 1, 0, '2026-06-19 20:58:26.151475', '2026-06-19 20:58:26.151476', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (444, 72, 10, 1, 0, '2026-06-10 04:13:40.30673', '2026-06-10 04:13:40.30673', NULL, '23:30:00');
INSERT INTO public.event_job_roles VALUES (445, 73, 50, 1, 1, '2026-06-17 02:42:04.370559', '2026-06-17 02:55:58.930337', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (447, 74, 50, 1, 1, '2026-06-17 02:58:20.335355', '2026-06-17 03:14:38.470497', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (452, 78, 50, 1, 1, '2026-06-19 20:42:55.125105', '2026-06-19 21:15:27.032647', NULL, NULL);
INSERT INTO public.event_job_roles VALUES (454, 80, 50, 1, 1, '2026-06-19 21:03:36.116446', '2026-06-19 21:17:19.298467', NULL, '17:00:00');


--
-- Data for Name: event_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_assignments VALUES (83, 60, 11, 5, 11, 'approved', 7, '2026-06-05 16:29:05.700908', '2026-06-05 23:54:33.824605', 110);
INSERT INTO public.event_assignments VALUES (81, 60, 8, 5, 10, 'approved', 7, '2026-06-05 16:29:05.673953', '2026-06-05 23:55:22.76001', 108);
INSERT INTO public.event_assignments VALUES (3, 2, 11, 5, 11, 'approved', NULL, '2026-05-20 00:52:53.844248', '2026-05-20 00:53:19.040888', NULL);
INSERT INTO public.event_assignments VALUES (2, 2, 8, 5, 10, 'approved', NULL, '2026-05-20 00:51:37.542072', '2026-05-20 00:53:20.194563', NULL);
INSERT INTO public.event_assignments VALUES (1, 1, 9, 5, 10, 'approved', NULL, '2026-05-20 00:50:46.185908', '2026-05-20 00:53:35.171952', NULL);
INSERT INTO public.event_assignments VALUES (4, 3, 10, 5, 10, 'approved', NULL, '2026-05-20 01:16:57.278834', '2026-05-20 01:17:43.715097', NULL);
INSERT INTO public.event_assignments VALUES (5, 4, 8, 5, 10, 'approved', 7, '2026-05-20 03:11:16.775573', '2026-05-20 03:12:02.37048', NULL);
INSERT INTO public.event_assignments VALUES (7, 5, 10, 5, 10, 'approved', NULL, '2026-05-20 04:04:12.995245', '2026-05-20 04:04:35.447673', NULL);
INSERT INTO public.event_assignments VALUES (8, 6, 9, 5, 10, 'approved', 7, '2026-05-20 10:32:15.68486', '2026-05-20 10:33:14.438386', NULL);
INSERT INTO public.event_assignments VALUES (9, 7, 8, 5, 10, 'approved', 7, '2026-05-20 11:00:34.295797', '2026-05-20 11:01:11.920221', NULL);
INSERT INTO public.event_assignments VALUES (10, 8, 10, 5, 10, 'approved', 7, '2026-05-20 12:44:42.801808', '2026-05-20 12:45:20.6744', NULL);
INSERT INTO public.event_assignments VALUES (12, 9, 9, 5, 10, 'approved', NULL, '2026-05-20 12:54:26.627211', '2026-05-20 12:55:49.231067', NULL);
INSERT INTO public.event_assignments VALUES (11, 10, 8, 5, 11, 'approved', NULL, '2026-05-20 12:53:31.685922', '2026-05-20 12:55:56.436592', NULL);
INSERT INTO public.event_assignments VALUES (13, 11, 10, 5, 10, 'approved', 7, '2026-05-20 13:01:52.465756', '2026-05-20 13:02:19.606956', NULL);
INSERT INTO public.event_assignments VALUES (15, 13, 14, 5, 10, 'approved', 15, '2026-05-20 16:09:07.068336', '2026-05-20 16:29:46.682424', NULL);
INSERT INTO public.event_assignments VALUES (16, 14, 14, 5, 10, 'approved', NULL, '2026-05-20 18:01:06.685058', '2026-05-20 18:17:12.928983', NULL);
INSERT INTO public.event_assignments VALUES (17, 15, 16, 5, 11, 'approved', NULL, '2026-05-20 19:14:06.813775', '2026-05-20 19:53:21.461262', NULL);
INSERT INTO public.event_assignments VALUES (14, 12, 11, 5, 11, 'approved', NULL, '2026-05-20 15:46:19.973217', '2026-05-20 19:54:23.772585', NULL);
INSERT INTO public.event_assignments VALUES (85, 61, 9, 5, 10, 'removed', 7, '2026-06-05 21:57:15.037331', '2026-06-06 00:08:35.288699', 112);
INSERT INTO public.event_assignments VALUES (18, 15, 14, 5, 10, 'approved', NULL, '2026-05-20 19:55:34.404726', '2026-05-20 19:56:14.85839', NULL);
INSERT INTO public.event_assignments VALUES (20, 12, 8, 5, 10, 'approved', NULL, '2026-05-21 01:47:36.14289', '2026-05-21 02:50:45.172929', NULL);
INSERT INTO public.event_assignments VALUES (22, 17, 8, 5, 10, 'approved', NULL, '2026-05-21 01:48:39.353948', '2026-05-21 10:53:07.100892', NULL);
INSERT INTO public.event_assignments VALUES (23, 16, 14, 5, 10, 'approved', NULL, '2026-05-21 10:51:31.6851', '2026-05-21 10:53:18.706311', NULL);
INSERT INTO public.event_assignments VALUES (86, 61, 8, 5, 11, 'approved', 7, '2026-06-05 23:46:54.996011', '2026-06-06 01:11:47.81244', 113);
INSERT INTO public.event_assignments VALUES (87, 61, 16, 5, 10, 'approved', 7, '2026-06-06 00:10:51.037099', '2026-06-06 01:13:16.746729', 112);
INSERT INTO public.event_assignments VALUES (26, 22, 9, 5, 10, 'invited', 7, '2026-05-22 03:56:25.758017', '2026-05-22 03:56:25.758019', NULL);
INSERT INTO public.event_assignments VALUES (27, 22, 11, 5, 11, 'invited', 7, '2026-05-22 03:56:58.848959', '2026-05-22 03:56:58.848962', NULL);
INSERT INTO public.event_assignments VALUES (30, 25, 9, 5, 10, 'invited', 7, '2026-05-22 04:44:36.863945', '2026-05-22 04:44:36.86395', NULL);
INSERT INTO public.event_assignments VALUES (31, 25, 11, 5, 11, 'invited', 7, '2026-05-22 04:44:36.890952', '2026-05-22 04:44:36.890954', NULL);
INSERT INTO public.event_assignments VALUES (84, 60, 14, 5, 10, 'approved', 7, '2026-06-05 16:30:06.724497', '2026-06-06 02:08:45.85952', 108);
INSERT INTO public.event_assignments VALUES (82, 60, 9, 5, 10, 'rejected', 7, '2026-06-05 16:29:05.698138', '2026-06-06 01:00:39.24341', NULL);
INSERT INTO public.event_assignments VALUES (32, 26, 14, 5, 10, 'approved', 7, '2026-05-22 04:54:45.406391', '2026-05-22 04:56:10.819947', NULL);
INSERT INTO public.event_assignments VALUES (34, 27, 14, 5, 10, 'rejected', 7, '2026-05-22 04:57:55.961657', '2026-05-22 04:58:39.741627', NULL);
INSERT INTO public.event_assignments VALUES (89, 62, 21, 5, 11, 'approved', 7, '2026-06-06 02:18:16.778773', '2026-06-06 02:50:56.506569', 115);
INSERT INTO public.event_assignments VALUES (88, 62, 19, 5, 10, 'rejected', 7, '2026-06-06 02:18:16.754294', '2026-06-06 02:55:12.967194', 114);
INSERT INTO public.event_assignments VALUES (36, 29, 14, 5, 10, 'approved', 7, '2026-05-22 05:02:03.612451', '2026-05-22 05:03:22.940072', NULL);
INSERT INTO public.event_assignments VALUES (39, 32, 14, 5, 10, 'approved', 7, '2026-05-22 05:09:27.298768', '2026-05-22 05:10:05.108082', NULL);
INSERT INTO public.event_assignments VALUES (38, 31, 14, 5, 10, 'approved', 7, '2026-05-22 05:08:59.480448', '2026-05-22 05:10:38.391041', NULL);
INSERT INTO public.event_assignments VALUES (37, 29, 12, 5, 11, 'approved', 7, '2026-05-22 05:02:12.187115', '2026-05-22 05:20:08.912563', NULL);
INSERT INTO public.event_assignments VALUES (33, 26, 12, 5, 11, 'rejected', 7, '2026-05-22 04:54:45.426217', '2026-05-22 05:27:46.171687', NULL);
INSERT INTO public.event_assignments VALUES (40, 26, 8, 5, 11, 'approved', NULL, '2026-05-22 05:29:05.895643', '2026-05-22 05:30:28.481883', NULL);
INSERT INTO public.event_assignments VALUES (92, 63, 10, 5, 10, 'approved', 7, '2026-06-06 03:21:36.135447', '2026-06-06 03:22:24.638658', 116);
INSERT INTO public.event_assignments VALUES (42, 27, 10, 5, 10, 'pending', NULL, '2026-05-22 05:35:03.075213', '2026-05-22 05:35:03.075217', NULL);
INSERT INTO public.event_assignments VALUES (43, 30, 11, 5, 11, 'invited', 7, '2026-05-22 05:37:24.275202', '2026-05-22 05:37:24.275205', NULL);
INSERT INTO public.event_assignments VALUES (91, 63, 20, 5, 11, 'rejected', 7, '2026-06-06 03:21:36.110009', '2026-06-06 03:25:04.629036', 117);
INSERT INTO public.event_assignments VALUES (93, 63, 12, 5, 11, 'invited', 7, '2026-06-06 03:27:11.007233', '2026-06-06 03:27:11.007236', 117);
INSERT INTO public.event_assignments VALUES (45, 30, 14, 5, 10, 'approved', 7, '2026-05-22 05:58:54.728007', '2026-05-22 05:59:22.454933', NULL);
INSERT INTO public.event_assignments VALUES (90, 62, 23, 5, 10, 'approved', 7, '2026-06-06 02:57:40.188879', '2026-06-06 03:29:22.677143', 114);
INSERT INTO public.event_assignments VALUES (46, 28, 14, 5, 10, 'rejected', 7, '2026-05-22 06:00:22.944306', '2026-05-22 06:00:44.903829', NULL);
INSERT INTO public.event_assignments VALUES (47, 33, 9, 5, 10, 'pending', NULL, '2026-05-22 21:30:10.49082', '2026-05-22 21:30:10.490821', NULL);
INSERT INTO public.event_assignments VALUES (48, 36, 8, 5, 10, 'approved', 7, '2026-05-23 14:27:27.575757', '2026-05-23 14:46:31.999165', NULL);
INSERT INTO public.event_assignments VALUES (95, 64, 26, 5, 11, 'approved', 7, '2026-06-06 03:47:38.147974', '2026-06-06 03:48:42.154361', 119);
INSERT INTO public.event_assignments VALUES (49, 19, 8, 5, 10, 'approved', NULL, '2026-05-23 14:45:11.800621', '2026-05-23 14:59:15.873508', NULL);
INSERT INTO public.event_assignments VALUES (50, 19, 11, 5, 11, 'approved', NULL, '2026-05-23 14:56:10.754293', '2026-05-23 14:59:20.080547', NULL);
INSERT INTO public.event_assignments VALUES (94, 64, 18, 5, 10, 'rejected', 7, '2026-06-06 03:44:23.677726', '2026-06-06 03:49:34.935173', 118);
INSERT INTO public.event_assignments VALUES (51, 37, 14, 5, 10, 'approved', 7, '2026-05-24 03:08:49.781194', '2026-05-24 03:09:19.886212', NULL);
INSERT INTO public.event_assignments VALUES (96, 64, 9, 5, 10, 'invited', 7, '2026-06-06 03:50:42.333232', '2026-06-06 03:50:42.333234', 118);
INSERT INTO public.event_assignments VALUES (97, 65, 8, 5, 11, 'approved', 7, '2026-06-06 14:09:21.799524', '2026-06-06 14:09:21.799525', 121);
INSERT INTO public.event_assignments VALUES (99, 65, 14, 5, 10, 'approved', 7, '2026-06-06 14:23:11.716167', '2026-06-06 14:23:11.71617', 120);
INSERT INTO public.event_assignments VALUES (62, 45, 14, 5, 10, 'approved', 7, '2026-05-25 20:51:22.462525', '2026-05-25 21:36:58.628392', NULL);
INSERT INTO public.event_assignments VALUES (72, 56, 8, 5, 10, 'invited', 7, '2026-06-03 02:12:21.529958', '2026-06-03 02:12:21.529961', 93);
INSERT INTO public.event_assignments VALUES (73, 56, 9, 5, 10, 'invited', 7, '2026-06-03 02:12:41.22113', '2026-06-03 02:12:41.221133', 92);
INSERT INTO public.event_assignments VALUES (74, 58, 8, 5, 10, 'rejected', 7, '2026-06-03 02:20:10.728532', '2026-06-03 03:38:59.990673', 99);
INSERT INTO public.event_assignments VALUES (75, 58, 9, 5, 10, 'approved', 7, '2026-06-03 02:20:10.738522', '2026-06-03 03:45:33.015663', 99);
INSERT INTO public.event_assignments VALUES (76, 59, 9, 5, 10, 'invited', 7, '2026-06-03 04:02:29.065741', '2026-06-03 04:02:29.065744', 105);
INSERT INTO public.event_assignments VALUES (77, 59, 8, 5, 10, 'invited', 7, '2026-06-03 04:02:29.087125', '2026-06-03 04:02:29.087126', 105);
INSERT INTO public.event_assignments VALUES (80, 57, 9, 5, 10, 'invited', 7, '2026-06-03 04:37:27.900743', '2026-06-03 04:37:27.900744', 97);
INSERT INTO public.event_assignments VALUES (79, 57, 8, 5, 10, 'rejected', 7, '2026-06-03 04:37:27.883396', '2026-06-05 22:50:58.805979', 97);
INSERT INTO public.event_assignments VALUES (60, 44, 14, 5, 10, 'approved', 7, '2026-05-25 20:29:13.208011', '2026-06-17 02:51:57.921507', NULL);
INSERT INTO public.event_assignments VALUES (56, 43, 14, 5, 10, 'approved', 7, '2026-05-25 18:14:41.186467', '2026-06-17 02:52:51.42685', NULL);
INSERT INTO public.event_assignments VALUES (55, 42, 14, 5, 10, 'approved', 7, '2026-05-25 17:57:48.417513', '2026-06-17 02:53:00.331208', NULL);
INSERT INTO public.event_assignments VALUES (54, 40, 14, 5, 10, 'approved', 7, '2026-05-25 16:28:10.917051', '2026-06-17 02:53:12.462746', NULL);
INSERT INTO public.event_assignments VALUES (53, 39, 14, 5, 10, 'approved', 7, '2026-05-25 16:23:56.049368', '2026-06-17 02:53:19.587798', NULL);
INSERT INTO public.event_assignments VALUES (52, 38, 14, 5, 10, 'approved', 7, '2026-05-25 16:21:19.202101', '2026-06-17 02:53:26.852637', NULL);
INSERT INTO public.event_assignments VALUES (29, 24, 14, 5, 10, 'approved', 7, '2026-05-22 04:21:03.224367', '2026-06-17 02:53:34.243314', NULL);
INSERT INTO public.event_assignments VALUES (28, 23, 14, 5, 10, 'approved', 7, '2026-05-22 04:01:25.216162', '2026-06-17 02:53:40.788533', NULL);
INSERT INTO public.event_assignments VALUES (117, 200, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (118, 200, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (119, 200, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (120, 200, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (121, 200, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (122, 200, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (123, 200, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (124, 201, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (125, 201, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (126, 201, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (127, 201, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (128, 201, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (129, 201, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (130, 201, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (131, 202, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (132, 202, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (133, 202, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (134, 202, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (135, 202, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (136, 202, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (137, 203, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (138, 203, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (139, 203, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (140, 203, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (141, 203, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (142, 204, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (143, 204, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (144, 204, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (145, 204, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (146, 204, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (147, 205, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (148, 205, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (149, 205, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (150, 205, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (151, 205, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (152, 205, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (153, 205, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (154, 206, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (155, 206, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (156, 206, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (157, 206, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (158, 206, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (159, 206, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (160, 206, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (161, 207, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (162, 207, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (163, 207, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (164, 207, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (165, 207, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (166, 207, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (167, 208, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (168, 208, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (169, 208, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (170, 208, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (171, 208, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (172, 209, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (173, 209, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (174, 209, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (175, 209, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (176, 209, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (177, 210, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (178, 210, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (179, 210, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (180, 210, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (181, 210, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (182, 210, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (183, 210, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (184, 211, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (185, 211, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (186, 211, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (187, 211, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (188, 211, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (189, 211, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (190, 211, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (191, 212, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (192, 212, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (193, 212, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (194, 212, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (195, 212, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (196, 212, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (197, 213, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (198, 213, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (199, 213, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (200, 213, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (201, 213, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (202, 214, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (203, 214, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (204, 214, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (205, 214, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (206, 214, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (207, 215, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (208, 215, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (209, 215, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (210, 215, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (211, 215, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (212, 215, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (213, 215, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (214, 216, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (215, 216, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (216, 216, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (217, 216, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (218, 216, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (219, 216, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (220, 216, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (221, 217, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (222, 217, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (223, 217, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (224, 217, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (225, 217, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (226, 217, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (227, 218, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (228, 218, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (229, 218, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (230, 218, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (231, 218, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (232, 219, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (233, 219, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (234, 219, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (235, 219, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (236, 219, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (237, 220, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (238, 220, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (239, 220, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (240, 220, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (241, 220, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (242, 220, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (243, 220, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (244, 221, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (245, 221, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (246, 221, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (247, 221, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (248, 221, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (249, 221, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (250, 221, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (251, 222, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (252, 222, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (253, 222, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (254, 222, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (255, 222, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (256, 222, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (257, 223, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (258, 223, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (259, 223, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (260, 223, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (261, 223, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (262, 224, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (263, 224, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (264, 224, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (265, 224, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (266, 224, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (267, 225, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (268, 225, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (269, 225, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (270, 225, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (271, 225, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (272, 225, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (273, 225, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (274, 226, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (275, 226, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (276, 226, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (277, 226, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (278, 226, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (279, 226, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (280, 226, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (281, 227, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (282, 227, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (283, 227, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (284, 227, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (285, 227, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (286, 227, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (287, 228, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (288, 228, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (289, 228, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (290, 228, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (291, 228, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (292, 229, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (293, 229, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (294, 229, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (295, 229, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (296, 229, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (297, 230, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (298, 230, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (299, 230, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (300, 230, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (301, 230, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (302, 230, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (303, 230, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (304, 231, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (305, 231, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (306, 231, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (307, 231, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (308, 231, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (309, 231, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (310, 231, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (311, 232, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (312, 232, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (313, 232, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (314, 232, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (315, 232, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (316, 232, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (317, 233, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (318, 233, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (319, 233, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (320, 233, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (321, 233, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (322, 234, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (323, 234, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (324, 234, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (325, 234, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (326, 234, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (327, 235, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (328, 235, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (329, 235, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (330, 235, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (331, 235, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (332, 235, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (333, 235, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (334, 236, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (335, 236, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (336, 236, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (337, 236, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (338, 236, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (339, 236, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (340, 236, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (341, 237, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (342, 237, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (343, 237, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (344, 237, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (345, 237, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (346, 237, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (347, 238, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (348, 238, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (349, 238, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (350, 238, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (351, 238, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (352, 239, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (353, 239, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (354, 239, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (355, 239, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (356, 239, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (357, 240, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (358, 240, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (359, 240, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (360, 240, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (361, 240, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (362, 240, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (363, 240, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (364, 241, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (365, 241, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (366, 241, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (367, 241, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (368, 241, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (369, 241, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (370, 241, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (371, 242, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (372, 242, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (373, 242, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (374, 242, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (375, 242, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (376, 242, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (377, 243, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (378, 243, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (379, 243, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (380, 243, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (381, 243, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (382, 244, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (383, 244, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (384, 244, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (385, 244, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (386, 244, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (387, 245, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (388, 245, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (389, 245, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (390, 245, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (391, 245, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (392, 245, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (393, 245, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (394, 246, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (395, 246, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (396, 246, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (397, 246, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (398, 246, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (399, 246, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (400, 246, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (401, 247, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (402, 247, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (403, 247, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (404, 247, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (405, 247, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (406, 247, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (407, 248, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (408, 248, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (409, 248, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (410, 248, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (411, 248, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (412, 249, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (413, 249, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (414, 249, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (415, 249, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (416, 249, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (417, 250, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (418, 250, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (419, 250, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (420, 250, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (421, 250, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (422, 250, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (423, 250, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (424, 251, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (425, 251, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (426, 251, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (427, 251, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (428, 251, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (429, 251, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (430, 251, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (431, 252, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (432, 252, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (433, 252, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (434, 252, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (435, 252, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (436, 252, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (437, 253, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (438, 253, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (439, 253, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (440, 253, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (441, 253, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (442, 254, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (443, 254, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (444, 254, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (445, 254, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (446, 254, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (447, 255, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (448, 255, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (449, 255, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (450, 255, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (451, 255, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (452, 255, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (453, 255, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (454, 256, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (455, 256, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (456, 256, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (457, 256, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (458, 256, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (459, 256, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (460, 256, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (461, 257, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (462, 257, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (463, 257, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (464, 257, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (465, 257, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (466, 257, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (467, 258, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (468, 258, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (469, 258, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (470, 258, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (471, 258, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (472, 259, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (473, 259, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (474, 259, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (475, 259, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (476, 259, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (477, 260, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (478, 260, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (479, 260, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (480, 260, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (481, 260, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (482, 260, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (483, 260, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (484, 261, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (485, 261, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (486, 261, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (487, 261, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (488, 261, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (489, 261, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (490, 261, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (491, 262, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (492, 262, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (493, 262, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (494, 262, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (495, 262, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (496, 262, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (497, 263, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (498, 263, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (499, 263, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (500, 263, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (501, 263, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (502, 264, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (503, 264, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (504, 264, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (505, 264, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (506, 264, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (507, 265, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (508, 265, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (509, 265, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (510, 265, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (511, 265, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (512, 265, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (513, 265, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (514, 266, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (515, 266, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (516, 266, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (517, 266, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (518, 266, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (519, 266, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (520, 266, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (521, 267, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (522, 267, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (523, 267, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (524, 267, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (525, 267, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (526, 267, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (527, 268, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (528, 268, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (529, 268, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (530, 268, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (531, 268, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (532, 269, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (533, 269, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (534, 269, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (535, 269, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (536, 269, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (537, 270, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (538, 270, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (539, 270, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (540, 270, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (541, 270, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (542, 270, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (543, 270, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (544, 271, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (545, 271, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (546, 271, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (547, 271, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (548, 271, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (549, 271, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (550, 271, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (551, 272, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (552, 272, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (553, 272, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (554, 272, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (555, 272, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (556, 272, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (557, 273, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (558, 273, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (559, 273, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (560, 273, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (561, 273, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (562, 274, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (563, 274, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (564, 274, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (565, 274, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (566, 274, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (567, 275, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (568, 275, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (569, 275, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (570, 275, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (571, 275, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (572, 275, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (573, 275, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (574, 276, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (575, 276, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (576, 276, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (577, 276, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (578, 276, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (579, 276, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (580, 276, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (581, 277, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (582, 277, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (583, 277, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (584, 277, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (585, 277, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (586, 277, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (587, 278, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (588, 278, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (589, 278, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (590, 278, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (591, 278, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (592, 279, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (593, 279, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (594, 279, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (595, 279, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (596, 279, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (597, 280, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (598, 280, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (599, 280, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (600, 280, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (601, 280, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (602, 280, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (603, 280, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (604, 281, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (605, 281, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (606, 281, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (607, 281, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (608, 281, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (609, 281, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (610, 281, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (611, 282, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (612, 282, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (613, 282, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (614, 282, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (615, 282, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (616, 282, 117, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (617, 283, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (618, 283, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (619, 283, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (620, 283, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (621, 283, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (622, 284, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (623, 284, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (624, 284, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (625, 284, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (626, 284, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (627, 285, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (628, 285, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (629, 285, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (630, 285, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (631, 285, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (632, 285, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (633, 285, 124, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (634, 286, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (635, 286, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (636, 286, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (637, 286, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (638, 286, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (639, 286, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (640, 286, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (641, 287, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (642, 287, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (643, 287, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (644, 287, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (645, 287, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (646, 287, 122, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (647, 288, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (648, 288, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (649, 288, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (650, 288, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (651, 288, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (652, 289, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (653, 289, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (654, 289, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (655, 289, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (656, 289, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (657, 290, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (658, 290, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (659, 290, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (660, 290, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (661, 290, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (662, 290, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (663, 290, 125, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (664, 291, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (665, 291, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (666, 291, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (667, 291, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (668, 291, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (669, 291, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (670, 291, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (671, 292, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (672, 292, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (673, 292, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (674, 292, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (675, 292, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (676, 292, 121, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (677, 293, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (678, 293, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (679, 293, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (680, 293, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (681, 293, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (682, 294, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (683, 294, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (684, 294, 116, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (685, 294, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (686, 294, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (687, 295, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (688, 295, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (689, 295, 109, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (690, 295, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (691, 295, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (692, 295, 118, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (693, 295, 126, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (694, 296, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (695, 296, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (696, 296, 110, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (697, 296, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (698, 296, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (699, 296, 119, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (700, 296, 123, 10, 53, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (701, 297, 103, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (702, 297, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (703, 297, 111, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (704, 297, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (705, 297, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (706, 297, 120, 10, 52, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (707, 298, 104, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (708, 298, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (709, 298, 112, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (710, 298, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (711, 298, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (712, 299, 101, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (713, 299, 102, 10, 50, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (714, 299, 113, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (715, 299, 114, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (716, 299, 115, 10, 51, 'approved', 100, '2026-06-08 17:21:04.262791', '2026-06-08 17:21:04.262791', NULL);
INSERT INTO public.event_assignments VALUES (721, 67, 8, 5, 10, 'approved', 7, '2026-06-09 02:21:15.268315', '2026-06-09 02:21:15.268326', 426);
INSERT INTO public.event_assignments VALUES (723, 67, 11, 5, 11, 'approved', 7, '2026-06-09 02:43:46.491109', '2026-06-09 02:43:46.491112', 428);
INSERT INTO public.event_assignments VALUES (802, 68, 9, 5, 10, 'approved', 7, '2026-06-09 21:08:01.132931', '2026-06-09 21:16:16.330652', 430);
INSERT INTO public.event_assignments VALUES (803, 69, 21, 5, 11, 'approved', 7, '2026-06-10 00:46:23.752348', '2026-06-10 00:46:23.752351', 435);
INSERT INTO public.event_assignments VALUES (804, 69, 26, 5, 11, 'approved', 7, '2026-06-10 00:46:24.502486', '2026-06-10 00:46:24.502489', 436);
INSERT INTO public.event_assignments VALUES (805, 69, 8, 5, 10, 'approved', 7, '2026-06-10 00:48:06.294843', '2026-06-10 00:48:06.294846', 433);
INSERT INTO public.event_assignments VALUES (806, 69, 9, 5, 10, 'approved', 7, '2026-06-10 00:48:06.922763', '2026-06-10 00:48:06.922766', 434);
INSERT INTO public.event_assignments VALUES (807, 69, 20, 5, 11, 'approved', 7, '2026-06-10 01:00:43.877356', '2026-06-10 01:00:43.877359', 437);
INSERT INTO public.event_assignments VALUES (799, 68, 8, 5, 10, 'approved', 7, '2026-06-09 21:08:01.109622', '2026-06-10 01:45:02.570269', 429);
INSERT INTO public.event_assignments VALUES (801, 68, 11, 5, 11, 'approved', 7, '2026-06-09 21:08:01.129539', '2026-06-10 01:52:28.599563', 432);
INSERT INTO public.event_assignments VALUES (808, 69, 19, 5, 10, 'approved', 7, '2026-06-10 01:01:41.314875', '2026-06-10 01:02:42.774587', 438);
INSERT INTO public.event_assignments VALUES (809, 66, 101, 10, 50, 'approved', 100, '2026-06-10 01:08:47.221978', '2026-06-10 01:08:47.221981', 422);
INSERT INTO public.event_assignments VALUES (810, 66, 102, 10, 50, 'approved', 100, '2026-06-10 01:08:48.131843', '2026-06-10 01:08:48.131846', 423);
INSERT INTO public.event_assignments VALUES (811, 66, 105, 10, 51, 'approved', 100, '2026-06-10 01:08:48.58119', '2026-06-10 01:08:48.581192', 424);
INSERT INTO public.event_assignments VALUES (812, 66, 106, 10, 51, 'approved', 100, '2026-06-10 01:08:48.987006', '2026-06-10 01:08:48.987009', 425);
INSERT INTO public.event_assignments VALUES (813, 70, 12, 5, 11, 'approved', 7, '2026-06-10 01:15:09.8889', '2026-06-10 01:15:09.888903', 440);
INSERT INTO public.event_assignments VALUES (814, 70, 18, 5, 10, 'removed', 7, '2026-06-10 01:15:10.264792', '2026-06-10 01:20:56.683983', 439);
INSERT INTO public.event_assignments VALUES (815, 70, 23, 5, 10, 'approved', 7, '2026-06-10 01:23:42.352598', '2026-06-10 01:23:42.3526', 439);
INSERT INTO public.event_assignments VALUES (816, 71, 101, 10, 50, 'invited', 100, '2026-06-10 01:34:59.262004', '2026-06-10 01:34:59.262006', 441);
INSERT INTO public.event_assignments VALUES (78, 59, 14, 5, 10, 'approved', 7, '2026-06-03 04:02:29.09047', '2026-06-17 02:48:19.898132', 105);
INSERT INTO public.event_assignments VALUES (821, 73, 9, 10, 50, 'approved', 100, '2026-06-17 02:54:13.94445', '2026-06-17 02:55:58.262739', 445);
INSERT INTO public.event_assignments VALUES (822, 74, 9, 10, 50, 'approved', 100, '2026-06-17 02:58:53.666936', '2026-06-17 03:14:38.343815', 447);
INSERT INTO public.event_assignments VALUES (823, 75, 9, 10, 50, 'approved', 100, '2026-06-19 18:55:01.467131', '2026-06-19 18:56:26.547355', 448);
INSERT INTO public.event_assignments VALUES (824, 75, 8, 10, 50, 'approved', 100, '2026-06-19 18:59:26.156408', '2026-06-19 18:59:26.156414', 448);
INSERT INTO public.event_assignments VALUES (825, 76, 103, 10, 50, 'approved', NULL, '2026-06-19 19:29:10.587597', '2026-06-19 19:30:33.383645', NULL);
INSERT INTO public.event_assignments VALUES (826, 76, 118, 10, 51, 'removed', NULL, '2026-06-19 19:29:20.925818', '2026-06-19 19:32:58.026869', NULL);
INSERT INTO public.event_assignments VALUES (827, 76, 112, 10, 51, 'approved', NULL, '2026-06-19 19:40:21.280006', '2026-06-19 19:40:52.550385', NULL);
INSERT INTO public.event_assignments VALUES (828, 77, 106, 10, 50, 'removed', 100, '2026-06-19 19:47:47.984725', '2026-06-19 19:49:55.146165', 451);
INSERT INTO public.event_assignments VALUES (829, 77, 102, 10, 50, 'approved', NULL, '2026-06-19 20:01:23.868312', '2026-06-19 20:02:41.597373', NULL);
INSERT INTO public.event_assignments VALUES (833, 78, 126, 10, 50, 'approved', 100, '2026-06-19 21:15:27.027057', '2026-06-19 21:15:27.027063', 452);
INSERT INTO public.event_assignments VALUES (834, 80, 101, 10, 50, 'approved', 100, '2026-06-19 21:17:19.288101', '2026-06-19 21:17:19.288103', 456);
INSERT INTO public.event_assignments VALUES (835, 80, 102, 10, 50, 'approved', 100, '2026-06-19 21:19:21.381925', '2026-06-19 21:19:21.381928', 456);
INSERT INTO public.event_assignments VALUES (836, 80, 118, 10, 51, 'approved', 100, '2026-06-19 21:20:23.969459', '2026-06-19 21:44:58.593166', 455);
INSERT INTO public.event_assignments VALUES (839, 80, 108, 10, 50, 'approved', 100, '2026-06-19 21:25:25.928036', '2026-06-19 22:34:46.316353', 454);


--
-- Data for Name: event_coordinators; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_coordinators VALUES (7, 17, 17, 7, '2026-05-21 11:38:57.508475');
INSERT INTO public.event_coordinators VALUES (9, 18, 13, 7, '2026-05-22 01:15:58.021334');
INSERT INTO public.event_coordinators VALUES (10, 37, 13, 7, '2026-05-24 03:08:16.527668');
INSERT INTO public.event_coordinators VALUES (11, 38, 13, 7, '2026-05-25 16:19:08.876362');
INSERT INTO public.event_coordinators VALUES (12, 38, 17, 7, '2026-05-25 16:19:08.876364');
INSERT INTO public.event_coordinators VALUES (14, 39, 13, 7, '2026-05-25 16:23:45.703405');
INSERT INTO public.event_coordinators VALUES (15, 42, 13, 7, '2026-05-25 17:57:37.224127');
INSERT INTO public.event_coordinators VALUES (16, 42, 17, 7, '2026-05-25 17:57:37.224129');
INSERT INTO public.event_coordinators VALUES (17, 43, 13, 7, '2026-05-25 18:14:28.62917');
INSERT INTO public.event_coordinators VALUES (18, 44, 13, 7, '2026-05-25 20:05:18.936011');
INSERT INTO public.event_coordinators VALUES (19, 45, 13, 7, '2026-05-25 20:44:53.858896');
INSERT INTO public.event_coordinators VALUES (25, 48, 13, 7, '2026-06-02 02:05:17.268086');
INSERT INTO public.event_coordinators VALUES (26, 49, 17, 7, '2026-06-02 02:09:03.964392');
INSERT INTO public.event_coordinators VALUES (27, 51, 13, 7, '2026-06-02 02:12:23.809257');
INSERT INTO public.event_coordinators VALUES (28, 54, 13, 7, '2026-06-02 02:44:29.629184');
INSERT INTO public.event_coordinators VALUES (32, 55, 13, 7, '2026-06-02 17:22:44.9655');
INSERT INTO public.event_coordinators VALUES (33, 56, 13, 7, '2026-06-02 18:53:26.58921');
INSERT INTO public.event_coordinators VALUES (38, 58, 17, 7, '2026-06-03 03:40:45.693681');
INSERT INTO public.event_coordinators VALUES (39, 59, 13, 7, '2026-06-03 03:45:27.77975');
INSERT INTO public.event_coordinators VALUES (40, 16, 13, 7, '2026-06-03 03:46:31.014341');
INSERT INTO public.event_coordinators VALUES (41, 57, 13, 7, '2026-06-03 04:04:18.28192');
INSERT INTO public.event_coordinators VALUES (45, 61, 13, 7, '2026-06-06 01:21:32.809071');
INSERT INTO public.event_coordinators VALUES (47, 60, 13, 7, '2026-06-06 02:11:00.897428');
INSERT INTO public.event_coordinators VALUES (48, 62, 13, 7, '2026-06-06 02:14:44.156502');
INSERT INTO public.event_coordinators VALUES (49, 63, 13, 7, '2026-06-06 03:20:42.45338');
INSERT INTO public.event_coordinators VALUES (50, 65, 13, 7, '2026-06-06 14:08:50.653656');
INSERT INTO public.event_coordinators VALUES (55, 67, 13, 7, '2026-06-09 02:43:19.901061');
INSERT INTO public.event_coordinators VALUES (57, 68, 13, 7, '2026-06-09 21:05:03.498548');
INSERT INTO public.event_coordinators VALUES (60, 69, 13, 7, '2026-06-10 01:01:24.242463');
INSERT INTO public.event_coordinators VALUES (61, 70, 13, 7, '2026-06-10 01:14:41.744836');
INSERT INTO public.event_coordinators VALUES (62, 72, 13, 7, '2026-06-10 04:13:40.364878');


--
-- Data for Name: event_documents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_documents VALUES (1, 17, 'documento de prueba', 'https://www.dropbox.com/scl/fi/wozwxs8nuawt32ruerept/Comenzar.pdf?rlkey=9iwbcqfbz01azr1mx23g0nze2&st=p69t7ncu&dl=0', 7, '2026-05-21 11:47:14.988187');
INSERT INTO public.event_documents VALUES (2, 16, 'documento evento 15', 'https://www.dropbox.com/scl/fi/wozwxs8nuawt32ruerept/Comenzar.pdf?rlkey=9iwbcqfbz01azr1mx23g0nze2&st=a5spze5k&dl=0', 7, '2026-05-21 13:37:50.536744');


--
-- Data for Name: event_ratings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.news VALUES (1, 5, 'FIESTA MUNDIALISTA', 'ESTÁN TODOS CORDIALMENTE INVITADOS A UNA REUNIÓN EN LA SEDE DE BETH TORAH EN ARAS DEL MUNDIAL DE FÚTBOL PARA INFORMAR DE LOS EVENTOS QUE TENDREMOS DURANTE JUNIO Y JULIO DE 2026. ASIMISMO, COMPARTIREMOS UN RATO AGRADABLE CON COMIDA Y BEBIDAS. SÁBADO 6 DE JUNIO DE 2026. HORA 3:00 PM, LLEGAR PUNTUAL.', 7, '2026-05-19 22:44:00+00', '2026-06-05 22:44:00+00', '2026-05-20 02:44:32.206454+00', true, '2026-05-20 02:44:32.20646+00', '2026-05-20 02:44:32.206461+00');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.password_reset_tokens VALUES (1, 7, 'ymNzBSfMAlKdQADuWMuDYNFJ3Sx6vFPg-QUYCCqVz-E', '2026-06-07 05:51:54.079329', true, '2026-06-07 03:51:54.082267');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payroll_settlements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payroll_settlements VALUES (1, 5, 7, 'liquidado', '2026-05-19', '2026-05-23', 2119.14, '2026-06-08 04:38:07.311528', '2026-06-08 04:38:07.322008', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (2, 10, 100, 'liquidado', '2026-01-01', '2026-01-01', 903.00, '2026-06-08 23:40:52.335017', '2026-06-08 23:40:52.365802', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (3, 10, 100, 'liquidado', '2026-01-03', '2026-01-03', 989.50, '2026-06-08 23:55:52.983866', '2026-06-08 23:55:52.997464', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (4, 10, 100, 'liquidado', '2026-01-04', '2026-01-04', 1100.00, '2026-06-09 03:24:43.091062', '2026-06-09 03:24:43.113751', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (5, 10, 100, 'liquidado', '2026-01-06', '2026-01-07', 1583.50, '2026-06-09 03:31:54.433689', '2026-06-09 03:31:54.442324', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (6, 10, 100, 'liquidado', '2026-01-09', '2026-01-10', 2068.50, '2026-06-09 03:33:57.323045', '2026-06-09 03:33:57.332815', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (7, 10, 100, 'liquidado', '2026-05-10', '2026-05-16', 5871.00, '2026-06-09 03:36:31.868322', '2026-06-09 03:36:31.882623', NULL, NULL, NULL);
INSERT INTO public.payroll_settlements VALUES (8, 10, 100, 'liquidado', '2026-01-12', '2026-06-05', 82666.00, '2026-06-16 22:14:08.45012', '2026-06-16 22:14:09.234442', NULL, NULL, NULL);


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.shifts VALUES (33, 117, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.367356', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (34, 118, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.367358', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (35, 119, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.367359', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (36, 120, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.36736', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (37, 121, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.36736', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (38, 122, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.36736', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (39, 123, '2026-01-01 10:00:00', 25.7600000, -80.1900000, '2026-01-01 18:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:40:52.36736', NULL, 0.00, false, 2);
INSERT INTO public.shifts VALUES (40, 124, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 16:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998145', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (41, 125, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 18:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998146', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (42, 126, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998147', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (43, 127, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 14:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998147', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (44, 128, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998147', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (12, 13, '2026-05-20 13:02:36.967353', 0.0000000, 0.0000000, '2026-05-20 21:00:00', NULL, NULL, 7.96, 20.00, 159.13, 0.00, 159.13, NULL, '2026-05-20 13:02:36.969735', '2026-06-08 04:38:07.324015', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (13, 23, '2026-05-21 15:00:00', 0.0000000, 0.0000000, '2026-05-21 19:00:00', NULL, NULL, 4.00, 20.00, 80.00, 0.00, 80.00, 7, '2026-05-21 11:10:19.753023', '2026-06-08 04:38:07.324015', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (45, 129, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998148', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (14, 22, '2026-05-23 15:13:32.483056', 0.0000000, 0.0000000, '2026-05-23 15:15:49.523682', 0.0000000, 0.0000000, 3.00, 20.00, 0.00, 90.00, 90.00, NULL, '2026-05-23 15:13:32.490638', '2026-06-08 04:38:07.324015', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (15, 51, '2026-05-23 15:00:00', 0.0000000, 0.0000000, '2026-05-23 19:00:00', 25.8746753, -80.1724798, 4.00, 20.00, 80.00, 0.00, 80.00, 7, '2026-05-24 03:11:15.886309', '2026-06-08 04:38:07.324016', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (637, 821, '2026-06-16 23:15:00.721999', 0.0000000, 0.0000000, NULL, NULL, NULL, NULL, 25.00, NULL, 0.00, NULL, NULL, '2026-06-17 03:15:00.736226', '2026-06-17 03:15:00.736229', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (639, 823, '2026-06-19 19:03:02.811064', 0.0000000, 0.0000000, NULL, NULL, NULL, NULL, 25.00, NULL, 0.00, NULL, NULL, '2026-06-19 19:03:02.830291', '2026-06-19 19:03:02.830293', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (46, 130, '2026-01-03 11:00:00', 25.7600000, -80.1900000, '2026-01-03 15:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-08 23:55:52.998148', NULL, 0.00, false, 3);
INSERT INTO public.shifts VALUES (47, 131, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 19:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.114789', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (1, 1, '2026-05-20 00:57:17.934029', 0.0000000, 0.0000000, '2026-05-20 01:05:35.266003', 0.0000000, 0.0000000, 5.00, 20.00, 100.00, 0.00, 100.00, NULL, '2026-05-20 00:57:17.938856', '2026-06-08 04:38:07.324011', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (2, 4, '2026-05-20 01:18:31.331158', 0.0000000, 0.0000000, '2026-05-20 01:20:02.996789', 0.0000000, 0.0000000, 4.00, 23.00, 92.00, 0.00, 92.00, NULL, '2026-05-20 01:18:31.336435', '2026-06-08 04:38:07.324012', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (3, 2, '2026-05-20 02:45:56.950778', 0.0000000, 0.0000000, '2026-05-20 03:08:08.756323', 0.0000000, 0.0000000, 0.37, 20.00, 7.40, 0.00, 7.40, NULL, '2026-05-20 02:45:56.955527', '2026-06-08 04:38:07.324013', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (4, 3, '2026-05-20 02:47:29.274943', 0.0000000, 0.0000000, '2026-05-20 03:03:43.589389', 0.0000000, 0.0000000, 2.00, 18.00, 36.00, 0.00, 36.00, NULL, '2026-05-20 02:47:29.281426', '2026-06-08 04:38:07.324013', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (5, 5, '2026-05-20 03:12:11.335527', 0.0000000, 0.0000000, '2026-05-20 04:34:40.702932', 0.0000000, 0.0000000, 2.00, 20.00, 40.00, 0.00, 40.00, NULL, '2026-05-20 03:12:11.340839', '2026-06-08 04:38:07.324013', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (6, 7, '2026-05-20 04:05:22.674553', 0.0000000, 0.0000000, '2026-05-20 07:00:00', NULL, NULL, 2.91, 20.00, 58.21, 0.00, 58.21, NULL, '2026-05-20 04:05:22.683257', '2026-06-08 04:38:07.324013', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (7, 8, '2026-05-20 10:36:14.576066', 0.0000000, 0.0000000, '2026-05-21 10:00:00', NULL, NULL, 23.40, 20.00, 467.92, 0.00, 467.92, NULL, '2026-05-20 10:36:14.596356', '2026-06-08 04:38:07.324014', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (8, 9, '2026-05-20 11:08:12.404352', 0.0000000, 0.0000000, '2026-05-21 11:00:00', NULL, NULL, 23.86, 20.00, 477.26, 0.00, 477.26, NULL, '2026-05-20 11:08:12.412626', '2026-06-08 04:38:07.324014', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (9, 10, '2026-05-20 12:45:55.226926', 0.0000000, 0.0000000, '2026-05-20 17:00:00', NULL, NULL, 4.23, 20.00, 84.69, 0.00, 84.69, NULL, '2026-05-20 12:45:55.235304', '2026-06-08 04:38:07.324014', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (10, 12, '2026-05-20 12:56:51.312113', 0.0000000, 0.0000000, '2026-05-20 14:15:00', NULL, NULL, 3.00, 20.00, 60.00, 0.00, 60.00, NULL, '2026-05-20 12:56:51.314998', '2026-06-08 04:38:07.324015', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (11, 11, '2026-05-20 12:57:29.102358', 0.0000000, 0.0000000, '2026-05-21 05:00:00', NULL, NULL, 16.04, 18.00, 247.86, 61.34, 309.20, NULL, '2026-05-20 12:57:29.108372', '2026-06-08 04:38:07.324015', NULL, 0.00, false, 1);
INSERT INTO public.shifts VALUES (48, 132, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 22:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.11479', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (49, 133, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.11479', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (16, 86, '2026-06-06 01:22:11.349377', 0.0000000, 0.0000000, '2026-06-10 01:04:36.56154', 0.0000000, 0.0000000, 95.71, 20.00, 354.20, 2339.91, 2694.11, NULL, '2026-06-06 01:22:11.359496', '2026-06-10 01:04:36.576183', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (638, 822, '2026-06-16 23:24:13.214952', 0.0000000, 0.0000000, '2026-06-16 23:27:11.361561', NULL, NULL, 5.00, 25.00, 125.00, 0.00, 125.00, NULL, '2026-06-17 03:24:13.242009', '2026-06-17 03:27:11.404746', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (640, 824, '2026-06-19 19:07:06.911679', 0.0000000, 0.0000000, '2026-06-20 02:18:59.224717', 0.0000000, 0.0000000, 7.20, 25.00, 179.95, 0.00, 179.95, NULL, '2026-06-19 19:07:06.918475', '2026-06-20 02:18:59.273654', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (53, 137, '2026-01-06 14:00:00', 25.7600000, -80.1900000, '2026-01-06 22:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442987', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (54, 138, '2026-01-06 14:00:00', 25.7600000, -80.1900000, '2026-01-06 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442989', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (55, 139, '2026-01-06 14:00:00', 25.7600000, -80.1900000, '2026-01-06 23:45:00', NULL, NULL, 9.75, 22.00, 214.50, 0.00, 214.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442989', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (63, 147, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-09 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333927', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (64, 148, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-09 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.33393', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (65, 149, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-09 22:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.33393', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (66, 150, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-10 00:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.33393', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (67, 151, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-10 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.33393', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (68, 152, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-10 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333931', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (69, 153, '2026-01-09 18:00:00', 25.7600000, -80.1900000, '2026-01-10 00:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333931', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (70, 154, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 00:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333931', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (71, 155, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 02:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333932', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (72, 156, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333932', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (77, 161, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-13 03:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242197', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (78, 162, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-13 06:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242199', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (79, 163, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-13 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2422', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (80, 164, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-12 23:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2422', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (81, 165, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-13 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2422', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (82, 166, '2026-01-12 20:00:00', 25.7600000, -80.1900000, '2026-01-13 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242201', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (83, 167, '2026-01-14 10:00:00', 25.7600000, -80.1900000, '2026-01-14 18:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242201', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (84, 168, '2026-01-14 10:00:00', 25.7600000, -80.1900000, '2026-01-14 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242201', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (85, 169, '2026-01-14 10:00:00', 25.7600000, -80.1900000, '2026-01-14 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242201', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (86, 170, '2026-01-14 10:00:00', 25.7600000, -80.1900000, '2026-01-14 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242201', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (87, 171, '2026-01-14 10:00:00', 25.7600000, -80.1900000, '2026-01-14 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242202', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (88, 172, '2026-01-15 11:00:00', 25.7600000, -80.1900000, '2026-01-15 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242202', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (89, 173, '2026-01-15 11:00:00', 25.7600000, -80.1900000, '2026-01-15 19:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242202', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (641, 829, '2026-06-19 20:06:05.029971', 0.0000000, 0.0000000, NULL, NULL, NULL, NULL, 25.00, NULL, 0.00, NULL, NULL, '2026-06-19 20:06:05.036344', '2026-06-19 20:06:05.036348', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (527, 611, '2026-05-10 12:00:00', 25.7600000, -80.1900000, '2026-05-10 19:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883596', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (528, 612, '2026-05-10 08:00:00', 25.7600000, -80.1900000, '2026-05-10 23:00:00', NULL, NULL, 15.00, 25.00, 125.00, 375.00, 500.00, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883598', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (491, 575, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 23:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242296', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (492, 576, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242297', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (493, 577, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242297', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (494, 578, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242297', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (495, 579, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242297', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (496, 580, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 20:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242298', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (497, 581, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-03 01:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242298', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (498, 582, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-03 04:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242298', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (499, 583, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-02 22:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242298', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (500, 584, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-03 00:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242299', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (501, 585, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-03 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242299', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (502, 586, '2026-05-02 18:00:00', 25.7600000, -80.1900000, '2026-05-03 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242299', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (503, 587, '2026-05-03 19:00:00', 25.7600000, -80.1900000, '2026-05-04 03:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242299', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (504, 588, '2026-05-03 19:00:00', 25.7600000, -80.1900000, '2026-05-04 00:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242299', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (505, 589, '2026-05-03 19:00:00', 25.7600000, -80.1900000, '2026-05-04 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2423', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (506, 590, '2026-05-03 19:00:00', 25.7600000, -80.1900000, '2026-05-04 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2423', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (507, 591, '2026-05-03 19:00:00', 25.7600000, -80.1900000, '2026-05-03 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2423', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (508, 592, '2026-05-05 20:00:00', 25.7600000, -80.1900000, '2026-05-06 06:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2423', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (509, 593, '2026-05-05 20:00:00', 25.7600000, -80.1900000, '2026-05-06 04:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.2423', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (510, 594, '2026-05-05 20:00:00', 25.7600000, -80.1900000, '2026-05-06 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242301', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (511, 595, '2026-05-05 20:00:00', 25.7600000, -80.1900000, '2026-05-05 23:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242301', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (512, 596, '2026-05-05 20:00:00', 25.7600000, -80.1900000, '2026-05-06 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242301', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (513, 597, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242301', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (514, 598, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242301', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (556, 640, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 18.00, 225.00, 0.00, 225.00, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883607', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (557, 641, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 25.00, 325.00, 0.00, 325.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242305', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (558, 642, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 25.00, 300.00, 37.50, 337.50, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242305', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (568, 652, '2026-05-21 11:00:00', 25.7600000, -80.1900000, '2026-05-21 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242307', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (550, 634, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 25.00, 312.50, 0.00, 312.50, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883605', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (551, 635, '2026-05-16 08:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 15.50, 25.00, 0.00, 581.25, 581.25, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883606', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (554, 638, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 20.00, 250.00, 0.00, 250.00, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883606', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (555, 639, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 35.00, 437.50, 0.00, 437.50, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883607', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (634, 723, '2026-06-09 02:47:22.692535', 25.8753396, -80.1725536, '2026-06-10 01:52:51.235092', 0.0000000, 0.0000000, 23.09, 18.00, 415.64, 0.00, 415.64, NULL, '2026-06-09 02:47:22.698081', '2026-06-10 01:52:51.250124', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (633, 721, '2026-06-09 02:46:50.099121', 0.0000000, 0.0000000, '2026-06-10 01:04:24.33177', 0.0000000, 0.0000000, 22.29, 20.00, 445.83, 0.00, 445.83, NULL, '2026-06-09 02:46:50.112372', '2026-06-10 01:04:24.349576', NULL, 0.07, false, NULL);
INSERT INTO public.shifts VALUES (559, 643, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 22.00, 286.00, 0.00, 286.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242305', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (617, 701, '2026-06-02 10:00:00', 25.7600000, -80.1900000, '2026-06-02 18:00:00', NULL, NULL, 8.00, 25.00, 200.00, 0.00, 200.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242318', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (618, 702, '2026-06-02 11:00:00', 25.7600000, -80.1900000, '2026-06-02 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242318', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (620, 704, '2026-06-02 11:00:00', 25.7600000, -80.1900000, '2026-06-02 14:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242319', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (619, 703, '2026-06-02 11:00:00', 25.7600000, -80.1900000, '2026-06-02 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242318', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (621, 705, '2026-06-02 11:00:00', 25.7600000, -80.1900000, '2026-06-02 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242319', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (50, 134, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.114791', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (51, 135, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.114791', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (52, 136, '2026-01-04 12:00:00', 25.7600000, -80.1900000, '2026-01-04 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:24:43.114791', NULL, 0.00, false, 4);
INSERT INTO public.shifts VALUES (56, 140, '2026-01-06 14:00:00', 25.7600000, -80.1900000, '2026-01-06 22:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442989', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (57, 141, '2026-01-06 14:00:00', 25.7600000, -80.1900000, '2026-01-06 21:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.44299', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (58, 142, '2026-01-07 16:00:00', 25.7600000, -80.1900000, '2026-01-08 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.44299', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (59, 143, '2026-01-07 16:00:00', 25.7600000, -80.1900000, '2026-01-08 00:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.44299', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (60, 144, '2026-01-07 16:00:00', 25.7600000, -80.1900000, '2026-01-07 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442991', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (61, 145, '2026-01-07 16:00:00', 25.7600000, -80.1900000, '2026-01-07 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442991', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (62, 146, '2026-01-07 16:00:00', 25.7600000, -80.1900000, '2026-01-07 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:31:54.442991', NULL, 0.00, false, 5);
INSERT INTO public.shifts VALUES (73, 157, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333932', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (74, 158, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-10 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333933', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (622, 706, '2026-06-02 11:00:00', 25.7600000, -80.1900000, '2026-06-02 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242319', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (75, 159, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333933', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (76, 160, '2026-01-10 19:00:00', 25.7600000, -80.1900000, '2026-01-11 03:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:33:57.333933', NULL, 0.00, false, 6);
INSERT INTO public.shifts VALUES (529, 613, '2026-05-10 12:00:00', 25.7600000, -80.1900000, '2026-05-10 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883599', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (530, 614, '2026-05-10 12:00:00', 25.7600000, -80.1900000, '2026-05-10 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883599', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (531, 615, '2026-05-10 12:00:00', 25.7600000, -80.1900000, '2026-05-10 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883599', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (532, 616, '2026-05-10 12:00:00', 25.7600000, -80.1900000, '2026-05-10 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.8836', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (533, 617, '2026-05-11 08:00:00', 25.7600000, -80.1900000, '2026-05-11 23:30:00', NULL, NULL, 15.50, 25.00, 0.00, 581.25, 581.25, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.8836', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (534, 618, '2026-05-11 14:00:00', 25.7600000, -80.1900000, '2026-05-11 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883601', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (535, 619, '2026-05-11 14:00:00', 25.7600000, -80.1900000, '2026-05-11 18:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883601', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (536, 620, '2026-05-11 14:00:00', 25.7600000, -80.1900000, '2026-05-11 20:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883601', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (537, 621, '2026-05-11 14:00:00', 25.7600000, -80.1900000, '2026-05-11 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883601', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (538, 622, '2026-05-13 16:00:00', 25.7600000, -80.1900000, '2026-05-14 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883602', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (539, 623, '2026-05-13 16:00:00', 25.7600000, -80.1900000, '2026-05-14 00:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883602', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (540, 624, '2026-05-13 16:00:00', 25.7600000, -80.1900000, '2026-05-13 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883603', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (541, 625, '2026-05-13 16:00:00', 25.7600000, -80.1900000, '2026-05-14 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883603', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (542, 626, '2026-05-13 16:00:00', 25.7600000, -80.1900000, '2026-05-13 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883603', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (623, 707, '2026-06-04 12:30:00', 25.7600000, -80.1900000, '2026-06-04 20:30:00', NULL, NULL, 8.00, 25.00, 200.00, 0.00, 200.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242319', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (624, 708, '2026-06-04 12:00:00', 25.7600000, -80.1900000, '2026-06-04 17:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242319', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (625, 709, '2026-06-04 12:00:00', 25.7600000, -80.1900000, '2026-06-04 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (543, 627, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-14 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883603', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (544, 628, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-14 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883604', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (545, 629, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-15 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883604', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (546, 630, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-14 21:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883604', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (547, 631, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-15 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883604', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (548, 632, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-15 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883605', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (549, 633, '2026-05-14 18:00:00', 25.7600000, -80.1900000, '2026-05-14 22:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883605', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (552, 636, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 20.00, 250.00, 0.00, 250.00, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883606', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (553, 637, '2026-05-16 11:00:00', 25.7600000, -80.1900000, '2026-05-16 23:30:00', NULL, NULL, 12.50, 20.00, 250.00, 0.00, 250.00, 100, '2026-06-08 17:21:04.262791', '2026-06-09 03:36:31.883606', NULL, 0.00, false, 7);
INSERT INTO public.shifts VALUES (635, 803, '2026-06-10 01:10:35.442889', 0.0000000, 0.0000000, NULL, NULL, NULL, NULL, 18.00, NULL, 0.00, NULL, NULL, '2026-06-10 01:10:35.456501', '2026-06-10 01:10:35.456505', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (636, 801, '2026-06-10 01:52:47.797264', 0.0000000, 0.0000000, NULL, NULL, NULL, NULL, 18.00, NULL, 0.00, NULL, NULL, '2026-06-10 01:52:47.808722', '2026-06-10 01:52:47.808729', NULL, 0.00, false, NULL);
INSERT INTO public.shifts VALUES (90, 174, '2026-01-15 11:00:00', 25.7600000, -80.1900000, '2026-01-15 20:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242202', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (91, 175, '2026-01-15 11:00:00', 25.7600000, -80.1900000, '2026-01-15 19:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242203', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (92, 176, '2026-01-15 11:00:00', 25.7600000, -80.1900000, '2026-01-15 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242203', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (93, 177, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242203', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (94, 178, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242203', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (95, 179, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 15:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242203', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (96, 180, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 15:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242204', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (97, 181, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 15:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242204', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (98, 182, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242204', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (99, 183, '2026-01-17 12:00:00', 25.7600000, -80.1900000, '2026-01-17 16:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242204', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (100, 184, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242205', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (101, 185, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 21:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242205', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (102, 186, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 18:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242205', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (103, 187, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 20:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242205', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (104, 188, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242206', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (105, 189, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-19 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242206', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (106, 190, '2026-01-18 14:00:00', 25.7600000, -80.1900000, '2026-01-18 20:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242206', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (107, 191, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-20 23:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242206', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (108, 192, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-21 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242206', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (109, 193, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-20 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242207', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (110, 194, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-21 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242207', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (111, 195, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-20 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242207', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (112, 196, '2026-01-20 16:00:00', 25.7600000, -80.1900000, '2026-01-20 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242207', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (113, 197, '2026-01-21 18:00:00', 25.7600000, -80.1900000, '2026-01-22 02:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242208', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (114, 198, '2026-01-21 18:00:00', 25.7600000, -80.1900000, '2026-01-21 23:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242208', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (115, 199, '2026-01-21 18:00:00', 25.7600000, -80.1900000, '2026-01-22 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242208', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (116, 200, '2026-01-21 18:00:00', 25.7600000, -80.1900000, '2026-01-21 21:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242208', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (117, 201, '2026-01-21 18:00:00', 25.7600000, -80.1900000, '2026-01-22 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242208', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (118, 202, '2026-01-23 19:00:00', 25.7600000, -80.1900000, '2026-01-24 05:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242209', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (119, 203, '2026-01-23 19:00:00', 25.7600000, -80.1900000, '2026-01-24 03:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242209', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (120, 204, '2026-01-23 19:00:00', 25.7600000, -80.1900000, '2026-01-24 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242209', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (121, 205, '2026-01-23 19:00:00', 25.7600000, -80.1900000, '2026-01-24 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242209', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (122, 206, '2026-01-23 19:00:00', 25.7600000, -80.1900000, '2026-01-23 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (123, 207, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (124, 208, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (125, 209, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 05:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (126, 210, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 04:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (127, 211, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242211', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (128, 212, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242211', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (129, 213, '2026-01-25 20:00:00', 25.7600000, -80.1900000, '2026-01-26 04:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242211', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (130, 214, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242211', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (131, 215, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 17:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242211', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (132, 216, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242212', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (133, 217, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242212', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (134, 218, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242212', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (135, 219, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242212', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (136, 220, '2026-01-26 10:00:00', 25.7600000, -80.1900000, '2026-01-26 14:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242213', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (137, 221, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 18:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242213', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (138, 222, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242213', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (139, 223, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 15:45:00', NULL, NULL, 4.75, 22.00, 104.50, 0.00, 104.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242213', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (140, 224, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 17:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242214', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (141, 225, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 18:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242214', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (142, 226, '2026-01-28 11:00:00', 25.7600000, -80.1900000, '2026-01-28 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242214', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (143, 227, '2026-01-29 12:00:00', 25.7600000, -80.1900000, '2026-01-29 20:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242214', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (144, 228, '2026-01-29 12:00:00', 25.7600000, -80.1900000, '2026-01-29 17:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242215', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (145, 229, '2026-01-29 12:00:00', 25.7600000, -80.1900000, '2026-01-29 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242215', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (146, 230, '2026-01-29 12:00:00', 25.7600000, -80.1900000, '2026-01-29 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242215', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (147, 231, '2026-01-29 12:00:00', 25.7600000, -80.1900000, '2026-01-29 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242215', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (148, 232, '2026-01-31 14:00:00', 25.7600000, -80.1900000, '2026-02-01 00:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242216', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (149, 233, '2026-01-31 14:00:00', 25.7600000, -80.1900000, '2026-01-31 22:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242216', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (150, 234, '2026-01-31 14:00:00', 25.7600000, -80.1900000, '2026-01-31 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242216', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (151, 235, '2026-01-31 14:00:00', 25.7600000, -80.1900000, '2026-01-31 17:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242216', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (152, 236, '2026-01-31 14:00:00', 25.7600000, -80.1900000, '2026-01-31 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242216', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (153, 237, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 20:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242217', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (154, 238, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 20:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242217', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (155, 239, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-02 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242219', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (156, 240, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242219', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (157, 241, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (158, 242, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (159, 243, '2026-02-01 16:00:00', 25.7600000, -80.1900000, '2026-02-01 22:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (160, 244, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-03 23:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (161, 245, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 01:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (162, 246, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 03:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (163, 247, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 02:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (164, 248, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242221', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (165, 249, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (166, 250, '2026-02-03 18:00:00', 25.7600000, -80.1900000, '2026-02-04 02:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (167, 251, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-06 02:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (168, 252, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-06 05:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242222', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (169, 253, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-05 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (170, 254, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-05 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (171, 255, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-05 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (172, 256, '2026-02-05 19:00:00', 25.7600000, -80.1900000, '2026-02-06 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (173, 257, '2026-02-06 20:00:00', 25.7600000, -80.1900000, '2026-02-07 04:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (174, 258, '2026-02-06 20:00:00', 25.7600000, -80.1900000, '2026-02-07 01:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (175, 259, '2026-02-06 20:00:00', 25.7600000, -80.1900000, '2026-02-07 00:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (176, 260, '2026-02-06 20:00:00', 25.7600000, -80.1900000, '2026-02-07 02:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (177, 261, '2026-02-06 20:00:00', 25.7600000, -80.1900000, '2026-02-07 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (178, 262, '2026-02-08 10:00:00', 25.7600000, -80.1900000, '2026-02-08 20:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (179, 263, '2026-02-08 10:00:00', 25.7600000, -80.1900000, '2026-02-08 18:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (180, 264, '2026-02-08 10:00:00', 25.7600000, -80.1900000, '2026-02-08 16:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (181, 265, '2026-02-08 10:00:00', 25.7600000, -80.1900000, '2026-02-08 18:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (182, 266, '2026-02-08 10:00:00', 25.7600000, -80.1900000, '2026-02-08 13:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (183, 267, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 15:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (184, 268, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 15:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (185, 269, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (186, 270, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 14:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (187, 271, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (188, 272, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (189, 273, '2026-02-09 11:00:00', 25.7600000, -80.1900000, '2026-02-09 15:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (190, 274, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 17:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (191, 275, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 19:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242228', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (192, 276, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242228', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (193, 277, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242228', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (194, 278, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242228', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (195, 279, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242228', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (196, 280, '2026-02-11 12:00:00', 25.7600000, -80.1900000, '2026-02-11 18:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (197, 281, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-12 21:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (198, 282, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-13 00:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (199, 283, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-12 23:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (200, 284, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-12 22:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (201, 285, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-12 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (202, 286, '2026-02-12 14:00:00', 25.7600000, -80.1900000, '2026-02-13 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (203, 287, '2026-02-14 16:00:00', 25.7600000, -80.1900000, '2026-02-15 00:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (204, 288, '2026-02-14 16:00:00', 25.7600000, -80.1900000, '2026-02-14 21:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (205, 289, '2026-02-14 16:00:00', 25.7600000, -80.1900000, '2026-02-14 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24223', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (206, 290, '2026-02-14 16:00:00', 25.7600000, -80.1900000, '2026-02-14 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (207, 291, '2026-02-14 16:00:00', 25.7600000, -80.1900000, '2026-02-14 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (208, 292, '2026-02-16 18:00:00', 25.7600000, -80.1900000, '2026-02-17 04:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (209, 293, '2026-02-16 18:00:00', 25.7600000, -80.1900000, '2026-02-17 02:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (210, 294, '2026-02-16 18:00:00', 25.7600000, -80.1900000, '2026-02-16 22:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (211, 295, '2026-02-16 18:00:00', 25.7600000, -80.1900000, '2026-02-17 00:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (212, 296, '2026-02-16 18:00:00', 25.7600000, -80.1900000, '2026-02-17 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (213, 297, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-17 23:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (214, 298, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-17 23:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (215, 299, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-18 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242233', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (216, 300, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-18 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242233', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (217, 301, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-17 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242233', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (218, 302, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-18 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242233', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (219, 303, '2026-02-17 19:00:00', 25.7600000, -80.1900000, '2026-02-18 03:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242233', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (220, 304, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 01:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242234', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (221, 305, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 03:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242234', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (222, 306, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 03:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242234', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (223, 307, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-19 23:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242234', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (224, 308, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 03:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242235', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (225, 309, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242235', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (226, 310, '2026-02-19 20:00:00', 25.7600000, -80.1900000, '2026-02-20 00:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242235', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (227, 311, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 17:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242235', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (228, 312, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 20:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242236', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (229, 313, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242236', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (230, 314, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242236', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (231, 315, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242236', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (232, 316, '2026-02-20 10:00:00', 25.7600000, -80.1900000, '2026-02-20 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242236', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (233, 317, '2026-02-22 11:00:00', 25.7600000, -80.1900000, '2026-02-22 19:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242237', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (234, 318, '2026-02-22 11:00:00', 25.7600000, -80.1900000, '2026-02-22 16:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242237', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (235, 319, '2026-02-22 11:00:00', 25.7600000, -80.1900000, '2026-02-22 20:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242237', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (236, 320, '2026-02-22 11:00:00', 25.7600000, -80.1900000, '2026-02-22 19:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242237', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (237, 321, '2026-02-22 11:00:00', 25.7600000, -80.1900000, '2026-02-22 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242237', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (238, 322, '2026-02-23 12:00:00', 25.7600000, -80.1900000, '2026-02-23 22:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242238', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (239, 323, '2026-02-23 12:00:00', 25.7600000, -80.1900000, '2026-02-23 20:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242238', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (240, 324, '2026-02-23 12:00:00', 25.7600000, -80.1900000, '2026-02-23 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242238', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (241, 325, '2026-02-23 12:00:00', 25.7600000, -80.1900000, '2026-02-23 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242238', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (242, 326, '2026-02-23 12:00:00', 25.7600000, -80.1900000, '2026-02-23 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242238', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (243, 327, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 18:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242239', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (244, 328, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 18:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242239', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (245, 329, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 18:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242239', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (246, 330, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 20:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242239', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (247, 331, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242239', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (248, 332, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-26 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (249, 333, '2026-02-25 14:00:00', 25.7600000, -80.1900000, '2026-02-25 20:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (250, 334, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-27 21:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (251, 335, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-27 23:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24224', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (252, 336, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-27 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242241', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (253, 337, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-28 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242241', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (254, 338, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-27 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242241', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (255, 339, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-27 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242241', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (256, 340, '2026-02-27 16:00:00', 25.7600000, -80.1900000, '2026-02-28 00:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242241', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (257, 341, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-03-01 01:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242242', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (258, 342, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-03-01 04:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242242', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (259, 343, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-03-01 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242242', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (260, 344, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-02-28 21:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242242', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (261, 345, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-03-01 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242242', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (262, 346, '2026-02-28 18:00:00', 25.7600000, -80.1900000, '2026-03-01 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242243', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (263, 347, '2026-03-02 19:00:00', 25.7600000, -80.1900000, '2026-03-03 03:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242243', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (264, 348, '2026-03-02 19:00:00', 25.7600000, -80.1900000, '2026-03-03 00:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242243', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (265, 349, '2026-03-02 19:00:00', 25.7600000, -80.1900000, '2026-03-03 03:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242243', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (266, 350, '2026-03-02 19:00:00', 25.7600000, -80.1900000, '2026-03-03 01:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242243', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (267, 351, '2026-03-02 19:00:00', 25.7600000, -80.1900000, '2026-03-02 22:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242244', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (268, 352, '2026-03-03 20:00:00', 25.7600000, -80.1900000, '2026-03-04 06:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242244', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (269, 353, '2026-03-03 20:00:00', 25.7600000, -80.1900000, '2026-03-04 04:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242244', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (270, 354, '2026-03-03 20:00:00', 25.7600000, -80.1900000, '2026-03-04 05:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242244', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (271, 355, '2026-03-03 20:00:00', 25.7600000, -80.1900000, '2026-03-04 04:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242244', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (272, 356, '2026-03-03 20:00:00', 25.7600000, -80.1900000, '2026-03-04 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242245', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (273, 357, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242245', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (274, 358, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 14:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242245', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (275, 359, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242245', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (276, 360, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242245', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (277, 361, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242246', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (278, 362, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242246', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (279, 363, '2026-03-05 10:00:00', 25.7600000, -80.1900000, '2026-03-05 14:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242246', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (280, 364, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 16:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242246', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (281, 365, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 18:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242247', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (282, 366, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 15:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242247', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (283, 367, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 17:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242247', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (284, 368, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242247', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (285, 369, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242247', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (286, 370, '2026-03-06 11:00:00', 25.7600000, -80.1900000, '2026-03-06 17:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242248', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (287, 371, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 19:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242248', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (288, 372, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 22:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242248', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (289, 373, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242248', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (290, 374, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242248', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (291, 375, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242249', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (292, 376, '2026-03-08 12:00:00', 25.7600000, -80.1900000, '2026-03-08 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242249', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (293, 377, '2026-03-10 14:00:00', 25.7600000, -80.1900000, '2026-03-10 22:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242249', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (294, 378, '2026-03-10 14:00:00', 25.7600000, -80.1900000, '2026-03-10 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242249', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (295, 379, '2026-03-10 14:00:00', 25.7600000, -80.1900000, '2026-03-10 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242249', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (296, 380, '2026-03-10 14:00:00', 25.7600000, -80.1900000, '2026-03-10 17:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (297, 381, '2026-03-10 14:00:00', 25.7600000, -80.1900000, '2026-03-10 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (298, 382, '2026-03-11 16:00:00', 25.7600000, -80.1900000, '2026-03-12 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24225', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (299, 383, '2026-03-11 16:00:00', 25.7600000, -80.1900000, '2026-03-12 00:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242251', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (300, 384, '2026-03-11 16:00:00', 25.7600000, -80.1900000, '2026-03-12 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242251', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (301, 385, '2026-03-11 16:00:00', 25.7600000, -80.1900000, '2026-03-11 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242251', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (302, 386, '2026-03-11 16:00:00', 25.7600000, -80.1900000, '2026-03-11 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242251', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (303, 387, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-13 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242252', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (304, 388, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-13 22:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242252', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (305, 389, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-14 03:45:00', NULL, NULL, 9.75, 22.00, 214.50, 0.00, 214.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242252', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (306, 390, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-14 02:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242252', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (307, 391, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-14 01:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242252', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (308, 392, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-14 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242253', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (309, 393, '2026-03-13 18:00:00', 25.7600000, -80.1900000, '2026-03-14 02:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242253', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (310, 394, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-15 00:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242253', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (311, 395, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-15 02:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242253', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (312, 396, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-14 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242253', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (313, 397, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-14 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242254', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (314, 398, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-14 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242254', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (315, 399, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-15 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242254', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (316, 400, '2026-03-14 19:00:00', 25.7600000, -80.1900000, '2026-03-14 23:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242254', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (317, 401, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 03:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242254', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (318, 402, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 06:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242255', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (319, 403, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 00:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242255', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (320, 404, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 02:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242255', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (321, 405, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242255', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (322, 406, '2026-03-16 20:00:00', 25.7600000, -80.1900000, '2026-03-17 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242256', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (323, 407, '2026-03-17 10:00:00', 25.7600000, -80.1900000, '2026-03-17 18:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242256', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (324, 408, '2026-03-17 10:00:00', 25.7600000, -80.1900000, '2026-03-17 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242256', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (325, 409, '2026-03-17 10:00:00', 25.7600000, -80.1900000, '2026-03-17 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242256', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (326, 410, '2026-03-17 10:00:00', 25.7600000, -80.1900000, '2026-03-17 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242256', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (327, 411, '2026-03-17 10:00:00', 25.7600000, -80.1900000, '2026-03-17 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242257', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (328, 412, '2026-03-19 11:00:00', 25.7600000, -80.1900000, '2026-03-19 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242257', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (329, 413, '2026-03-19 11:00:00', 25.7600000, -80.1900000, '2026-03-19 19:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242257', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (330, 414, '2026-03-19 11:00:00', 25.7600000, -80.1900000, '2026-03-19 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242257', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (331, 415, '2026-03-19 11:00:00', 25.7600000, -80.1900000, '2026-03-19 14:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242257', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (332, 416, '2026-03-19 11:00:00', 25.7600000, -80.1900000, '2026-03-19 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242258', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (333, 417, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242258', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (334, 418, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242258', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (335, 419, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242258', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (336, 420, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242258', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (337, 421, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242259', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (338, 422, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242259', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (339, 423, '2026-03-21 12:00:00', 25.7600000, -80.1900000, '2026-03-21 18:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242259', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (340, 424, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242259', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (341, 425, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 21:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242259', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (342, 426, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 23:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (343, 427, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 22:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (344, 428, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (345, 429, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-23 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (346, 430, '2026-03-22 14:00:00', 25.7600000, -80.1900000, '2026-03-22 22:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24226', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (347, 431, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-24 23:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242261', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (348, 432, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-25 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242261', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (349, 433, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-24 19:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242261', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (350, 434, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-24 19:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242261', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (351, 435, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-24 19:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242262', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (352, 436, '2026-03-24 16:00:00', 25.7600000, -80.1900000, '2026-03-24 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242262', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (353, 437, '2026-03-25 18:00:00', 25.7600000, -80.1900000, '2026-03-26 02:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242262', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (354, 438, '2026-03-25 18:00:00', 25.7600000, -80.1900000, '2026-03-25 23:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242262', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (355, 439, '2026-03-25 18:00:00', 25.7600000, -80.1900000, '2026-03-25 22:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242262', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (356, 440, '2026-03-25 18:00:00', 25.7600000, -80.1900000, '2026-03-26 00:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242263', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (357, 441, '2026-03-25 18:00:00', 25.7600000, -80.1900000, '2026-03-26 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242263', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (358, 442, '2026-03-27 19:00:00', 25.7600000, -80.1900000, '2026-03-28 05:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242263', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (359, 443, '2026-03-27 19:00:00', 25.7600000, -80.1900000, '2026-03-28 03:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242263', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (360, 444, '2026-03-27 19:00:00', 25.7600000, -80.1900000, '2026-03-28 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242263', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (361, 445, '2026-03-27 19:00:00', 25.7600000, -80.1900000, '2026-03-28 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242264', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (362, 446, '2026-03-27 19:00:00', 25.7600000, -80.1900000, '2026-03-27 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242264', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (363, 447, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242264', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (364, 448, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242264', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (365, 449, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242265', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (366, 450, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-28 23:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242265', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (367, 451, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242265', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (368, 452, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242265', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (369, 453, '2026-03-28 20:00:00', 25.7600000, -80.1900000, '2026-03-29 00:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242265', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (370, 454, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242266', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (371, 455, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 17:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242266', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (372, 456, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242266', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (373, 457, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242266', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (374, 458, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242266', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (375, 459, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242267', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (376, 460, '2026-03-30 10:00:00', 25.7600000, -80.1900000, '2026-03-30 16:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242267', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (377, 461, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 18:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242267', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (378, 462, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 21:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242267', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (379, 463, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 20:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242267', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (380, 464, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 19:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242268', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (381, 465, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242268', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (382, 466, '2026-03-31 11:00:00', 25.7600000, -80.1900000, '2026-03-31 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242268', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (383, 467, '2026-04-02 12:00:00', 25.7600000, -80.1900000, '2026-04-02 20:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242268', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (384, 468, '2026-04-02 12:00:00', 25.7600000, -80.1900000, '2026-04-02 17:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242268', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (385, 469, '2026-04-02 12:00:00', 25.7600000, -80.1900000, '2026-04-02 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242269', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (386, 470, '2026-04-02 12:00:00', 25.7600000, -80.1900000, '2026-04-02 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242269', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (387, 471, '2026-04-02 12:00:00', 25.7600000, -80.1900000, '2026-04-02 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242269', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (388, 472, '2026-04-04 14:00:00', 25.7600000, -80.1900000, '2026-04-05 00:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242269', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (389, 473, '2026-04-04 14:00:00', 25.7600000, -80.1900000, '2026-04-04 22:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242269', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (390, 474, '2026-04-04 14:00:00', 25.7600000, -80.1900000, '2026-04-04 18:45:00', NULL, NULL, 4.75, 22.00, 104.50, 0.00, 104.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (391, 475, '2026-04-04 14:00:00', 25.7600000, -80.1900000, '2026-04-04 20:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (392, 476, '2026-04-04 14:00:00', 25.7600000, -80.1900000, '2026-04-04 21:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (393, 477, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-05 20:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24227', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (394, 478, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-05 20:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242271', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (395, 479, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-05 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242271', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (396, 480, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-06 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242271', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (397, 481, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-05 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242271', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (398, 482, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-05 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242271', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (399, 483, '2026-04-05 16:00:00', 25.7600000, -80.1900000, '2026-04-06 00:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242272', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (400, 484, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-07 23:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242272', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (401, 485, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-08 01:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242272', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (402, 486, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-08 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242272', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (403, 487, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-07 21:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242272', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (404, 488, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-08 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242273', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (405, 489, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-08 01:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242273', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (406, 490, '2026-04-07 18:00:00', 25.7600000, -80.1900000, '2026-04-07 22:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242273', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (407, 491, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-09 02:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242273', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (408, 492, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-09 05:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242273', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (409, 493, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-09 03:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242274', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (410, 494, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-09 01:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242274', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (411, 495, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-08 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242274', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (412, 496, '2026-04-08 19:00:00', 25.7600000, -80.1900000, '2026-04-09 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242274', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (413, 497, '2026-04-10 20:00:00', 25.7600000, -80.1900000, '2026-04-11 04:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242275', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (414, 498, '2026-04-10 20:00:00', 25.7600000, -80.1900000, '2026-04-11 01:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242275', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (415, 499, '2026-04-10 20:00:00', 25.7600000, -80.1900000, '2026-04-11 05:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242275', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (416, 500, '2026-04-10 20:00:00', 25.7600000, -80.1900000, '2026-04-11 04:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242275', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (417, 501, '2026-04-10 20:00:00', 25.7600000, -80.1900000, '2026-04-11 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242275', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (418, 502, '2026-04-11 10:00:00', 25.7600000, -80.1900000, '2026-04-11 20:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242276', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (419, 503, '2026-04-11 10:00:00', 25.7600000, -80.1900000, '2026-04-11 18:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242276', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (420, 504, '2026-04-11 10:00:00', 25.7600000, -80.1900000, '2026-04-11 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242276', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (421, 505, '2026-04-11 10:00:00', 25.7600000, -80.1900000, '2026-04-11 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242276', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (422, 506, '2026-04-11 10:00:00', 25.7600000, -80.1900000, '2026-04-11 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242276', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (423, 507, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 15:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242277', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (424, 508, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 15:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242277', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (425, 509, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 15:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242277', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (426, 510, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 17:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242277', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (427, 511, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242278', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (428, 512, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242278', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (429, 513, '2026-04-13 11:00:00', 25.7600000, -80.1900000, '2026-04-13 17:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242278', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (430, 514, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 17:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242278', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (431, 515, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 19:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242278', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (432, 516, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 18:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242279', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (433, 517, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 20:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242279', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (434, 518, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 15:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242279', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (435, 519, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242285', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (436, 520, '2026-04-15 12:00:00', 25.7600000, -80.1900000, '2026-04-15 20:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242285', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (437, 521, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-16 21:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242285', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (438, 522, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-17 00:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242285', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (439, 523, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-16 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242286', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (440, 524, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-16 17:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242286', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (441, 525, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-16 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242286', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (442, 526, '2026-04-16 14:00:00', 25.7600000, -80.1900000, '2026-04-17 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242286', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (443, 527, '2026-04-18 16:00:00', 25.7600000, -80.1900000, '2026-04-19 00:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242286', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (444, 528, '2026-04-18 16:00:00', 25.7600000, -80.1900000, '2026-04-18 21:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242287', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (445, 529, '2026-04-18 16:00:00', 25.7600000, -80.1900000, '2026-04-19 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242287', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (446, 530, '2026-04-18 16:00:00', 25.7600000, -80.1900000, '2026-04-18 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242287', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (447, 531, '2026-04-18 16:00:00', 25.7600000, -80.1900000, '2026-04-18 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242287', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (448, 532, '2026-04-19 18:00:00', 25.7600000, -80.1900000, '2026-04-20 04:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242287', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (449, 533, '2026-04-19 18:00:00', 25.7600000, -80.1900000, '2026-04-20 02:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242288', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (450, 534, '2026-04-19 18:00:00', 25.7600000, -80.1900000, '2026-04-20 03:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242288', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (451, 535, '2026-04-19 18:00:00', 25.7600000, -80.1900000, '2026-04-20 02:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242288', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (452, 536, '2026-04-19 18:00:00', 25.7600000, -80.1900000, '2026-04-20 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242288', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (453, 537, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 23:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242288', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (454, 538, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 23:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242289', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (455, 539, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242289', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (456, 540, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242289', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (457, 541, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 22:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242289', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (458, 542, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-22 04:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242289', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (459, 543, '2026-04-21 19:00:00', 25.7600000, -80.1900000, '2026-04-21 23:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (460, 544, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 01:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (461, 545, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 03:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (462, 546, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 00:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24229', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (463, 547, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 02:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242291', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (464, 548, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242291', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (465, 549, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242291', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (466, 550, '2026-04-22 20:00:00', 25.7600000, -80.1900000, '2026-04-23 02:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242291', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (467, 551, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 17:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242291', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (468, 552, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 20:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242292', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (469, 553, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242292', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (470, 554, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242292', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (471, 555, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242292', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (472, 556, '2026-04-24 10:00:00', 25.7600000, -80.1900000, '2026-04-24 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242293', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (473, 557, '2026-04-26 11:00:00', 25.7600000, -80.1900000, '2026-04-26 19:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242293', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (474, 558, '2026-04-26 11:00:00', 25.7600000, -80.1900000, '2026-04-26 16:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242293', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (475, 559, '2026-04-26 11:00:00', 25.7600000, -80.1900000, '2026-04-26 18:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242293', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (476, 560, '2026-04-26 11:00:00', 25.7600000, -80.1900000, '2026-04-26 14:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242293', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (477, 561, '2026-04-26 11:00:00', 25.7600000, -80.1900000, '2026-04-26 18:15:00', NULL, NULL, 7.25, 22.00, 159.50, 0.00, 159.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242294', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (478, 562, '2026-04-27 12:00:00', 25.7600000, -80.1900000, '2026-04-27 22:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242294', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (479, 563, '2026-04-27 12:00:00', 25.7600000, -80.1900000, '2026-04-27 20:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242294', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (480, 564, '2026-04-27 12:00:00', 25.7600000, -80.1900000, '2026-04-27 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242294', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (481, 565, '2026-04-27 12:00:00', 25.7600000, -80.1900000, '2026-04-27 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242294', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (482, 566, '2026-04-27 12:00:00', 25.7600000, -80.1900000, '2026-04-27 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242295', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (483, 567, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 18:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242295', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (484, 568, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 18:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242295', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (485, 569, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 23:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242295', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (486, 570, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 22:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242295', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (487, 571, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242296', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (488, 572, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-30 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242296', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (489, 573, '2026-04-29 14:00:00', 25.7600000, -80.1900000, '2026-04-29 22:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242296', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (490, 574, '2026-04-30 16:00:00', 25.7600000, -80.1900000, '2026-04-30 21:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242296', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (515, 599, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 18:30:00', NULL, NULL, 8.50, 22.00, 187.00, 0.00, 187.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242302', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (516, 600, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 16:00:00', NULL, NULL, 6.00, 22.00, 132.00, 0.00, 132.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242302', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (517, 601, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 13:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242302', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (518, 602, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242302', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (519, 603, '2026-05-07 10:00:00', 25.7600000, -80.1900000, '2026-05-07 16:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242303', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (520, 604, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 16:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242303', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (521, 605, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 18:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242304', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (522, 606, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 20:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242304', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (523, 607, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 19:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242304', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (524, 608, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242304', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (525, 609, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 18:00:00', NULL, NULL, 7.00, 35.00, 245.00, 0.00, 245.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242304', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (526, 610, '2026-05-08 11:00:00', 25.7600000, -80.1900000, '2026-05-08 19:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242305', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (560, 644, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 22.00, 286.00, 0.00, 286.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242306', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (561, 645, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 22.00, 286.00, 0.00, 286.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242306', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (562, 646, '2026-05-18 10:30:00', 25.7600000, -80.1900000, '2026-05-18 23:30:00', NULL, NULL, 13.00, 35.00, 455.00, 0.00, 455.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242306', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (563, 647, '2026-05-19 10:00:00', 25.7600000, -80.1900000, '2026-05-19 18:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242306', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (564, 648, '2026-05-19 10:00:00', 25.7600000, -80.1900000, '2026-05-19 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242306', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (565, 649, '2026-05-19 10:00:00', 25.7600000, -80.1900000, '2026-05-19 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242307', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (566, 650, '2026-05-19 10:00:00', 25.7600000, -80.1900000, '2026-05-19 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242307', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (567, 651, '2026-05-19 10:00:00', 25.7600000, -80.1900000, '2026-05-19 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242307', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (569, 653, '2026-05-21 11:00:00', 25.7600000, -80.1900000, '2026-05-21 19:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242307', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (570, 654, '2026-05-21 11:00:00', 25.7600000, -80.1900000, '2026-05-21 15:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242308', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (571, 655, '2026-05-21 11:00:00', 25.7600000, -80.1900000, '2026-05-21 17:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242308', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (572, 656, '2026-05-21 11:00:00', 25.7600000, -80.1900000, '2026-05-21 18:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242308', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (573, 657, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242308', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (574, 658, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 16:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242308', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (575, 659, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242309', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (576, 660, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 20:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242309', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (577, 661, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242309', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (578, 662, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 21:00:00', NULL, NULL, 9.00, 35.00, 315.00, 0.00, 315.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242309', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (579, 663, '2026-05-22 12:00:00', 25.7600000, -80.1900000, '2026-05-22 20:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242309', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (580, 664, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 19:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (581, 665, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 21:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (582, 666, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (583, 667, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 17:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (584, 668, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 21:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24231', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (585, 669, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-25 01:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242311', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (586, 670, '2026-05-24 14:00:00', 25.7600000, -80.1900000, '2026-05-24 18:00:00', NULL, NULL, 4.00, 18.00, 72.00, 0.00, 72.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242311', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (587, 671, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-25 23:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242311', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (588, 672, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-26 02:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242311', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (589, 673, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-26 00:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242312', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (590, 674, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-25 22:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242312', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (591, 675, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-25 19:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242312', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (592, 676, '2026-05-25 16:00:00', 25.7600000, -80.1900000, '2026-05-25 21:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242312', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (593, 677, '2026-05-27 18:00:00', 25.7600000, -80.1900000, '2026-05-28 02:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242312', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (594, 678, '2026-05-27 18:00:00', 25.7600000, -80.1900000, '2026-05-27 23:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242313', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (595, 679, '2026-05-27 18:00:00', 25.7600000, -80.1900000, '2026-05-28 03:45:00', NULL, NULL, 9.75, 20.00, 195.00, 0.00, 195.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242313', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (596, 680, '2026-05-27 18:00:00', 25.7600000, -80.1900000, '2026-05-28 02:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242313', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (597, 681, '2026-05-27 18:00:00', 25.7600000, -80.1900000, '2026-05-28 01:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242313', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (598, 682, '2026-05-29 19:00:00', 25.7600000, -80.1900000, '2026-05-30 05:00:00', NULL, NULL, 10.00, 25.00, 250.00, 0.00, 250.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242313', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (599, 683, '2026-05-29 19:00:00', 25.7600000, -80.1900000, '2026-05-30 03:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242314', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (600, 684, '2026-05-29 19:00:00', 25.7600000, -80.1900000, '2026-05-29 22:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242314', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (601, 685, '2026-05-29 19:00:00', 25.7600000, -80.1900000, '2026-05-29 22:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242314', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (602, 686, '2026-05-29 19:00:00', 25.7600000, -80.1900000, '2026-05-29 22:30:00', NULL, NULL, 3.50, 22.00, 77.00, 0.00, 77.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242314', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (603, 687, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242314', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (604, 688, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 00:00:00', NULL, NULL, 4.00, 28.00, 112.00, 0.00, 112.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242315', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (605, 689, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 00:45:00', NULL, NULL, 4.75, 20.00, 95.00, 0.00, 95.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242315', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (606, 690, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 02:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242315', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (607, 691, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 03:15:00', NULL, NULL, 7.25, 20.00, 145.00, 0.00, 145.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242315', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (608, 692, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 07:00:00', NULL, NULL, 11.00, 35.00, 385.00, 0.00, 385.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242315', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (609, 693, '2026-05-30 20:00:00', 25.7600000, -80.1900000, '2026-05-31 02:00:00', NULL, NULL, 6.00, 18.00, 108.00, 0.00, 108.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242316', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (610, 694, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 15:30:00', NULL, NULL, 5.50, 25.00, 137.50, 0.00, 137.50, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242316', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (611, 695, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 17:00:00', NULL, NULL, 7.00, 25.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242316', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (612, 696, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 16:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242317', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (613, 697, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 18:30:00', NULL, NULL, 8.50, 20.00, 170.00, 0.00, 170.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242317', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (614, 698, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 13:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242317', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (615, 699, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 15:00:00', NULL, NULL, 5.00, 35.00, 175.00, 0.00, 175.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242317', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (616, 700, '2026-06-01 10:00:00', 25.7600000, -80.1900000, '2026-06-01 18:00:00', NULL, NULL, 8.00, 18.00, 144.00, 0.00, 144.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242318', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (626, 710, '2026-06-04 12:00:00', 25.7600000, -80.1900000, '2026-06-04 18:00:00', NULL, NULL, 6.00, 20.00, 120.00, 0.00, 120.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (627, 711, '2026-06-04 12:00:00', 25.7600000, -80.1900000, '2026-06-04 15:30:00', NULL, NULL, 3.50, 20.00, 70.00, 0.00, 70.00, NULL, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (628, 712, '2026-06-05 15:00:00', 25.7600000, -80.1900000, '2026-06-06 00:00:00', NULL, NULL, 9.00, 25.00, 225.00, 0.00, 225.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (629, 713, '2026-06-05 14:00:00', 25.7600000, -80.1900000, '2026-06-05 22:30:00', NULL, NULL, 8.50, 25.00, 212.50, 0.00, 212.50, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.24232', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (630, 714, '2026-06-05 15:00:00', 25.7600000, -80.1900000, '2026-06-05 23:45:00', NULL, NULL, 8.75, 20.00, 175.00, 0.00, 175.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242321', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (631, 715, '2026-06-05 15:00:00', 25.7600000, -80.1900000, '2026-06-05 22:30:00', NULL, NULL, 7.50, 20.00, 150.00, 0.00, 150.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242321', NULL, 0.00, false, 8);
INSERT INTO public.shifts VALUES (632, 716, '2026-06-05 16:00:00', 25.7600000, -80.1900000, '2026-06-05 21:15:00', NULL, NULL, 5.25, 20.00, 105.00, 0.00, 105.00, 100, '2026-06-08 17:21:04.262791', '2026-06-16 22:14:09.242321', NULL, 0.00, false, 8);


--
-- Data for Name: payroll_settlement_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payroll_settlement_items VALUES (1, 1, 9, 10, '2026-05-20', '2026-05-26', 3.00, 20.00, 3.00, 0.00, 60.00, 0.00, 60.00);
INSERT INTO public.payroll_settlement_items VALUES (2, 1, 9, 7, '2026-05-20', '2026-05-26', 23.40, 20.00, 23.40, 0.00, 468.00, 0.00, 468.00);
INSERT INTO public.payroll_settlement_items VALUES (3, 1, 9, 1, '2026-05-13', '2026-05-19', 5.00, 20.00, 5.00, 0.00, 100.00, 0.00, 100.00);
INSERT INTO public.payroll_settlement_items VALUES (4, 1, 8, 11, '2026-05-20', '2026-05-26', 16.04, 18.00, 14.96, 1.08, 269.28, 29.16, 298.44);
INSERT INTO public.payroll_settlement_items VALUES (5, 1, 8, 8, '2026-05-20', '2026-05-26', 23.86, 20.00, 22.25, 1.61, 445.00, 48.30, 493.30);
INSERT INTO public.payroll_settlement_items VALUES (6, 1, 8, 14, '2026-05-20', '2026-05-26', 3.00, 20.00, 2.80, 0.20, 56.00, 6.00, 62.00);
INSERT INTO public.payroll_settlement_items VALUES (7, 1, 8, 3, '2026-05-13', '2026-05-19', 0.37, 20.00, 0.37, 0.00, 7.40, 0.00, 7.40);
INSERT INTO public.payroll_settlement_items VALUES (8, 1, 8, 5, '2026-05-13', '2026-05-19', 2.00, 20.00, 2.00, 0.00, 40.00, 0.00, 40.00);
INSERT INTO public.payroll_settlement_items VALUES (9, 1, 14, 13, '2026-05-20', '2026-05-26', 4.00, 20.00, 4.00, 0.00, 80.00, 0.00, 80.00);
INSERT INTO public.payroll_settlement_items VALUES (10, 1, 14, 15, '2026-05-20', '2026-05-26', 4.00, 20.00, 4.00, 0.00, 80.00, 0.00, 80.00);
INSERT INTO public.payroll_settlement_items VALUES (11, 1, 10, 12, '2026-05-20', '2026-05-26', 7.96, 20.00, 7.96, 0.00, 159.20, 0.00, 159.20);
INSERT INTO public.payroll_settlement_items VALUES (12, 1, 10, 6, '2026-05-20', '2026-05-26', 2.91, 20.00, 2.91, 0.00, 58.20, 0.00, 58.20);
INSERT INTO public.payroll_settlement_items VALUES (13, 1, 10, 9, '2026-05-20', '2026-05-26', 4.23, 20.00, 4.23, 0.00, 84.60, 0.00, 84.60);
INSERT INTO public.payroll_settlement_items VALUES (14, 1, 10, 2, '2026-05-13', '2026-05-19', 4.00, 23.00, 4.00, 0.00, 92.00, 0.00, 92.00);
INSERT INTO public.payroll_settlement_items VALUES (15, 1, 11, 4, '2026-05-13', '2026-05-19', 2.00, 18.00, 2.00, 0.00, 36.00, 0.00, 36.00);
INSERT INTO public.payroll_settlement_items VALUES (16, 2, 103, 34, '2025-12-28', '2026-01-03', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (17, 2, 102, 33, '2025-12-28', '2026-01-03', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (18, 2, 112, 37, '2025-12-28', '2026-01-03', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (19, 2, 111, 36, '2025-12-28', '2026-01-03', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (20, 2, 110, 35, '2025-12-28', '2026-01-03', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (21, 2, 119, 38, '2025-12-28', '2026-01-03', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (22, 2, 123, 39, '2025-12-28', '2026-01-03', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (23, 3, 104, 41, '2025-12-28', '2026-01-03', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (24, 3, 103, 40, '2025-12-28', '2026-01-03', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (25, 3, 113, 44, '2025-12-28', '2026-01-03', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (26, 3, 112, 43, '2025-12-28', '2026-01-03', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (27, 3, 111, 42, '2025-12-28', '2026-01-03', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (28, 3, 120, 45, '2025-12-28', '2026-01-03', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (29, 3, 124, 46, '2025-12-28', '2026-01-03', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (30, 4, 101, 48, '2026-01-04', '2026-01-10', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (31, 4, 104, 47, '2026-01-04', '2026-01-10', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (32, 4, 114, 51, '2026-01-04', '2026-01-10', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (33, 4, 113, 50, '2026-01-04', '2026-01-10', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (34, 4, 112, 49, '2026-01-04', '2026-01-10', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (35, 4, 121, 52, '2026-01-04', '2026-01-10', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (36, 5, 103, 59, '2026-01-04', '2026-01-10', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (37, 5, 102, 58, '2026-01-04', '2026-01-10', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (38, 5, 102, 54, '2026-01-04', '2026-01-10', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (39, 5, 116, 62, '2026-01-04', '2026-01-10', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (40, 5, 115, 61, '2026-01-04', '2026-01-10', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (41, 5, 115, 57, '2026-01-04', '2026-01-10', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (42, 5, 114, 60, '2026-01-04', '2026-01-10', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (43, 5, 114, 56, '2026-01-04', '2026-01-10', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (44, 5, 101, 53, '2026-01-04', '2026-01-10', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (45, 5, 113, 55, '2026-01-04', '2026-01-10', 9.75, 22.00, 9.75, 0.00, 214.50, 0.00, 214.50);
INSERT INTO public.payroll_settlement_items VALUES (46, 6, 104, 64, '2026-01-04', '2026-01-10', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (47, 6, 104, 70, '2026-01-04', '2026-01-10', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (48, 6, 103, 63, '2026-01-04', '2026-01-10', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (49, 6, 109, 67, '2026-01-04', '2026-01-10', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (50, 6, 109, 73, '2026-01-04', '2026-01-10', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (51, 6, 116, 66, '2026-01-04', '2026-01-10', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (52, 6, 116, 72, '2026-01-04', '2026-01-10', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (53, 6, 115, 65, '2026-01-04', '2026-01-10', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (54, 6, 118, 68, '2026-01-04', '2026-01-10', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (55, 6, 124, 69, '2026-01-04', '2026-01-10', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (56, 6, 101, 71, '2026-01-04', '2026-01-10', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (57, 6, 110, 74, '2026-01-04', '2026-01-10', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (58, 6, 119, 75, '2026-01-04', '2026-01-10', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (59, 6, 125, 76, '2026-01-04', '2026-01-10', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (60, 7, 101, 528, '2026-05-10', '2026-05-16', 15.00, 25.00, 15.00, 0.00, 375.00, 0.00, 375.00);
INSERT INTO public.payroll_settlement_items VALUES (61, 7, 101, 533, '2026-05-10', '2026-05-16', 15.50, 25.00, 15.50, 0.00, 387.50, 0.00, 387.50);
INSERT INTO public.payroll_settlement_items VALUES (62, 7, 101, 551, '2026-05-10', '2026-05-16', 15.50, 25.00, 9.50, 6.00, 237.50, 225.00, 462.50);
INSERT INTO public.payroll_settlement_items VALUES (63, 7, 104, 527, '2026-05-10', '2026-05-16', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (64, 7, 104, 550, '2026-05-10', '2026-05-16', 12.50, 25.00, 12.50, 0.00, 312.50, 0.00, 312.50);
INSERT INTO public.payroll_settlement_items VALUES (65, 7, 104, 544, '2026-05-10', '2026-05-16', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (66, 7, 114, 531, '2026-05-10', '2026-05-16', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (67, 7, 114, 536, '2026-05-10', '2026-05-16', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (68, 7, 114, 540, '2026-05-10', '2026-05-16', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (69, 7, 113, 530, '2026-05-10', '2026-05-16', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (70, 7, 113, 535, '2026-05-10', '2026-05-16', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (71, 7, 112, 529, '2026-05-10', '2026-05-16', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (72, 7, 117, 532, '2026-05-10', '2026-05-16', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (73, 7, 102, 534, '2026-05-10', '2026-05-16', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (74, 7, 102, 538, '2026-05-10', '2026-05-16', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (75, 7, 115, 537, '2026-05-10', '2026-05-16', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (76, 7, 115, 541, '2026-05-10', '2026-05-16', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (77, 7, 115, 545, '2026-05-10', '2026-05-16', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (78, 7, 103, 539, '2026-05-10', '2026-05-16', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (79, 7, 103, 543, '2026-05-10', '2026-05-16', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (80, 7, 116, 542, '2026-05-10', '2026-05-16', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (81, 7, 116, 552, '2026-05-10', '2026-05-16', 12.50, 20.00, 12.50, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (82, 7, 116, 546, '2026-05-10', '2026-05-16', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (83, 7, 110, 554, '2026-05-10', '2026-05-16', 12.50, 20.00, 12.50, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (84, 7, 109, 553, '2026-05-10', '2026-05-16', 12.50, 20.00, 12.50, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (85, 7, 109, 547, '2026-05-10', '2026-05-16', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (86, 7, 121, 555, '2026-05-10', '2026-05-16', 12.50, 35.00, 12.50, 0.00, 437.50, 0.00, 437.50);
INSERT INTO public.payroll_settlement_items VALUES (87, 7, 125, 556, '2026-05-10', '2026-05-16', 12.50, 18.00, 12.50, 0.00, 225.00, 0.00, 225.00);
INSERT INTO public.payroll_settlement_items VALUES (88, 7, 120, 548, '2026-05-10', '2026-05-16', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (89, 7, 124, 549, '2026-05-10', '2026-05-16', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (90, 8, 101, 628, '2026-05-31', '2026-06-06', 9.00, 25.00, 9.00, 0.00, 225.00, 0.00, 225.00);
INSERT INTO public.payroll_settlement_items VALUES (91, 8, 101, 624, '2026-05-31', '2026-06-06', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (92, 8, 102, 629, '2026-05-31', '2026-06-06', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (93, 8, 102, 610, '2026-05-31', '2026-06-06', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (94, 8, 115, 632, '2026-05-31', '2026-06-06', 5.25, 20.00, 5.25, 0.00, 105.00, 0.00, 105.00);
INSERT INTO public.payroll_settlement_items VALUES (95, 8, 114, 631, '2026-05-31', '2026-06-06', 7.50, 20.00, 7.50, 0.00, 150.00, 0.00, 150.00);
INSERT INTO public.payroll_settlement_items VALUES (96, 8, 114, 627, '2026-05-31', '2026-06-06', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (97, 8, 113, 630, '2026-05-31', '2026-06-06', 8.75, 20.00, 8.75, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (98, 8, 113, 626, '2026-05-31', '2026-06-06', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (99, 8, 113, 621, '2026-05-31', '2026-06-06', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (100, 8, 104, 623, '2026-05-31', '2026-06-06', 8.00, 25.00, 8.00, 0.00, 200.00, 0.00, 200.00);
INSERT INTO public.payroll_settlement_items VALUES (101, 8, 104, 618, '2026-05-31', '2026-06-06', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (102, 8, 112, 625, '2026-05-31', '2026-06-06', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (103, 8, 112, 620, '2026-05-31', '2026-06-06', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (104, 8, 112, 614, '2026-05-31', '2026-06-06', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (105, 8, 103, 617, '2026-05-31', '2026-06-06', 8.00, 25.00, 8.00, 0.00, 200.00, 0.00, 200.00);
INSERT INTO public.payroll_settlement_items VALUES (106, 8, 103, 611, '2026-05-31', '2026-06-06', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (107, 8, 111, 619, '2026-05-31', '2026-06-06', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (108, 8, 111, 613, '2026-05-31', '2026-06-06', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (109, 8, 120, 622, '2026-05-31', '2026-06-06', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (110, 8, 110, 612, '2026-05-31', '2026-06-06', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (111, 8, 119, 615, '2026-05-31', '2026-06-06', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (112, 8, 123, 616, '2026-05-31', '2026-06-06', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (113, 8, 101, 603, '2026-05-24', '2026-05-30', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (114, 8, 101, 599, '2026-05-24', '2026-05-30', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (115, 8, 101, 580, '2026-05-24', '2026-05-30', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (116, 8, 102, 604, '2026-05-24', '2026-05-30', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (117, 8, 102, 587, '2026-05-24', '2026-05-30', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (118, 8, 102, 581, '2026-05-24', '2026-05-30', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (119, 8, 109, 605, '2026-05-24', '2026-05-30', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (120, 8, 109, 601, '2026-05-24', '2026-05-30', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (121, 8, 109, 597, '2026-05-24', '2026-05-30', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (122, 8, 110, 606, '2026-05-24', '2026-05-30', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (123, 8, 110, 602, '2026-05-24', '2026-05-30', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (124, 8, 111, 607, '2026-05-24', '2026-05-30', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (125, 8, 118, 608, '2026-05-24', '2026-05-30', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (126, 8, 126, 609, '2026-05-24', '2026-05-30', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (127, 8, 126, 586, '2026-05-24', '2026-05-30', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (128, 8, 104, 598, '2026-05-24', '2026-05-30', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (129, 8, 104, 594, '2026-05-24', '2026-05-30', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (130, 8, 116, 600, '2026-05-24', '2026-05-30', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (131, 8, 116, 596, '2026-05-24', '2026-05-30', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (132, 8, 116, 591, '2026-05-24', '2026-05-30', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (133, 8, 103, 593, '2026-05-24', '2026-05-30', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (134, 8, 103, 588, '2026-05-24', '2026-05-30', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (135, 8, 115, 595, '2026-05-24', '2026-05-30', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (136, 8, 115, 590, '2026-05-24', '2026-05-30', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (137, 8, 115, 584, '2026-05-24', '2026-05-30', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (138, 8, 114, 589, '2026-05-24', '2026-05-30', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (139, 8, 114, 583, '2026-05-24', '2026-05-30', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (140, 8, 121, 592, '2026-05-24', '2026-05-30', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (141, 8, 113, 582, '2026-05-24', '2026-05-30', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (142, 8, 120, 585, '2026-05-24', '2026-05-30', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (143, 8, 101, 574, '2026-05-17', '2026-05-23', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (144, 8, 101, 557, '2026-05-17', '2026-05-23', 13.00, 25.00, 13.00, 0.00, 325.00, 0.00, 325.00);
INSERT INTO public.payroll_settlement_items VALUES (145, 8, 104, 573, '2026-05-17', '2026-05-23', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (146, 8, 104, 569, '2026-05-17', '2026-05-23', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (147, 8, 114, 577, '2026-05-17', '2026-05-23', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (148, 8, 113, 576, '2026-05-17', '2026-05-23', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (149, 8, 113, 572, '2026-05-17', '2026-05-23', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (150, 8, 112, 575, '2026-05-17', '2026-05-23', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (151, 8, 112, 571, '2026-05-17', '2026-05-23', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (152, 8, 112, 567, '2026-05-17', '2026-05-23', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (153, 8, 119, 578, '2026-05-17', '2026-05-23', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (154, 8, 125, 579, '2026-05-17', '2026-05-23', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (155, 8, 103, 568, '2026-05-17', '2026-05-23', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (156, 8, 103, 564, '2026-05-17', '2026-05-23', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (157, 8, 111, 570, '2026-05-17', '2026-05-23', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (158, 8, 111, 566, '2026-05-17', '2026-05-23', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (159, 8, 111, 561, '2026-05-17', '2026-05-23', 13.00, 22.00, 13.00, 0.00, 286.00, 0.00, 286.00);
INSERT INTO public.payroll_settlement_items VALUES (160, 8, 102, 563, '2026-05-17', '2026-05-23', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (161, 8, 102, 558, '2026-05-17', '2026-05-23', 13.00, 25.00, 13.00, 0.00, 325.00, 0.00, 325.00);
INSERT INTO public.payroll_settlement_items VALUES (162, 8, 110, 565, '2026-05-17', '2026-05-23', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (163, 8, 110, 560, '2026-05-17', '2026-05-23', 13.00, 22.00, 13.00, 0.00, 286.00, 0.00, 286.00);
INSERT INTO public.payroll_settlement_items VALUES (164, 8, 109, 559, '2026-05-17', '2026-05-23', 13.00, 22.00, 13.00, 0.00, 286.00, 0.00, 286.00);
INSERT INTO public.payroll_settlement_items VALUES (165, 8, 122, 562, '2026-05-17', '2026-05-23', 13.00, 35.00, 13.00, 0.00, 455.00, 0.00, 455.00);
INSERT INTO public.payroll_settlement_items VALUES (166, 8, 104, 521, '2026-05-03', '2026-05-09', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (167, 8, 104, 503, '2026-05-03', '2026-05-09', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (168, 8, 103, 520, '2026-05-03', '2026-05-09', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (169, 8, 103, 514, '2026-05-03', '2026-05-09', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (170, 8, 113, 524, '2026-05-03', '2026-05-09', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (171, 8, 112, 523, '2026-05-03', '2026-05-09', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (172, 8, 112, 517, '2026-05-03', '2026-05-09', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (173, 8, 111, 522, '2026-05-03', '2026-05-09', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (174, 8, 111, 516, '2026-05-03', '2026-05-09', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (175, 8, 111, 512, '2026-05-03', '2026-05-09', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (176, 8, 122, 525, '2026-05-03', '2026-05-09', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (177, 8, 124, 526, '2026-05-03', '2026-05-09', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (178, 8, 102, 513, '2026-05-03', '2026-05-09', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (179, 8, 102, 509, '2026-05-03', '2026-05-09', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (180, 8, 110, 515, '2026-05-03', '2026-05-09', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (181, 8, 110, 511, '2026-05-03', '2026-05-09', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (182, 8, 110, 507, '2026-05-03', '2026-05-09', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (183, 8, 121, 518, '2026-05-03', '2026-05-09', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (184, 8, 123, 519, '2026-05-03', '2026-05-09', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (185, 8, 101, 508, '2026-05-03', '2026-05-09', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (186, 8, 101, 504, '2026-05-03', '2026-05-09', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (187, 8, 109, 510, '2026-05-03', '2026-05-09', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (188, 8, 109, 506, '2026-05-03', '2026-05-09', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (189, 8, 116, 505, '2026-05-03', '2026-05-09', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (190, 8, 104, 498, '2026-04-26', '2026-05-02', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (191, 8, 104, 478, '2026-04-26', '2026-05-02', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (192, 8, 104, 474, '2026-04-26', '2026-05-02', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (193, 8, 103, 497, '2026-04-26', '2026-05-02', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (194, 8, 103, 491, '2026-04-26', '2026-05-02', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (195, 8, 103, 473, '2026-04-26', '2026-05-02', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (196, 8, 109, 501, '2026-04-26', '2026-05-02', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (197, 8, 116, 500, '2026-04-26', '2026-05-02', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (198, 8, 116, 494, '2026-04-26', '2026-05-02', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (199, 8, 115, 499, '2026-04-26', '2026-05-02', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (200, 8, 115, 493, '2026-04-26', '2026-05-02', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (201, 8, 115, 487, '2026-04-26', '2026-05-02', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (202, 8, 118, 502, '2026-04-26', '2026-05-02', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (203, 8, 102, 490, '2026-04-26', '2026-05-02', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (204, 8, 102, 484, '2026-04-26', '2026-05-02', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (205, 8, 114, 492, '2026-04-26', '2026-05-02', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (206, 8, 114, 486, '2026-04-26', '2026-05-02', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (207, 8, 114, 482, '2026-04-26', '2026-05-02', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (208, 8, 117, 495, '2026-04-26', '2026-05-02', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (209, 8, 123, 496, '2026-04-26', '2026-05-02', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (210, 8, 101, 483, '2026-04-26', '2026-05-02', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (211, 8, 101, 479, '2026-04-26', '2026-05-02', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (212, 8, 113, 485, '2026-04-26', '2026-05-02', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (213, 8, 113, 481, '2026-04-26', '2026-05-02', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (214, 8, 113, 477, '2026-04-26', '2026-05-02', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (215, 8, 122, 488, '2026-04-26', '2026-05-02', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (216, 8, 126, 489, '2026-04-26', '2026-05-02', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (217, 8, 112, 480, '2026-04-26', '2026-05-02', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (218, 8, 112, 476, '2026-04-26', '2026-05-02', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (219, 8, 111, 475, '2026-04-26', '2026-05-02', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (220, 8, 103, 468, '2026-04-19', '2026-04-25', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (221, 8, 103, 448, '2026-04-19', '2026-04-25', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (222, 8, 102, 467, '2026-04-19', '2026-04-25', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (223, 8, 102, 461, '2026-04-19', '2026-04-25', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (224, 8, 112, 471, '2026-04-19', '2026-04-25', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (225, 8, 111, 470, '2026-04-19', '2026-04-25', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (226, 8, 111, 464, '2026-04-19', '2026-04-25', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (227, 8, 110, 469, '2026-04-19', '2026-04-25', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (228, 8, 110, 463, '2026-04-19', '2026-04-25', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (229, 8, 110, 457, '2026-04-19', '2026-04-25', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (230, 8, 119, 472, '2026-04-19', '2026-04-25', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (231, 8, 101, 460, '2026-04-19', '2026-04-25', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (232, 8, 101, 454, '2026-04-19', '2026-04-25', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (233, 8, 109, 462, '2026-04-19', '2026-04-25', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (234, 8, 109, 456, '2026-04-19', '2026-04-25', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (235, 8, 109, 452, '2026-04-19', '2026-04-25', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (236, 8, 118, 465, '2026-04-19', '2026-04-25', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (237, 8, 126, 466, '2026-04-19', '2026-04-25', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (238, 8, 104, 453, '2026-04-19', '2026-04-25', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (239, 8, 104, 449, '2026-04-19', '2026-04-25', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (240, 8, 116, 455, '2026-04-19', '2026-04-25', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (241, 8, 116, 451, '2026-04-19', '2026-04-25', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (242, 8, 117, 458, '2026-04-19', '2026-04-25', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (243, 8, 125, 459, '2026-04-19', '2026-04-25', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (244, 8, 115, 450, '2026-04-19', '2026-04-25', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (245, 8, 103, 444, '2026-04-12', '2026-04-18', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (246, 8, 103, 423, '2026-04-12', '2026-04-18', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (247, 8, 102, 443, '2026-04-12', '2026-04-18', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (248, 8, 102, 438, '2026-04-12', '2026-04-18', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (249, 8, 116, 447, '2026-04-12', '2026-04-18', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (250, 8, 115, 446, '2026-04-12', '2026-04-18', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (251, 8, 115, 441, '2026-04-12', '2026-04-18', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (252, 8, 114, 445, '2026-04-12', '2026-04-18', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (253, 8, 114, 440, '2026-04-12', '2026-04-18', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (254, 8, 114, 434, '2026-04-12', '2026-04-18', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (255, 8, 101, 437, '2026-04-12', '2026-04-18', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (256, 8, 101, 431, '2026-04-12', '2026-04-18', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (257, 8, 113, 439, '2026-04-12', '2026-04-18', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (258, 8, 113, 433, '2026-04-12', '2026-04-18', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (259, 8, 113, 427, '2026-04-12', '2026-04-18', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (260, 8, 120, 442, '2026-04-12', '2026-04-18', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (261, 8, 104, 430, '2026-04-12', '2026-04-18', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (262, 8, 104, 424, '2026-04-12', '2026-04-18', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (263, 8, 112, 432, '2026-04-12', '2026-04-18', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (264, 8, 112, 426, '2026-04-12', '2026-04-18', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (265, 8, 119, 435, '2026-04-12', '2026-04-18', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (266, 8, 125, 436, '2026-04-12', '2026-04-18', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (267, 8, 111, 425, '2026-04-12', '2026-04-18', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (268, 8, 118, 428, '2026-04-12', '2026-04-18', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (269, 8, 124, 429, '2026-04-12', '2026-04-18', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (270, 8, 103, 419, '2026-04-05', '2026-04-11', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (271, 8, 103, 400, '2026-04-05', '2026-04-11', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (272, 8, 103, 394, '2026-04-05', '2026-04-11', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (273, 8, 102, 418, '2026-04-05', '2026-04-11', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (274, 8, 102, 414, '2026-04-05', '2026-04-11', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (275, 8, 102, 393, '2026-04-05', '2026-04-11', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (276, 8, 112, 422, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (277, 8, 111, 421, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (278, 8, 111, 417, '2026-04-05', '2026-04-11', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (279, 8, 110, 420, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (280, 8, 110, 416, '2026-04-05', '2026-04-11', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (281, 8, 110, 411, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (282, 8, 101, 413, '2026-04-05', '2026-04-11', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (283, 8, 101, 408, '2026-04-05', '2026-04-11', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (284, 8, 109, 415, '2026-04-05', '2026-04-11', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (285, 8, 109, 410, '2026-04-05', '2026-04-11', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (286, 8, 109, 404, '2026-04-05', '2026-04-11', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (287, 8, 104, 407, '2026-04-05', '2026-04-11', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (288, 8, 104, 401, '2026-04-05', '2026-04-11', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (289, 8, 116, 409, '2026-04-05', '2026-04-11', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (290, 8, 116, 403, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (291, 8, 116, 397, '2026-04-05', '2026-04-11', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (292, 8, 121, 412, '2026-04-05', '2026-04-11', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (293, 8, 115, 402, '2026-04-05', '2026-04-11', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (294, 8, 115, 396, '2026-04-05', '2026-04-11', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (295, 8, 120, 405, '2026-04-05', '2026-04-11', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (296, 8, 124, 406, '2026-04-05', '2026-04-11', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (297, 8, 114, 395, '2026-04-05', '2026-04-11', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (298, 8, 119, 398, '2026-04-05', '2026-04-11', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (299, 8, 123, 399, '2026-04-05', '2026-04-11', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (300, 8, 102, 389, '2026-03-29', '2026-04-04', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (301, 8, 102, 370, '2026-03-29', '2026-04-04', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (302, 8, 101, 388, '2026-03-29', '2026-04-04', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (303, 8, 101, 384, '2026-03-29', '2026-04-04', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (304, 8, 115, 392, '2026-03-29', '2026-04-04', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (305, 8, 114, 391, '2026-03-29', '2026-04-04', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (306, 8, 114, 387, '2026-03-29', '2026-04-04', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (307, 8, 113, 390, '2026-03-29', '2026-04-04', 4.75, 22.00, 4.75, 0.00, 104.50, 0.00, 104.50);
INSERT INTO public.payroll_settlement_items VALUES (308, 8, 113, 386, '2026-03-29', '2026-04-04', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (309, 8, 113, 381, '2026-03-29', '2026-04-04', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (310, 8, 104, 383, '2026-03-29', '2026-04-04', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (311, 8, 104, 378, '2026-03-29', '2026-04-04', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (312, 8, 112, 385, '2026-03-29', '2026-04-04', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (313, 8, 112, 380, '2026-03-29', '2026-04-04', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (314, 8, 112, 374, '2026-03-29', '2026-04-04', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (315, 8, 103, 377, '2026-03-29', '2026-04-04', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (316, 8, 103, 371, '2026-03-29', '2026-04-04', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (317, 8, 111, 379, '2026-03-29', '2026-04-04', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (318, 8, 111, 373, '2026-03-29', '2026-04-04', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (319, 8, 122, 382, '2026-03-29', '2026-04-04', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (320, 8, 110, 372, '2026-03-29', '2026-04-04', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (321, 8, 121, 375, '2026-03-29', '2026-04-04', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (322, 8, 123, 376, '2026-03-29', '2026-04-04', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (323, 8, 102, 364, '2026-03-22', '2026-03-28', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (324, 8, 102, 347, '2026-03-22', '2026-03-28', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (325, 8, 102, 341, '2026-03-22', '2026-03-28', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (326, 8, 101, 363, '2026-03-22', '2026-03-28', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (327, 8, 101, 359, '2026-03-22', '2026-03-28', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (328, 8, 101, 340, '2026-03-22', '2026-03-28', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (329, 8, 111, 367, '2026-03-22', '2026-03-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (330, 8, 110, 366, '2026-03-22', '2026-03-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (331, 8, 110, 362, '2026-03-22', '2026-03-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (332, 8, 109, 365, '2026-03-22', '2026-03-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (333, 8, 109, 361, '2026-03-22', '2026-03-28', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (334, 8, 109, 357, '2026-03-22', '2026-03-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (335, 8, 120, 368, '2026-03-22', '2026-03-28', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (336, 8, 126, 369, '2026-03-22', '2026-03-28', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (337, 8, 126, 346, '2026-03-22', '2026-03-28', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (338, 8, 104, 358, '2026-03-22', '2026-03-28', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (339, 8, 104, 354, '2026-03-22', '2026-03-28', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (340, 8, 116, 360, '2026-03-22', '2026-03-28', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (341, 8, 116, 356, '2026-03-22', '2026-03-28', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (342, 8, 116, 351, '2026-03-22', '2026-03-28', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (343, 8, 103, 353, '2026-03-22', '2026-03-28', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (344, 8, 103, 348, '2026-03-22', '2026-03-28', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (345, 8, 115, 355, '2026-03-22', '2026-03-28', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (346, 8, 115, 350, '2026-03-22', '2026-03-28', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (347, 8, 115, 344, '2026-03-22', '2026-03-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (348, 8, 114, 349, '2026-03-22', '2026-03-28', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (349, 8, 114, 343, '2026-03-22', '2026-03-28', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (350, 8, 117, 352, '2026-03-22', '2026-03-28', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (351, 8, 113, 342, '2026-03-22', '2026-03-28', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (352, 8, 122, 345, '2026-03-22', '2026-03-28', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (353, 8, 101, 334, '2026-03-15', '2026-03-21', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (354, 8, 101, 317, '2026-03-15', '2026-03-21', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (355, 8, 104, 333, '2026-03-15', '2026-03-21', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (356, 8, 104, 329, '2026-03-15', '2026-03-21', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (357, 8, 114, 337, '2026-03-15', '2026-03-21', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (358, 8, 113, 336, '2026-03-15', '2026-03-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (359, 8, 113, 332, '2026-03-15', '2026-03-21', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (360, 8, 112, 335, '2026-03-15', '2026-03-21', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (361, 8, 112, 331, '2026-03-15', '2026-03-21', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (362, 8, 112, 327, '2026-03-15', '2026-03-21', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (363, 8, 121, 338, '2026-03-15', '2026-03-21', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (364, 8, 125, 339, '2026-03-15', '2026-03-21', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (365, 8, 103, 328, '2026-03-15', '2026-03-21', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (366, 8, 103, 324, '2026-03-15', '2026-03-21', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (367, 8, 111, 330, '2026-03-15', '2026-03-21', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (368, 8, 111, 326, '2026-03-15', '2026-03-21', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (369, 8, 111, 321, '2026-03-15', '2026-03-21', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (370, 8, 102, 323, '2026-03-15', '2026-03-21', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (371, 8, 102, 318, '2026-03-15', '2026-03-21', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (372, 8, 110, 325, '2026-03-15', '2026-03-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (373, 8, 110, 320, '2026-03-15', '2026-03-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (374, 8, 109, 319, '2026-03-15', '2026-03-21', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (375, 8, 118, 322, '2026-03-15', '2026-03-21', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (376, 8, 101, 311, '2026-03-08', '2026-03-14', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (377, 8, 101, 293, '2026-03-08', '2026-03-14', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (378, 8, 101, 288, '2026-03-08', '2026-03-14', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (379, 8, 104, 310, '2026-03-08', '2026-03-14', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (380, 8, 104, 304, '2026-03-08', '2026-03-14', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (381, 8, 104, 287, '2026-03-08', '2026-03-14', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (382, 8, 110, 314, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (383, 8, 109, 313, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (384, 8, 109, 307, '2026-03-08', '2026-03-14', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (385, 8, 116, 312, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (386, 8, 116, 306, '2026-03-08', '2026-03-14', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (387, 8, 116, 302, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (388, 8, 117, 315, '2026-03-08', '2026-03-14', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (389, 8, 125, 316, '2026-03-08', '2026-03-14', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (390, 8, 103, 303, '2026-03-08', '2026-03-14', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (391, 8, 103, 299, '2026-03-08', '2026-03-14', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (392, 8, 115, 305, '2026-03-08', '2026-03-14', 9.75, 22.00, 9.75, 0.00, 214.50, 0.00, 214.50);
INSERT INTO public.payroll_settlement_items VALUES (393, 8, 115, 301, '2026-03-08', '2026-03-14', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (394, 8, 115, 297, '2026-03-08', '2026-03-14', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (395, 8, 122, 308, '2026-03-08', '2026-03-14', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (396, 8, 124, 309, '2026-03-08', '2026-03-14', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (397, 8, 102, 298, '2026-03-08', '2026-03-14', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (398, 8, 102, 294, '2026-03-08', '2026-03-14', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (399, 8, 114, 300, '2026-03-08', '2026-03-14', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (400, 8, 114, 296, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (401, 8, 114, 291, '2026-03-08', '2026-03-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (402, 8, 113, 295, '2026-03-08', '2026-03-14', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (403, 8, 113, 290, '2026-03-08', '2026-03-14', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (404, 8, 112, 289, '2026-03-08', '2026-03-14', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (405, 8, 119, 292, '2026-03-08', '2026-03-14', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (406, 8, 104, 281, '2026-03-01', '2026-03-07', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (407, 8, 104, 263, '2026-03-01', '2026-03-07', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (408, 8, 103, 280, '2026-03-01', '2026-03-07', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (409, 8, 103, 274, '2026-03-01', '2026-03-07', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (410, 8, 113, 284, '2026-03-01', '2026-03-07', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (411, 8, 112, 283, '2026-03-01', '2026-03-07', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (412, 8, 112, 277, '2026-03-01', '2026-03-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (413, 8, 111, 282, '2026-03-01', '2026-03-07', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (414, 8, 111, 276, '2026-03-01', '2026-03-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (415, 8, 111, 272, '2026-03-01', '2026-03-07', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (416, 8, 118, 285, '2026-03-01', '2026-03-07', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (417, 8, 124, 286, '2026-03-01', '2026-03-07', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (418, 8, 102, 273, '2026-03-01', '2026-03-07', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (419, 8, 102, 269, '2026-03-01', '2026-03-07', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (420, 8, 110, 275, '2026-03-01', '2026-03-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (421, 8, 110, 271, '2026-03-01', '2026-03-07', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (422, 8, 110, 267, '2026-03-01', '2026-03-07', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (423, 8, 117, 278, '2026-03-01', '2026-03-07', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (424, 8, 123, 279, '2026-03-01', '2026-03-07', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (425, 8, 101, 268, '2026-03-01', '2026-03-07', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (426, 8, 101, 264, '2026-03-01', '2026-03-07', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (427, 8, 109, 270, '2026-03-01', '2026-03-07', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (428, 8, 109, 266, '2026-03-01', '2026-03-07', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (429, 8, 116, 265, '2026-03-01', '2026-03-07', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (430, 8, 104, 258, '2026-02-22', '2026-02-28', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (431, 8, 104, 238, '2026-02-22', '2026-02-28', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (432, 8, 104, 234, '2026-02-22', '2026-02-28', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (433, 8, 103, 257, '2026-02-22', '2026-02-28', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (434, 8, 103, 251, '2026-02-22', '2026-02-28', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (435, 8, 103, 233, '2026-02-22', '2026-02-28', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (436, 8, 109, 261, '2026-02-22', '2026-02-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (437, 8, 116, 260, '2026-02-22', '2026-02-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (438, 8, 116, 254, '2026-02-22', '2026-02-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (439, 8, 115, 259, '2026-02-22', '2026-02-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (440, 8, 115, 253, '2026-02-22', '2026-02-28', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (441, 8, 115, 247, '2026-02-22', '2026-02-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (442, 8, 120, 262, '2026-02-22', '2026-02-28', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (443, 8, 102, 250, '2026-02-22', '2026-02-28', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (444, 8, 102, 244, '2026-02-22', '2026-02-28', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (445, 8, 114, 252, '2026-02-22', '2026-02-28', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (446, 8, 114, 246, '2026-02-22', '2026-02-28', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (447, 8, 114, 242, '2026-02-22', '2026-02-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (448, 8, 119, 255, '2026-02-22', '2026-02-28', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (449, 8, 123, 256, '2026-02-22', '2026-02-28', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (450, 8, 101, 243, '2026-02-22', '2026-02-28', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (451, 8, 101, 239, '2026-02-22', '2026-02-28', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (452, 8, 113, 245, '2026-02-22', '2026-02-28', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (453, 8, 113, 241, '2026-02-22', '2026-02-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (454, 8, 113, 237, '2026-02-22', '2026-02-28', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (455, 8, 118, 248, '2026-02-22', '2026-02-28', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (456, 8, 126, 249, '2026-02-22', '2026-02-28', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (457, 8, 112, 240, '2026-02-22', '2026-02-28', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (458, 8, 112, 236, '2026-02-22', '2026-02-28', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (459, 8, 111, 235, '2026-02-22', '2026-02-28', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (460, 8, 103, 228, '2026-02-15', '2026-02-21', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (461, 8, 103, 208, '2026-02-15', '2026-02-21', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (462, 8, 102, 227, '2026-02-15', '2026-02-21', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (463, 8, 102, 221, '2026-02-15', '2026-02-21', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (464, 8, 112, 231, '2026-02-15', '2026-02-21', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (465, 8, 111, 230, '2026-02-15', '2026-02-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (466, 8, 111, 224, '2026-02-15', '2026-02-21', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (467, 8, 110, 229, '2026-02-15', '2026-02-21', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (468, 8, 110, 223, '2026-02-15', '2026-02-21', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (469, 8, 110, 217, '2026-02-15', '2026-02-21', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (470, 8, 121, 232, '2026-02-15', '2026-02-21', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (471, 8, 101, 220, '2026-02-15', '2026-02-21', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (472, 8, 101, 214, '2026-02-15', '2026-02-21', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (473, 8, 109, 222, '2026-02-15', '2026-02-21', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (474, 8, 109, 216, '2026-02-15', '2026-02-21', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (475, 8, 109, 212, '2026-02-15', '2026-02-21', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (476, 8, 120, 225, '2026-02-15', '2026-02-21', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (477, 8, 126, 226, '2026-02-15', '2026-02-21', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (478, 8, 104, 213, '2026-02-15', '2026-02-21', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (479, 8, 104, 209, '2026-02-15', '2026-02-21', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (480, 8, 116, 215, '2026-02-15', '2026-02-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (481, 8, 116, 211, '2026-02-15', '2026-02-21', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (482, 8, 119, 218, '2026-02-15', '2026-02-21', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (483, 8, 125, 219, '2026-02-15', '2026-02-21', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (484, 8, 115, 210, '2026-02-15', '2026-02-21', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (485, 8, 103, 204, '2026-02-08', '2026-02-14', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (486, 8, 103, 183, '2026-02-08', '2026-02-14', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (487, 8, 103, 179, '2026-02-08', '2026-02-14', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (488, 8, 102, 203, '2026-02-08', '2026-02-14', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (489, 8, 102, 198, '2026-02-08', '2026-02-14', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (490, 8, 102, 178, '2026-02-08', '2026-02-14', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (491, 8, 116, 207, '2026-02-08', '2026-02-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (492, 8, 115, 206, '2026-02-08', '2026-02-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (493, 8, 115, 201, '2026-02-08', '2026-02-14', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (494, 8, 114, 205, '2026-02-08', '2026-02-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (495, 8, 114, 200, '2026-02-08', '2026-02-14', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (496, 8, 114, 194, '2026-02-08', '2026-02-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (497, 8, 101, 197, '2026-02-08', '2026-02-14', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (498, 8, 101, 191, '2026-02-08', '2026-02-14', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (499, 8, 113, 199, '2026-02-08', '2026-02-14', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (500, 8, 113, 193, '2026-02-08', '2026-02-14', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (501, 8, 113, 187, '2026-02-08', '2026-02-14', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (502, 8, 122, 202, '2026-02-08', '2026-02-14', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (503, 8, 104, 190, '2026-02-08', '2026-02-14', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (504, 8, 104, 184, '2026-02-08', '2026-02-14', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (505, 8, 112, 192, '2026-02-08', '2026-02-14', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (506, 8, 112, 186, '2026-02-08', '2026-02-14', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (507, 8, 112, 182, '2026-02-08', '2026-02-14', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (508, 8, 121, 195, '2026-02-08', '2026-02-14', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (509, 8, 125, 196, '2026-02-08', '2026-02-14', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (510, 8, 111, 185, '2026-02-08', '2026-02-14', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (511, 8, 111, 181, '2026-02-08', '2026-02-14', 8.50, 22.00, 8.50, 0.00, 187.00, 0.00, 187.00);
INSERT INTO public.payroll_settlement_items VALUES (512, 8, 120, 188, '2026-02-08', '2026-02-14', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (513, 8, 124, 189, '2026-02-08', '2026-02-14', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (514, 8, 110, 180, '2026-02-08', '2026-02-14', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (515, 8, 102, 174, '2026-02-01', '2026-02-07', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (516, 8, 102, 153, '2026-02-01', '2026-02-07', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (517, 8, 101, 173, '2026-02-01', '2026-02-07', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (518, 8, 101, 168, '2026-02-01', '2026-02-07', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (519, 8, 111, 177, '2026-02-01', '2026-02-07', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (520, 8, 110, 176, '2026-02-01', '2026-02-07', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (521, 8, 110, 171, '2026-02-01', '2026-02-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (522, 8, 109, 175, '2026-02-01', '2026-02-07', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (523, 8, 109, 170, '2026-02-01', '2026-02-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (524, 8, 109, 164, '2026-02-01', '2026-02-07', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (525, 8, 104, 167, '2026-02-01', '2026-02-07', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (526, 8, 104, 161, '2026-02-01', '2026-02-07', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (527, 8, 116, 169, '2026-02-01', '2026-02-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (528, 8, 116, 163, '2026-02-01', '2026-02-07', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (529, 8, 116, 157, '2026-02-01', '2026-02-07', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (530, 8, 117, 172, '2026-02-01', '2026-02-07', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (531, 8, 103, 160, '2026-02-01', '2026-02-07', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (532, 8, 103, 154, '2026-02-01', '2026-02-07', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (533, 8, 115, 162, '2026-02-01', '2026-02-07', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (534, 8, 115, 156, '2026-02-01', '2026-02-07', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (535, 8, 122, 165, '2026-02-01', '2026-02-07', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (536, 8, 124, 166, '2026-02-01', '2026-02-07', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (537, 8, 114, 155, '2026-02-01', '2026-02-07', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (538, 8, 121, 158, '2026-02-01', '2026-02-07', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (539, 8, 123, 159, '2026-02-01', '2026-02-07', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (540, 8, 102, 149, '2026-01-25', '2026-01-31', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (541, 8, 102, 130, '2026-01-25', '2026-01-31', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (542, 8, 102, 124, '2026-01-25', '2026-01-31', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (543, 8, 101, 148, '2026-01-25', '2026-01-31', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (544, 8, 101, 144, '2026-01-25', '2026-01-31', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (545, 8, 101, 123, '2026-01-25', '2026-01-31', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (546, 8, 115, 152, '2026-01-25', '2026-01-31', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (547, 8, 114, 151, '2026-01-25', '2026-01-31', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (548, 8, 114, 147, '2026-01-25', '2026-01-31', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (549, 8, 113, 150, '2026-01-25', '2026-01-31', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (550, 8, 113, 146, '2026-01-25', '2026-01-31', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (551, 8, 113, 141, '2026-01-25', '2026-01-31', 7.25, 22.00, 7.25, 0.00, 159.50, 0.00, 159.50);
INSERT INTO public.payroll_settlement_items VALUES (552, 8, 104, 143, '2026-01-25', '2026-01-31', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (553, 8, 104, 138, '2026-01-25', '2026-01-31', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (554, 8, 112, 145, '2026-01-25', '2026-01-31', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (555, 8, 112, 140, '2026-01-25', '2026-01-31', 6.00, 22.00, 6.00, 0.00, 132.00, 0.00, 132.00);
INSERT INTO public.payroll_settlement_items VALUES (556, 8, 112, 134, '2026-01-25', '2026-01-31', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (557, 8, 103, 137, '2026-01-25', '2026-01-31', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (558, 8, 103, 131, '2026-01-25', '2026-01-31', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (559, 8, 111, 139, '2026-01-25', '2026-01-31', 4.75, 22.00, 4.75, 0.00, 104.50, 0.00, 104.50);
INSERT INTO public.payroll_settlement_items VALUES (560, 8, 111, 133, '2026-01-25', '2026-01-31', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (561, 8, 111, 127, '2026-01-25', '2026-01-31', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (562, 8, 118, 142, '2026-01-25', '2026-01-31', 7.00, 35.00, 7.00, 0.00, 245.00, 0.00, 245.00);
INSERT INTO public.payroll_settlement_items VALUES (563, 8, 110, 132, '2026-01-25', '2026-01-31', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (564, 8, 110, 126, '2026-01-25', '2026-01-31', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (565, 8, 117, 135, '2026-01-25', '2026-01-31', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (566, 8, 123, 136, '2026-01-25', '2026-01-31', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (567, 8, 109, 125, '2026-01-25', '2026-01-31', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (568, 8, 122, 128, '2026-01-25', '2026-01-31', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (569, 8, 126, 129, '2026-01-25', '2026-01-31', 8.00, 18.00, 8.00, 0.00, 144.00, 0.00, 144.00);
INSERT INTO public.payroll_settlement_items VALUES (570, 8, 101, 119, '2026-01-18', '2026-01-24', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (571, 8, 101, 100, '2026-01-18', '2026-01-24', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (572, 8, 104, 118, '2026-01-18', '2026-01-24', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (573, 8, 104, 114, '2026-01-18', '2026-01-24', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (574, 8, 110, 122, '2026-01-18', '2026-01-24', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (575, 8, 109, 121, '2026-01-18', '2026-01-24', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (576, 8, 109, 117, '2026-01-18', '2026-01-24', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (577, 8, 116, 120, '2026-01-18', '2026-01-24', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (578, 8, 116, 116, '2026-01-18', '2026-01-24', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (579, 8, 116, 111, '2026-01-18', '2026-01-24', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (580, 8, 103, 113, '2026-01-18', '2026-01-24', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (581, 8, 103, 108, '2026-01-18', '2026-01-24', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (582, 8, 115, 115, '2026-01-18', '2026-01-24', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (583, 8, 115, 110, '2026-01-18', '2026-01-24', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (584, 8, 115, 104, '2026-01-18', '2026-01-24', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (585, 8, 102, 107, '2026-01-18', '2026-01-24', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (586, 8, 102, 101, '2026-01-18', '2026-01-24', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (587, 8, 114, 109, '2026-01-18', '2026-01-24', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (588, 8, 114, 103, '2026-01-18', '2026-01-24', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (589, 8, 119, 112, '2026-01-18', '2026-01-24', 5.00, 35.00, 5.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (590, 8, 113, 102, '2026-01-18', '2026-01-24', 4.75, 20.00, 4.75, 0.00, 95.00, 0.00, 95.00);
INSERT INTO public.payroll_settlement_items VALUES (591, 8, 118, 105, '2026-01-18', '2026-01-24', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);
INSERT INTO public.payroll_settlement_items VALUES (592, 8, 126, 106, '2026-01-18', '2026-01-24', 6.00, 18.00, 6.00, 0.00, 108.00, 0.00, 108.00);
INSERT INTO public.payroll_settlement_items VALUES (593, 8, 101, 94, '2026-01-11', '2026-01-17', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (594, 8, 101, 77, '2026-01-11', '2026-01-17', 7.00, 25.00, 7.00, 0.00, 175.00, 0.00, 175.00);
INSERT INTO public.payroll_settlement_items VALUES (595, 8, 104, 93, '2026-01-11', '2026-01-17', 4.00, 28.00, 4.00, 0.00, 112.00, 0.00, 112.00);
INSERT INTO public.payroll_settlement_items VALUES (596, 8, 104, 89, '2026-01-11', '2026-01-17', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (597, 8, 114, 97, '2026-01-11', '2026-01-17', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (598, 8, 113, 96, '2026-01-11', '2026-01-17', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (599, 8, 113, 92, '2026-01-11', '2026-01-17', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (600, 8, 112, 95, '2026-01-11', '2026-01-17', 3.50, 22.00, 3.50, 0.00, 77.00, 0.00, 77.00);
INSERT INTO public.payroll_settlement_items VALUES (601, 8, 112, 91, '2026-01-11', '2026-01-17', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (602, 8, 112, 87, '2026-01-11', '2026-01-17', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (603, 8, 117, 98, '2026-01-11', '2026-01-17', 9.00, 35.00, 9.00, 0.00, 315.00, 0.00, 315.00);
INSERT INTO public.payroll_settlement_items VALUES (604, 8, 125, 99, '2026-01-11', '2026-01-17', 4.00, 18.00, 4.00, 0.00, 72.00, 0.00, 72.00);
INSERT INTO public.payroll_settlement_items VALUES (605, 8, 103, 88, '2026-01-11', '2026-01-17', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (606, 8, 103, 84, '2026-01-11', '2026-01-17', 5.50, 25.00, 5.50, 0.00, 137.50, 0.00, 137.50);
INSERT INTO public.payroll_settlement_items VALUES (607, 8, 111, 90, '2026-01-11', '2026-01-17', 9.75, 20.00, 9.75, 0.00, 195.00, 0.00, 195.00);
INSERT INTO public.payroll_settlement_items VALUES (608, 8, 111, 86, '2026-01-11', '2026-01-17', 6.00, 20.00, 6.00, 0.00, 120.00, 0.00, 120.00);
INSERT INTO public.payroll_settlement_items VALUES (609, 8, 111, 81, '2026-01-11', '2026-01-17', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (610, 8, 102, 83, '2026-01-11', '2026-01-17', 8.50, 25.00, 8.50, 0.00, 212.50, 0.00, 212.50);
INSERT INTO public.payroll_settlement_items VALUES (611, 8, 102, 78, '2026-01-11', '2026-01-17', 10.00, 25.00, 10.00, 0.00, 250.00, 0.00, 250.00);
INSERT INTO public.payroll_settlement_items VALUES (612, 8, 110, 85, '2026-01-11', '2026-01-17', 8.50, 20.00, 8.50, 0.00, 170.00, 0.00, 170.00);
INSERT INTO public.payroll_settlement_items VALUES (613, 8, 110, 80, '2026-01-11', '2026-01-17', 3.50, 20.00, 3.50, 0.00, 70.00, 0.00, 70.00);
INSERT INTO public.payroll_settlement_items VALUES (614, 8, 109, 79, '2026-01-11', '2026-01-17', 7.25, 20.00, 7.25, 0.00, 145.00, 0.00, 145.00);
INSERT INTO public.payroll_settlement_items VALUES (615, 8, 120, 82, '2026-01-11', '2026-01-17', 11.00, 35.00, 11.00, 0.00, 385.00, 0.00, 385.00);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.profiles VALUES (1, 'super_admin', 'Super Administrador', 'Super Administrator', true, '2026-05-14 04:38:56.056771', '2026-05-14 04:38:56.056771');
INSERT INTO public.profiles VALUES (2, 'admin', 'Administrador', 'Administrator', true, '2026-05-14 04:38:56.056771', '2026-05-14 04:38:56.056771');
INSERT INTO public.profiles VALUES (3, 'coordinator', 'Coordinador', 'Coordinator', true, '2026-05-14 04:38:56.056771', '2026-05-14 04:38:56.056771');
INSERT INTO public.profiles VALUES (4, 'employee', 'Empleado', 'Employee', true, '2026-05-14 04:38:56.056771', '2026-05-14 04:38:56.056771');


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.push_subscriptions VALUES (4, 14, 'https://fcm.googleapis.com/fcm/send/cZe6o8pETt0:APA91bEPlWOCoGvjaVNfujp46s0Y5bp0zhwg1ehOn_sur6QMyvjbuoSy90Oc-qshvxg6sB497ITr72_LOdHQE369nOxZrROolS2EMHrlvrbIj_l787f5wnBqqt0S7nr6aOb1pwNle4tf', 'BJBrI6DLnXTFdEaElXBjawFZyJ9aYMxtiwjyU8lIx37Y0fgoFbb6844rCntmkbs_VgZ0ueAde_g-zKgeFsMajkE', 'S1V9gKCfUIShDpJjvulxcg', '2026-05-22 22:36:07.754219');


--
-- Data for Name: user_company_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_company_memberships VALUES (3, 6, 1, 1, true, '2026-05-14 10:43:23.456239', '2026-05-14 10:43:23.456239');
INSERT INTO public.user_company_memberships VALUES (4, 7, 5, 2, true, '2026-05-14 11:31:14.075576', '2026-05-14 11:31:14.075579');
INSERT INTO public.user_company_memberships VALUES (5, 8, 5, 4, true, '2026-05-14 11:32:37.890038', '2026-05-14 11:32:37.89004');
INSERT INTO public.user_company_memberships VALUES (6, 9, 5, 4, true, '2026-05-14 11:33:14.776134', '2026-05-14 11:33:14.776135');
INSERT INTO public.user_company_memberships VALUES (8, 11, 5, 4, true, '2026-05-14 11:34:50.901805', '2026-05-14 11:34:50.901806');
INSERT INTO public.user_company_memberships VALUES (9, 12, 5, 4, true, '2026-05-14 20:16:31.632531', '2026-05-14 20:16:31.632532');
INSERT INTO public.user_company_memberships VALUES (10, 13, 5, 3, true, '2026-05-20 04:02:49.348436', '2026-05-20 04:02:49.348438');
INSERT INTO public.user_company_memberships VALUES (11, 14, 5, 4, true, '2026-05-20 13:55:35.247455', '2026-05-20 13:55:35.247457');
INSERT INTO public.user_company_memberships VALUES (12, 15, 5, 2, true, '2026-05-20 15:58:48.640176', '2026-05-20 15:58:48.640177');
INSERT INTO public.user_company_memberships VALUES (13, 16, 5, 4, true, '2026-05-20 18:14:12.85115', '2026-05-20 18:14:12.851151');
INSERT INTO public.user_company_memberships VALUES (14, 17, 5, 3, true, '2026-05-21 02:44:27.729602', '2026-05-21 02:45:06.403013');
INSERT INTO public.user_company_memberships VALUES (15, 10, 5, 4, true, '2026-06-01 19:49:12.09273', '2026-06-01 19:49:12.092732');
INSERT INTO public.user_company_memberships VALUES (16, 18, 5, 4, true, '2026-06-01 22:11:39.138147', '2026-06-01 22:11:39.138148');
INSERT INTO public.user_company_memberships VALUES (17, 19, 5, 4, true, '2026-06-05 22:59:00.373518', '2026-06-05 22:59:00.373521');
INSERT INTO public.user_company_memberships VALUES (18, 20, 5, 4, true, '2026-06-06 00:42:20.716083', '2026-06-06 00:42:20.716086');
INSERT INTO public.user_company_memberships VALUES (19, 21, 5, 4, true, '2026-06-06 00:56:45.925191', '2026-06-06 00:56:45.925192');
INSERT INTO public.user_company_memberships VALUES (21, 23, 5, 4, true, '2026-06-06 01:35:40.960255', '2026-06-06 01:35:40.960257');
INSERT INTO public.user_company_memberships VALUES (22, 24, 6, 2, true, '2026-06-06 02:30:19.659173', '2026-06-06 02:30:19.659175');
INSERT INTO public.user_company_memberships VALUES (23, 16, 6, 4, true, '2026-06-06 02:47:44.084045', '2026-06-06 02:47:44.08405');
INSERT INTO public.user_company_memberships VALUES (24, 25, 5, 4, true, '2026-06-06 03:07:15.34562', '2026-06-06 03:07:15.345622');
INSERT INTO public.user_company_memberships VALUES (25, 9, 6, 4, true, '2026-06-06 03:19:47.323254', '2026-06-06 03:19:47.323258');
INSERT INTO public.user_company_memberships VALUES (26, 26, 5, 4, true, '2026-06-06 03:46:53.522961', '2026-06-06 03:46:53.522962');
INSERT INTO public.user_company_memberships VALUES (27, 100, 10, 2, true, '2026-06-08 17:17:50.724191', '2026-06-08 17:17:50.724191');
INSERT INTO public.user_company_memberships VALUES (28, 101, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (29, 102, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (30, 103, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (31, 104, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (32, 105, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (33, 106, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (34, 107, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (35, 108, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (36, 109, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (37, 110, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (38, 111, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (39, 112, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (40, 113, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (41, 114, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (42, 115, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (43, 116, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (44, 117, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (45, 118, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (46, 119, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (47, 120, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (48, 121, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (49, 122, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (50, 123, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (51, 124, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (52, 125, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (53, 126, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (54, 127, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (55, 128, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (56, 129, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (57, 130, 10, 4, true, '2026-06-08 17:17:50.771161', '2026-06-08 17:17:50.771161');
INSERT INTO public.user_company_memberships VALUES (58, 9, 10, 4, true, '2026-06-17 02:43:33.290195', '2026-06-17 02:43:33.290197');
INSERT INTO public.user_company_memberships VALUES (59, 8, 10, 4, true, '2026-06-19 18:58:31.36083', '2026-06-19 18:58:31.360847');


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: weekly_hours_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.weekly_hours_config VALUES (1, 1, 40.00, 'monday', 'sunday', '2026-05-14 04:55:24.562304', NULL, 0.00, 2, false, 0, true, 1.50);
INSERT INTO public.weekly_hours_config VALUES (2, 5, 40.00, 'wednesday', 'tuesday', '2026-06-10 00:47:23.822285', NULL, 2.00, 2, true, 0, false, 1.50);
INSERT INTO public.weekly_hours_config VALUES (3, 10, 40.00, 'sunday', 'saturday', '2026-06-19 19:32:52.740916', NULL, 5.00, 2, true, 0, false, 1.50);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 6, true);


--
-- Name: company_email_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_email_settings_id_seq', 1, true);


--
-- Name: email_delivery_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_delivery_logs_id_seq', 1, false);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 64, true);


--
-- Name: employee_job_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_job_roles_id_seq', 62, true);


--
-- Name: employee_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_profiles_id_seq', 1, false);


--
-- Name: event_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_assignments_id_seq', 839, true);


--
-- Name: event_coordinators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_coordinators_id_seq', 62, true);


--
-- Name: event_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_documents_id_seq', 2, true);


--
-- Name: event_job_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_job_roles_id_seq', 456, true);


--
-- Name: event_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_ratings_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 80, true);


--
-- Name: job_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_roles_id_seq', 15, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.news_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, true);


--
-- Name: payment_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_events_id_seq', 1, false);


--
-- Name: payment_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_items_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: payroll_settlement_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payroll_settlement_items_id_seq', 615, true);


--
-- Name: payroll_settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payroll_settlements_id_seq', 8, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profiles_id_seq', 7, true);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 4, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shifts_id_seq', 641, true);


--
-- Name: user_company_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_company_memberships_id_seq', 59, true);


--
-- Name: user_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_documents_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 26, true);


--
-- Name: weekly_hours_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.weekly_hours_config_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict VcwyapBdR9Z1p2Yrd4s2LgROOrxqujh4aKgnt6DoMgOpIT8ig3EsGWfwI9TyZfK

