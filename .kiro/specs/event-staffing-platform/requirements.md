# Documento de Requisitos

## Introducción

Plataforma web responsive multitenant para la publicación de eventos sociales (fiestas, reuniones, matrimonios, cumpleaños, etc.) y la gestión integral del personal: solicitud, asignación, control de turnos y pagos. La plataforma soporta múltiples empresas (tenants) con aislamiento de datos por `company_id`, y permite que un mismo usuario pertenezca a varias empresas con roles distintos en cada una.

---

## Glosario

- **Platform**: El sistema de software completo descrito en este documento.
- **Super_Admin**: Usuario con acceso total a la plataforma; crea y gestiona empresas.
- **Company**: Entidad tenant registrada en la plataforma que organiza eventos y gestiona personal.
- **Admin**: Usuario con rol de administrador dentro de una empresa; crea eventos, gestiona empleados y aprueba asignaciones.
- **Coordinator**: Usuario con rol de coordinador dentro de una empresa; modifica horarios de empleados en eventos y genera reportes.
- **Employee**: Usuario con rol de empleado dentro de una empresa; aplica a eventos y registra turnos.
- **Event**: Evento social publicado por un Admin dentro de una empresa, con roles requeridos, horario, dirección y dress code.
- **Job_Role**: Rol laboral definido a nivel de empresa (ej. bartender, mesero, cocinero) con un valor por hora genérico para esa empresa.
- **Employee_Role_Rate**: Tarifa por hora para la combinación Job_Role + Company. Es el valor genérico del rol dentro de la empresa, aplicable a todos los empleados que desempeñen ese rol.
- **Event_Assignment**: Relación entre un Employee y un Event, con estado y registro de turno.
- **Shift**: Registro de hora de inicio y fin de turno de un Employee en un Event_Assignment.
- **JWT**: JSON Web Token que incluye `user_id`, `company_id` y `role` para autenticar y autorizar solicitudes.
- **Notification_Service**: Servicio de envío de notificaciones por email (Resend) y SMS (Twilio).
- **Report**: Documento generado con datos de horas trabajadas y valores a pagar, filtrable por evento o empleado.
- **Weekly_Hours_Limit**: Parámetro configurable por empresa que define el máximo de horas semanales recomendadas antes de aplicar recargo.

---

## Requisitos

### Requisito 1: Gestión de Empresas (Multitenancy)

**User Story:** Como Super_Admin, quiero crear y gestionar empresas en la plataforma, para que cada organización opere de forma aislada con sus propios datos y usuarios.

#### Criterios de Aceptación

1. THE Super_Admin SHALL crear empresas proporcionando nombre, identificador único y datos de contacto.
2. THE Super_Admin SHALL activar y desactivar empresas existentes en la plataforma.
3. WHEN una Company es desactivada, THE Platform SHALL impedir el acceso de todos sus usuarios hasta que sea reactivada.
4. THE Platform SHALL aislar los datos de cada Company mediante el campo `company_id` en todas las tablas principales, de modo que ningún usuario de una empresa pueda acceder a datos de otra.

---

### Requisito 2: Autenticación y Gestión de Sesión Multitenant

**User Story:** Como usuario, quiero iniciar sesión con mis credenciales y seleccionar la empresa activa, para que el sistema me otorgue acceso con el rol correcto dentro de esa empresa.

#### Criterios de Aceptación

1. WHEN un usuario envía email, contraseña y empresa seleccionada, THE Platform SHALL autenticar las credenciales y emitir un JWT que contenga `user_id`, `company_id` y `role`.
2. IF las credenciales son inválidas o la empresa no está asociada al usuario, THEN THE Platform SHALL retornar un error de autenticación con código HTTP 401.
3. WHILE un usuario tiene una sesión activa, THE Platform SHALL validar el JWT en cada solicitud y rechazar tokens expirados o inválidos con código HTTP 401.
4. WHEN un usuario pertenece a múltiples empresas, THE Platform SHALL permitir cambiar la empresa activa sin cerrar sesión, emitiendo un nuevo JWT con el contexto de la empresa seleccionada.
5. THE Platform SHALL mostrar en el selector de login únicamente las empresas activas a las que el usuario está asociado.

---

### Requisito 3: Gestión de Usuarios y Asociación a Empresas

**User Story:** Como Admin, quiero buscar empleados por email y asociarlos a mi empresa, para que puedan participar en los eventos que gestiono.

#### Criterios de Aceptación

1. WHEN un Admin busca un usuario por email y el usuario existe en la plataforma, THE Platform SHALL mostrar los datos del usuario y permitir asociarlo a la empresa del Admin.
2. WHEN un Admin busca un usuario por email y el usuario no existe, THE Platform SHALL permitir al Admin crear el usuario con nombre, email y contraseña temporal, y asociarlo automáticamente a su empresa.
3. THE Admin SHALL asignar a cada usuario asociado uno de los roles disponibles en la empresa: Admin, Coordinator o Employee.
4. THE Admin SHALL desasociar un usuario de su empresa, revocando el acceso de ese usuario a los datos y eventos de la empresa.
5. IF un usuario ya está asociado a la empresa del Admin, THEN THE Platform SHALL informar al Admin que la asociación ya existe y no duplicar el registro.

---

### Requisito 4: Gestión de Roles Laborales y Tarifas

**User Story:** Como Admin, quiero definir roles laborales con su valor por hora genérico dentro de mi empresa, para que el sistema calcule pagos automáticamente según el rol desempeñado en cada evento.

#### Criterios de Aceptación

1. THE Admin SHALL crear Job_Roles dentro de su empresa especificando el nombre del rol (ej. bartender, server, cocinero) y su valor por hora genérico para esa empresa.
2. THE Admin SHALL editar el valor por hora de un Job_Role existente sin afectar los Shifts ya registrados con la tarifa anterior.
3. THE Admin SHALL asociar uno o más Job_Roles a un Employee dentro de su empresa, indicando los roles que ese empleado puede desempeñar.
4. WHEN un Employee tiene múltiples Job_Roles en la misma empresa, THE Platform SHALL mantener el valor por hora de cada rol de forma independiente (ej. server: $20/h, bartender: $25/h en empresa A).
5. WHEN el mismo Job_Role existe en múltiples empresas, THE Platform SHALL mantener valores por hora independientes por empresa (ej. bartender: $25/h en empresa A y $30/h en empresa B).
6. THE Admin SHALL desactivar un Job_Role, impidiendo su uso en nuevos eventos sin afectar los eventos ni los Shifts existentes.
7. THE Platform SHALL parametrizar el Weekly_Hours_Limit por empresa, permitiendo al Admin configurar el número máximo de horas semanales recomendadas.
8. WHEN se crea un Event_Assignment para un Employee, THE Platform SHALL usar el valor por hora del Job_Role asignado en ese evento para calcular el pago del Shift.

---

### Requisito 5: Gestión de Eventos

**User Story:** Como Admin, quiero crear y publicar eventos con todos sus detalles, para que los empleados puedan visualizarlos y aplicar a ellos.

#### Criterios de Aceptación

1. THE Admin SHALL crear un Event especificando: nombre, fecha, hora de inicio (obligatoria), hora de fin aproximada (opcional), dirección, dress code, y al menos un Job_Role requerido con su cantidad de personas (cupos) y valor por hora.
2. WHEN un Admin publica un Event, THE Platform SHALL cambiar el estado del evento a "Publicado" y notificar a los Employees asociados a la empresa mediante email y SMS.
3. THE Admin SHALL editar los datos de un Event en estado "Publicado" siempre que no haya Employees con estado "Aprobado" en ese evento.
4. THE Admin SHALL cancelar un Event, notificando por email y SMS a todos los Employees con Event_Assignment activo en ese evento.
5. IF un Event no tiene hora de fin definida, THEN THE Platform SHALL permitir al Coordinator o Admin registrar la hora de fin real durante o después del evento.

---

### Requisito 6: Solicitud y Asignación de Personal

**User Story:** Como Admin, quiero gestionar la asignación de empleados a eventos, para que cada evento cuente con el personal necesario en los roles requeridos.

#### Criterios de Aceptación

1. WHEN un Employee aplica a un Event publicado, THE Platform SHALL requerir que el Employee seleccione un único Job_Role para ese evento, limitado a los roles que tiene asignados en la empresa y que el evento requiere.
2. IF un Employee tiene múltiples Job_Roles compatibles con el evento, THEN THE Platform SHALL permitir al Employee elegir solo uno de ellos al momento de aplicar.
3. WHEN los cupos de un Job_Role en un Event están completos (cantidad de aprobados igual al límite definido), THE Platform SHALL impedir que nuevos Employees apliquen a ese rol en ese evento.
4. WHEN un Employee aplica a un Event, THE Platform SHALL crear un Event_Assignment con estado "Pendiente de aprobación" y notificar al Admin por email.
5. WHEN un Admin aprueba un Event_Assignment, THE Platform SHALL cambiar el estado a "Aprobado" y notificar al Employee por email y SMS.
6. THE Admin SHALL asignar directamente un Employee a un Event en un Job_Role específico sin requerir que el empleado aplique, creando el Event_Assignment con estado "Aprobado".
7. THE Admin SHALL enviar una solicitud directa a un Employee para un Event en un Job_Role específico, creando el Event_Assignment con estado "Pendiente de aprobación" y notificando al Employee por email y SMS.
8. THE Admin SHALL remover un Employee de un Event en cualquier estado del Event_Assignment, notificando al Employee por email y SMS.
9. WHILE un Event tiene cubierta la cantidad requerida de personas para un Job_Role, THE Platform SHALL indicar visualmente que ese rol está completo.

---

### Requisito 7: Registro de Turnos

**User Story:** Como Employee, quiero registrar mi hora de inicio y fin de turno en cada evento, para que el sistema calcule correctamente mis horas trabajadas y el pago correspondiente.

#### Criterios de Aceptación

1. WHEN un Employee con Event_Assignment en estado "Aprobado" registra el inicio de turno, THE Platform SHALL almacenar la hora de inicio con timestamp del servidor.
2. WHEN un Employee registra el fin de turno, THE Platform SHALL almacenar la hora de fin y calcular la duración del turno en horas y fracciones.
3. THE Admin SHALL modificar la hora de inicio y fin registradas en cualquier Shift de un Employee en su empresa.
4. THE Coordinator SHALL modificar la hora de inicio y fin registradas en cualquier Shift de un Employee en los eventos que coordina.
5. WHEN un Coordinator registra la hora de fin del Event, THE Platform SHALL aplicar esa hora de fin a todos los Shifts de Employees del evento que no tengan hora de fin registrada.
6. IF un Employee intenta registrar fin de turno sin haber registrado inicio, THEN THE Platform SHALL retornar un error indicando que el inicio de turno es requerido.

---

### Requisito 8: Cálculo de Pagos y Control de Horas Semanales

**User Story:** Como Admin, quiero que el sistema calcule automáticamente el pago de cada empleado considerando horas extra, para tener claridad sobre los costos de personal por evento.

#### Criterios de Aceptación

1. THE Platform SHALL calcular el pago de cada Shift usando el valor por hora del Job_Role desempeñado en el evento: `horas_trabajadas × valor_hora_job_role`.
2. WHEN las horas trabajadas acumuladas de un Employee en una semana calendario superan el Weekly_Hours_Limit de la empresa, THE Platform SHALL calcular las horas excedentes con un recargo del 50% sobre el valor por hora del Job_Role correspondiente.
3. WHEN un Employee supera el Weekly_Hours_Limit semanal, THE Platform SHALL generar una alerta visible para el Admin y el Coordinator de la empresa.
4. THE Platform SHALL calcular el pago total de un Employee por Event sumando los pagos de todos sus Shifts en ese evento, aplicando el recargo de horas extra cuando corresponda.
5. FOR ALL Shifts registrados, el recálculo del pago al modificar horas SHALL producir un resultado equivalente al cálculo inicial con las horas corregidas (propiedad de consistencia del cálculo).

---

### Requisito 9: Notificaciones

**User Story:** Como usuario, quiero recibir notificaciones por email y SMS sobre eventos relevantes, para estar informado sin necesidad de revisar la plataforma constantemente.

#### Criterios de Aceptación

1. WHEN un Event es publicado, THE Notification_Service SHALL enviar email y SMS a todos los Employees activos de la empresa.
2. WHEN un Employee es aprobado para un Event, THE Notification_Service SHALL enviar email y SMS al Employee con los detalles del evento.
3. WHEN un Admin envía una solicitud directa a un Employee, THE Notification_Service SHALL enviar email y SMS al Employee con los detalles del evento y la solicitud.
4. WHEN un Employee es removido de un Event, THE Notification_Service SHALL enviar email y SMS al Employee informando la remoción.
5. WHEN un Event es cancelado, THE Notification_Service SHALL enviar email y SMS a todos los Employees con Event_Assignment activo en ese evento.
6. IF el envío de una notificación falla, THEN THE Notification_Service SHALL registrar el error en el log del sistema y reintentar el envío hasta 3 veces antes de marcar la notificación como fallida.

---

### Requisito 10: Reportes

**User Story:** Como Admin o Coordinator, quiero generar reportes de horas y pagos por evento o por empleado, para tener visibilidad del costo de personal y facilitar la liquidación de pagos.

#### Criterios de Aceptación

1. THE Admin SHALL generar un reporte por Event que incluya: lista de Employees, Job_Role de cada uno, horas de inicio y fin de turno, horas trabajadas y valor a pagar por cada Employee.
2. THE Admin SHALL generar un reporte por Employee en un rango de fechas que incluya: eventos trabajados, horas por evento y valor a pagar por evento.
3. THE Coordinator SHALL generar los mismos reportes descritos en los criterios 1 y 2 para los eventos de su empresa.
4. THE Employee SHALL generar un reporte de sus propios eventos trabajados que incluya: nombre del evento, fecha, horas trabajadas y valor esperado de pago.
5. WHEN se genera un reporte, THE Platform SHALL calcular los totales de horas y valor a pagar sumando todos los registros incluidos en el reporte.
6. THE Platform SHALL permitir exportar los reportes en formato CSV.

---

### Requisito 11: Perfil del Empleado e Historial

**User Story:** Como Employee, quiero mantener un perfil con mi historial de eventos y calificaciones, para que las empresas puedan evaluar mi experiencia antes de aprobarme en un evento.

#### Criterios de Aceptación

1. THE Platform SHALL mantener un perfil por Employee que incluya: nombre, email, foto opcional y resumen de eventos trabajados.
2. WHERE el historial de calificaciones está habilitado, THE Platform SHALL mostrar las calificaciones recibidas por el Employee en eventos de otras empresas, sin revelar datos confidenciales de esas empresas.
3. WHERE el historial de calificaciones está habilitado, THE Admin SHALL registrar una calificación numérica (1-5) y comentario opcional para un Employee al finalizar un Event.
4. THE Employee SHALL visualizar su propio historial de calificaciones y comentarios recibidos en todos los eventos donde ha participado.

