# ⚡ Quick Start - Guía Rápida

## 🎯 Objetivo

Subir tu aplicación a GitHub y desplegarla en producción en **15 minutos**.

## 📋 Requisitos

- ✅ Cuenta GitHub (https://github.com)
- ✅ Repositorio creado en GitHub
- ✅ Git instalado en tu máquina

## 🚀 Pasos

### Paso 1: Crear Personal Access Token (2 min)

```
1. Ir a: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Configurar:
   - Note: event-staffing-platform
   - Expiration: 90 days
   - Scopes: ✅ repo, ✅ workflow
4. Click: "Generate token"
5. Copiar token (no podrás verlo de nuevo)
```

### Paso 2: Configurar Git (1 min)

```bash
git config --global credential.helper osxkeychain
```

### Paso 3: Hacer Push (2 min)

```bash
cd /Users/julian.kunzig/Documents/EventsControl

git push -u origin main
```

**Cuando pida:**
- Username: `julikunzig`
- Password: Pega el token

### Paso 4: Crear Ramas (2 min)

```bash
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging

git checkout main
```

### Paso 5: Elegir Deployment (5 min)

#### Opción A: Render (Recomendado)

```
1. Ir a: https://render.com
2. Sign up with GitHub
3. Create → Blueprint
4. Connect repository
5. Deploy
```

#### Opción B: Railway

```
1. Ir a: https://railway.app
2. Sign up with GitHub
3. New Project
4. Deploy from GitHub
5. Deploy
```

#### Opción C: Heroku

```bash
brew tap heroku/brew && brew install heroku
heroku login
heroku create event-staffing-platform
git push heroku main
```

## ✅ Verificar

### Local

```bash
# Frontend
http://localhost:5173

# Backend
http://localhost:8000/docs

# Login
Email: superadmin@platform.com
Password: Admin1234!
```

### GitHub

```
https://github.com/julikunzig/event-staffing-platform
```

### Producción (Después de Deploy)

```
https://event-staffing-frontend.onrender.com
https://event-staffing-backend.onrender.com
```

## 🆘 Problemas Comunes

### "Invalid username or token"

```bash
git config --global --unset credential.helper
git config --global credential.helper osxkeychain
git push -u origin main
```

### "Repository not found"

Verificar:
- Repositorio existe en GitHub
- Nombre correcto: `event-staffing-platform`
- Usuario correcto: `julikunzig`

### "Permission denied"

Crear nuevo token con permisos: `repo` y `workflow`

## 📚 Documentación Completa

- `README.md` - Documentación principal
- `DEPLOYMENT.md` - Opciones de deployment
- `GITHUB_AUTH.md` - Autenticación GitHub
- `PUSH_TO_GITHUB.md` - Pasos detallados
- `CONTRIBUTING.md` - Guía de contribución

## 🎯 Resultado

```
✅ Código en GitHub
✅ Aplicación en producción
✅ Listo para colaboradores
✅ Listo para usuarios
```

## ⏱️ Tiempo Total

- Crear token: 2 min
- Configurar git: 1 min
- Push: 2 min
- Crear ramas: 2 min
- Deploy: 5 min
- **Total: 12 minutos**

---

**¡Listo para producción!** 🚀
