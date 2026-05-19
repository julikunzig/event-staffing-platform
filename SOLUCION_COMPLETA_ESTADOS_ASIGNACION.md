# Solución Completa: Estados de Asignación Inconsistentes

## Problema Identificado

El frontend y backend estaban usando estados de asignación que **NO existían en el enum** de la base de datos:
- `"invited"` - No existía
- `"rejected"` - No existía

Esto causaba que:
1. Las invitaciones del admin se creaban con status `"pending"` (igual que las aplicaciones)
2. No se podía rechazar invitaciones (no había endpoint funcional)
3. No se podía diferenciar entre aplicaciones e invitaciones

---

## Solución Implementada

### 1. Actualización del Enum

**Archivo**: `backend/app/models/enums.py`

```python
class AssignmentStatus(str, enum.Enum):
    pending = "pending"      # Aplicación del empleado
    invited = "invited"      # Invitación del admin (NUEVO)
    approved = "approved"    # Confirmada
    rejected = "rejected"    # Rechazada (NUEVO)
    removed = "removed"      # Removida
```

### 2. Creación de Migración

**Archivo**: `backend/alembic/versions/0012_add_invited_rejected_status.py`

- Migración vacía (no hay cambios en BD)
- Documenta el cambio en el enum de Python

### 3. Actualización de Lógica

**Archivo**: `backend/app/routers/assignments.py`

#### 3.1 Función `bulk_invite()` (línea ~620)
```python
# ANTES
status="pending"

# DESPUÉS
status="invited"
```

#### 3.2 Función `invite_employee()` (línea ~396)
```python
# ANTES
status="pending"

# DESPUÉS
status="invited"
```

#### 3.3 Función `accept_invitation()` (línea ~668)
```python
# ANTES
if assignment.status != "pending":

# DESPUÉS
if assignment.status != "invited":
```

#### 3.4 Función `reject_invitation()` (línea ~748)
```python
# ANTES
if assignment.status != "invited":
    raise HTTPException(...)
assignment.status = "rejected"

# DESPUÉS
if assignment.status != "invited":
    raise HTTPException(...)
assignment.status = "rejected"
```

### 4. Actualización de Validaciones

Todas las validaciones de `horas_entre_eventos` ahora incluyen `"invited"`:

```python
# ANTES
EventAssignment.status.in_(["pending", "approved"])

# DESPUÉS
EventAssignment.status.in_(["pending", "invited", "approved"])
```

**Funciones actualizadas**:
- `apply_to_event()` - línea 140
- `direct_assign()` - línea 273
- `invite_employee()` - línea 364
- `approve_assignment()` - línea 447
- `bulk_invite()` - línea 591
- `accept_invitation()` - línea 711

### 5. Actualización de Conteo de Cupos

Todas las funciones que cuentan cupos ahora incluyen `"invited"`:

```python
# ANTES
EventAssignment.status.in_(["pending", "approved"])

# DESPUÉS
EventAssignment.status.in_(["pending", "invited", "approved"])
```

**Funciones actualizadas**:
- `_check_slots()` - línea 64
- `apply_to_event()` - línea 177
- `bulk_invite()` - línea 611

---

## Flujo de Estados Actualizado

### Flujo de Aplicación (Empleado Aplica)
```
Empleado aplica
    ↓
Status: "pending"
    ↓
Admin aprueba → Status: "approved" ✅
Admin rechaza → Status: "removed" ✅
```

### Flujo de Invitación (Admin Invita)
```
Admin invita
    ↓
Status: "invited"
    ↓
Empleado acepta → Status: "approved" ✅
Empleado rechaza → Status: "rejected" ✅
```

### Validación de `horas_entre_eventos`
```
Valida contra: ["pending", "invited", "approved"]
No valida contra: ["rejected", "removed"]
```

---

## Cambios en el Comportamiento

### Antes
1. Admin invita empleado → Status: `"pending"` (igual que aplicación)
2. No se podía rechazar invitaciones
3. No se podía diferenciar entre aplicaciones e invitaciones

### Después
1. Admin invita empleado → Status: `"invited"` (diferente a aplicación)
2. Empleado puede rechazar invitación → Status: `"rejected"`
3. Se puede diferenciar claramente entre aplicaciones e invitaciones
4. Validación de `horas_entre_eventos` funciona correctamente en ambos casos

---

## Impacto en Frontend

✅ **No requiere cambios**

El frontend ya estaba preparado para estos estados:
- `EventDetailPage.tsx` línea 93-96 (statusMap)
- `EventsPage.tsx` línea 36-40 (statusMap)
- `EventDetailPage.tsx` línea 415 (handleReject)

---

## Archivos Modificados

### Backend
1. ✅ `backend/app/models/enums.py` - Enum actualizado
2. ✅ `backend/app/routers/assignments.py` - Lógica actualizada
3. ✅ `backend/alembic/versions/0012_add_invited_rejected_status.py` - Migración creada

### Frontend
- ✅ No requiere cambios

### Documentación
1. ✅ `DIAGNOSTICO_ESTADOS_ASIGNACION.md` - Diagnóstico del problema
2. ✅ `RESUMEN_CAMBIOS_ESTADOS_ASIGNACION.md` - Resumen de cambios
3. ✅ `INSTRUCCIONES_DEPLOYMENT_ESTADOS.md` - Instrucciones de deployment
4. ✅ `SOLUCION_COMPLETA_ESTADOS_ASIGNACION.md` - Este documento

---

## Testing Recomendado

### Test 1: Invitación de Admin
```
1. Admin va a evento
2. Selecciona empleados
3. Presiona "Enviar Invitaciones"
4. Verificar status = "invited" en BD
```

### Test 2: Aceptar Invitación
```
1. Empleado ve invitaciones
2. Presiona "Confirmar"
3. Verificar status = "approved" en BD
```

### Test 3: Rechazar Invitación
```
1. Empleado ve invitaciones
2. Presiona "Cancelar"
3. Verificar status = "rejected" en BD
```

### Test 4: Validación de `horas_entre_eventos`
```
1. Empleado aplica a evento 10:00
2. Intenta aplicar a evento 11:00 (diferencia < 4 horas)
3. Verificar error: "No puedes aplicar..."

4. Admin invita a evento 10:00
5. Intenta invitar a evento 11:00
6. Verificar error: "No puedes invitar..."
```

---

## Deployment

### Paso 1: Ejecutar Migración
```bash
cd backend
alembic upgrade head
```

### Paso 2: Reiniciar Backend
```bash
docker-compose restart backend
```

### Paso 3: Verificar
```bash
curl http://localhost:8000/docs
```

---

## Verificación Final

```sql
-- Verificar que hay asignaciones con status invited
SELECT COUNT(*) FROM event_assignments WHERE status = 'invited';

-- Verificar que hay asignaciones con status rejected
SELECT COUNT(*) FROM event_assignments WHERE status = 'rejected';

-- Verificar que hay asignaciones con status pending
SELECT COUNT(*) FROM event_assignments WHERE status = 'pending';

-- Verificar que hay asignaciones con status approved
SELECT COUNT(*) FROM event_assignments WHERE status = 'approved';
```

---

## Conclusión

Se ha implementado una solución completa que:
1. ✅ Agrega los estados faltantes al enum
2. ✅ Actualiza la lógica para usar los nuevos estados correctamente
3. ✅ Mantiene la validación de `horas_entre_eventos` funcionando
4. ✅ Permite diferenciar entre aplicaciones e invitaciones
5. ✅ Permite rechazar invitaciones explícitamente
6. ✅ No requiere cambios en el frontend

**Status**: 🟢 LISTO PARA DEPLOYMENT

