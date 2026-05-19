# Problema Encontrado: Estados de Asignación Incorrectos

## 🐛 Problema Identificado

La validación de `horas_entre_eventos` en `invite_employee()` está buscando estados que **NO EXISTEN** en la BD.

## 📊 Estados Definidos en el Enum

**Archivo**: `backend/app/models/enums.py`

```python
class AssignmentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    removed = "removed"
```

**Estados válidos**: 3
- `pending`
- `approved`
- `removed`

## ❌ Estados Buscados en el Código

**Archivo**: `backend/app/routers/assignments.py`

```python
EventAssignment.status.in_(["pending", "approved", "invited", "started"])
```

**Estados buscados**: 4
- `pending` ✅ Existe
- `approved` ✅ Existe
- `invited` ❌ NO EXISTE
- `started` ❌ NO EXISTE

## 🔍 Análisis

### Problema 1: Estados Inexistentes

El código busca estados `"invited"` y `"started"` que no existen en el enum. Esto significa que:

1. Cuando se invita a un empleado, se crea una asignación con status `"pending"` (no `"invited"`)
2. Cuando se inicia un turno, no hay un estado `"started"` en la asignación
3. La búsqueda nunca encuentra asignaciones con esos estados

### Problema 2: Lógica Incorrecta

La validación debería buscar:
- `pending` - Empleado aplicó pero no está aprobado
- `approved` - Empleado está aprobado
- `removed` - Empleado fue removido (¿debería validar?)

Pero está buscando:
- `pending` ✅ Correcto
- `approved` ✅ Correcto
- `invited` ❌ Incorrecto (no existe)
- `started` ❌ Incorrecto (no existe)

## ✅ Solución

Cambiar la búsqueda para usar solo los estados que existen:

```python
# ANTES (Incorrecto)
EventAssignment.status.in_(["pending", "approved", "invited", "started"])

# DESPUÉS (Correcto)
EventAssignment.status.in_(["pending", "approved"])
```

## 📝 Cambios Necesarios

Se necesita cambiar en 4 funciones:

1. `apply_to_event()` - Línea ~140
2. `invite_employee()` - Línea ~345
3. `direct_assign()` - Línea ~260
4. `approve_assignment()` - Línea ~425

**Cambio**: Reemplazar `["pending", "approved", "invited", "started"]` con `["pending", "approved"]`

## 🎯 Resultado Esperado

Después del cambio:

- ✅ La validación buscará solo estados válidos
- ✅ Encontrará asignaciones pendientes y aprobadas
- ✅ Rechazará invitaciones cuando hay conflicto de horas
- ✅ El sistema funcionará correctamente

## 📋 Archivos a Modificar

- `backend/app/routers/assignments.py` - 4 funciones

## 🔗 Relación con el Bug Anterior

Este es un problema diferente al del parsing de fecha/hora que se corrigió en la sesión anterior. Ambos problemas causaban que la validación no funcionara, pero por razones diferentes:

1. **Sesión 12**: Parsing incorrecto de fecha/hora
2. **Sesión 12 (Continuación)**: Estados de asignación incorrectos

---

**Status**: 🔴 PROBLEMA IDENTIFICADO - REQUIERE CORRECCIÓN
