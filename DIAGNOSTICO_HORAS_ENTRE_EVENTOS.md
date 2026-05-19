# Diagnóstico: Validación de `horas_entre_eventos` No Funciona

## Problema Reportado

El usuario reporta que el sistema permite a un empleado aplicar a dos eventos el mismo día cuando no debería:

- **Evento 1**: 10:32 PM (22:32)
- **Evento 2**: 11:30 PM (23:30)
- **Diferencia**: 58 minutos = 0.97 horas
- **Parámetro `horas_entre_eventos`**: 4 horas
- **Resultado esperado**: ❌ No debe permitir (0.97 < 4)
- **Resultado actual**: ✅ Permite (BUG)

## Análisis de la Lógica

### Código en `apply_to_event()` (líneas 115-160)

```python
if horas_entre_eventos > 0:
    # Buscar otros eventos del mismo día
    same_day_events = await db.execute(
        select(Event).where(
            Event.company_id == company_id,
            Event.event_date == event.event_date,
            Event.id != event_id,
        )
    )
    same_day_events_list = same_day_events.scalars().all()

    for other_event in same_day_events_list:
        # Verificar si el usuario tiene una asignación en ese evento
        other_assignment = await db.execute(
            select(EventAssignment).where(
                EventAssignment.event_id == other_event.id,
                EventAssignment.user_id == user_id,
                EventAssignment.status.in_(["pending", "approved", "invited", "started"]),
            )
        )
        other_assign_obj = other_assignment.scalar_one_or_none()
        
        if other_assign_obj:
            # Calcular diferencia de tiempo
            event_start = datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M")
            other_start = datetime.strptime(f"{other_event.event_date} {other_event.start_time}", "%Y-%m-%d %H:%M")
            
            time_diff = abs((event_start - other_start).total_seconds() / 3600)
            
            if time_diff <= horas_entre_eventos:
                raise HTTPException(...)
```

### Posibles Problemas

1. **¿El parámetro `horas_entre_eventos` es 0?**
   - Si es 0, la validación se salta completamente (`if horas_entre_eventos > 0`)
   - **Verificación**: ✅ El parámetro es 4 para la empresa 3

2. **¿El evento anterior tiene una asignación con status válido?**
   - La validación solo busca asignaciones con status `["pending", "approved", "invited", "started"]`
   - Si el empleado aplicó al evento anterior, debería tener status `"pending"`
   - **Verificación**: Necesita revisar la BD

3. **¿El parsing de fecha/hora es correcto?**
   - El código usa `datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M")`
   - Si `event.start_time` tiene segundos (ej: "22:32:00"), el parsing fallará
   - **Verificación**: Necesita revisar el formato en la BD

4. **¿El cálculo de diferencia es correcto?**
   - El código usa `abs((event_start - other_start).total_seconds() / 3600)`
   - Esto calcula la diferencia absoluta en horas
   - **Verificación**: La lógica parece correcta

## Hipótesis Más Probable

**El parsing de fecha/hora está fallando** porque `event.start_time` probablemente tiene formato `HH:MM:SS` (con segundos), pero el código espera `HH:MM`.

Cuando el parsing falla, el código tiene un `try/except` que simplemente continúa:

```python
try:
    event_start = datetime.strptime(...)
    other_start = datetime.strptime(...)
    time_diff = abs(...)
    if time_diff <= horas_entre_eventos:
        raise HTTPException(...)
except ValueError:
    # Si hay error en parsing de fecha/hora, continuar
    pass
```

**Esto significa que si el parsing falla, la validación se salta silenciosamente.**

## Solución

Cambiar el formato de parsing para aceptar tanto `HH:MM` como `HH:MM:SS`:

```python
# Formato flexible que acepta HH:MM o HH:MM:SS
try:
    event_start = datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M:%S")
except ValueError:
    event_start = datetime.strptime(f"{event.event_date} {event.start_time}", "%Y-%m-%d %H:%M")

try:
    other_start = datetime.strptime(f"{other_event.event_date} {other_event.start_time}", "%Y-%m-%d %H:%M:%S")
except ValueError:
    other_start = datetime.strptime(f"{other_event.event_date} {other_event.start_time}", "%Y-%m-%d %H:%M")
```

O mejor aún, usar `fromisoformat()` que es más flexible:

```python
from datetime import datetime
event_start = datetime.fromisoformat(f"{event.event_date}T{event.start_time}")
other_start = datetime.fromisoformat(f"{other_event.event_date}T{other_event.start_time}")
```

## Próximos Pasos

1. Verificar el formato de `event.start_time` en la BD
2. Corregir el parsing de fecha/hora
3. Agregar logging para diagnosticar el problema
4. Aplicar la misma corrección a las otras 3 funciones:
   - `invite_employee()`
   - `direct_assign()`
   - `approve_assignment()`
