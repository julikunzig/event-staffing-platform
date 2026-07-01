import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Save, Settings, Building2, AlertCircle, MessageCircle, CheckCircle2, Trash2 } from 'lucide-react'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 5px', display: 'block',
}

interface Company { id: number; name: string; email: string | null; phone: string | null }
interface WhatsAppSettings { id: number; company_id: number; whatsapp_number: string; is_active: boolean }
interface WeeklyConfig { id: number; company_id: number; weekly_hours_limit: number; min_shift_hours: number; shift_start_minutes: number; horas_entre_eventos: number; admin_can_clock_in_all: boolean; days_to_reject_event: number; geolocation_enabled: boolean; overtime_multiplier: number; week_start_day: string; week_end_day: string }

type Tab = 'empresa' | 'whatsapp' | 'parametros'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const dayLabel = (d: string, t: (k: string) => string) => {
  const map: Record<string,string> = { monday: t('days.monday') || 'Lunes', tuesday: t('days.tuesday') || 'Martes', wednesday: t('days.wednesday') || 'Miércoles', thursday: t('days.thursday') || 'Jueves', friday: t('days.friday') || 'Viernes', saturday: t('days.saturday') || 'Sábado', sunday: t('days.sunday') || 'Domingo' }
  return map[d] ?? d
}

const saveBtn = (loading: boolean, label: string, loadingLabel: string, color = `linear-gradient(135deg,${GREEN_DARK},${GREEN})`): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px',
  borderRadius: '9px', border: 'none', background: color, color: '#fff',
  fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.7 : 1, fontFamily: "'Poppins',sans-serif",
})

export default function CompanySettingsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('empresa')

  const [company, setCompany]   = useState<Company | null>(null)
  const [config, setConfig]     = useState<WeeklyConfig | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const [companyName, setCompanyName]   = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  const [weeklyHours, setWeeklyHours]         = useState('40')
  const [minHours, setMinHours]               = useState('0')
  const [minutesBefore, setMinutesBefore]     = useState('15')
  const [horasEntreEventos, setHorasEntreEventos] = useState('0')
  const [adminCanClockIn, setAdminCanClockIn] = useState(false)
  const [daysToReject, setDaysToReject]       = useState('0')
  const [geoEnabled, setGeoEnabled]           = useState(true)
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.50')
  const [weekStartDay, setWeekStartDay]       = useState('monday')
  const [weekEndDay, setWeekEndDay]           = useState('sunday')

  const [waSettings, setWaSettings] = useState<WhatsAppSettings | null | undefined>(undefined)
  const [waNumber, setWaNumber]     = useState('')
  const [waActive, setWaActive]     = useState(true)
  const [waSaving, setWaSaving]     = useState(false)
  const [waDeleting, setWaDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.company_id == null) return
        const [compRes, configRes, waRes] = await Promise.all([
          api.get<Company>(`/companies/${user.company_id}`),
          api.get<WeeklyConfig>(`/companies/${user.company_id}/weekly-config`).catch(() => null),
          api.get<WhatsAppSettings | null>(`/companies/${user.company_id}/whatsapp-settings`).catch(() => null),
        ])
        if (waRes?.data) {
          setWaSettings(waRes.data)
          setWaNumber(waRes.data.whatsapp_number.replace('whatsapp:', ''))
          setWaActive(waRes.data.is_active)
        } else {
          setWaSettings(null)
        }
        setCompany(compRes.data); setCompanyName(compRes.data.name)
        setCompanyEmail(compRes.data.email || ''); setCompanyPhone(compRes.data.phone || '')
        if (configRes) {
          setConfig(configRes.data)
          setWeeklyHours(String(configRes.data.weekly_hours_limit))
          setMinHours(String(configRes.data.min_shift_hours))
          setMinutesBefore(String(configRes.data.shift_start_minutes))
          setHorasEntreEventos(String(configRes.data.horas_entre_eventos || 0))
          setAdminCanClockIn(configRes.data.admin_can_clock_in_all || false)
          setDaysToReject(String(configRes.data.days_to_reject_event || 0))
          setGeoEnabled(configRes.data.geolocation_enabled !== false)
          setOvertimeMultiplier(String(configRes.data.overtime_multiplier || 1.5))
          setWeekStartDay(configRes.data.week_start_day || 'monday')
          setWeekEndDay(configRes.data.week_end_day || 'sunday')
        }
      } catch (e: any) { setError(e.response?.data?.detail || t('companySettings.error')) }
      finally { setLoading(false) }
    }
    load()
  }, [user?.company_id])

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await api.patch(`/companies/${company!.id}`, { name: companyName, email: companyEmail || null, phone: companyPhone || null })
      setSuccess(t('companySettings.saved'))
    } catch (e: any) { setError(e.response?.data?.detail || t('companySettings.error')) }
    finally { setSaving(false) }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await api.patch(`/companies/${user?.company_id}/weekly-config`, {
        weekly_hours_limit: parseInt(weeklyHours), min_shift_hours: parseInt(minHours),
        shift_start_minutes: parseInt(minutesBefore), horas_entre_eventos: parseInt(horasEntreEventos),
        admin_can_clock_in_all: adminCanClockIn, days_to_reject_event: parseInt(daysToReject),
        geolocation_enabled: geoEnabled, overtime_multiplier: parseFloat(overtimeMultiplier),
        week_start_day: weekStartDay, week_end_day: weekEndDay,
      })
      setSuccess(t('companySettings.saved'))
    } catch (e: any) { setError(e.response?.data?.detail || t('companySettings.error')) }
    finally { setSaving(false) }
  }

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault(); setWaSaving(true); setError(''); setSuccess('')
    try {
      const res = await api.put<WhatsAppSettings>(
        `/companies/${user?.company_id}/whatsapp-settings`,
        { whatsapp_number: waNumber, is_active: waActive }
      )
      setWaSettings(res.data)
      setWaNumber(res.data.whatsapp_number.replace('whatsapp:', ''))
      setSuccess(t('companySettings.saved'))
    } catch (e: any) { setError(e.response?.data?.detail || t('companySettings.error')) }
    finally { setWaSaving(false) }
  }

  const handleDeleteWhatsApp = async () => {
    if (!window.confirm('¿Eliminar configuración de WhatsApp?')) return
    setWaDeleting(true); setError(''); setSuccess('')
    try {
      await api.delete(`/companies/${user?.company_id}/whatsapp-settings`)
      setWaSettings(null); setWaNumber(''); setWaActive(true)
      setSuccess(t('companySettings.saved'))
    } catch (e: any) { setError(e.response?.data?.detail || t('companySettings.error')) }
    finally { setWaDeleting(false) }
  }

  if (!isAdmin(user)) return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', gap: '10px', padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
        <AlertCircle size={18} color="#c2410c" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>{t('companySettings.onlyAdminCanEdit')}</p>
      </div>
    </div>
  )

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'empresa',
      label: t('companySettings.tabCompany', { defaultValue: 'Empresa' }),
      icon: <Building2 size={14} />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={14} />,
      badge: waSettings?.is_active
        ? <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#25d366', display: 'inline-block', marginLeft: '6px' }} />
        : undefined,
    },
    {
      id: 'parametros',
      label: t('companySettings.tabParams', { defaultValue: 'Parámetros' }),
      icon: <Settings size={14} />,
    },
  ]

  return (
    <div style={{ maxWidth: '660px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
        {t('companySettings.title')}
      </h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '8px 12px', borderRadius: '7px', border: 'none',
                background: active ? '#fff' : 'transparent',
                color: active ? '#111827' : '#6b7280',
                fontSize: '12px', fontWeight: active ? 700 : 500,
                cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: active ? (tab.id === 'whatsapp' ? '#25d366' : GREEN) : '#9ca3af' }}>
                {tab.icon}
              </span>
              {tab.label}
              {tab.badge}
            </button>
          )
        })}
      </div>

      {/* Alerts */}
      {error   && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>⚠ {error}</div>}
      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '14px' }}>✓ {success}</div>}

      {/* Tab: Empresa */}
      {activeTab === 'empresa' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '20px' }}>
            <form onSubmit={handleSaveCompany}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>{t('companySettings.companyName')} *</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} required style={fieldStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{t('companySettings.contactEmail')}</label>
                    <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="contact@company.com" style={fieldStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('companySettings.contactPhone')}</label>
                    <input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+1234567890" style={fieldStyle} />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving} style={saveBtn(saving, '', '')}>
                <Save size={14} />{saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: WhatsApp */}
      {activeTab === 'whatsapp' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,#128c7e,#25d366)' }} />
          <div style={{ padding: '20px' }}>
            {waSettings && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                  {t('companySettings.whatsappActive')} {waSettings.whatsapp_number}
                </span>
              </div>
            )}
            <form onSubmit={handleSaveWhatsApp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>{t('companySettings.whatsappNumber')}</label>
                  <input
                    value={waNumber}
                    onChange={e => setWaNumber(e.target.value)}
                    placeholder="+15551234567"
                    required
                    style={fieldStyle}
                  />
                  <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                    {t('companySettings.whatsappHint')}
                  </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={waActive} onChange={e => setWaActive(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#25d366' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{t('companySettings.whatsappEnabled')}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{t('companySettings.whatsappEnabledDesc')}</p>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={waSaving} style={saveBtn(waSaving, '', '', '#25d366')}>
                  <Save size={14} />{waSaving ? t('companySettings.saving') : t('companySettings.saveChanges')}
                </button>
                {waSettings && (
                  <button type="button" onClick={handleDeleteWhatsApp} disabled={waDeleting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '9px', border: '1.5px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: waDeleting ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                    <Trash2 size={14} />{t('common.delete')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Parámetros */}
      {activeTab === 'parametros' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '20px' }}>
            <form onSubmit={handleSaveConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>{t('companySettings.weeklyHours')} *</label>
                  <input type="number" min="0" step="0.01" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.minHours')} *</label>
                  <input type="number" min="0" step="0.01" value={minHours} onChange={e => setMinHours(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.minutesBefore')} *</label>
                  <input type="number" min="0" step="1" value={minutesBefore} onChange={e => setMinutesBefore(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.horasEntreEventos')} *</label>
                  <input type="number" min="0" step="1" value={horasEntreEventos} onChange={e => setHorasEntreEventos(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.daysToReject')} *</label>
                  <input type="number" min="0" step="1" value={daysToReject} onChange={e => setDaysToReject(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.overtimeMultiplier')} *</label>
                  <input type="number" min="0" step="0.01" value={overtimeMultiplier} onChange={e => setOvertimeMultiplier(e.target.value)} required style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.weekStartDay') || 'Día inicio de semana'} *</label>
                  <select value={weekStartDay} onChange={e => setWeekStartDay(e.target.value)} style={fieldStyle}>
                    {DAYS.map(d => <option key={d} value={d}>{dayLabel(d, t)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('companySettings.weekEndDay') || 'Día fin de semana'} *</label>
                  <select value={weekEndDay} onChange={e => setWeekEndDay(e.target.value)} style={fieldStyle}>
                    {DAYS.map(d => <option key={d} value={d}>{dayLabel(d, t)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={geoEnabled} onChange={e => setGeoEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: GREEN }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{t('companySettings.geolocationEnabled') || 'Geolocation enabled'}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{t('companySettings.geolocationDesc') || 'Validate employee location on clock-in'}</p>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={adminCanClockIn} onChange={e => setAdminCanClockIn(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: GREEN }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{t('companySettings.adminClockIn') || 'Admin bulk clock-in'}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{t('companySettings.adminClockInDesc') || 'Allow admin/coordinator to register clock-in for all event employees'}</p>
                  </div>
                </label>
              </div>
              <button type="submit" disabled={saving} style={saveBtn(saving, '', '')}>
                <Save size={14} />{saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
