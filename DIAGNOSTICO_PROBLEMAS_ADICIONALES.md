# Diagnóstico: Problemas Adicionales en Validación de `horas_entre_eventos`

## 🐛 Problemas Reportados

El usuario reporta que la validación de `horas_entre_eventos` **SIGUE SIN FUNCIONAR** en dos casos:

1. **Admin invita a empleado**: No valida cuando el admin presiona "enviar invitación"
2. **Empleado confirma invitación**: No valida cuando el empleado confirma una invitación

## 🔍 Análisis

### Problema 1: Admin Invita a Empleado

**Función**: `invite_employee()` (línea 312)

**Estado actual**: Tiene validación de `horas_entre_eventos`

**Posibles causas**:
1. La validación está en el backend, pero el frontend no está llamando al endpoint correcto
2. El endpoint está siendo llamado, pero hay un error en la validación
3. El parámetro `horas_entre_eventos` es 0 (sin restricción)
4. Los eventos no están en la misma fecha
5. El empleado no tiene asignación previa (por lo que no hay conflicto)

### Problema 2: Empleado Confirma Invitación

**Función**: `accept_invitation()` (línea 620)

**Estado actual**: NO tiene validación de `horas_entre_eventos`

**Problema identificado**: 
- La función `accept_invitation()` busca status `"invited"`
- Pero `invite_employee()` crea asignaciones con status `"pending"`
- Esto es una **inconsistencia de estados**

**Solución necesaria**:
- Agregar validación de `horas_entre_eventos` a `accept_invitation()`
- Corregir la inconsistencia de estados

### Problema 3: Validación Bidireccional

**Requisito**: La validación debe funcionar en ambas direcciones:
- Si aplica a 10:32 PM y luego a 11:30 PM: ❌ Rechazar
- Si aplica a 11:30 PM y luego a 10:32 PM: ❌ Rechazar

**Estado actual**: El código usa `abs()` para calcular la diferencia, así que debería funcionar bidireccionalemente.

**Verificación**: Necesita revisar si el `abs()` está siendo usado correctamente.

## 📋 Funciones que Necesitan Validación

| Función | Línea | Validación | Status |
|---------|-------|-----------|--------|
| `apply_to_event()` | ~78 | ✅ Tiene | ✅ |
| `invite_employee()` | ~312 | ✅ Tiene | ⚠️ No funciona |
| `direct_assign()` | ~224 | ✅ Tiene | ✅ |
| `approve_assignment()` | ~398 | ✅ Tiene | ✅ |
| `accept_invitation()` | ~620 | ❌ NO tiene | ❌ FALTA |
| `reject_invitation()` | ~660 | ❌ NO tiene | ✅ OK (no necesita) |

## 🔧 Cambios Necesarios

### 1. Agregar Validación a `accept_invitation()`

```python
async def accept_invitation(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    if assignment.status != "pending":  # ← CAMBIAR DE "invited" A "pending"
        raise HTTPException(status_code=400, detail="Solo puedes aceptar invitaciones pendientes")

    # ← AGREGAR VALIDACIÓN DE horas_entre_eventos AQUÍ
    
    # ... resto del código ...
```

### 2. Corregir Inconsistencia de Estados

**Problema**: `accept_invitation()` busca status `"invited"`, pero `invite_employee()` crea status `"pending"`

**Solución**: Cambiar `accept_invitation()` para buscar status `"pending"` (ya está en el código anterior)

### 3. Verificar que `invite_employee()` Funciona

**Problema**: El usuario reporta que no funciona

**Posibles causas**:
1. El frontend no está llamando al endpoint correcto
2. El parámetro `horas_entre_eventos` es 0
3. Los eventos no están en la misma fecha
4. El empleado no tiene asignación previa

**Verificación necesaria**: Revisar los logs del backend

## 📝 Próximos Pasos

1. Agregar validación a `accept_invitation()`
2. Corregir inconsistencia de estados
3. Verificar que `invite_employee()` funciona correctamente
4. Agregar logging para diagnosticar problemas
5. Testing completo

---

**Status**: 🔴 PROBLEMAS IDENTIFICADOS - REQUIEREN CORRECCIÓN
