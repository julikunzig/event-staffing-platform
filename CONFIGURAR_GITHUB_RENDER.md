# 📋 Configurar GitHub y Render - Guía Visual Paso a Paso

## 🎯 Objetivo

Configurar GitHub y desplegar en Render en **20 minutos**.

---

## PARTE 1: CONFIGURAR GITHUB (10 minutos)

### Paso 1: Proteger Rama Main

**URL**: https://github.com/julikunzig/event-staffing-platform/settings/branches

```
1. En GitHub, ir a: Settings (pestaña)
2. En el menú izquierdo: Branches
3. Click en "Add rule"
4. Branch name pattern: main
5. Marcar:
   ☑ Require a pull request before merging
   ☑ Require status checks to pass before merging
   ☑ Require branches to be up to date before merging
6. Click "Create"
```

**Resultado**: Nadie puede hacer push directo a main, solo por Pull Request.

---

### Paso 2: Agregar Secrets (Variables Seguras)

**URL**: https://github.com/julikunzig/julikunzig/event-staffing-platform/settings/secrets/actions

```
1. En GitHub, ir a: Settings (pestaña)
2. En el menú izquierdo: Secrets and variables → Actions
3. Click "New repository secret"
4. Agregar 3 secrets:

   SECRET 1:
   Name: SECRET_KEY
   Value: (generar con comando abajo)
   
   SECRET 2:
   Name: DATABASE_PASSWORD
   Value: postgres123456
   
   SECRET 3:
   Name: RENDER_API_KEY
   Value: (obtener de Render después)
```

**Generar SECRET_KEY**:
```bash
openssl rand -hex 32
# Resultado: algo como: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Pasos para agregar cada secret**:
```
1. Click "New repository secret"
2. Name: (nombre del secret)
3. Secret: (valor)
4. Click "Add secret"
5. Repetir para los 3 secrets
```

---

### Paso 3: Habilitar GitHub Actions (CI/CD)

**URL**: https://github.com/julikunzig/event-staffing-platform/settings/actions

```
1. En GitHub, ir a: Settings (pestaña)
2. En el menú izquierdo: Actions → General
3. En "Actions permissions":
   ☑ Allow all actions and reusable workflows
4. Click "Save"
```

**Resultado**: GitHub Actions está habilitado para CI/CD automático.

---

## PARTE 2: CONFIGURAR RENDER (10 minutos)

### Paso 1: Crear Cuenta en Render

**URL**: https://render.com

```
1. Ir a: https://render.com
2. Click "Sign up"
3. Seleccionar "Sign up with GitHub"
4. Autorizar Render en GitHub
5. Completar perfil
```

---

### Paso 2: Crear Blueprint (Deployment Automático)

**URL**: https://dashboard.render.com

```
1. En Render Dashboard, click "New +"
2. Seleccionar "Blueprint"
3. Conectar repositorio GitHub:
   - Seleccionar: julikunzig/event-staffing-platform
   - Rama: main
4. Click "Connect"
```

---

### Paso 3: Configurar Variables de Entorno

**En Render Dashboard**:

```
1. Después de conectar, Render mostrará un formulario
2. Configurar variables:

   DATABASE_URL:
   postgresql://postgres:postgres@db:5432/event_staffing
   
   SECRET_KEY:
   (pegar el valor generado con openssl)
   
   ENVIRONMENT:
   production
   
   CORS_ORIGINS:
   ["https://event-staffing-frontend.onrender.com"]

3. Click "Deploy"
```

---

### Paso 4: Esperar Deployment

```
Render desplegará automáticamente:
- PostgreSQL (Base de datos)
- Backend (FastAPI)
- Frontend (React)

Tiempo estimado: 5-10 minutos

Puedes ver el progreso en:
https://dashboard.render.com
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### 1. Verificar GitHub

```
✅ Rama main protegida
✅ Secrets agregados
✅ GitHub Actions habilitado
✅ Repositorio conectado a Render
```

**Ir a**: https://github.com/julikunzig/event-staffing-platform

---

### 2. Verificar Render

```
✅ Servicios desplegados
✅ URLs generadas
✅ Base de datos funcionando
✅ Backend respondiendo
✅ Frontend cargando
```

**Ir a**: https://dashboard.render.com

---

### 3. Verificar URLs de Producción

```
Frontend:
https://event-staffing-frontend.onrender.com

Backend:
https://event-staffing-backend.onrender.com

Swagger:
https://event-staffing-backend.onrender.com/docs
```

---

### 4. Probar Login en Producción

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

## 🔄 FLUJO DE DEPLOYMENT AUTOMÁTICO

Después de configurar, cada vez que hagas push a `main`:

```
1. Haces push a GitHub
   git push origin main

2. GitHub Actions se ejecuta
   - Ejecuta tests
   - Verifica código
   - Construye Docker images

3. Si todo está bien, Render se actualiza automáticamente
   - Descarga código nuevo
   - Ejecuta migraciones
   - Reinicia servicios

4. Tu aplicación está actualizada en producción
   https://event-staffing-frontend.onrender.com
```

---

## 📋 CHECKLIST FINAL

- [ ] Rama main protegida en GitHub
- [ ] 3 Secrets agregados (SECRET_KEY, DATABASE_PASSWORD, RENDER_API_KEY)
- [ ] GitHub Actions habilitado
- [ ] Cuenta Render creada
- [ ] Blueprint conectado
- [ ] Variables de entorno configuradas
- [ ] Deployment completado
- [ ] Frontend accesible
- [ ] Backend respondiendo
- [ ] Login funcionando

---

## 🆘 PROBLEMAS COMUNES

### Error: "Build failed"

```
Solución:
1. Ir a Render Dashboard
2. Ver logs del servicio
3. Buscar el error
4. Corregir en GitHub
5. Hacer push (se redeploya automáticamente)
```

### Error: "Database connection failed"

```
Solución:
1. Verificar DATABASE_URL en Render
2. Verificar que PostgreSQL está corriendo
3. Ejecutar migraciones manualmente:
   render exec psql -U postgres -d event_staffing < init_data.sql
```

### Error: "CORS error"

```
Solución:
1. Verificar CORS_ORIGINS en backend
2. Debe incluir: https://event-staffing-frontend.onrender.com
3. Hacer push para actualizar
```

### Error: "Frontend no carga"

```
Solución:
1. Verificar que VITE_API_URL apunta a backend correcto
2. Debe ser: https://event-staffing-backend.onrender.com/api/v1
3. Hacer push para actualizar
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Configurar GitHub (10 min)
2. ✅ Configurar Render (10 min)
3. ✅ Esperar deployment (5-10 min)
4. ✅ Verificar que funciona
5. ✅ Compartir URLs con colaboradores

---

## 📞 URLS IMPORTANTES

### GitHub
- Repositorio: https://github.com/julikunzig/event-staffing-platform
- Settings: https://github.com/julikunzig/event-staffing-platform/settings
- Branches: https://github.com/julikunzig/event-staffing-platform/settings/branches
- Secrets: https://github.com/julikunzig/event-staffing-platform/settings/secrets/actions

### Render
- Dashboard: https://dashboard.render.com
- Documentación: https://render.com/docs

---

## 💡 TIPS

1. **Secrets seguros**: Nunca commitear secrets en GitHub
2. **Deployment automático**: Cada push a main se deploya automáticamente
3. **Logs**: Ver logs en Render Dashboard para debugging
4. **Rollback**: Si algo falla, Render mantiene versión anterior
5. **Monitoreo**: Render tiene dashboard para ver estado de servicios

---

**¡Listo! Tu aplicación está en producción.** 🚀

---

**Última actualización**: 14 de Mayo, 2026
