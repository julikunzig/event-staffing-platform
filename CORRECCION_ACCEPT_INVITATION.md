# Corrección: Agregar Validación a `accept_invitation()`

## 🐛 Problema Identificado

La función `accept_invitation()` (cuando el empleado confirma una invitación) **NO tenía validación de `horas_entre_eventos`**.

Además, había una inconsistencia de estados:
- `invite_employee()` crea asignaciones con status `"pending"`
- `accept_invitation()` buscaba status `"invited"` (que no existe)

## ✅ Solución Implementada

Se agregó validación de `horas_entre_eventos` a `accept_invitation()` y se corrigió la inconsistencia de estados.

### Cambios Realizados

**Archivo**: `backend/app/routers/assignments.py`

**Función**: `accept_invitation()` (línea 620)

**Cambios**:

1. **Corregir búsqueda de status**:
   ```python
   # ANTES
   if assignment.status != "invited":
   
   # DESPUÉS
   if assignment.status != "pending":
   ```

2. **Agregar validación de `horas_entre_eventos`**:
   ```python
   # Verificar horas mínimas entre eventos en el mismo día
   event = await db.get(Event, assignment.event_id)
   if event and company_id:
       from app.models import WeeklyHoursConfig
       config_result = await db.execute(
           select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
       )
       config = config_result.scalar_one_or_none()
       horas_entre_eventos = config.horas_entre_eventos if config else 0

       if horas_entre_eventos > 0:
           # Buscar otros eventos del mismo día
           same_day_events = await db.execute(
               select(Event).where(
                   Event.company_id == company_id,
                   Event.event_date == event.event_date,
                   Event.id != assignment.event_id,
               )
           )
           same_day_events_list = same_day_events.scalars().all()

           for other_event in same_day_events_list:
               # Verificar si el usuario tiene una asignación
               other_assignment = await db.execute(
                   select(EventAssignment).where(
                       EventAssignment.event_id == other_event.id,
                       EventAssignment.user_id == user_id,
                       EventAssignment.status.in_(["pending", "approved"]),
                   )
               )
               if other_assignment.scalar_one_or_none():
                   # Calcular diferencia de tiempo (valor absoluto)
                   event_start = dt_class.combine(event.event_date, event.start_time)
                   other_start = dt_class.combine(other_event.event_date, other_event.start_time)
                   time_diff = abs((event_start - other_start).total_seconds() / 3600)
                   
                   if time_diff <= horas_entre_eventos:
                       raise HTTPException(...)
   ```

## 📊 Funciones Ahora con Validación

| Función | Validación | Status |
|---------|-----------|--------|
| `apply_to_event()` | ✅ Tiene | ✅ |
| `invite_employee()` | ✅ Tiene | ✅ |
| `direct_assign()` | ✅ Tiene | ✅ |
| `approve_assignment()` | ✅ Tiene | ✅ |
| `accept_invitation()` | ✅ Tiene | ✅ NUEVO |

## 🎯 Validación Bidireccional

El código usa `abs()` para calcular la diferencia, así que funciona en ambas direcciones:

```python
time_diff = abs((event_start - other_start).total_seconds() / 3600)
```

**Ejemplos**:
- Si aplica a 10:32 PM y luego a 11:30 PM: `abs(22:32 - 23:30) = 0.97 horas` ❌ Rechazar
- Si aplica a 11:30 PM y luego a 10:32 PM: `abs(23:30 - 22:32) = 0.97 horas` ❌ Rechazar

## 🚀 Deployment

- ✅ Backend restarted
- ✅ Cambios aplicados
- ✅ Sistema listo para testing

## 🧪 Verificación

### Caso de Prueba: Empleado Confirma Invitación

1. Admin invita a empleado a Evento 1 (22:32): ✅ Permitir
2. Empleado ve la invitación en su perfil
3. Empleado confirma la invitación: ✅ Permitir
4. Admin invita al MISMO empleado a Evento 2 (23:30): ❌ Rechazar
5. Empleado intenta confirmar la invitación a Evento 2: ❌ Rechazar

**Resultado esperado**: Rechaza con mensaje claro

## 📝 Próximos Pasos

1. Verificar que `invite_employee()` funciona correctamente
2. Verificar que `accept_invitation()` funciona correctamente
3. Testing completo
4. Deploy a producción

---

**Status**: 🟢 COMPLETADO
