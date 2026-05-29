import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, Briefcase, BarChart2, Building2, UserCircle, Newspaper, ArrowRight, Settings, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react'
import { translateRole } from '@/lib/translationHelpers'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface DashboardData {
  events_this_month: number
  events_completed: number
  events_upcoming: number
  events_in_progress: number
  total_staff_assigned: number
  staff_by_role: { role_name: string; count: number }[]
  total_hours_worked: number
  total_pay: number
  next_events: { id: number; name: string; event_date: string; start_time: string; status: string }[]
  total_employees: number
  total_events_all_time: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(r => setDashboard(r.data)).catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Usuario'
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.superAdmin') || 'Super Administrador',
    admin:       t('roles.admin')      || 'Administrador',
    coordinator: t('roles.coordinator')|| 'Coordinador',
    employee:    t('roles.employee')   || 'Empleado',
  }

  const cards = [
    {
      to: '/events', label: t('nav.events'), icon: CalendarDays,
      desc: t('dashboard.eventsDesc') || 'Ver y gestionar eventos',
      show: true, accent: '#2db84b', bg: '#f0fdf4', iconBg: '#dcfce7',
    },
    {
      to: '/users', label: t('nav.users'), icon: Users,
      desc: t('dashboard.usersDesc') || 'Gestionar empleados',
      show: isAdmin(user), accent: '#7c3aed', bg: '#faf5ff', iconBg: '#ede9fe',
    },
    {
      to: '/job-roles', label: t('nav.roles'), icon: Briefcase,
      desc: t('dashboard.rolesDesc') || 'Configurar roles y tarifas',
      show: isAdmin(user), accent: '#0284c7', bg: '#f0f9ff', iconBg: '#e0f2fe',
    },
    {
      to: '/reports', label: t('nav.reports'), icon: BarChart2,
      desc: t('dashboard.reportsDesc') || 'Ver reportes de horas y pagos',
      show: isAdminOrCoord(user) || user?.role === 'employee', accent: '#d97706', bg: '#fffbeb', iconBg: '#fef3c7',
    },
    {
      to: '/news', label: t('nav.news'), icon: Newspaper,
      desc: t('dashboard.newsDesc') || 'Gestionar noticias',
      show: isAdmin(user), accent: '#db2777', bg: '#fdf2f8', iconBg: '#fce7f3',
    },
    {
      to: '/company-settings', label: t('nav.myCompany'), icon: Settings,
      desc: t('dashboard.companyDesc') || 'Configuración de empresa',
      show: isAdmin(user) && user?.role !== 'super_admin', accent: '#0891b2', bg: '#ecfeff', iconBg: '#cffafe',
    },
    {
      to: '/companies', label: t('nav.companies'), icon: Building2,
      desc: t('dashboard.companiesDesc') || 'Gestionar empresas',
      show: user?.role === 'super_admin', accent: '#db2777', bg: '#fdf2f8', iconBg: '#fce7f3',
    },
    {
      to: '/account', label: t('nav.account') || 'Mi Cuenta', icon: UserCircle,
      desc: t('dashboard.accountDesc') || 'Perfil, documentos y roles',
      show: true, accent: '#ea580c', bg: '#fff7ed', iconBg: '#ffedd5',
    },
  ].filter(c => c.show)

  // Hora del día
  const hour = new Date().getHours()
  const greeting = hour < 12
    ? (t('dashboard.goodMorning') || '¡Buenos días')
    : hour < 18
    ? (t('dashboard.goodAfternoon') || '¡Buenas tardes')
    : (t('dashboard.goodEvening') || '¡Buenas noches')

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ══════════════════════════════════
          BANNER DE BIENVENIDA
      ══════════════════════════════════ */}
      <div style={{
        marginBottom: '1.75rem',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1d1e 0%, #1f2937 50%, #111827 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}>
        {/* Orbe decorativo */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,184,75,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            {/* Avatar */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
              background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 14px rgba(45,184,75,0.4)`,
            }}>
              {userInitial}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
                {greeting},
              </p>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {firstName}<span style={{ color: GREEN }}>!</span>
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: GREEN, fontWeight: 500 }}>
                {roleLabels[user?.role || ''] || user?.role}
                {user?.company_name ? ` · ${user.company_name}` : ''}
              </p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: t('dashboard.platform'), value: 'Kalirio' },
              { label: t('dashboard.version'), value: '2.0' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior verde */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN}, transparent)` }} />
      </div>

      {/* ══════════════════════════════════
          MÉTRICAS DEL MES
      ══════════════════════════════════ */}
      {dashboard && (isAdmin(user) || isAdminOrCoord(user)) && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: t('dashboard.eventsMonth') || 'Eventos del mes', value: dashboard.events_this_month, icon: CalendarDays, color: '#2db84b', bg: '#f0fdf4' },
              { label: t('dashboard.eventsUpcoming') || 'Próximos', value: dashboard.events_upcoming, icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff' },
              { label: t('dashboard.eventsCompleted') || 'Completados', value: dashboard.events_completed, icon: Activity, color: '#10b981', bg: '#ecfdf5' },
              { label: t('dashboard.staffAssigned') || 'Personal asignado', value: dashboard.total_staff_assigned, icon: Users, color: '#7c3aed', bg: '#faf5ff' },
              { label: t('dashboard.hoursWorked') || 'Horas trabajadas', value: `${dashboard.total_hours_worked}h`, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
              { label: t('dashboard.totalPay') || 'Total pagos', value: `$${dashboard.total_pay.toLocaleString()}`, icon: DollarSign, color: '#ef4444', bg: '#fef2f2' },
            ].map((metric, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem',
                padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: metric.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${metric.color}20`,
                }}>
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                    {metric.value}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{metric.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personal por rol + Próximos eventos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Personal por rol */}
            {dashboard.staff_by_role.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  👥 {t('dashboard.staffByRole') || 'Personal por rol (mes)'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dashboard.staff_by_role.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{r.role_name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', background: '#f3f4f6', padding: '2px 10px', borderRadius: '20px' }}>
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos eventos */}
            {dashboard.next_events.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  📅 {t('dashboard.nextEvents') || 'Próximos eventos'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dashboard.next_events.map(ev => (
                    <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#111827' }}>{ev.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{ev.event_date} · {ev.start_time}</p>
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                          background: ev.status === 'published' ? '#dbeafe' : ev.status === 'started' ? '#fef3c7' : '#f3f4f6',
                          color: ev.status === 'published' ? '#1d4ed8' : ev.status === 'started' ? '#92400e' : '#374151',
                        }}>
                          {ev.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen general */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                📊 {t('dashboard.generalSummary') || 'Resumen general'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>{t('dashboard.totalEmployees') || 'Total empleados'}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{dashboard.total_employees}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>{t('dashboard.totalEventsAllTime') || 'Total eventos (histórico)'}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{dashboard.total_events_all_time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>{t('dashboard.eventsInProgress') || 'En progreso ahora'}</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>{dashboard.events_in_progress}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════
          TÍTULO SECCIÓN
      ══════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
          {t('dashboard.quickAccess')}
        </p>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>

      {/* ══════════════════════════════════
          CARDS DE NAVEGACIÓN
      ══════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(card => {
          const hovered = hoveredCard === card.to
          return (
            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setHoveredCard(card.to)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#fff',
                  border: `1px solid ${hovered ? card.accent + '40' : '#e5e7eb'}`,
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: hovered ? 'translateY(-3px)' : 'none',
                  boxShadow: hovered ? `0 8px 24px ${card.accent}18` : '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  position: 'relative', overflow: 'hidden',
                }}>

                {/* Barra lateral izquierda */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                  background: hovered ? card.accent : 'transparent',
                  borderRadius: '3px 0 0 3px',
                  transition: 'background 0.2s',
                }} />

                {/* Icono */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                  background: hovered ? card.iconBg : '#f9fafb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                  border: `1px solid ${hovered ? card.accent + '30' : '#f3f4f6'}`,
                }}>
                  <card.icon size={21} style={{ color: hovered ? card.accent : '#9ca3af', transition: 'color 0.2s' }} />
                </div>

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: hovered ? '#111827' : '#374151', transition: 'color 0.2s' }}>
                    {card.label}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.desc}
                  </p>
                </div>

                {/* Flecha */}
                <ArrowRight size={15} style={{ color: hovered ? card.accent : '#d1d5db', flexShrink: 0, transition: 'color 0.2s, transform 0.2s', transform: hovered ? 'translateX(2px)' : 'none' }} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}