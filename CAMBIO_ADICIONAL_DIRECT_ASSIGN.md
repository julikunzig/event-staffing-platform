# Cambio Adicional - Validación en Direct Assign

**Fecha**: 10 de Mayo, 2026  
**Tarea**: Agregar validación de `horas_entre_eventos` a `direct_assign()`

---

## 🎯 Problema Identificado

Cuando un administrador asigna directamente a un empleado a un turno (usando `POST /assignments/events/{event_id}/assign`), no se validaba que el empleado no tuviera otro turno en el rango de horas parametrizado en `horas_entre_eventos`.

---

## ✅ Solución Implementada

Se agregó la validación de `horas_entre_eventos` a la función `direct_assign()` en `backend/app/routers/assignments.py`.

### Cambio Exacto

**Archivo**: `backend/app/routers/assignments.py`

**Función**: `direct_assign()` (línea ~223)

**Código Agregado**:

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
        # Verificar si el usuario tiene una asignación (pending, approved o invitada) en ese evento
        other_assignment = await db.execute(
            select(EventAssignment).where(
                EventAssignment.event_id == other_event.id,
                EventAssignment.user_id == body.user_id,
                EventAssignment.status.in_(["pending", "approved", "invited"]),
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
                        detail=f"No puedes asignar a este empleado. Tiene otro evento el mismo día con menos de {horas_entre_eventos} horas de diferencia. Diferencia actual: {time_diff:.1f} horas."
                    )
            except ValueError:
                # Si hay error en parsing de fecha/hora, continuar
                pass
```

---

## 🔄 Flujos Validados Ahora

### Aplicación a Evento
```
✅ Evento publicado
✅ Empleado tiene rol
✅ No tiene asignación ya
✅ Horas entre eventos OK
✅ Cupos disponibles
→ Asignación creada
```

### Invitación a Empleado
```
✅ Evento publicado
✅ Empleado no tiene asignación
✅ Horas entre eventos OK
✅ Cupos disponibles
→ Asignación creada
```

### Asignación Directa (NUEVO)
```
✅ Evento en estado publicado o draft
✅ Empleado no tiene asignación
✅ Horas entre eventos OK (NUEVO)
✅ Cupos disponibles
→ Asignación aprobada directamente
```

### Aprobación de Asignación
```
✅ Asignación en estado "pending"
✅ Horas entre eventos OK
✅ Cupo disponible
→ Asignación aprobada
```

---

## 🚀 Deployment

### Backend
```bash
docker restart event_staffing_backend
```
✅ Completado

---

## 🧪 Testing

### Test: Asignación Directa con Conflicto

**Configuración**:
- `horas_entre_eventos` = 2 horas
- Evento A: 2026-05-15 14:00 (empleado aprobado)
- Evento B: 2026-05-15 15:00 (publicado)

**Pasos**:
1. Admin intenta asignar directamente al empleado a Evento B
2. ❌ **Resultado Esperado**: Error 400
   ```
   "No puedes asignar a este empleado. Tiene otro evento el mismo día 
   con menos de 2 horas de diferencia. Diferencia actual: 1.0 horas."
   ```

---

## 📊 Resumen

| Aspecto | Detalle |
|---------|---------|
| **Función** | `direct_assign()` |
| **Archivo** | `backend/app/routers/assignments.py` |
| **Cambio** | Agregar validación de `horas_entre_eventos` |
| **Líneas** | +60 |
| **Status** | ✅ Completado |

---

## ✨ Conclusión

Ahora la validación de `horas_entre_eventos` se aplica en **4 puntos**:
1. ✅ Aplicación del empleado
2. ✅ Invitación del admin
3. ✅ Asignación directa del admin (NUEVO)
4. ✅ Aprobación del admin

El sistema ahora protege completamente al empleado de sobrecarga de trabajo en el mismo día.

---

**Fecha**: 10 de Mayo, 2026  
**Status**: ✅ COMPLETADO

