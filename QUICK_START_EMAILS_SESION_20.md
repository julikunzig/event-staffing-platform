# ⚡ QUICK START - EMAILS SESIÓN 20

## 🎯 En 30 Segundos

### 1. Abre MailHog
```
http://localhost:8025
```

### 2. Realiza una Acción
- Publica un evento
- O aplica a un evento
- O invita empleados

### 3. ¡Listo!
Los emails aparecerán en MailHog

---

## 📧 Acciones que Envían Emails

### Publicar Evento (Recomendado)
```
Admin → Eventos → Crear → Publicar
↓
Emails a todos los empleados con roles
```

### Aplicar a Evento
```
Empleado → Eventos → Buscar → Aplicar
↓
Email al admin
```

### Invitar Empleados
```
Admin → Evento → Invitar → Seleccionar → Enviar
↓
Emails a empleados invitados
```

---

## 🔐 Credenciales

### Admin
```
admin@platform.com / Admin1234!
```

### Empleado
```
empleado1@gmail.com / Empleado1234!
```

---

## ✅ Verificación Rápida

```bash
# ¿Está MailHog corriendo?
docker-compose ps | grep mailhog

# ¿Está el backend corriendo?
docker-compose ps | grep backend

# ¿Hay errores?
docker-compose logs backend | grep -i "error"
```

---

## 📊 Estado

✅ Backend corriendo  
✅ MailHog activo  
✅ Emails funcionando  
✅ Bilinguales (EN + ES)  

---

## 🎉 ¡Listo para Usar!

Abre http://localhost:8025 y empieza a probar

---

**Status**: ✅ COMPLETADO
