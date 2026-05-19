import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, Building2, ArrowRight, ChevronLeft } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

interface Company { id: number; name: string; slug: string }

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [step, setStep] = useState<'email' | 'company' | 'password'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.get<Company[]>(`/auth/companies?email=${encodeURIComponent(email)}`)
      if (res.data.length === 0) { setError('No se encontraron empresas para este email'); return }
      setCompanies(res.data)
      if (res.data.length === 1) { setSelectedCompany(res.data[0].id); setStep('password') }
      else setStep('company')
    } catch { setError('Error al buscar empresas') }
    finally { setLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany) return
    setError(''); setLoading(true)
    try {
      const res = await api.post<{ access_token: string }>('/auth/login', { email, password, company_id: selectedCompany })
      login(res.data.access_token)
      navigate('/dashboard')
    } catch (e: any) {
      const detail = e.response?.data?.detail || 'Error al iniciar sesión'
      // Mostrar el mensaje del backend directamente (ya diferencia usuario/contraseña)
      setError(detail)
      // Limpiar el campo de contraseña para que el usuario la ingrese de nuevo
      setPassword('')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Panel izquierdo — branding Slate & Emerald */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden"
        style={{ background: '#0f172a' }}>
        {/* Círculo decorativo emerald */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#10b981' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: '#10b981' }} />

        <div className="max-w-md relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: '#10b981' }}>
            <CalendarDays size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Event Staffing<br />Platform
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748b' }}>
            Gestiona eventos, personal y turnos de forma eficiente.
          </p>
          <div className="space-y-4">
            {[
              { icon: '📅', text: 'Crea y publica eventos fácilmente' },
              { icon: '👥', text: 'Gestiona tu equipo de trabajo' },
              { icon: '⏱️', text: 'Control de turnos y pagos automático' },
              { icon: '📊', text: 'Reportes detallados en tiempo real' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3" style={{ color: '#94a3b8' }}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
          {/* Línea decorativa emerald */}
          <div className="mt-10 h-1 w-24 rounded-full" style={{ background: '#10b981' }} />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8"
            style={{ border: '1px solid #e2e8f0', borderBottom: '4px solid #10b981' }}>
            {/* Logo mobile */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#10b981' }}>
                <CalendarDays size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">Event Staffing</span>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-slate-900">Bienvenido</h2>
            <p className="text-sm mb-6 text-slate-500">Ingresa a tu cuenta para continuar</p>

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="tu@email.com" className="h-11" />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 disabled:opacity-60 text-white"
                  style={{ background: '#10b981' }}>
                  {loading ? 'Buscando...' : <><span>Continuar</span><ArrowRight size={16} /></>}
                </button>
                <p className="text-center text-sm text-slate-500">
                  <Link to="/forgot-password" className="font-semibold" style={{ color: '#059669' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </form>
            )}

            {step === 'company' && (
              <div className="space-y-3">
                <p className="text-sm mb-4 text-slate-500">Selecciona tu empresa:</p>
                {companies.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCompany(c.id); setStep('password') }}
                    className="w-full flex items-center gap-3 p-3 border-2 rounded-xl text-left transition-all hover:border-emerald-400 hover:bg-emerald-50"
                    style={{ borderColor: '#e2e8f0' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#d1fae5' }}>
                      <Building2 size={18} style={{ color: '#059669' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.slug}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 ml-auto" />
                  </button>
                ))}
                <button onClick={() => setStep('email')}
                  className="w-full flex items-center justify-center gap-1 text-sm mt-2 text-slate-500 hover:text-slate-700">
                  <ChevronLeft size={14} /> Volver
                </button>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-2"
                  style={{ background: '#d1fae5', borderLeft: '3px solid #10b981' }}>
                  <Building2 size={16} style={{ color: '#059669' }} />
                  <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                    {companies.find(c => c.id === selectedCompany)?.name}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label>Contraseña</Label>
                  <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••" />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 disabled:opacity-60 text-white"
                  style={{ background: '#10b981' }}>
                  {loading ? 'Ingresando...' : <><span>Ingresar</span><ArrowRight size={16} /></>}
                </button>
                <div className="flex justify-between text-sm">
                  <button type="button" onClick={() => setStep('company')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
                    <ChevronLeft size={14} /> Volver
                  </button>
                  <Link to="/forgot-password" className="font-semibold" style={{ color: '#059669' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
            )}
          </div>
          <p className="text-center text-xs mt-6 text-slate-400">
            © 2026 Event Staffing Platform. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
