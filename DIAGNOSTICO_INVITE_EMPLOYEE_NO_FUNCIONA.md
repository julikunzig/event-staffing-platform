# Diagnóstico: Por qué `invite_employee()` No Funciona

## 🐛 Problema Reportado

El usuario reporta que cuando el admin presiona "enviar invitación", **la validación de `horas_entre_eventos` NO funciona**.

## 🔍 Análisis

### Código de `invite_employee()`

La función tiene validación de `horas_entre_eventos`:

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
        # Verificar si el usuario tiene una asignación
        other_assignment = await db.execute(
            select(EventAssignment).where(
                EventAssignment.event_id == other_event.id,
                EventAssignment.user_id == body.user_id,
                EventAssignment.status.in_(["pending", "approved"]),
            )
        )
        if other_assignment.scalar_one_or_none():
            # Calcular diferencia y validar
            # ...
```

### Posibles Causas

#### 1. ¿El parámetro `horas_entre_eventos` es > 0?

Si `horas_entre_eventos = 0`, la validación se salta completamente.

**Verificación**: 
- Ve a **Gestión de Empresa**
- Verifica que **"Horas Entre Eventos"** = 4 (o > 0)

#### 2. ¿Los eventos están en la MISMA FECHA?

La búsqueda usa `Event.event_date == event.event_date`, así que si los eventos están en fechas diferentes, no se valida.

**Verificación**:
- Evento 1 y Evento 2 deben estar en la MISMA FECHA
- No pueden estar en fechas diferentes

#### 3. ¿El empleado tiene una asignación previa?

La validación busca asignaciones con status `["pending", "approved"]`.

Si el empleado NO tiene una asignación previa, no hay conflicto.

**Verificación**:
- Primero invita al empleado a Evento 1
- Luego intenta invitar al MISMO empleado a Evento 2
- El empleado debe tener una asignación en Evento 1

#### 4. ¿El endpoint está siendo llamado correctamente?

El frontend debe estar llamando a:
```
POST /assignments/events/{event_id}/invite
```

Con body:
```json
{
  "user_id": 123,
  "job_role_id": 456
}
```

**Verificación**:
- Abre la consola del navegador (F12)
- Ve a la pestaña **Network**
- Presiona "enviar invitación"
- Busca la request POST a `/invite`
- Verifica que el status es 200 (éxito) o 400 (error)

#### 5. ¿Hay un error en la validación?

Si hay un error en el código, la validación podría no funcionar.

**Verificación**:
- Revisa los logs del backend: `docker logs event_staffing_backend | tail -50`
- Busca mensajes de error

## 📋 Checklist de Verificación

- [ ] `horas_entre_eventos` > 0 (verificar en Gestión de Empresa)
- [ ] Evento 1 y Evento 2 están en la MISMA FECHA
- [ ] Evento 1 y Evento 2 tienen el MISMO ROL
- [ ] Evento 1 y Evento 2 tienen diferencia < 4 horas (22:32 y 23:30 = 0.97 horas)
- [ ] Primero invita al empleado a Evento 1
- [ ] Luego intenta invitar al MISMO empleado a Evento 2
- [ ] Abre la consola del navegador (F12)
- [ ] Ve a la pestaña Network
- [ ] Presiona "enviar invitación"
- [ ] Verifica que la request POST a `/invite` tiene status 400 (error)
- [ ] Verifica que el mensaje de error es claro

## 🔧 Solución

Si la validación no funciona, podría ser por:

1. **Parámetro es 0**: Cambiar a 4 en Gestión de Empresa
2. **Eventos en fechas diferentes**: Crear eventos en la MISMA FECHA
3. **Empleado sin asignación previa**: Primero invitar a Evento 1
4. **Endpoint no llamado**: Verificar en la consola del navegador
5. **Error en el código**: Revisar los logs del backend

## 📝 Próximos Pasos

1. Verificar el checklist anterior
2. Si todo está correcto y sigue sin funcionar, revisar los logs
3. Agregar debugging si es necesario

---

**Status**: 🔴 REQUIERE INVESTIGACIÓN
