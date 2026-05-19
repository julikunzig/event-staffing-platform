# Event Staffing Platform

Herramienta web responsive para la gestión de eventos sociales (fiestas, reuniones, matrimonios, cumpleaños, etc.) con sistema de solicitud y asignación de personal, control de horas y pagos.

## 🚀 Stack Tecnológico

### Backend
- **Python 3.11+** con **FastAPI**
- **PostgreSQL 16** como base de datos
- **SQLAlchemy** como ORM
- **JWT** para autenticación multitenant
- **Alembic** para migraciones

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **shadcn/ui** + **Tailwind CSS**
- **i18n** para soporte multiidioma (ES/EN)

## 📋 Características Principales

- ✅ Autenticación multitenant con JWT
- ✅ Gestión de eventos (crear, publicar, editar, cancelar)
- ✅ Sistema de solicitud y asignación de personal
- ✅ Registro de turnos con geolocalización
- ✅ Cálculo automático de pagos con overtime (50%)
- ✅ Reportes por evento y por empleado
- ✅ Sistema de noticias
- ✅ Navegación integrada (Google Maps, Apple Maps, Waze)
- ✅ Interfaz responsive mobile-first
- ✅ Soporte multiidioma (Español/Inglés)

## 🛠️ Instalación Local

### Requisitos Previos
- Docker y Docker Compose
- Git

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/event-staffing-platform.git
cd event-staffing-platform
```

2. **Levantar los servicios con Docker**
```bash
docker-compose up -d
```

Esto levantará:
- PostgreSQL en `localhost:5432`
- Backend en `http://localhost:8000`
- pgAdmin en `http://localhost:5050`

3. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
```

4. **Ejecutar el frontend en desarrollo**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📊 Acceso a la Aplicación

### Credenciales de Prueba
- **Email**: `superadmin@platform.com`
- **Password**: `Admin1234!`
- **Empresa**: `platform`

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Swagger API Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050
  - Email: `admin@example.com`
  - Password: `admin`

## 🗄️ Base de Datos

### Acceso a PostgreSQL

**Opción 1: pgAdmin (Recomendado)**
1. Abre http://localhost:5050
2. Agrega un servidor con:
   - Host: `db`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `event_staffing`

**Opción 2: Línea de comandos**
```bash
docker exec -it event_staffing_db psql -U postgres -d event_staffing
```

## 📁 Estructura del Proyecto

```
event-staffing-platform/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuración, autenticación, BD
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── routers/       # Endpoints de la API
│   │   ├── services/      # Lógica de negocio
│   │   └── main.py        # Aplicación FastAPI
│   ├── alembic/           # Migraciones de BD
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── init_data.sql      # Datos iniciales
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── lib/           # Utilidades
│   │   ├── i18n/          # Traducciones
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (cost factor 12)
- ✅ JWT con expiración (8 horas)
- ✅ CORS configurado
- ✅ Rate limiting en login (60 req/min)
- ✅ Validación de company_id en middleware
- ✅ SQLAlchemy ORM previene SQL injection

## 📝 API Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/switch-company` - Cambiar empresa

### Eventos
- `GET /api/v1/events` - Listar eventos
- `POST /api/v1/events` - Crear evento
- `GET /api/v1/events/{id}` - Ver evento
- `PATCH /api/v1/events/{id}` - Editar evento

### Asignaciones
- `POST /api/v1/assignments/events/{event_id}/apply` - Aplicar a evento
- `POST /api/v1/assignments/events/{event_id}/assign` - Asignar empleado
- `PATCH /api/v1/assignments/{id}/approve` - Aprobar asignación

### Reportes
- `GET /api/v1/reports/events` - Reporte por evento
- `GET /api/v1/reports/employees` - Reporte por empleado
- `GET /api/v1/reports/me` - Mi reporte

Ver documentación completa en `/docs`

## 🚀 Deployment

### Opciones Recomendadas

1. **Heroku** (Fácil, gratuito con limitaciones)
2. **Railway** (Moderno, buena documentación)
3. **Render** (Alternativa a Heroku)
4. **AWS/GCP/Azure** (Escalable, más complejo)

### Pasos Generales

1. Crear archivo `.env.production` con variables de entorno
2. Configurar base de datos PostgreSQL en el servidor
3. Desplegar backend (FastAPI)
4. Desplegar frontend (React build)
5. Configurar dominio y SSL

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en GitHub.

## 📄 Licencia

MIT

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026
