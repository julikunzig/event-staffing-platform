import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { parseErrorMessage } from '@/lib/errorMessages'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, Shirt, Users, ArrowLeft, UserPlus, Search, X, Pencil, Timer } from 'lucide-react'
import ProgressBar from '@/components/ui/progress-bar'
import EventLocationMap from '@/components/EventLocationMap'

interface Event {
  id: number; name: string; event_date: string; start_time: string
  end_time: string | null; address: string; city: string | null
  state: string | null; zip_code: string | null
  dress_code: string | null; status: string
  latitude: number | null; longitude: number | null
}
interface Assignment {
  id: number; user_id: number; user_name: string; user_email: string
  user_phone: string | null; job_role_id: number; job_role_name: string
  status: string; assigned_by: number | null
}
interface JobRole { id: number; name: string; hourly_rate: string }
interface EmployeeWithRoles { id: number; name: string; email: string; phone: string | null; roles: JobRole[] }
interface EventJobRoleSlot {
  id: number; job_role_id: number; slots_required: number
  slots_filled: number; slots_pending: number
  hourly_rate_override: string | null
}

interface EventShift {
  shift_id: number; assignment_id: number; user_id: number
  user_name: string; job_role_name: string
  clock_in: string; clock_out: string | null
  hours_worked: string | null; hourly_rate_snapshot: string; total_pay: string | null
}

// Parsea un datetime del backend (puede tener microsegundos y/o timezone +00:00)
// y lo convierte a un timestamp JS válido
function parseUtcNaive(iso: string): number {
  if (!iso) return NaN
  // Reemplazar microsegundos (6 dígitos) por milisegundos (3 dígitos)
  // Ej: "2026-05-04T17:26:15.458596+00:00" → "2026-05-04T17:26:15.458+00:00"
  // Ej: "2026-05-04T17:26:15.458596" → "2026-05-04T17:26:15.458" (luego agregar Z)
  let normalized = iso.replace(/(\.\d{3})\d+/, '$1')
  // Si no tiene timezone, agregar Z (UTC)
  if (!normalized.match(/[Z+\-]\d*:?\d*$/)) {
    normalized = normalized + 'Z'
  }
  return new Date(normalized).getTime()
}

// Reloj en tiempo real para admin/coord
function LiveClock({ clockInIso }: { clockInIso: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = parseUtcNaive(clockInIso)
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [clockInIso])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="font-mono text-sm font-bold text-amber-700 tabular-nums">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  )
}

const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  created:        { label: 'Creado',                     color: 'bg-slate-100 text-slate-700' },
  published:      { label: 'Publicado',                  color: 'bg-blue-100 text-blue-700' },
  filled_pending: { label: 'Llenado - Pend. Aprobación', color: 'bg-amber-100 text-amber-700' },
  filled:         { label: 'Llenado Aprobado',           color: 'bg-emerald-100 text-emerald-700' },
  started:        { label: 'Iniciado',                   color: 'bg-yellow-100 text-yellow-700' },
  finished:       { label: 'Finalizado',                 color: 'bg-teal-100 text-teal-700' },
  cancelled:      { label: 'Cancelado',                  color: 'bg-red-100 text-red-700' },
}

const ASSIGN_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En espera de aprobación', color: 'bg-yellow-100 text-yellow-700' },
  invited:  { label: 'Invitado',                color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Confirmado',              color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado',               color: 'bg-red-100 text-red-700' },
  removed:  { label: 'Removido',                color: 'bg-gray-100 text-gray-500' },
}

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; color: string }> }) {
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
}

// ── Cierre masivo del evento por admin/coord ──────────────────────────────
function CloseEventPanel({ eventId, onClosed }: { eventId: number; onClosed: () => void }) {
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = async () => {
    if (!endTime) { setError('Ingresa la hora de fin'); return }
    if (!confirm(`¿Finalizar el evento para TODOS los empleados con hora de salida ${endTime}?`)) return
    setLoading(true); setError('')
    try {
      await api.post(`/shifts/events/${eventId}/close`, { end_time: endTime })
      onClosed()
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error al cerrar el evento')
    } finally { setLoading(false) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <p className="text-xs font-semibold text-slate-700 mb-2">Finalizar evento para todos los empleados:</p>
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-600 whitespace-nowrap">Hora de fin:</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <Button size="sm" variant="destructive" onClick={handleClose} disabled={loading || !endTime} className="gap-1">
          {loading ? 'Cerrando...' : '⏹ Cerrar Evento'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-xs text-slate-400 mt-1">
        Esta acción aplica la hora de fin a todos los empleados y cambia el evento a Finalizado.
      </p>
    </div>
  )
}

// ── Editar hora de entrada (solo en evento finalizado) ────────────────────
function EditClockIn({ shiftId, currentClockIn, onSaved }: {
  shiftId: number; currentClockIn: string; onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startEdit = () => {
    // Extraer HH:MM del ISO string
    const ts = parseUtcNaive(currentClockIn)
    if (!isNaN(ts)) {
      const d = new Date(ts)
      setNewTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`)
    }
    setEditing(true)
    setError('')
  }

  const handleSave = async () => {
    if (!newTime) return
    setLoading(true); setError('')
    try {
      // Construir datetime completo con la fecha del clock_in original
      const ts = parseUtcNaive(currentClockIn)
      const orig = new Date(ts)
      const [h, m] = newTime.split(':').map(Number)
      const newDt = new Date(orig)
      newDt.setHours(h, m, 0, 0)
      // Enviar como ISO string
      await api.patch(`/shifts/${shiftId}/clock-in`, {
        clock_in: newDt.toISOString()
      })
      setEditing(false)
      onSaved()
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error al actualizar')
    } finally { setLoading(false) }
  }

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className="text-xs text-blue-500 hover:text-blue-700 underline mt-0.5"
      >
        Editar hora entrada
      </button>
    )
  }

  return (
    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
      <input
        type="time"
        value={newTime}
        onChange={e => setNewTime(e.target.value)}
        className="border rounded px-1.5 py-0.5 text-xs"
      />
      <button
        onClick={handleSave}
        disabled={loading}
        className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded hover:bg-emerald-600 disabled:opacity-50"
      >
        {loading ? '...' : 'Guardar'}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-slate-500 hover:text-slate-700"
      >
        Cancelar
      </button>
      {error && <p className="text-xs text-red-500 w-full">{error}</p>}
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [event, setEvent] = useState<Event | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [myAssignment, setMyAssignment] = useState<{ id: number; job_role_id: number; status: string } | null>(null)
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [myRoles, setMyRoles] = useState<JobRole[]>([])
  const [eventRoles, setEventRoles] = useState<EventJobRoleSlot[]>([])
  const [selectedRole, setSelectedRole] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // Turnos activos del evento (admin/coord)
  const [activeShifts, setActiveShifts] = useState<EventShift[]>([])

  // Panel de invitación
  const [showInvite, setShowInvite] = useState(false)
  const [employees, setEmployees] = useState<EmployeeWithRoles[]>([])
  const [empLoading, setEmpLoading] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [selected, setSelected] = useState<Map<number, number>>(new Map())
  const [inviteResult, setInviteResult] = useState('')

  const loadData = async () => {
    try {
      const [evRes, rolesRes, eventRolesRes] = await Promise.all([
        api.get<Event>(`/events/${id}`),
        api.get<JobRole[]>('/job-roles'),
        api.get<EventJobRoleSlot[]>(`/events/${id}/job-roles`),
      ])
      setEvent(evRes.data)
      setJobRoles(rolesRes.data)
      setEventRoles(eventRolesRes.data)

      if (!isAdminOrCoord(user)) {
        try {
          const myRolesRes = await api.get<JobRole[]>('/job-roles/my-roles')
          setMyRoles(myRolesRes.data)
        } catch { setMyRoles([]) }
      }

      if (isAdminOrCoord(user)) {
        const asRes = await api.get<Assignment[]>(`/assignments/events/${id}/details`)
        setAssignments(asRes.data)
        const mine = asRes.data.find((a: Assignment) => a.user_id === user?.user_id)
        setMyAssignment(mine || null)

        // Cargar turnos activos si el evento está iniciado o finalizado
        if (['started', 'finished'].includes(evRes.data.status)) {
          try {
            const shiftsRes = await api.get<EventShift[]>(`/shifts/events/${id}/active`)
            setActiveShifts(shiftsRes.data)
          } catch { setActiveShifts([]) }
        } else {
          setActiveShifts([])
        }
      } else {
        const asRes = await api.get<Assignment[]>('/assignments/my-assignments')
        const mine = (asRes.data as any[]).find((a: any) => a.event_id === Number(id))
        setMyAssignment(mine || null)
      }
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [id])

  const getRoleName = (roleId: number) => jobRoles.find(r => r.id === roleId)?.name || `Rol #${roleId}`
  const getRoleRate = (roleId: number) => jobRoles.find(r => r.id === roleId)?.hourly_rate || '0'

  const openInvitePanel = async () => {
    setShowInvite(true)
    setInviteSearch('')
    setSelected(new Map())
    setInviteResult('')
    setEmpLoading(true)
    try {
      const res = await api.get<any[]>(`/events/${id}/eligible-employees`)
      const converted = res.data.map((e: any) => ({
        id: e.user_id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        roles: [{ id: e.job_role_id, name: e.job_role_name, hourly_rate: '0' }]
      }))
      const byUser = new Map<number, EmployeeWithRoles>()
      for (const emp of converted) {
        if (byUser.has(emp.id)) {
          byUser.get(emp.id)!.roles.push(...emp.roles)
        } else {
          byUser.set(emp.id, { ...emp })
        }
      }
      setEmployees(Array.from(byUser.values()))
    } catch { setEmployees([]) }
    finally { setEmpLoading(false) }
  }

  const filteredEmployees = employees.filter(e => {
    const q = inviteSearch.toLowerCase()
    return e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.phone || '').includes(q)
  })

  const toggleEmployee = (empId: number, roleId: number) => {
    const next = new Map(selected)
    if (next.has(empId)) next.delete(empId)
    else next.set(empId, roleId)
    setSelected(next)
  }

  const handleBulkInvite = async () => {
    if (selected.size === 0) return
    setActionLoading(true); setInviteResult('')
    try {
      const invitations = Array.from(selected.entries()).map(([userId, roleId]) => ({
        user_id: userId, job_role_id: roleId
      }))
      const res = await api.post(`/assignments/events/${id}/bulk-invite`, { invitations })
      setInviteResult(`✅ ${res.data.count} empleado(s) invitado(s) correctamente`)
      setSelected(new Map())
      await loadData()
    } catch (e: any) {
      const detail = e.response?.data?.detail || 'Error al invitar'
      const parsedError = parseErrorMessage(detail)
      setInviteResult(`❌ ${parsedError}`)
    } finally { setActionLoading(false) }
  }

  const handlePublish = async () => {
    setActionLoading(true); setError('')
    try { const r = await api.post<Event>(`/events/${id}/publish`); setEvent(r.data) }
    catch (e: any) { setError(e.response?.data?.detail || 'Error') }
    finally { setActionLoading(false) }
  }

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este evento?')) return
    setActionLoading(true); setError('')
    try { const r = await api.post<Event>(`/events/${id}/cancel`); setEvent(r.data) }
    catch (e: any) { setError(e.response?.data?.detail || 'Error') }
    finally { setActionLoading(false) }
  }

  const handleApply = async () => {
    if (!selectedRole) { setError('Selecciona un rol para aplicar'); return }

    // Verificar cupos antes de enviar (pending + approved)
    const er = eventRoles.find(r => r.job_role_id === selectedRole)
    if (er) {
      const totalActive = er.slots_filled + (er.slots_pending || 0)
      if (totalActive >= er.slots_required) {
        setError(`⚠️ El rol seleccionado ya está lleno (${totalActive}/${er.slots_required} cupos ocupados). Por favor selecciona otro rol.`)
        return
      }
    }

    setActionLoading(true); setError('')
    try {
      const r = await api.post<Assignment>(`/assignments/events/${id}/apply`, { job_role_id: selectedRole })
      setMyAssignment(r.data)
      await loadData()
    } catch (e: any) {
      const detail = e.response?.data?.detail || 'Error'
      const parsedError = parseErrorMessage(detail)
      if (detail.includes('Cupos') || detail.includes('agotados') || e.response?.status === 409) {
        setError(`⚠️ Este rol ya está lleno. No hay cupos disponibles.`)
      } else {
        setError(parsedError)
      }
    }
    finally { setActionLoading(false) }
  }

  const handleAccept = async () => {
    if (!myAssignment) return
    setActionLoading(true); setError('')
    try {
      const r = await api.patch<Assignment>(`/assignments/${myAssignment.id}/accept`)
      setMyAssignment(r.data)
      await loadData()
    }
    catch (e: any) {
      const detail = e.response?.data?.detail || 'Error'
      const parsedError = parseErrorMessage(detail)
      setError(parsedError)
    }
    finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    if (!myAssignment) return
    setActionLoading(true); setError('')
    try {
      const r = await api.patch<Assignment>(`/assignments/${myAssignment.id}/reject`)
      setMyAssignment(r.data)
      // Refrescar roles y estado del evento tras rechazar
      await loadData()
    }
    catch (e: any) { setError(e.response?.data?.detail || 'Error') }
    finally { setActionLoading(false) }
  }

  const handleApprove = async (assignmentId: number) => {
    setActionLoading(true); setError('')
    try {
      await api.patch(`/assignments/${assignmentId}/approve`)
      await loadData()
    }
    catch (e: any) {
      const detail = e.response?.data?.detail || 'Error'
      const parsedError = parseErrorMessage(detail)
      setError(parsedError)
    }
    finally { setActionLoading(false) }
  }

  const handleRemove = async (assignmentId: number) => {
    if (!confirm('¿Remover este empleado del evento?')) return
    setActionLoading(true); setError('')
    try { await api.delete(`/assignments/${assignmentId}`); await loadData() }
    catch (e: any) { setError(e.response?.data?.detail || 'Error') }
    finally { setActionLoading(false) }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (!event) return <p className="text-red-500">Evento no encontrado</p>

  const evStatus = EVENT_STATUS[event.status] || { label: event.status, color: 'bg-gray-100 text-gray-700' }
  const fullAddress = [event.address, event.city, event.state, event.zip_code].filter(Boolean).join(', ')

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} /> {t('common.back')}
        </Button>
        {isAdmin(user) && event && event.status !== 'cancelled' && (
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => navigate(`/events/${id}/edit`)}>
            <Pencil size={14} /> {t('common.edit')}
          </Button>
        )}
      </div>

      {/* Info del evento */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${evStatus.color}`}>{evStatus.label}</span>
          </div>
          <p className="text-gray-500">
            {new Date(event.event_date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Ubicación con mapa y navegación */}
          <EventLocationMap
            address={event.address}
            city={event.city}
            state={event.state}
            zipCode={event.zip_code}
            latitude={event.latitude}
            longitude={event.longitude}
          />
          
          <div className="flex items-center gap-2 text-gray-700"><Clock size={16} />{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</div>
          {event.dress_code && <div className="flex items-center gap-2 text-gray-700"><Shirt size={16} />{event.dress_code}</div>}

          {/* Roles requeridos del evento */}
          {eventRoles.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Users size={15} /> {t('events.rolesRequired')}
              </p>
              <div className="space-y-3">
                {eventRoles.map(er => {
                  const role = jobRoles.find(r => r.id === er.job_role_id)
                  const slotsPending = er.slots_pending || 0
                  const totalActive = er.slots_filled + slotsPending
                  const isFull = totalActive >= er.slots_required
                  const allApproved = er.slots_filled >= er.slots_required
                  return (
                    <div key={er.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{role?.name || `Rol #${er.job_role_id}`}</span>
                        <div className="flex items-center gap-2">
                          {isAdmin(user) && role && event.status === 'created' && (
                            <button
                              className="text-xs text-blue-500 underline"
                              onClick={() => {
                                const currentRate = er.hourly_rate_override
                                  ? parseFloat(er.hourly_rate_override.toString())
                                  : parseFloat(role.hourly_rate)
                                const newRate = prompt(
                                  `${t('events.rolesRequired')} ${role.name} ${t('common.rate')} (${t('common.rate')} ${t('common.of')} ${parseFloat(role.hourly_rate).toFixed(2)}/h):`,
                                  currentRate.toFixed(2)
                                )
                                if (newRate && !isNaN(parseFloat(newRate))) {
                                  api.patch(`/events/${id}/job-roles/${role.id}/rate`, {
                                    hourly_rate_override: parseFloat(newRate)
                                  }).then(() => loadData()).catch((e: any) => setError(e.response?.data?.detail || t('common.error')))
                                }
                              }}
                            >
                              {t('common.rate')} {t('common.of')} {t('events.title')}
                            </button>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            allApproved
                              ? 'bg-green-100 text-green-700'
                              : isFull
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            {er.slots_filled}/{er.slots_required}
                            {allApproved ? ' ✓ Completo' : isFull ? ' ⏳ Pend.' : ' cupos'}
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={er.slots_filled}
                        max={er.slots_required}
                        pending={slotsPending}
                      />
                      {role && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {er.hourly_rate_override
                            ? <><span className="line-through text-gray-400">${parseFloat(role.hourly_rate).toFixed(2)}</span> <span className="text-blue-600 font-medium">${parseFloat(er.hourly_rate_override).toFixed(2)}/hora (este evento)</span></>
                            : `$${parseFloat(role.hourly_rate).toFixed(2)}/hora`
                          }
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Estado del empleado */}
          {myAssignment && (
            <div className="mt-3 p-3 rounded-lg border">
              <p className="text-sm font-medium mb-1">{t('profile.activeEvents')}:</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={myAssignment.status} map={ASSIGN_STATUS} />
                <span className="text-sm text-gray-500">Rol: {getRoleName(myAssignment.job_role_id)} — ${parseFloat(getRoleRate(myAssignment.job_role_id)).toFixed(2)}/h</span>
              </div>
              {myAssignment.status === 'invited' && (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleAccept} disabled={actionLoading}>{t('common.confirm')}</Button>
                  <Button size="sm" variant="destructive" onClick={handleReject} disabled={actionLoading}>{t('common.cancel')}</Button>
                </div>
              )}
            </div>
          )}

          {/* Aplicar al evento (empleado) */}
          {!myAssignment && event.status === 'published' && !isAdminOrCoord(user) && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">{t('events.apply')} {t('events.title')}?</p>
              <div className="flex flex-col lg:flex-row gap-2">
                <select value={selectedRole} onChange={e => setSelectedRole(Number(e.target.value))}
                  className="flex-1 border rounded-md px-3 py-2 text-sm min-w-0">
                  <option value={0}>{t('forms.selectRole')}</option>
                  {myRoles.map(r => {
                    const eventRole = eventRoles.find(er => er.job_role_id === r.id)
                    const totalActive = eventRole ? eventRole.slots_filled + (eventRole.slots_pending || 0) : 0
                    const isFull = eventRole ? totalActive >= eventRole.slots_required : false
                    const available = eventRole ? eventRole.slots_required - totalActive : 0
                    return (
                      <option key={r.id} value={r.id} disabled={isFull}>
                        {r.name} — ${parseFloat(r.hourly_rate).toFixed(2)}/h
                        {isFull ? ' 🔴 LLENO' : ` (${available} cupo${available !== 1 ? 's' : ''} disponible${available !== 1 ? 's' : ''})`}
                      </option>
                    )
                  })}
                </select>
                <Button size="sm" onClick={handleApply}
                  disabled={actionLoading || !selectedRole || (() => {
                    const er = eventRoles.find(r => r.job_role_id === selectedRole)
                    if (!er) return false
                    return (er.slots_filled + (er.slots_pending || 0)) >= er.slots_required
                  })()}
                  className="w-full lg:w-auto">
                  {t('events.apply')}
                </Button>
              </div>
              {selectedRole > 0 && (() => {
                const er = eventRoles.find(r => r.job_role_id === selectedRole)
                if (!er) return null
                const totalActive = er.slots_filled + (er.slots_pending || 0)
                if (totalActive >= er.slots_required) {
                  return (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs lg:text-sm text-red-700 break-words">
                      🔴 <strong>Este rol está lleno.</strong> Ya se cubrieron los {er.slots_required} cupos requeridos. Selecciona otro rol si está disponible.
                    </div>
                  )
                }
                return <p className="text-xs text-green-600 mt-1">✅ {er.slots_required - totalActive} cupo(s) disponible(s) de {er.slots_required}</p>
              })()}
              {myRoles.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">No tienes roles asignados en esta empresa. Contacta al administrador.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          {/* Acciones del admin */}
          {isAdmin(user) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {event.status === 'created' && (
                <Button onClick={handlePublish} disabled={actionLoading}>Publicar</Button>
              )}
              {!['cancelled', 'finished'].includes(event.status) && (
                <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>Cancelar</Button>
              )}
              {/* Invitar empleados disponible desde estado 'created' */}
              {!['cancelled', 'finished'].includes(event.status) && (
                <Button variant="outline" className="gap-2" onClick={openInvitePanel}>
                  <UserPlus size={16} /> {t('events.inviteEmployees')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de invitación masiva */}
      {showInvite && isAdmin(user) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus size={16} /> {t('events.inviteEmployees')}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowInvite(false)}><X size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Resumen de cupos disponibles */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-600 mb-1">{t('events.rolesRequired')}:</p>
              {eventRoles.map(er => {
                const role = jobRoles.find(r => r.id === er.job_role_id)
                const totalActive = er.slots_filled + (er.slots_pending || 0)
                const free = er.slots_required - totalActive
                return (
                  <div key={er.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{role?.name || `Rol #${er.job_role_id}`}</span>
                    <span className={`font-medium px-2 py-0.5 rounded-full ${free > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {free > 0 ? `${free} ${t('forms.slots')}${free !== 1 ? 's' : ''} ${t('common.of')} ${er.slots_required}` : 'Lleno'}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-sm text-slate-500">{t('forms.selectRoleForRow')}</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <Input value={inviteSearch} onChange={e => setInviteSearch(e.target.value)}
                placeholder={t('forms.filterByName')}
                className="pl-8" />
            </div>

            {empLoading ? (
              <p className="text-sm text-slate-500">Cargando empleados...</p>
            ) : filteredEmployees.length === 0 ? (
              <p className="text-sm text-slate-500">No hay empleados con roles asignados.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
                {filteredEmployees.map(emp => {
                  // Verificar si el rol seleccionado para este empleado tiene cupos
                  const currentRoleId = selected.get(emp.id) || emp.roles[0]?.id || 0
                  const er = eventRoles.find(r => r.job_role_id === currentRoleId)
                  const totalActive = er ? er.slots_filled + (er.slots_pending || 0) : 0
                  const roleFull = er ? totalActive >= er.slots_required : false

                  return (
                    <div key={emp.id} className={`p-3 ${roleFull && !selected.has(emp.id) ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selected.has(emp.id)}
                          disabled={roleFull && !selected.has(emp.id)}
                          onChange={() => {
                            const defaultRole = emp.roles[0]?.id || 0
                            toggleEmployee(emp.id, selected.get(emp.id) || defaultRole)
                          }}
                          className="mt-1 rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email}{emp.phone ? ` · ${emp.phone}` : ''}</p>
                          {selected.has(emp.id) && (
                            <select
                              value={selected.get(emp.id)}
                              onChange={e => {
                                const next = new Map(selected)
                                next.set(emp.id, Number(e.target.value))
                                setSelected(next)
                              }}
                              className="mt-1 border rounded px-2 py-1 text-xs w-full"
                            >
                              {emp.roles.map(r => {
                                const erForRole = eventRoles.find(er => er.job_role_id === r.id)
                                const activeForRole = erForRole ? erForRole.slots_filled + (erForRole.slots_pending || 0) : 0
                                const fullForRole = erForRole ? activeForRole >= erForRole.slots_required : true
                                return (
                                  <option key={r.id} value={r.id} disabled={fullForRole}>
                                    {r.name}{fullForRole ? ' — LLENO' : ''}
                                  </option>
                                )
                              })}
                            </select>
                          )}
                          {!selected.has(emp.id) && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Roles: {emp.roles.map(r => r.name).join(', ')}
                              {roleFull && <span className="text-red-500 ml-1">— rol lleno</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{selected.size} {t('common.selected')}</p>
              <Button onClick={handleBulkInvite} disabled={actionLoading || selected.size === 0}>
                {actionLoading ? t('events.inviting') : `${t('events.sendInvitations')} (${selected.size})`}
              </Button>
            </div>
            {inviteResult && <p className="text-sm">{inviteResult}</p>}
          </CardContent>
        </Card>
      )}

      {/* Panel de turnos — admin/coord cuando el evento está iniciado o finalizado */}
      {isAdminOrCoord(user) && ['started', 'finished'].includes(event.status) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer size={16} className="text-amber-600" />
              Turnos del Evento
              {activeShifts.length > 0 && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({activeShifts.filter(s => s.clock_in && !s.clock_out).length} en curso,{' '}
                  {activeShifts.filter(s => s.clock_out).length} completados)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeShifts.length === 0 && (
              <p className="text-sm text-slate-500">Ningún empleado ha iniciado turno aún.</p>
            )}

            {activeShifts.map(shift => {
              const isActive = !!shift.clock_in && !shift.clock_out
              const formatTime = (iso: string | null) => {
                if (!iso) return '—'
                const ts = parseUtcNaive(iso)
                if (isNaN(ts)) return '—'
                return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
              }

              return (
                <div key={shift.shift_id}
                  className={`p-3 rounded-lg border ${isActive ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-3">
                    {/* Info del empleado */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{shift.user_name}</p>
                      <p className="text-xs text-slate-500">{shift.job_role_name} · ${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</p>
                      {/* Editar hora de entrada — solo en evento finalizado */}
                      {event.status === 'finished' && (
                        <EditClockIn
                          shiftId={shift.shift_id}
                          currentClockIn={shift.clock_in}
                          onSaved={loadData}
                        />
                      )}
                    </div>

                    {/* Reloj o resumen */}
                    <div className="flex-shrink-0 text-right">
                      {isActive ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <LiveClock clockInIso={shift.clock_in} />
                          </div>
                          <p className="text-xs text-amber-600">Entrada: {formatTime(shift.clock_in)}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs font-semibold text-emerald-700">
                            {shift.hours_worked ? `${parseFloat(shift.hours_worked).toFixed(2)}h` : '—'}
                          </span>
                          <p className="text-xs text-slate-500">
                            {formatTime(shift.clock_in)} → {formatTime(shift.clock_out)}
                          </p>
                          {shift.total_pay && (
                            <p className="text-xs font-bold text-emerald-700">${parseFloat(shift.total_pay).toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Totales */}
            {activeShifts.some(s => s.clock_out) && (
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Total horas completadas:</span>
                <span className="font-bold text-slate-800">
                  {activeShifts
                    .filter(s => s.hours_worked)
                    .reduce((acc, s) => acc + parseFloat(s.hours_worked!), 0)
                    .toFixed(2)}h
                </span>
              </div>
            )}

            {/* Cierre masivo — solo en evento iniciado */}
            {event.status === 'started' && (
              <CloseEventPanel eventId={Number(id)} onClosed={loadData} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de asignaciones (admin/coord) */}
      {isAdminOrCoord(user) && assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={16} /> {t('events.rolesRequired')} ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{a.user_name}</p>
                      <p className="text-xs text-gray-500">{a.user_email}</p>
                      {a.user_phone && <p className="text-xs text-gray-500">{a.user_phone}</p>}
                      <p className="text-xs text-blue-600 font-medium mt-0.5">Rol: {a.job_role_name}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <StatusBadge status={a.status} map={ASSIGN_STATUS} />
                      {isAdmin(user) && (
                        <>
                          {a.status === 'pending' && (
                            <Button size="sm" onClick={() => handleApprove(a.id)} disabled={actionLoading}>{t('common.confirm')}</Button>
                          )}
                          {!['removed', 'rejected'].includes(a.status) && (
                            <Button size="sm" variant="destructive" onClick={() => handleRemove(a.id)} disabled={actionLoading}>{t('common.delete')}</Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
