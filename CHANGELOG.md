# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-14

### ✨ Agregado

#### Backend
- ✅ Autenticación JWT multitenant
- ✅ Gestión de empresas (Super Admin)
- ✅ Gestión de usuarios y membresías
- ✅ Roles laborales con tarifa por hora
- ✅ Gestión de eventos (CRUD, publicar, cancelar)
- ✅ Sistema de asignaciones (aplicar, aprobar, invitar, asignar directo)
- ✅ Registro de turnos con geolocalización (Haversine, radio 500m)
- ✅ Cálculo automático de pagos con overtime (50%)
- ✅ Validación de horas entre eventos
- ✅ Reportes por evento y por empleado
- ✅ Exportación a CSV
- ✅ Sistema de noticias
- ✅ Configuración semanal por empresa
- ✅ Rate limiting en login
- ✅ Migraciones de BD con Alembic

#### Frontend
- ✅ Interfaz responsive mobile-first
- ✅ Autenticación con JWT
- ✅ Selector de empresa en login
- ✅ Dashboard con resumen de eventos
- ✅ Gestión de eventos (crear, editar, ver detalles)
- ✅ Aplicación a eventos
- ✅ Registro de turnos (clock-in/clock-out)
- ✅ Perfil de empleado con historial
- ✅ Reportes con filtros
- ✅ Sistema de noticias
- ✅ Navegación integrada (Google Maps, Apple Maps, Waze)
- ✅ Soporte multiidioma (ES/EN)
- ✅ Componentes UI con shadcn/ui
- ✅ Diseño responsive con Tailwind CSS
- ✅ Bottom navigation en móvil
- ✅ Sidebar colapsable

#### DevOps
- ✅ Docker Compose con PostgreSQL, Backend, pgAdmin
- ✅ Dockerfile para backend
- ✅ Migraciones automáticas en startup
- ✅ Volúmenes persistentes para BD
- ✅ Health checks

### 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (cost factor 12)
- ✅ JWT con expiración (8 horas)
- ✅ CORS configurado
- ✅ Rate limiting en login
- ✅ Validación de company_id en middleware
- ✅ SQLAlchemy ORM previene SQL injection
- ✅ Tokens de reset con expiración (2 horas)

### 📚 Documentación

- ✅ README.md con instrucciones de setup
- ✅ DEPLOYMENT.md con opciones de deployment
- ✅ CONTRIBUTING.md con guía de contribución
- ✅ GITHUB_SETUP.md con configuración de GitHub
- ✅ CHANGELOG.md (este archivo)
- ✅ Swagger API documentation

### 🐛 Conocidos

- Ninguno en esta versión

### 🚀 Próximas Características

- [ ] Exportación a Excel
- [ ] Exportación a PDF
- [ ] Notificaciones por email (Resend)
- [ ] Notificaciones por SMS (Twilio)
- [ ] Perfiles y calificaciones de empleados
- [ ] Sistema de pagos integrado
- [ ] Análisis y reportes avanzados
- [ ] Integración con Google Calendar
- [ ] App móvil nativa (React Native)

---

## Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles
- **MINOR**: Nuevas características compatibles
- **PATCH**: Correcciones de bugs

---

**Última actualización**: 14 de Mayo, 2026
