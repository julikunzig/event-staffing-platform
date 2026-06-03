import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { isAdmin, isAdminOrCoord } from '@/lib/auth'
import { parseErrorMessage } from '@/lib/errorMessages'
import api from '@/lib/api'
import { MapPin, Clock, Shirt, Users, X, UserPlus, Search, Pencil, Timer, FileText, Link as LinkIcon, ChevronRight } from 'lucide-react'
import ProgressBar from '@/components/ui/progress-bar'
import EventLocationMap from '@/components/EventLocationMap'
import ConfirmDialog from '@/pages/ConfirmDialog'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

interface Event {
  id: number; name: string; event_date: string; start_time: string
  end_time: string | null; address: string; city: string | null
  state: string | null; zip_code: string | null
  dress_code: string | null; notes: string | null; status: string
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
  slots_filled: number; slots_pending: number; hourly_rate_override: string | null
  start_time: string | null
}
interface EventShift {
  shift_id: number; assignment_id: number; user_id: number
  user_name: string; job_role_name: string
  clock_in: string; clock_out: string | null
  hours_worked: string | null; hourly_rate_snapshot: string; total_pay: string | null
}
interface EventDocument { id: number; name: string; url: string; created_at: string }

function parseUtcNaive(iso: string): number {
  if (!iso) return NaN
  let normalized = iso.replace(/(\.\d{3})\d+/, '$1')
  if (!normalized.match(/[Z+\-]\d*:?\d*$/)) normalized = normalized + 'Z'
  return new Date(normalized).getTime()
}

function LiveClock({ clockInIso }: { clockInIso: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = parseUtcNaive(clockInIso)
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    tick(); const interval = setInterval(tick, 1000); return () => clearInterval(interval)
  }, [clockInIso])
  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#b45309' }}>{pad(h)}:{pad(m)}:{pad(s)}</span>
}

function EditClockIn({ shiftId, currentClockIn, onSaved }: { shiftId: number; currentClockIn: string; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const startEdit = () => {
    const ts = parseUtcNaive(currentClockIn)
    if (!isNaN(ts)) { const d = new Date(ts); setNewTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`) }
    setEditing(true); setError('')
  }
  const handleSave = async () => {
    if (!newTime) return; setLoading(true); setError('')
    try {
      const ts = parseUtcNaive(currentClockIn); const orig = new Date(ts)
      const [h, m] = newTime.split(':').map(Number); const newDt = new Date(orig); newDt.setHours(h, m, 0, 0)
      await api.patch(`/shifts/${shiftId}/clock-in`, { clock_in: newDt.toISOString() })
      setEditing(false); onSaved()
    } catch (e: any) { setError(e.response?.data?.detail || 'Error') } finally { setLoading(false) }
  }
  if (!editing) return <button onClick={startEdit} style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Editar entrada</button>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
      <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px 6px', fontSize: '12px' }} />
      <button onClick={handleSave} disabled={loading} style={{ fontSize: '11px', background: GREEN, color: '#fff', border: 'none', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer' }}>{loading ? '...' : 'Guardar'}</button>
      <button onClick={() => setEditing(false)} style={{ fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
      {error && <p style={{ fontSize: '11px', color: '#dc2626', width: '100%', margin: 0 }}>{error}</p>}
    </div>
  )
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  created:        { label: 'Creado',        bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
  published:      { label: 'Publicado',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  filled_pending: { label: 'Pend. Aprobac.',bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  filled:         { label: 'Llenado',       bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  started:        { label: 'Iniciado',      bg: '#fefce8', color: '#854d0e', border: '#fef08a' },
  finished:       { label: 'Finalizado',    bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
  cancelled:      { label: 'Cancelado',     bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}
const assignConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: 'En espera',   bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  invited:  { label: 'Invitado',    bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  approved: { label: 'Confirmado',  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  rejected: { label: 'Rechazado',   bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  removed:  { label: 'Removido',    bg: '#f9fafb', color: '#9ca3af', border: '#e5e7eb' },
}

function Pill({ status, map }: { status: string; map: Record<string, any> }) {
  const s = map[status] || { label: status, bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{s.label}</span>
}

const S = {
  section: { borderTop: '1px solid #f3f4f6', paddingTop: '14px', marginTop: '14px' } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6b7280', marginBottom: '10px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' } as React.CSSProperties,
  card: (accent?: string): React.CSSProperties => ({ background: '#f9fafb', border: `1px solid ${accent || '#e5e7eb'}`, borderRadius: '10px', padding: '10px 12px' }),
}

interface Props {
  eventId: number
  onClose: () => void
  onEdit?: (id: number) => void
  onStatusChange?: () => void
}

export default function EventDetailModal({ eventId, onClose, onEdit, onStatusChange }: Props) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [event, setEvent]             = useState<Event | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [myAssignment, setMyAssignment] = useState<{ id: number; job_role_id: number; status: string } | null>(null)
  const [jobRoles, setJobRoles]       = useState<JobRole[]>([])
  const [myRoles, setMyRoles]         = useState<JobRole[]>([])
  const [eventRoles, setEventRoles]   = useState<EventJobRoleSlot[]>([])
  const [selectedRole, setSelectedRole] = useState<number>(0)
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]             = useState('')
  const [activeShifts, setActiveShifts] = useState<EventShift[]>([])
  const [documents, setDocuments]     = useState<EventDocument[]>([])
  const [coordinators, setCoordinators] = useState<{ user_id: number; name: string; email: string }[]>([])
  const [showInvite, setShowInvite]   = useState(false)
  const [employees, setEmployees]     = useState<EmployeeWithRoles[]>([])
  const [empLoading, setEmpLoading]   = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [selected, setSelected]       = useState<Map<number, number>>(new Map())
  const [inviteResult, setInviteResult] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null)
  const [closeLoading, setCloseLoading] = useState(false)
  const [closeTime, setCloseTime]     = useState('')
  const [activeTab, setActiveTab]     = useState<'info' | 'shifts' | 'assignments'>('info')

  const loadData = async () => {
    try {
      const [evRes, rolesRes, erRes] = await Promise.all([
        api.get<Event>(`/events/${eventId}`),
        api.get<JobRole[]>('/job-roles'),
        api.get<EventJobRoleSlot[]>(`/events/${eventId}/job-roles`),
      ])
      setEvent(evRes.data); setJobRoles(rolesRes.data); setEventRoles(erRes.data)
      if (!isAdminOrCoord(user)) {
        try { const r = await api.get<JobRole[]>('/job-roles/my-roles'); setMyRoles(r.data) } catch { setMyRoles([]) }
      }
      if (isAdminOrCoord(user)) {
        const asRes = await api.get<Assignment[]>(`/assignments/events/${eventId}/details`)
        setAssignments(asRes.data)
        const mine = asRes.data.find((a: Assignment) => a.user_id === user?.user_id)
        setMyAssignment(mine || null)
        if (['started', 'finished'].includes(evRes.data.status)) {
          try { const sr = await api.get<EventShift[]>(`/shifts/events/${eventId}/active`); setActiveShifts(sr.data) } catch { setActiveShifts([]) }
        } else { setActiveShifts([]) }
      } else {
        const asRes = await api.get<Assignment[]>('/assignments/my-assignments')
        const mine = (asRes.data as any[]).find((a: any) => a.event_id === eventId)
        setMyAssignment(mine || null)
      }
      try { const dr = await api.get<EventDocument[]>(`/events/${eventId}/documents`); setDocuments(dr.data) } catch { setDocuments([]) }
      try { const cr = await api.get<any[]>(`/events/${eventId}/coordinators`); setCoordinators(cr.data) } catch { setCoordinators([]) }
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { setActiveTab('info'); setCloseTime(''); loadData() }, [eventId])

  const getRoleName = (id: number) => jobRoles.find(r => r.id === id)?.name || `Rol #${id}`
  const getRoleRate = (id: number) => jobRoles.find(r => r.id === id)?.hourly_rate || '0'

  const openInvitePanel = async () => {
    setShowInvite(true); setInviteSearch(''); setSelected(new Map()); setInviteResult(''); setEmpLoading(true)
    try {
      const res = await api.get<any[]>(`/events/${eventId}/eligible-employees`)
      const converted = res.data.map((e: any) => ({ id: e.user_id, name: e.name, email: e.email, phone: e.phone, roles: [{ id: e.job_role_id, name: e.job_role_name, hourly_rate: '0' }] }))
      const byUser = new Map<number, EmployeeWithRoles>()
      for (const emp of converted) { if (byUser.has(emp.id)) byUser.get(emp.id)!.roles.push(...emp.roles); else byUser.set(emp.id, { ...emp }) }
      setEmployees(Array.from(byUser.values()))
    } catch { setEmployees([]) } finally { setEmpLoading(false) }
  }

  const filteredEmployees = employees.filter(e => {
    const q = inviteSearch.toLowerCase()
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.phone || '').includes(q)
  })

  const toggleEmployee = (empId: number, erId: number) => {
    const next = new Map(selected)
    if (next.has(empId)) {
      next.delete(empId)
    } else {
      // Check if this specific event_job_role has available slots
      const er = eventRoles.find(r => r.id === erId)
      if (er) {
        // Count all employees already selected for this SAME event_job_role
        const selectedForThisShift = Array.from(next.values()).filter(v => v === erId).length
        // Also count selected for ANY event_job_role with same job_role_id
        const sameRoleErs = eventRoles.filter(r => r.job_role_id === er.job_role_id)
        const totalSlotsForRole = sameRoleErs.reduce((sum, r) => sum + r.slots_required, 0)
        const totalFilledForRole = sameRoleErs.reduce((sum, r) => sum + r.slots_filled + (r.slots_pending || 0), 0)
        const totalSelectedForRole = Array.from(next.values()).filter(v => sameRoleErs.some(r => r.id === v)).length
        
        if (totalSelectedForRole + totalFilledForRole >= totalSlotsForRole) {
          setInviteResult(`⚠️ No hay más cupos disponibles para este rol (${totalFilledForRole + totalSelectedForRole}/${totalSlotsForRole})`)
          return
        }
      }
      next.set(empId, erId)
      setInviteResult('')
    }
    setSelected(next)
  }

  const handleBulkInvite = async () => {
    if (selected.size === 0) return; setActionLoading(true); setInviteResult('')
    try {
      // selected stores er.id (event_job_role ID), resolve to job_role_id for the API
      const invitations = Array.from(selected.entries()).map(([userId, erId]) => {
        const er = eventRoles.find(r => r.id === erId)
        return { user_id: userId, job_role_id: er ? er.job_role_id : erId, event_job_role_id: erId }
      })
      const res = await api.post(`/assignments/events/${eventId}/bulk-invite`, { invitations })
      setInviteResult(`✅ ${res.data.count} empleado(s) invitado(s)`); setSelected(new Map()); await loadData()
    } catch (e: any) { setInviteResult(`❌ ${parseErrorMessage(e.response?.data?.detail || 'Error')}`) } finally { setActionLoading(false) }
  }

  const handlePublish = async () => { setActionLoading(true); setError(''); try { const r = await api.post<Event>(`/events/${eventId}/publish`); setEvent(r.data); onStatusChange?.() } catch (e: any) { setError(e.response?.data?.detail || 'Error') } finally { setActionLoading(false) } }
  const handleCancel  = async () => {
    setConfirmDialog({
      title: '¿Cancelar evento?',
      message: 'Esta acción no se puede deshacer. El evento quedará cancelado.',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setActionLoading(true); setError('')
        try { const r = await api.post<Event>(`/events/${eventId}/cancel`); setEvent(r.data); onStatusChange?.() }
        catch (e: any) { setError(e.response?.data?.detail || 'Error') }
        finally { setActionLoading(false) }
      }
    })
  }

  const handleApply = async () => {
    if (!selectedRole) { setError('Selecciona un rol para aplicar'); return }
    const er = eventRoles.find(r => r.job_role_id === selectedRole)
    if (er && (er.slots_filled + (er.slots_pending || 0)) >= er.slots_required) { setError('⚠️ El rol seleccionado ya está lleno'); return }
    setActionLoading(true); setError('')
    try { const r = await api.post<Assignment>(`/assignments/events/${eventId}/apply`, { job_role_id: selectedRole }); setMyAssignment(r.data); await loadData() }
    catch (e: any) { setError(parseErrorMessage(e.response?.data?.detail || 'Error')) } finally { setActionLoading(false) }
  }

  const handleAccept = async () => { if (!myAssignment) return; setActionLoading(true); setError(''); try { const r = await api.patch<Assignment>(`/assignments/${myAssignment.id}/accept`); setMyAssignment(r.data); await loadData() } catch (e: any) { setError(parseErrorMessage(e.response?.data?.detail || 'Error')) } finally { setActionLoading(false) } }
  const handleReject = async () => { if (!myAssignment) return; setActionLoading(true); setError(''); try { const r = await api.patch<Assignment>(`/assignments/${myAssignment.id}/reject`); setMyAssignment(r.data); await loadData() } catch (e: any) { setError(e.response?.data?.detail || 'Error') } finally { setActionLoading(false) } }
  const handleApprove = async (id: number) => { setActionLoading(true); setError(''); try { await api.patch(`/assignments/${id}/approve`); await loadData() } catch (e: any) { setError(parseErrorMessage(e.response?.data?.detail || 'Error')) } finally { setActionLoading(false) } }
  const handleRemove  = async (id: number) => {
    setConfirmDialog({
      title: '¿Remover empleado?',
      message: 'El empleado será removido de este evento.',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setActionLoading(true); setError('')
        try { await api.delete(`/assignments/${id}`); await loadData() }
        catch (e: any) { setError(e.response?.data?.detail || 'Error') }
        finally { setActionLoading(false) }
      }
    })
  }

  const handleCloseEvent = async () => {
    if (!closeTime) { setError('Ingresa la hora de fin'); return }
    setConfirmDialog({
      title: '¿Finalizar evento?',
      message: `Se aplicará la hora de salida ${closeTime} a TODOS los empleados activos.`,
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setCloseLoading(true); setError('')
        try { await api.post(`/shifts/events/${eventId}/close`, { end_time: closeTime }); await loadData(); onStatusChange?.() }
        catch (e: any) { setError(e.response?.data?.detail || 'Error') }
        finally { setCloseLoading(false) }
      }
    })
  }

  if (!event && !loading) return null

  const evSt  = event ? (statusConfig[event.status] || { label: event.status, bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }) : null
  const tabs  = [
    { key: 'info' as const, label: 'Información' },
    ...(isAdminOrCoord(user) && ['started','finished'].includes(event?.status || '') ? [{ key: 'shifts' as const, label: activeShifts.length > 0 ? `Turnos (${activeShifts.length})` : 'Turnos' }] : []),
    ...(isAdminOrCoord(user) && assignments.length > 0 ? [{ key: 'assignments' as const, label: `Personal (${assignments.length})` }] : []),
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 50 }} onClick={onClose} />

      <div style={{
        position: 'fixed', zIndex: 51,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: '640px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: '1.25rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        fontFamily: "'Poppins',sans-serif",
      }} onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN})`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {loading ? <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '6px', width: '60%' }} /> : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>{event?.name}</h2>
                    {evSt && <Pill status={event!.status} map={statusConfig} />}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    {event && new Date(event.event_date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {!loading && isAdmin(user) && event?.status !== 'cancelled' && event?.status !== 'finished' && onEdit && (
                <button onClick={() => { onClose(); onEdit(eventId) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <Pencil size={13} />Editar
                </button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {!loading && tabs.length > 1 && (
            <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #f3f4f6' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: 'transparent', color: activeTab === tab.key ? GREEN : '#9ca3af', borderBottom: `2px solid ${activeTab === tab.key ? GREEN : 'transparent'}`, transition: 'all 0.15s', fontFamily: "'Poppins',sans-serif" }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `3px solid #e5e7eb`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* ── TAB INFO ── */}
              {activeTab === 'info' && event && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {/* Mapa + ubicación */}
                  <EventLocationMap address={event.address} city={event.city} state={event.state} zipCode={event.zip_code} latitude={event.latitude} longitude={event.longitude} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={S.infoRow}><MapPin size={15} color="#9ca3af" />{[event.address, event.city, event.state, event.zip_code].filter(Boolean).join(', ')}</div>
                    <div style={S.infoRow}><Clock size={15} color="#9ca3af" />{event.start_time}{event.end_time ? ` — ${event.end_time}` : ''}</div>
                    {event.dress_code && <div style={S.infoRow}><Shirt size={15} color="#9ca3af" /><span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{event.dress_code}</span></div>}
                  </div>

                  {/* Coordinadores */}
                  {coordinators.length > 0 && (
                    <div style={S.section}>
                      <p style={S.sectionTitle}><Users size={12} />{t('events.coordinators')}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {coordinators.map(c => (
                          <span key={c.user_id} style={{ background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px' }}>{c.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {event.notes && (
                    <div style={S.section}>
                      <p style={S.sectionTitle}><FileText size={12} />{t('events.notes')}</p>
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{event.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Documentos */}
                  {documents.length > 0 && (
                    <div style={S.section}>
                      <p style={S.sectionTitle}><LinkIcon size={12} />{t('events.documents')}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {documents.map(doc => (
                          <a key={doc.id} href={doc.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: GREEN, fontSize: '13px', fontWeight: 500 }}>
                            <LinkIcon size={13} style={{ flexShrink: 0 }} /><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span><ChevronRight size={13} style={{ flexShrink: 0, color: '#9ca3af' }} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roles requeridos */}
                  {eventRoles.length > 0 && (
                    <div style={S.section}>
                      <p style={S.sectionTitle}><Users size={12} />{t('events.rolesRequired')}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {eventRoles.map(er => {
                          const role = jobRoles.find(r => r.id === er.job_role_id)
                          const pending = er.slots_pending || 0
                          const total = er.slots_filled + pending
                          const allApproved = er.slots_filled >= er.slots_required
                          return (
                            <div key={er.id}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{role?.name || `Rol #${er.job_role_id}`}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: allApproved ? '#f0fdf4' : total >= er.slots_required ? '#fffbeb' : '#eff6ff', color: allApproved ? '#15803d' : total >= er.slots_required ? '#b45309' : '#1d4ed8' }}>
                                  {er.slots_filled}/{er.slots_required}{allApproved ? ' ✓' : total >= er.slots_required ? ' ⏳' : ' cupos'}
                                </span>
                              </div>
                              <ProgressBar value={er.slots_filled} max={er.slots_required} pending={pending} />
                              {role && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>{er.start_time ? `🕐 ${er.start_time.substring(0, 5)} · ` : ''}{er.hourly_rate_override ? <><s>${parseFloat(role.hourly_rate).toFixed(2)}</s> <span style={{ color: '#3b82f6', fontWeight: 600 }}>${parseFloat(er.hourly_rate_override).toFixed(2)}/h</span></> : `$${parseFloat(role.hourly_rate).toFixed(2)}/h`}</p>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mi asignación */}
                  {myAssignment && (
                    <div style={S.section}>
                      <div style={{ ...S.card('#bbf7d0'), display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tu asignación</p>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{getRoleName(myAssignment.job_role_id)} — ${parseFloat(getRoleRate(myAssignment.job_role_id)).toFixed(2)}/h</p>
                        </div>
                        <Pill status={myAssignment.status} map={assignConfig} />
                      </div>
                      {myAssignment.status === 'invited' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button onClick={handleAccept} disabled={actionLoading}
                            style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{t('common.confirm')}</button>
                          <button onClick={handleReject} disabled={actionLoading}
                            style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{t('common.cancel')}</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aplicar */}
                  {!myAssignment && event.status === 'published' && !isAdminOrCoord(user) && (
                    <div style={{ ...S.section }}>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>¿Aplicar a este evento?</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <select value={selectedRole} onChange={e => setSelectedRole(Number(e.target.value))}
                            style={{ flex: 1, minWidth: '160px', height: '38px', background: '#fff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#111827', outline: 'none' }}>
                            <option value={0}>{t('forms.selectRole')}</option>
                            {myRoles.map(r => {
                              const er = eventRoles.find(e => e.job_role_id === r.id)
                              const total = er ? er.slots_filled + (er.slots_pending || 0) : 0
                              const full = er ? total >= er.slots_required : false
                              return <option key={r.id} value={r.id} disabled={full}>{r.name} — ${parseFloat(r.hourly_rate).toFixed(2)}/h{full ? ' 🔴' : er ? ` (${er.slots_required - total} disp.)` : ''}</option>
                            })}
                          </select>
                          <button onClick={handleApply} disabled={actionLoading || !selectedRole}
                            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: !selectedRole ? 'not-allowed' : 'pointer', opacity: !selectedRole ? 0.6 : 1 }}>
                            {t('events.apply')}
                          </button>
                        </div>
                        {myRoles.length === 0 && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#c2410c' }}>No tienes roles asignados. Contacta al administrador.</p>}
                      </div>
                    </div>
                  )}

                  {/* Acciones admin */}
                  {isAdmin(user) && (
                    <div style={S.section}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {event.status === 'created' && (
                          <button onClick={handlePublish} disabled={actionLoading}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            {t('events.publish')}
                          </button>
                        )}
                        {!['cancelled','finished'].includes(event.status) && (
                          <>
                            <button onClick={handleCancel} disabled={actionLoading}
                              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              {t('events.cancel')}
                            </button>
                            <button onClick={openInvitePanel}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              <UserPlus size={14} />{t('events.inviteEmployees')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Panel invitar */}
                  {showInvite && isAdmin(user) && (
                    <div style={{ ...S.section }}>
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('events.inviteEmployees')}</p>
                          <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                          <input value={inviteSearch} onChange={e => setInviteSearch(e.target.value)} placeholder={t('forms.filterByName')}
                            style={{ width: '100%', height: '36px', paddingLeft: '30px', paddingRight: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        {empLoading ? <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>{t('common.loading')}</p> : filteredEmployees.length === 0 ? <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>{t('events.noEmployeesWithRoles')}</p> : (
                          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                            {filteredEmployees.map(emp => {
                              const curRole = selected.get(emp.id) || emp.roles[0]?.id || 0
                              // Find matching eventRoles for this employee's roles
                              const matchingEventRoles = eventRoles.filter(er => emp.roles.some(r => r.id === er.job_role_id))
                              const selectedEr = matchingEventRoles.find(er => er.job_role_id === curRole) || matchingEventRoles[0]
                              const full = selectedEr ? (selectedEr.slots_filled + (selectedEr.slots_pending || 0)) >= selectedEr.slots_required : false
                              return (
                                <div key={emp.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', opacity: full && !selected.has(emp.id) ? 0.5 : 1 }}>
                                  <input type="checkbox" checked={selected.has(emp.id)} disabled={full && !selected.has(emp.id)}
                                    onChange={() => toggleEmployee(emp.id, matchingEventRoles[0]?.id || emp.roles[0]?.id || 0)} style={{ marginTop: '2px', accentColor: GREEN }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{emp.name}</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{emp.email}{emp.phone ? ` · ${emp.phone}` : ''}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '3px' }}>
                                      {emp.roles.map(r => (
                                        <span key={r.id} style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                          {r.name}
                                        </span>
                                      ))}
                                    </div>
                                    {selected.has(emp.id) && matchingEventRoles.length > 0 && (
                                      <select value={selected.get(emp.id)} onChange={e => { const n = new Map(selected); n.set(emp.id, Number(e.target.value)); setSelected(n) }}
                                        style={{ marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 6px', fontSize: '11px', width: '100%' }}>
                                        {matchingEventRoles.map(er => {
                                          const roleName = jobRoles.find(r => r.id === er.job_role_id)?.name || `Rol #${er.job_role_id}`
                                          const timeStr = er.start_time ? er.start_time.substring(0, 5) : ''
                                          const rateStr = er.hourly_rate_override ? `$${parseFloat(er.hourly_rate_override).toFixed(0)}` : ''
                                          const fl = (er.slots_filled + (er.slots_pending || 0)) >= er.slots_required
                                          return <option key={er.id} value={er.id} disabled={fl}>{roleName}{timeStr ? ` · ${timeStr}` : ''}{rateStr ? ` · ${rateStr}/h` : ''} ({er.slots_filled}/{er.slots_required}){fl ? ' — LLENO' : ''}</option>
                                        })}
                                      </select>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{selected.size} seleccionado(s)</span>
                          <button onClick={handleBulkInvite} disabled={actionLoading || selected.size === 0}
                            style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: selected.size === 0 ? '#e5e7eb' : `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: selected.size === 0 ? '#9ca3af' : '#fff', fontSize: '12px', fontWeight: 700, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
                            {actionLoading ? t('events.inviting') : `${t('events.sendInvitations')} (${selected.size})`}
                          </button>
                        </div>
                        {inviteResult && <p style={{ margin: '8px 0 0', fontSize: '13px', color: inviteResult.startsWith('✅') ? '#15803d' : '#dc2626' }}>{inviteResult}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB TURNOS ── */}
              {activeTab === 'shifts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeShifts.length === 0 ? <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('events.noShiftsStarted')}</p> : activeShifts.map(shift => {
                    const isActive = !!shift.clock_in && !shift.clock_out
                    const fmt = (iso: string | null) => { if (!iso) return '—'; const ts = parseUtcNaive(iso); return isNaN(ts) ? '—' : new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }
                    return (
                      <div key={shift.shift_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: isActive ? '#fffbeb' : '#f9fafb', border: `1px solid ${isActive ? '#fde68a' : '#e5e7eb'}`, borderRadius: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shift.user_name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{shift.job_role_name} · ${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</p>
                          {event?.status === 'finished' && <EditClockIn shiftId={shift.shift_id} currentClockIn={shift.clock_in} onSaved={loadData} />}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {isActive ? (
                            <><div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} /><LiveClock clockInIso={shift.clock_in} /></div><p style={{ margin: '2px 0 0', fontSize: '11px', color: '#b45309' }}>Entrada: {fmt(shift.clock_in)}</p></>
                          ) : (
                            <><p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>{shift.hours_worked ? `${parseFloat(shift.hours_worked).toFixed(2)}h` : '—'}</p><p style={{ margin: '1px 0 0', fontSize: '11px', color: '#9ca3af' }}>{fmt(shift.clock_in)} → {fmt(shift.clock_out)}</p>{shift.total_pay && <p style={{ margin: '1px 0 0', fontSize: '12px', fontWeight: 700, color: '#15803d' }}>${parseFloat(shift.total_pay).toFixed(2)}</p>}</>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {activeShifts.some(s => s.clock_out) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Total horas:</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>{activeShifts.filter(s => s.hours_worked).reduce((a, s) => a + parseFloat(s.hours_worked!), 0).toFixed(2)}h</span>
                    </div>
                  )}
                  {event?.status === 'started' && (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Finalizar evento para todos:</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                          style={{ height: '36px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px', fontSize: '13px', outline: 'none' }} />
                        <button onClick={handleCloseEvent} disabled={closeLoading || !closeTime}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: !closeTime ? 'not-allowed' : 'pointer' }}>
                          {closeLoading ? 'Cerrando...' : '⏹ Cerrar Evento'}
                        </button>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9ca3af' }}>{t('events.thisActionApplies')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB PERSONAL ── */}
              {activeTab === 'assignments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {assignments.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{a.user_name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{a.user_email}{a.user_phone ? ` · ${a.user_phone}` : ''}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: 600, color: '#3b82f6' }}>{a.job_role_name}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <Pill status={a.status} map={assignConfig} />
                        {isAdmin(user) && (
                          <>
                            {a.status === 'pending' && <button onClick={() => handleApprove(a.id)} disabled={actionLoading} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: GREEN, color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{t('common.confirm')}</button>}
                            {!['removed','rejected'].includes(a.status) && <button onClick={() => handleRemove(a.id)} disabled={actionLoading} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{t('common.delete')}</button>}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>⚠ {error}</div>}
            </>
          )}
        </div>

        {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
          @media (max-width: 640px) {
            [data-detail-modal] {
              top: auto !important; bottom: 0 !important;
              left: 0 !important; transform: none !important;
              max-width: 100% !important; border-radius: 20px 20px 0 0 !important;
              max-height: 92vh !important;
            }
          }
        `}</style>
      </div>
    </>
  )
}