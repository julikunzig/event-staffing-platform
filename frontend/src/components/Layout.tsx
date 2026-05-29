import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import {
  CalendarDays, Users, Briefcase, BarChart2, LogOut,
  Home, Building2, KeyRound, UserCircle, Globe,
  Menu, X, Newspaper, ChevronUp, Settings
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import EmployeeChatbot from '@/components/EmployeeChatbot'
import PushNotificationToggle from '@/components/PushNotificationToggle'

const LOGO_SRC = 'data:image/jpeg;base64,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'
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
  ]

  const profileItems = [
    { to: '/profile',         label: t('nav.myShifts'),       icon: CalendarDays },
    { to: '/account',         label: t('nav.profile'),        icon: UserCircle },
    { to: '/change-password', label: t('nav.changePassword'), icon: KeyRound },
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