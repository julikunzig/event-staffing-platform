# Test del Fix de Zona Horaria

## Cambios Realizados

Se implementó un fix para manejar correctamente la zona horaria al cerrar eventos:

1. **Agregada función `_get_timezone_from_state()`**: Convierte el estado del evento a la zona horaria correspondiente
2. **Actualizada lógica de `close_event_shifts()`**: 
   - Convierte `clock_in` de UTC a la zona horaria local del evento
   - Compara las horas en la zona horaria local
   - Convierte el resultado de vuelta a UTC para almacenar en la BD

## Casos de Prueba

### Caso 1: Event 6
- **Empleado**: Julian Kunzig
- **Hora de inicio**: 6:36 AM (local)
- **Hora de cierre**: 10:00 AM (local)
- **Horas esperadas**: 3.40 horas
- **Horas mínimas**: 3 horas
- **Resultado esperado**: 3.40 horas (ya que 3.40 > 3)

**Lógica**:
- `clock_in_hour` = 6 (local)
- `close_hour` = 10 (local)
- Condición: `6 > 10` = FALSE → mismo día ✓
- Cálculo: 10:00 - 6:36 = 3:24 = 3.40 horas ✓

### Caso 2: Event 7
- **Empleado**: Hugo
- **Hora de inicio**: 7:08 AM (local)
- **Hora de cierre**: 11:00 AM (local)
- **Horas esperadas**: 3.86 horas
- **Horas mínimas**: 3 horas
- **Resultado esperado**: 3.86 horas (ya que 3.86 > 3)

**Lógica**:
- `clock_in_hour` = 7 (local)
- `close_hour` = 11 (local)
- Condición: `7 > 11` = FALSE → mismo día ✓
- Cálculo: 11:00 - 7:08 = 3:52 = 3.86 horas ✓

### Caso 3: Medianoche (Ejemplo del usuario)
- **Hora de inicio**: 11:00 PM (local)
- **Hora de cierre**: 12:30 AM (local)
- **Horas esperadas**: 1.5 horas
- **Horas mínimas**: 3 horas
- **Resultado esperado**: 3 horas (ya que 1.5 < 3, se aplica mínimo)

**Lógica**:
- `clock_in_hour` = 23 (local)
- `close_hour` = 0 (local)
- Condición: `23 > 0` = TRUE → día siguiente ✓
- Cálculo: 12:30 AM (día siguiente) - 11:00 PM = 1:30 = 1.5 horas
- Aplicar mínimo: 1.5 < 3 → usar 3 horas ✓

## Cómo Probar

1. Ir a un evento que esté iniciado
2. Hacer clic en "Cerrar Evento"
3. Ingresar la hora de cierre
4. Verificar que las horas calculadas sean correctas

## Archivos Modificados

- `backend/app/routers/shifts.py`:
  - Agregada función `_get_timezone_from_state()`
  - Actualizada función `close_event_shifts()`
  - Agregados imports: `timezone`, `ZoneInfo`

## Notas Importantes

- La zona horaria se determina basándose en el campo `event.state`
- Si no hay estado, se usa UTC como fallback
- El cálculo se realiza en la zona horaria local del evento
- El resultado se almacena en UTC en la BD
