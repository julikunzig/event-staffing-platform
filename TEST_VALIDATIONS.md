# Test Plan - Validaciones Implementadas (Sesión 11)

## Objetivo
Verificar que todas las validaciones de configuración están funcionando correctamente en el sistema.

---

## SETUP INICIAL

### Credenciales
- **Email**: superadmin@platform.com
- **Password**: Admin1234!
- **Empresa**: platform

### URLs
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Swagger**: http://localhost:8000/docs

---

## TEST 1: Validación de Horas Entre Eventos (Aplicación)

### Objetivo
Verificar que un empleado NO puede aplicar a dos eventos el mismo día si la diferencia de tiempo es menor al parámetro `horas_entre_eventos`.

### Precondiciones
1. Configurar `horas_entre_eventos = 2` en Parámetros de Configuración
2. Crear dos eventos el mismo día:
   - Evento A: 14:00
   - Evento B: 15:00 (diferencia: 1 hora)
3. Empleado tiene rol "Bartender" en ambos eventos
4. Empleado está aprobado para Evento A

### Pasos
1. Ir a "Mis Turnos" → "Eventos Disponibles"
2. Buscar Evento B
3. Hacer clic en "Aplicar a Evento"
4. Seleccionar rol "Bartender"
5. Hacer clic en "Aplicar"

### Resultado Esperado
❌ Error 400: "No puedes aplicar a este evento. Tienes otro evento el mismo día con menos de 2 horas de diferencia. Diferencia actual: 1.0 horas."

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 2: Validación de Horas Entre Eventos (Invitación)

### Objetivo
Verificar que un admin NO puede invitar a un empleado a dos eventos el mismo día si la diferencia de tiempo es menor al parámetro `horas_entre_eventos`.

### Precondiciones
1. Configurar `horas_entre_eventos = 2` en Parámetros de Configuración
2. Crear dos eventos el mismo día:
   - Evento A: 14:00 (empleado aprobado)
   - Evento B: 15:00 (publicado, sin empleados)
3. Empleado tiene rol "Bartender" en ambos eventos

### Pasos
1. Ir a "Gestión de Eventos" → Evento B
2. Hacer clic en "Agregar Personal"
3. Seleccionar empleado
4. Seleccionar rol "Bartender"
5. Hacer clic en "Invitar"

### Resultado Esperado
❌ Error 400: "No puedes invitar a este empleado. Tiene otro evento el mismo día con menos de 2 horas de diferencia. Diferencia actual: 1.0 horas."

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 3: Validación de Horas Mínimas por Turno

### Objetivo
Verificar que si un empleado trabaja menos horas que el mínimo configurado, se cobra el mínimo.

### Precondiciones
1. Configurar `min_shift_hours = 2.0` en Parámetros de Configuración
2. Crear evento con valor por hora: $20.00
3. Empleado aprobado para el evento

### Pasos
1. Ir a "Mis Turnos"
2. Hacer clic en "Iniciar Turno" (cuando esté disponible)
3. Esperar 30 minutos
4. Hacer clic en "Finalizar Turno"
5. Verificar el resumen

### Resultado Esperado
✅ Horas trabajadas: 2.0 (mínimo)
✅ Valor por hora: $20.00/h
✅ Pago total: $40.00

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 4: Botón Clock-in Activación

### Objetivo
Verificar que el botón "Iniciar Turno" se activa solo `X` minutos antes del evento.

### Precondiciones
1. Configurar `shift_start_minutes = 15` en Parámetros de Configuración
2. Crear evento para dentro de 20 minutos
3. Empleado aprobado para el evento

### Pasos
1. Ir a "Mis Turnos"
2. Verificar que botón "Iniciar Turno" está deshabilitado
3. Esperar 5 minutos (ahora faltan 15 minutos)
4. Actualizar página
5. Verificar que botón está habilitado

### Resultado Esperado
✅ Botón deshabilitado cuando faltan > 15 minutos
✅ Botón habilitado cuando faltan ≤ 15 minutos
✅ Mensaje: "⏰ Disponible en X minutos (a las HH:MM)"

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 5: Mostrar Valor por Hora al Finalizar Turno

### Objetivo
Verificar que se muestra el valor por hora en el resumen del turno completado.

### Precondiciones
1. Empleado tiene turno completado
2. Valor por hora del rol: $25.00

### Pasos
1. Ir a "Mis Turnos"
2. Buscar turno completado
3. Verificar el resumen

### Resultado Esperado
✅ Se muestra: "Valor por hora: $25.00/h"
✅ Se muestra junto con horas trabajadas y pago total

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 6: Límite Semanal de Horas (Overtime)

### Objetivo
Verificar que se calcula correctamente el overtime (1.5x) cuando se supera el límite semanal.

### Precondiciones
1. Configurar `weekly_hours_limit = 40` en Parámetros de Configuración
2. Empleado ya trabajó 38 horas esta semana
3. Nuevo evento: 4 horas
4. Valor por hora: $20.00

### Pasos
1. Empleado inicia turno
2. Trabaja 4 horas
3. Finaliza turno
4. Verifica el resumen

### Resultado Esperado
✅ Horas regulares: 2 horas (hasta completar 40)
✅ Horas overtime: 2 horas (a 1.5x = $60.00)
✅ Pago regular: 2 × $20.00 = $40.00
✅ Pago overtime: 2 × $20.00 × 1.5 = $60.00
✅ Pago total: $100.00

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 7: Error 403 en Weekly-config (Corregido)

### Objetivo
Verificar que empleados pueden acceder al endpoint de configuración semanal.

### Pasos
1. Empleado inicia sesión
2. Abre "Mis Turnos"
3. Sistema carga configuración

### Resultado Esperado
✅ No hay error 403
✅ Se cargan los parámetros correctamente
✅ Se muestra el mensaje de clock-in disponible

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 8: Combo de Roles en UsersPage (Corregido)

### Objetivo
Verificar que el combo de roles muestra los nombres correctamente al crear un empleado.

### Pasos
1. Admin va a "Gestión de Usuarios"
2. Hace clic en "Crear Nuevo Usuario"
3. Verifica el combo de roles

### Resultado Esperado
✅ Combo muestra:
  - Admin
  - Coordinador
  - Empleado
✅ No muestra "select rol" en las opciones

### Resultado Actual
[Completar después de ejecutar test]

---

## TEST 9: Error 500 al Finalizar Turno (Corregido)

### Objetivo
Verificar que no hay error 500 al finalizar turno.

### Pasos
1. Empleado inicia turno
2. Espera un tiempo
3. Finaliza turno

### Resultado Esperado
✅ Turno finalizado correctamente
✅ Se muestra resumen con horas y pago
✅ No hay error 500

### Resultado Actual
[Completar después de ejecutar test]

---

## RESUMEN DE RESULTADOS

| Test | Descripción | Resultado | Notas |
|------|-------------|-----------|-------|
| 1 | Validación horas entre eventos (aplicación) | ⏳ | |
| 2 | Validación horas entre eventos (invitación) | ⏳ | |
| 3 | Validación horas mínimas por turno | ⏳ | |
| 4 | Botón clock-in activación | ⏳ | |
| 5 | Mostrar valor por hora | ⏳ | |
| 6 | Límite semanal (overtime) | ⏳ | |
| 7 | Error 403 en weekly-config | ⏳ | |
| 8 | Combo de roles | ⏳ | |
| 9 | Error 500 al finalizar turno | ⏳ | |

---

## NOTAS IMPORTANTES

1. **Configuración**: Todos los parámetros se configuran en "Mi Empresa" → "Parámetros de Configuración"
2. **Roles**: Los empleados deben tener asignados los roles en "Gestión de Roles" antes de poder aplicar a eventos
3. **Geolocalización**: El sistema requiere estar dentro de 500m del evento para iniciar/finalizar turno
4. **Timezone**: El sistema usa UTC internamente, pero muestra horas locales en la UI

---

## COMANDOS ÚTILES

### Ver logs del backend
```bash
docker logs event_staffing_backend -f
```

### Ver logs de la BD
```bash
docker logs event_staffing_db -f
```

### Acceder a pgAdmin
```
URL: http://localhost:5050
Email: admin@example.com
Password: admin
```

### Ejecutar query en BD
```bash
docker exec -it event_staffing_db psql -U postgres -d event_staffing -c "SELECT * FROM weekly_hours_config;"
```

---

## CONCLUSIÓN

Este plan de test verifica que todas las validaciones implementadas en la Sesión 11 están funcionando correctamente. Completar todos los tests asegura que el sistema está listo para producción.

