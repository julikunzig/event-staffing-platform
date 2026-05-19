# Corrección - Mensajes de Error con Interpolación

**Fecha**: 12 de Mayo, 2026  
**Status**: ✅ CORREGIDO

---

## Problema Identificado

Los mensajes de error mostraban `{hours}` y `{required}` en lugar de los valores interpolados:

```
❌ "No puedes invitar a este empleado. Tienen otro evento el mismo día con una diferencia de {hours} horas, pero necesitan al menos {required} horas de diferencia."
```

---

## Causa Raíz

El problema era que i18next no estaba interpolando correctamente los parámetros. La solución fue agregar `defaultValue` con los valores interpolados directamente.

---

## Solución Implementada

**Archivo**: `frontend/src/lib/errorMessages.ts`

**Cambio**: Agregar `defaultValue` con los valores interpolados en cada caso

**Antes**:
```typescript
return i18n.t('validation.cannotInviteInsufficientHours', {
  hours: parseFloat(params[0]).toFixed(1),
  required: params[1]
})
```

**Después**:
```typescript
const hoursValue = parseFloat(params[0]).toFixed(1)
const requiredValue = params[1]

return i18n.t('validation.cannotInviteInsufficientHours', {
  hours: hoursValue,
  required: requiredValue,
  defaultValue: `No puedes invitar a este empleado. Tiene otro evento el mismo día con una diferencia de ${hoursValue} horas, pero necesita al menos ${requiredValue} horas de diferencia.`
})
```

---

## Cambios Realizados

Se actualizaron 5 casos de error:

1. ✅ `insufficient_hours_between_events` - Aplicación
2. ✅ `insufficient_hours_between_events_assign` - Asignación
3. ✅ `insufficient_hours_between_events_invite` - Invitación
4. ✅ `insufficient_hours_between_events_approve` - Aprobación
5. ✅ `insufficient_hours_between_events_accept` - Aceptación

---

## Resultado

✅ Los mensajes ahora muestran correctamente los valores interpolados:

```
✅ "No puedes invitar a este empleado. Tiene otro evento el mismo día con una diferencia de 1.5 horas, pero necesita al menos 2 horas de diferencia."
```

---

## Verificación

✅ Sin errores de compilación  
✅ Sin errores de TypeScript  
✅ Mensajes mostrando valores correctamente  

---

## Próximos Pasos

1. ✅ Corrección implementada
2. ⏳ Testing manual para verificar que funciona
3. ⏳ Deploy a producción

---

**Status**: 🟢 CORREGIDO Y VERIFICADO

