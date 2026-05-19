import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Users, Plus, RefreshCw } from 'lucide-react'
import { translateEventStatus } from '@/lib/translationHelpers'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

interface Event {
  id: number; name: string; event_date: string; start_time: string; end_time: string | null
  address: string; city: string | null; state: string | null; zip_code: string | null
  dress_code: string | null; status: string; is_public: boolean
}
interface EventJobRole { id: number; job_role_id: number; slots_required: number; slots_filled: number; slots_pending?: number }
interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }

const EVENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created:        { label: 'Creado',                     color: 'bg-slate-100 text-slate-700' },
  published:      { label: 'Publicado',                  color: 'bg-blue-100 text-blue-700' },
  filled_pending: { label: 'Llenado - Pend. Aprobación', color: 'bg-amber-100 text-amber-700' },
  filled:         { label: 'Llenado Aprobado',           color: 'bg-emerald-100 text-emerald-700' },
  started:        { label: 'Iniciado',                   color: 'bg-yellow-100 text-yellow-700' },
  finished:       { label: 'Finalizado',                 color: 'bg-teal-100 text-teal-700' },
  cancelled:      { label: 'Cancelado',                  color: 'bg-red-100 text-red-700' },
}

export default function EventEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRoles, setSavingRoles] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Datos del evento
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [dressCode, setDressCode] = useState('')
  const [eventStatus, setEventStatus] = useState('')

  // Roles del evento
  const [eventRoles, setEventRoles] = useState<EventJobRole[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [roleSlots, setRoleSlots] = useState<Record<number, number>>({})

  // Agregar nuevo rol
  const [newRoleId, setNewRoleId] = useState<number>(0)
  const [newRoleSlots, setNewRoleSlots] = useState<number>(1)
  const [addingRole, setAddingRole] = useState(false)

  // Carga completa del evento + roles
  const loadAll = async () => {
    try {
      const [evRes, rolesRes, jrRes] = await Promise.all([
        api.get<Event>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
        api.get<JobRole[]>('/job-roles'),
      ])
      const e = evRes.data
      setName(e.name)
      setEventDate(e.event_date)
      setStartTime(e.start_time)
      setEndTime(e.end_time || '')
      setAddress(e.address)
      setCity(e.city || '')
      setState(e.state || '')
      setZipCode(e.zip_code || '')
      setDressCode(e.dress_code || '')
      setEventStatus(e.status)
      setEventRoles(rolesRes.data)
      setJobRoles(jrRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)
    } catch {
      navigate('/events')
    }
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false))
  }, [id])

  // Guardar info general del evento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const evRes = await api.patch<Event>(`/events/${id}`, {
        name: name || undefined,
        event_date: eventDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || null,
        address: address || undefined,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        dress_code: dressCode || null,
      })
      // Actualizar estado del evento desde la respuesta
      setEventStatus(evRes.data.status)
      setSuccess(t('common.success'))
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  // Guardar cupos de roles existentes + recargar evento completo
  const handleSaveRoles = async () => {
    setSavingRoles(true); setError(''); setSuccess('')
    try {
      // Guardar todos los cupos modificados en paralelo
      await Promise.all(
        eventRoles.map(er => {
          const newSlots = roleSlots[er.job_role_id] ?? er.slots_required
          if (newSlots === er.slots_required) return Promise.resolve() // sin cambio
          return api.patch(`/events/${id}/job-roles/${er.job_role_id}/slots`, {
            slots_required: newSlots,
          })
        })
      )

      // Recargar evento completo para obtener el nuevo estado y roles actualizados
      const [evRes, rolesRes] = await Promise.all([
        api.get<Event>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
      ])

      setEventStatus(evRes.data.status)
      setEventRoles(rolesRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)

      setSuccess(t('common.success'))
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setSavingRoles(false)
    }
  }

  // Agregar nuevo rol + recargar evento completo
  const handleAddRole = async () => {
    if (!newRoleId) return
    setSavingRoles(true); setError(''); setSuccess('')
    try {
      await api.post(`/events/${id}/job-roles`, {
        job_role_id: newRoleId,
        slots_required: newRoleSlots,
      })

      // Recargar evento completo para obtener el nuevo estado
      const [evRes, rolesRes] = await Promise.all([
        api.get<Event>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
      ])

      setEventStatus(evRes.data.status)
      setEventRoles(rolesRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)

      setNewRoleId(0)
      setNewRoleSlots(1)
      setAddingRole(false)

      setSuccess(t('common.success'))
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setSavingRoles(false)
    }
  }

  const getRoleName = (roleId: number) => jobRoles.find(r => r.id === roleId)?.name || `Rol #${roleId}`
  const availableRoles = jobRoles.filter(r => r.is_active && !eventRoles.some(er => er.job_role_id === r.id))

  const statusInfo = EVENT_STATUS_LABELS[eventStatus] || { label: eventStatus, color: 'bg-slate-100 text-slate-700' }
  const translatedStatusLabel = translateEventStatus(eventStatus)

  if (loading) return <p className="text-slate-500">{t('common.loading')}</p>

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="ghost" className="gap-2" onClick={() => navigate(`/events/${id}`)}>
        <ArrowLeft size={16} /> {t('common.back')}
      </Button>

      {/* Info del evento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('forms.editEvent')}</CardTitle>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
              {translatedStatusLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>{t('forms.eventName')} *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t('forms.eventDate')} *</Label>
                <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>{t('forms.startTime')} *</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>{t('forms.endTime')}</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('forms.dressCode')}</Label>
                <Input value={dressCode} onChange={e => setDressCode(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t('events.address')} *</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <Label>{t('forms.city')}</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('forms.state')}</Label>
                <select value={state} onChange={e => setState(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">{t('forms.selectState')}</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>{t('forms.zipCode')}</Label>
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button type="submit" disabled={saving} className="gap-2">
              <Save size={14} /> {saving ? t('common.loading') : t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cupos por rol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users size={16} /> {t('forms.slots')}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Modifica los cupos requeridos. Al guardar, el estado del evento se recalcula automáticamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventRoles.length === 0 && (
            <p className="text-sm text-slate-500">{t('common.noData')}</p>
          )}

          {eventRoles.map(er => {
            const currentSlots = roleSlots[er.job_role_id] ?? er.slots_required
            const changed = currentSlots !== er.slots_required
            const pending = er.slots_pending || 0

            return (
              <div key={er.job_role_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${changed ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{getRoleName(er.job_role_id)}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                    <span>✅ {t('common.active')}: <strong>{er.slots_filled}</strong></span>
                    {pending > 0 && <span>⏳ {t('events.assignmentStatus.pending')}: <strong>{pending}</strong></span>}
                    <span>📋 {t('forms.slots')}: <strong>{er.slots_required}</strong></span>
                  </div>
                  {changed && (
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      {t('common.update')}: {er.slots_required} → {currentSlots}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Label className="text-xs text-slate-600 whitespace-nowrap">{t('forms.slots')}:</Label>
                  <Input
                    type="number"
                    min={er.slots_filled}
                    value={currentSlots}
                    onChange={e => setRoleSlots(prev => ({
                      ...prev,
                      [er.job_role_id]: Math.max(er.slots_filled, Number(e.target.value))
                    }))}
                    className="w-20 text-center"
                  />
                </div>
              </div>
            )
          })}

          {/* Mensajes de error/éxito para roles */}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <Button
            onClick={handleSaveRoles}
            disabled={savingRoles}
            className="gap-2"
          >
            {savingRoles
              ? <><RefreshCw size={14} className="animate-spin" /> {t('common.loading')}</>
              : <><Save size={14} /> {t('common.save')}</>
            }
          </Button>

          {/* Agregar nuevo rol */}
          {availableRoles.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              {!addingRole ? (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddingRole(true)}>
                  <Plus size={14} /> {t('forms.addRole')}
                </Button>
              ) : (
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">{t('forms.addRole')}</p>
                  <div className="flex gap-2 items-center flex-wrap">
                    <select
                      value={newRoleId}
                      onChange={e => setNewRoleId(Number(e.target.value))}
                      className="flex-1 border rounded-md px-3 py-2 text-sm min-w-40"
                    >
                      <option value={0}>{t('forms.selectRole')}</option>
                      {availableRoles.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs whitespace-nowrap">{t('forms.slots')}:</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newRoleSlots}
                        onChange={e => setNewRoleSlots(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center"
                      />
                    </div>
                    <Button size="sm" onClick={handleAddRole} disabled={savingRoles || !newRoleId} className="gap-1">
                      {savingRoles ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                      {t('forms.addRole')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingRole(false); setNewRoleId(0); setNewRoleSlots(1) }}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
