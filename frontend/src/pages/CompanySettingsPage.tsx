import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, AlertCircle } from 'lucide-react'

interface Company {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface WeeklyConfig {
  id: number
  company_id: number
  weekly_hours_limit: number
  min_shift_hours: number
  shift_start_minutes: number
  horas_entre_eventos: number
}

export default function CompanySettingsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [company, setCompany] = useState<Company | null>(null)
  const [config, setConfig] = useState<WeeklyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Formulario de empresa
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  // Formulario de configuración
  const [weeklyHours, setWeeklyHours] = useState('40')
  const [minHours, setMinHours] = useState('0')
  const [minutesBefore, setMinutesBefore] = useState('15')
  const [horasEntreEventos, setHorasEntreEventos] = useState('0')

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.company_id) return
        
        const [compRes, configRes] = await Promise.all([
          api.get<Company>(`/companies/${user.company_id}`),
          api.get<WeeklyConfig>(`/companies/${user.company_id}/weekly-config`).catch(() => null),
        ])

        setCompany(compRes.data)
        setCompanyName(compRes.data.name)
        setCompanyEmail(compRes.data.email || '')
        setCompanyPhone(compRes.data.phone || '')

        if (configRes) {
          setConfig(configRes.data)
          setWeeklyHours(String(configRes.data.weekly_hours_limit))
          setMinHours(String(configRes.data.min_shift_hours))
          setMinutesBefore(String(configRes.data.shift_start_minutes))
          setHorasEntreEventos(String(configRes.data.horas_entre_eventos || 0))
        } else {
          // Si no existe configuración, usar valores por defecto
          setConfig({
            id: 0,
            company_id: user.company_id,
            weekly_hours_limit: 40,
            min_shift_hours: 2,
            shift_start_minutes: 15,
            horas_entre_eventos: 0,
          })
          setWeeklyHours('40')
          setMinHours('2')
          setMinutesBefore('15')
          setHorasEntreEventos('0')
        }
      } catch (e: any) {
        setError(e.response?.data?.detail || t('companySettings.error'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.company_id, t])

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.patch(`/companies/${company.id}`, {
        name: companyName,
        email: companyEmail || null,
        phone: companyPhone || null,
      })
      setSuccess(t('companySettings.saved'))
      setCompany(prev => prev ? { ...prev, name: companyName, email: companyEmail, phone: companyPhone } : null)
    } catch (e: any) {
      setError(e.response?.data?.detail || t('companySettings.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.patch(`/companies/${config.company_id}/weekly-config`, {
        weekly_hours_limit: parseInt(weeklyHours),
        min_shift_hours: parseInt(minHours),
        shift_start_minutes: parseInt(minutesBefore),
        horas_entre_eventos: parseInt(horasEntreEventos),
      })
      setSuccess(t('companySettings.saved'))
    } catch (e: any) {
      setError(e.response?.data?.detail || t('companySettings.error'))
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin(user)) {
    return (
      <div className="max-w-2xl">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700">{t('companySettings.onlyAdminCanEdit')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="text-slate-500">{t('companySettings.loading')}</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{t('companySettings.title')}</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Información de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('companySettings.companyInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="space-y-1">
              <Label>{t('companySettings.companyName')} *</Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t('companySettings.contactEmail')}</Label>
                <Input
                  type="email"
                  value={companyEmail}
                  onChange={e => setCompanyEmail(e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-1">
                <Label>{t('companySettings.contactPhone')}</Label>
                <Input
                  value={companyPhone}
                  onChange={e => setCompanyPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              <Save size={16} />
              {saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Parámetros de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('companySettings.configurationParameters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t('companySettings.weeklyHours')} *</Label>
                <Input
                  type="number"
                  min="0"
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t('companySettings.minHours')} *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={minHours}
                  onChange={e => setMinHours(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t('companySettings.minutesBefore')} *</Label>
                <Input
                  type="number"
                  min="0"
                  value={minutesBefore}
                  onChange={e => setMinutesBefore(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t('companySettings.horasEntreEventos')} *</Label>
                <Input
                  type="number"
                  min="0"
                  value={horasEntreEventos}
                  onChange={e => setHorasEntreEventos(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              <Save size={16} />
              {saving ? t('companySettings.saving') : t('companySettings.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
