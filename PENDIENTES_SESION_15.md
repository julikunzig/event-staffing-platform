# Pendientes para Sesión 15

**Fecha**: 12 de Mayo, 2026  
**Sesión Anterior**: Sesión 14 ✅ Completada

---

## 📋 TAREAS PENDIENTES

### 1. Cambio de Contraseña Obligatorio en Primer Login

**Descripción**: Cuando un usuario inicia sesión por primera vez, debe cambiar su contraseña antes de acceder a la aplicación.

**Requisitos**:
- [ ] Backend: Verificar flag `must_change_password` en JWT
- [ ] Frontend: Detectar flag en AuthContext
- [ ] Frontend: Redirigir a página de cambio de contraseña
- [ ] Frontend: Prevenir acceso a otras páginas
- [ ] Frontend: Después del cambio, redirigir a login
- [ ] Frontend: Mostrar mensaje explicativo

**Archivos a Modificar**:
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/App.tsx`
- `frontend/src/pages/AccountPage.tsx`
- `backend/app/routers/auth.py` (si es necesario)

**Flujo**:
```
1. Usuario inicia sesión
2. Backend retorna JWT con must_change_password=true
3. Frontend detecta flag
4. Frontend redirige a /account?tab=password
5. Usuario cambia contraseña
6. Backend actualiza must_change_password=false
7. Frontend redirige a /login
8. Usuario inicia sesión con nueva contraseña
```

---

### 2. Dashboard del Empleado - Noticias

**Descripción**: Agregar sección de Noticias al dashboard del empleado.

**Requisitos**:
- [ ] Mostrar noticias activas
- [ ] Máximo 3 noticias
- [ ] Mostrar solo título y contenido
- [ ] No mostrar fechas
- [ ] Diseño responsive

**Archivos a Modificar**:
- `frontend/src/pages/DashboardPage.tsx`

**Cambios**:
```tsx
// Agregar sección de Noticias para empleados
{!isAdmin(user) && (
  <div>
    <h2 className="text-lg font-bold text-slate-900 mb-4">{t('dashboard.news')}</h2>
    {/* Mostrar noticias */}
  </div>
)}
```

---

### 3. Dashboard del Empleado - Reportes

**Descripción**: Agregar sección de Reportes al dashboard del empleado.

**Requisitos**:
- [ ] Mostrar total de horas trabajadas
- [ ] Mostrar total de pago
- [ ] Mostrar próximos eventos
- [ ] Diseño responsive

**Archivos a Modificar**:
- `frontend/src/pages/DashboardPage.tsx`

**Cambios**:
```tsx
// Agregar sección de Reportes para empleados
{!isAdmin(user) && (
  <div>
    <h2 className="text-lg font-bold text-slate-900 mb-4">{t('dashboard.reports')}</h2>
    {/* Mostrar reportes */}
  </div>
)}
```

---

### 4. Formato de Fecha MM/DD/YYYY

**Descripción**: Aplicar formato de fecha americano a todas las páginas.

**Requisitos**:
- [ ] Usar utilidad `formatDateAmerican`
- [ ] Aplicar a EventsPage
- [ ] Aplicar a EmployeeProfilePage
- [ ] Aplicar a NewsPage
- [ ] Aplicar a EventDetailPage
- [ ] Aplicar a ReportsPage
- [ ] Aplicar a cualquier otra página con fechas

**Archivos a Modificar**:
- `frontend/src/pages/EventsPage.tsx`
- `frontend/src/pages/EmployeeProfilePage.tsx`
- `frontend/src/pages/NewsPage.tsx`
- `frontend/src/pages/EventDetailPage.tsx`
- `frontend/src/pages/ReportsPage.tsx`
- Cualquier otro archivo con fechas

**Ejemplo**:
```tsx
// ANTES
{new Date(event.event_date + 'T00:00:00').toLocaleDateString('es')}

// DESPUÉS
{formatDateAmerican(event.event_date)}
```

---

### 5. Remover Fechas de Noticias en Perfil

**Descripción**: En el perfil del empleado, las noticias no deben mostrar fechas de publicación/expiración.

**Requisitos**:
- [ ] Remover `published_at`
- [ ] Remover `expiration_date`
- [ ] Mostrar solo título y contenido
- [ ] Mantener diseño responsive

**Archivos a Modificar**:
- `frontend/src/pages/EmployeeProfilePage.tsx`

**Cambios**:
```tsx
// Remover fechas de noticias
{news.map(item => (
  <Card key={item.id}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{item.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
    </CardContent>
  </Card>
))}
```

---

## 📊 ESTIMACIÓN DE ESFUERZO

| Tarea | Complejidad | Tiempo Estimado |
|-------|-------------|-----------------|
| Cambio de contraseña obligatorio | Media | 2 horas |
| Dashboard empleado - Noticias | Baja | 1 hora |
| Dashboard empleado - Reportes | Media | 1.5 horas |
| Formato de fecha MM/DD/YYYY | Baja | 1 hora |
| Remover fechas de noticias | Baja | 0.5 horas |
| **Total** | | **6 horas** |

---

## 🔍 VERIFICACIÓN PREVIA

Antes de empezar Sesión 15, verificar:

- [ ] Sesión 14 completada y testeada
- [ ] Todos los cambios están en git
- [ ] No hay conflictos de merge
- [ ] Backend está corriendo
- [ ] Frontend está corriendo
- [ ] Base de datos está actualizada
- [ ] No hay errores en los logs

---

## 📝 NOTAS IMPORTANTES

### Cambio de Contraseña Obligatorio
- El flag `must_change_password` debe venir en el JWT
- Verificar que el backend lo retorna correctamente
- Prevenir acceso a otras páginas (usar route guard)
- Mostrar mensaje claro al usuario

### Dashboard del Empleado
- Reutilizar componentes existentes
- Mantener consistencia visual
- Usar las mismas traducciones
- Verificar que funciona en móvil

### Formato de Fecha
- Usar la utilidad `formatDateAmerican` ya creada
- Aplicar a TODAS las páginas con fechas
- Verificar que funciona en ambos idiomas
- No afecta el formato de entrada (input type="date")

### Noticias en Perfil
- Solo remover fechas de visualización
- No afecta la BD
- Mantener el mismo diseño
- Verificar que funciona en móvil

---

## 🎯 OBJETIVO SESIÓN 15

```
┌─────────────────────────────────────────┐
│  Sesión 15 - Objetivos                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Cambio de contraseña obligatorio    │
│  ✅ Dashboard del empleado              │
│  ✅ Formato de fecha MM/DD/YYYY         │
│  ✅ Remover fechas de noticias          │
│                                         │
│  Status: 🟡 PENDIENTE                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 REFERENCIAS

### Archivos Útiles
- `frontend/src/lib/dateFormatter.ts` - Utilidad de formato de fecha
- `frontend/src/lib/translationHelpers.ts` - Helpers de traducción
- `frontend/src/context/AuthContext.tsx` - Contexto de autenticación
- `frontend/src/pages/DashboardPage.tsx` - Dashboard actual

### Documentación
- `RESUMEN_SESION_14_COMPLETO.md` - Cambios de sesión anterior
- `TESTING_SESION_14.md` - Guía de testing
- `DEPLOYMENT_SESION_14.md` - Instrucciones de deployment

---

## ✅ CHECKLIST PRE-SESIÓN 15

- [ ] Leer este documento
- [ ] Revisar archivos a modificar
- [ ] Verificar que el ambiente está listo
- [ ] Crear rama de feature
- [ ] Empezar con Tarea 1

---

**Generado**: 12 de Mayo, 2026  
**Status**: 📋 LISTO PARA SESIÓN 15

