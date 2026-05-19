# Prueba Rápida desde Celular

## En 3 Pasos

### 1️⃣ Abre el navegador en tu celular
```
http://10.0.0.13:5174
```

### 2️⃣ Inicia sesión
- **Email**: `superadmin@platform.com`
- **Password**: `Admin1234!`
- **Empresa**: `platform`

### 3️⃣ Abre la consola (F12) y ejecuta:
```javascript
debugInfo()
testApiConnection()
```

---

## ✅ Qué Debería Ver

### Si todo funciona:
```
=== DEBUG INFO ===
Hostname: 10.0.0.13
Is Local Network (10.0.0.13): true
==================

Testing API connection to: http://10.0.0.13:8000/api/v1
API Response Status: 200
API Response: {token: "...", user: {...}}
```

### Si hay error:
- Comparte el error que ves en la consola
- Verifica que puedas acceder a `http://10.0.0.13:8000/docs` desde el celular
- Verifica que el backend esté corriendo: `docker ps`

---

## 🔍 Verificación Rápida

Desde tu computadora:
```bash
# Backend corriendo?
curl http://localhost:8000/docs

# Frontend corriendo?
curl http://localhost:5174/

# Celular puede acceder a backend?
curl http://10.0.0.13:8000/docs

# Celular puede acceder a frontend?
curl http://10.0.0.13:5174/
```

---

## 🆘 Si No Funciona

1. **Verifica conectividad de red**:
   - ¿Celular y computadora están en la misma red WiFi?
   - ¿Puedes hacer ping a 10.0.0.13 desde el celular?

2. **Verifica que los servicios estén corriendo**:
   ```bash
   docker ps
   ```
   Deberías ver:
   - `event_staffing_backend` (corriendo)
   - `event_staffing_db` (corriendo)

3. **Reinicia el backend**:
   ```bash
   docker restart event_staffing_backend
   ```

4. **Recarga la página en el celular**:
   - Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac)
   - O limpia el caché del navegador

5. **Consulta la guía completa**:
   - Lee `DEBUGGING_CELULAR.md` para troubleshooting detallado

---

## 📱 Qué Probar

Una vez que inicies sesión desde el celular:

- [ ] Ver eventos
- [ ] Cambiar idioma (esquina superior derecha)
- [ ] Ver que las fechas cambian de formato
- [ ] Ir a "Mi Perfil" y ver eventos activos
- [ ] Ir a "Usuarios" (si eres admin)
- [ ] Ir a "Roles" (si eres admin)

---

## 💡 Tips

- Abre la consola del navegador (F12) para ver logs
- Los logs empiezan con `[API]` para fácil identificación
- Si ves `localhost` en los logs, el frontend está usando la IP incorrecta
- Si ves `10.0.0.13` en los logs, todo está correcto

---

## 📞 Reportar Problemas

Si algo no funciona, comparte:

1. Salida de `debugInfo()`
2. Salida de `testApiConnection()`
3. Errores en la consola (pestaña Console)
4. Errores en Network (pestaña Network)
5. Resultado de: `docker logs event_staffing_backend | tail -50`
