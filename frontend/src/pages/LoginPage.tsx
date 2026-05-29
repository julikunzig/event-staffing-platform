import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Building2, ArrowRight, ChevronLeft, Globe } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

// Logo kalirio (fondo negro — se muestra sobre panel verde oscuro tal cual)
const LOGO_SRC = 'data:image/jpeg;base64,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'
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