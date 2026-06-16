import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import {
  CalendarDays, Users, Briefcase, BarChart2, LogOut,
  Home, Building2, KeyRound, UserCircle, Globe,
  Menu, X, Newspaper, ChevronUp, Settings, HelpCircle, DollarSign
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import EmployeeChatbot from '@/components/EmployeeChatbot'
import PushNotificationToggle from '@/components/PushNotificationToggle'

const LOGO_SRC = 'data:image/png;base64,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'
const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const handleLogout = () => { logout(); navigate('/login') }
  const toggleLang = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(newLang)
    localStorage.setItem('lang', newLang)
  }

  const navItems = [
    { to: '/dashboard',        label: t('nav.home'),      icon: Home,         show: true },
    { to: '/events',           label: t('nav.events'),    icon: CalendarDays, show: true },
    { to: '/news',             label: t('nav.news'),      icon: Newspaper,    show: true },
    { to: '/companies',        label: t('nav.companies'), icon: Building2,    show: user?.role === 'super_admin' },
    { to: '/users',            label: t('nav.users'),     icon: Users,        show: isAdmin(user) },
    { to: '/job-roles',        label: t('nav.roles'),     icon: Briefcase,    show: isAdmin(user) },
    { to: '/company-settings', label: t('nav.myCompany'), icon: Settings,     show: isAdmin(user) && user?.role !== 'super_admin' },
    { to: '/reports',          label: t('nav.reports'),   icon: BarChart2,    show: isAdminOrCoord(user) || user?.role === 'employee' },
    { to: '/payroll',          label: t('nav.payroll'),   icon: DollarSign,   show: isAdmin(user) },
  ]

  const profileItems = [
    { to: '/profile',         label: t('nav.myShifts'),       icon: CalendarDays },
    { to: '/account',         label: t('nav.profile'),        icon: UserCircle },
    { to: '/change-password', label: t('nav.changePassword'), icon: KeyRound },
    { to: '/help',            label: t('nav.help'),           icon: HelpCircle },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.superAdmin') || 'Super Admin',
    admin:       t('roles.admin')      || 'Administrador',
    coordinator: t('roles.coordinator')|| 'Coordinador',
    employee:    t('roles.employee')   || 'Empleado',
  }

  const mobileNavItems = [...navItems.filter(i => i.show).slice(0, 4),
    { to: '/profile', label: t('nav.myShifts'), icon: CalendarDays, show: true }]

  const NavItem = ({ item, size = 17 }: { item: typeof navItems[0]; size?: number }) => {
    const active = isActive(item.to)
    return (
      <Link to={item.to} style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, fontFamily: "'Poppins',sans-serif",
            transition: 'all 0.15s',
            background: active ? 'rgba(45,184,75,0.15)' : 'transparent',
            color: active ? GREEN : 'rgba(255,255,255,0.55)',
            borderLeft: active ? `3px solid ${GREEN}` : '3px solid transparent',
          }}
          onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = 'rgba(255,255,255,0.9)' }}}
          onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'rgba(255,255,255,0.55)' }}}>
          <item.icon size={size} />
          <span>{item.label}</span>
        </div>
      </Link>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f4', fontFamily: "'Poppins',sans-serif" }}>

      {/* ── HEADER MOBILE ── */}
      {!isDesktop && (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1a1d1e', borderBottom: `2px solid ${GREEN}`, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>
              <Menu size={22} />
            </button>
            <img src={LOGO_SRC} alt="Kalirio" style={{ height: '32px', width: 'auto', borderRadius: '6px' }} />
            <button onClick={toggleLang} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={16} /><span>{i18n.language === 'es' ? 'EN' : 'ES'}</span>
            </button>
          </div>
        </header>
      )}

      {/* ── HEADER DESKTOP ── */}
      {isDesktop && (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1a1d1e', borderBottom: `2px solid ${GREEN}`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px' }}>
            <img src={LOGO_SRC} alt="Kalirio" style={{ height: '36px', width: 'auto', borderRadius: '8px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {userInitial}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{user?.name || 'Usuario'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: GREEN, lineHeight: 1.2 }}>{roleLabels[user?.role || ''] || user?.role}</p>
                </div>
              </div>
              <button onClick={toggleLang}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.1)'; el.style.color = '#fff' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = 'rgba(255,255,255,0.6)' }}>
                <Globe size={14} />{i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'}>
                <LogOut size={14} />{t('nav.logout')}
              </button>
            </div>
          </div>
        </header>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR DESKTOP ── */}
        {isDesktop && (
          <aside style={{ width: '220px', flexShrink: 0, background: '#111827', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <nav style={{ padding: '16px 10px', flex: 1 }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', marginBottom: '6px', margin: '0 0 6px' }}>
                {i18n.language === 'es' ? 'Menú' : 'Menu'}
              </p>
              {navItems.filter(i => i.show).map(item => <NavItem key={item.to} item={item} />)}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', margin: '0 0 6px' }}>
                  {i18n.language === 'es' ? 'Perfil' : 'Profile'}
                </p>
                {profileItems.map(item => <NavItem key={item.to} item={{ ...item, show: true }} />)}
              </div>
            </nav>
            <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'}>
                <LogOut size={16} />{t('nav.logout')}
              </button>
            </div>
          </aside>
        )}

        {/* Overlay móvil */}
        {sidebarOpen && !isDesktop && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR MÓVIL (drawer) ── */}
        {!isDesktop && (
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
            background: '#111827', zIndex: 50, display: 'flex', flexDirection: 'column',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            boxShadow: sidebarOpen ? '4px 0 30px rgba(0,0,0,0.4)' : 'none',
          }}>
            <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <img src={LOGO_SRC} alt="Kalirio" style={{ height: '36px', width: 'auto', borderRadius: '8px', marginBottom: '14px' }} />
                {user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                      {userInitial}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{user?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: GREEN }}>{roleLabels[user?.role || ''] || user?.role}</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', alignSelf: 'flex-start' }}>
                <X size={22} />
              </button>
            </div>
            <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
              {navItems.filter(i => i.show).map(item => <NavItem key={item.to} item={item} size={18} />)}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {profileItems.map(item => <NavItem key={item.to} item={{ ...item, show: true }} size={18} />)}
              </div>
            </nav>
            <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PushNotificationToggle />
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '10px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                <LogOut size={17} />{t('nav.logout')}
              </button>
            </div>
          </aside>
        )}

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: isDesktop ? '24px' : '16px',
          paddingBottom: isDesktop ? '24px' : '80px',
          background: '#f4f6f4'
        }}>
          {children}
        </main>
      </div>

      {user && !isAdminOrCoord(user) && <EmployeeChatbot />}

      {/* ── BOTTOM NAV MÓVIL ── */}
      {!isDesktop && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', zIndex: 30, boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 8px' }}>
            {mobileNavItems.map(item => {
              const active = isActive(item.to)
              return (
                <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.15s', color: active ? GREEN : '#9ca3af', minWidth: '56px' }}>
                    <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                    <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
                    {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: GREEN }} />}
                  </div>
                </Link>
              )
            })}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', minWidth: '56px' }}>
                <ChevronUp size={22} style={{ transition: 'transform 0.2s', transform: mobileMenuOpen ? 'rotate(180deg)' : 'none' }} />
                <span style={{ fontSize: '10px' }}>{i18n.language === 'es' ? 'Más' : 'More'}</span>
              </button>
              {mobileMenuOpen && (
                <div style={{ position: 'fixed', bottom: '72px', right: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', minWidth: '170px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 50 }}>
                  <button onClick={() => { toggleLang(); setMobileMenuOpen(false) }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', fontSize: '13px', color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                    <Globe size={16} color={GREEN} />{i18n.language === 'es' ? 'English' : 'Español'}
                  </button>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                    <LogOut size={16} />{t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}