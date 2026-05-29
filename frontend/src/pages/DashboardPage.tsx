import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, Briefcase, BarChart2, Building2, UserCircle, Newspaper, ArrowRight, Settings } from 'lucide-react'
import { translateRole } from '@/lib/translationHelpers'
import { useState } from 'react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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