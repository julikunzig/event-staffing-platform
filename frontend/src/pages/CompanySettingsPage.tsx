import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Save, Settings, Building2, AlertCircle } from 'lucide-react'

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
interface WeeklyConfig { id: number; company_id: number; weekly_hours_limit: number; min_shift_hours: number; shift_start_minutes: number; horas_entre_eventos: number; admin_can_clock_in_all: boolean; days_to_reject_event: number; geolocation_enabled: boolean; overtime_multiplier: number; week_start_day: string; week_end_day: string }

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
      <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}<p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{title}</p>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

export default function CompanySettingsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [company, setCompany]   = useState<Company | null>(null)
  const [config, setConfig]     = useState<WeeklyConfig | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [companyName, setCompanyName]   = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [weeklyHours, setWeeklyHours]   = useState('40')
  const [minHours, setMinHours]         = useState('0')
  const [minutesBefore, setMinutesBefore] = useState('15')
  const [horasEntreEventos, setHorasEntreEventos] = useState('0')
  const [adminCanClockIn, setAdminCanClockIn] = useState(false)
  const [daysToReject, setDaysToReject] = useState('0')
  const [geoEnabled, setGeoEnabled] = useState(true)
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.50')
  const [weekStartDay, setWeekStartDay] = useState('monday')
  const [weekEndDay, setWeekEndDay] = useState('sunday')

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.company_id) return
        const [compRes, configRes] = await Promise.all([
          api.get<Company>(`/companies/${user.company_id}`),
          api.get<WeeklyConfig>(`/companies/${user.company_id}/weekly-config`).catch(() => null),
        ])
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

  if (!isAdmin(user)) return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', gap: '10px', padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
        <AlertCircle size={18} color="#c2410c" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>{t('companySettings.onlyAdminCanEdit')}</p>
      </div>
    </div>
  )

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  return (
    <div style={{ maxWidth: '640px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('companySettings.title')}</h2>

      {error   && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>⚠ {error}</div>}
      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '14px' }}>✓ {success}</div>}

      <Panel icon={<Building2 size={15} color={GREEN} />} title={t('companySettings.companyInfo')}>
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
          <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'Poppins',sans-serif" }}>
            <Save size={14} />{saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
          </button>
        </form>
      </Panel>

      <Panel icon={<Settings size={15} color={GREEN} />} title={t('companySettings.configurationParameters')}>
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
            {/* Week start/end day selectors */}
            <div>
              <label style={labelStyle}>{t('companySettings.weekStartDay') || 'Día inicio de semana'} *</label>
              <select value={weekStartDay} onChange={e => setWeekStartDay(e.target.value)} style={fieldStyle}>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                  <option key={d} value={d}>{d === 'monday' ? (t('days.monday') || 'Lunes') : d === 'tuesday' ? (t('days.tuesday') || 'Martes') : d === 'wednesday' ? (t('days.wednesday') || 'Miércoles') : d === 'thursday' ? (t('days.thursday') || 'Jueves') : d === 'friday' ? (t('days.friday') || 'Viernes') : d === 'saturday' ? (t('days.saturday') || 'Sábado') : (t('days.sunday') || 'Domingo')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('companySettings.weekEndDay') || 'Día fin de semana'} *</label>
              <select value={weekEndDay} onChange={e => setWeekEndDay(e.target.value)} style={fieldStyle}>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                  <option key={d} value={d}>{d === 'monday' ? (t('days.monday') || 'Lunes') : d === 'tuesday' ? (t('days.tuesday') || 'Martes') : d === 'wednesday' ? (t('days.wednesday') || 'Miércoles') : d === 'thursday' ? (t('days.thursday') || 'Jueves') : d === 'friday' ? (t('days.friday') || 'Viernes') : d === 'saturday' ? (t('days.saturday') || 'Sábado') : (t('days.sunday') || 'Domingo')}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Toggle params */}
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
          <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'Poppins',sans-serif" }}>
            <Save size={14} />{saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
          </button>
        </form>
      </Panel>
    </div>
  )
}