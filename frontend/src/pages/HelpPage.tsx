import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const GREEN = '#2db84b'

interface HelpItem { id: string; title: string; content: string; roles: string[] }

export default function HelpPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const isEs = i18n.language === 'es'

  const helpItems: HelpItem[] = isEs ? [
    // --- ADMIN ---
    { id: 'create-event', title: '¿Cómo creo un evento?', content: 'Ve a Eventos → Nuevo Evento. Completa el formulario con nombre, fecha, hora, dirección y dress code. Agrega los roles requeridos (ej: 2 Bartenders, 3 Servers) con su tarifa y hora de inicio. El evento se crea en estado "Creado". Luego puedes invitar empleados o publicarlo para que apliquen.', roles: ['admin', 'super_admin'] },
    { id: 'publish-event', title: '¿Qué pasa cuando publico un evento?', content: 'Al publicar, el evento cambia a estado "Publicado" y se envía un email a todos los empleados que tienen los roles requeridos. Los empleados podrán ver el evento y aplicar desde su perfil.', roles: ['admin', 'super_admin'] },
    { id: 'invite-vs-assign', title: '¿Cuál es la diferencia entre Invitar y Asignar Directo?', content: 'Invitar: Se envía una invitación al empleado (email + WhatsApp). El empleado debe aceptar o rechazar. Asignar Directo: El empleado queda confirmado inmediatamente sin necesidad de aceptar. Se le notifica que fue asignado.', roles: ['admin', 'super_admin'] },
    { id: 'event-states', title: '¿Cuáles son los estados de un evento?', content: 'Creado: Recién creado, no visible para empleados. Publicado: Visible, empleados pueden aplicar. Llenado Pendiente: Todos los cupos cubiertos pero hay invitaciones sin aceptar. Llenado: Todos los cupos cubiertos y confirmados. Iniciado: Al menos un empleado inició turno. Finalizado: Todos los turnos cerrados. Cancelado: Evento cancelado.', roles: ['admin', 'super_admin', 'coordinator'] },
    { id: 'manage-users', title: '¿Cómo agrego empleados?', content: 'Ve a Usuarios → Agregar Usuario. Busca por email. Si no existe, créalo con nombre, email, usuario, contraseña temporal y teléfono. Asígnale un perfil (admin, coordinador o empleado) y roles laborales. El empleado recibirá un email con sus credenciales.', roles: ['admin', 'super_admin'] },
    { id: 'roles-rates', title: '¿Cómo configuro roles y tarifas?', content: 'Ve a Roles Laborales. Crea roles (Bartender, Server, etc.) con una tarifa base por hora. Luego asigna empleados a cada rol. Puedes poner una tarifa personalizada por empleado si es diferente a la base. La jerarquía es: tarifa evento > tarifa empleado > tarifa base del rol.', roles: ['admin', 'super_admin'] },
    { id: 'config-params', title: '¿Qué significan los parámetros de configuración?', content: 'Horas Semanales: Límite antes de pagar horas extras. Multiplicador Extras: Factor para horas extra (ej: 1.5 = 50% más). Horas Entre Eventos: Mínimo de horas entre dos eventos el mismo día. Días para Retirarse: Cuántos días antes puede un empleado retirarse (0 = siempre puede). Minutos Antes: Cuánto tiempo antes del evento puede el empleado iniciar turno. Geolocalización: Si se valida la ubicación al iniciar turno.', roles: ['admin', 'super_admin'] },
    { id: 'event-hours', title: '¿Cómo modifico las horas de un evento?', content: 'Ve a Horas Evento (requiere que el parámetro esté activo). Selecciona un evento iniciado o finalizado. Puedes modificar la hora de entrada y/o salida de cada empleado individualmente, o aplicar una hora a todos a la vez.', roles: ['admin', 'super_admin', 'coordinator'] },
    { id: 'reports', title: '¿Cómo genero reportes?', content: 'Ve a Reportes. Hay 5 tipos: Por Evento (filtra por fecha), Por Empleado (busca por nombre/email), Mi Reporte (para empleados), Eventos por Fechas (rango de fechas), Consolidado de Pagos (resumen por empleado).', roles: ['admin', 'super_admin', 'coordinator', 'employee'] },
    // --- EMPLOYEE ---
    { id: 'apply-event', title: '¿Cómo aplico a un evento?', content: 'Ve a Eventos y selecciona un evento publicado. Si tienes un rol que el evento requiere, verás la opción "Aplicar". Selecciona tu rol y haz clic en Aplicar. Tu solicitud quedará pendiente de aprobación por el administrador.', roles: ['employee'] },
    { id: 'accept-invite', title: '¿Cómo acepto o rechazo una invitación?', content: 'Cuando te invitan a un evento, recibirás un email y WhatsApp. También verás la invitación en Mis Turnos. Haz clic en el evento y presiona "Confirmar" para aceptar o "Cancelar" para rechazar. Si aceptas, quedas confirmado para trabajar.', roles: ['employee'] },
    { id: 'clock-in-out', title: '¿Cómo inicio y finalizo mi turno?', content: 'Ve a Mis Turnos. Cuando falten los minutos configurados para el evento (ej: 15 min antes), se activará el botón "Iniciar Turno". Al terminar, presiona "Finalizar Turno". Si la geolocalización está activa, debes estar cerca del evento.', roles: ['employee'] },
    { id: 'withdraw', title: '¿Puedo retirarme de un evento confirmado?', content: 'Sí, si el parámetro "Días para retirarse" lo permite. Si está en 0, puedes retirarte en cualquier momento. Si está en 5, debes retirarte al menos 5 días antes del evento. Ve a Mis Turnos → selecciona el evento → "Retirarse del evento".', roles: ['employee'] },
    { id: 'my-profile', title: '¿Cómo actualizo mi perfil?', content: 'Ve a Mi Cuenta. Puedes actualizar tu nombre, teléfono, dirección y otros datos personales. También puedes cambiar tu contraseña y ver tus documentos y roles asignados.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'change-password', title: '¿Cómo cambio mi contraseña?', content: 'Ve a Cambiar Clave en el menú. Ingresa tu contraseña actual y la nueva contraseña (dos veces para confirmar). La primera vez que ingresas, el sistema te pedirá cambiar la contraseña temporal.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'news', title: '¿Dónde veo las noticias?', content: 'Ve a Noticias en el menú. Los administradores publican noticias importantes para toda la empresa. Como empleado, puedes leer las noticias activas.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'switch-company', title: '¿Puedo pertenecer a varias empresas?', content: 'Sí. Al hacer login, selecciona la empresa con la que quieres trabajar. Puedes tener diferentes roles en cada empresa (ej: admin en una, empleado en otra).', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
  ] : [
    // --- ADMIN (EN) ---
    { id: 'create-event', title: 'How do I create an event?', content: 'Go to Events → New Event. Fill in the form with name, date, time, address and dress code. Add required roles (e.g., 2 Bartenders, 3 Servers) with their rate and start time. The event is created in "Created" state. You can then invite employees or publish it so they can apply.', roles: ['admin', 'super_admin'] },
    { id: 'publish-event', title: 'What happens when I publish an event?', content: 'When published, the event changes to "Published" state and an email is sent to all employees who have the required roles. Employees can then see the event and apply from their profile.', roles: ['admin', 'super_admin'] },
    { id: 'invite-vs-assign', title: 'What is the difference between Invite and Direct Assign?', content: 'Invite: An invitation is sent to the employee (email + WhatsApp). The employee must accept or decline. Direct Assign: The employee is immediately confirmed without needing to accept. They are notified of the assignment.', roles: ['admin', 'super_admin'] },
    { id: 'event-states', title: 'What are the event states?', content: 'Created: Just created, not visible to employees. Published: Visible, employees can apply. Filled Pending: All slots covered but there are unaccepted invitations. Filled: All slots covered and confirmed. Started: At least one employee started their shift. Finished: All shifts closed. Cancelled: Event cancelled.', roles: ['admin', 'super_admin', 'coordinator'] },
    { id: 'manage-users', title: 'How do I add employees?', content: 'Go to Users → Add User. Search by email. If they don\'t exist, create them with name, email, username, temporary password and phone. Assign a profile (admin, coordinator or employee) and job roles. The employee will receive an email with their credentials.', roles: ['admin', 'super_admin'] },
    { id: 'roles-rates', title: 'How do I configure roles and rates?', content: 'Go to Job Roles. Create roles (Bartender, Server, etc.) with a base hourly rate. Then assign employees to each role. You can set a custom rate per employee if different from the base. The hierarchy is: event rate > employee rate > role base rate.', roles: ['admin', 'super_admin'] },
    { id: 'config-params', title: 'What do the configuration parameters mean?', content: 'Weekly Hours: Limit before paying overtime. Overtime Multiplier: Factor for extra hours (e.g., 1.5 = 50% more). Hours Between Events: Minimum hours between two events on the same day. Days to Withdraw: How many days before an employee can withdraw (0 = always allowed). Minutes Before: How long before the event an employee can start their shift. Geolocation: Whether to validate location on clock-in.', roles: ['admin', 'super_admin'] },
    { id: 'event-hours', title: 'How do I modify event hours?', content: 'Go to Event Hours (requires the parameter to be active). Select a started or finished event. You can modify the clock-in and/or clock-out time for each employee individually, or apply a time to all at once.', roles: ['admin', 'super_admin', 'coordinator'] },
    { id: 'reports', title: 'How do I generate reports?', content: 'Go to Reports. There are 5 types: By Event (filter by date), By Employee (search by name/email), My Report (for employees), Events by Dates (date range), Payment Consolidation (summary per employee).', roles: ['admin', 'super_admin', 'coordinator', 'employee'] },
    // --- EMPLOYEE (EN) ---
    { id: 'apply-event', title: 'How do I apply to an event?', content: 'Go to Events and select a published event. If you have a role the event requires, you\'ll see the "Apply" option. Select your role and click Apply. Your application will be pending approval by the administrator.', roles: ['employee'] },
    { id: 'accept-invite', title: 'How do I accept or decline an invitation?', content: 'When you\'re invited to an event, you\'ll receive an email and WhatsApp. You\'ll also see the invitation in My Shifts. Click the event and press "Confirm" to accept or "Cancel" to decline. If you accept, you\'re confirmed to work.', roles: ['employee'] },
    { id: 'clock-in-out', title: 'How do I start and end my shift?', content: 'Go to My Shifts. When the configured minutes before the event arrive (e.g., 15 min before), the "Clock In" button will activate. When done, press "Clock Out". If geolocation is active, you must be near the event.', roles: ['employee'] },
    { id: 'withdraw', title: 'Can I withdraw from a confirmed event?', content: 'Yes, if the "Days to withdraw" parameter allows it. If set to 0, you can withdraw anytime. If set to 5, you must withdraw at least 5 days before the event. Go to My Shifts → select the event → "Withdraw from event".', roles: ['employee'] },
    { id: 'my-profile', title: 'How do I update my profile?', content: 'Go to My Account. You can update your name, phone, address and other personal data. You can also change your password and view your documents and assigned roles.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'change-password', title: 'How do I change my password?', content: 'Go to Change Password in the menu. Enter your current password and the new password (twice to confirm). The first time you log in, the system will ask you to change the temporary password.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'news', title: 'Where do I see news?', content: 'Go to News in the menu. Administrators publish important news for the entire company. As an employee, you can read active news.', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
    { id: 'switch-company', title: 'Can I belong to multiple companies?', content: 'Yes. When logging in, select the company you want to work with. You can have different roles in each company (e.g., admin in one, employee in another).', roles: ['employee', 'admin', 'super_admin', 'coordinator'] },
  ]

  const userRole = user?.role || 'employee'
  const filtered = helpItems
    .filter(item => item.roles.includes(userRole))
    .filter(item => {
      if (!search) return true
      const q = search.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
    })

  return (
    <div style={{ maxWidth: '700px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <HelpCircle size={22} color={GREEN} />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{isEs ? 'Centro de Ayuda' : 'Help Center'}</h2>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isEs ? 'Buscar en la ayuda...' : 'Search help...'}
          style={{ width: '100%', height: '44px', paddingLeft: '38px', paddingRight: '12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: "'Poppins',sans-serif", background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '2rem' }}>
            {isEs ? 'No se encontraron resultados.' : 'No results found.'}
          </p>
        )}
        {filtered.map(item => (
          <div key={item.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: "'Poppins',sans-serif" }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{item.title}</span>
              {expanded === item.id ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
            </button>
            {expanded === item.id && (
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f3f4f6' }}>
                <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
