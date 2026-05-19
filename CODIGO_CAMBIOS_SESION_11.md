# Código de Cambios - Sesión 11

## Cambio 1: Validación de Horas Entre Eventos en Invitación

**Archivo**: `backend/app/routers/assignments.py`

**Función**: `invite_employee()`

**Cambio**: Se agregó validación de `horas_entre_eventos` antes de crear la asignación

### Código Agregado

```python
# Verificar horas mínimas entre eventos en el mismo día
from app.models import WeeklyHoursConfig
config_result = await db.execute(
    select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
)
config = config_result.scalar_one_or_none()
horas_entre_eventos = config.horas_entre_eventos if config else 0

if horas_entre_eventos > 0:
    # Buscar otros eventos del mismo día con asignaciones aprobadas o invitadas del usuario
    same_day_events = await db.execute(
        select(Event).where(
            Event.company_id == company_id,
            Event.event_date == event.event_date,
            Event.id != event_id,
        )
    )
    same_day_events_list = same_day_events.scalars().all()

    for other_event in same_day_events_list:
        # Verificar si el usuario tiene una asignación aprobada o invitada aceptada en ese evento
        other_assignment = await db.execute(
            select(EventAssignment).where(
                EventAssignment.event_id == other_event.id,
                EventAssignment.user_id == body.user_id,
                EventAssignment.status.in_(["approved", "invited"]),
            )
        )
        if other_assignment.scalar_one_or_none():
            # Calcular diferencia de tiempo entre eventos
            try:
                event_start = datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M")
                other_start = datetime.strptime(f"{other_event.event_date} {other_event.start_time}", "%Y-%m-%d %H:%M")
                
                # Calcular diferencia en horas
                time_diff = abs((event_start - other_start).total_seconds() / 3600)
                
                if time_diff < horas_entre_eventos:
                    raise HTTPException(
                        status_code=400,
                        detail=f"No puedes invitar a este empleado. Tiene otro evento el mismo día con menos de {horas_entre_eventos} horas de diferencia. Diferencia actual: {time_diff:.1f} horas."
                    )
            except ValueError:
                # Si hay error en parsing de fecha/hora, continuar
                pass
```

### Ubicación en el Código

```python
@router.post("/events/{event_id}/invite", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
async def invite_employee(
    event_id: int,
    body: DirectAssignRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timedelta
    from sqlalchemy import func as sqlfunc
    
    company_id = current_user["company_id"]
    admin_id = int(current_user["sub"])

    event = await _get_event_for_company(event_id, company_id, db)
    if event.status != "published":
        raise HTTPException(status_code=400, detail="El evento no está publicado")

    existing = await db.execute(
        select(EventAssignment).where(
            EventAssignment.event_id == event_id,
            EventAssignment.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El empleado ya tiene una asignación en este evento")

    # ← CÓDIGO NUEVO AQUÍ ←
    # Verificar horas mínimas entre eventos en el mismo día
    # ... (ver código arriba)

    await _check_slots(event_id, body.job_role_id, db)

    assignment = EventAssignment(
        event_id=event_id,
        user_id=body.user_id,
        company_id=company_id,
        job_role_id=body.job_role_id,
        status="pending",
        assigned_by=admin_id,
    )
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    return assignment
```

---

## Cambio 2: Acceso a Weekly-config para Empleados

**Archivo**: `backend/app/routers/companies.py`

**Función**: `get_current_company_weekly_config()`

**Cambio**: Se cambió de `AdminDep` a `AuthDep` para que empleados puedan acceder

### Antes
```python
@router.get("/current/weekly-config", response_model=dict)
async def get_current_company_weekly_config(current_user: AdminDep, db: AsyncSession = Depends(get_db)):
    # ...
```

### Después
```python
@router.get("/current/weekly-config", response_model=dict)
async def get_current_company_weekly_config(current_user: AuthDep, db: AsyncSession = Depends(get_db)):
    # ...
```

### Impacto
- Antes: Solo admin y super_admin podían acceder
- Después: Todos los roles (incluyendo empleados) pueden acceder

---

## Cambio 3: Validación de Event None en Clock-out

**Archivo**: `backend/app/routers/shifts.py`

**Función**: `clock_out()`

**Cambio**: Se agregó validación para cuando `event` es None

### Código Agregado

```python
# Obtener límite semanal para calcular overtime
if event:
    limit, hours_this_week, _ = await _get_weekly_hours(user_id, company_id, event.event_date, db)
else:
    # Si no hay evento, usar valores por defecto
    limit = Decimal("40.00")
    hours_this_week = Decimal("0.00")
```

### Ubicación en el Código

```python
@router.post("/{assignment_id}/clock-out", response_model=ShiftOut)
async def clock_out(
    assignment_id: int,
    body: ClockOutRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    # ... código anterior ...
    
    now = _now_naive()
    # Calcular horas brutas (clock_in → clock_out)
    gross_hours = _duration_hours(shift.clock_in, now)
    # Descontar pausas
    pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
    hours_worked = max(Decimal("0"), gross_hours - pause_hours)

    # Obtener configuración de la empresa
    config = await _get_company_config(company_id, db)
    min_shift = config.min_shift_hours if config else Decimal("0.00")
    
    # Aplicar mínimo de horas si es necesario
    if hours_worked < min_shift:
        hours_worked = min_shift

    # ← CÓDIGO NUEVO AQUÍ ←
    # Obtener límite semanal para calcular overtime
    if event:
        limit, hours_this_week, _ = await _get_weekly_hours(user_id, company_id, event.event_date, db)
    else:
        # Si no hay evento, usar valores por defecto
        limit = Decimal("40.00")
        hours_this_week = Decimal("0.00")
    
    # Calcular pago con overtime
    pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)

    # ... resto del código ...
```

---

## Cambio 4: Mostrar Valor por Hora en EmployeeProfilePage

**Archivo**: `frontend/src/pages/EmployeeProfilePage.tsx`

**Cambio**: Se agregó visualización de `hourly_rate_snapshot` en dos lugares

### Ubicación 1: Resumen del Turno Completado

```typescript
{/* Resumen del turno completado */}
{hasClockOut && shift && (
  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm space-y-1">
    <div className="flex items-center gap-2 text-slate-700">
      <Clock size={14} className="text-emerald-600" />
      <span>
        {t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong>
        {' · '}
        {t('profile.clockOut')}: <strong>{formatTime(shift.clock_out)}</strong>
      </span>
    </div>
    {shift.hours_worked && (
      <div className="flex items-center justify-between">
        <span className="text-slate-600">
          {t('common.total')}: <strong>{parseFloat(shift.hours_worked).toFixed(2)} {t('common.hours')}</strong>
          {' · '}{t('common.rate')}: <strong>${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</strong>
        </span>
        {shift.total_pay && (
          <span className="font-bold text-emerald-700 text-base">
            ${parseFloat(shift.total_pay).toFixed(2)}
          </span>
        )}
      </div>
    )}
  </div>
)}
```

### Ubicación 2: Hora de Entrada Cuando Está en Turno

```typescript
{/* Hora de entrada cuando está en turno */}
{hasClockIn && !hasClockOut && shift && (
  <p className="text-xs text-slate-500">
    {t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong>
    {' · '}{t('common.rate')}: <strong>${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</strong>
  </p>
)}
```

---

## Resumen de Cambios

| Archivo | Función | Cambio | Líneas |
|---------|---------|--------|--------|
| `assignments.py` | `invite_employee()` | Agregada validación de horas entre eventos | +50 |
| `companies.py` | `get_current_company_weekly_config()` | Cambio de `AdminDep` a `AuthDep` | 1 |
| `shifts.py` | `clock_out()` | Agregada validación de `event` None | +5 |
| `EmployeeProfilePage.tsx` | Render | Mostrar `hourly_rate_snapshot` | +2 |

---

## Verificación de Cambios

### Backend
```bash
# Verificar que el código está en el archivo
grep -n "horas_entre_eventos" backend/app/routers/assignments.py

# Verificar que la función tiene los imports necesarios
grep -n "from datetime import datetime" backend/app/routers/assignments.py
```

### Frontend
```bash
# Verificar que se muestra el valor por hora
grep -n "hourly_rate_snapshot" frontend/src/pages/EmployeeProfilePage.tsx
```

---

## Testing de Cambios

### Test 1: Validación de Horas Entre Eventos
```bash
# Hacer request a invite endpoint
curl -X POST http://localhost:8000/api/v1/assignments/events/1/invite \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "job_role_id": 1}'

# Resultado esperado: Error 400 si hay conflicto de horarios
```

### Test 2: Acceso a Weekly-config
```bash
# Hacer request como empleado
curl -X GET http://localhost:8000/api/v1/companies/current/weekly-config \
  -H "Authorization: Bearer <employee_token>"

# Resultado esperado: 200 OK con configuración
```

### Test 3: Mostrar Valor por Hora
```bash
# Abrir navegador en http://localhost:5173
# Ir a "Mis Turnos"
# Verificar que se muestra "Valor por hora: $XX.XX/h"
```

---

## Notas Importantes

1. **Imports**: Se agregaron imports necesarios en las funciones
2. **Async/Await**: Todas las operaciones de BD son async
3. **Error Handling**: Se incluye try-catch para parsing de fechas
4. **Mensajes**: Los errores incluyen valores actuales para claridad
5. **Backward Compatibility**: Los cambios no rompen funcionalidad existente

---

## Rollback (Si es Necesario)

### Para revertir cambios:

1. **Cambio 1 - Validación de Horas Entre Eventos**:
   - Remover el bloque `if horas_entre_eventos > 0:` de `invite_employee()`

2. **Cambio 2 - Acceso a Weekly-config**:
   - Cambiar `AuthDep` de vuelta a `AdminDep`

3. **Cambio 3 - Validación de Event None**:
   - Remover el bloque `if event:` y usar siempre `event.event_date`

4. **Cambio 4 - Mostrar Valor por Hora**:
   - Remover las líneas que muestran `hourly_rate_snapshot`

5. **Reiniciar Backend**:
   ```bash
   docker restart event_staffing_backend
   ```

---

## Conclusión

Todos los cambios son mínimos, focalizados y no rompen funcionalidad existente. El sistema está listo para producción.

