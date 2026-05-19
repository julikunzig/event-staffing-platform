# Guía de Deployment

## 🚀 Opción 1: Render (Recomendado - Gratuito)

### Pasos

1. **Crear cuenta en Render**
   - Ir a https://render.com
   - Registrarse con GitHub

2. **Conectar repositorio**
   - En Render, crear nuevo "Blueprint"
   - Conectar tu repositorio de GitHub
   - Seleccionar rama `main`

3. **Configurar variables de entorno**
   - `SECRET_KEY`: Generar una clave segura
   - `DATABASE_URL`: Se configura automáticamente
   - `CORS_ORIGINS`: Agregar dominio de Render

4. **Deploy**
   - Render desplegará automáticamente
   - Backend en: `https://event-staffing-backend.onrender.com`
   - Frontend en: `https://event-staffing-frontend.onrender.com`

### Limitaciones
- Plan gratuito: 0.5 GB RAM, 100 GB/mes ancho de banda
- Suficiente para pruebas y desarrollo

---

## 🚀 Opción 2: Railway

### Pasos

1. **Crear cuenta en Railway**
   - Ir a https://railway.app
   - Registrarse con GitHub

2. **Crear nuevo proyecto**
   - Conectar repositorio
   - Railway detectará automáticamente Docker Compose

3. **Configurar variables**
   - `SECRET_KEY`: Generar clave segura
   - `ENVIRONMENT`: `production`

4. **Deploy**
   - Railway desplegará automáticamente
   - URLs generadas automáticamente

### Ventajas
- Mejor rendimiento que Render
- $5 USD/mes de crédito gratuito
- Interfaz más intuitiva

---

## 🚀 Opción 3: Heroku (Descontinuado pero aún funciona)

### Pasos

1. **Instalar Heroku CLI**
```bash
brew tap heroku/brew && brew install heroku
```

2. **Login**
```bash
heroku login
```

3. **Crear aplicación**
```bash
heroku create event-staffing-platform
```

4. **Agregar PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. **Configurar variables**
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ENVIRONMENT=production
```

6. **Deploy**
```bash
git push heroku main
```

---

## 🚀 Opción 4: AWS (Escalable)

### Pasos

1. **Crear cuenta AWS**
   - Ir a https://aws.amazon.com
   - Crear cuenta gratuita

2. **Usar Elastic Beanstalk**
   - Crear aplicación
   - Seleccionar Docker como plataforma
   - Conectar repositorio

3. **Configurar RDS**
   - Crear instancia PostgreSQL
   - Configurar security groups

4. **Deploy**
   - Elastic Beanstalk desplegará automáticamente

### Ventajas
- Muy escalable
- Tier gratuito disponible
- Mejor para producción

---

## 📋 Checklist Pre-Deployment

- [ ] Cambiar `SECRET_KEY` a un valor seguro
- [ ] Configurar `CORS_ORIGINS` con dominio correcto
- [ ] Verificar `DATABASE_URL` en producción
- [ ] Ejecutar migraciones: `alembic upgrade head`
- [ ] Crear datos iniciales: `psql < init_data.sql`
- [ ] Probar endpoints en `/docs`
- [ ] Verificar variables de entorno
- [ ] Configurar SSL/HTTPS
- [ ] Configurar dominio personalizado

---

## 🔒 Variables de Entorno Importantes

```env
# Seguridad
SECRET_KEY=<generar-con-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=8

# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Entorno
ENVIRONMENT=production

# CORS
CORS_ORIGINS=["https://tu-dominio.com"]

# Notificaciones (Opcional)
RESEND_API_KEY=<tu-api-key>
TWILIO_ACCOUNT_SID=<tu-sid>
TWILIO_AUTH_TOKEN=<tu-token>
```

---

## 🧪 Testing en Producción

1. **Verificar backend**
```bash
curl https://tu-backend.com/docs
```

2. **Verificar login**
```bash
curl -X POST https://tu-backend.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@platform.com","password":"Admin1234!","company_id":1}'
```

3. **Verificar frontend**
   - Abrir https://tu-frontend.com
   - Intentar login

---

## 📞 Troubleshooting

### Error: "Connection refused"
- Verificar que PostgreSQL está corriendo
- Verificar `DATABASE_URL`

### Error: "CORS error"
- Verificar `CORS_ORIGINS` incluye tu dominio
- Incluir protocolo (http/https)

### Error: "Invalid token"
- Verificar `SECRET_KEY` es igual en todos los servicios
- Verificar token no expiró

### Error: "Database migration failed"
- Ejecutar: `alembic upgrade head`
- Verificar permisos de base de datos

---

## 🚀 Próximos Pasos

1. Elegir plataforma de deployment
2. Crear cuenta y conectar repositorio
3. Configurar variables de entorno
4. Deploy
5. Testing en producción
6. Configurar dominio personalizado

---

**Última actualización**: Mayo 2026
