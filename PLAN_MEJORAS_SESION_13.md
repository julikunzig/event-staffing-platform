# Plan de Mejoras - Sesión 13

## Tareas a Realizar

### 1. Dashboard del Administrador
- [ ] Agregar "Mi Empresa" (nombre de la empresa actual)
- [ ] Agregar sección de "Noticias" (últimas 3-5 noticias)
- [ ] Traducir al inglés si el idioma está en inglés

### 2. Dashboard del Empleado
- [ ] Agregar sección de "Noticias" (últimas 3-5 noticias)
- [ ] Agregar sección de "Reportes" (resumen de horas y pagos)
- [ ] Traducir al inglés si el idioma está en inglés

### 3. Mensajes de Error - Traducción
- [ ] Agregar traducciones para mensaje de invitación: "No puedes invitar a este empleado. Tiene otro evento el mismo día con una diferencia de X horas, pero necesita al menos Y horas de diferencia."
- [ ] Agregar traducciones para mensaje de aplicación: "No puedes aplicar a este evento. Tienes otro evento el mismo día con una diferencia de X horas, pero necesitas al menos Y horas de diferencia."
- [ ] Todos los mensajes similares deben estar en i18n

### 4. Noticias en Perfil del Empleado
- [ ] No mostrar fecha de publicación
- [ ] No mostrar fecha de expiración
- [ ] Solo mostrar título y contenido

### 5. Ordenamiento de Eventos
- [ ] Ordenar por fecha del evento (más nuevo al más antiguo)
- [ ] Si hay eventos el mismo día, ordenar por hora (mayor a menor)
- [ ] Aplicar en EventsPage

### 6. Paginador de Eventos
- [ ] Implementar paginador de 10 en 10
- [ ] Mostrar página actual y total
- [ ] Botones de siguiente/anterior
- [ ] Aplicar en EventsPage

### 7. Traducción en Dashboard
- [ ] Traducir "¡Bienvenido, {nombre}!" al inglés
- [ ] Traducir descripciones de cards al inglés
- [ ] Traducir roles al inglés

### 8. Paginador de Mis Turnos
- [ ] Implementar paginador de 10 en 10
- [ ] Botones de filtro: Activos, Futuros, Completados
- [ ] Traducir botones al inglés/español según idioma
- [ ] Aplicar en EmployeeProfilePage

---

## Prioridad

1. **Alta**: Tareas 3, 5, 7 (Traducción y ordenamiento)
2. **Media**: Tareas 1, 2, 4, 6, 8 (UI/UX)

---

## Archivos a Modificar

### Frontend
- `frontend/src/pages/DashboardPage.tsx` - Tareas 1, 2, 7
- `frontend/src/pages/EventsPage.tsx` - Tareas 5, 6
- `frontend/src/pages/EmployeeProfilePage.tsx` - Tareas 4, 8
- `frontend/src/i18n/es.json` - Tareas 3, 7
- `frontend/src/i18n/en.json` - Tareas 3, 7

### Backend
- `backend/app/routers/assignments.py` - Tareas 3 (mensajes de error)

---

## Estimación de Tiempo

- Tarea 1: 30 min
- Tarea 2: 30 min
- Tarea 3: 45 min
- Tarea 4: 15 min
- Tarea 5: 20 min
- Tarea 6: 45 min
- Tarea 7: 30 min
- Tarea 8: 60 min

**Total**: ~4 horas

