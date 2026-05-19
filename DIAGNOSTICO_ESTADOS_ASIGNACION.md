# Diagnóstico: Estados de Asignación Inconsistentes

## Problema Identificado

El frontend y backend están usando estados de asignación que **NO existen en el enum** de la base de datos.

### Estados Válidos en el Enum (backend/app/models/enums.py)
```python
class AssignmentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    removed = "removed"
```

**Solo 3 estados válidos**: `pending`, `approved`, `removed`

---

## Estados Inválidos Encontrados

### 1. Estado "invited" (NO EXISTE)
- **Ubicación en Backend**: 
  - `assignments.py` línea 64 (en `_check_slots()`)
  - `assignments.py` línea 177 (en `apply_to_event()`)
  - `assignments.py` línea 756 (en `reject_invitation()`)
  
- **Ubicación en Frontend**:
  - `EventDetailPage.tsx` línea 93 (en statusMap)
  - `EventsPage.tsx` línea 36 (en statusMap)

- **Problema**: El código busca asignaciones con status `"invited"` pero nunca las crea

### 2. Estado "rejected" (NO EXISTE)
- **Ubicación en Backend**:
  - `assignments.py` línea 757 (en `reject_invitation()`)
  
- **Ubicación en Frontend**:
  - `EventDetailPage.tsx` línea 94 (en statusMap)
  - `EventsPage.tsx` línea 37 (en statusMap)
  - `EventDetailPage.tsx` línea 415 (en `handleReject()`)

- **Problema**: El código intenta asignar status `"rejected"` pero no existe en el enum

---

## Análisis del Flujo Actual

### Flujo de Invitación (Incorrecto)
1. Admin invita empleado → Crea asignación con status `"pending"` ✅
2. Empleado acepta invitación → Cambia status a `"approved"` ✅
3. Empleado rechaza invitación → Intenta cambiar a `"rejected"` ❌ (no existe)

### Flujo de Aplicación (Correcto)
1. Empleado aplica → Crea asignación con status `"pending"` ✅
2. Admin aprueba → Cambia status a `"approved"` ✅
3. Admin rechaza → Debería cambiar a `"removed"` (pero no hay endpoint)

---

## Solución Recomendada

### Opción A: Agregar Estados al Enum (Recomendado)
```python
class AssignmentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    invited = "invited"      # NUEVO
    rejected = "rejected"    # NUEVO
    removed = "removed"
```

**Ventajas**:
- Mantiene la lógica actual del frontend
- Permite diferenciar entre "invitado" y "aplicado"
- Permite rechazar invitaciones

**Desventajas**:
- Requiere migración de BD
- Más estados para manejar

### Opción B: Usar Solo Estados Válidos (Más Simple)
- Usar `"pending"` para ambos: aplicaciones e invitaciones
- Usar `"approved"` para confirmadas
- Usar `"removed"` para rechazadas/removidas

**Ventajas**:
- No requiere migración
- Menos estados para manejar
- Más simple

**Desventajas**:
- No se puede diferenciar entre "aplicado" e "invitado"
- Requiere cambios en frontend

---

## Recomendación Final

**Usar Opción A**: Agregar `"invited"` y `"rejected"` al enum porque:
1. El frontend ya está preparado para estos estados
2. Permite mejor UX (mostrar diferencia entre aplicación e invitación)
3. Permite rechazar invitaciones explícitamente
4. La migración es simple

---

## Pasos para Implementar Opción A

1. Actualizar enum en `backend/app/models/enums.py`
2. Crear migración Alembic
3. Actualizar lógica en `assignments.py`:
   - `bulk_invite()` debe crear con status `"invited"` (no `"pending"`)
   - `invite_employee()` debe crear con status `"invited"` (no `"pending"`)
   - `accept_invitation()` debe cambiar de `"invited"` a `"approved"`
   - `reject_invitation()` debe cambiar de `"invited"` a `"rejected"`
4. Actualizar validaciones para incluir `"invited"` y `"rejected"` donde sea necesario

---

## Impacto en Validación de `horas_entre_eventos`

La validación debe considerar:
- `"pending"` (aplicaciones pendientes de aprobación)
- `"approved"` (confirmadas)
- `"invited"` (invitaciones pendientes de aceptación)

**NO debe considerar**:
- `"rejected"` (rechazadas)
- `"removed"` (removidas)

