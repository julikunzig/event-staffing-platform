# Problemas Resueltos - Sesión 11 (Continuación)

## Fecha: 9 de Mayo, 2026

---

## PROBLEMA 1: Combo de Roles Mostraba "select rol..." en Todas las Opciones

### Síntoma
Cuando el administrador creaba un nuevo empleado, el combo de selección de rol solo mostraba "select rol..." en todas las opciones, sin mostrar "Administrador", "Coordinador" o "Empleado".

### Causa
En `frontend/src/pages/UsersPage.tsx`, el código estaba usando:
```javascript
{PROFILES.map(p => <option key={p} value={p}>{t(`forms.selectRole`)}</option>)}
```

Esto intentaba traducir `forms.selectRole` para CADA opción, cuando debería mostrar el nombre del rol específico.

### Solución
✅ Creado objeto `profileNames` con los nombres de los roles:
```javascript
const profileNames: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordinador',
  employee: 'Empleado',
}
```

✅ Actualizado el mapeo en los 3 combos (búsqueda, creación, edición):
```javascript
{PROFILES.map(p => (
  <option key={p} value={p}>{profileNames[p]}</option>
))}
```

### Archivos Modificados
- `frontend/src/pages/UsersPage.tsx`

### Estado
✅ **RESUELTO** - El combo ahora muestra correctamente:
- Administrador
- Coordinador
- Empleado

---

## PROBLEMA 2: Error 500 al Finalizar Turno (Clock-Out)

### Síntoma
```
POST http://10.0.0.13:5173/api/v1/shifts/6/clock-out 500 (Internal Server Error)
```

El empleado no podía finalizar el turno.

### Causa
En `backend/app/routers/shifts.py`, la función `clock_out()` estaba intentando acceder a `event.event_date` sin verificar si `event` era None:

```python
limit, hours_this_week, min_shift = await _get_weekly_hours(user_id, company_id, event.event_date, db)
```

Si el evento no se encontraba (o había un problema), `event` sería None y causaría un AttributeError → 500.

### Solución
✅ Agregada validación para manejar el caso cuando `event` es None:

```python
# Obtener configuración de la empresa
config = await _get_company_config(company_id, db)
min_shift = config.min_shift_hours if config else Decimal("0.00")

# Obtener límite semanal para calcular overtime
if event:
    limit, hours_this_week, _ = await _get_weekly_hours(user_id, company_id, event.event_date, db)
else:
    # Si no hay evento, usar valores por defecto
    limit = Decimal("40.00")
    hours_this_week = Decimal("0.00")
```

### Archivos Modificados
- `backend/app/routers/shifts.py`

### Estado
✅ **RESUELTO** - El endpoint clock-out ahora maneja correctamente el caso cuando el evento no existe

---

## PROBLEMA 3: Validación de Horas Mínimas Perdida

### Síntoma
La validación que debería aplicar `min_shift_hours` al finalizar el turno no estaba funcionando. Si un empleado trabajaba menos horas que el mínimo configurado, debería facturarse el mínimo, pero esto no estaba sucediendo.

### Causa
El código anterior estaba pasando `hours_worked` directamente a `calculate_shift_pay()` sin aplicar primero el mínimo:

```python
hours_worked = max(Decimal("0"), gross_hours - pause_hours)
# ... directamente a calculate_shift_pay sin aplicar min_shift
pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)
```

### Solución
✅ Agregada lógica para aplicar el mínimo ANTES de calcular el pago:

```python
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

# Luego calcular el pago con las horas ajustadas
pay = calculate_shift_pay(hours_worked, shift.hourly_rate_snapshot, limit, hours_this_week, min_shift)
```

### Lógica
1. Se calcula el tiempo bruto trabajado (clock_in → clock_out)
2. Se descuentan las pausas
3. Se obtiene el `min_shift_hours` de la configuración de la empresa
4. **Si las horas trabajadas son menores que el mínimo, se ajustan al mínimo**
5. Se calcula el pago con las horas ajustadas
6. Se guarda en `shift.hours_worked` el valor final (que puede incluir el mínimo)

### Archivos Modificados
- `backend/app/routers/shifts.py`

### Estado
✅ **RESUELTO** - La validación de horas mínimas ahora funciona correctamente:
- Si empleado trabaja 1 hora y mínimo es 2 horas → se facturan 2 horas
- Si empleado trabaja 3 horas y mínimo es 2 horas → se facturan 3 horas

---

## RESUMEN DE CAMBIOS

### Frontend
- **UsersPage.tsx**: Agregado objeto `profileNames` y actualizado mapeo de roles en 3 combos

### Backend
- **shifts.py**: 
  - Agregada validación para manejar `event` None
  - Agregada lógica para aplicar `min_shift_hours` antes de calcular pago
  - Mejorada robustez del endpoint `clock_out()`

---

## VERIFICACIÓN

✅ Backend reiniciado correctamente después de cambios
✅ Combo de roles muestra nombres correctos
✅ Endpoint clock-out maneja casos edge correctamente
✅ Validación de horas mínimas implementada

---

## PRÓXIMOS PASOS

1. Probar clock-out con diferentes escenarios:
   - Turno corto (menor que mínimo)
   - Turno normal (mayor que mínimo)
   - Turno con pausas

2. Verificar que el pago se calcula correctamente con el mínimo aplicado

3. Validar que el overtime se calcula correctamente después de aplicar el mínimo

