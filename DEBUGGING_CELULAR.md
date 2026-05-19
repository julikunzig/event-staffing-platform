# Guía de Debugging para Acceso desde Celular

## Paso 1: Verificar Conectividad Básica

### Desde tu computadora:
```bash
# Verifica que el backend está corriendo
curl http://localhost:8000/docs

# Verifica que el frontend está corriendo
curl http://localhost:5174/
```

### Desde tu celular:
1. Abre el navegador
2. Ve a `http://10.0.0.13:8000/docs` - Deberías ver Swagger UI
3. Ve a `http://10.0.0.13:5174/` - Deberías ver la página de login

Si alguno de estos no funciona, el problema es de conectividad de red, no de la aplicación.

## Paso 2: Abrir la Consola del Navegador

### En Chrome/Edge (Android):
1. Abre el navegador
2. Ve a `chrome://inspect` en la barra de direcciones
3. Conecta tu celular por USB
4. Habilita "USB Debugging" en el celular
5. Verás tu dispositivo en la lista
6. Haz clic en "inspect" para abrir DevTools

### En Safari (iOS):
1. En tu Mac: Safari → Preferences → Advanced → "Show Develop menu"
2. En tu iPhone: Settings → Safari → Advanced → "Web Inspector" (ON)
3. Conecta el iPhone por USB
4. En Mac: Develop → [Tu iPhone] → [Tu página]

### Alternativa Simple (Todos los navegadores):
1. Abre la consola presionando `F12` o `Ctrl+Shift+I`
2. Ve a la pestaña "Console"

## Paso 3: Ejecutar Comandos de Debug

Una vez en la consola, ejecuta estos comandos:

### 1. Ver información de debug:
```javascript
debugInfo()
```

Deberías ver algo como:
```
=== DEBUG INFO ===
Hostname: 10.0.0.13
Port: 5174
Protocol: http:
Full URL: http://10.0.0.13:5174/
Is Localhost: false
Is Local Network (10.0.0.13): true
==================
```

### 2. Probar conexión a la API:
```javascript
testApiConnection()
```

Deberías ver algo como:
```
Testing API connection to: http://10.0.0.13:8000/api/v1
API Response Status: 200
API Response: {token: "eyJ0eXAiOiJKV1QiLCJhbGc...", user: {...}}
```

## Paso 4: Interpretar Resultados

### ✅ Si `debugInfo()` muestra `Is Local Network: true`:
- El frontend detectó correctamente que estás en la red local
- La API debería usar `http://10.0.0.13:8000/api/v1`

### ❌ Si `debugInfo()` muestra `Is Local Network: false`:
- El frontend cree que estás en localhost
- Verifica que estés accediendo desde `http://10.0.0.13:5174` (no `localhost`)

### ✅ Si `testApiConnection()` retorna `success: true`:
- La conexión a la API funciona correctamente
- El problema podría estar en el login o en otra parte

### ❌ Si `testApiConnection()` retorna un error:
- Hay un problema de conectividad con el backend
- Verifica que `http://10.0.0.13:8000` sea accesible desde el celular

## Paso 5: Verificar Logs de Red

En la consola del navegador, ve a la pestaña "Network":

1. Recarga la página
2. Intenta iniciar sesión
3. Busca las peticiones a `/api/v1/auth/login`
4. Haz clic en la petición
5. Ve a la pestaña "Response" para ver la respuesta del servidor

### Errores Comunes:

**CORS Error:**
```
Access to XMLHttpRequest at 'http://10.0.0.13:8000/api/v1/...' 
from origin 'http://10.0.0.13:5174' has been blocked by CORS policy
```
→ El backend no tiene configurado CORS para este puerto/IP

**Connection Refused:**
```
Failed to fetch: TypeError: Failed to fetch
```
→ El backend no está corriendo o no es accesible desde el celular

**404 Not Found:**
```
GET http://10.0.0.13:8000/api/v1/auth/login 404
```
→ La ruta no existe en el backend

## Paso 6: Verificar Logs del Backend

En tu computadora, ve a Docker:

```bash
# Ver logs del backend
docker logs event_staffing_backend -f

# Buscar errores CORS
docker logs event_staffing_backend | grep -i cors
```

## Paso 7: Reiniciar Servicios

Si nada funciona, intenta reiniciar:

```bash
# Reiniciar backend
docker restart event_staffing_backend

# Reiniciar frontend (si está en Docker)
# O simplemente recarga la página en el navegador
```

## Checklist de Verificación

- [ ] Backend corriendo: `curl http://localhost:8000/docs`
- [ ] Frontend corriendo: `curl http://localhost:5174/`
- [ ] Celular puede acceder a backend: `http://10.0.0.13:8000/docs`
- [ ] Celular puede acceder a frontend: `http://10.0.0.13:5174/`
- [ ] `debugInfo()` muestra `Is Local Network: true`
- [ ] `testApiConnection()` retorna `success: true`
- [ ] Puedes iniciar sesión desde el celular
- [ ] Puedes ver eventos desde el celular
- [ ] El idioma cambia correctamente
- [ ] Las fechas se muestran en formato correcto

## Información para Reportar Errores

Si aún tienes problemas, comparte:

1. Salida de `debugInfo()`
2. Salida de `testApiConnection()`
3. Errores en la consola (pestaña Console)
4. Errores en la pestaña Network (status code y response)
5. Logs del backend: `docker logs event_staffing_backend`
6. Tu IP local (ejecuta `ipconfig` en Windows o `ifconfig` en Mac/Linux)
