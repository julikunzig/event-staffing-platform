# Cómo agregar una nueva tarea programada en Kalirio

Las tareas programadas usan **APScheduler** corriendo dentro del proceso FastAPI.
Cada tarea tiene 4 componentes: la lógica async, el wrapper síncrono, el registro
en el scheduler y la plantilla de correo.

---

## Archivos que hay que tocar

| Archivo | Qué se hace |
|---|---|
| `backend/app/services/reminder_scheduler.py` | Lógica async + wrapper + registro del job |
| `backend/app/routers/scheduler.py` | Exponer el job en la API admin |
| `backend/scripts/seed_email_templates.py` | Plantilla de correo inicial |
| `frontend/src/i18n/es.json` y `en.json` | Etiqueta y descripción del job en la UI |

---

## Paso 1 — Lógica en `reminder_scheduler.py`

### 1a. Función async con la consulta y el envío

```python
async def _send_mi_nueva_tarea() -> None:
    async with AsyncSessionLocal() as db:
        # Consulta los registros que necesita notificar
        result = await db.execute(
            select(EventAssignment)
            .join(Event, ...)
            .join(User, ...)
            .where(
                # tus filtros aquí
            )
        )
        registros = result.scalars().all()

        for r in registros:
            await queue_template_email(
                db=db,
                company_id=r.event.company_id,
                template_code="MI_NUEVA_PLANTILLA",   # <-- código de la plantilla
                to_email=r.user.email,
                variables={
                    "event_name": r.event.name,
                    # ... variables que usa la plantilla
                },
            )
```

### 1b. Wrapper síncrono (requerido por APScheduler)

```python
def _run_mi_nueva_tarea():
    asyncio.create_task(_send_mi_nueva_tarea())
```

### 1c. Registrar el job en `start_reminder_scheduler()`

Dentro de la función `start_reminder_scheduler()`, agrega:

```python
_scheduler.add_job(
    _run_mi_nueva_tarea,
    trigger="cron",      # o "interval"
    hour=10,             # Ejemplos de trigger:
    minute=0,            #   cron: hour=10, minute=0  → diario a las 10:00 UTC
    id="mi_nueva_tarea", #   interval: hours=2        → cada 2 horas
    replace_existing=True,
)
```

**Triggers disponibles:**

| Tipo | Parámetros | Ejemplo |
|---|---|---|
| `interval` | `hours=N`, `minutes=N` | Cada N horas/minutos |
| `cron` | `hour`, `minute`, `day_of_week` | A hora fija diaria/semanal |
| `cron` semanal | `day_of_week='mon'`, `hour=9` | Lunes a las 09:00 UTC |

---

## Paso 2 — Exponer en el router `scheduler.py`

### 2a. Registrar el código de plantilla

```python
_JOB_TEMPLATE_CODE = {
    "invitation_reminders": "INVITATION_REMINDER",
    "shift_reminders":      "SHIFT_REMINDER",
    "mi_nueva_tarea":       "MI_NUEVA_PLANTILLA",   # <-- agregar
}
```

### 2b. Registrar el runner

```python
_JOB_RUNNERS = {
    "invitation_reminders": _run_invitation_reminders,
    "shift_reminders":      _run_shift_reminders,
    "mi_nueva_tarea":       _run_mi_nueva_tarea,    # <-- agregar
}
```

### 2c. Importar el wrapper nuevo

```python
from app.services.reminder_scheduler import (
    _run_invitation_reminders,
    _run_shift_reminders,
    _run_mi_nueva_tarea,    # <-- agregar
)
```

Con esto el job aparece automáticamente en la UI con soporte para:
- Ver/editar su plantilla de correo
- Ver el log de últimos envíos
- Ejecutarlo manualmente
- Pausarlo/reanudarlo
- Enviar correo de prueba

---

## Paso 3 — Plantilla de correo en `seed_email_templates.py`

Agrega un dict al array `DEFAULT_EMAIL_TEMPLATES`:

```python
{
    "code": "MI_NUEVA_PLANTILLA",
    "name": "Nombre descriptivo de la plantilla",
    "subject": "Asunto del correo — {{event_name}}",
    "variables": [
        "event_name",
        "event_date",
        # ... las variables que uses en el cuerpo
    ],
    "html_body": """
<h2>Título del correo</h2>
<p>Cuerpo en HTML. Usa {{variable}} para sustituir valores.</p>
<ul>
  <li><strong>Evento:</strong> {{event_name}}</li>
  <li><strong>Fecha:</strong> {{event_date}}</li>
</ul>
""",
    "text_body": """
Asunto del correo

Evento: {{event_name}}
Fecha: {{event_date}}
""",
},
```

El seed se ejecuta automáticamente al arrancar el backend. Si la plantilla ya
existe para una empresa, no la sobreescribe.

---

## Paso 4 — Traducciones en `es.json` / `en.json`

En ambos archivos, dentro de `"scheduler" → "jobs"`:

```json
"mi_nueva_tarea": {
  "label": "Nombre visible en la UI",
  "desc": "Descripción corta de cuándo y a quién se envía."
}
```

El `id` del job en APScheduler (`"mi_nueva_tarea"`) debe coincidir exactamente
con la clave en el JSON de traducciones.

---

## Variables de ejemplo para correos de prueba

El endpoint `POST /scheduler/jobs/{job_id}/template/test` rellena las variables
con datos de ejemplo definidos en `_SAMPLE_VARIABLES` dentro de `scheduler.py`.
Si tu nueva tarea usa variables distintas a las existentes, agrégalas ahí:

```python
_SAMPLE_VARIABLES = {
    "event_name":  "Evento de Prueba — Kalirio",
    "event_date":  "July 15, 2026",
    "start_time":  "09:00 AM",
    "address":     "Calle Ejemplo 123",
    "city":        "Ciudad de Prueba",
    "state":       "Estado",
    "zip_code":    "00000",
    "role_name":   "Coordinador",
    "dress_code":  "Formal",
    # agrega aquí las nuevas variables de tu plantilla
    "mi_variable": "Valor de ejemplo",
}
```

---

## Verificación final

1. Reinicia el backend (en local: `docker compose restart backend`)
2. Entra a `/scheduler` — el nuevo job aparece en la lista
3. Expande el job → pestaña **Plantilla de correo** → envía prueba
4. Verifica que llega el correo con las variables sustituidas
5. Haz commit y corre el deploy script en el servidor

```bash
# Servidor
bash /opt/kalimas/deploy-kalirio.sh
```
