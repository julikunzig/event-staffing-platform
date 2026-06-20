# Email Queue - instalación

## 1. Copiar archivos

Copiar estos archivos al proyecto:

- `backend/app/models/email_queue.py`
- `backend/app/schemas/email_queue.py`
- `backend/app/services/email_queue_service.py`
- `backend/app/services/email_queue_worker.py`
- `backend/app/routers/email_queue.py`
- `backend/alembic/versions/0023_create_email_queue.py`

## 2. Ajustar migración

En `0023_create_email_queue.py`, reemplazar:

```python
down_revision = "<REPLACE_WITH_CURRENT_HEAD>"
```

por el head actual:

```powershell
docker compose run --rm backend alembic heads
```

Si ya hiciste merge y solo tienes un head, usa ese.

## 3. Registrar modelo

En `backend/app/models/__init__.py` agregar:

```python
from app.models.email_queue import EmailQueue
```

## 4. Registrar router

En `backend/app/main.py` agregar import:

```python
from app.routers import email_queue
```

y donde registras routers:

```python
app.include_router(email_queue.router, prefix="/api/v1")
```

## 5. Iniciar worker

En `backend/app/main.py`, dentro del startup/lifespan:

```python
from app.services.email_queue_worker import start_email_queue_worker, stop_email_queue_worker

start_email_queue_worker()
```

y en shutdown:

```python
await stop_email_queue_worker()
```

## 6. Migrar

```powershell
docker compose run --rm backend alembic upgrade head
docker compose up -d backend
```

## 7. Cambiar disparadores gradualmente

Ejemplo antes:

```python
await send_event_invitation_email(...)
```

Después:

```python
from app.services.email_queue_service import queue_event_invitation_email

await queue_event_invitation_email(
    db=db,
    company_id=company_id,
    employee_email=employee.email,
    event_name=event.name,
    event_date=event.event_date.strftime("%Y-%m-%d"),
    start_time=str(event.start_time),
    address=event.address,
    city=event.city or "",
    state=event.state or "",
    zip_code=event.zip_code or "",
    role_name=role.name,
    hourly_rate=str(role.hourly_rate),
    dress_code=event.dress_code,
)
```

## 8. Ver cola

```http
GET /api/v1/email-queue
```

La cola guarda pendientes rápido. El worker procesa después usando el mismo `_send_template_email()` actual.
