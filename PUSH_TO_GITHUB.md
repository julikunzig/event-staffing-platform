# 🚀 Subir a GitHub - Pasos Simples

## ⚠️ Problema: GitHub No Acepta Contraseña

GitHub requiere **Personal Access Token (PAT)** en lugar de contraseña.

## ✅ Solución Rápida (5 minutos)

### Paso 1: Crear Personal Access Token

1. Ir a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Configurar:
   - **Note**: `event-staffing-platform`
   - **Expiration**: 90 days
   - **Scopes**: Marcar `repo` y `workflow`
4. Click "Generate token"
5. **Copiar el token** (no podrás verlo de nuevo)

### Paso 2: Configurar Git para Guardar Credenciales

```bash
git config --global credential.helper osxkeychain
```

### Paso 3: Hacer Push

```bash
cd /Users/julian.kunzig/Documents/EventsControl

git push -u origin main
```

Cuando pida:
- **Username**: `julikunzig`
- **Password**: Pega el token que copiaste

Git guardará el token automáticamente.

### Paso 4: Crear Ramas Adicionales

```bash
# Rama develop
git checkout -b develop
git push -u origin develop

# Rama staging
git checkout -b staging
git push -u origin staging

# Volver a main
git checkout main
```

## ✅ ¡Listo!

Tu repositorio está en:
```
https://github.com/julikunzig/event-staffing-platform
```

## 🔄 Próximos Pushes

Después del primero, los siguientes son automáticos:

```bash
git add .
git commit -m "feat: descripción del cambio"
git push
```

## 🆘 Si Algo Sale Mal

### Error: "Invalid username or token"

```bash
# Limpiar credenciales guardadas
git config --global --unset credential.helper

# Volver a configurar
git config --global credential.helper osxkeychain

# Intentar de nuevo
git push -u origin main
```

### Error: "Repository not found"

Verificar que:
1. El repositorio existe en GitHub
2. El nombre es correcto: `event-staffing-platform`
3. El usuario es correcto: `julikunzig`

### Error: "Permission denied"

El token no tiene permisos suficientes:
1. Crear nuevo token con scopes: `repo` y `workflow`
2. Actualizar credenciales

## 📋 Checklist

- [ ] Token creado en GitHub
- [ ] Token copiado
- [ ] Git configurado: `git config --global credential.helper osxkeychain`
- [ ] Push inicial: `git push -u origin main`
- [ ] Ramas creadas: develop, staging
- [ ] Repositorio visible en GitHub

## 🎯 Resultado Final

```
✅ Repositorio en GitHub
✅ Código sincronizado
✅ Ramas configuradas
✅ Listo para deployment
```

---

**¡Ahora puedes desplegar en Render, Railway o Heroku!**

Ver: `DEPLOYMENT.md`
