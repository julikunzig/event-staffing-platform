# Instrucciones de Deployment - Sesión 14

**Fecha**: 12 de Mayo, 2026

---

## PRE-DEPLOYMENT CHECKLIST

### Backend
- [ ] Verificar que `job_roles.py` está actualizado
- [ ] Ejecutar migraciones de BD (si las hay)
- [ ] Reiniciar servidor backend
- [ ] Verificar que los endpoints funcionan

### Frontend
- [ ] Ejecutar `npm run build`
- [ ] Verificar que no hay errores de compilación
- [ ] Verificar que no hay warnings críticos
- [ ] Ejecutar `npm run dev` para testing local

### Testing
- [ ] Ejecutar tests manuales de AccountPage
- [ ] Ejecutar tests manuales de DashboardPage
- [ ] Ejecutar tests manuales de EventEditPage
- [ ] Ejecutar tests manuales de EmployeeProfilePage
- [ ] Verificar traducciones en ambos idiomas

---

## PASOS DE DEPLOYMENT

### 1. Backend

```bash
# Navegar al directorio del backend
cd backend

# Verificar que los cambios están en job_roles.py
git diff app/routers/job_roles.py

# Reiniciar el servidor (si está en Docker)
docker-compose restart backend

# O si está en desarrollo
# Presionar Ctrl+C y ejecutar:
# python -m uvicorn app.main:app --reload
```

### 2. Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias (si es necesario)
npm install

# Compilar
npm run build

# Verificar que no hay errores
# Si todo está bien, el build debería completarse sin errores

# Para testing local
npm run dev
```

### 3. Verificación

```bash
# Verificar que el backend está corriendo
curl http://localhost:8000/docs

# Verificar que el frontend está corriendo
# Abrir http://localhost:5173 en el navegador
```

---

## CAMBIOS EN LA BASE DE DATOS

**Status**: No se requieren migraciones

Los cambios en `job_roles.py` son solo en la lógica de la aplicación, no en el esquema de la BD.

---

## CAMBIOS EN LAS VARIABLES DE ENTORNO

**Status**: No se requieren cambios

No hay nuevas variables de entorno necesarias.

---

## ROLLBACK (Si es necesario)

### Backend
```bash
# Revertir cambios en job_roles.py
git checkout app/routers/job_roles.py

# Reiniciar servidor
docker-compose restart backend
```

### Frontend
```bash
# Revertir cambios
git checkout frontend/src/pages/AccountPage.tsx
git checkout frontend/src/pages/DashboardPage.tsx
git checkout frontend/src/pages/EventEditPage.tsx
git checkout frontend/src/pages/EmployeeProfilePage.tsx
git checkout frontend/src/i18n/es.json
git checkout frontend/src/i18n/en.json

# Recompilar
npm run build
```

---

## MONITOREO POST-DEPLOYMENT

### Verificar en el Navegador

1. **AccountPage**
   - [ ] Selector de idioma visible
   - [ ] Pestaña "Cambiar Contraseña" visible
   - [ ] Cambio de idioma funciona

2. **DashboardPage**
   - [ ] Rol del usuario se traduce
   - [ ] Cambio de idioma funciona

3. **EventEditPage**
   - [ ] Estado del evento se traduce
   - [ ] Cambio de idioma funciona

4. **EmployeeProfilePage**
   - [ ] Paginación visible
   - [ ] Filtros visibles
   - [ ] Cambio de página funciona
   - [ ] Filtros funcionan

5. **EventsPage**
   - [ ] Eventos ordenados por fecha
   - [ ] Paginación funciona

### Verificar en la Consola

```bash
# No debe haber errores de TypeScript
npm run build

# No debe haber warnings críticos
npm run dev
```

### Verificar en el Backend

```bash
# Verificar que los endpoints funcionan
curl -X PATCH http://localhost:8000/job-roles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "BARTENDER", "hourly_rate": 25.00}'
```

---

## DOCUMENTACIÓN PARA EL USUARIO

### Cambio de Contraseña

1. Ir a "Mi Cuenta"
2. Hacer clic en la pestaña "Cambiar Contraseña"
3. Ingresar contraseña actual
4. Ingresar nueva contraseña (mínimo 8 caracteres)
5. Confirmar nueva contraseña
6. Hacer clic en "Cambiar Contraseña"

### Selector de Idioma

1. Ir a "Mi Cuenta"
2. En la sección "Mi Perfil", buscar el selector de idioma en la esquina superior derecha
3. Seleccionar "Español" o "English"
4. La interfaz se actualizará automáticamente

### Paginación en Mis Turnos

1. Ir a "Mi Perfil" (como empleado)
2. Usar los botones de filtro para filtrar turnos
3. Usar los botones "Anterior" y "Siguiente" para navegar entre páginas

---

## SOPORTE

Si hay problemas después del deployment:

1. Verificar los logs del backend
2. Verificar los logs del frontend (consola del navegador)
3. Verificar que las traducciones están presentes en los archivos JSON
4. Verificar que no hay errores de compilación

---

## TIMELINE

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Backend deployment | 5 minutos |
| Frontend build | 2 minutos |
| Testing | 15 minutos |
| Monitoreo | 10 minutos |
| **Total** | **32 minutos** |

---

**Status**: 🟢 LISTO PARA DEPLOYMENT

