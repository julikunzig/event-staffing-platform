# Debugging - Validación de `horas_entre_eventos`

**Fecha**: 10 de Mayo, 2026

---

## 🔍 Cómo Verificar que la Validación Funciona

### Paso 1: Verificar que el Parámetro se Carga

1. Abre http://localhost:5173
2. Inicia sesión como admin
3. Ve a **Mi Empresa → Parámetros de Configuración**
4. Verifica que `horas_entre_eventos` está configurado (ej: 2 horas)
5. Abre la consola del navegador (F12)
6. Ve a **Mis Turnos**
7. Busca en los logs: "Periodic config check - shift_start_minutes"
8. Verifica que el valor se carga correctamente

### Paso 2: Crear Eventos de Prueba

1. Ve a **Gestión de Eventos**
2. Crea Evento A:
   - Fecha: 2026-05-15
   - Hora: 14:00
   - Rol: Bartender (1 cupo)
3. Publica el evento
4. Asigna directamente a un empleado
5. Aprueba la asignación

6. Crea Evento B:
   - Fecha: 2026-05-15 (MISMO DÍA)
   - Hora: 15:00 (1 hora después)
   - Rol: Bartender (1 cupo)
7. Publica el evento

### Paso 3: Probar la Validación

1. Cambia a cuenta de empleado
2. Ve a **Mis Turnos → Eventos Disponibles**
3. Busca Evento B
4. Intenta aplicar
5. **Esperado**: Error 400 con mensaje de conflicto

**Si NO aparece el error**:
- Abre la consola del navegador (F12)
- Busca errores en la red
- Verifica que el backend está respondiendo correctamente

### Paso 4: Ver Logs del Backend

```bash
docker logs event_staffing_backend -f
```

Busca logs de la validación. Si no hay logs, significa que la validación no se está ejecutando.

---

## 🐛 Posibles Problemas

### Problema 1: Parámetro No Se Carga

**Síntoma**: El parámetro `horas_entre_eventos` siempre es 0

**Solución**:
1. Verifica que el parámetro está guardado en la BD
2. Verifica que el endpoint `/companies/current/weekly-config` retorna el valor correcto

### Problema 2: Validación No Se Ejecuta

**Síntoma**: No hay error al aplicar a eventos con conflicto

**Solución**:
1. Verifica que `horas_entre_eventos > 0`
2. Verifica que los eventos están en el MISMO DÍA
3. Verifica que el empleado tiene una asignación en el primer evento

### Problema 3: Validación Falla Incorrectamente

**Síntoma**: Error incluso cuando no hay conflicto

**Solución**:
1. Verifica que la diferencia de horas es correcta
2. Verifica que los estados de asignación son correctos

---

## 📊 Checklist de Debugging

- [ ] Parámetro `horas_entre_eventos` está configurado
- [ ] Parámetro se carga en el frontend
- [ ] Evento A está creado y aprobado
- [ ] Evento B está creado
- [ ] Eventos están en el MISMO DÍA
- [ ] Diferencia de horas es menor que el parámetro
- [ ] Error aparece al intentar aplicar
- [ ] Mensaje de error es correcto

---

## 🔧 Cómo Verificar en la BD

```bash
# Conectar a la BD
docker exec -it event_staffing_db psql -U postgres -d event_staffing

# Ver configuración
SELECT * FROM weekly_hours_config WHERE company_id = 1;

# Ver asignaciones
SELECT * FROM event_assignments WHERE user_id = 2;

# Ver eventos
SELECT id, event_date, start_time FROM events WHERE company_id = 1;
```

---

## 📝 Próximos Pasos

1. Ejecutar los pasos de debugging
2. Identificar dónde está el problema
3. Reportar los resultados

