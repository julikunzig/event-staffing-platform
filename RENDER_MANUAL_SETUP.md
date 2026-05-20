# 🚀 Configurar Render Manualmente (Sin Blueprint)

## ⚠️ Problema

El archivo `render.yaml` tiene errores. Vamos a configurar Render **manualmente** en lugar de usar Blueprint.

---

## 📋 Pasos para Configurar Manualmente

### Paso 1: Crear Base de Datos PostgreSQL

**URL**: https://dashboard.render.com

```
1. Click "New +"
2. Seleccionar "PostgreSQL"
3. Configurar:
   - Name: event-staffing-db
   - Database: event_staffing
   - User: postgres
   - Region: Oregon (o tu región)
   - Plan: Free
4. Click "Create Database"
5. Esperar a que se cree (2-3 minutos)
6. Copiar la URL de conexión (Internal Database URL)
```

**Resultado**: Tendrás una URL como:
```
postgresql://postgres:XXXX@dpg-XXXX.oregon-postgres.render.com/event_staffing
```

---

### Paso 2: Crear Backend (FastAPI)

**URL**: https://dashboard.render.com

```
1. Click "New +"
2. Seleccionar "Web Service"
3. Conectar repositorio:
   - Seleccionar: julikunzig/event-staffing-platform
   - Branch: main
4. Configurar:
   - Name: event-staffing-backend
   - Environment: Python 3
   - Build Command: cd backend && pip install -r requirements.txt
   - Start Command: cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Plan: Free
5. Click "Create Web Service"
```

---

### Paso 3: Agregar Variables de Entorno al Backend

**En Render Dashboard**:

```
1. Click en "event-staffing-backend"
2. Click en "Environment" (pestaña)
3. Agregar variables:

   DATABASE_URL:
   postgresql://postgres:PASSWORD@dpg-XXXX.oregon-postgres.render.com/event_staffing
   (Reemplazar con la URL de la BD que copiaste)

   SECRET_KEY:
   (Generar con: openssl rand -hex 32)

   ENVIRONMENT:
   production

   CORS_ORIGINS:
   ["https://event-staffing-frontend.onrender.com"]

4. Click "Save"
5. Render redesplegará automáticamente
```

---

### Paso 4: Crear Frontend (React)

**URL**: https://dashboard.render.com

```
1. Click "New +"
2. Seleccionar "Static Site"
3. Conectar repositorio:
   - Seleccionar: julikunzig/event-staffing-platform
   - Branch: main
4. Configurar:
   - Name: event-staffing-frontend
   - Build Command: cd frontend && npm install && npm run build
   - Publish Directory: frontend/dist
   - Plan: Free
5. Click "Create Static Site"
```

---

### Paso 5: Agregar Variables de Entorno al Frontend

**En Render Dashboard**:

```
1. Click en "event-staffing-frontend"
2. Click en "Environment" (pestaña)
3. Agregar variable:

   VITE_API_URL:
   https://event-staffing-backend.onrender.com/api/v1

4. Click "Save"
5. Render redesplegará automáticamente
```

---

## ⏱️ Línea de Tiempo

```
Paso 1: Crear BD PostgreSQL        → 2-3 minutos
Paso 2: Crear Backend              → 5-10 minutos
Paso 3: Agregar variables backend  → 1 minuto
Paso 4: Crear Frontend             → 5-10 minutos
Paso 5: Agregar variables frontend → 1 minuto
─────────────────────────────────────────────
TOTAL:                             → 15-25 minutos
```

---

## ✅ Verificar que Funciona

### 1. Ver Servicios en Render Dashboard

```
https://dashboard.render.com

Deberías ver 3 servicios:
✅ event-staffing-db       (🟢 Live)
✅ event-staffing-backend  (🟢 Live)
✅ event-staffing-frontend (🟢 Live)
```

### 2. Probar URLs

```
Frontend:
https://event-staffing-frontend.onrender.com

Backend:
https://event-staffing-backend.onrender.com

Swagger:
https://event-staffing-backend.onrender.com/docs
```

### 3. Probar Login

```bash
curl -X POST https://event-staffing-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"superadmin@platform.com",
    "password":"Admin1234!",
    "company_id":1
  }'
```

**Resultado esperado**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 🆘 Problemas Comunes

### Error: "Build failed"

```
Solución:
1. Click en el servicio
2. Ver logs
3. Buscar el error
4. Corregir en GitHub
5. Hacer push (se redeploya automáticamente)
```

### Error: "Database connection failed"

```
Solución:
1. Verificar DATABASE_URL en variables
2. Copiar URL correcta de la BD
3. Actualizar variable
4. Render redesplegará
```

### Error: "CORS error"

```
Solución:
1. Verificar CORS_ORIGINS en variables
2. Debe ser: ["https://event-staffing-frontend.onrender.com"]
3. Actualizar variable
4. Render redesplegará
```

---

## 📋 Checklist

- [ ] Base de datos PostgreSQL creada
- [ ] Backend creado
- [ ] Variables de entorno del backend agregadas
- [ ] Frontend creado
- [ ] Variables de entorno del frontend agregadas
- [ ] Todos los servicios están 🟢 Live
- [ ] Frontend accesible
- [ ] Backend respondiendo
- [ ] Login funcionando

---

## 🎉 ¡Listo!

Tu aplicación está en producción.

```
✅ Frontend:  https://event-staffing-frontend.onrender.com
✅ Backend:   https://event-staffing-backend.onrender.com
✅ Swagger:   https://event-staffing-backend.onrender.com/docs
```

---

**Última actualización**: 14 de Mayo, 2026

**Tiempo total**: 15-25 minutos
