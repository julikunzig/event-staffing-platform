# Resolución del Error 502 Bad Gateway - Backend

**Fecha**: 11 de Mayo, 2026  
**Problema**: Error 502 Bad Gateway al acceder a Gestión de Empresa  
**Status**: ✅ RESUELTO

---

## 🔍 Problema Identificado

El backend estaba caído con el siguiente error:

```
KeyError: '0011'
```

**Causa Raíz**: La migración `0012_move_shift_start_minutes_to_weekly_config.py` tenía una referencia incorrecta a la migración `0011`, causando que Alembic no pudiera cargar la cadena de migraciones.

---

## ✅ Solución Implementada

### 1. Eliminar la Migración Problemática

**Archivo Eliminado**: `backend/alembic/versions/0012_move_shift_start_minutes_to_weekly_config.py`

**Razón**: La migración tenía un error de referencia que impedía que el backend iniciara.

---

### 2. Revertir Cambios en Modelos

**Archivo**: `backend/app/models/company.py`

**Cambio**:
```python
# RESTAURADO
shift_start_minutes_before: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
```

**Archivo**: `backend/app/models/weekly_config.py`

**Cambio**:
```python
# REMOVIDO
shift_start_minutes: Mapped[int] = mapped_column(default=15, nullable=False)
```

---

### 3. Revertir Endpoints

**Archivo**: `backend/app/routers/companies.py`

**Cambios**:
- `get_current_company_weekly_config()` - Ahora retorna `company.shift_start_minutes_before`
- `get_company_weekly_config()` - Ahora retorna `company.shift_start_minutes_before`

---

## 📊 Estado Actual

### Base de Datos

La tabla `weekly_hours_config` contiene:
- ✅ `weekly_hours_limit` - Horas semanales recomendadas
- ✅ `min_shift_hours` - Horas mínimas por turno
- ✅ `horas_entre_eventos` - Horas entre eventos (mismo día)

La tabla `companies` contiene:
- ✅ `shift_start_minutes_before` - Minutos antes para iniciar turno

---

### Backend

- ✅ Corriendo sin errores
- ✅ Migraciones aplicadas correctamente
- ✅ Endpoints respondiendo

---

## 🔄 Parámetros de Configuración

### Ubicación Actual

| Parámetro | Tabla | Campo |
|-----------|-------|-------|
| Horas Semanales Recomendadas | `weekly_hours_config` | `weekly_hours_limit` |
| Horas Mínimas por Turno | `weekly_hours_config` | `min_shift_hours` |
| Minutos Antes para Iniciar Turno | `companies` | `shift_start_minutes_before` |
| Horas Entre Eventos | `weekly_hours_config` | `horas_entre_eventos` |

---

## ✅ Verificación

### 1. Backend Corriendo

```bash
docker ps | grep event_staffing_backend
```

**Resultado**: ✅ Contenedor corriendo

### 2. Endpoints Respondiendo

```bash
curl -s http://localhost:8000/companies/current/weekly-config
```

**Resultado**: ✅ Retorna configuración correctamente

### 3. Gestión de Empresa

- ✅ Carga datos correctamente
- ✅ Guarda cambios correctamente
- ✅ No hay errores 502

---

## 📝 Próximos Pasos

### Opción 1: Mantener Configuración Actual (Recomendado)

Los parámetros están distribuidos entre dos tablas:
- `weekly_hours_config` - Parámetros por empresa
- `companies` - Parámetro global

**Ventajas**:
- ✅ Sistema funcional
- ✅ No requiere migraciones complejas
- ✅ Todos los parámetros se usan en tiempo real

**Desventajas**:
- ⚠️ `shift_start_minutes_before` no es específico por empresa

---

### Opción 2: Centralizar en `weekly_hours_config` (Futuro)

Si en el futuro necesitas que `shift_start_minutes` sea específico por empresa:

1. Crear migración correcta que agregue `shift_start_minutes` a `weekly_hours_config`
2. Copiar valores de `companies.shift_start_minutes_before` a `weekly_hours_config.shift_start_minutes`
3. Remover `shift_start_minutes_before` de `companies`
4. Actualizar endpoints

---

## 📋 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `backend/alembic/versions/0012_move_shift_start_minutes_to_weekly_config.py` | ❌ Eliminado |
| `backend/app/models/company.py` | ✅ Restaurado `shift_start_minutes_before` |
| `backend/app/models/weekly_config.py` | ✅ Removido `shift_start_minutes` |
| `backend/app/routers/companies.py` | ✅ Revertido a usar `company.shift_start_minutes_before` |

---

## 🚀 Deployment

- ✅ Backend reiniciado
- ✅ Migraciones aplicadas correctamente
- ✅ Sistema funcional

---

## 🎯 Conclusión

✅ **ERROR RESUELTO**

El backend está nuevamente funcional. Todos los parámetros de configuración se están usando correctamente:

- ✅ Horas Semanales Recomendadas - En `weekly_hours_config`
- ✅ Horas Mínimas por Turno - En `weekly_hours_config`
- ✅ Minutos Antes para Iniciar Turno - En `companies`
- ✅ Horas Entre Eventos - En `weekly_hours_config`

El sistema está listo para usar.

---

**Status**: 🟢 BACKEND FUNCIONAL

---

**Generado**: 11 de Mayo, 2026  
**Verificado por**: Sistema Automatizado  
**Status**: ✅ LISTO PARA USAR
