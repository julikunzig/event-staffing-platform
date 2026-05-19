import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, Briefcase, BarChart2, Building2, UserCircle, Newspaper } from 'lucide-react'
import { translateRole } from '@/lib/translationHelpers'

interface Company {
  id: number
  name: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.superAdmin') || 'Super Administrador',
    admin: t('roles.admin') || 'Administrador',
    coordinator: t('roles.coordinator') || 'Coordinador',
    employee: t('roles.employee') || 'Empleado',
  }

  const cards = [
    { to: '/events',       label: t('nav.events'),         icon: CalendarDays, desc: t('dashboard.eventsDesc') || 'Ver y gestionar eventos',        show: true,                   bg: '#d1fae5', iconColor: '#059669' },
    { to: '/users',        label: t('nav.users'),         icon: Users,        desc: t('dashboard.usersDesc') || 'Gestionar empleados',            show: isAdmin(user),           bg: '#ede9fe', iconColor: '#7c3aed' },
    { to: '/job-roles',    label: t('nav.roles'),  icon: Briefcase,    desc: t('dashboard.rolesDesc') || 'Configurar roles y tarifas',     show: isAdmin(user),           bg: '#e0f2fe', iconColor: '#0284c7' },
    { to: '/reports',      label: t('nav.reports'),         icon: BarChart2,    desc: t('dashboard.reportsDesc') || 'Ver reportes de horas y pagos',  show: isAdminOrCoord(user),    bg: '#d1fae5', iconColor: '#059669' },
    { to: '/news',         label: t('nav.news'),         icon: Newspaper,    desc: t('dashboard.newsDesc') || 'Gestionar noticias',             show: isAdmin(user),           bg: '#fef08a', iconColor: '#ca8a04' },
    { to: '/company-settings', label: t('nav.myCompany'),  icon: Building2,    desc: t('dashboard.companyDesc') || 'Configuración de empresa',     show: isAdmin(user) && user?.role !== 'super_admin', bg: '#fce7f3', iconColor: '#db2777' },
    { to: '/companies',    label: t('nav.companies'),         icon: Building2,    desc: t('dashboard.companiesDesc') || 'Gestionar empresas',             show: user?.role === 'super_admin', bg: '#fce7f3', iconColor: '#db2777' },
    { to: '/account',      label: t('nav.account'),        icon: UserCircle,   desc: t('dashboard.accountDesc') || 'Perfil, documentos y roles',     show: true,                   bg: '#fef3c7', iconColor: '#d97706' },
  ]

  return (
    <div>
      {/* Banner de bienvenida — Slate oscuro con acento emerald */}
      <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden"
        style={{ background: '#0f172a' }}>
        {/* Círculo decorativo */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15"
          style={{ background: '#10b981' }} />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: '#10b981' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.name ? `${t('dashboard.welcomePrefix')} ${user.name.split(' ')[0]}${t('dashboard.welcomeSuffix')}` : t('dashboard.welcome', { name: 'Usuario' })}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#10b981' }}>
              {translateRole(user?.role || '')} · Event Staffing Platform
            </p>
          </div>
        </div>
      </div>

      {/* Cards de navegación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.filter(c => c.show).map(card => (
          <Link key={card.to} to={card.to}>
            <div className="bg-white rounded-xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              style={{ border: '1px solid #e2e8f0', borderBottom: '3px solid #10b981' }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.bg }}>
                  <card.icon size={22} style={{ color: card.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{card.label}</h3>
                  <p className="text-sm mt-0.5 text-slate-500">{card.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
