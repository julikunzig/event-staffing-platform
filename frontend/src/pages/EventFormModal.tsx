import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { X, Plus, Trash2, FileText, Info, Users, Link as LinkIcon, Save, RefreshCw, ChevronDown } from 'lucide-react'
import ConfirmDialog from '@/pages/ConfirmDialog'
import { translateEventStatus } from '@/lib/translationHelpers'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

interface JobRole      { id: number; name: string; hourly_rate: string; is_active: boolean }
interface RoleSlot     { job_role_id: number; slots_required: number; hourly_rate_override?: number | null; start_time?: string }
interface EventJobRole { id: number; job_role_id: number; slots_required: number; slots_filled: number; slots_pending?: number; hourly_rate_override?: string | null; start_time?: string | null }
interface Coordinator  { user_id: number; name: string; email: string }
interface EventDocument{ id: number; name: string; url: string; created_at: string }
interface PendingDoc   { name: string; url: string }

interface Props {
  mode: 'create' | 'edit'
  eventId?: number
  onClose: () => void
  onSuccess: () => void
}

// ── Shared field row ─────────────────────────────────────────────────────────
const FieldGroup = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{hint}</p>}
  </div>
)

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const selectStyle: React.CSSProperties = {
  ...fieldStyle, cursor: 'pointer', appearance: 'none',
}

export default function EventFormModal({ mode, eventId, onClose, onSuccess }: Props) {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info')

  // ── Fields ──
  const [name, setName]           = useState('')
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [address, setAddress]     = useState('')
  const [city, setCity]           = useState('')
  const [state, setState]         = useState('')
  const [zipCode, setZipCode]     = useState('')
  const [dressCode, setDressCode] = useState('')
  const [notes, setNotes]         = useState('')
  const [eventStatus, setEventStatus] = useState('')

  // ── Roles ──
  const [jobRoles, setJobRoles]       = useState<JobRole[]>([])
  const [roleSlots, setRoleSlots]     = useState<RoleSlot[]>([{ job_role_id: 0, slots_required: 1 }])
  const [eventRoles, setEventRoles]   = useState<EventJobRole[]>([])
  const [roleSlotsEdit, setRoleSlotsEdit] = useState<Record<number, number>>({})
  const [roleRatesEdit, setRoleRatesEdit] = useState<Record<number, string>>({})  // {job_role_id: "25.00"}
  const [roleTimesEdit, setRoleTimesEdit] = useState<Record<number, string>>({})  // {event_job_role_id: "15:00"}
  const [newRoleId, setNewRoleId]     = useState(0)
  const [newRoleSlots, setNewRoleSlots] = useState(1)
  const [addingRole, setAddingRole]   = useState(false)
  const [savingRole, setSavingRole]   = useState(false)

  // ── Coordinators ──
  const [allCoords, setAllCoords]           = useState<Coordinator[]>([])
  const [selectedCoordIds, setSelectedCoordIds] = useState<number[]>([])

  // ── Documents ──
  const [documents, setDocuments]   = useState<EventDocument[]>([])
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([])
  const [docName, setDocName]       = useState('')
  const [docUrl, setDocUrl]         = useState('')
  const [addingDoc, setAddingDoc]   = useState(false)

  // ── State ──
  const [loading, setLoading]           = useState(mode === 'edit')
  const [saving, setSaving]             = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [error, setError]               = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null)
  const [success, setSuccess]           = useState('')
  const addressRef = useRef<HTMLInputElement>(null)

  // ── Load data ──
  useEffect(() => {
    const loadRolesAndCoords = () => Promise.all([
      api.get<JobRole[]>('/job-roles'),
      api.get<Coordinator[]>('/events/company-coordinators').catch(() => ({ data: [] as Coordinator[] })),
    ])

    if (mode === 'create') {
      loadRolesAndCoords().then(([rRes, cRes]) => {
        setJobRoles(rRes.data.filter(r => r.is_active))
        setAllCoords((cRes as any).data)
      })
    } else if (mode === 'edit' && eventId) {
      Promise.all([
        api.get<any>(`/events/${eventId}`),
        api.get<EventJobRole[]>(`/events/${eventId}/job-roles`),
        api.get<JobRole[]>('/job-roles'),
        api.get<Coordinator[]>('/events/company-coordinators').catch(() => ({ data: [] as Coordinator[] })),
        api.get<Coordinator[]>(`/events/${eventId}/coordinators`).catch(() => ({ data: [] as Coordinator[] })),
        api.get<EventDocument[]>(`/events/${eventId}/documents`).catch(() => ({ data: [] as EventDocument[] })),
      ]).then(([evRes, erRes, jrRes, acRes, ecRes, docsRes]) => {
        const e = evRes.data
        setName(e.name); setEventDate(e.event_date); setStartTime(e.start_time)
        setEndTime(e.end_time || ''); setAddress(e.address); setCity(e.city || '')
        setState(e.state || ''); setZipCode(e.zip_code || '')
        setDressCode(e.dress_code || ''); setNotes(e.notes || ''); setEventStatus(e.status)
        setEventRoles(erRes.data); setJobRoles(jrRes.data)
        const slots: Record<number, number> = {}
        const rates: Record<number, string> = {}
        const times: Record<number, string> = {}
        erRes.data.forEach((r: EventJobRole) => { slots[r.id] = r.slots_required; if (r.hourly_rate_override) rates[r.id] = r.hourly_rate_override; if (r.start_time) times[r.id] = r.start_time.substring(0, 5) })
        setRoleSlotsEdit(slots)
        setRoleRatesEdit(rates)
        setRoleTimesEdit(times)
        setAllCoords((acRes as any).data)
        setSelectedCoordIds(((ecRes as any).data as Coordinator[]).map((c: Coordinator) => c.user_id))
        setDocuments((docsRes as any).data)
      }).finally(() => setLoading(false))
    }
  }, [mode, eventId])

  // ── Google autocomplete ──
  useEffect(() => {
    const win = window as any
    if (!win.google?.maps?.places || !addressRef.current) return
    const ac = new win.google.maps.places.Autocomplete(addressRef.current, { fields: ['address_components'] })
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.address_components) return
      let sn = '', rt = '', cv = '', sv = '', zv = ''
      for (const c of place.address_components) {
        if (c.types.includes('street_number')) sn = c.long_name
        if (c.types.includes('route')) rt = c.long_name
        if (c.types.includes('locality')) cv = c.long_name
        if (c.types.includes('administrative_area_level_1')) sv = c.short_name
        if (c.types.includes('postal_code')) zv = c.long_name
      }
      setAddress(`${sn} ${rt}`.trim()); setCity(cv); setState(sv); setZipCode(zv)
    })
  }, [loading])

  // ── Handlers create ──
  const addRoleRow    = () => setRoleSlots([...roleSlots, { job_role_id: 0, slots_required: 1 }])
  const removeRoleRow = (i: number) => setRoleSlots(roleSlots.filter((_, idx) => idx !== i))
  const updateRoleRow = (i: number, f: keyof RoleSlot, v: number) => {
    const u = [...roleSlots]; u[i] = { ...u[i], [f]: v }; setRoleSlots(u)
  }

  // ── Handlers edit ──
  const handleAddRole = async () => {
    if (!newRoleId) return
    setSavingRole(true); setError('')
    try {
      await api.post(`/events/${eventId}/job-roles`, { job_role_id: newRoleId, slots_required: newRoleSlots })
      const [evUp, erRes] = await Promise.all([api.get<any>(`/events/${eventId}`), api.get<EventJobRole[]>(`/events/${eventId}/job-roles`)])
      setEventStatus(evUp.data.status); setEventRoles(erRes.data)
      const slots: Record<number, number> = {}; erRes.data.forEach((r: EventJobRole) => { slots[r.id] = r.slots_required })
      setRoleSlotsEdit(slots); setNewRoleId(0); setNewRoleSlots(1); setAddingRole(false)
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
    finally { setSavingRole(false) }
  }

  // ── Coordinators ──
  const toggleCoord = (id: number) => setSelectedCoordIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  // ── Documents ──
  const addPendingDoc = () => {
    if (!docName.trim() || !docUrl.trim()) return
    setPendingDocs([...pendingDocs, { name: docName.trim(), url: docUrl.trim() }])
    setDocName(''); setDocUrl('')
  }
  const removePendingDoc = (i: number) => setPendingDocs(pendingDocs.filter((_, idx) => idx !== i))

  const handleAddDocument = async () => {
    if (!docName.trim() || !docUrl.trim()) return
    setAddingDoc(true); setError('')
    try {
      const res = await api.post<EventDocument>(`/events/${eventId}/documents`, { name: docName.trim(), url: docUrl.trim() })
      setDocuments(prev => [...prev, res.data]); setDocName(''); setDocUrl('')
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
    finally { setAddingDoc(false) }
  }

  const handleDeleteDocument = async (docId: number) => {
    setConfirmDialog({
      title: t('events.confirmDeleteDocument') || '¿Eliminar documento?',
      message: 'El documento será eliminado permanentemente.',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await api.delete(`/events/${eventId}/documents/${docId}`)
          setDocuments(prev => prev.filter(d => d.id !== docId))
        } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
      }
    })
  }

  // ── AI notes ──
  const generateNotes = async () => {
    setGeneratingNotes(true); setError('')
    try {
      const roles = mode === 'create'
        ? roleSlots.filter(r => r.job_role_id !== 0).map(r => ({ name: jobRoles.find(jr => jr.id === r.job_role_id)?.name || '', slots: r.slots_required }))
        : eventRoles.map(er => ({ name: jobRoles.find(r => r.id === er.job_role_id)?.name || '', slots: er.slots_required }))
      const res = await api.post<{ notes: string }>('/ai/generate-notes', {
        event_name: name || 'Evento', event_date: eventDate, start_time: startTime,
        address, city, state, dress_code: dressCode || null,
        language: i18n.language === 'en' ? 'en' : 'es', roles,
      })
      setNotes(res.data.notes)
    } catch (e: any) { setError(e.response?.data?.detail || 'Error generando notas con IA') }
    finally { setGeneratingNotes(false) }
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (mode === 'create' && roleSlots.some(r => r.job_role_id === 0)) { setError(t('forms.selectRoleForRow')); return }
    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await api.post<{ id: number }>('/events', {
          name, event_date: eventDate, start_time: startTime, end_time: endTime || null,
          address, city: city || null, state: state || null, zip_code: zipCode || null,
          dress_code: dressCode || null, job_roles: roleSlots.map(s => ({
            ...s,
            start_time: s.start_time || startTime || null,
          })),
        })
        const eid = res.data.id
        await Promise.all([
          notes.trim() ? api.patch(`/events/${eid}/notes`, { notes: notes.trim() }) : Promise.resolve(),
          selectedCoordIds.length > 0 ? api.put(`/events/${eid}/coordinators`, { user_ids: selectedCoordIds }) : Promise.resolve(),
          ...pendingDocs.map(d => api.post(`/events/${eid}/documents`, { name: d.name, url: d.url })),
        ])
        onSuccess()
      } else {
        await api.patch(`/events/${eventId}`, {
          name, event_date: eventDate, start_time: startTime, end_time: endTime || null,
          address, city: city || null, state: state || null, zip_code: zipCode || null,
          dress_code: dressCode || null,
        })
        await Promise.all([
          ...eventRoles.map(er => {
            const ns = roleSlotsEdit[er.id] ?? er.slots_required
            return ns === er.slots_required ? Promise.resolve() : api.patch(`/events/${eventId}/job-roles/${er.job_role_id}/slots`, { slots_required: ns })
          }),
          ...eventRoles.map(er => {
            const newRate = roleRatesEdit[er.id]
            const newTime = roleTimesEdit[er.id]
            const currentRate = er.hourly_rate_override || ''
            const currentTime = er.start_time ? er.start_time.substring(0, 5) : ''
            const rateChanged = (newRate ?? currentRate) !== currentRate
            const timeChanged = (newTime ?? currentTime) !== currentTime
            if (!rateChanged && !timeChanged) return Promise.resolve()
            const rateValue = (newRate !== undefined && newRate !== '' && parseFloat(newRate) > 0) ? parseFloat(newRate) : null
            const timeValue = (newTime !== undefined && newTime !== '') ? newTime : null
            return api.patch(`/events/${eventId}/job-roles/${er.id}/rate`, { hourly_rate_override: rateValue, start_time: timeValue })
          }),
          api.put(`/events/${eventId}/coordinators`, { user_ids: selectedCoordIds }),
          api.patch(`/events/${eventId}/notes`, { notes: notes || null }),
        ])
        setSuccess(t('common.success'))
        setTimeout(() => onSuccess(), 800)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || (mode === 'create' ? t('forms.errorCreatingEvent') : t('forms.errorEditingEvent')))
    } finally { setSaving(false) }
  }

  const getRoleName = (roleId: number) => jobRoles.find(r => r.id === roleId)?.name || `Rol #${roleId}`
  const getRoleRate = (roleId: number) => jobRoles.find(r => r.id === roleId)?.hourly_rate || '0'
  const availableRoles = jobRoles.filter(r => r.is_active && !eventRoles.some(er => er.job_role_id === r.id))

  const statusColors: Record<string, { bg: string; color: string }> = {
    created:        { bg: '#f3f4f6', color: '#6b7280' },
    published:      { bg: '#eff6ff', color: '#1d4ed8' },
    filled_pending: { bg: '#fffbeb', color: '#b45309' },
    filled:         { bg: '#f0fdf4', color: '#15803d' },
    started:        { bg: '#fefce8', color: '#854d0e' },
    finished:       { bg: '#f0fdfa', color: '#0f766e' },
    cancelled:      { bg: '#fef2f2', color: '#dc2626' },
  }

  const tabs = [
    { key: 'info' as const,      label: t('events.tabInfo'),      icon: <Info size={14} /> },
    { key: 'documents' as const, label: t('events.tabDocuments'), icon: <FileText size={14} /> },
  ]

  return (
    <>
      {/* ── Overlay ── */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 50 }}
        onClick={onClose} />

      {/* ── Modal / Drawer ── */}
      <div style={{
        position: 'fixed', zIndex: 51, // @ts-ignore
        "data-event-modal": "",
        // Desktop: centered modal
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: '640px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: '1.25rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        fontFamily: "'Poppins',sans-serif",
      }} onClick={e => e.stopPropagation()}>

        {/* Top accent */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN})`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              {mode === 'create' ? t('forms.createEvent') : t('forms.editEvent')}
            </h2>
            {mode === 'edit' && eventStatus && (() => {
              const sc = statusColors[eventStatus] || { bg: '#f3f4f6', color: '#6b7280' }
              return (
                <span style={{ background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '999px', border: `1px solid ${sc.color}22` }}>
                  {translateEventStatus(eventStatus)}
                </span>
              )
            })()}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#9ca3af' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f6'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '10px 20px 0', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px',
                borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s',
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? GREEN : '#9ca3af',
                borderBottom: activeTab === tab.key ? `2px solid ${GREEN}` : '2px solid transparent',
              }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `3px solid #e5e7eb`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>

              {/* ══ TAB INFO ══ */}
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Nombre */}
                  <FieldGroup label={t('forms.eventName')} required>
                    <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="Boda García" />
                  </FieldGroup>

                  {/* Fecha + Hora */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FieldGroup label={t('forms.eventDate')} required>
                      <input type="date" style={fieldStyle} value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    </FieldGroup>
                    <FieldGroup label={t('forms.startTime')} required>
                      <input type="time" style={fieldStyle} value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </FieldGroup>
                    <FieldGroup label={t('forms.endTime')}>
                      <input type="time" style={fieldStyle} value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label={t('forms.dressCode')}>
                      <input style={fieldStyle} value={dressCode} onChange={e => setDressCode(e.target.value)} placeholder="Formal" />
                    </FieldGroup>
                  </div>

                  {/* Dirección */}
                  <FieldGroup label={t('events.address')} required hint={t('forms.gpsCoordinatesAutomatic')}>
                    <input ref={addressRef} style={fieldStyle} value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Main St" />
                  </FieldGroup>

                  {/* Ciudad / Estado / ZIP */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <FieldGroup label={t('forms.city')}>
                      <input style={fieldStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" />
                    </FieldGroup>
                    <FieldGroup label={t('forms.state')}>
                      <div style={{ position: 'relative' }}>
                        <select style={{ ...selectStyle, paddingRight: '28px' }} value={state} onChange={e => setState(e.target.value)}>
                          <option value="">{t('forms.selectState')}</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                      </div>
                    </FieldGroup>
                    <FieldGroup label={t('forms.zipCode')}>
                      <input style={fieldStyle} value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33101" />
                    </FieldGroup>
                  </div>

                  {/* ── ROLES ── */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={13} />{t('forms.requiredRoles')}<span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      {mode === 'create' && (
                        <button type="button" onClick={addRoleRow}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: GREEN, background: '#f0fdf4', border: `1px solid #bbf7d0`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                          <Plus size={13} />{t('forms.addRole')}
                        </button>
                      )}
                    </div>

                    {/* Create mode: role rows */}
                    {mode === 'create' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#6b7280', fontWeight: 600, padding: '0 4px' }}>
                          <span style={{ flex: 1, minWidth: '140px' }}>Rol *</span>
                          <span style={{ width: '95px', textAlign: 'center' }}>Hora inicio</span>
                          <span style={{ width: '55px', textAlign: 'center' }}>Cupos *</span>
                          <span style={{ width: '85px', textAlign: 'center' }}>$/h</span>
                          <span style={{ width: '24px' }}></span>
                        </div>
                        {roleSlots.map((slot, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative', minWidth: '140px' }}>
                              <select style={{ ...selectStyle, paddingRight: '28px' }} value={slot.job_role_id}
                                onChange={e => updateRoleRow(i, 'job_role_id', Number(e.target.value))}>
                                <option value={0}>{t('forms.selectRole')}</option>
                                {jobRoles.filter(r => r.is_active).map(r => <option key={r.id} value={r.id}>{r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)</option>)}
                              </select>
                              <ChevronDown size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                            </div>
                            <input type="time" value={slot.start_time || startTime || ''}
                              onChange={e => { const u = [...roleSlots]; u[i] = { ...u[i], start_time: e.target.value }; setRoleSlots(u) }}
                              style={{ ...fieldStyle, width: '95px', padding: '0 4px', fontSize: '12px' }}
                              title="Hora inicio de este rol" />
                            <input type="number" min={1} value={slot.slots_required}
                              onChange={e => updateRoleRow(i, 'slots_required', Number(e.target.value))}
                              style={{ ...fieldStyle, width: '55px', textAlign: 'center', padding: '0 4px' }}
                              title="Cupos" />
                            <input type="number" min={0} step="0.01"
                              placeholder={slot.job_role_id ? `$${jobRoles.find(r => r.id === slot.job_role_id)?.hourly_rate || '0'}` : '$/h'}
                              value={slot.hourly_rate_override ?? ''}
                              onChange={e => {
                                const u = [...roleSlots]
                                u[i] = { ...u[i], hourly_rate_override: e.target.value ? Number(e.target.value) : null }
                                setRoleSlots(u)
                              }}
                              style={{ ...fieldStyle, width: '85px', textAlign: 'center', padding: '0 4px', fontSize: '12px' }}
                              title="Tarifa para este evento (opcional)" />
                            {roleSlots.length > 1 && (
                              <button type="button" onClick={() => removeRoleRow(i)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Edit mode: existing roles */}
                    {mode === 'edit' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {eventRoles.map(er => {
                          const current = roleSlotsEdit[er.id] ?? er.slots_required
                          const changed  = current !== er.slots_required
                          const pending  = er.slots_pending || 0
                          return (
                            <div key={er.id} style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                              borderRadius: '10px', border: `1px solid ${changed ? '#fde68a' : '#e5e7eb'}`,
                              background: changed ? '#fffbeb' : '#f9fafb', transition: 'all 0.15s', flexWrap: 'wrap',
                            }}>
                              <div style={{ flex: 1, minWidth: '100px' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{getRoleName(er.job_role_id)}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px', fontSize: '11px', color: '#9ca3af' }}>
                                  <span>✅ {er.slots_filled}</span>
                                  {pending > 0 && <span>⏳ {pending}</span>}
                                  <span>📋 {er.slots_required}</span>
                                  {changed && <span style={{ color: '#b45309', fontWeight: 600 }}>{er.slots_required} → {current}</span>}
                                </div>
                              </div>
                              <input type="time" value={roleTimesEdit[er.id] ?? (er.start_time ? er.start_time.substring(0, 5) : '')}
                                onChange={e => setRoleTimesEdit(prev => ({ ...prev, [er.id]: e.target.value }))}
                                style={{ ...fieldStyle, width: '95px', padding: '0 4px', fontSize: '12px' }}
                                title="Hora inicio" />
                              <input type="number" min={er.slots_filled} value={current}
                                onChange={e => setRoleSlotsEdit(prev => ({ ...prev, [er.id]: Math.max(er.slots_filled, Number(e.target.value)) }))}
                                style={{ ...fieldStyle, width: '55px', textAlign: 'center', padding: '0 4px' }}
                                title="Cupos" />
                              <input type="number" min={0} step="0.01"
                                placeholder={`$${getRoleRate(er.job_role_id)}`}
                                value={roleRatesEdit[er.id] ?? ''}
                                onChange={e => setRoleRatesEdit(prev => ({ ...prev, [er.id]: e.target.value }))}
                                style={{ ...fieldStyle, width: '85px', textAlign: 'center', padding: '0 4px', fontSize: '12px' }}
                                title="Tarifa para este evento" />
                            </div>
                          )
                        })}

                        {/* Add new role in edit mode */}
                        {availableRoles.length > 0 && (
                          !addingRole ? (
                            <button type="button" onClick={() => setAddingRole(true)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: GREEN, background: '#f0fdf4', border: `1px solid #bbf7d0`, borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', width: 'fit-content' }}>
                              <Plus size={13} />{t('forms.addRole')}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '10px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                              <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
                                <select style={{ ...selectStyle, paddingRight: '28px' }} value={newRoleId} onChange={e => setNewRoleId(Number(e.target.value))}>
                                  <option value={0}>{t('forms.selectRole')}</option>
                                  {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)</option>)}
                                </select>
                                <ChevronDown size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                              </div>
                              <input type="number" min={1} value={newRoleSlots}
                                onChange={e => setNewRoleSlots(Math.max(1, Number(e.target.value)))}
                                style={{ ...fieldStyle, width: '70px', textAlign: 'center', padding: '0 8px' }} />
                              <button type="button" onClick={handleAddRole} disabled={savingRole || !newRoleId}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: GREEN, color: '#fff', fontSize: '12px', fontWeight: 600, cursor: savingRole || !newRoleId ? 'not-allowed' : 'pointer', opacity: savingRole || !newRoleId ? 0.6 : 1 }}>
                                {savingRole ? <RefreshCw size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Plus size={12} />}{t('forms.addRole')}
                              </button>
                              <button type="button" onClick={() => { setAddingRole(false); setNewRoleId(0); setNewRoleSlots(1) }}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                                {t('common.cancel')}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── COORDINATORS ── */}
                  {allCoords.length > 0 && (
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                        <Users size={13} />{t('events.coordinators')} <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({t('common.optional')})</span>
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {allCoords.map(c => {
                          const sel = selectedCoordIds.includes(c.user_id)
                          return (
                            <button key={c.user_id} type="button" onClick={() => toggleCoord(c.user_id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
                                borderRadius: '999px', border: `1px solid ${sel ? GREEN : '#e5e7eb'}`,
                                background: sel ? '#f0fdf4' : '#fff', color: sel ? GREEN : '#6b7280',
                                fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                              }}>
                              {sel && <span style={{ fontSize: '10px' }}>✓</span>}{c.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── NOTES ── */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                        {t('events.notes')} <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({t('common.optional')})</span>
                      </label>
                      <button type="button" onClick={generateNotes} disabled={generatingNotes}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: GREEN, background: 'none', border: 'none', cursor: generatingNotes ? 'not-allowed' : 'pointer', opacity: generatingNotes ? 0.6 : 1 }}>
                        {generatingNotes ? `⏳ ${t('common.loading')}` : `✨ ${t('events.generateNotesAI')}`}
                      </button>
                    </div>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('events.notesPlaceholder')} rows={3}
                      style={{ ...fieldStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} />
                  </div>
                </div>
              )}

              {/* ══ TAB DOCUMENTS ══ */}
              {activeTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{t('events.documentsDesc')}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                    <FieldGroup label={`${t('events.documentName')} *`}>
                      <input style={fieldStyle} value={docName} onChange={e => setDocName(e.target.value)} placeholder="Contrato, Mapa del venue..." />
                    </FieldGroup>
                    <FieldGroup label={`${t('events.documentUrl')} *`} hint={t('events.documentUrlHint')}>
                      <input type="url" style={fieldStyle} value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://drive.google.com/..." />
                    </FieldGroup>
                    <button type="button"
                      onClick={mode === 'create' ? addPendingDoc : handleAddDocument}
                      disabled={!docName.trim() || !docUrl.trim() || addingDoc}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: GREEN, color: '#fff', fontSize: '12px', fontWeight: 600, cursor: !docName.trim() || !docUrl.trim() ? 'not-allowed' : 'pointer', opacity: !docName.trim() || !docUrl.trim() ? 0.5 : 1, width: 'fit-content' }}>
                      {addingDoc ? <RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Plus size={13} />}
                      {t('events.addDocument')}
                    </button>
                  </div>

                  {/* Pending docs (create mode) */}
                  {mode === 'create' && pendingDocs.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '1rem 0' }}>{t('events.noDocuments')}</p>
                  )}
                  {mode === 'create' && pendingDocs.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                      <LinkIcon size={15} color={GREEN} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.url}</p>
                      </div>
                      <button type="button" onClick={() => removePendingDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
                    </div>
                  ))}

                  {/* Saved docs (edit mode) */}
                  {mode === 'edit' && documents.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '1rem 0' }}>{t('events.noDocuments')}</p>
                  )}
                  {mode === 'edit' && documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                      <LinkIcon size={15} color={GREEN} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.url}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: GREEN, fontWeight: 600, textDecoration: 'none' }}>{t('events.viewDocument')}</a>
                        <button type="button" onClick={() => handleDeleteDocument(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error / Success */}
              {error   && <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>⚠ {error}</div>}
              {success && <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px' }}>✓ {success}</div>}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '8px', padding: '14px 20px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0 }}>
              <button type="submit" disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', border: 'none', background: saving ? '#9ca3af' : `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: saving ? 'none' : '0 2px 8px rgba(45,184,75,0.25)', transition: 'all 0.2s' }}>
                {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.7s linear infinite' }} />{t('common.loading')}</> : mode === 'create' ? <><Plus size={14} />{t('forms.createEvent')}</> : <><Save size={14} />{t('common.save')}</>}
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile drawer style */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 640px) {
          [data-event-modal] {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 92vh !important;
          }
        }
      `}</style>
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  )
}