import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }
interface RoleSlot { job_role_id: number; slots_required: number }

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
]

export default function EventCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [dressCode, setDressCode] = useState('')
  const [roleSlots, setRoleSlots] = useState<RoleSlot[]>([{ job_role_id: 0, slots_required: 1 }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await api.get<JobRole[]>('/job-roles')
        setJobRoles(res.data.filter(r => r.is_active))
      } catch (e) {
        console.error('Error loading job roles:', e)
        setJobRoles([])
      }
    }
    loadRoles()
  }, [])

  // Google Places Autocomplete (si está disponible)
  useEffect(() => {
    const win = window as any
    if (!win.google?.maps?.places || !addressRef.current) return
    const autocomplete = new win.google.maps.places.Autocomplete(addressRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'geometry', 'formatted_address'],
    })
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.address_components) return
      let streetNumber = '', route = '', cityVal = '', stateVal = '', zipVal = ''
      for (const comp of place.address_components) {
        if (comp.types.includes('street_number')) streetNumber = comp.long_name
        if (comp.types.includes('route')) route = comp.long_name
        if (comp.types.includes('locality')) cityVal = comp.long_name
        if (comp.types.includes('administrative_area_level_1')) stateVal = comp.short_name
        if (comp.types.includes('postal_code')) zipVal = comp.long_name
      }
      setAddress(`${streetNumber} ${route}`.trim())
      setCity(cityVal)
      setState(stateVal)
      setZipCode(zipVal)
    })
  }, [])

  const addRole = () => setRoleSlots([...roleSlots, { job_role_id: 0, slots_required: 1 }])
  const removeRole = (i: number) => setRoleSlots(roleSlots.filter((_, idx) => idx !== i))
  const updateRole = (i: number, field: keyof RoleSlot, value: number) => {
    const updated = [...roleSlots]
    updated[i] = { ...updated[i], [field]: value }
    setRoleSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (roleSlots.some(r => r.job_role_id === 0)) { setError(t('forms.selectRoleForRow')); return }
    setLoading(true)
    try {
      await api.post('/events', {
        name, event_date: eventDate, start_time: startTime,
        end_time: endTime || null, address, city: city || null,
        state: state || null, zip_code: zipCode || null,
        dress_code: dressCode || null,
        job_roles: roleSlots,
      })
      navigate('/events')
    } catch (e: any) {
      setError(e.response?.data?.detail || t('forms.errorCreatingEvent'))
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/events')}>
        <ArrowLeft size={16} /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.createEvent')}</CardTitle>
          <p className="text-sm text-slate-500">
            {t('forms.eventCreatedInState')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>{t('forms.eventName')} *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Boda García" />
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
                <Input value={dressCode} onChange={e => setDressCode(e.target.value)} placeholder="Formal" />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-1">
              <Label>{t('events.address')} *</Label>
              <Input ref={addressRef} value={address} onChange={e => setAddress(e.target.value)}
                required placeholder="123 Main St" />
              <p className="text-xs text-slate-400">{t('forms.gpsCoordinatesAutomatic')}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <Label>{t('forms.city')}</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" />
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
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33101" />
              </div>
            </div>

            {/* Roles requeridos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('forms.requiredRoles')} *</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRole} className="gap-1">
                  <Plus size={14} /> {t('forms.addRole')}
                </Button>
              </div>
              {roleSlots.map((slot, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={slot.job_role_id} onChange={e => updateRole(i, 'job_role_id', Number(e.target.value))}
                    className="flex-1 border rounded-md px-3 py-2 text-sm">
                    <option value={0}>{t('forms.selectRole')}</option>
                    {jobRoles.map(r => <option key={r.id} value={r.id}>{r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)</option>)}
                  </select>
                  <Input type="number" min={1} value={slot.slots_required}
                    onChange={e => updateRole(i, 'slots_required', Number(e.target.value))}
                    className="w-20" placeholder={t('forms.slots')} />
                  {roleSlots.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeRole(i)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('forms.createEvent')}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>{t('common.cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
