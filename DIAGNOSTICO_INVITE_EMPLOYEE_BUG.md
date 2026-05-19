# Diagnóstico: Bug en Validación de `horas_entre_eventos` en `invite_employee()`

## Problema Reportado

El usuario reporta que la validación de `horas_entre_eventos` **NO funciona** cuando el admin invita a un empleado que ya está asignado a otro evento (aplicado, confirmado o pendiente de aprobación).

**Caso de Prueba**:
- Admin intenta invitar a empleado a Evento 2
- Empleado ya tiene asignación en Evento 1 (mismo día)
- Diferencia: 0.97 horas
- Parámetro `horas_entre_eventos`: 4 horas
- **Resultado esperado**: ❌ Rechazar
- **Resultado actual**: ✅ Permite (BUG)

## Análisis del Código

### Función: `invite_employee()` (línea 312)

```python
async def invite_employee(
    event_id: int,
    body: DirectAssignRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    # ... código ...
    
    if horas_entre_eventos > 0:
        # Buscar otros eventos del mismo día
        same_day_events = await db.execute(
            select(Event).where(
                Event.company_id == company_id,
                Event.event_date == event.event_date,  # ← AQUÍ
                Event.id != event_id,
            )
        )
        same_day_events_list = same_day_events.scalars().all()

        for other_event in same_day_events_list:
            # Verificar si el usuario tiene una asignación
            other_assignment = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.event_id == other_event.id,
                    EventAssignment.user_id == body.user_id,
                    EventAssignment.status.in_(["pending", "approved", "invited", "started"]),
                )
            )
            if other_assignment.scalar_one_or_none():
                # Calcular diferencia y validar
                # ...
```

## Posibles Causas

### 1. ¿El evento está en la misma fecha?
- La búsqueda usa `Event.event_date == event.event_date`
- Si los eventos están en fechas diferentes, no se valida
- **Verificación**: Necesita revisar si los eventos están en la misma fecha

### 2. ¿El estado de la asignación es válido?
- La búsqueda busca estados: `["pending", "approved", "invited", "started"]`
- Si la asignación tiene otro estado, no se valida
- **Verificación**: Necesita revisar qué estado tiene la asignación

### 3. ¿El parámetro `horas_entre_eventos` es > 0?
- Si es 0, la validación se salta
- **Verificación**: Necesita revisar el valor del parámetro

### 4. ¿Hay un problema con la búsqueda de eventos?
- La búsqueda podría no estar encontrando el otro evento
- **Verificación**: Necesita revisar si la query está correcta

### 5. ¿Hay un problema con la búsqueda de asignaciones?
- La búsqueda podría no estar encontrando la asignación
- **Verificación**: Necesita revisar si la query está correcta

## Hipótesis Más Probable

**El problema es que la búsqueda de eventos está correcta, pero hay un estado de asignación que NO está siendo considerado.**

Posibles estados que podrían no estar siendo validados:
- `"rejected"` - Rechazado
- `"removed"` - Removido
- `"finished"` - Finalizado
- Otro estado no documentado

## Solución Propuesta

Agregar debugging para identificar:

1. ¿Cuál es el valor de `horas_entre_eventos`?
2. ¿Cuántos eventos hay en el mismo día?
3. ¿Cuál es el estado de la asignación del empleado?
4. ¿Se está ejecutando la validación?

## Próximos Pasos

1. Agregar logging detallado a `invite_employee()`
2. Ejecutar el caso de prueba del usuario
3. Revisar los logs para identificar dónde falla
4. Corregir el problema
5. Verificar que funciona

## Archivos a Revisar

- `backend/app/routers/assignments.py` - Función `invite_employee()`
- `backend/app/models/event.py` - Modelo Event
- `backend/app/models/assignment.py` - Modelo EventAssignment
- Base de datos - Estados de asignaciones

## Nota

Este es un nuevo bug diferente al que se corrigió en la sesión anterior. El parsing de fecha/hora ya fue corregido, pero hay otro problema que impide que la validación funcione en `invite_employee()`.
