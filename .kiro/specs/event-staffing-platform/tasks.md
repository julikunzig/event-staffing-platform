# Plan de Implementación: Event Staffing Platform

## Descripción General

Implementación incremental de la plataforma multitenant de gestión de eventos y personal. El backend se construye con Python + FastAPI siguiendo la arquitectura routers → services → repositories. El frontend con React + Vite + TypeScript + shadcn/ui. Cada tarea integra lo construido en la anterior; no hay código huérfano.

---

## Tareas

- [x] 1. Configuración del proyecto y estructura base
  - Crear estructura de directorios del backend: `app/routers`, `app/services`, `app/repositories`, `app/models`, `app/schemas`, `app/core`
  - Crear estructura del frontend: `src/components`, `src/pages`, `src/hooks`, `src/lib`, `src/i18n`
  - Configurar `pyproject.toml` con dependencias: FastAPI, SQLAlchemy 2.0, Pydantic 2, python-jose, bcrypt, resend, twilio, hypothesis, pytest
  - Configurar `package.json` con dependencias: React 18, Vite 5, TypeScript 5, shadcn/ui, Tailwind CSS, react-i18next
  - Crear `app/core/config.py` con settings via `pydantic-settings` (DATABASE_URL, JWT_SECRET, etc.)
  - Crear `app/core/database.py` con engine y `get_db` dependency de SQLAlchemy 2.0
  - Crear archivos de traducción base `src/i18n/es.json` y `src/i18n/en.json`
  - _Requisitos: RNF-05, RNF-07_

- [x] 2. Modelos de base de datos y migraciones
  - [x] 2.1 Implementar modelos SQLAlchemy para todas las tablas del esquema
    - Crear `app/models/` con clases ORM para: `Profile`, `Company`, `User`, `UserCompanyMembership`, `JobRole`, `EmployeeJobRole`, `WeeklyHoursConfig`, `Event`, `EventJobRole`, `EventAssignment`, `Shift`, `Notification`, `EmployeeProfile`, `EventRating`
    - Definir ENUMs Python equivalentes a los ENUMs de BD (`EventStatus`, `AssignmentStatus`, `NotificationStatus`, etc.)
    - _Requisitos: 1.4, 2.1, 4.1, 5.1, 6.1, 7.1, 8.1_
  - [x] 2.2 Crear scripts de migración con Alembic
    - Inicializar Alembic, crear migración inicial con todos los DDL (PostgreSQL-compatible)
    - Incluir seed de tabla `profiles` con los 4 roles del sistema
    - _Requisitos: 1.4_

- [ ] 3. Autenticación y middleware multitenant
  - [x] 3.1 Implementar `AuthService` y router `/auth`
    - `GET /auth/companies?email=` → retorna empresas activas del usuario (Requisito 2.5)
    - `POST /auth/login` → valida credenciales + membresía, emite JWT con `{user_id, company_id, role, exp}` (Requisito 2.1)
    - `POST /auth/switch-company` → emite nuevo JWT para otra empresa sin cerrar sesión (Requisito 2.4)
    - Hash de contraseñas con bcrypt cost factor 12 (RNF-03)
    - JWT con expiración 8h, firmado con HS256, incluir `jti` (RNF-03)
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 3.2 Implementar middleware de autorización multitenant
    - Crear `app/core/auth.py` con dependency `get_current_user` que extrae y valida JWT
    - Crear `app/core/tenant.py` con middleware que valida `company_id` del JWT contra el recurso solicitado
    - Retornar HTTP 401 para tokens inválidos/expirados (Requisito 2.3)
    - Implementar rate limiting 60 req/min en `/auth/login` (RNF-03)
    - _Requisitos: 2.2, 2.3, 1.3, 1.4_
  - [ ]* 3.3 Escribir tests unitarios para `AuthService`
    - Testear login exitoso, credenciales inválidas, empresa inactiva, empresa no asociada
    - Testear emisión correcta de claims en JWT
    - _Requisitos: 2.1, 2.2_

- [ ] 4. Gestión de empresas (Super Admin)
  - [ ] 4.1 Implementar `CompanyService` y router `/companies`
    - `POST /companies` → crear empresa con nombre, slug único y datos de contacto (Requisito 1.1)
    - `PATCH /companies/{id}/activate` y `/deactivate` → activar/desactivar empresa (Requisito 1.2)
    - Validar que desactivar empresa bloquea acceso de sus usuarios (Requisito 1.3)
    - Restringir todos los endpoints a rol `super_admin`
    - _Requisitos: 1.1, 1.2, 1.3_
  - [ ]* 4.2 Escribir tests unitarios para `CompanyService`
    - Testear creación, activación, desactivación y bloqueo de acceso
    - _Requisitos: 1.1, 1.2, 1.3_

- [x] 5. Gestión de usuarios y membresías
  - [x] 5.1 Implementar `UserService` y router `/users`
    - `GET /users/search?email=` → buscar usuario por email (Requisito 3.1)
    - `POST /users` → crear usuario con nombre, email y contraseña temporal (Requisito 3.2)
    - `POST /companies/{id}/members` → asociar usuario existente a empresa con rol (Requisito 3.1, 3.3)
    - `PATCH /companies/{id}/members/{user_id}/role` → cambiar rol de usuario en empresa (Requisito 3.3)
    - `DELETE /companies/{id}/members/{user_id}` → desasociar usuario de empresa (Requisito 3.4)
    - Retornar error si usuario ya está asociado a la empresa (Requisito 3.5)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 5.2 Escribir tests unitarios para `UserService`
    - Testear búsqueda, creación, asociación, desasociación y duplicado
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Checkpoint — Verificar que todos los tests pasen
  - Asegurarse de que todos los tests pasen hasta este punto. Consultar al usuario si surgen dudas.

- [x] 7. Gestión de roles laborales y configuración semanal
  - [x] 7.1 Implementar `JobRoleService` y router `/job-roles`
    - `POST /job-roles` → crear rol laboral con nombre y `hourly_rate` (Requisito 4.1)
    - `PATCH /job-roles/{id}` → editar `hourly_rate` sin afectar shifts existentes (Requisito 4.2)
    - `DELETE /job-roles/{id}/deactivate` → desactivar rol (Requisito 4.6)
    - `POST /job-roles/{id}/employees/{user_id}` → asociar rol a empleado en empresa (Requisito 4.3)
    - `DELETE /job-roles/{id}/employees/{user_id}` → desasociar rol de empleado
    - Validar unicidad `(company_id, name)` y aislamiento por `company_id` (Requisito 4.5)
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 7.2 Implementar configuración de semana laboral
    - `GET /companies/{id}/weekly-config` → obtener configuración actual
    - `PUT /companies/{id}/weekly-config` → actualizar `weekly_hours_limit`, `week_start_day`, `week_end_day` (Requisito 4.7)
    - _Requisitos: 4.7, 8.2_
  - [ ]* 7.3 Escribir tests unitarios para `JobRoleService`
    - Testear creación, edición de tarifa, desactivación y asociación a empleados
    - Testear independencia de tarifas entre empresas (Requisito 4.5)
    - _Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 8. Gestión de eventos
  - [x] 8.1 Implementar `EventService` y router `/events`
    - `POST /events` → crear evento con nombre, fecha, `start_time`, `end_time` (opcional), dirección, coordenadas GPS, dress code y al menos un `event_job_role` con cupos (Requisito 5.1)
    - `PATCH /events/{id}` → editar evento en estado `draft` o `published` sin asignados aprobados (Requisito 5.3)
    - `POST /events/{id}/publish` → publicar evento, cambiar status a `published`, encolar notificaciones a empleados (Requisito 5.2)
    - `POST /events/{id}/cancel` → cancelar evento, encolar notificaciones a asignados activos (Requisito 5.4)
    - `PATCH /events/{id}/end-time` → registrar hora de fin real (Requisito 5.5)
    - `GET /events` → listar eventos de la empresa con filtros de estado y fecha
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 8.2 Escribir tests unitarios para `EventService`
    - Testear creación, publicación, cancelación y restricción de edición con aprobados
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Solicitud y asignación de personal
  - [x] 9.1 Implementar `AssignmentService` y router `/assignments`
    - `POST /events/{id}/apply` → empleado aplica seleccionando un `job_role_id` compatible (Requisito 6.1, 6.2)
    - Validar cupos disponibles antes de crear asignación; retornar 409 si llenos (Requisito 6.3)
    - Crear `EventAssignment` con status `pending` y encolar notificación al Admin (Requisito 6.4)
    - `PATCH /assignments/{id}/approve` → Admin aprueba, incrementa `slots_filled`, encola notificación al empleado (Requisito 6.5)
    - `POST /events/{id}/assign` → Admin asigna directamente con status `approved` (Requisito 6.6)
    - `POST /events/{id}/invite` → Admin envía solicitud directa con status `pending` y notificación (Requisito 6.7)
    - `DELETE /assignments/{id}` → Admin remueve empleado en cualquier estado, decrementa `slots_filled` si era `approved`, encola notificación (Requisito 6.8)
    - Actualizar `slots_filled` atómicamente en `event_job_roles` (Requisito 6.9)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  - [ ]* 9.2 Escribir tests unitarios para `AssignmentService`
    - Testear aplicación, aprobación, asignación directa, remoción y control de cupos
    - Testear que un empleado no puede aplicar a un rol que no tiene asignado
    - _Requisitos: 6.1, 6.2, 6.3, 6.5, 6.6, 6.8_

- [ ] 10. Checkpoint — Verificar que todos los tests pasen
  - Asegurarse de que todos los tests pasen hasta este punto. Consultar al usuario si surgen dudas.

- [x] 11. Registro de turnos y geolocalización
  - [x] 11.1 Implementar `ShiftService` y router `/shifts`
    - `POST /shifts/{assignment_id}/clock-in` → registrar inicio de turno con timestamp del servidor y coordenadas GPS del empleado (Requisito 7.1)
    - Validar que el empleado esté a ≤ 500m del evento usando fórmula de Haversine; rechazar si está fuera del radio (RNF-11)
    - Crear registro en `shifts` con `hourly_rate_snapshot` copiado de `job_roles.hourly_rate` al momento del clock-in (Requisito 4.8)
    - `POST /shifts/{assignment_id}/clock-out` → registrar fin de turno con coordenadas, calcular `hours_worked` (Requisito 7.2)
    - Validar que exista clock-in antes de permitir clock-out; retornar error si no (Requisito 7.6)
    - Validar distancia ≤ 500m también en clock-out (RNF-11)
    - `PATCH /shifts/{id}` → Admin o Coordinator modifica `clock_in` y/o `clock_out`, recalcula pago (Requisitos 7.3, 7.4)
    - `POST /events/{id}/close` → Coordinator registra hora de fin del evento y aplica a todos los shifts sin clock-out (Requisito 7.5)
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 4.8, RNF-11_
  - [ ]* 11.2 Escribir tests unitarios para `ShiftService`
    - Testear clock-in, clock-out, validación de secuencia, modificación por admin
    - Testear rechazo por distancia fuera de radio y aceptación dentro del radio
    - _Requisitos: 7.1, 7.2, 7.3, 7.6, RNF-11_

- [ ] 12. Cálculo de pagos y control de horas semanales
  - [x] 12.1 Implementar `PaymentCalculator`
    - Crear `app/services/payment_calculator.py` con método `calculate_shift_pay(assignment_id, clock_in, clock_out, hourly_rate, weekly_hours_limit, hours_worked_this_week) → ShiftPayResult`
    - Implementar lógica: `regular_pay = min(hours_worked, weekly_hours_remaining) × rate`, `overtime_pay = max(0, hours_worked - weekly_hours_remaining) × rate × 1.5`, `total_pay = regular_pay + overtime_pay` (Requisito 8.1, 8.2)
    - Calcular `hours_worked_this_week` sumando shifts del empleado en la semana configurada por `weekly_hours_config` (Requisito 8.2)
    - Integrar `PaymentCalculator` en `ShiftService.clock_out` y en `ShiftService.update_shift`
    - Generar alerta cuando se supera `weekly_hours_limit` (Requisito 8.3)
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 12.2 Escribir test de propiedad para `PaymentCalculator` — Propiedad 1
    - **Propiedad 1: `total_pay = regular_pay + overtime_pay` para cualquier combinación de inputs**
    - **Valida: Requisito 8.1, 8.4, 8.5**
  - [ ]* 12.3 Escribir test de propiedad para `PaymentCalculator` — Propiedad 2
    - **Propiedad 2: `overtime_pay >= 0` siempre, independientemente de los inputs**
    - **Valida: Requisito 8.2**
  - [ ]* 12.4 Escribir test de propiedad para `PaymentCalculator` — Propiedad 3
    - **Propiedad 3: Si `hours_worked <= weekly_hours_remaining`, entonces `overtime_pay = 0`**
    - **Valida: Requisito 8.2**
  - [ ]* 12.5 Escribir tests unitarios parametrizados para `PaymentCalculator`
    - Casos: horas regulares puras, horas extra puras, combinación regular + extra, límite exacto
    - _Requisitos: 8.1, 8.2, 8.4_

- [ ] 13. Servicio de notificaciones asíncrono
  - [ ] 13.1 Implementar `NotificationService` y workers
    - Crear `app/services/notification_service.py` con método `async send(user_id, company_id, type, channel, context)`
    - Insertar registro en tabla `notifications` con status `pending` antes de enviar
    - Implementar `EmailWorker` con Resend SDK, enviando en el idioma preferido del usuario (RNF-07)
    - Implementar `SMSWorker` con Twilio SDK, enviando en el idioma preferido del usuario
    - Implementar lógica de reintentos: hasta 3 intentos con backoff exponencial; marcar como `failed` al agotar intentos (Requisito 9.6)
    - Actualizar `notifications.status`, `attempts`, `sent_at` y `error_message` según resultado
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, RNF-08_
  - [ ] 13.2 Integrar notificaciones en flujos de negocio
    - Conectar `NotificationService` en: publicación de evento (9.1), aprobación de asignación (9.2), solicitud directa (9.3), remoción de empleado (9.4), cancelación de evento (9.5)
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ]* 13.3 Escribir tests unitarios para `NotificationService`
    - Testear encolado, reintentos, marcado como fallido y registro en BD
    - _Requisitos: 9.6_

- [ ] 14. Checkpoint — Verificar que todos los tests pasen
  - Asegurarse de que todos los tests pasen hasta este punto. Consultar al usuario si surgen dudas.

- [x] 15. Reportes
  - [x] 15.1 Implementar `ReportService` y router `/reports`
    - `GET /reports/events/{id}` → reporte por evento: empleados, rol, clock-in/out, horas trabajadas, valor a pagar (Requisito 10.1)
    - `GET /reports/employees/{user_id}?from=&to=` → reporte por empleado en rango de fechas: eventos, horas por evento, valor a pagar (Requisito 10.2)
    - `GET /reports/me?from=&to=` → empleado consulta su propio reporte (Requisito 10.4)
    - Calcular totales de horas y valor a pagar en cada reporte (Requisito 10.5)
    - Restringir acceso: Admin y Coordinator ven reportes de empresa; Employee solo los propios (Requisitos 10.3, 10.4)
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 15.2 Implementar exportación CSV
    - Agregar parámetro `?format=csv` a los endpoints de reporte para retornar `text/csv` (Requisito 10.6)
    - _Requisitos: 10.6_
  - [ ]* 15.3 Escribir tests unitarios para `ReportService`
    - Testear cálculo de totales, filtros de fecha y restricciones de acceso por rol
    - _Requisitos: 10.1, 10.2, 10.4, 10.5_

- [ ] 16. Perfil del empleado y calificaciones
  - [ ] 16.1 Implementar perfil de empleado
    - `GET /employees/{user_id}/profile` → obtener perfil con bio, avatar, `average_rating`, `total_events` (Requisito 11.1)
    - `PATCH /employees/me/profile` → empleado actualiza bio y avatar (Requisito 11.1)
    - _Requisitos: 11.1_
  - [ ] 16.2 Implementar sistema de calificaciones
    - `POST /events/{id}/ratings/{user_id}` → Admin registra calificación 1-5 y comentario opcional al finalizar evento (Requisito 11.3)
    - Actualizar `employee_profiles.average_rating` y `total_events` tras cada calificación
    - `GET /employees/me/ratings` → empleado consulta su historial de calificaciones (Requisito 11.4)
    - Mostrar calificaciones de otras empresas sin revelar datos confidenciales (Requisito 11.2)
    - _Requisitos: 11.2, 11.3, 11.4_
  - [ ]* 16.3 Escribir tests unitarios para calificaciones
    - Testear registro, unicidad por evento+empleado y actualización de promedio
    - _Requisitos: 11.3, 11.4_

- [ ] 17. Frontend — Autenticación y layout base
  - [x] 17.1 Implementar flujo de login multitenant
    - Crear página `LoginPage` con formulario email + contraseña
    - Llamar `GET /auth/companies` para mostrar selector de empresa activa (Requisito 2.5)
    - Llamar `POST /auth/login` y almacenar JWT en memoria / httpOnly cookie
    - Crear `AuthContext` con `user_id`, `company_id`, `role` y función `switchCompany` (Requisito 2.4)
    - _Requisitos: 2.1, 2.4, 2.5_
  - [ ] 17.2 Implementar layout y navegación por rol
    - Crear layout principal con sidebar/navbar adaptado al rol del usuario
    - Implementar rutas protegidas que validan rol antes de renderizar
    - Configurar `react-i18next` con archivos `es.json` y `en.json`; selector de idioma en perfil (RNF-07)
    - _Requisitos: 2.3, RNF-06, RNF-07_

- [ ] 18. Frontend — Gestión de empresas, usuarios y roles laborales
  - [ ] 18.1 Implementar vistas de Super Admin
    - Página de listado y creación de empresas (Requisito 1.1)
    - Controles de activar/desactivar empresa (Requisito 1.2)
    - _Requisitos: 1.1, 1.2_
  - [ ] 18.2 Implementar gestión de usuarios y roles laborales (Admin)
    - Página de búsqueda de usuario por email, creación y asociación a empresa (Requisitos 3.1, 3.2, 3.3)
    - Página de roles laborales: crear, editar tarifa, desactivar (Requisitos 4.1, 4.2, 4.6)
    - Formulario de asociación de roles a empleados (Requisito 4.3)
    - Formulario de configuración de semana laboral (Requisito 4.7)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.6, 4.7_

- [ ] 19. Frontend — Gestión de eventos y asignaciones
  - [ ] 19.1 Implementar vistas de eventos (Admin)
    - Formulario de creación/edición de evento con campos: nombre, fecha, horario, dirección, coordenadas, dress code y roles requeridos con cupos (Requisito 5.1)
    - Botones de publicar y cancelar evento con confirmación (Requisitos 5.2, 5.4)
    - Indicador visual de cupos completos por rol (Requisito 6.9)
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 6.9_
  - [ ] 19.2 Implementar gestión de asignaciones (Admin)
    - Panel de asignaciones por evento: aprobar, asignar directamente, invitar, remover (Requisitos 6.5, 6.6, 6.7, 6.8)
    - _Requisitos: 6.5, 6.6, 6.7, 6.8_
  - [ ] 19.3 Implementar vista de eventos para empleado
    - Listado de eventos disponibles con botón de aplicar y selector de rol (Requisitos 6.1, 6.2)
    - Estado de asignación del empleado en cada evento (pendiente / aprobado)
    - _Requisitos: 6.1, 6.2, 6.3_

- [ ] 20. Frontend — Registro de turnos y reportes
  - [ ] 20.1 Implementar registro de turno (Employee)
    - Botón de clock-in: captura coordenadas GPS via API del navegador y envía al backend (RNF-11)
    - Botón de clock-out: captura coordenadas GPS y envía al backend
    - Mostrar mensaje de error si el empleado está fuera del radio de 500m (RNF-11)
    - Formulario mobile-first completable en máximo 3 pasos (RNF-06)
    - _Requisitos: 7.1, 7.2, 7.6, RNF-06, RNF-11_
  - [ ] 20.2 Implementar vistas de reportes
    - Página de reporte por evento con tabla de empleados, horas y pagos (Requisito 10.1)
    - Página de reporte por empleado con filtro de fechas (Requisito 10.2)
    - Botón de exportar CSV (Requisito 10.6)
    - Vista de reporte propio para el empleado (Requisito 10.4)
    - _Requisitos: 10.1, 10.2, 10.4, 10.5, 10.6_

- [ ] 21. Checkpoint final — Verificar que todos los tests pasen
  - Asegurarse de que todos los tests pasen. Revisar cobertura mínima del 70% en servicios (RNF-05). Consultar al usuario si surgen dudas.

---

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia los requisitos específicos que implementa para trazabilidad.
- Los checkpoints garantizan validación incremental antes de avanzar al siguiente módulo.
- Las propiedades 1, 2 y 3 del `PaymentCalculator` se implementan con `hypothesis` (Python).
- Los tests unitarios usan `pytest` con mocks de repositorios para aislar la capa de servicios.
