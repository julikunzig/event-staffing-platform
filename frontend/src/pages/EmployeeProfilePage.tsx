import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, MapPin, CheckCircle, PlayCircle, StopCircle, PauseCircle, PlayIcon } from 'lucide-react'

interface Assignment { id: number; event_id: number; job_role_id: number; status: string }
interface Event {
  id: number; name: string; event_date: string; start_time: string
  address: string; city: string | null; state: string | null; status: string
  notes: string | null
}
interface Shift {
  id: number; assignment_id: number; clock_in: string | null; clock_out: string | null
  is_paused: boolean; pause_start: string | null; total_pause_minutes: string
  hours_worked: string | null; total_pay: string | null; hourly_rate_snapshot: string
}
interface JobRole { id: number; name: string }
interface EventCoordinator { user_id: number; name: string; email: string }
interface EventDocument { id: number; name: string; url: string }

// ── Reloj de turno en tiempo real ──────────────────────────────────────────
function ShiftClock({ clockInIso, totalPauseMinutes, isPaused, pauseStartIso }: {
  clockInIso: string
  totalPauseMinutes: number
  isPaused: boolean
  pauseStartIso: string | null
}) {
  const [elapsed, setElapsed] = useState(0) // segundos netos trabajados

  useEffect(() => {
    const normalize = (iso: string) => {
      let n = iso.replace(/(\.\d{3})\d+/, '$1')
      if (!n.match(/[Z+\-]\d*:?\d*$/)) n += 'Z'
      return new Date(n).getTime()
    }

    const startMs = normalize(clockInIso)
    const pauseMs = totalPauseMinutes * 60 * 1000

    const tick = () => {
      const now = Date.now()
      let gross = Math.max(0, now - startMs)
      // Si está pausado, descontar también el tiempo de la pausa actual
      let currentPauseMs = 0
      if (isPaused && pauseStartIso) {
        currentPauseMs = Math.max(0, now - normalize(pauseStartIso))
      }
      const net = Math.max(0, gross - pauseMs - currentPauseMs)
      setElapsed(Math.floor(net / 1000))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [clockInIso, totalPauseMinutes, isPaused, pauseStartIso])

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const maxSeconds = 8 * 3600
  const pct = Math.min(elapsed / maxSeconds, 1)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl border ${isPaused ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
      {/* Círculo de progreso */}
      <div className="relative flex-shrink-0">
        <svg width="88" height="88" className="-rotate-90">
          <circle cx="44" cy="44" r={radius} fill="none"
            stroke={isPaused ? '#e2e8f0' : '#fde68a'} strokeWidth="6" />
          <circle cx="44" cy="44" r={radius} fill="none"
            stroke={isPaused ? '#94a3b8' : '#f59e0b'} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock size={20} className={isPaused ? 'text-slate-400' : 'text-amber-600'} />
        </div>
      </div>

      {/* Tiempo */}
      <div>
        <p className={`text-xs font-medium mb-0.5 ${isPaused ? 'text-slate-500' : 'text-amber-700'}`}>
          {isPaused ? '⏸ En pausa (break)' : 'Turno en curso'}
        </p>
        <p className={`text-3xl font-bold font-mono tracking-wider leading-none ${isPaused ? 'text-slate-600' : 'text-amber-800'}`}>
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </p>
        <p className={`text-xs mt-1 ${isPaused ? 'text-slate-400' : 'text-amber-600'}`}>
          {hours > 0 ? `${hours}h ${minutes}m trabajadas` : `${minutes}m ${seconds}s trabajados`}
          {totalPauseMinutes > 0 && ` · ${Math.round(totalPauseMinutes)}m en pausa`}
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────

export default function EmployeeProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [events, setEvents] = useState<Map<number, Event>>(new Map())
  const [shifts, setShifts] = useState<Map<number, Shift>>(new Map())
  const [roles, setRoles] = useState<Map<number, JobRole>>(new Map())
  const [eventCoordinators, setEventCoordinators] = useState<Map<number, EventCoordinator[]>>(new Map())
  const [eventDocuments, setEventDocuments] = useState<Map<number, EventDocument[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [geoError, setGeoError] = useState('')
  const [shiftStartMinutes, setShiftStartMinutes] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [shiftFilter, setShiftFilter] = useState<'all' | 'active' | 'completed'>('all')
  const itemsPerPage = 10

  const load = async () => {
    try {
      const [asRes, rolesRes, configRes] = await Promise.all([
        api.get<Assignment[]>('/assignments/my-assignments'),
        api.get<JobRole[]>('/job-roles'),
        api.get<any>('/companies/current/weekly-config').catch(() => ({ data: { shift_start_minutes: 15 } })),
      ])
      const approvedAssignments = asRes.data.filter(a => a.status === 'approved')
      setAssignments(approvedAssignments)
      setRoles(new Map(rolesRes.data.map(r => [r.id, r])))
      
      // Cargar shift_start_minutes del config
      const minutes = configRes.data?.shift_start_minutes || 15
      console.log('API returned shift_start_minutes:', minutes, 'Type:', typeof minutes)
      setShiftStartMinutes(Number(minutes))

      const evMap = new Map<number, Event>()
      const shiftMap = new Map<number, Shift>()
      const coordMap = new Map<number, EventCoordinator[]>()
      const docsMap = new Map<number, EventDocument[]>()
      await Promise.all(approvedAssignments.map(async (a) => {
        try { const r = await api.get<Event>(`/events/${a.event_id}`); evMap.set(a.event_id, r.data) } catch { }
        try { const r = await api.get<Shift>(`/shifts/${a.id}/my-shift`); if (r.data) shiftMap.set(a.id, r.data) } catch { }
        try { const r = await api.get<EventCoordinator[]>(`/events/${a.event_id}/coordinators`); coordMap.set(a.event_id, r.data) } catch { coordMap.set(a.event_id, []) }
        try { const r = await api.get<EventDocument[]>(`/events/${a.event_id}/documents`); docsMap.set(a.event_id, r.data) } catch { docsMap.set(a.event_id, []) }
      }))
      setEvents(evMap)
      setShifts(shiftMap)
      setEventCoordinators(coordMap)
      setEventDocuments(docsMap)
    } catch (e) {
      console.error('Error loading data:', e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  
  // Re-cargar configuración cada 30 segundos para asegurar que el parámetro esté actualizado
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const configRes = await api.get<any>('/companies/current/weekly-config')
        const minutes = configRes.data?.shift_start_minutes || 15
        console.log('Periodic config check - shift_start_minutes:', minutes, 'Type:', typeof minutes)
        setShiftStartMinutes(Number(minutes))
      } catch (e: any) {
        // Ignorar errores 403 (Forbidden) y 422 (Unprocessable Entity) - usar valor por defecto
        if (e.response?.status !== 403 && e.response?.status !== 422) {
          console.error('Error loading config:', e)
        }
      }
    }, 30000) // Cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: 0, lng: 0 }); return }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }),
        { enableHighAccuracy: false, timeout: 8000 }
      )
    })

  const handleClockIn = async (assignmentId: number) => {
    setActionLoading(assignmentId); setError(''); setGeoError('')
    try {
      const { lat, lng } = await getLocation()
      await api.post(`/shifts/${assignmentId}/clock-in`, { latitude: lat, longitude: lng })
      await load()
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || t('profile.clockInStarting')
      if (msg.includes('ubicación') || msg.includes('metros') || msg.includes('m del evento')) setGeoError(msg)
      else setError(msg)
    } finally { setActionLoading(null) }
  }

  const handleClockOut = async (assignmentId: number) => {
    setActionLoading(assignmentId); setError(''); setGeoError('')
    try {
      const { lat, lng } = await getLocation()
      await api.post(`/shifts/${assignmentId}/clock-out`, { latitude: lat, longitude: lng })
      await load()
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || t('profile.clockOutFinishing')
      if (msg.includes('ubicación') || msg.includes('metros') || msg.includes('m del evento')) setGeoError(msg)
      else setError(msg)
    } finally { setActionLoading(null) }
  }

  const handlePause = async (assignmentId: number) => {
    setActionLoading(assignmentId); setError('')
    try {
      await api.post(`/shifts/${assignmentId}/pause`)
      await load()
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally { setActionLoading(null) }
  }

  const handleResume = async (assignmentId: number) => {
    setActionLoading(assignmentId); setError('')
    try {
      await api.post(`/shifts/${assignmentId}/resume`)
      await load()
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally { setActionLoading(null) }
  }

  const isClockInAllowed = (ev: Event): boolean => {
    const now = new Date()
    const eventDateTime = new Date(`${ev.event_date}T${ev.start_time}`)
    const diffMinutes = (eventDateTime.getTime() - now.getTime()) / 60000
    
    // El botón se activa cuando faltan X minutos o menos (según el parámetro shift_start_minutes)
    const allowed = diffMinutes <= shiftStartMinutes
    
    console.log(`Clock-in check for "${ev.name}":`)
    console.log(`  Event time: ${ev.event_date}T${ev.start_time}`)
    console.log(`  Current time: ${now.toISOString()}`)
    console.log(`  Minutes until event: ${diffMinutes.toFixed(1)}`)
    console.log(`  Shift start minutes (parameter): ${shiftStartMinutes}`)
    console.log(`  Condition (diffMinutes <= shiftStartMinutes): ${diffMinutes} <= ${shiftStartMinutes} = ${allowed}`)
    console.log(`  Result: ${allowed}`)
    
    return allowed
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    // Truncar microsegundos y manejar timezone correctamente
    let normalized = iso.replace(/(\.\d{3})\d+/, '$1')
    if (!normalized.match(/[Z+\-]\d*:?\d*$/)) normalized += 'Z'
    const ts = new Date(normalized).getTime()
    if (isNaN(ts)) return '—'
    return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  const activeAssignments = assignments.filter(a => {
    const ev = events.get(a.event_id)
    return ev && ['published', 'filled', 'filled_pending', 'started', 'finished'].includes(ev.status)
  }).sort((a, b) => {
    const evA = events.get(a.event_id)
    const evB = events.get(b.event_id)
    if (!evA || !evB) return 0
    // Ordenar por fecha y hora: más reciente al más antiguo
    const dateTimeA = new Date(`${evA.event_date}T${evA.start_time}`).getTime()
    const dateTimeB = new Date(`${evB.event_date}T${evB.start_time}`).getTime()
    return dateTimeB - dateTimeA
  })

  const pastAssignments = assignments.filter(a => {
    const ev = events.get(a.event_id)
    return ev && ev.status === 'cancelled'
  })

  // Filtrar turnos según el filtro seleccionado
  const getFilteredShifts = () => {
    return activeAssignments.filter(a => {
      const ev = events.get(a.event_id)
      if (!ev) return false
      const shift = shifts.get(a.id)
      
      if (shiftFilter === 'active') {
        // Turnos activos: en curso (clock_in sin clock_out) + pendientes por aprobación + confirmados
        // En curso: tienen clock_in pero no clock_out
        const isInProgress = shift?.clock_in && !shift?.clock_out
        // Pendientes por aprobación: no tienen clock_in aún
        const isPending = !shift?.clock_in
        return isInProgress || isPending
      } else if (shiftFilter === 'completed') {
        // Turnos completados: tienen clock_out
        return shift?.clock_out
      }
      return true // 'all'
    })
  }

  const filteredShifts = getFilteredShifts()
  const paginatedShifts = filteredShifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage)

  if (loading) return <p className="text-slate-500">{t('common.loading')}</p>

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{t('nav.myShifts')}</h2>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <PlayCircle size={20} className="text-emerald-600" /> {t('nav.myShifts')}
        </h3>

        {geoError && (
          <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
            📍 {geoError}
          </div>
        )}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {[
            { key: 'all', label: t('common.all') || 'Todos' },
            { key: 'active', label: t('profile.activeShifts') || 'Activos' },
            { key: 'completed', label: t('profile.completedShifts') || 'Completados' },
          ].map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={shiftFilter === f.key ? 'default' : 'outline'}
              onClick={() => {
                setShiftFilter(f.key as any)
                setCurrentPage(1)
              }}
              className="h-8 text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {activeAssignments.length === 0 ? (
          <p className="text-slate-500 text-sm">{t('profile.noActiveEvents')}</p>
        ) : filteredShifts.length === 0 ? (
          <p className="text-slate-500 text-sm">{t('common.noData')}</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedShifts.map(a => {
                const ev = events.get(a.event_id)
                const shift = shifts.get(a.id)
                const role = roles.get(a.job_role_id)
                const coords = eventCoordinators.get(a.event_id) || []
                const docs = eventDocuments.get(a.event_id) || []
                if (!ev) return null
                const isLoading = actionLoading === a.id
                const hasClockIn = !!shift?.clock_in
                const hasClockOut = !!shift?.clock_out
                const clockInAllowed = isClockInAllowed(ev)

                return (
                  <Card key={a.id} className="border-l-4 border-l-emerald-500">
                    <CardContent className="py-4 space-y-3">
                      {/* Cabecera del evento */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{ev.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es')} · {ev.start_time}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {[ev.address, ev.city, ev.state].filter(Boolean).join(', ')}
                          </p>
                          {role && <p className="text-sm text-emerald-700 font-medium mt-1">{t('forms.role')}: {role.name}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                          hasClockIn && !hasClockOut && shift?.is_paused ? 'bg-slate-100 text-slate-600' :
                          hasClockIn && !hasClockOut ? 'bg-amber-100 text-amber-700' :
                          hasClockOut ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {hasClockIn && !hasClockOut && shift?.is_paused ? '⏸ ' + t('profile.clockInAvailable').replace('{minutes}', String(shiftStartMinutes)) :
                           hasClockIn && !hasClockOut ? '🟡 ' + t('profile.clockInStarting') :
                           hasClockOut ? '✅ ' + t('profile.shiftCompleted') : t('events.assignmentStatus.approved')}
                        </span>
                      </div>

                      {/* Panel informativo: coordinadores, notas y documentos */}
                      {(coords.length > 0 || ev.notes || docs.length > 0) && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {coords.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('events.coordinators')}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {coords.map(c => (
                                  <span key={c.user_id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                                    {c.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {ev.notes && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('events.notes')}</p>
                              <p className="text-xs text-slate-700 bg-amber-50 border border-amber-200 rounded p-2 whitespace-pre-wrap">{ev.notes}</p>
                            </div>
                          )}
                          {docs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('events.documents')}</p>
                              <div className="space-y-1">
                                {docs.map(doc => (
                                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 hover:underline">
                                    <span>📎</span>
                                    <span className="truncate">{doc.name}</span>
                                    <span className="text-slate-400 flex-shrink-0">↗</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reloj en tiempo real — solo cuando el turno está activo */}
                      {hasClockIn && !hasClockOut && shift?.clock_in && (
                        <ShiftClock
                          clockInIso={shift.clock_in}
                          totalPauseMinutes={parseFloat(shift.total_pause_minutes || '0')}
                          isPaused={shift.is_paused}
                          pauseStartIso={shift.pause_start}
                        />
                      )}

                      {/* Resumen del turno completado */}
                      {hasClockOut && shift && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm space-y-1">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Clock size={14} className="text-emerald-600" />
                            <span>
                              {t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong>
                              {' · '}
                              {t('profile.clockOut')}: <strong>{formatTime(shift.clock_out)}</strong>
                            </span>
                          </div>
                          {shift.hours_worked && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">
                                {t('common.total')}: <strong>{parseFloat(shift.hours_worked).toFixed(2)} {t('common.hours')}</strong>
                                {' · '}{t('common.rate')}: <strong>${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</strong>
                              </span>
                              {shift.total_pay && (
                                <span className="font-bold text-emerald-700 text-base">
                                  ${parseFloat(shift.total_pay).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hora de entrada cuando está en turno */}
                      {hasClockIn && !hasClockOut && shift && (
                        <p className="text-xs text-slate-500">
                          {t('profile.clockIn')}: <strong>{formatTime(shift.clock_in)}</strong>
                          {' · '}{t('common.rate')}: <strong>${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</strong>
                        </p>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-2 flex-wrap">
                        {!hasClockIn && (
                          <div className="space-y-1 w-full">
                            <Button
                              size="sm"
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                              onClick={() => handleClockIn(a.id)}
                              disabled={isLoading || !clockInAllowed}
                            >
                              <PlayCircle size={16} />
                              {isLoading ? t('profile.clockInStarting') : t('profile.clockIn')}
                            </Button>
                            {!clockInAllowed && (
                              <p className="text-xs text-slate-400">
                                ⏰ {t('profile.clockInAvailable').replace('{minutes}', String(shiftStartMinutes))}
                              </p>
                            )}
                          </div>
                        )}
                        {hasClockIn && !hasClockOut && (
                          <div className="flex gap-2 flex-wrap w-full">
                            {/* Pausa / Reanudar */}
                            {!shift?.is_paused ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="gap-2"
                                onClick={() => handlePause(a.id)}
                                disabled={isLoading}
                              >
                                <PauseCircle size={16} />
                                {isLoading ? '...' : t('common.pause')}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                                onClick={() => handleResume(a.id)}
                                disabled={isLoading}
                              >
                                <PlayIcon size={16} />
                                {isLoading ? '...' : t('common.resume')}
                              </Button>
                            )}
                            {/* Finalizar */}
                            <Button
                              size="sm"
                              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleClockOut(a.id)}
                              disabled={isLoading}
                            >
                              <StopCircle size={16} />
                              {isLoading ? t('profile.clockOutFinishing') : t('profile.clockOut')}
                            </Button>
                          </div>
                        )}
                        {hasClockOut && (
                          <div className="flex items-center gap-2 text-emerald-600 text-sm">
                            <CheckCircle size={16} />
                            <span className="font-medium">{t('profile.shiftCompleted')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Paginación */}
            {filteredShifts.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  {t('pagination.previous')}
                </Button>
                <span className="text-sm text-slate-600">
                  {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mi Reporte */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Mi Reporte</h3>
        <Button
          onClick={() => navigate('/reports')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Ver Mi Reporte de Horas y Pagos
        </Button>
      </div>

      {/* Historial */}
      {pastAssignments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-slate-500" /> {t('profile.history')}
          </h3>
          <div className="space-y-2">
            {pastAssignments.map(a => {
              const ev = events.get(a.event_id)
              const shift = shifts.get(a.id)
              const role = roles.get(a.job_role_id)
              if (!ev) return null
              return (
                <Card key={a.id} className="opacity-80">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{ev.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es')}
                          {role && ` · ${role.name}`}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {shift?.hours_worked && (
                          <p className="text-slate-600">{parseFloat(shift.hours_worked).toFixed(2)}h</p>
                        )}
                        {shift?.total_pay && (
                          <p className="font-bold text-emerald-700">${parseFloat(shift.total_pay).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
