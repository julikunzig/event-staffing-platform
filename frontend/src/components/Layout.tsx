import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { 
  CalendarDays, 
  Users, 
  Briefcase, 
  BarChart2, 
  LogOut, 
  Home, 
  Building2, 
  KeyRound, 
  UserCircle, 
  Globe,
  Menu,
  X,
  Newspaper,
  ChevronUp
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import EmployeeChatbot from '@/components/EmployeeChatbot'
import PushNotificationToggle from '@/components/PushNotificationToggle'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Cerrar menú móvil al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
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
    { to: '/dashboard', label: t('nav.home'), icon: Home, show: true },
    { to: '/events', label: t('nav.events'), icon: CalendarDays, show: true },
    { to: '/news', label: t('nav.news'), icon: Newspaper, show: true },
    { to: '/companies', label: t('nav.companies'), icon: Building2, show: user?.role === 'super_admin' },
    { to: '/users', label: t('nav.users'), icon: Users, show: isAdmin(user) },
    { to: '/job-roles', label: t('nav.roles'), icon: Briefcase, show: isAdmin(user) },
    { to: '/company-settings', label: t('nav.myCompany'), icon: Building2, show: isAdmin(user) && user?.role !== 'super_admin' },
    { to: '/reports', label: t('nav.reports'), icon: BarChart2, show: isAdminOrCoord(user) || user?.role === 'employee' },
  ]

  const profileItems = [
    { to: '/profile', label: t('nav.myShifts'), icon: CalendarDays, show: true },
    { to: '/account', label: t('nav.profile'), icon: UserCircle, show: true },
    { to: '/change-password', label: t('nav.changePassword'), icon: KeyRound, show: true },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.superAdmin') || 'Super Admin',
    admin: t('roles.admin') || 'Administrador',
    coordinator: t('roles.coordinator') || 'Coordinador',
    employee: t('roles.employee') || 'Empleado',
  }

  // Bottom nav items para móvil (máximo 5)
  const mobileNavItems = navItems.filter(i => i.show).slice(0, 4)
  mobileNavItems.push({ to: '/profile', label: t('nav.myShifts'), icon: CalendarDays, show: true })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header móvil */}
      <header className="lg:hidden sticky top-0 z-50 shadow-sm bg-slate-900 border-b-2 border-teal-500">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 -ml-2 active:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-500">
              <CalendarDays size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-base">Event Staffing</span>
          </div>

          <button 
            onClick={toggleLang}
            className="text-slate-400 hover:text-white p-2 -mr-2 active:bg-white/10 rounded-lg transition-colors"
          >
            <Globe size={20} />
          </button>
        </div>
      </header>

      {/* Header desktop */}
      <header className="hidden lg:block sticky top-0 z-50 shadow-sm bg-slate-900 border-b-2 border-teal-500">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500">
              <CalendarDays size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Event Staffing</span>
              <span className="text-xs ml-2 text-slate-500">Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border-l-2 border-teal-500">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-teal-500 text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">{user?.name || 'Usuario'}</p>
                <p className="text-xs leading-none mt-0.5 text-teal-400">
                  {roleLabels[user?.role || ''] || user?.role}
                </p>
              </div>
            </div>

            <button 
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Globe size={14} />
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={14} />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 shadow-sm bg-slate-900 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {navItems.filter(i => i.show).map(item => {
              const active = isActive(item.to)
              return (
                <Link key={item.to} to={item.to}>
                  <div
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      active 
                        ? 'bg-teal-500 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}

            <div className="pt-3 mt-3 border-t border-slate-700 space-y-1">
              {profileItems.filter(i => i.show).map(item => {
                const active = isActive(item.to)
                return (
                  <Link key={item.to} to={item.to}>
                    <div
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        active 
                          ? 'bg-teal-500 text-white' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Overlay móvil */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar móvil */}
        <aside 
          className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-slate-700 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500">
                  <CalendarDays size={18} className="text-white" />
                </div>
                <span className="font-bold text-white text-lg">Event Staffing</span>
              </div>
              {user && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-teal-500 text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none">{user?.name || 'Usuario'}</p>
                    <p className="text-xs leading-none mt-1 text-teal-400">
                      {roleLabels[user?.role || ''] || user?.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white p-1 -mt-1 -mr-1"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
            {navItems.filter(i => i.show).map(item => {
              const active = isActive(item.to)
              return (
                <Link key={item.to} to={item.to}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-teal-500 text-white' 
                        : 'text-slate-400 active:bg-white/10'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}

            <div className="pt-3 mt-3 border-t border-slate-700 space-y-1">
              {profileItems.filter(i => i.show).map(item => {
                const active = isActive(item.to)
                return (
                  <Link key={item.to} to={item.to}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        active 
                          ? 'bg-teal-500 text-white' 
                          : 'text-slate-400 active:bg-white/10'
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-700 space-y-2">
            <PushNotificationToggle />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 active:bg-red-500/20"
            >
              <LogOut size={18} />
              {t('nav.logout')}
            </button>
          </div>
        </aside>

        {/* Contenido principal con padding para bottom nav en móvil */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6 bg-gray-50">
          {children}
        </main>
      </div>
      {/* Employee AI Chatbot — only for employees */}
      {user && !isAdminOrCoord(user) && <EmployeeChatbot />}

      {/* Bottom Navigation móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] active:bg-gray-100 ${
                  active ? 'text-teal-600' : 'text-gray-500'
                }`}
              >
                <item.icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Menú desplegable para logout y idioma */}
          <div className="relative z-40" ref={menuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] text-gray-500 active:bg-gray-100"
            >
              <ChevronUp className={`w-6 h-6 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              <span className="text-[10px] font-medium leading-none">Más</span>
            </button>
            
            {mobileMenuOpen && (
              <div className="fixed bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 min-w-[160px]">
                <button
                  onClick={() => {
                    toggleLang()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 active:bg-gray-100 transition-colors"
                >
                  <Globe size={16} />
                  <span>{i18n.language === 'es' ? t('common.english') || 'English' : t('common.spanish') || 'Español'}</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
