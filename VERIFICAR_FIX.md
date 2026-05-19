# Verificación del Fix - Horas Entre Eventos

## 🧪 Cómo Verificar que el Fix Funciona

### Paso 1: Configurar el Parámetro

1. Abre http://localhost:5173
2. Inicia sesión con:
   - Email: `superadmin@platform.com`
   - Password: `Admin1234!`
   - Empresa: `platform`

3. Ve a **Mi Empresa → Parámetros de Configuración**
4. Configura `horas_entre_eventos` = **2** (horas)
5. Guarda los cambios

### Paso 2: Crear Dos Eventos el Mismo Día

1. Ve a **Gestión de Eventos**
2. Crea **Evento A**:
   - Nombre: "Evento A"
   - Fecha: 2026-05-15 (cualquier fecha futura)
   - Hora: 14:00
   - Rol: Bartender (1 cupo)
   - Publica el evento

3. Crea **Evento B**:
   - Nombre: "Evento B"
   - Fecha: 2026-05-15 (MISMO DÍA)
   - Hora: 15:00 (diferencia: 1 hora)
   - Rol: Bartender (1 cupo)
   - Publica el evento

### Paso 3: Asignar Rol al Empleado

1. Ve a **Gestión de Usuarios**
2. Busca un empleado (o crea uno)
3. Asigna el rol "Bartender" en la empresa

### Paso 4: Probar la Validación

#### Test 1: Aplicación a Primer Evento
1. Cambia a la cuenta del empleado (o abre en incógnito)
2. Ve a **Mis Turnos → Eventos Disponibles**
3. Busca **Evento A**
4. Haz clic en **Aplicar a Evento**
5. Selecciona rol "Bartender"
6. Haz clic en **Aplicar**
7. ✅ **Resultado esperado**: Asignación creada exitosamente

#### Test 2: Aplicación a Segundo Evento (Debe Fallar)
1. Busca **Evento B** en la lista
2. Haz clic en **Aplicar a Evento**
3. Selecciona rol "Bartender"
4. Haz clic en **Aplicar**
5. ❌ **Resultado esperado**: Error 400
   ```
   "No puedes aplicar a este evento. Tienes otro evento el mismo día 
   con menos de 2 horas de diferencia. Diferencia actual: 1.0 horas."
   ```

### Paso 5: Probar con Evento Lejano (Debe Funcionar)

1. Crea **Evento C**:
   - Fecha: 2026-05-15 (MISMO DÍA)
   - Hora: 17:00 (diferencia: 3 horas - MAYOR que 2)
   - Rol: Bartender

2. Intenta aplicar a **Evento C**
3. ✅ **Resultado esperado**: Asignación creada exitosamente (porque 3 horas > 2 horas)

---

## 🔍 Verificación en Backend

### Ver Logs del Backend

```bash
docker logs event_staffing_backend -f
```

Busca líneas como:
```
INFO:     192.168.65.1:xxxxx - "POST /api/v1/assignments/events/1/apply HTTP/1.1" 400 Bad Request
```

### Verificar en Base de Datos

```bash
# Acceder a pgAdmin
# URL: http://localhost:5050
# Email: admin@example.com
# Password: admin

# O línea de comandos:
docker exec -it event_staffing_db psql -U postgres -d event_staffing

# Ver asignaciones del empleado
SELECT id, event_id, user_id, status, created_at 
FROM event_assignments 
WHERE user_id = 2 
ORDER BY created_at DESC;
```

---

## 📊 Casos de Prueba

### Caso 1: Diferencia < Parámetro (Debe Rechazar)
```
Evento A: 14:00
Evento B: 15:00
Diferencia: 1 hora
Parámetro: 2 horas
Resultado: ❌ RECHAZA
```

### Caso 2: Diferencia = Parámetro (Debe Aceptar)
```
Evento A: 14:00
Evento B: 16:00
Diferencia: 2 horas
Parámetro: 2 horas
Resultado: ✅ ACEPTA
```

### Caso 3: Diferencia > Parámetro (Debe Aceptar)
```
Evento A: 14:00
Evento B: 17:00
Diferencia: 3 horas
Parámetro: 2 horas
Resultado: ✅ ACEPTA
```

### Caso 4: Diferentes Días (Debe Aceptar)
```
Evento A: 2026-05-15 14:00
Evento B: 2026-05-16 15:00
Diferencia: 25 horas (diferente día)
Parámetro: 2 horas
Resultado: ✅ ACEPTA (no valida entre días diferentes)
```

---

## 🐛 Troubleshooting

### Si sigue sin funcionar:

1. **Verificar que el backend se reinició**:
   ```bash
   docker ps | grep event_staffing_backend
   # Debe mostrar "Up X minutes" (reciente)
   ```

2. **Verificar que el código está en el archivo**:
   ```bash
   grep -n "pending.*approved.*invited" backend/app/routers/assignments.py
   # Debe mostrar dos líneas (apply_to_event y invite_employee)
   ```

3. **Reiniciar manualmente si es necesario**:
   ```bash
   docker restart event_staffing_backend
   sleep 3
   curl http://localhost:8000/docs
   ```

4. **Ver logs detallados**:
   ```bash
   docker logs event_staffing_backend -f --tail=50
   ```

---

## ✅ Checklist de Verificación

- [ ] Backend restarted
- [ ] Parámetro `horas_entre_eventos` configurado a 2
- [ ] Evento A creado (14:00)
- [ ] Evento B creado (15:00)
- [ ] Empleado tiene rol Bartender
- [ ] Empleado puede aplicar a Evento A
- [ ] Empleado NO puede aplicar a Evento B (error 400)
- [ ] Empleado puede aplicar a Evento C (17:00)
- [ ] Mensaje de error es descriptivo

---

## 📝 Notas Importantes

1. **Estados que se validan**: `pending`, `approved`, `invited`
2. **Estados que NO se validan**: `rejected`, `removed`
3. **Validación**: Solo entre eventos del MISMO DÍA
4. **Cálculo**: Diferencia en HORAS (no minutos)
5. **Comparación**: `time_diff < horas_entre_eventos` → RECHAZA

---

## 🎯 Resultado Esperado

Después del fix, el sistema debe:

✅ Validar `horas_entre_eventos` correctamente
✅ Rechazar aplicaciones con conflicto de horarios
✅ Aceptar aplicaciones sin conflicto
✅ Mostrar mensaje descriptivo del error
✅ Funcionar tanto para aplicación como para invitación

---

**Fecha**: 10 de Mayo, 2026
**Fix**: Incluir "pending" en validación de `horas_entre_eventos`
**Estado**: ✅ Deployado

