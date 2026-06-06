# Quick Start - Sistema de Emails

**Fecha**: 20 de Mayo, 2026  
**Tiempo estimado**: 5 minutos

---

## 1️⃣ Configurar RESEND_API_KEY (1 minuto)

```bash
# Abre el archivo .env
nano backend/.env

# Agrega esta línea
RESEND_API_KEY=your_resend_api_key_here

# Guarda (Ctrl+O, Enter, Ctrl+X)
```

---

## 2️⃣ Reiniciar Backend (2 minutos)

```bash
# Detener backend actual
docker-compose down

# Reiniciar con cambios
docker-compose up -d

# Verificar que está corriendo
docker-compose logs -f backend
```

---

## 3️⃣ Verificar que Funciona (1 minuto)

```bash
# Verificar que API responde
curl http://localhost:8000/docs

# Deberías ver la documentación de Swagger
```

---

## 4️⃣ Ejecutar Tests (1 minuto cada uno)

### Test 1: Publicar Evento
1. Login como admin
2. Crear evento
3. Publicar evento
4. Verificar que empleados reciben email

### Test 2: Aplicación
1. Login como empleado
2. Aplicar a evento
3. Verificar que admin recibe email

### Test 3: Invitación
1. Login como admin
2. Invitar empleado
3. Verificar que empleado recibe email

### Test 4: Aceptar
1. Login como empleado
2. Aceptar invitación
3. Verificar que admin recibe email

### Test 5: Rechazar
1. Login como empleado
2. Rechazar invitación
3. Verificar que admin recibe email

### Test 6: Aprobación
1. Login como admin
2. Aprobar aplicación
3. Verificar que empleado recibe email

### Test 7: Reset
1. Ir a login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email
4. Verificar que recibe email con link

---

## 📧 Qué Esperar

### Emails Bilingual
- Cada email contiene inglés y español
- Encabezado indica secciones de idioma

### Información Completa
- Nombre del evento
- Fecha y hora
- Ubicación
- Roles y tarifas
- Dress code

### Entrega Rápida
- Emails se envían en segundos
- No bloquean operaciones

---

## 🐛 Si Algo Falla

### Error: "RESEND_API_KEY not found"
```bash
# Verifica que está en .env
grep RESEND_API_KEY backend/.env

# Reinicia backend
docker-compose down
docker-compose up -d
```

### Error: "Email not sent"
```bash
# Verifica logs
docker-compose logs backend | grep -i email

# Verifica que RESEND_API_KEY es válida
# Verifica que email del destinatario es válido
```

### Emails no se envían
```bash
# Verifica que backend está corriendo
docker-compose ps

# Verifica logs
docker-compose logs -f backend

# Verifica que RESEND_API_KEY está configurada
grep RESEND_API_KEY backend/.env
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- `INSTRUCCIONES_RESTART_BACKEND.md` - Guía completa
- `EJEMPLOS_EMAILS.md` - Ejemplos de emails
- `INTEGRACION_EMAILS_COMPLETADA.md` - Detalle técnico

---

## ✅ Checklist

- [ ] RESEND_API_KEY configurada
- [ ] Backend reiniciado
- [ ] API responde en http://localhost:8000/docs
- [ ] Test 1: Publicar Evento ✓
- [ ] Test 2: Aplicación ✓
- [ ] Test 3: Invitación ✓
- [ ] Test 4: Aceptar ✓
- [ ] Test 5: Rechazar ✓
- [ ] Test 6: Aprobación ✓
- [ ] Test 7: Reset ✓

---

## 🎉 ¡Listo!

Si todos los tests pasaron, el sistema de emails está funcionando correctamente.

**Próximo paso**: Deploy a producción

