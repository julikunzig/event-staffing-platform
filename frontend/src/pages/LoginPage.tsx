import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Building2, ArrowRight, ChevronLeft, Globe } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

// Logo kalirio (fondo negro — se muestra sobre panel verde oscuro tal cual)
const LOGO_SRC = 'data:image/png;base64,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'
// Favicon/icono solo la K (para usar como avatar compacto si se necesita)
const ICON_SRC = 'data:image/jpeg;base64,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'

interface Company { id: number; name: string; slug: string }

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [step, setStep] = useState<'email' | 'company' | 'password'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  const [langOpen, setLangOpen] = useState(false)

  const isEn = i18n.language?.startsWith('en')
  const switchLang = (lang: string) => { i18n.changeLanguage(lang); localStorage.setItem('lang', lang); setLangOpen(false) }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.get<Company[]>(`/auth/companies?email=${encodeURIComponent(email)}`)
      if (res.data.length === 0) { setError(t('auth.noCompanies')); return }
      setCompanies(res.data)
      if (res.data.length === 1) { setSelectedCompany(res.data[0].id); setStep('password') }
      else setStep('company')
    } catch { setError(t('auth.errorSearchingCompanies')) }
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
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.invalidCredentials'))
      setPassword('')
    } finally { setLoading(false) }
  }

  // Verde corporativo Kalimas: #2db84b
  const GREEN = '#2db84b'
  const GREEN_DARK = '#1e9038'
  const GREEN_LIGHT = '#4dce68'

  const stats = [
    { num: '99%', labelEs: 'Disponibilidad', labelEn: 'Uptime',      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { num: '10x',  labelEs: 'Más rápido',    labelEn: 'Faster',       icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg> },
    { num: '360°', labelEs: 'Control total', labelEn: 'Full control', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/></svg> },
    { num: '24/7', labelEs: 'Soporte',       labelEn: 'Support',      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  ]

  const features = [
    { es: 'Crea y publica eventos fácilmente',   en: 'Create and publish events easily',    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg> },
    { es: 'Gestiona tu equipo de trabajo',        en: 'Manage your work team',               icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg> },
    { es: 'Control de turnos y pagos automático', en: 'Automatic shift & payment control',   icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { es: 'Reportes detallados en tiempo real',   en: 'Detailed real-time reports',          icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={GREEN_LIGHT} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg> },
  ]

  const Spinner = () => (
    <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )



  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Poppins',sans-serif", background:'#f5f7f5' }}>

      {/* ══════════════════════════════
          PANEL IZQUIERDO — verde corp
      ══════════════════════════════ */}
      <div className="lg-panel" style={{
        width:'52%', flexDirection:'column', padding:'2.75rem 3.5rem',
        position:'relative', overflow:'hidden', display:'none',
        background:`linear-gradient(155deg, #111827 0%, #1a1d1e 35%, #1f2937 65%, #111827 100%)`,
      }}>
        {/* Orbes decorativos */}
        <div style={{ position:'absolute', top:'-120px', right:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, rgba(45,184,75,0.12) 0%, transparent 65%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:'380px', height:'380px', borderRadius:'50%', background:'rgba(0,0,0,0.2)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', left:'60%', width:'200px', height:'200px', borderRadius:'50%', background:`radial-gradient(circle, rgba(45,184,75,0.08) 0%, transparent 70%)`, pointerEvents:'none' }} />
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize:'26px 26px', pointerEvents:'none' }} />



        {/* Hero */}
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:'1.75rem' }}>

          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', padding:'5px 14px', borderRadius:'999px', display:'inline-block', width:'fit-content' }}>
            {isEn ? 'Management Platform' : 'Plataforma de Gestión'}
          </span>

          <div>
            <h1 style={{ fontSize:'3rem', fontWeight:800, lineHeight:1.1, color:'#fff', margin:0, marginBottom:'1rem' }}>
              {isEn
                ? <>Events that<br /><span style={{ color:GREEN_LIGHT }}>work</span><br />perfectly.</>
                : <>Eventos que<br /><span style={{ color:GREEN_LIGHT }}>funcionan</span><br />a la perfección.</>}
            </h1>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.9rem', lineHeight:1.6, margin:0 }}>
              {isEn ? 'Manage your team, shifts and payments from one place.' : 'Gestiona tu equipo, turnos y pagos desde un solo lugar.'}
            </p>
          </div>

          {/* Stats 2×2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem' }}>
            {stats.map((s, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  background: hoveredStat===i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                  border: hoveredStat===i ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter:'blur(8px)', borderRadius:'1rem', padding:'1rem 1.1rem',
                  display:'flex', alignItems:'center', gap:'0.75rem',
                  transition:'all 0.2s', cursor:'default',
                  transform: hoveredStat===i ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredStat===i ? '0 8px 24px rgba(0,0,0,0.25)' : 'none',
                }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'10px', flexShrink:0, background: hoveredStat===i ? 'rgba(77,206,104,0.2)' : 'rgba(77,206,104,0.1)', border:'1px solid rgba(77,206,104,0.2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color: hoveredStat===i ? GREEN_LIGHT : '#fff', lineHeight:1, transition:'color 0.2s' }}>{s.num}</p>
                  <p style={{ margin:0, fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{isEn ? s.labelEn : s.labelEs}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:'30px', height:'30px', borderRadius:'8px', flexShrink:0, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)' }}>{isEn ? f.en : f.es}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ height:'1px', flex:1, background:`linear-gradient(90deg,${GREEN},transparent)` }} />
            <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'0.15em', textTransform:'uppercase' }}>KALIMAS GROUP</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          PANEL DERECHO — blanco
      ══════════════════════════════ */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', background:'#f4f6f4' }}>

        {/* Tint verde suave top */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'400px', height:'150px', pointerEvents:'none', background:`radial-gradient(ellipse,rgba(45,184,75,0.07) 0%,transparent 70%)` }} />

        {/* Selector idioma */}
        <div style={{ position:'absolute', top:'1.25rem', right:'1.25rem', zIndex:20 }}>
          <button onClick={() => setLangOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 13px', borderRadius:'9px', border:'1px solid #d1d5db', background:'#fff', color:'#6b7280', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", boxShadow:'0 1px 3px rgba(0,0,0,0.07)' }}>
            <Globe size={14}/><span>{isEn?'EN':'ES'}</span>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {langOpen && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:10 }} onClick={() => setLangOpen(false)} />
              <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', minWidth:'140px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', zIndex:30 }}>
                {[{code:'es',flag:'🇨🇴',label:'Español'},{code:'en',flag:'🇺🇸',label:'English'}].map(l => (
                  <button key={l.code} onClick={() => switchLang(l.code)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:'9px', padding:'10px 14px', background:(isEn?'en':'es')===l.code?'#f0fdf4':'transparent', border:'none', cursor:'pointer', fontSize:'13px', fontFamily:"'Poppins',sans-serif", color:(isEn?'en':'es')===l.code?GREEN:'#6b7280' }}>
                    <span style={{ fontSize:'16px' }}>{l.flag}</span><span>{l.label}</span>
                    {(isEn?'en':'es')===l.code && <svg style={{ marginLeft:'auto' }} width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={GREEN} strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:1 }}>

          {/* Logo — siempre visible encima del formulario */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'2rem' }}>
            <img src={LOGO_SRC} alt="Kalirio" style={{ height:'85px', width:'auto', borderRadius:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)' }} />
          </div>

          {/* Card */}
          <div style={{ background:'#fff', borderRadius:'1.5rem', overflow:'hidden', boxShadow:'0 4px 6px rgba(0,0,0,0.04),0 20px 50px rgba(0,0,0,0.08)', border:'1px solid #e8ede8' }}>
            <div style={{ height:'3px', background:`linear-gradient(90deg,${GREEN_DARK},${GREEN},${GREEN_LIGHT})` }} />
            <div style={{ padding:'2.25rem' }}>

              <div style={{ marginBottom:'1.75rem' }}>
                <h2 style={{ margin:0, fontSize:'1.6rem', fontWeight:700, color:'#111827' }}>{isEn?'Welcome back':'Bienvenido'}</h2>
                <p style={{ margin:'5px 0 0', fontSize:'13.5px', color:'#9ca3af' }}>{isEn?'Sign in to your account to continue':'Ingresa a tu cuenta para continuar'}</p>
              </div>

              {/* EMAIL */}
              {step==='email' && (
                <form onSubmit={handleEmailSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9ca3af', marginBottom:'7px' }}>{t('auth.email')}</label>
                    <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="tu@email.com"
                      style={{ height:'46px', background:'#f9fafb', border:'1.5px solid #e5e7eb', color:'#111827', borderRadius:'0.75rem', fontSize:'14px' }}/>
                  </div>
                  {error && <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 13px', borderRadius:'10px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'13px' }}>⚠ {error}</div>}
                  <button type="submit" disabled={loading}
                    style={{ width:'100%', height:'46px', borderRadius:'0.875rem', border:'none', background:`linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color:'#fff', fontWeight:700, fontSize:'14px', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 4px 14px rgba(45,184,75,0.35)`, transition:'all 0.2s' }}
                    onMouseEnter={e=>{if(!loading){(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 6px 22px rgba(45,184,75,0.5)`;(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 4px 14px rgba(45,184,75,0.35)`;(e.currentTarget as HTMLButtonElement).style.transform='none'}}>
                    {loading?<><Spinner/>{isEn?'Searching...':'Buscando...'}</>:<><span>{t('auth.continue')}</span><ArrowRight size={15}/></>}
                  </button>
                  <p style={{ textAlign:'center', fontSize:'13px', margin:0, color:'#9ca3af' }}>
                    <Link to="/forgot-password" style={{ color:GREEN, fontWeight:600, textDecoration:'none' }}>{t('auth.forgotPassword')}</Link>
                  </p>
                </form>
              )}

              {/* COMPANY */}
              {step==='company' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9ca3af', margin:'0 0 .5rem' }}>{t('auth.selectCompany')}</p>
                  {companies.map(c=>(
                    <button key={c.id} onClick={()=>{setSelectedCompany(c.id);setStep('password')}}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderRadius:'12px', border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=GREEN;(e.currentTarget as HTMLElement).style.background='#f0fdf4'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e5e7eb';(e.currentTarget as HTMLElement).style.background='#f9fafb'}}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'10px', flexShrink:0, background:'#dcfce7', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Building2 size={17} color={GREEN}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontWeight:600, fontSize:'13.5px', color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                        <p style={{ margin:0, fontSize:'11px', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.slug}</p>
                      </div>
                      <ArrowRight size={14} color={GREEN}/>
                    </button>
                  ))}
                  <button onClick={()=>setStep('email')}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', fontSize:'13px', color:'#9ca3af', background:'none', border:'none', cursor:'pointer', marginTop:'4px' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#374151'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9ca3af'}>
                    <ChevronLeft size={14}/>{t('common.back')}
                  </button>
                </div>
              )}

              {/* PASSWORD */}
              {step==='password' && (
                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderRadius:'10px', background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                    <Building2 size={15} color={GREEN}/>
                    <span style={{ fontSize:'13.5px', fontWeight:600, color:GREEN_DARK }}>{companies.find(c=>c.id===selectedCompany)?.name}</span>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9ca3af', marginBottom:'7px' }}>{t('auth.password')}</label>
                    <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"/>
                  </div>
                  {error && <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 13px', borderRadius:'10px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'13px' }}>⚠ {error}</div>}
                  <button type="submit" disabled={loading}
                    style={{ width:'100%', height:'46px', borderRadius:'0.875rem', border:'none', background:`linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color:'#fff', fontWeight:700, fontSize:'14px', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 4px 14px rgba(45,184,75,0.35)`, transition:'all 0.2s' }}
                    onMouseEnter={e=>{if(!loading){(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 6px 22px rgba(45,184,75,0.5)`;(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 4px 14px rgba(45,184,75,0.35)`;(e.currentTarget as HTMLButtonElement).style.transform='none'}}>
                    {loading?<><Spinner/>{t('auth.loggingIn')}</>:<><span>{t('auth.login')}</span><ArrowRight size={15}/></>}
                  </button>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px' }}>
                    <button type="button" onClick={()=>setStep('company')}
                      style={{ display:'flex', alignItems:'center', gap:'4px', color:'#9ca3af', background:'none', border:'none', cursor:'pointer' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#374151'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9ca3af'}>
                      <ChevronLeft size={14}/>{t('common.back')}
                    </button>
                    <Link to="/forgot-password" style={{ color:GREEN, fontWeight:600, textDecoration:'none' }}>{t('auth.forgotPassword')}</Link>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:'11.5px', marginTop:'1.5rem', color:'#c3c8c3' }}>
            © 2026 Kalirio · Kalimas Group. {isEn?'All rights reserved.':'Todos los derechos reservados.'}
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
          .lg-logo-hide { display: none !important; }
        }
      `}</style>
    </div>
  )
}