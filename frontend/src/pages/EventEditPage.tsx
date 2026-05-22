import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Users, Plus, RefreshCw, FileText, Info, Link as LinkIcon, Trash2 } from 'lucide-react'
import { translateEventStatus } from '@/lib/translationHelpers'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

interface EventData {
  id: number; name: string; event_date: string; start_time: string; end_time: string | null
  address: string; city: string | null; state: string | null; zip_code: string | null
  dress_code: string | null; notes: string | null; status: string; is_public: boolean
}
interface EventJobRole { id: number; job_role_id: number; slots_required: number; slots_filled: number; slots_pending?: number }
interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }
interface Coordinator { user_id: number; name: string; email: string }
interface EventDocument { id: number; name: string; url: string; created_at: string }

const STATUS_COLORS: Record<string, string> = {
  created: 'bg-slate-100 text-slate-700', published: 'bg-blue-100 text-blue-700',
  filled_pending: 'bg-amber-100 text-amber-700', filled: 'bg-emerald-100 text-emerald-700',
  started: 'bg-yellow-100 text-yellow-700', finished: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function EventEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingDoc, setAddingDoc] = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Event fields
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [dressCode, setDressCode] = useState('')
  const [notes, setNotes] = useState('')
  const [eventStatus, setEventStatus] = useState('')

  // Roles
  const [eventRoles, setEventRoles] = useState<EventJobRole[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [roleSlots, setRoleSlots] = useState<Record<number, number>>({})
  const [newRoleId, setNewRoleId] = useState(0)
  const [newRoleSlots, setNewRoleSlots] = useState(1)
  const [addingRole, setAddingRole] = useState(false)
  const [savingRole, setSavingRole] = useState(false)

  // Coordinators
  const [allCoordinators, setAllCoordinators] = useState<Coordinator[]>([])
  const [selectedCoordIds, setSelectedCoordIds] = useState<number[]>([])

  // Documents
  const [documents, setDocuments] = useState<EventDocument[]>([])
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')

  const loadAll = async () => {
    try {
      const [evRes, rolesRes, jrRes, allCoordsRes, eventCoordsRes, docsRes] = await Promise.all([
        api.get<EventData>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
        api.get<JobRole[]>('/job-roles'),
        api.get<Coordinator[]>('/events/company-coordinators').catch(() => ({ data: [] as Coordinator[] })),
        api.get<Coordinator[]>(`/events/${id}/coordinators`).catch(() => ({ data: [] as Coordinator[] })),
        api.get<EventDocument[]>(`/events/${id}/documents`).catch(() => ({ data: [] as EventDocument[] })),
      ])
      const e = evRes.data
      setName(e.name); setEventDate(e.event_date); setStartTime(e.start_time)
      setEndTime(e.end_time || ''); setAddress(e.address); setCity(e.city || '')
      setState(e.state || ''); setZipCode(e.zip_code || ''); setDressCode(e.dress_code || '')
      setNotes(e.notes || ''); setEventStatus(e.status)
      setEventRoles(rolesRes.data); setJobRoles(jrRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)
      setAllCoordinators((allCoordsRes as any).data as Coordinator[])
      setSelectedCoordIds(((eventCoordsRes as any).data as Coordinator[]).map((c: Coordinator) => c.user_id))
      setDocuments((docsRes as any).data as EventDocument[])
    } catch { navigate('/events') }
  }

  useEffect(() => { loadAll().finally(() => setLoading(false)) }, [id])

  // Single save: event info + roles + coordinators + notes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      // 1. Save event info
      await api.patch<EventData>(`/events/${id}`, {
        name: name || undefined, event_date: eventDate || undefined,
        start_time: startTime || undefined, end_time: endTime || null,
        address: address || undefined, city: city || null,
        state: state || null, zip_code: zipCode || null, dress_code: dressCode || null,
      })
      // 2. Save role slots (only changed)
      await Promise.all(eventRoles.map(er => {
        const ns = roleSlots[er.job_role_id] ?? er.slots_required
        if (ns === er.slots_required) return Promise.resolve()
        return api.patch(`/events/${id}/job-roles/${er.job_role_id}/slots`, { slots_required: ns })
      }))
      // 3. Save coordinators
      await api.put(`/events/${id}/coordinators`, { user_ids: selectedCoordIds })
      // 4. Save notes
      await api.patch(`/events/${id}/notes`, { notes: notes || null })
      // Reload to get updated state
      const [evUpdated, rolesRes] = await Promise.all([
        api.get<EventData>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
      ])
      setEventStatus(evUpdated.data.status)
      setEventRoles(rolesRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)
      setSuccess(t('common.success'))
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
    finally { setSaving(false) }
  }

  // Add new role (immediate, no full-save needed)
  const handleAddRole = async () => {
    if (!newRoleId) return
    setSavingRole(true); setError('')
    try {
      await api.post(`/events/${id}/job-roles`, { job_role_id: newRoleId, slots_required: newRoleSlots })
      const [evUpdated, rolesRes] = await Promise.all([
        api.get<EventData>(`/events/${id}`),
        api.get<EventJobRole[]>(`/events/${id}/job-roles`),
      ])
      setEventStatus(evUpdated.data.status)
      setEventRoles(rolesRes.data)
      const slots: Record<number, number> = {}
      rolesRes.data.forEach(r => { slots[r.job_role_id] = r.slots_required })
      setRoleSlots(slots)
      setNewRoleId(0); setNewRoleSlots(1); setAddingRole(false)
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
    finally { setSavingRole(false) }
  }

  // Documents
  const handleAddDocument = async () => {
    if (!docName.trim() || !docUrl.trim()) return
    setAddingDoc(true); setError('')
    try {
      const res = await api.post<EventDocument>(`/events/${id}/documents`, { name: docName.trim(), url: docUrl.trim() })
      setDocuments(prev => [...prev, res.data]); setDocName(''); setDocUrl('')
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
    finally { setAddingDoc(false) }
  }

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm(t('events.confirmDeleteDocument'))) return
    try {
      await api.delete(`/events/${id}/documents/${docId}`)
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (err: any) { setError(err.response?.data?.detail || t('common.error')) }
  }

  const toggleCoord = (uid: number) =>
    setSelectedCoordIds(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid])

  const getRoleName = (roleId: number) => jobRoles.find(r => r.id === roleId)?.name || `Rol #${roleId}`
  const availableRoles = jobRoles.filter(r => r.is_active && !eventRoles.some(er => er.job_role_id === r.id))
  const statusColor = STATUS_COLORS[eventStatus] || 'bg-slate-100 text-slate-700'

  const tabs = [
    { key: 'info' as const, label: t('events.tabInfo'), icon: <Info size={15} /> },
    { key: 'documents' as const, label: t('events.tabDocuments'), icon: <FileText size={15} /> },
  ]

  if (loading) return <p className="text-slate-500 p-4">{t('common.loading')}</p>

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(`/events/${id}`)}>
        <ArrowLeft size={16} /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>{t('forms.editEvent')}</CardTitle>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
              {translateEventStatus(eventStatus)}
            </span>
          </div>
          <div className="flex gap-2 border-b border-slate-200 pb-2 mt-4">
            {tabs.map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-5">

          {/* ── TAB 1: INFO ── */}
          <div className={activeTab === 'info' ? 'block' : 'hidden'}>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Basic fields */}
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

              {/* Required Roles */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Users size={14} /> {t('forms.requiredRoles')}
                  </Label>
                </div>
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
                        {changed && <p className="text-xs text-amber-600 mt-0.5 font-medium">{t('common.update')}: {er.slots_required} → {currentSlots}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Label className="text-xs text-slate-600 whitespace-nowrap">{t('forms.slots')}:</Label>
                        <Input type="number" min={er.slots_filled} value={currentSlots}
                          onChange={e => setRoleSlots(prev => ({ ...prev, [er.job_role_id]: Math.max(er.slots_filled, Number(e.target.value)) }))}
                          className="w-20 text-center" />
                      </div>
                    </div>
                  )
                })}
                {/* Add new role */}
                {availableRoles.length > 0 && (
                  !addingRole ? (
                    <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => setAddingRole(true)}>
                      <Plus size={14} /> {t('forms.addRole')}
                    </Button>
                  ) : (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-semibold text-slate-700">{t('forms.addRole')}</p>
                      <div className="flex gap-2 items-center flex-wrap">
                        <select value={newRoleId} onChange={e => setNewRoleId(Number(e.target.value))}
                          className="flex-1 border rounded-md px-3 py-2 text-sm min-w-40">
                          <option value={0}>{t('forms.selectRole')}</option>
                          {availableRoles.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs whitespace-nowrap">{t('forms.slots')}:</Label>
                          <Input type="number" min={1} value={newRoleSlots}
                            onChange={e => setNewRoleSlots(Math.max(1, Number(e.target.value)))}
                            className="w-20 text-center" />
                        </div>
                        <Button type="button" size="sm" onClick={handleAddRole} disabled={savingRole || !newRoleId} className="gap-1">
                          {savingRole ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} {t('forms.addRole')}
                        </Button>
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => { setAddingRole(false); setNewRoleId(0); setNewRoleSlots(1) }}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Coordinators */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Users size={14} /> {t('events.coordinators')}
                    <span className="text-slate-400 font-normal text-xs">({t('common.optional')})</span>
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">{t('events.coordinatorsDesc')}</p>
                </div>
                {allCoordinators.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">{t('events.noCoordinators')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allCoordinators.map(c => {
                      const sel = selectedCoordIds.includes(c.user_id)
                      return (
                        <button key={c.user_id} type="button" onClick={() => toggleCoord(c.user_id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            sel ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300 hover:border-teal-400'
                          }`}>
                          {sel && <span className="text-xs">✓</span>} {c.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label>
                    {t('events.notes')}
                    <span className="text-slate-400 font-normal text-xs ml-1">({t('common.optional')})</span>
                  </Label>
                  <button type="button" onClick={async () => {
                    setGeneratingNotes(true)
                    setError('')
                    try {
                      const res = await api.post<{ notes: string }>('/ai/generate-notes', {
                        event_name: name || 'Evento', event_date: eventDate || '',
                        start_time: startTime || '', address: address || '',
                        city: city || '', state: state || '', dress_code: dressCode || null,
                        language: i18n.language === 'en' ? 'en' : 'es',
                        roles: eventRoles.map(er => ({
                          name: getRoleName(er.job_role_id),
                          slots: er.slots_required,
                        })),
                      })
                      setNotes(res.data.notes)
                    } catch (e: any) { setError(e.response?.data?.detail || 'Error generando notas con IA') }
                    finally { setGeneratingNotes(false) }
                  }} disabled={generatingNotes}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium disabled:opacity-50">
                    {generatingNotes ? `⏳ ${t('common.loading')}` : `✨ ${t('events.generateNotesAI')}`}
                  </button>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder={t('events.notesPlaceholder')} rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}

              {/* Single save button */}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <><RefreshCw size={14} className="animate-spin" /> {t('common.loading')}</> : <><Save size={14} /> {t('common.save')}</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/events/${id}`)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>

          {/* ── TAB 2: DOCUMENTS ── */}
          <div className={activeTab === 'documents' ? 'block space-y-4' : 'hidden'}>
            <p className="text-sm text-slate-600">{t('events.documentsDesc')}</p>
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <Label>{t('events.documentName')} *</Label>
                <Input value={docName} onChange={e => setDocName(e.target.value)}
                  placeholder="Contrato, Mapa del venue..." />
              </div>
              <div className="space-y-1">
                <Label>{t('events.documentUrl')} *</Label>
                <Input value={docUrl} onChange={e => setDocUrl(e.target.value)}
                  placeholder="https://drive.google.com/..." type="url" />
                <p className="text-xs text-slate-400">{t('events.documentUrlHint')}</p>
              </div>
              <Button type="button" size="sm" onClick={handleAddDocument}
                disabled={addingDoc || !docName.trim() || !docUrl.trim()} className="gap-1">
                {addingDoc ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                {t('events.addDocument')}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {documents.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-6">{t('events.noDocuments')}</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <LinkIcon size={16} className="text-teal-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 truncate">{doc.url}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline font-medium">
                        {t('events.viewDocument')}
                      </a>
                      <button type="button" onClick={() => handleDeleteDocument(doc.id)}
                        className="text-slate-400 hover:text-red-500" title={t('events.deleteDocument')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
