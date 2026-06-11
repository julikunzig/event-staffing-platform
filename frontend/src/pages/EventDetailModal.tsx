import React from 'react'
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
  id: number; name: string; event_code: string | null; event_date: string; start_time: string
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
  settled:        { label: 'Liquidado',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
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

// ════════════════════════════════════════════════════════════════════════════
// ── Panel de cierre de evento por turnos (dentro del modal de detalle) ──────
// ════════════════════════════════════════════════════════════════════════════

interface ClosingEmployee {
  assignment_id: number; shift_id: number | null
  user_id: number; user_name: string; job_role_name: string
  turno_start: string
  clock_in: string | null; clock_out: string | null
  is_paused: boolean; total_pause_minutes: string
  hours_worked: string | null; hourly_rate_snapshot: string | null; total_pay: string | null
}
interface ClosingTurno {
  turno_start: string; total: number; sin_entrada: number; sin_salida: number
  employees: ClosingEmployee[]
}
interface ClosingSummary {
  event_id: number; event_name: string; event_date: string; event_status: string
  turnos: ClosingTurno[]
  total_employees: number; total_sin_entrada: number; total_sin_salida: number
  ready_to_finish: boolean
}
interface ClosingOperation {
  action: 'set_clock_in' | 'set_clock_out' | 'adjust_hours'
  scope: 'event' | 'turno' | 'targets'
  turno_start?: string; shift_ids?: number[]; assignment_ids?: number[]
  time?: string; delta_hours?: number
}
interface OperationResult {
  action: string; scope: string; detail: string
  affected: number; skipped: number; employees: string[]; notes: string[]
}
interface BulkResponse {
  results: OperationResult[]
  total_employees: number; total_sin_entrada: number; total_sin_salida: number
  ready_to_finish: boolean
}

const closingField: React.CSSProperties = {
  height: '32px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px',
  padding: '0 10px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}
const closingLabel: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
  color: '#6b7280', display: 'block', marginBottom: '4px',
}

function EventClosingPanel({ eventId, eventStatus, onChanged }: {
  eventId: number; eventStatus: string; onChanged: () => void
}) {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<ClosingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [saveResult, setSaveResult] = useState<BulkResponse | null>(null)
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null)

  const [globalIn, setGlobalIn] = useState('')
  const [globalOut, setGlobalOut] = useState('')
  const [turnoIn, setTurnoIn] = useState<Record<string, string>>({})
  const [turnoOut, setTurnoOut] = useState<Record<string, string>>({})
  const [rowIn, setRowIn] = useState<Record<number, string>>({})
  const [rowOut, setRowOut] = useState<Record<number, string>>({})
  const [rowDelta, setRowDelta] = useState<Record<number, number>>({})
  // Filas que el usuario tocó a mano: solo estas se envían como ops individuales,
  // para que no compitan con las acciones globales/por turno.
  const [touchedIn, setTouchedIn] = useState<Set<number>>(new Set())
  const [touchedOut, setTouchedOut] = useState<Set<number>>(new Set())

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [selIn, setSelIn] = useState('')
  const [selOut, setSelOut] = useState('')
  const [selDelta, setSelDelta] = useState(0)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const extractHHMM = (iso: string | null): string => {
    if (!iso) return ''
    const m = iso.match(/T(\d{2}):(\d{2})/)
    return m ? `${m[1]}:${m[2]}` : ''
  }

  const resetEdits = () => {
    setGlobalIn(''); setGlobalOut(''); setTurnoIn({}); setTurnoOut({})
    setRowIn({}); setRowOut({}); setRowDelta({})
    setTouchedIn(new Set()); setTouchedOut(new Set())
    setSelected(new Set()); setSelIn(''); setSelOut(''); setSelDelta(0)
  }

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get<ClosingSummary>(`/shifts/events/${eventId}/closing-summary`)
      setSummary(res.data)
      const ins: Record<number, string> = {}
      const outs: Record<number, string> = {}
      for (const turno of res.data.turnos) {
        for (const emp of turno.employees) {
          if (emp.clock_in) ins[emp.assignment_id] = extractHHMM(emp.clock_in)
          if (emp.clock_out) outs[emp.assignment_id] = extractHHMM(emp.clock_out)
        }
      }
      setRowIn(ins); setRowOut(outs); setRowDelta({})
      setTouchedIn(new Set()); setTouchedOut(new Set())
      // Acordeones cerrados por defecto para reducir scroll.
      setExpanded(new Set())
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorLoading'))
      setSummary(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [eventId])

  const originals = React.useMemo(() => {
    const map: Record<number, { in: string; out: string }> = {}
    if (!summary) return map
    for (const turno of summary.turnos) {
      for (const emp of turno.employees) {
        map[emp.assignment_id] = { in: extractHHMM(emp.clock_in), out: extractHHMM(emp.clock_out) }
      }
    }
    return map
  }, [summary])

  // Horas trabajadas actuales por empleado (tope para poder restar con el stepper).
  const maxSubtract = React.useMemo(() => {
    const map: Record<number, number> = {}
    if (!summary) return map
    for (const turno of summary.turnos) {
      for (const emp of turno.employees) {
        map[emp.assignment_id] = emp.hours_worked ? parseFloat(emp.hours_worked) : 0
      }
    }
    return map
  }, [summary])

  const buildOperations = (): ClosingOperation[] => {
    const ops: ClosingOperation[] = []
    if (globalIn) ops.push({ action: 'set_clock_in', scope: 'event', time: globalIn })
    if (globalOut) ops.push({ action: 'set_clock_out', scope: 'event', time: globalOut })
    if (summary) {
      for (const turno of summary.turnos) {
        const key = turno.turno_start
        if (turnoIn[key]) ops.push({ action: 'set_clock_in', scope: 'turno', turno_start: key, time: turnoIn[key] })
        if (turnoOut[key]) ops.push({ action: 'set_clock_out', scope: 'turno', turno_start: key, time: turnoOut[key] })
      }
      for (const turno of summary.turnos) {
        for (const emp of turno.employees) {
          const aid = emp.assignment_id
          // Solo se envían las filas que el usuario tocó a mano; las precargadas
          // no compiten contra las acciones globales/por turno.
          if (touchedIn.has(aid) && rowIn[aid]) ops.push({ action: 'set_clock_in', scope: 'targets', assignment_ids: [aid], time: rowIn[aid] })
          if (touchedOut.has(aid) && rowOut[aid]) ops.push({ action: 'set_clock_out', scope: 'targets', assignment_ids: [aid], time: rowOut[aid] })
          if (rowDelta[aid]) ops.push({ action: 'adjust_hours', scope: 'targets', assignment_ids: [aid], delta_hours: rowDelta[aid] })
        }
      }
    }
    return ops
  }

  const pendingOpsCount = React.useMemo(() => buildOperations().length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalIn, globalOut, turnoIn, turnoOut, rowIn, rowOut, rowDelta, touchedIn, touchedOut, summary])

  const handleSave = async () => {
    const ops = buildOperations()
    if (ops.length === 0) { setError(t('eventClosing.noChanges')); return }
    setSaving(true); setError(''); setSaveResult(null)
    try {
      const res = await api.post<BulkResponse>(`/shifts/events/${eventId}/bulk-update`, { operations: ops })
      setSaveResult(res.data)
      resetEdits()
      // Reflejar los contadores nuevos de inmediato para habilitar "Finalizar"
      // sin esperar al reload (que llega justo después y trae el detalle completo).
      setSummary(prev => prev ? {
        ...prev,
        total_employees: res.data.total_employees,
        total_sin_entrada: res.data.total_sin_entrada,
        total_sin_salida: res.data.total_sin_salida,
        ready_to_finish: res.data.ready_to_finish,
      } : prev)
      await load()
      onChanged()
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorSaving'))
    } finally { setSaving(false) }
  }

  const doFinish = async () => {
    setFinishing(true); setError('')
    try {
      await api.post(`/events/${eventId}/finish`)
      await load()
      onChanged()
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorFinishing'))
    } finally { setFinishing(false) }
  }

  const handleFinish = () => {
    setConfirm({
      title: t('eventClosing.finishConfirmTitle'),
      message: t('eventClosing.finishConfirmMsg'),
      danger: false,
      onConfirm: () => { setConfirm(null); doFinish() },
    })
  }

  const toggleSelected = (aid: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(aid) ? n.delete(aid) : n.add(aid); return n })
  }
  const toggleTurnoSelection = (turno: ClosingTurno) => {
    setSelected(prev => {
      const n = new Set(prev)
      const allIn = turno.employees.every(e => n.has(e.assignment_id))
      for (const e of turno.employees) { allIn ? n.delete(e.assignment_id) : n.add(e.assignment_id) }
      return n
    })
  }
  const applyToSelected = () => {
    if (selected.size === 0) return
    if (selIn) { setRowIn(prev => { const n = { ...prev }; selected.forEach(aid => { n[aid] = selIn }); return n }); setTouchedIn(prev => { const n = new Set(prev); selected.forEach(aid => n.add(aid)); return n }) }
    if (selOut) { setRowOut(prev => { const n = { ...prev }; selected.forEach(aid => { n[aid] = selOut }); return n }); setTouchedOut(prev => { const n = new Set(prev); selected.forEach(aid => n.add(aid)); return n }) }
    if (selDelta) setRowDelta(prev => {
      const n = { ...prev }
      selected.forEach(aid => {
        const cap = maxSubtract[aid] || 0
        let v = Math.round(((n[aid] || 0) + selDelta) * 2) / 2
        if (v < 0 && Math.abs(v) > cap) v = -cap   // no restar más de lo trabajado
        if (v === 0) delete n[aid]; else n[aid] = v
      })
      return n
    })
    setSelIn(''); setSelOut(''); setSelDelta(0)
  }
  const stepDelta = (aid: number, step: number) => {
    setRowDelta(prev => {
      const n = { ...prev }
      const cap = maxSubtract[aid] || 0
      let v = Math.round(((n[aid] || 0) + step) * 2) / 2
      // No se puede restar más de las horas trabajadas.
      if (v < 0 && Math.abs(v) > cap) v = -cap
      if (v === 0) delete n[aid]; else n[aid] = v
      return n
    })
  }
  const toggleExpanded = (key: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // 'locked' bloquea TODA edición: solo cuando el evento está liquidado (settled).
  // En 'finished' aún se permiten ajustes de horas.
  const locked = summary?.event_status === 'settled' || eventStatus === 'settled'
  // 'isFinished' controla únicamente la visibilidad del botón Finalizar.
  const isFinished = summary?.event_status === 'finished' || eventStatus === 'finished' || locked

  if (loading) return <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</p>
  if (!summary) return <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>{error || t('eventClosing.errorLoading')}</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {confirm && (
        <ConfirmDialog title={confirm.title} message={confirm.message} danger={confirm.danger}
          onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>⚠ {error}</div>
      )}

      {/* Barra de estado + finalizar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: '#f3f4f6', color: '#374151' }}>
          {summary.total_employees} {t('eventClosing.employees')}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: summary.total_sin_entrada > 0 ? '#fff7ed' : '#f0fdf4', color: summary.total_sin_entrada > 0 ? '#c2410c' : '#15803d' }}>
          {summary.total_sin_entrada} {t('eventClosing.withoutClockIn')}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: summary.total_sin_salida > 0 ? '#fef2f2' : '#f0fdf4', color: summary.total_sin_salida > 0 ? '#dc2626' : '#15803d' }}>
          {summary.total_sin_salida} {t('eventClosing.withoutClockOut')}
        </span>
        <div style={{ flex: 1 }} />
        {!isFinished ? (
          <button onClick={handleFinish} disabled={!summary.ready_to_finish || finishing}
            title={!summary.ready_to_finish ? t('eventClosing.finishBlocked') : ''}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: summary.ready_to_finish ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#e5e7eb', color: summary.ready_to_finish ? '#fff' : '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: summary.ready_to_finish ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif" }}>
            {finishing ? t('eventClosing.finishing') : t('eventClosing.finishEvent')}
          </button>
        ) : (
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>✓ {t('eventClosing.eventFinished')}</span>
        )}
      </div>

      {/* Resumen post-guardado */}
      {saveResult && (
        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>✓ {t('eventClosing.changesApplied')}</p>
              <button onClick={() => setSaveResult(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {saveResult.results.map((r, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#374151' }}>
                  <span style={{ fontWeight: 600 }}>✓ {r.detail}</span>
                  <span style={{ color: '#9ca3af' }}> — {r.affected} {t('eventClosing.affected')}{r.skipped > 0 ? ` · ${r.skipped} ${t('eventClosing.skipped')}` : ''}</span>
                  {r.notes.map((n, j) => <p key={j} style={{ margin: '2px 0 0 14px', fontSize: '11px', color: '#c2410c' }}>⚠ {n}</p>)}
                </div>
              ))}
            </div>
            {saveResult.ready_to_finish && !isFinished && (
              <p style={{ margin: '10px 0 0', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>{t('eventClosing.allClosedHint')}</p>
            )}
          </div>
        </div>
      )}

      {!locked && (
        <>
          {/* Acciones globales */}
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#111827' }}>{t('eventClosing.globalActions')}</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={closingLabel}>{t('eventClosing.clockInAll')}</label>
                <input type="time" value={globalIn} onChange={e => setGlobalIn(e.target.value)} style={{ ...closingField, width: '140px' }} />
              </div>
              <div>
                <label style={closingLabel}>{t('eventClosing.clockOutAll')}</label>
                <input type="time" value={globalOut} onChange={e => setGlobalOut(e.target.value)} style={{ ...closingField, width: '140px' }} />
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#9ca3af' }}>{t('eventClosing.globalHint')}</p>
          </div>

          {/* Barra de seleccionados */}
          {selected.size > 0 && (
            <div style={{ background: '#fff', border: `1.5px solid ${GREEN}`, borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: GREEN_DARK, alignSelf: 'center' }}>{selected.size} {t('eventClosing.selectedCount')}</p>
              <div>
                <label style={closingLabel}>{t('eventClosing.clockInTime')}</label>
                <input type="time" value={selIn} onChange={e => setSelIn(e.target.value)} style={{ ...closingField, width: '132px' }} />
              </div>
              <div>
                <label style={closingLabel}>{t('eventClosing.clockOutTime')}</label>
                <input type="time" value={selOut} onChange={e => setSelOut(e.target.value)} style={{ ...closingField, width: '132px' }} />
              </div>
              <div>
                <label style={closingLabel}>{t('eventClosing.hoursDelta')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => setSelDelta(d => Math.round((d - 0.5) * 2) / 2)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>−</button>
                  <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '42px', textAlign: 'center', color: selDelta > 0 ? '#15803d' : selDelta < 0 ? '#dc2626' : '#6b7280' }}>{selDelta > 0 ? '+' : ''}{selDelta}h</span>
                  <button onClick={() => setSelDelta(d => Math.round((d + 0.5) * 2) / 2)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <button onClick={applyToSelected} disabled={!selIn && !selOut && !selDelta}
                style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: (selIn || selOut || selDelta) ? GREEN : '#e5e7eb', color: (selIn || selOut || selDelta) ? '#fff' : '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: (selIn || selOut || selDelta) ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif" }}>
                {t('eventClosing.applyToSelected')}
              </button>
              <button onClick={() => setSelected(new Set())} style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '12px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('eventClosing.clearSelection')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Acordeón de turnos */}
      {summary.turnos.map(turno => {
        const key = turno.turno_start
        const isOpen = expanded.has(key)
        const allSelected = turno.employees.length > 0 && turno.employees.every(e => selected.has(e.assignment_id))
        return (
          <div key={key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderBottom: isOpen ? '1px solid #f3f4f6' : 'none' }}>
              <button onClick={() => toggleExpanded(key)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, fontFamily: "'Poppins',sans-serif" }}>
                <ChevronRight size={14} color="#6b7280" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('eventClosing.turno')} {key}</span>
              </button>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{turno.total} {t('eventClosing.employees')}</span>
              {turno.sin_salida > 0 ? (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#fef2f2', color: '#dc2626' }}>
                  {turno.sin_salida} {t('eventClosing.withoutClockOut')}
                </span>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#f0fdf4', color: '#15803d' }}>
                  ✓ {t('eventClosing.turnoClosed')}
                </span>
              )}
              <div style={{ flex: 1 }} />
              {!locked && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
                  <div>
                    <label style={closingLabel}>{t('eventClosing.clockInTurno')}</label>
                    <input type="time" value={turnoIn[key] || ''} onChange={e => setTurnoIn(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...closingField, width: '128px', height: '32px' }} />
                  </div>
                  <div>
                    <label style={closingLabel}>{t('eventClosing.clockOutTurno')}</label>
                    <input type="time" value={turnoOut[key] || ''} onChange={e => setTurnoOut(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...closingField, width: '128px', height: '32px' }} />
                  </div>
                </div>
              )}
            </div>

            {isOpen && (
              <div>
                {!locked && (
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={allSelected} onChange={() => toggleTurnoSelection(turno)} style={{ accentColor: GREEN, cursor: 'pointer' }} />
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{t('eventClosing.selectAllTurno')}</span>
                  </div>
                )}
                {turno.employees.map(emp => {
                  const aid = emp.assignment_id
                  const noEntry = !emp.clock_in
                  const noExit = !emp.clock_out
                  const delta = rowDelta[aid] || 0
                  return (
                    <div key={aid} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', background: selected.has(aid) ? '#f0fdf4' : '#fff' }}>
                      {!locked && <input type="checkbox" checked={selected.has(aid)} onChange={() => toggleSelected(aid)} style={{ accentColor: GREEN, cursor: 'pointer' }} />}
                      <div style={{ flex: 1, minWidth: '130px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{emp.user_name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{emp.job_role_name}{emp.hourly_rate_snapshot ? ` · $${parseFloat(emp.hourly_rate_snapshot).toFixed(2)}/h` : ''}</p>
                      </div>
                      {noEntry && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#fff7ed', color: '#c2410c' }}>{t('eventClosing.noClockIn')}</span>}
                      {!noEntry && noExit && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#fef2f2', color: '#dc2626' }}>{t('eventClosing.noClockOut')}</span>}
                      {emp.is_paused && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8' }}>{t('eventClosing.paused')}</span>}
                      {!locked ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input type="time" value={rowIn[aid] || ''} onChange={e => { setRowIn(prev => ({ ...prev, [aid]: e.target.value })); setTouchedIn(prev => new Set(prev).add(aid)) }} style={{ ...closingField, width: '128px', height: '32px' }} title={t('eventClosing.clockInTime')} />
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>→</span>
                          <input type="time" value={rowOut[aid] || ''} onChange={e => { setRowOut(prev => ({ ...prev, [aid]: e.target.value })); setTouchedOut(prev => new Set(prev).add(aid)) }} style={{ ...closingField, width: '128px', height: '32px' }} title={t('eventClosing.clockOutTime')} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }} title={t('eventClosing.hoursDelta')}>
                            <button onClick={() => stepDelta(aid, -0.5)} disabled={noExit || (delta < 0 && Math.abs(delta) >= (maxSubtract[aid] || 0))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: (noExit || (delta < 0 && Math.abs(delta) >= (maxSubtract[aid] || 0))) ? 'not-allowed' : 'pointer', opacity: (noExit || (delta < 0 && Math.abs(delta) >= (maxSubtract[aid] || 0))) ? 0.4 : 1 }}>−</button>
                            <span onClick={() => setRowDelta(prev => { const n = { ...prev }; delete n[aid]; return n })} style={{ fontSize: '11px', fontWeight: 700, minWidth: '38px', textAlign: 'center', cursor: 'pointer', color: delta > 0 ? '#15803d' : delta < 0 ? '#dc2626' : '#9ca3af' }}>{delta > 0 ? '+' : ''}{delta}h</span>
                            <button onClick={() => stepDelta(aid, 0.5)} disabled={noExit} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: noExit ? 'not-allowed' : 'pointer', opacity: noExit ? 0.4 : 1 }}>+</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#15803d' }}>{emp.hours_worked ? `${parseFloat(emp.hours_worked).toFixed(2)}h` : '—'}</p>
                          {emp.total_pay && <p style={{ margin: 0, fontSize: '11px', color: '#15803d' }}>${parseFloat(emp.total_pay).toFixed(2)}</p>}
                        </div>
                      )}
                      {!locked && emp.hours_worked && (
                        <p style={{ margin: 0, fontSize: '11px', color: '#15803d', fontWeight: 600, width: '100%' }}>
                          {t('common.total')}: {parseFloat(emp.hours_worked).toFixed(2)}h · ${emp.total_pay ? parseFloat(emp.total_pay).toFixed(2) : '—'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Botón guardar */}
      {!locked && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
          {pendingOpsCount > 0 && <span style={{ fontSize: '12px', color: '#6b7280' }}>{pendingOpsCount} {t('eventClosing.pendingChanges')}</span>}
          <button onClick={handleSave} disabled={saving || pendingOpsCount === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: pendingOpsCount > 0 ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#e5e7eb', color: pendingOpsCount > 0 ? '#fff' : '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: pendingOpsCount > 0 ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? t('eventClosing.saving') : t('eventClosing.saveChanges')}
          </button>
        </div>
      )}
    </div>
  )
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
  const [activeTab, setActiveTab]     = useState<'info' | 'shifts' | 'assignments'>('info')
  const invitePanelRef = React.useRef<HTMLDivElement>(null)

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
        if (['started', 'finished', 'settled'].includes(evRes.data.status)) {
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

  useEffect(() => { setActiveTab('info'); loadData() }, [eventId])

  const getRoleName = (id: number) => jobRoles.find(r => r.id === id)?.name || `Rol #${id}`
  const getRoleRate = (id: number) => jobRoles.find(r => r.id === id)?.hourly_rate || '0'

  const openInvitePanel = async () => {
    setShowInvite(true); setInviteSearch(''); setSelected(new Map()); setInviteResult(''); setEmpLoading(true)
    setTimeout(() => {
      if (invitePanelRef.current) {
        invitePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
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

  const toggleEmployee = (empId: number, _erId: number) => {
    console.log('[toggleEmployee] empId=', empId, 'selected size=', selected.size)
    const next = new Map(selected)
    if (next.has(empId)) {
      next.delete(empId)
    } else {
      // Always calculate the correct ER internally based on current selections
      const emp = employees.find(e => e.id === empId)
      if (!emp) return
      const matchingErs = eventRoles.filter(r => emp.roles.some(role => role.id === r.job_role_id))
      
      // Find first ER that has available slots considering current selections + already filled
      const availableEr = matchingErs.find(r => {
        const selForThis = Array.from(next.values()).filter(v => v === r.id).length
        return r.slots_required - r.slots_filled - (r.slots_pending || 0) - selForThis > 0
      })
      
      if (!availableEr) {
        // No slots available for any matching ER
        const sameRoleErs = matchingErs
        const totalSlots = sameRoleErs.reduce((sum, r) => sum + r.slots_required, 0)
        const totalUsed = sameRoleErs.reduce((sum, r) => sum + r.slots_filled + (r.slots_pending || 0), 0)
        const totalSelected = Array.from(next.values()).filter(v => sameRoleErs.some(r => r.id === v)).length
        setInviteResult(`⚠️ No hay más cupos disponibles para este rol (${totalUsed + totalSelected}/${totalSlots})`)
        return
      }
      
      next.set(empId, availableEr.id)
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
      // Reload eligible employees
      try {
        const empRes = await api.get<any[]>(`/events/${eventId}/eligible-employees`)
        const converted = empRes.data.map((e: any) => ({ id: e.user_id, name: e.name, email: e.email, phone: e.phone, roles: [{ id: e.job_role_id, name: e.job_role_name, hourly_rate: '0' }] }))
        const byUser = new Map<number, EmployeeWithRoles>()
        for (const emp of converted) { if (byUser.has(emp.id)) byUser.get(emp.id)!.roles.push(...emp.roles); else byUser.set(emp.id, { ...emp }) }
        setEmployees(Array.from(byUser.values()))
      } catch {}
    } catch (e: any) { setInviteResult(`❌ ${parseErrorMessage(e.response?.data?.detail || 'Error')}`) } finally { setActionLoading(false) }
  }

  const handleDirectAssign = async () => {
    if (selected.size === 0) return; setActionLoading(true); setInviteResult('')
    let assignedCount = 0
    let errors: string[] = []
    for (const [userId, erId] of selected.entries()) {
      try {
        const er = eventRoles.find(r => r.id === erId)
        await api.post(`/assignments/events/${eventId}/assign`, {
          user_id: userId,
          job_role_id: er ? er.job_role_id : erId,
          event_job_role_id: erId,
        })
        assignedCount++
      } catch (e: any) {
        errors.push(e.response?.data?.detail || 'Error')
      }
    }
    if (assignedCount > 0) {
      setInviteResult(`✅ ${assignedCount} asignado(s)${errors.length > 0 ? ` · ⚠️ ${errors.length} error(es): ${errors[0]}` : ''}`)
      setSelected(new Map()); await loadData()
      // Reload eligible employees
      try {
        const res = await api.get<any[]>(`/events/${eventId}/eligible-employees`)
        const converted = res.data.map((e: any) => ({ id: e.user_id, name: e.name, email: e.email, phone: e.phone, roles: [{ id: e.job_role_id, name: e.job_role_name, hourly_rate: '0' }] }))
        const byUser = new Map<number, EmployeeWithRoles>()
        for (const emp of converted) { if (byUser.has(emp.id)) byUser.get(emp.id)!.roles.push(...emp.roles); else byUser.set(emp.id, { ...emp }) }
        setEmployees(Array.from(byUser.values()))
      } catch {}
    } else {
      setInviteResult(`❌ ${errors[0] || 'Error'}`)
    }
    setActionLoading(false)
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


  if (!event && !loading) return null

  const evSt  = event ? (statusConfig[event.status] || { label: event.status, bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }) : null
  const tabs  = [
    { key: 'info' as const, label: 'Información' },
    ...(isAdminOrCoord(user) && ['started','finished','settled'].includes(event?.status || '') ? [{ key: 'shifts' as const, label: activeShifts.length > 0 ? `Turnos (${activeShifts.length})` : 'Turnos' }] : []),
    ...(isAdminOrCoord(user) && assignments.length > 0 ? [{ key: 'assignments' as const, label: `Personal (${assignments.length})` }] : []),
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 50 }} />

      <div style={{
        position: 'fixed', zIndex: 51,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: '640px', height: '90vh',
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
                    {event?.event_code && <span style={{ fontSize: '11px', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>#{event.event_code}</span>}
                    {evSt && <Pill status={event!.status} map={statusConfig} />}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    {event && new Date(event.event_date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {!loading && isAdmin(user) && event?.status !== 'cancelled' && event?.status !== 'finished' && event?.status !== 'settled' && onEdit && (
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
                          // Only show rate if admin/coordinator or if this is the employee's own role
                          const showRate = isAdminOrCoord(user) || (myAssignment && myAssignment.job_role_id === er.job_role_id)
                          return (
                            <div key={er.id}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{role?.name || `Rol #${er.job_role_id}`}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: allApproved ? '#f0fdf4' : total >= er.slots_required ? '#fffbeb' : '#eff6ff', color: allApproved ? '#15803d' : total >= er.slots_required ? '#b45309' : '#1d4ed8' }}>
                                  {er.slots_filled}/{er.slots_required}{allApproved ? ' ✓' : total >= er.slots_required ? ' ⏳' : ' cupos'}
                                </span>
                              </div>
                              <ProgressBar value={er.slots_filled} max={er.slots_required} pending={pending} />
                              {role && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>{er.start_time ? `🕐 ${er.start_time.substring(0, 5)}` : ''}{showRate ? (er.start_time ? ' · ' : '') + (er.hourly_rate_override ? `$${parseFloat(er.hourly_rate_override).toFixed(2)}/h` : `$${parseFloat(role.hourly_rate).toFixed(2)}/h`) : ''}</p>}
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
                        {!['cancelled','finished','settled'].includes(event.status) && (
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
                    <div ref={invitePanelRef} style={{ ...S.section }}>
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
                              // Find matching eventRoles for this employee's roles
                              const matchingEventRoles = eventRoles.filter(er => emp.roles.some(r => r.id === er.job_role_id))
                              // Check if ANY matching role has available slots (considering current selections)
                              const anyAvailable = matchingEventRoles.some(er => {
                                const selForThis = Array.from(selected.values()).filter(v => v === er.id).length
                                return (er.slots_required - er.slots_filled - (er.slots_pending || 0) - selForThis) > 0
                              })
                              const full = !anyAvailable
                              // Find first available event role for default selection
                              const firstAvailableEr = matchingEventRoles.find(er => {
                                const selForThis = Array.from(selected.values()).filter(v => v === er.id).length
                                return (er.slots_required - er.slots_filled - (er.slots_pending || 0) - selForThis) > 0
                              }) || matchingEventRoles[0]
                              return (
                                <div key={emp.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', opacity: full && !selected.has(emp.id) ? 0.5 : 1 }}>
                                  <input type="checkbox" checked={selected.has(emp.id)} disabled={full && !selected.has(emp.id)}
                                    onChange={() => toggleEmployee(emp.id, firstAvailableEr?.id || matchingEventRoles[0]?.id || 0)} style={{ marginTop: '2px', accentColor: GREEN }} />
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
                                      <select value={selected.get(emp.id)} onChange={e => {
                                        const newErId = Number(e.target.value)
                                        // Validate the target ER has available slots
                                        const targetEr = eventRoles.find(r => r.id === newErId)
                                        if (targetEr) {
                                          const othersOnThisEr = Array.from(selected.entries()).filter(([uid, eid]) => eid === newErId && uid !== emp.id).length
                                          if (othersOnThisEr + targetEr.slots_filled + (targetEr.slots_pending || 0) >= targetEr.slots_required) {
                                            setInviteResult(`⚠️ Este turno ya está lleno`)
                                            return
                                          }
                                        }
                                        const n = new Map(selected); n.set(emp.id, newErId); setSelected(n); setInviteResult('')
                                      }}
                                        style={{ marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 6px', fontSize: '11px', width: '100%' }}>
                                        {matchingEventRoles.map(er => {
                                          const roleName = jobRoles.find(r => r.id === er.job_role_id)?.name || `Rol #${er.job_role_id}`
                                          const timeStr = er.start_time ? er.start_time.substring(0, 5) : ''
                                          const rateStr = er.hourly_rate_override ? `$${parseFloat(er.hourly_rate_override).toFixed(0)}` : ''
                                          const othersSelected = Array.from(selected.entries()).filter(([uid, eid]) => eid === er.id && uid !== emp.id).length
                                          const fl = (er.slots_filled + (er.slots_pending || 0) + othersSelected) >= er.slots_required
                                          return <option key={er.id} value={er.id} disabled={fl}>{roleName}{timeStr ? ` · ${timeStr}` : ''}{rateStr ? ` · ${rateStr}/h` : ''} ({er.slots_filled + othersSelected}/{er.slots_required}){fl ? ' — LLENO' : ''}</option>
                                        })}
                                      </select>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{selected.size} seleccionado(s)</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={handleBulkInvite} disabled={actionLoading || selected.size === 0}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: selected.size === 0 ? '#f3f4f6' : '#fff', color: selected.size === 0 ? '#9ca3af' : '#374151', fontSize: '12px', fontWeight: 600, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
                              {actionLoading ? t('events.inviting') : `📩 ${t('events.sendInvitations')}`}
                            </button>
                            <button onClick={handleDirectAssign} disabled={actionLoading || selected.size === 0}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: selected.size === 0 ? '#e5e7eb' : `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: selected.size === 0 ? '#9ca3af' : '#fff', fontSize: '12px', fontWeight: 700, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
                              {actionLoading ? '...' : `✓ Asignar Directo (${selected.size})`}
                            </button>
                          </div>
                        </div>
                        {inviteResult && <p style={{ margin: '8px 0 0', fontSize: '13px', color: inviteResult.startsWith('✅') ? '#15803d' : '#dc2626' }}>{inviteResult}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB TURNOS ── */}
              {activeTab === 'shifts' && (
                <EventClosingPanel
                  eventId={eventId}
                  eventStatus={event?.status || ''}
                  onChanged={() => { loadData(); onStatusChange?.() }}
                />
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
                        {isAdmin(user) && event?.status !== 'settled' && (
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