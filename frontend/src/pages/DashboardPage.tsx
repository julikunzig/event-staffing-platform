import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, Briefcase, BarChart2, Building2, UserCircle, Newspaper, ArrowRight, Settings, TrendingUp, Clock, DollarSign, Activity, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import WhatsAppConnectBanner from '@/components/WhatsAppConnectBanner'
import EmployeeDashboardPage from '@/pages/EmployeeDashboardPage'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

// ─── Interfaces ───────────────────────────────────────────────────────────────
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

interface ChartData {
  events_by_month:   { month: string; count: number; revenue: number }[]
  payroll_by_month:  { month: string; total: number }[]
  cost_by_role:      { role: string; total: number; hours: number }[]
  top_employees:     { name: string; total_pay: number; events: number; role: string }[]
  biggest_events:    { name: string; staff_count: number; total_pay: number; date: string }[]
}

// ─── Mini SVG Charts ──────────────────────────────────────────────────────────

function BarChart({ data, color = GREEN, height = 80 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1)
  const w = 100 / data.length
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const barH = (v / max) * (height - 8)
        const x = i * w + w * 0.15
        const barW = w * 0.7
        return (
          <g key={i}>
            <rect x={x} y={height - barH - 4} width={barW} height={barH} rx="2"
              fill={color} opacity={0.15} />
            <rect x={x} y={height - Math.max(barH * 0.4, 2) - 4} width={barW} height={Math.max(barH * 0.4, 2)} rx="2"
              fill={color} opacity={0.85} />
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data, color = GREEN, height = 80 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = 6
  const w = data.length > 1 ? (100 - pad * 2) / (data.length - 1) : 100
  const pts = data.map((v, i) => {
    const x = pad + i * w
    const y = pad + ((max - v) / range) * (height - pad * 2)
    return `${x},${y}`
  })
  const area = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(' ')} L ${pad + (data.length - 1) * w},${height} L ${pad},${height} Z`
  const line = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(' ')}`
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace('#','')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      })}
    </svg>
  )
}

function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const r = 40; const cx = 50; const cy = 50; const stroke = 14
  let cumAngle = -90
  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 360
    const start = cumAngle
    cumAngle += angle
    const startRad = (start * Math.PI) / 180
    const endRad   = ((start + angle) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const large = angle > 180 ? 1 : 0
    return { ...seg, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, angle }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {arcs.map((arc, i) => arc.angle > 1 && (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#9ca3af">total</text>
    </svg>
  )
}

function HorizontalBar({ value, max, color, label, sublabel }: { value: number; max: number; color: string; label: string; sublabel: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{label}</span>
        <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>{sublabel}</span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bg, trend }: {
  label: string; value: string | number; sub?: string
  icon: any; color: string; bg: string; trend?: 'up' | 'down' | 'flat'
}) {
  const TrendIcon = trend === 'up' ? ChevronUp : trend === 'down' ? ChevronDown : Minus
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#9ca3af'
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '14px 14px 0 0', opacity: 0.8 }} />
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}25` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827', lineHeight: 1.1, fontFamily: "'Poppins',sans-serif" }}>{value}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>{label}</p>
        {sub && <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#9ca3af' }}>{sub}</p>}
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px', borderRadius: '99px', background: trend === 'up' ? '#f0fdf4' : trend === 'down' ? '#fef2f2' : '#f9fafb' }}>
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: trendColor }}>vs last</span>
        </div>
      )}
    </div>
  )
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, minHeight = 180 }: { title: string; subtitle?: string; children: React.ReactNode; minHeight?: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', minHeight }}>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: "'Poppins',sans-serif" }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    created:       { bg: '#f3f4f6', color: '#6b7280',  label: 'Created' },
    published:     { bg: '#dbeafe', color: '#1d4ed8',  label: 'Published' },
    filled_pending:{ bg: '#fef3c7', color: '#92400e',  label: 'Filled Pend.' },
    filled:        { bg: '#dcfce7', color: '#15803d',  label: 'Filled' },
    started:       { bg: '#fef9c3', color: '#854d0e',  label: 'Started' },
    finished:      { bg: '#ccfbf1', color: '#0f766e',  label: 'Finished' },
    cancelled:     { bg: '#fee2e2', color: '#dc2626',  label: 'Cancelled' },
  }
  const s = map[status] || map.created
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }    = useAuth()
  const { t, i18n } = useTranslation()
  const lang        = i18n.language || 'es'

  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [dashboard, setDashboard]     = useState<DashboardData | null>(null)
  const [charts, setCharts]           = useState<ChartData | null>(null)
  const [activeTab, setActiveTab]     = useState<'dashboard' | 'quickaccess'>('dashboard')

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(r => setDashboard(r.data)).catch(() => {})
    api.get<ChartData>('/dashboard/charts').then(r => setCharts(r.data)).catch(() => {})
  }, [])

  const firstName   = user?.name?.split(' ')[0] || 'Usuario'
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.superAdmin') || 'Super Administrador',
    admin:       t('roles.admin')      || 'Administrador',
    coordinator: t('roles.coordinator')|| 'Coordinador',
    employee:    t('roles.employee')   || 'Empleado',
  }

  const hour = new Date().getHours()
  const greeting = hour < 12
    ? (t('dashboard.goodMorning')   || '¡Buenos días')
    : hour < 18
    ? (t('dashboard.goodAfternoon') || '¡Buenas tardes')
    : (t('dashboard.goodEvening')   || '¡Buenas noches')

  const cards = [
    { to: '/events',           label: t('nav.events'),                     icon: CalendarDays, desc: t('dashboard.eventsDesc')    || 'Ver y gestionar eventos',           show: true,                                             accent: '#2db84b', bg: '#f0fdf4', iconBg: '#dcfce7' },
    { to: '/users',            label: t('nav.users'),                      icon: Users,        desc: t('dashboard.usersDesc')     || 'Gestionar empleados',               show: isAdmin(user),                                    accent: '#7c3aed', bg: '#faf5ff', iconBg: '#ede9fe' },
    { to: '/job-roles',        label: t('nav.roles'),                      icon: Briefcase,    desc: t('dashboard.rolesDesc')     || 'Configurar roles y tarifas',        show: isAdmin(user),                                    accent: '#0284c7', bg: '#f0f9ff', iconBg: '#e0f2fe' },
    { to: '/reports',          label: t('nav.reports'),                    icon: BarChart2,    desc: t('dashboard.reportsDesc')   || 'Ver reportes de horas y pagos',     show: isAdminOrCoord(user) || user?.role === 'employee', accent: '#d97706', bg: '#fffbeb', iconBg: '#fef3c7' },
    { to: '/news',             label: t('nav.news'),                       icon: Newspaper,    desc: t('dashboard.newsDesc')      || 'Gestionar noticias',                show: isAdmin(user),                                    accent: '#db2777', bg: '#fdf2f8', iconBg: '#fce7f3' },
    { to: '/company-settings', label: t('nav.myCompany'),                  icon: Settings,     desc: t('dashboard.companyDesc')   || 'Configuración de empresa',          show: isAdmin(user) && user?.role !== 'super_admin',     accent: '#0891b2', bg: '#ecfeff', iconBg: '#cffafe' },
    { to: '/companies',        label: t('nav.companies'),                  icon: Building2,    desc: t('dashboard.companiesDesc') || 'Gestionar empresas',                show: user?.role === 'super_admin',                     accent: '#db2777', bg: '#fdf2f8', iconBg: '#fce7f3' },
    { to: '/account',          label: t('nav.account') || 'Mi Cuenta',     icon: UserCircle,   desc: t('dashboard.accountDesc')   || 'Perfil, documentos y roles',        show: true,                                             accent: '#ea580c', bg: '#fff7ed', iconBg: '#ffedd5' },
  ].filter(c => c.show)

  const showCharts = isAdmin(user) || isAdminOrCoord(user)

  // ─── Derived chart data ────────────────────────────────────────────────────
  const evByMonth     = charts?.events_by_month    || []
  const payByMonth    = charts?.payroll_by_month   || []
  const costByRole    = charts?.cost_by_role       || []
  const topEmployees  = charts?.top_employees      || []
  const biggestEvents = charts?.biggest_events     || []

  const maxPay     = Math.max(...topEmployees.map(e => e.total_pay), 1)
  const maxCost    = Math.max(...costByRole.map(r => r.total), 1)
  const maxStaff   = Math.max(...biggestEvents.map(e => e.staff_count), 1)

  const ROLE_COLORS = ['#2db84b','#3b82f6','#f59e0b','#7c3aed','#ef4444','#0891b2','#db2777','#ea580c','#10b981','#6366f1']

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ══ BANNER ══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '1.5rem', borderRadius: '1.25rem', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1a1d1e 0%, #1f2937 50%, #111827 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,184,75,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff', boxShadow: `0 4px 14px rgba(45,184,75,0.4)` }}>
              {userInitial}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{greeting},</p>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{firstName}<span style={{ color: GREEN }}>!</span></h1>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: GREEN, fontWeight: 500 }}>
                {roleLabels[user?.role || ''] || user?.role}{user?.company_name ? ` · ${user.company_name}` : ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            {/* Kalirio brand badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>Kalirio</span>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: 'rgba(45,184,75,0.2)', color: GREEN, border: '1px solid rgba(45,184,75,0.3)' }}>v2.0</span>
            </div>
            {dashboard && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {[
                  { label: lang === 'en' ? 'Total Events' : 'Total Eventos', value: dashboard.total_events_all_time },
                  { label: lang === 'en' ? 'Employees' : 'Empleados',        value: dashboard.total_employees },
                  { label: lang === 'en' ? 'In Progress' : 'En progreso',    value: dashboard.events_in_progress },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN}, transparent)` }} />
      </div>

      {/* ══ WHATSAPP CONNECT ════════════════════════════════════════════════ */}
      <WhatsAppConnectBanner />

      {/* ══ TABS ════════════════════════════════════════════════════════════ */}
      {showCharts && <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: '#f3f4f6', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {[
          { key: 'dashboard',   label: lang === 'en' ? '📊 Dashboard'     : '📊 Dashboard' },
          { key: 'quickaccess', label: lang === 'en' ? '⚡ Quick Access'  : '⚡ Accesos Rápidos' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{ padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color:      activeTab === tab.key ? '#111827' : '#6b7280',
              boxShadow:  activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {tab.label}
          </button>
        ))}
      </div>}

      {/* ══ TAB: QUICK ACCESS ═══════════════════════════════════════════════ */}
      {(!showCharts || activeTab === 'quickaccess') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {cards.map(card => {
            const hovered = hoveredCard === card.to
            return (
              <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                <div onMouseEnter={() => setHoveredCard(card.to)} onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: '#fff', border: `1px solid ${hovered ? card.accent + '40' : '#e5e7eb'}`, borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', transform: hovered ? 'translateY(-3px)' : 'none', boxShadow: hovered ? `0 8px 24px ${card.accent}18` : '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: hovered ? card.accent : 'transparent', borderRadius: '3px 0 0 3px', transition: 'background 0.2s' }} />
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0, background: hovered ? card.iconBg : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', border: `1px solid ${hovered ? card.accent + '30' : '#f3f4f6'}` }}>
                    <card.icon size={21} style={{ color: hovered ? card.accent : '#9ca3af', transition: 'color 0.2s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: hovered ? '#111827' : '#374151', transition: 'color 0.2s' }}>{card.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.desc}</p>
                  </div>
                  <ArrowRight size={15} style={{ color: hovered ? card.accent : '#d1d5db', flexShrink: 0, transition: 'color 0.2s, transform 0.2s', transform: hovered ? 'translateX(2px)' : 'none' }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ══ EMPLOYEE ACTIONS PANEL (embedded in dashboard) ════════════════ */}
      {user?.role === 'employee' && <EmployeeDashboardPage />}

      {/* ══ TAB: DASHBOARD ══════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div style={{ maxWidth: '1400px' }}>
          {/* ── KPIs ── */}
          {dashboard && showCharts && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 220px))', gap: '0.75rem', marginBottom: '1.25rem', maxWidth: '1400px' }}>
              <KpiCard label={t('dashboard.eventsMonth')     || 'Eventos del mes'}       value={dashboard.events_this_month}              icon={CalendarDays} color="#2db84b" bg="#f0fdf4"   trend="up" />
              <KpiCard label={t('dashboard.eventsUpcoming')  || 'Próximos'}              value={dashboard.events_upcoming}               icon={TrendingUp}   color="#3b82f6" bg="#eff6ff"   trend="up" />
              <KpiCard label={t('dashboard.eventsCompleted') || 'Completados'}           value={dashboard.events_completed}              icon={Activity}     color="#10b981" bg="#ecfdf5"   trend="flat" />
              <KpiCard label={t('dashboard.staffAssigned')   || 'Personal asignado'}     value={dashboard.total_staff_assigned}          icon={Users}        color="#7c3aed" bg="#faf5ff"   trend="up" />
              <KpiCard label={t('dashboard.hoursWorked')     || 'Horas trabajadas'}      value={`${dashboard.total_hours_worked.toLocaleString()}h`} icon={Clock} color="#f59e0b" bg="#fffbeb" trend="up" />
              <KpiCard label={t('dashboard.totalPay')        || 'Total nómina'}          value={`$${dashboard.total_pay.toLocaleString()}`} icon={DollarSign} color="#ef4444" bg="#fef2f2" sub="este mes" trend="up" />
            </div>
          )}

          {/* ── Próximos eventos (si no hay charts aún) ── */}
          {dashboard && !charts && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {dashboard.next_events.length > 0 && (
                <ChartCard title={`📅 ${t('dashboard.nextEvents') || 'Próximos eventos'}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dashboard.next_events.map(ev => (
                      <Link key={ev.id} to={`/events`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#111827' }}>{ev.name}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{ev.event_date} · {ev.start_time}</p>
                          </div>
                          <StatusPill status={ev.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </ChartCard>
              )}
              {dashboard.staff_by_role.length > 0 && (
                <ChartCard title={`👥 ${t('dashboard.staffByRole') || 'Personal por rol'}`}>
                  {(() => {
                    const total = dashboard.staff_by_role.reduce((s, r) => s + r.count, 0)
                    return dashboard.staff_by_role.map((r, i) => (
                      <HorizontalBar key={i} value={r.count} max={total} color={ROLE_COLORS[i % ROLE_COLORS.length]} label={r.role_name} sublabel={`${r.count}`} />
                    ))
                  })()}
                </ChartCard>
              )}
            </div>
          )}

          {/* ══ CHARTS GRID ═════════════════════════════════════════════════ */}
          {charts && showCharts && (
            <>
              {/* Row 1: Eventos en el tiempo + Nómina mensual */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>

                {/* Eventos por mes */}
                {evByMonth.length > 0 && (
                  <ChartCard title="📈 Eventos en el tiempo" subtitle="Cantidad de eventos por mes" minHeight={220}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px', paddingBottom: '4px' }}>
                      {evByMonth.map((m, i) => {
                        const maxC = Math.max(...evByMonth.map(x => x.count), 1)
                        const h = Math.max((m.count / maxC) * 100, 4)
                        // show year only when month is Jan or first item
                        const parts = m.month.split(' ')
                        const mon = parts[0]
                        const yr  = parts[1]
                        const showYear = mon === 'Jan' || i === 0
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: '#374151', minHeight: '12px' }}>{m.count || ''}</span>
                            <div style={{ width: '100%', height: `${h}px`, background: `linear-gradient(180deg, ${GREEN}, ${GREEN_DARK})`, borderRadius: '4px 4px 2px 2px', transition: 'height 0.4s ease', minHeight: '4px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
                              <span style={{ fontSize: '8px', color: '#6b7280', whiteSpace: 'nowrap' }}>{mon}</span>
                              {showYear && <span style={{ fontSize: '7px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{yr}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                      <span>Total: <strong style={{ color: '#111827' }}>{evByMonth.reduce((s, m) => s + m.count, 0)} eventos</strong></span>
                      <span>Pico: <strong style={{ color: GREEN }}>{Math.max(...evByMonth.map(m => m.count))}</strong></span>
                    </div>
                  </ChartCard>
                )}

                {/* Nómina mensual */}
                {payByMonth.length > 0 && (
                  <ChartCard title="💰 Costo de nómina mensual" subtitle="Total pagado por mes (USD)" minHeight={220}>
                    <div style={{ height: '120px' }}>
                      <LineChart data={payByMonth.map(m => m.total)} color="#3b82f6" height={110} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '6px' }}>
                      {payByMonth.slice(-6).map((m, i) => (
                        <div key={i} style={{ flexShrink: 0, textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '9px', color: '#9ca3af' }}>{m.month.slice(0, 3)}</p>
                          <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#374151' }}>${(m.total / 1000).toFixed(1)}k</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                      Total: <strong style={{ color: '#111827' }}>${payByMonth.reduce((s, m) => s + m.total, 0).toLocaleString()}</strong>
                    </div>
                  </ChartCard>
                )}
              </div>

              {/* Row 2: Costo por rol (donut) + Top empleados */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>

                {/* Costo por rol */}
                {costByRole.length > 0 && (
                  <ChartCard title="🎯 Costo por rol" subtitle="Distribución del gasto en nómina">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ flexShrink: 0 }}>
                        <DonutChart size={110} segments={costByRole.map((r, i) => ({ value: r.total, color: ROLE_COLORS[i % ROLE_COLORS.length], label: r.role }))} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {costByRole.slice(0, 6).map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: ROLE_COLORS[i % ROLE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.role}</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', flexShrink: 0 }}>${(r.total / 1000).toFixed(1)}k</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>
                )}

                {/* Top 10 empleados */}
                {topEmployees.length > 0 && (
                  <ChartCard title="🏆 Top empleados por ingresos" subtitle={`Top ${topEmployees.length} — acumulado histórico`}>
                    <div>
                      {topEmployees.slice(0, 8).map((e, i) => (
                        <HorizontalBar key={i} value={e.total_pay} max={maxPay}
                          color={i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : GREEN}
                          label={`${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${e.name}`}
                          sublabel={`$${e.total_pay.toLocaleString()} · ${e.events} ev`} />
                      ))}
                    </div>
                  </ChartCard>
                )}
              </div>

              {/* Row 3: Eventos más grandes + Próximos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>

                {/* Eventos más grandes */}
                {biggestEvents.length > 0 && (
                  <ChartCard title="🎪 Eventos más grandes" subtitle="Por cantidad de personal asignado">
                    <div>
                      {biggestEvents.slice(0, 6).map((ev, i) => (
                        <HorizontalBar key={i} value={ev.staff_count} max={maxStaff}
                          color={ROLE_COLORS[i % ROLE_COLORS.length]}
                          label={ev.name}
                          sublabel={`${ev.staff_count} staff · $${(ev.total_pay / 1000).toFixed(1)}k`} />
                      ))}
                    </div>
                  </ChartCard>
                )}

                {/* Próximos eventos */}
                {dashboard?.next_events && dashboard.next_events.length > 0 && (
                  <ChartCard title="📅 Próximos eventos" subtitle="Eventos publicados y confirmados">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dashboard.next_events.slice(0, 5).map(ev => (
                        <Link key={ev.id} to={`/events`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</p>
                              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{ev.event_date} · {ev.start_time}</p>
                            </div>
                            <StatusPill status={ev.status} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ChartCard>
                )}

                {/* Staff por rol como barras */}
                {dashboard?.staff_by_role && dashboard.staff_by_role.length > 0 && (
                  <ChartCard title="👥 Personal por rol" subtitle="Asignaciones del mes actual">
                    {(() => {
                      const total = dashboard.staff_by_role.reduce((s, r) => s + r.count, 0)
                      return (
                        <>
                          {dashboard.staff_by_role.map((r, i) => (
                            <HorizontalBar key={i} value={r.count} max={total} color={ROLE_COLORS[i % ROLE_COLORS.length]} label={r.role_name} sublabel={`${r.count} (${Math.round(r.count / total * 100)}%)`} />
                          ))}
                        </>
                      )
                    })()}
                  </ChartCard>
                )}
              </div>
            </>
          )}

          {/* ── Loading charts placeholder ── */}
          {!charts && showCharts && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid #e5e7eb`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}