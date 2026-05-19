# 🚀 Event Staffing Platform - Guía de Setup

## ✅ Estado Actual
- **Backend**: Corriendo en http://localhost:8000
- **Base de Datos**: PostgreSQL 16.13 en puerto 5432
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin)

## 📱 Acceso desde Celular
- Frontend: http://10.0.0.13:5173
- Backend: http://10.0.0.13:8000

## 🔧 Comandos Útiles

### Levantar Docker
```bash
docker-compose up
```

### Detener Docker
```bash
docker-compose down
```

### Ver logs del backend
```bash
docker-compose logs -f backend
```

### Ver logs de la BD
```bash
docker-compose logs -f db
```

### Acceder a la BD por terminal
```bash
docker exec -it event_staffing_db psql -U postgres -d event_staffing
```

### Levantar frontend (en otra terminal)
```bash
cd frontend
npm run dev
```

## 🔐 Credenciales de Prueba

**Super Admin:**
- Email: `superadmin@platform.com`
- Password: `Admin1234!`
- Empresa: `platform`

## 📊 Ver Base de Datos

### Opción 1: pgAdmin (Recomendado)
1. Abre http://localhost:5050
2. Login: admin@example.com / admin
3. Agregar servidor:
   - Host: `db`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `event_staffing`

### Opción 2: Terminal
```bash
docker exec -it event_staffing_db psql -U postgres -d event_staffing
```

Comandos útiles en psql:
```sql
\dt                    -- Ver todas las tablas
\d companies           -- Ver estructura de tabla
SELECT * FROM users;   -- Ver datos
\q                     -- Salir
```

## 🎯 Funcionalidades Principales

### 1. Sistema de Noticias
- Admin: Crear, editar, activar/desactivar, eliminar noticias
- Empleados: Ver noticias activas
- Acceso: `/news`

### 2. Navegación y Mapas
- Presionar dirección en evento → abre Google Maps/Waze/Apple Maps
- Ver mapa interactivo del evento
- Funciona en móvil

### 3. Gestión de Eventos
- Crear, editar, publicar eventos
- Asignar personal
- Registrar turnos con geolocalización
- Calcular pagos con overtime

### 4. Reportes
- Por evento: personal, horas, pagos
- Por empleado: historial de eventos

## 📝 Notas Importantes

- La aplicación es **responsive** y funciona bien en móvil
- El backend tiene **rate limiting** en login (60 req/min)
- Las contraseñas se guardan con **bcrypt** (cost factor 12)
- JWT expira en **8 horas**
- Tokens de reset de contraseña expiran en **2 horas**

## 🐛 Troubleshooting

### Backend no responde
```bash
docker-compose logs -f backend
```

### BD no inicia
```bash
docker-compose logs -f db
docker-compose down -v  # Elimina volúmenes
docker-compose up       # Levanta de nuevo
```

### Puerto 5432 en uso
```bash
lsof -i :5432
kill -9 <PID>
```

### Puerto 8000 en uso
```bash
lsof -i :8000
kill -9 <PID>
```

## 📚 Documentación

- **Swagger API**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Bitácora del Proyecto**: `.kiro/steering/bitacora.md`
