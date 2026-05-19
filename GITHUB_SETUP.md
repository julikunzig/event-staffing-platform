# Configuración de GitHub

## 📋 Pasos para Crear el Repositorio

### 1. Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. Nombre: `event-staffing-platform`
3. Descripción: `Herramienta web para gestión de eventos sociales con sistema de asignación de personal`
4. Seleccionar "Public" (para que otros puedan verlo)
5. NO inicializar con README (ya lo tenemos)
6. Crear repositorio

### 2. Inicializar Git Localmente

```bash
cd /Users/julian.kunzig/Documents/EventsControl

# Inicializar git
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "feat: initial commit - event staffing platform v1.0"

# Agregar remote
git remote add origin https://github.com/tu-usuario/event-staffing-platform.git

# Cambiar rama a main
git branch -M main

# Push
git push -u origin main
```

### 3. Configurar Ramas

```bash
# Crear rama develop
git checkout -b develop
git push -u origin develop

# Crear rama staging
git checkout -b staging
git push -u origin staging
```

### 4. Configurar Protecciones

En GitHub:
1. Settings → Branches
2. Add rule
3. Branch name pattern: `main`
4. Habilitar:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require branches to be up to date

### 5. Configurar Secrets (para CI/CD)

En GitHub:
1. Settings → Secrets and variables → Actions
2. Agregar:
   - `SECRET_KEY`: Generar con `openssl rand -hex 32`
   - `DATABASE_PASSWORD`: Contraseña segura
   - `RENDER_API_KEY`: (si usas Render)

### 6. Configurar GitHub Actions (CI/CD)

Crear archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest
      
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}
```

## 📊 Estructura de Ramas

```
main (producción)
  ↑
  ├── staging (pre-producción)
  │    ↑
  │    └── develop (desarrollo)
  │         ↑
  │         ├── feature/nueva-funcionalidad
  │         ├── fix/bug-importante
  │         └── refactor/mejora-codigo
```

## 🔄 Flujo de Trabajo

### Para Nueva Característica

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit
git add .
git commit -m "feat: descripción de la característica"

# 4. Push
git push -u origin feature/nombre-feature

# 5. Crear Pull Request en GitHub
# - Ir a GitHub
# - Crear PR hacia develop
# - Describir cambios
# - Esperar review

# 6. Merge (después de aprobación)
git checkout develop
git pull origin develop
git merge feature/nombre-feature
git push origin develop

# 7. Eliminar rama
git branch -d feature/nombre-feature
git push origin --delete feature/nombre-feature
```

### Para Bug Fix

```bash
git checkout develop
git checkout -b fix/nombre-bug
# ... hacer cambios ...
git commit -m "fix: descripción del bug"
git push -u origin fix/nombre-bug
# Crear PR hacia develop
```

## 📝 Convenciones de Commits

```
feat: agregar nueva característica
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar tests
chore: cambios en build/dependencias
```

Ejemplo:
```bash
git commit -m "feat: agregar validación de horas entre eventos"
git commit -m "fix: corregir cálculo de overtime"
git commit -m "docs: actualizar README con instrucciones"
```

## 🏷️ Etiquetas (Labels)

Crear en GitHub → Issues → Labels:

- `bug` - Rojo
- `enhancement` - Verde
- `documentation` - Azul
- `good first issue` - Amarillo
- `help wanted` - Naranja
- `question` - Púrpura
- `wontfix` - Gris

## 📌 Milestones

Crear en GitHub → Issues → Milestones:

- v1.0 - MVP (Actual)
- v1.1 - Excel/PDF Export
- v1.2 - Notificaciones Email/SMS
- v2.0 - Características avanzadas

## 🚀 Deployment Automático

### Con Render

1. En Render, conectar repositorio
2. Configurar rama: `main`
3. Cada push a `main` desplegará automáticamente

### Con GitHub Pages (Frontend)

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / folder: `frontend/dist`
4. Cada push a `main` desplegará el frontend

## 📊 Badges para README

Agregar al README:

```markdown
[![GitHub license](https://img.shields.io/github/license/tu-usuario/event-staffing-platform)](https://github.com/tu-usuario/event-staffing-platform/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/tu-usuario/event-staffing-platform)](https://github.com/tu-usuario/event-staffing-platform/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/tu-usuario/event-staffing-platform)](https://github.com/tu-usuario/event-staffing-platform/issues)
```

## 🔐 Seguridad

- ✅ Nunca commitear `.env` (usar `.env.example`)
- ✅ Nunca commitear `node_modules` o `__pycache__`
- ✅ Usar `.gitignore` (ya creado)
- ✅ Revisar secrets antes de push
- ✅ Usar tokens en lugar de contraseñas

## 📞 Próximos Pasos

1. ✅ Crear repositorio en GitHub
2. ✅ Hacer push inicial
3. ✅ Configurar protecciones de rama
4. ✅ Configurar CI/CD
5. ✅ Configurar deployment automático
6. ✅ Invitar colaboradores
7. ✅ Crear issues para features pendientes

---

**¡Listo para GitHub!** 🚀
