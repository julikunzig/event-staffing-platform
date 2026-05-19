# Especificación de Cambios en Reportes - Sesión 15

**Fecha**: 12 de Mayo, 2026  
**Status**: 📋 ESPECIFICACIÓN

---

## CAMBIOS SOLICITADOS

### 1. REPORTE "POR EVENTO"

**Cambios en Filtros**:
- ✅ Fecha evento (OBLIGATORIO)
- ✅ Nombre evento (OPCIONAL)
- ❌ Remover: ID evento

**Cambios en Resultados**:
- ✅ Agregar al encabezado: Fecha del evento
- ✅ Agregar al encabezado: Dirección del evento
- ✅ Si hay múltiples eventos: Mostrar encabezado y listado por cada evento (rompimiento)

**Ordenamiento**:
- ✅ Por fecha: Más reciente a más antigua

**Implementación**:
- Backend: Modificar endpoint `/reports/events` para aceptar `event_date` y `event_name`
- Frontend: Cambiar filtros de ID a fecha y nombre
- Frontend: Agrupar resultados por evento si hay múltiples

---

### 2. REPORTE "POR EMPLEADO"

**Cambios en Filtros**:
- ✅ Empleado (nombre, email, teléfono) - OBLIGATORIO
- ✅ Desde (OBLIGATORIO)
- ✅ Hasta (OBLIGATORIO)

**Cambios en Resultados**:
- ✅ Están bien (sin cambios)

**Ordenamiento**:
- ✅ Por fecha: Más reciente a más antigua

**Implementación**:
- Backend: Modificar endpoint `/reports/employees` para buscar por nombre/email/teléfono
- Frontend: Cambiar filtro de ID a búsqueda de empleado
- Frontend: Ordenar resultados por fecha DESC

---

### 3. REPORTE "MI REPORTE"

**Cambios**:
- ✅ ELIMINAR del perfil administrador
- ✅ CREAR menú "Reportes" en perfil de empleado
- ✅ Poner este reporte ahí

**Filtros**:
- ✅ Están bien (desde, hasta)

**Resultados**:
- ✅ Están bien

**Ordenamiento**:
- ✅ Por fecha: Más reciente a más antigua

**Implementación**:
- Frontend: Remover tab "me" de ReportsPage (solo para admin)
- Frontend: Crear nueva página "EmployeeReportsPage" o agregar a EmployeeProfilePage
- Frontend: Agregar opción "Reportes" en menú del empleado

---

### 4. REPORTE "EMPLEADOS POR EVENTO" → "EVENTOS POR FECHAS"

**Cambios de Nombre**:
- ✅ Cambiar nombre a "Eventos por Fechas"

**Cambios en Filtros**:
- ✅ Mantener: Desde (OBLIGATORIO)
- ✅ Mantener: Hasta (OBLIGATORIO)
- ❌ Quitar: Nombre completo
- ❌ Quitar: Email
- ❌ Quitar: Teléfono

**Cambios en Resultados**:
- ✅ Agregar al encabezado: Total horas
- ✅ Agregar al encabezado: Total pago
- ✅ Listado está bien

**Ordenamiento**:
- ✅ Por fecha de evento (más reciente a más antigua)
- ✅ Por nombre de evento (A-Z)

**Implementación**:
- Backend: Remover filtros de empleado
- Frontend: Remover campos de filtro de empleado
- Frontend: Mostrar totales en encabezado

---

### 5. REPORTE "CONSOLIDADO DE PAGOS"

**Cambios en Filtros**:
- ✅ Mantener: Desde (OBLIGATORIO)
- ✅ Mantener: Hasta (OBLIGATORIO)
- ❌ Quitar: Nombre completo
- ❌ Quitar: Email
- ❌ Quitar: Teléfono

**Cambios en Resultados**:
- ✅ Agregar al encabezado: Total horas
- ✅ Agregar al encabezado: Total pago
- ✅ Listado está bien

**Ordenamiento**:
- ✅ Alfabéticamente por nombre del empleado

**Implementación**:
- Backend: Remover filtros de empleado
- Frontend: Remover campos de filtro de empleado
- Frontend: Mostrar totales en encabezado

---

## CAMBIOS EN NAVEGACIÓN

### Perfil Administrador
- ✅ Noticias: Agregar como opción de menú (no como sección aparte)
- ✅ Reportes: Ya existe

### Perfil Empleado
- ✅ Noticias: Agregar como opción de menú (no como sección aparte)
- ✅ Reportes: AGREGAR como opción de menú

**Implementación**:
- Frontend: Modificar Layout.tsx para agregar opciones de menú
- Frontend: Crear página EmployeeReportsPage o agregar a EmployeeProfilePage
- Frontend: Remover secciones de noticias del dashboard

---

## CORRECCIONES ADICIONALES

### 1. Mensajes con "{}"
**Problema**: Mensajes como "No puedes invitar a este empleado. Tienen otro evento el mismo día con una diferencia de {hours} horas..."

**Solución**: Verificar que la interpolación de parámetros funciona correctamente en `errorMessages.ts`

**Archivos**:
- `frontend/src/lib/errorMessages.ts`

---

### 2. Edición de Nombres de Roles
**Status**: ✅ YA IMPLEMENTADO en Sesión 14

---

### 3. Modificaciones en "Mis Turnos" del Empleado

**Cambios**:
- ❌ Quitar botón "Futuros"
- ✅ Botón "Activos": Mostrar turnos en curso + pendientes por aprobación + confirmados
- ✅ Mantener botón "Todos"
- ✅ Mantener botón "Completados"
- ❌ Quitar título "Mis Eventos Activos"

**Implementación**:
- Frontend: Modificar EmployeeProfilePage.tsx
- Frontend: Actualizar lógica de filtros
- Frontend: Remover título

---

## RESUMEN DE CAMBIOS

| Componente | Cambios | Prioridad |
|-----------|---------|-----------|
| ReportsPage.tsx | Modificar filtros y resultados de 5 reportes | ALTA |
| Backend reports.py | Actualizar endpoints para nuevos filtros | ALTA |
| EmployeeProfilePage.tsx | Modificar filtros de turnos | MEDIA |
| Layout.tsx | Agregar opciones de menú para Noticias y Reportes | MEDIA |
| errorMessages.ts | Verificar interpolación de parámetros | BAJA |
| DashboardPage.tsx | Remover secciones de noticias | BAJA |

---

## ARCHIVOS A MODIFICAR

### Backend
1. `backend/app/routers/reports.py` - Endpoints de reportes

### Frontend
1. `frontend/src/pages/ReportsPage.tsx` - Página de reportes
2. `frontend/src/pages/EmployeeProfilePage.tsx` - Perfil del empleado
3. `frontend/src/components/Layout.tsx` - Navegación
4. `frontend/src/pages/DashboardPage.tsx` - Dashboard
5. `frontend/src/lib/errorMessages.ts` - Mensajes de error

---

## ESTIMACIÓN DE ESFUERZO

| Tarea | Tiempo |
|-------|--------|
| Modificar ReportsPage.tsx | 2 horas |
| Modificar backend reports.py | 1.5 horas |
| Modificar EmployeeProfilePage.tsx | 1 hora |
| Modificar Layout.tsx | 0.5 horas |
| Verificar errorMessages.ts | 0.5 horas |
| Testing | 1.5 horas |
| **TOTAL** | **6.5 horas** |

---

**Status**: 📋 ESPECIFICACIÓN COMPLETA - LISTO PARA IMPLEMENTACIÓN

