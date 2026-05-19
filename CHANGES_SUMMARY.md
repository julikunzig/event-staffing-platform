# Resumen de Cambios - 8 de Mayo, 2026

## 🔧 Problemas Resueltos

### 1. ✅ CORS Error en Noticias
**Problema**: `Access to XMLHttpRequest at 'http://10.0.0.13:8000/api/v1/news' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solución**:
- Cambié `frontend/.env` de `http://10.0.0.13:8000/api/v1` a `http://localhost:8000/api/v1`
- Agregué `http://localhost:8000` a la lista de CORS allowed origins en `backend/app/main.py`
- Ahora el frontend accede al backend desde localhost, evitando conflictos de CORS

**Archivos modificados**:
- `frontend/.env`
- `backend/app/main.py`

---

### 2. ✅ Menú Móvil (Logout y Cambio de Idioma)
**Problema**: El menú desplegable en la navegación móvil no era visible o no funcionaba

**Solución**:
- Cambié la posición del menú de `absolute bottom-full` a `fixed bottom-16 right-4`
- Aumenté el z-index a `z-50` para asegurar que esté visible
- Mejoré el shadow con `shadow-2xl`
- Agregué `z-40` al contenedor para mejor manejo de capas

**Archivos modificados**:
- `frontend/src/components/Layout.tsx`

---

### 3. ✅ Noticias en Mayúsculas
**Problema**: Las noticias no se guardaban en mayúsculas en la base de datos

**Solución**:
- Agregué conversión a mayúsculas en `create_news()`: `title_upper = data.title.upper().strip()`
- Agregué conversión a mayúsculas en `update_news()` para título y contenido
- Ahora tanto el título como el contenido se guardan en mayúsculas

**Archivos modificados**:
- `backend/app/routers/news.py`

---

## 🆕 Nuevas Funcionalidades Implementadas

### 1. ✅ Configuración de Tiempo para Iniciar Turno
**Descripción**: El administrador puede configurar cuántos minutos antes del evento puede un empleado iniciar su turno (15, 30, 40, 60 minutos, etc.)

**Cambios**:
- Agregué campo `shift_start_minutes_before` a la tabla `companies` (default: 30 minutos)
- Creé migración: `backend/alembic/versions/0009_shift_start_minutes_config.py`
- Agregué endpoint `PATCH /companies/{company_id}/shift-start-config` para actualizar esta configuración
- Agregué schema `ShiftStartConfigUpdate` en companies router

**Archivos modificados**:
- `backend/app/models/company.py`
- `backend/app/routers/companies.py`
- `backend/alembic/versions/0009_shift_start_minutes_config.py` (nuevo)

**Uso**:
```bash
PATCH /api/v1/companies/{company_id}/shift-start-config
{
  "shift_start_minutes_before": 30
}
```

---

### 2. ⏳ Prevenir Múltiples Sesiones (Pendiente)
**Descripción**: No permitir que un usuario abra más de una sesión al mismo tiempo

**Estado**: Identificado pero requiere cambios más complejos en la arquitectura de tokens JWT

**Enfoque recomendado**:
- Agregar campo `last_login_jti` a la tabla `users`
- Guardar el `jti` (JWT ID) del token en cada login
- Validar en `get_current_user()` que el `jti` del token coincida con el guardado
- Esto invalida automáticamente tokens anteriores

**Próximos pasos**: Implementar en siguiente sesión

---

## 📋 Cambios en Archivos

### Backend
1. **`backend/app/main.py`**
   - Agregué `http://localhost:8000` a CORS allowed origins

2. **`backend/app/models/company.py`**
   - Agregué campo `shift_start_minutes_before: int` (default 30)

3. **`backend/app/routers/companies.py`**
   - Agregué schema `ShiftStartConfigUpdate`
   - Agregué endpoint `PATCH /{company_id}/shift-start-config`

4. **`backend/app/routers/news.py`**
   - Agregué conversión a mayúsculas en `create_news()`
   - Agregué conversión a mayúsculas en `update_news()`

5. **`backend/alembic/versions/0009_shift_start_minutes_config.py`** (nuevo)
   - Migración para agregar `shift_start_minutes_before` a companies

### Frontend
1. **`frontend/.env`**
   - Cambié `VITE_API_URL` de `http://10.0.0.13:8000/api/v1` a `http://localhost:8000/api/v1`

2. **`frontend/src/components/Layout.tsx`**
   - Mejoré posicionamiento del menú móvil
   - Cambié de `absolute` a `fixed` positioning
   - Aumenté z-index para mejor visibilidad

---

## 🚀 Instrucciones para Probar

### 1. Aplicar Migración de Base de Datos
```bash
# El Docker aplicará automáticamente la migración al iniciar
docker-compose up -d
```

### 2. Probar Noticias
- Ir a la página de Noticias
- Crear una noticia con texto en minúsculas
- Verificar que se guarde en mayúsculas en la base de datos

### 3. Probar Menú Móvil
- Abrir la app en un dispositivo móvil o emulador
- Hacer clic en el botón "Más" en la navegación inferior
- Verificar que aparezca el menú con opciones de idioma y logout
- Probar cambiar de idioma
- Probar cerrar sesión

### 4. Probar Configuración de Turno
```bash
# Actualizar tiempo para iniciar turno (ejemplo: 45 minutos)
curl -X PATCH http://localhost:8000/api/v1/companies/1/shift-start-config \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"shift_start_minutes_before": 45}'
```

---

## ⚠️ Notas Importantes

1. **CORS**: Ahora el frontend debe acceder desde `localhost:5173` al backend en `localhost:8000`. Si necesitas acceder desde otro dispositivo, actualiza el `.env` y agrega la URL a CORS en `main.py`.

2. **Migraciones**: La migración `0009_shift_start_minutes_config.py` se aplicará automáticamente al iniciar Docker.

3. **Múltiples Sesiones**: Esta funcionalidad requiere cambios más complejos y será implementada en la siguiente sesión.

---

## 📊 Estado General

✅ **Completado**:
- CORS error resuelto
- Menú móvil funcionando
- Noticias en mayúsculas
- Configuración de tiempo para iniciar turno
- Formulario de noticias mejorado

⏳ **Pendiente**:
- Prevenir múltiples sesiones simultáneas
- Integración de configuración de turno en UI

---

## 🔍 Verificación Rápida

```bash
# 1. Verificar que el backend está corriendo
curl http://localhost:8000/health

# 2. Verificar CORS
curl -H "Origin: http://localhost:5173" http://localhost:8000/health

# 3. Probar login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@platform.com","password":"Admin1234!","company_id":1}'
```

---

**Última actualización**: 8 de Mayo, 2026
**Próxima sesión**: Implementar prevención de múltiples sesiones y optimizaciones adicionales
