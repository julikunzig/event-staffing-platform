# Validación de Funcionalidades - Parámetros de Configuración

**Fecha**: 11 de Mayo, 2026  
**Objetivo**: Validar que todos los parámetros de configuración están correctamente implementados y funcionando

---

## ✅ Parámetros de Configuración

### 1. `shift_start_minutes` (Minutos Antes para Iniciar Turno)

**Ubicación en BD**: `companies.shift_start_minutes_before`

**Valor por Defecto**: 15 minutos

**Uso**: Determina cuántos minutos antes de la hora de inicio del evento se activa el botón de clock-in

**Implementación**:

#### Backend
- ✅ Almacenado en `companies.shift_start_minutes_before`
- ✅ Retornado en endpoint `/companies/current/weekly-config` como `shift_start_minutes`
- ✅ Usado en validaciones

#### Frontend
- ✅ Cargado en `EmployeeProfilePage.tsx`
- ✅ Polling cada 30 segundos para obtener valor actualizado
- ✅ Usado en función `isClockInAllowed()`

**Lógica**:
```typescript
const allowed = diffMinutes <= shiftStartMinutes
```

**Ejemplo**:
- Evento a las 10:00 AM
- `shift_start_minutes = 30`
- Botón se activa a las 9:30 AM
- Botón sigue activo después de las 10:00 AM

**Status**: ✅ FUNCIONAL

---

### 2. `horas_entre_eventos` (Horas Entre Eventos)

**Ubicación en BD**: `weekly_hours_config.horas_entre_eventos`

**Valor por Defecto**: 0 (sin restricción)

**Uso**: Tiempo mínimo en horas entre dos eventos para que un empleado pueda aplicar a ambos

**Implementación**:

#### Backend
- ✅ Almacenado en `weekly_hours_config.horas_entre_eventos`
- ✅ Retornado en endpoint `/companies/current/weekly-config`
- ✅ Validado en 4 puntos:
  1. `apply_to_event()` - Cuando empleado aplica
  2. `invite_employee()` - Cuando admin invita
  3. `direct_assign()` - Cuando admin asigna directamente
  4. `approve_assignment()` - Cuando admin aprueba

**Lógica**:
```python
if horas_entre_eventos > 0:
    for other_event in same_day_events:
        if employee_has_assignment(other_event):
            time_diff = abs(event_start - other_start) / 3600  # en horas
            if time_diff <= horas_entre_eventos:
                raise HTTPException("No puedes aplicar...")
```

**Ejemplo**:
- Evento A: 10:00 AM
- Evento B: 12:00 PM (diferencia: 2 horas)
- `horas_entre_eventos = 3`
- Resultado: ❌ No puede aplicar (2 horas < 3 horas requeridas)

**Status**: ✅ FUNCIONAL

---

### 3. `weekly_hours_limit` (Horas Semanales Recomendadas)

**Ubicación en BD**: `weekly_hours_config.weekly_hours_limit`

**Valor por Defecto**: 40.00 horas

**Uso**: Límite de horas semanales antes de aplicar overtime al 1.5x

**Implementación**:

#### Backend
- ✅ Almacenado en `weekly_hours_config.weekly_hours_limit`
- ✅ Retornado en endpoint `/companies/current/weekly-config`
- ✅ Usado en función `calculate_shift_pay()` en `backend/app/services/payment.py`

**Lógica**:
```python
def calculate_shift_pay(hours_worked, hourly_rate, weekly_hours_limit, hours_worked_this_week):
    weekly_hours_remaining = max(0, weekly_hours_limit - hours_worked_this_week)
    regular_hours = min(hours_worked, weekly_hours_remaining)
    overtime_hours = max(0, hours_worked - weekly_hours_remaining)
    
    regular_pay = regular_hours * hourly_rate
    overtime_pay = overtime_hours * hourly_rate * 1.5
    total_pay = regular_pay + overtime_pay
```

**Ejemplo**:
- Empleado trabajó 40 horas en la semana
- `weekly_hours_limit = 30`
- Turno actual: 5 horas a $10/hora
- Cálculo:
  - Horas regulares: 0 (ya pasó el límite)
  - Horas overtime: 5
  - Pago: 5 × $10 × 1.5 = $75

**Status**: ✅ FUNCIONAL

---

### 4. `min_shift_hours` (Horas Mínimas por Turno)

**Ubicación en BD**: `weekly_hours_config.min_shift_hours`

**Valor por Defecto**: 0.00 horas (sin mínimo)

**Uso**: Mínimo de horas a pagar por turno, independientemente de las horas reales trabajadas

**Implementación**:

#### Backend
- ✅ Almacenado en `weekly_hours_config.min_shift_hours`
- ✅ Retornado en endpoint `/companies/current/weekly-config`
- ✅ Usado en función `calculate_shift_pay()` en `backend/app/services/payment.py`
- ✅ Aplicado en `clock_out()` en `backend/app/routers/shifts.py`

**Lógica**:
```python
def calculate_shift_pay(hours_worked, hourly_rate, weekly_hours_limit, hours_worked_this_week, min_shift_hours):
    # Aplicar mínimo de horas si corresponde
    if min_shift_hours > 0 and hours_worked < min_shift_hours:
        hours_billed = min_shift_hours
        applied_minimum = True
    else:
        hours_billed = hours_worked
    
    # Calcular pago sobre horas_billed
    ...
```

**Ejemplo**:
- Turno: 2 horas trabajadas a $10/hora
- `min_shift_hours = 4`
- Cálculo:
  - Horas a cobrar: 4 (se aplica mínimo)
  - Pago: 4 × $10 = $40 (en lugar de $20)

**Status**: ✅ FUNCIONAL

---

## 📊 Flujo de Datos

### Carga de Parámetros

```
1. Usuario inicia sesión
   ↓
2. Frontend carga configuración: GET /companies/current/weekly-config
   ↓
3. Backend retorna:
   {
     "weekly_hours_limit": 40.00,
     "min_shift_hours": 0.00,
     "shift_start_minutes": 15,
     "horas_entre_eventos": 2
   }
   ↓
4. Frontend almacena en estado
   ↓
5. Frontend usa valores en validaciones
```

### Actualización de Parámetros

```
1. Admin va a Gestión de Empresa
   ↓
2. Admin cambia un parámetro (ej: shift_start_minutes = 20)
   ↓
3. Admin guarda cambios
   ↓
4. Frontend hace PATCH /companies/{id}/weekly-config
   ↓
5. Backend actualiza weekly_hours_config en BD
   ↓
6. Frontend recarga configuración cada 30 segundos
   ↓
7. Próximas validaciones usan nuevo valor
```

---

## 🧪 Validaciones Implementadas

### Validación 1: Botón Clock-in

**Archivo**: `frontend/src/pages/EmployeeProfilePage.tsx`

**Función**: `isClockInAllowed()`

**Lógica**:
```typescript
const isClockInAllowed = (ev: Event): boolean => {
  const now = new Date()
  const eventDateTime = new Date(`${ev.event_date}T${ev.start_time}`)
  const diffMinutes = (eventDateTime.getTime() - now.getTime()) / 60000
  
  const allowed = diffMinutes <= shiftStartMinutes
  return allowed
}
```

**Resultado**:
- ✅ Botón deshabilitado si faltan más de X minutos
- ✅ Botón habilitado si faltan X minutos o menos
- ✅ Botón habilitado después de la hora de inicio

---

### Validación 2: Horas Entre Eventos

**Archivo**: `backend/app/routers/assignments.py`

**Funciones**:
- `apply_to_event()`
- `invite_employee()`
- `direct_assign()`
- `approve_assignment()`

**Lógica**:
```python
if horas_entre_eventos > 0:
    for other_event in same_day_events:
        if employee_has_assignment(other_event):
            time_diff = abs(event_start - other_start) / 3600
            if time_diff <= horas_entre_eventos:
                raise HTTPException("No puedes aplicar...")
```

**Resultado**:
- ✅ Valida en 4 puntos diferentes
- ✅ Usa valor actual de BD
- ✅ Mensaje de error descriptivo

---

### Validación 3: Cálculo de Pago

**Archivo**: `backend/app/services/payment.py`

**Función**: `calculate_shift_pay()`

**Lógica**:
```python
# Aplicar mínimo
if min_shift_hours > 0 and hours_worked < min_shift_hours:
    hours_billed = min_shift_hours

# Calcular overtime
weekly_hours_remaining = max(0, weekly_hours_limit - hours_worked_this_week)
regular_hours = min(hours_billed, weekly_hours_remaining)
overtime_hours = max(0, hours_billed - weekly_hours_remaining)

regular_pay = regular_hours * hourly_rate
overtime_pay = overtime_hours * hourly_rate * 1.5
total_pay = regular_pay + overtime_pay
```

**Resultado**:
- ✅ Aplica mínimo de horas
- ✅ Calcula overtime al 1.5x
- ✅ Resultado correcto

---

## 📋 Checklist de Verificación

### Parámetros en BD

- [x] `shift_start_minutes_before` en tabla `companies`
- [x] `weekly_hours_limit` en tabla `weekly_hours_config`
- [x] `min_shift_hours` en tabla `weekly_hours_config`
- [x] `horas_entre_eventos` en tabla `weekly_hours_config`

### Endpoints

- [x] GET `/companies/current/weekly-config` retorna todos los parámetros
- [x] GET `/companies/{id}/weekly-config` retorna todos los parámetros
- [x] PATCH `/companies/{id}/weekly-config` actualiza parámetros

### Frontend

- [x] Carga parámetros al iniciar
- [x] Polling cada 30 segundos
- [x] Usa `shift_start_minutes` en botón clock-in
- [x] Muestra mensaje con valor parametrizado

### Backend

- [x] Valida `horas_entre_eventos` en aplicación
- [x] Valida `horas_entre_eventos` en invitación
- [x] Valida `horas_entre_eventos` en asignación
- [x] Valida `horas_entre_eventos` en aprobación
- [x] Aplica `min_shift_hours` en clock-out
- [x] Calcula overtime con `weekly_hours_limit`

---

## 🎯 Conclusión

✅ **TODAS LAS FUNCIONALIDADES ESTÁN CORRECTAMENTE IMPLEMENTADAS**

Todos los parámetros de configuración están:
- ✅ Almacenados en la BD
- ✅ Asociados a cada empresa
- ✅ Retornados por los endpoints
- ✅ Usados en las validaciones
- ✅ Actualizables en tiempo real

**Status**: 🟢 FUNCIONAL Y OPERATIVO

---

**Generado**: 11 de Mayo, 2026  
**Verificado por**: Sistema Automatizado  
**Status**: ✅ VALIDADO
