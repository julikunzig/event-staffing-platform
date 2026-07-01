import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Clock, MapPin, CheckCircle, PlayCircle, StopCircle, PauseCircle, PlayIcon, BarChart2, Link as LinkIcon, Users, FileText } from 'lucide-react'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

interface Assignment { id: number; event_id: number; job_role_id: number; status: string; shift_start_time?: string | null }
interface Event { id: number; name: string; event_date: string; start_time: string; address: string; city: string | null; state: string | null; status: string; notes: string | null }
interface Shift { id: number; assignment_id: number; clock_in: string | null; clock_out: string | null; is_paused: boolean; pause_start: string | null; total_pause_minutes: string; hours_worked: string | null; total_pay: string | null; hourly_rate_snapshot: string }
interface JobRole { id: number; name: string }
interface EventCoordinator { user_id: number; name: string; email: string }
interface EventDocument { id: number; name: string; url: string }

function ShiftClock({ clockInIso, totalPauseMinutes, isPaused, pauseStartIso }: { clockInIso: string; totalPauseMinutes: number; isPaused: boolean; pauseStartIso: string | null }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const normalize = (iso: string) => { let n = iso.replace(/(\.\d{3})\d+/, '$1'); if (!n.match(/[Z+\-]\d*:?\d*$/)) n += 'Z'; return new Date(n).getTime() }
    const startMs = normalize(clockInIso); const pauseMs = totalPauseMinutes * 60 * 1000
    const tick = () => {
      const now = Date.now(); let gross = Math.max(0, now - startMs)
      let currentPauseMs = isPaused && pauseStartIso ? Math.max(0, now - normalize(pauseStartIso)) : 0
      setElapsed(Math.floor(Math.max(0, gross - pauseMs - currentPauseMs) / 1000))
    }
    tick(); const interval = setInterval(tick, 1000); return () => clearInterval(interval)
  }, [clockInIso, totalPauseMinutes, isPaused, pauseStartIso])

  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const pct = Math.min(elapsed / (8 * 3600), 1)
  const r = 36, circ = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isPaused ? '#e2e8f0' : '#fde68a'}`, background: isPaused ? '#f8fafc' : '#fffbeb' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={r} fill="none" stroke={isPaused ? '#e2e8f0' : '#fde68a'} strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={isPaused ? '#94a3b8' : '#f59e0b'} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={20} color={isPaused ? '#94a3b8' : '#d97706'} />
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 600, color: isPaused ? '#64748b' : '#b45309' }}>{isPaused ? '⏸ En pausa (break)' : 'Turno en curso'}</p>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.1em', color: isPaused ? '#475569' : '#92400e', lineHeight: 1 }}>{pad(h)}:{pad(m)}:{pad(s)}</p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: isPaused ? '#94a3b8' : '#d97706' }}>
          {h > 0 ? `${h}h ${m}m trabajadas` : `${m}m ${s}s trabajados`}
          {totalPauseMinutes > 0 && ` · ${Math.round(totalPauseMinutes)}m en pausa`}
        </p>
      </div>
    </div>
  )
}

export default function EmployeeProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [assignments, setAssignments]           = useState<Assignment[]>([])
  const [events, setEvents]                     = useState<Map<number, Event>>(new Map())
  const [shifts, setShifts]                     = useState<Map<number, Shift>>(new Map())
  const [roles, setRoles]                       = useState<Map<number, JobRole>>(new Map())
  const [eventCoordinators, setEventCoordinators] = useState<Map<number, EventCoordinator[]>>(new Map())
  const [eventDocuments, setEventDocuments]     = useState<Map<number, EventDocument[]>>(new Map())
  const [loading, setLoading]                   = useState(true)
  const [actionLoading, setActionLoading]       = useState<number | null>(null)
  const [error, setError]                       = useState('')
  const [geoError, setGeoError]                 = useState('')
  const [shiftStartMinutes, setShiftStartMinutes] = useState(15)
  const [currentPage, setCurrentPage]           = useState(1)
  const [shiftFilter, setShiftFilter]           = useState<'all'|'active'|'completed'>('all')
  const itemsPerPage = 10

  const load = async () => {
    try {
      const [asRes, rolesRes, configRes] = await Promise.all([
        api.get<Assignment[]>('/assignments/my-assignments'),
        api.get<JobRole[]>('/job-roles'),
        api.get<any>('/companies/current/weekly-config').catch(() => ({ data: { shift_start_minutes: 15 } })),
      ])
      const approved = asRes.data.filter(a => a.status === 'approved')
      setAssignments(approved); setRoles(new Map(rolesRes.data.map(r => [r.id, r])))
      setShiftStartMinutes(Number(configRes.data?.shift_start_minutes || 15))
      const evMap = new Map<number, Event>(), shiftMap = new Map<number, Shift>(), coordMap = new Map<number, EventCoordinator[]>(), docsMap = new Map<number, EventDocument[]>()
      await Promise.all(approved.map(async (a) => {
        try { evMap.set(a.event_id, (await api.get<Event>(`/events/${a.event_id}`)).data) } catch { }
        try { const r = await api.get<Shift>(`/shifts/${a.id}/my-shift`); if (r.data) shiftMap.set(a.id, r.data) } catch { }
        try { coordMap.set(a.event_id, (await api.get<EventCoordinator[]>(`/events/${a.event_id}/coordinators`)).data) } catch { coordMap.set(a.event_id, []) }
        try { docsMap.set(a.event_id, (await api.get<EventDocument[]>(`/events/${a.event_id}/documents`)).data) } catch { docsMap.set(a.event_id, []) }
      }))
      setEvents(evMap); setShifts(shiftMap); setEventCoordinators(coordMap); setEventDocuments(docsMap)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const interval = setInterval(async () => {
      try { setShiftStartMinutes(Number((await api.get<any>('/companies/current/weekly-config')).data?.shift_start_minutes || 15)) } catch { }
    }, 30000); return () => clearInterval(interval)
  }, [])

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise(resolve => { if (!navigator.geolocation) { resolve({ lat: 0, lng: 0 }); return }
      navigator.geolocation.getCurrentPosition(pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => resolve({ lat: 0, lng: 0 }), { enableHighAccuracy: false, timeout: 8000 }) })

  const clockAction = async (assignmentId: number, action: 'clock-in'|'clock-out'|'pause'|'resume') => {
    setActionLoading(assignmentId); setError(''); setGeoError('')
    try {
      if (action === 'clock-in' || action === 'clock-out') {
        const { lat, lng } = await getLocation()
        await api.post(`/shifts/${assignmentId}/${action}`, { latitude: lat, longitude: lng })
      } else { await api.post(`/shifts/${assignmentId}/${action}`) }
      await load()
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || ''
      if (msg.includes('ubicación') || msg.includes('metros') || msg.includes('m del evento')) setGeoError(msg)
      else setError(msg)
    } finally { setActionLoading(null) }
  }

  const isClockInAllowed = (ev: Event, assignment?: Assignment) => {
    const timeToUse = assignment?.shift_start_time || ev.start_time
    return (new Date(`${ev.event_date}T${timeToUse}`).getTime() - Date.now()) / 60000 <= shiftStartMinutes
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    let n = iso.replace(/(\.\d{3})\d+/, '$1'); if (!n.match(/[Z+\-]\d*:?\d*$/)) n += 'Z'
    const ts = new Date(n).getTime(); return isNaN(ts) ? '—' : new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  const activeAssignments = assignments.filter(a => { const ev = events.get(a.event_id); return ev && ['published','filled','filled_pending','started','finished'].includes(ev.status) })
    .sort((a, b) => { const evA = events.get(a.event_id), evB = events.get(b.event_id); if (!evA||!evB) return 0; return new Date(`${evB.event_date}T${evB.start_time}`).getTime() - new Date(`${evA.event_date}T${evA.start_time}`).getTime() })

  const pastAssignments = assignments.filter(a => { const ev = events.get(a.event_id); return ev && ev.status === 'cancelled' })

  const filteredShifts = activeAssignments.filter(a => {
    const shift = shifts.get(a.id)
    if (shiftFilter === 'active') return (shift?.clock_in && !shift?.clock_out) || !shift?.clock_in
    if (shiftFilter === 'completed') return !!shift?.clock_out
    return true
  })
  const paginated = filteredShifts.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage)

  const statusStyle = (hasIn: boolean, hasOut: boolean, paused: boolean) => {
    if (hasOut) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: `✅ ${t('profile.shiftCompleted')}` }
    if (hasIn && paused) return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: '⏸ En pausa' }
    if (hasIn) return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: `🟡 ${t('profile.clockInStarting')}` }
    return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: t('events.assignmentStatus.approved') }
  }

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px', fontFamily: "'Poppins',sans-serif" }}>{t('common.loading')}</p>

  return (
    <div style={{ maxWidth: '680px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.myShifts')}</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: t('common.all')||'Todos' }, { key: 'active', label: t('profile.activeShifts')||'Activos' }, { key: 'completed', label: t('profile.completedShifts')||'Completados' }].map(f => (
          <button key={f.key} onClick={() => { setShiftFilter(f.key as any); setCurrentPage(1) }}
            style={{ padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif", background: shiftFilter === f.key ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#fff', color: shiftFilter === f.key ? '#fff' : '#374151', border: shiftFilter === f.key ? 'none' : '1.5px solid #e5e7eb', boxShadow: shiftFilter === f.key ? '0 2px 8px rgba(45,184,75,0.25)' : 'none' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Mensajes */}
      {geoError && <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#c2410c', fontSize: '13px', marginBottom: '12px' }}>📍 {geoError}</div>}
      {error    && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

      {/* Lista de turnos */}
      {activeAssignments.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('profile.noActiveEvents')}</p>
      ) : filteredShifts.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.noData')}</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginated.map(a => {
              const ev = events.get(a.event_id)
              const shift = shifts.get(a.id)
              const role = roles.get(a.job_role_id)
              const coords = eventCoordinators.get(a.event_id) || []
              const docs = eventDocuments.get(a.event_id) || []
              if (!ev) return null
              const isLoading = actionLoading === a.id
              const hasIn = !!shift?.clock_in, hasOut = !!shift?.clock_out
              const clockAllowed = isClockInAllowed(ev, a)
              const st = statusStyle(hasIn, hasOut, shift?.is_paused || false)

              return (
                <div key={a.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${GREEN}`, borderRadius: '1rem', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '14px', color: '#111827' }}>{ev.name}</p>
                      <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#9ca3af' }}>{new Date(ev.event_date+'T00:00:00').toLocaleDateString('es')} · {a.shift_start_time || ev.start_time}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#9ca3af' }}>
                        <MapPin size={12} /><span>{[ev.address, ev.city, ev.state].filter(Boolean).join(', ')}</span>
                      </div>
                      {role && <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 600, color: GREEN }}>Rol: {role.name}</p>}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: st.bg, color: st.color, border: `1px solid ${st.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{st.label}</span>
                  </div>

                  {/* Info: coordinadores, notas, docs */}
                  {(coords.length > 0 || ev.notes || docs.length > 0) && (
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {coords.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} />{t('events.coordinators')}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {coords.map(c => <span key={c.user_id} style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0' }}>{c.name}</span>)}
                          </div>
                        </div>
                      )}
                      {ev.notes && (
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={11} />{t('events.notes')}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#374151', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{ev.notes}</p>
                        </div>
                      )}
                      {docs.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><LinkIcon size={11} />{t('events.documents')}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {docs.map(doc => <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: GREEN, textDecoration: 'none', fontWeight: 500 }}><span>📎</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span><span style={{ color: '#9ca3af', flexShrink: 0 }}>↗</span></a>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reloj activo */}
                  {hasIn && !hasOut && shift?.clock_in && (
                    <div style={{ marginBottom: '12px' }}>
                      <ShiftClock clockInIso={shift.clock_in} totalPauseMinutes={parseFloat(shift.total_pause_minutes||'0')} isPaused={shift.is_paused} pauseStartIso={shift.pause_start} />
                    </div>
                  )}

                  {/* Resumen completado */}
                  {hasOut && shift && (
                    <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                        <Clock size={13} color={GREEN} />
                        <span>{t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong> · {t('profile.clockOut')}: <strong>{formatTime(shift.clock_out)}</strong></span>
                      </div>
                      {shift.hours_worked && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{t('common.total')}: <strong>{parseFloat(shift.hours_worked).toFixed(2)}h</strong> · ${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</span>
                          {shift.total_pay && <span style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>${parseFloat(shift.total_pay).toFixed(2)}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info cuando en turno */}
                  {hasIn && !hasOut && shift && (
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9ca3af' }}>{t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong> · ${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</p>
                  )}

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!hasIn && (
                      <div style={{ width: '100%' }}>
                        <button onClick={() => clockAction(a.id, 'clock-in')} disabled={isLoading || !clockAllowed}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: !clockAllowed ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: !clockAllowed ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: !clockAllowed ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                          <PlayCircle size={16} />{isLoading ? t('profile.clockInStarting') : t('profile.clockIn')}
                        </button>
                        {!clockAllowed && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>⏰ {t('profile.clockInAvailable').replace('{minutes}', String(shiftStartMinutes))}</p>}
                        {/* Withdraw button */}
                        <button onClick={async () => {
                          if (!confirm('¿Estás seguro de que deseas retirarte de este evento?')) return
                          setActionLoading(a.id)
                          try {
                            await api.patch(`/assignments/${a.id}/withdraw`)
                            await load()
                          } catch (e: any) { setError(e.response?.data?.detail || 'Error al retirarse') }
                          finally { setActionLoading(null) }
                        }} disabled={isLoading}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '6px', fontFamily: "'Poppins',sans-serif" }}>
                          ✕ Retirarse del evento
                        </button>
                      </div>
                    )}
                    {hasIn && !hasOut && (
                      <>
                        {!shift?.is_paused ? (
                          <button onClick={() => clockAction(a.id, 'pause')} disabled={isLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                            <PauseCircle size={15} />{isLoading ? '...' : t('common.pause')}
                          </button>
                        ) : (
                          <button onClick={() => clockAction(a.id, 'resume')} disabled={isLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '9px', border: 'none', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                            <PlayIcon size={15} />{isLoading ? '...' : t('common.resume')}
                          </button>
                        )}
                        <button onClick={() => clockAction(a.id, 'clock-out')} disabled={isLoading}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '9px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                          <StopCircle size={15} />{isLoading ? t('profile.clockOutFinishing') : t('profile.clockOut')}
                        </button>
                      </>
                    )}
                    {hasOut && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GREEN, fontSize: '13px', fontWeight: 600 }}>
                        <CheckCircle size={15} />{t('profile.shiftCompleted')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {filteredShifts.length > itemsPerPage && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('pagination.previous')}
              </button>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t('pagination.page')} <strong>{currentPage}</strong> {t('pagination.of')} <strong>{totalPages}</strong></span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('pagination.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Ver reporte */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={() => navigate('/reports')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.25)' }}>
          <BarChart2 size={16} />Ver Mi Reporte de Horas y Pagos
        </button>
      </div>

      {/* Historial */}
      {pastAssignments.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} color="#9ca3af" />{t('profile.history')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pastAssignments.map(a => {
              const ev = events.get(a.event_id), shift = shifts.get(a.id), role = roles.get(a.job_role_id)
              if (!ev) return null
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', opacity: 0.8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151' }}>{ev.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(ev.event_date+'T00:00:00').toLocaleDateString('es')}{role ? ` · ${role.name}` : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {shift?.hours_worked && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{parseFloat(shift.hours_worked).toFixed(2)}h</p>}
                    {shift?.total_pay && <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>${parseFloat(shift.total_pay).toFixed(2)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}