# 🔍 Análisis: Tarifa Override por Evento

## 📋 Problema Identificado

Cuando el administrador cambia la tarifa del rol **solo para un evento** (usando `hourly_rate_override` en `EventJobRole`), el empleado en "Mis Turnos" no ve la tarifa correcta. Sigue mostrando la tarifa paramétrica del rol.

---

## 🏗️ Arquitectura Actual

### Modelos Involucrados

```
JobRole (tarifa base)
  ↓
EventJobRole (tarifa override por evento)
  ↓
EventAssignment (asignación del empleado)
  ↓
Shift (registro del turno con tarifa snapshot)
```

### Flujo Actual

1. **Creación del Shift** (`shifts.py` línea 212):
   ```python
   shift = Shift(
       ...
       hourly_rate_snapshot=role.hourly_rate,  # ❌ PROBLEMA: Usa tarifa base
       ...
   )
   ```

2. **Visualización en Reportes** (`reports.py` línea 123):
   ```python
   rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
   # ✅ Correcto: Usa snapshot del shift
   ```

3. **Visualización en Frontend** (`EmployeeProfilePage.tsx` línea 414):
   ```typescript
   {shift.hourly_rate_snapshot}  // ✅ Correcto: Usa snapshot
   ```

---

## 🎯 Raíz del Problema

**El problema está en `shifts.py` línea 212:**

Cuando se crea el Shift (al hacer clock-in), se asigna `role.hourly_rate` directamente, **sin verificar si existe un override en `EventJobRole`**.

### Solución Requerida

Cuando se crea el Shift, debe:
1. Obtener el `EventJobRole` del evento
2. Verificar si existe `hourly_rate_override`
3. Si existe, usar el override
4. Si no existe, usar la tarifa base del rol

---

## 🔧 Cambios Necesarios

### Cambio 1: En `shifts.py` - Función `clock_in_shift()`

**Ubicación**: `backend/app/routers/shifts.py` línea ~200-215

**Cambio**:
```python
# ANTES (línea 212):
shift = Shift(
    assignment_id=assignment_id,
    clock_in=now,
    clock_in_lat=Decimal(str(body.latitude)),
    clock_in_lng=Decimal(str(body.longitude)),
    hourly_rate_snapshot=role.hourly_rate,  # ❌ INCORRECTO
    overtime_pay=Decimal("0.00"),
    is_paused=False,
)

# DESPUÉS:
# Obtener EventJobRole para verificar override
event_job_role = await db.execute(
    select(EventJobRole).where(
        EventJobRole.event_id == event.id,
        EventJobRole.job_role_id == assignment.job_role_id
    )
)
ejr = event_job_role.scalars().first()

# Usar override si existe, sino usar tarifa base
hourly_rate = ejr.hourly_rate_override if ejr and ejr.hourly_rate_override else role.hourly_rate

shift = Shift(
    assignment_id=assignment_id,
    clock_in=now,
    clock_in_lat=Decimal(str(body.latitude)),
    clock_in_lng=Decimal(str(body.longitude)),
    hourly_rate_snapshot=hourly_rate,  # ✅ CORRECTO
    overtime_pay=Decimal("0.00"),
    is_paused=False,
)
```

---

## ✅ Verificación de Impacto

### Funcionalidades Afectadas

| Funcionalidad | Impacto | Riesgo |
|---|---|---|
| Clock-in | ✅ Mejora | Bajo |
| Cálculo de pago | ✅ Mejora | Bajo |
| Reportes | ✅ Mejora | Bajo |
| Historial de turnos | ✅ Mejora | Bajo |
| Shift existentes | ❌ No afecta | Ninguno |

### Por Qué No Afecta Funcionalidades Existentes

1. **Shifts ya creados**: Tienen `hourly_rate_snapshot` guardado, no se modifica
2. **Reportes**: Ya usan `shift.hourly_rate_snapshot`, seguirá funcionando
3. **Cálculo de pago**: Usa `shift.hourly_rate_snapshot`, no cambia
4. **Frontend**: Muestra `shift.hourly_rate_snapshot`, no cambia

---

## 🔄 Flujo Completo Después del Cambio

```
1. Admin crea evento
2. Admin asigna rol al evento
3. Admin cambia tarifa del rol SOLO para este evento
   → Se guarda en EventJobRole.hourly_rate_override
4. Empleado hace clock-in
   → Sistema obtiene EventJobRole
   → Verifica si existe override
   → Usa override (si existe) o tarifa base
   → Guarda en Shift.hourly_rate_snapshot ✅
5. Empleado ve "Mis Turnos"
   → Muestra tarifa correcta ✅
6. Admin ve reportes
   → Muestra tarifa correcta ✅
```

---

## 📊 Cambios Requeridos

### Archivo: `backend/app/routers/shifts.py`

**Línea**: ~200-215 (función `clock_in_shift`)

**Cambios**:
- Agregar import: `from app.models import EventJobRole`
- Agregar query para obtener `EventJobRole`
- Cambiar lógica de asignación de `hourly_rate_snapshot`

**Líneas de código**: ~10 líneas

**Complejidad**: Baja

**Riesgo**: Muy bajo (solo afecta nuevos shifts)

---

## 🧪 Testing Requerido

### Test 1: Tarifa Override Existe
```
1. Crear evento
2. Asignar rol con tarifa base $20
3. Cambiar tarifa a $25 solo para este evento
4. Empleado hace clock-in
5. Verificar: Shift.hourly_rate_snapshot = $25 ✅
```

### Test 2: Tarifa Override No Existe
```
1. Crear evento
2. Asignar rol con tarifa base $20
3. NO cambiar tarifa
4. Empleado hace clock-in
5. Verificar: Shift.hourly_rate_snapshot = $20 ✅
```

### Test 3: Múltiples Eventos
```
1. Crear evento A con tarifa $20
2. Crear evento B con tarifa $25
3. Empleado hace clock-in en evento A
4. Verificar: Shift.hourly_rate_snapshot = $20 ✅
5. Empleado hace clock-in en evento B
6. Verificar: Shift.hourly_rate_snapshot = $25 ✅
```

---

## 🚀 Plan de Implementación

### Paso 1: Modificar `shifts.py`
- Agregar import de `EventJobRole`
- Modificar función `clock_in_shift()`
- Agregar lógica de obtención de override

### Paso 2: Testing Local
- Ejecutar tests manuales
- Verificar que funciona correctamente

### Paso 3: Verificación
- Revisar que no hay errores
- Confirmar que reportes funcionan
- Confirmar que frontend muestra correctamente

### Paso 4: Deploy
- Hacer push a GitHub
- Render redeploya automáticamente

---

## 📝 Resumen

| Aspecto | Detalle |
|---|---|
| **Problema** | Tarifa override no se usa al crear Shift |
| **Causa** | `shifts.py` no verifica `EventJobRole.hourly_rate_override` |
| **Solución** | Obtener `EventJobRole` y usar override si existe |
| **Impacto** | Bajo - solo afecta nuevos shifts |
| **Riesgo** | Muy bajo - no afecta funcionalidades existentes |
| **Líneas** | ~10 líneas de código |
| **Tiempo** | ~5 minutos |

---

**Conclusión**: Cambio simple, seguro y de alto valor. Mejora la experiencia del usuario sin riesgos.
