import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, FileText, Info, Users, Link as LinkIcon, X } from 'lucide-react'

interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }
interface RoleSlot { job_role_id: number; slots_required: number }
interface Coordinator { user_id: number; name: string; email: string }
interface PendingDoc { name: string; url: string }

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

export default function EventCreatePage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info')
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
  const [notes, setNotes] = useState('')
  const [allCoordinators, setAllCoordinators] = useState<Coordinator[]>([])
  const [selectedCoordIds, setSelectedCoordIds] = useState<number[]>([])
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([])
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      api.get<JobRole[]>('/job-roles'),
      api.get<Coordinator[]>('/events/company-coordinators').catch(() => ({ data: [] as Coordinator[] })),
    ]).then(([rolesRes, coordRes]) => {
      setJobRoles(rolesRes.data.filter(r => r.is_active))
      setAllCoordinators((coordRes as any).data as Coordinator[])
    })
  }, [])

  useEffect(() => {
    const win = window as any
    if (!win.google?.maps?.places || !addressRef.current) return
    const ac = new win.google.maps.places.Autocomplete(addressRef.current, { componentRestrictions: { country: 'us' }, fields: ['address_components'] })
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
  }, [])

  const addRole = () => setRoleSlots([...roleSlots, { job_role_id: 0, slots_required: 1 }])
  const removeRole = (i: number) => setRoleSlots(roleSlots.filter((_, idx) => idx !== i))
  const updateRole = (i: number, f: keyof RoleSlot, v: number) => { const u = [...roleSlots]; u[i] = { ...u[i], [f]: v }; setRoleSlots(u) }
  const toggleCoord = (id: number) => setSelectedCoordIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const addPendingDoc = () => {
    if (!docName.trim() || !docUrl.trim()) return
    setPendingDocs([...pendingDocs, { name: docName.trim(), url: docUrl.trim() }])
    setDocName(''); setDocUrl('')
  }
  const removePendingDoc = (i: number) => setPendingDocs(pendingDocs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (roleSlots.some(r => r.job_role_id === 0)) { setError(t('forms.selectRoleForRow')); return }
    setLoading(true)
    try {
      const res = await api.post<{ id: number }>('/events', {
        name, event_date: eventDate, start_time: startTime,
        end_time: endTime || null, address, city: city || null,
        state: state || null, zip_code: zipCode || null,
        dress_code: dressCode || null, job_roles: roleSlots,
      })
      const eid = res.data.id
      await Promise.all([
        notes.trim() ? api.patch(`/events/${eid}/notes`, { notes: notes.trim() }) : Promise.resolve(),
        selectedCoordIds.length > 0 ? api.put(`/events/${eid}/coordinators`, { user_ids: selectedCoordIds }) : Promise.resolve(),
        ...pendingDocs.map(d => api.post(`/events/${eid}/documents`, { name: d.name, url: d.url })),
      ])
      navigate('/events')
    } catch (e: any) { setError(e.response?.data?.detail || t('forms.errorCreatingEvent')) }
    finally { setLoading(false) }
  }

  const tabs = [
    { key: 'info' as const, label: t('events.tabInfo'), icon: <Info size={15} /> },
    { key: 'documents' as const, label: t('events.tabDocuments'), icon: <FileText size={15} /> },
  ]

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/events')}><ArrowLeft size={16} /> {t('common.back')}</Button>
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>{t('forms.createEvent')}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">{t('forms.eventCreatedInState')}</p>
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
          <form onSubmit={handleSubmit}>

            {/* TAB 1: INFO + COORDINATORS + NOTES */}
            <div className={activeTab === 'info' ? 'block space-y-4' : 'hidden'}>
              <div className="space-y-1"><Label>{t('forms.eventName')} *</Label><Input value={name} onChange={e => setName(e.target.value)} required placeholder="Boda García" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>{t('forms.eventDate')} *</Label><Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t('forms.startTime')} *</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t('forms.endTime')}</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                <div className="space-y-1"><Label>{t('forms.dressCode')}</Label><Input value={dressCode} onChange={e => setDressCode(e.target.value)} placeholder="Formal" /></div>
              </div>
              <div className="space-y-1">
                <Label>{t('events.address')} *</Label>
                <Input ref={addressRef} value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Main St" />
                <p className="text-xs text-slate-400">{t('forms.gpsCoordinatesAutomatic')}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1"><Label>{t('forms.city')}</Label><Input value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" /></div>
                <div className="space-y-1"><Label>{t('forms.state')}</Label>
                  <select value={state} onChange={e => setState(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="">{t('forms.selectState')}</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><Label>{t('forms.zipCode')}</Label><Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33101" /></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('forms.requiredRoles')} *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addRole} className="gap-1"><Plus size={14} /> {t('forms.addRole')}</Button>
                </div>
                {roleSlots.map((slot, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={slot.job_role_id} onChange={e => updateRole(i, 'job_role_id', Number(e.target.value))} className="flex-1 border rounded-md px-3 py-2 text-sm">
                      <option value={0}>{t('forms.selectRole')}</option>
                      {jobRoles.map(r => <option key={r.id} value={r.id}>{r.name} (${parseFloat(r.hourly_rate).toFixed(2)}/h)</option>)}
                    </select>
                    <Input type="number" min={1} value={slot.slots_required} onChange={e => updateRole(i, 'slots_required', Number(e.target.value))} className="w-20" />
                    {roleSlots.length > 1 && <Button type="button" size="sm" variant="ghost" onClick={() => removeRole(i)}><Trash2 size={14} className="text-red-500" /></Button>}
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div>
                  <Label className="flex items-center gap-1.5"><Users size={14} /> {t('events.coordinators')} <span className="text-slate-400 font-normal text-xs">({t('common.optional')})</span></Label>
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
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${sel ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300 hover:border-teal-400'}`}>
                          {sel && <span className="text-xs">✓</span>} {c.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label>{t('events.notes')} <span className="text-slate-400 font-normal text-xs">({t('common.optional')})</span></Label>
                  <button type="button" onClick={async () => {
                    setGeneratingNotes(true)
                    setError('')
                    try {
                      const res = await api.post<{ notes: string }>('/ai/generate-notes', {
                        event_name: name || 'Evento', event_date: eventDate || '',
                        start_time: startTime || '', address: address || '',
                        city: city || '', state: state || '', dress_code: dressCode || null,
                        language: i18n.language === 'en' ? 'en' : 'es',
                        roles: roleSlots.filter(r => r.job_role_id !== 0).map(r => ({
                          name: jobRoles.find(jr => jr.id === r.job_role_id)?.name || '',
                          slots: r.slots_required,
                        })),
                      })
                      setNotes(res.data.notes)
                    } catch (e: any) {
                      setError(e.response?.data?.detail || 'Error generando notas con IA')
                    }
                    finally { setGeneratingNotes(false) }
                  }} disabled={generatingNotes}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium disabled:opacity-50">
                    {generatingNotes ? `⏳ ${t('common.loading')}` : `✨ ${t('events.generateNotesAI')}`}
                  </button>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('events.notesPlaceholder')} rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('forms.createEvent')}</Button>
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>{t('common.cancel')}</Button>
              </div>
            </div>

            {/* TAB 2: DOCUMENTS */}
            <div className={activeTab === 'documents' ? 'block space-y-4' : 'hidden'}>
              <p className="text-sm text-slate-600">{t('events.documentsDesc')}</p>
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1"><Label>{t('events.documentName')} *</Label><Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Contrato, Mapa del venue..." /></div>
                <div className="space-y-1">
                  <Label>{t('events.documentUrl')} *</Label>
                  <Input value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://drive.google.com/..." type="url" />
                  <p className="text-xs text-slate-400">{t('events.documentUrlHint')}</p>
                </div>
                <Button type="button" size="sm" onClick={addPendingDoc} disabled={!docName.trim() || !docUrl.trim()} className="gap-1"><Plus size={14} /> {t('events.addDocument')}</Button>
              </div>
              {pendingDocs.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">{t('events.noDocuments')}</p>
              ) : (
                <div className="space-y-2">
                  {pendingDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <LinkIcon size={16} className="text-teal-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{doc.name}</p><p className="text-xs text-slate-400 truncate">{doc.url}</p></div>
                      <button type="button" onClick={() => removePendingDoc(i)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('forms.createEvent')}</Button>
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>{t('common.cancel')}</Button>
              </div>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
