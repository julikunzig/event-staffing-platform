# Configuración de Autenticación GitHub

GitHub ya no permite autenticación con contraseña. Necesitas usar un **Personal Access Token (PAT)**.

## 🔑 Crear Personal Access Token

### Pasos

1. **Ir a GitHub Settings**
   - https://github.com/settings/tokens

2. **Crear nuevo token**
   - Click en "Generate new token"
   - Seleccionar "Generate new token (classic)"

3. **Configurar token**
   - **Note**: `event-staffing-platform`
   - **Expiration**: 90 days (o más)
   - **Scopes**: Seleccionar:
     - ✅ `repo` (acceso completo a repositorios)
     - ✅ `workflow` (para GitHub Actions)

4. **Copiar token**
   - Copiar el token generado (no podrás verlo de nuevo)
   - Guardarlo en un lugar seguro

## 🔐 Usar Token en Git

### Opción 1: Usar Token en URL (Una sola vez)

```bash
git push -u origin main
# Cuando pida username: julikunzig
# Cuando pida password: pega el token
```

### Opción 2: Guardar Token en Keychain (Recomendado)

```bash
# Configurar git para usar osxkeychain (macOS)
git config --global credential.helper osxkeychain

# Hacer push
git push -u origin main

# Cuando pida username: julikunzig
# Cuando pida password: pega el token

# Git guardará el token automáticamente
```

### Opción 3: Usar SSH (Más seguro)

```bash
# 1. Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# 2. Agregar clave a ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# 4. Agregar a GitHub
# Settings → SSH and GPG keys → New SSH key
# Pegar la clave pública

# 5. Cambiar URL del repositorio a SSH
git remote set-url origin git@github.com:julikunzig/event-staffing-platform.git

# 6. Hacer push
git push -u origin main
```

## 📋 Pasos Rápidos

### Con Token (Más fácil)

```bash
# 1. Crear token en https://github.com/settings/tokens
# 2. Copiar token

# 3. Configurar git para guardar credenciales
git config --global credential.helper osxkeychain

# 4. Hacer push
git push -u origin main

# 5. Cuando pida:
#    Username: julikunzig
#    Password: <pega el token>

# 6. ¡Listo! Git guardará el token
```

### Con SSH (Más seguro)

```bash
# 1. Generar clave
ssh-keygen -t ed25519 -C "tu-email@example.com"

# 2. Agregar a ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# 4. Agregar a GitHub
# https://github.com/settings/ssh/new
# Pegar la clave

# 5. Cambiar URL a SSH
git remote set-url origin git@github.com:julikunzig/event-staffing-platform.git

# 6. Hacer push
git push -u origin main
```

## ✅ Verificar Configuración

```bash
# Ver URL actual
git remote -v

# Debe mostrar:
# origin  https://github.com/julikunzig/event-staffing-platform.git (fetch)
# origin  https://github.com/julikunzig/event-staffing-platform.git (push)

# O con SSH:
# origin  git@github.com:julikunzig/event-staffing-platform.git (fetch)
# origin  git@github.com:julikunzig/event-staffing-platform.git (push)
```

## 🔄 Después del Primer Push

Una vez que hayas hecho el primer push, los siguientes serán automáticos:

```bash
# Hacer cambios
git add .
git commit -m "feat: nueva característica"

# Push (sin pedir credenciales)
git push
```

## 🚨 Si Olvidaste el Token

1. Ir a https://github.com/settings/tokens
2. Eliminar el token antiguo
3. Crear uno nuevo
4. Actualizar en git:
   ```bash
   git config --global --unset credential.helper
   git config --global credential.helper osxkeychain
   git push
   ```

## 📝 Notas

- **Token clásico**: Acceso a todo (menos seguro)
- **Token fino**: Acceso granular (más seguro, pero más complejo)
- **SSH**: Más seguro que tokens, recomendado para producción
- **Keychain**: Guarda credenciales de forma segura en macOS

---

**Próximo paso:** Crear token y hacer push inicial.
