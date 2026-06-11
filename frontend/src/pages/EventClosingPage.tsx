import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import {
  Clock, Search, Save, Users, ChevronDown, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Minus, Plus, Flag, X,
} from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

// ── Tipos (espejo de los schemas del backend) ──────────────────────────────
interface EventItem { id: number; name: string; event_date: string; start_time: string; status: string }

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
  turno_start?: string
  shift_ids?: number[]
  assignment_ids?: number[]
  time?: string
  delta_hours?: number
}
interface OperationResult {
  action: string; scope: string; detail: string
  affected: number; skipped: number
  employees: string[]; notes: string[]
}
interface BulkResponse {
  results: OperationResult[]
  total_employees: number; total_sin_entrada: number; total_sin_salida: number
  ready_to_finish: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────
const extractHHMM = (iso: string | null): string => {
  if (!iso) return ''
  const m = iso.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

const fieldStyle: React.CSSProperties = {
  height: '34px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px',
  padding: '0 10px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
  color: '#6b7280', display: 'block', marginBottom: '4px',
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem',
  overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

function GradientStrip() {
  return <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
}

// ── Componente principal ───────────────────────────────────────────────────
export default function EventClosingPage() {
  const { t } = useTranslation()

  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [summary, setSummary] = useState<ClosingSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [saveResult, setSaveResult] = useState<BulkResponse | null>(null)
  const [finished, setFinished] = useState(false)

  // Inputs globales y por turno
  const [globalIn, setGlobalIn] = useState('')
  const [globalOut, setGlobalOut] = useState('')
  const [turnoIn, setTurnoIn] = useState<Record<string, string>>({})
  const [turnoOut, setTurnoOut] = useState<Record<string, string>>({})

  // Edición por empleado (keyed por assignment_id)
  const [rowIn, setRowIn] = useState<Record<number, string>>({})
  const [rowOut, setRowOut] = useState<Record<number, string>>({})
  const [rowDelta, setRowDelta] = useState<Record<number, number>>({})

  // Selección múltiple + barra de acciones
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [selIn, setSelIn] = useState('')
  const [selOut, setSelOut] = useState('')
  const [selDelta, setSelDelta] = useState(0)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // ── Carga inicial: eventos iniciados/finalizados ─────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<EventItem[]>('/events')
        setEvents(res.data.filter(e => e.status === 'started' || e.status === 'finished'))
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const resetEdits = () => {
    setGlobalIn(''); setGlobalOut('')
    setTurnoIn({}); setTurnoOut({})
    setRowIn({}); setRowOut({}); setRowDelta({})
    setSelected(new Set()); setSelIn(''); setSelOut(''); setSelDelta(0)
  }

  const loadSummary = async (ev: EventItem) => {
    setSummaryLoading(true); setError('')
    try {
      const res = await api.get<ClosingSummary>(`/shifts/events/${ev.id}/closing-summary`)
      setSummary(res.data)
      // Precargar inputs de fila con los valores actuales
      const ins: Record<number, string> = {}
      const outs: Record<number, string> = {}
      for (const turno of res.data.turnos) {
        for (const emp of turno.employees) {
          if (emp.clock_in) ins[emp.assignment_id] = extractHHMM(emp.clock_in)
          if (emp.clock_out) outs[emp.assignment_id] = extractHHMM(emp.clock_out)
        }
      }
      setRowIn(ins); setRowOut(outs); setRowDelta({})
      // Expandir todos los turnos por defecto
      setExpanded(new Set(res.data.turnos.map(tu => tu.turno_start)))
      setFinished(res.data.event_status === 'finished')
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorLoading'))
      setSummary(null)
    } finally { setSummaryLoading(false) }
  }

  const selectEvent = async (ev: EventItem) => {
    setSelectedEvent(ev); setSaveResult(null); resetEdits()
    await loadSummary(ev)
  }

  const goBack = () => {
    setSelectedEvent(null); setSummary(null); setSaveResult(null)
    setError(''); resetEdits()
  }

  // ── Construcción de operaciones a partir del estado de la UI ─────────────
  const originals = useMemo(() => {
    const map: Record<number, { in: string; out: string }> = {}
    if (!summary) return map
    for (const turno of summary.turnos) {
      for (const emp of turno.employees) {
        map[emp.assignment_id] = { in: extractHHMM(emp.clock_in), out: extractHHMM(emp.clock_out) }
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
          const orig = originals[aid] || { in: '', out: '' }
          if (rowIn[aid] && rowIn[aid] !== orig.in) {
            ops.push({ action: 'set_clock_in', scope: 'targets', assignment_ids: [aid], time: rowIn[aid] })
          }
          if (rowOut[aid] && rowOut[aid] !== orig.out) {
            ops.push({ action: 'set_clock_out', scope: 'targets', assignment_ids: [aid], time: rowOut[aid] })
          }
          if (rowDelta[aid]) {
            ops.push({ action: 'adjust_hours', scope: 'targets', assignment_ids: [aid], delta_hours: rowDelta[aid] })
          }
        }
      }
    }
    return ops
  }

  const pendingOpsCount = useMemo(() => buildOperations().length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalIn, globalOut, turnoIn, turnoOut, rowIn, rowOut, rowDelta, summary])

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const ops = buildOperations()
    if (ops.length === 0) { setError(t('eventClosing.noChanges')); return }
    setSaving(true); setError(''); setSaveResult(null)
    try {
      const res = await api.post<BulkResponse>(`/shifts/events/${selectedEvent!.id}/bulk-update`, { operations: ops })
      setSaveResult(res.data)
      resetEdits()
      await loadSummary(selectedEvent!)
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorSaving'))
    } finally { setSaving(false) }
  }

  const handleFinish = async () => {
    setFinishing(true); setError('')
    try {
      await api.post(`/events/${selectedEvent!.id}/finish`)
      setFinished(true)
      await loadSummary(selectedEvent!)
    } catch (e: any) {
      setError(e.response?.data?.detail || t('eventClosing.errorFinishing'))
    } finally { setFinishing(false) }
  }

  const toggleSelected = (aid: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(aid)) next.delete(aid); else next.add(aid)
      return next
    })
  }

  const toggleTurnoSelection = (turno: ClosingTurno) => {
    setSelected(prev => {
      const next = new Set(prev)
      const allIn = turno.employees.every(e => next.has(e.assignment_id))
      for (const e of turno.employees) {
        if (allIn) next.delete(e.assignment_id); else next.add(e.assignment_id)
      }
      return next
    })
  }

  const applyToSelected = () => {
    if (selected.size === 0) return
    if (selIn) setRowIn(prev => { const n = { ...prev }; selected.forEach(aid => { n[aid] = selIn }); return n })
    if (selOut) setRowOut(prev => { const n = { ...prev }; selected.forEach(aid => { n[aid] = selOut }); return n })
    if (selDelta) setRowDelta(prev => { const n = { ...prev }; selected.forEach(aid => { n[aid] = (n[aid] || 0) + selDelta }); return n })
    setSelIn(''); setSelOut(''); setSelDelta(0)
  }

  const stepDelta = (aid: number, step: number) => {
    setRowDelta(prev => {
      const next = { ...prev }
      const v = Math.round(((next[aid] || 0) + step) * 2) / 2
      if (v === 0) delete next[aid]; else next[aid] = v
      return next
    })
  }

  const toggleExpanded = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  return (
    <div style={{ maxWidth: '980px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.eventClosing')}</h2>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Selección de evento ── */}
      {!selectedEvent ? (
        <div style={cardStyle}>
          <GradientStrip />
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('eventClosing.selectEvent')}</p>
          </div>
          <div style={{ padding: '14px 20px' }}>
            {events.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('eventClosing.noEvents')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.map(ev => (
                  <button key={ev.id} onClick={() => selectEvent(ev)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", textAlign: 'left', width: '100%' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{ev.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>{ev.event_date} · {ev.start_time}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: ev.status === 'started' ? '#fefce8' : '#f0fdfa', color: ev.status === 'started' ? '#854d0e' : '#0f766e' }}>
                      {ev.status === 'started' ? t('events.status.started') : t('events.status.finished')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Cabecera del evento ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: "'Poppins',sans-serif" }}>
              <ChevronLeft size={13} />{t('eventClosing.back')}
            </button>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{selectedEvent.name}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{selectedEvent.event_date}</p>
            </div>
            {summary && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: '#f3f4f6', color: '#374151' }}>
                  {summary.total_employees} {t('eventClosing.employees')}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: summary.total_sin_entrada > 0 ? '#fff7ed' : '#f0fdf4', color: summary.total_sin_entrada > 0 ? '#c2410c' : '#15803d' }}>
                  {summary.total_sin_entrada} {t('eventClosing.withoutClockIn')}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: summary.total_sin_salida > 0 ? '#fef2f2' : '#f0fdf4', color: summary.total_sin_salida > 0 ? '#dc2626' : '#15803d' }}>
                  {summary.total_sin_salida} {t('eventClosing.withoutClockOut')}
                </span>
              </div>
            )}
            {!finished && (
              <button onClick={handleFinish} disabled={!summary?.ready_to_finish || finishing}
                title={!summary?.ready_to_finish ? t('eventClosing.finishBlocked') : ''}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: summary?.ready_to_finish ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#e5e7eb', color: summary?.ready_to_finish ? '#fff' : '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: summary?.ready_to_finish ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif" }}>
                <Flag size={13} />{finishing ? t('eventClosing.finishing') : t('eventClosing.finishEvent')}
              </button>
            )}
            {finished && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>
                <CheckCircle2 size={14} />{t('eventClosing.eventFinished')}
              </span>
            )}
          </div>

          {/* ── Resumen de acciones guardadas ── */}
          {saveResult && (
            <div style={{ ...cardStyle, marginBottom: '14px', border: '1px solid #bbf7d0' }}>
              <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} />{t('eventClosing.changesApplied')}
                  </p>
                  <button onClick={() => setSaveResult(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}><X size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {saveResult.results.map((r, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#374151' }}>
                      <span style={{ fontWeight: 600 }}>✓ {r.detail}</span>
                      <span style={{ color: '#9ca3af' }}> — {r.affected} {t('eventClosing.affected')}{r.skipped > 0 ? ` · ${r.skipped} ${t('eventClosing.skipped')}` : ''}</span>
                      {r.notes.map((n, j) => (
                        <p key={j} style={{ margin: '2px 0 0 14px', fontSize: '11px', color: '#c2410c' }}>⚠ {n}</p>
                      ))}
                    </div>
                  ))}
                </div>
                {saveResult.ready_to_finish && !finished && (
                  <p style={{ margin: '10px 0 0', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                    {t('eventClosing.allClosedHint')}
                  </p>
                )}
              </div>
            </div>
          )}

          {summaryLoading ? (
            <p style={{ padding: '20px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('common.loading')}</p>
          ) : summary && (
            <>
              {/* ── Acciones globales ── */}
              <div style={{ ...cardStyle, marginBottom: '14px' }}>
                <GradientStrip />
                <div style={{ padding: '14px 18px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} color={GREEN} />{t('eventClosing.globalActions')}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div>
                      <label style={labelStyle}>{t('eventClosing.clockInAll')}</label>
                      <input type="time" value={globalIn} onChange={e => setGlobalIn(e.target.value)} style={{ ...fieldStyle, width: '130px' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('eventClosing.clockOutAll')}</label>
                      <input type="time" value={globalOut} onChange={e => setGlobalOut(e.target.value)} style={{ ...fieldStyle, width: '130px' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', maxWidth: '380px' }}>{t('eventClosing.globalHint')}</p>
                  </div>
                </div>
              </div>

              {/* ── Barra de acciones para seleccionados ── */}
              {selected.size > 0 && (
                <div style={{ ...cardStyle, marginBottom: '14px', border: `1.5px solid ${GREEN}` }}>
                  <div style={{ padding: '12px 18px', display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: GREEN_DARK, alignSelf: 'center' }}>
                      {selected.size} {t('eventClosing.selectedCount')}
                    </p>
                    <div>
                      <label style={labelStyle}>{t('eventClosing.clockInTime')}</label>
                      <input type="time" value={selIn} onChange={e => setSelIn(e.target.value)} style={{ ...fieldStyle, width: '120px', height: '32px' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('eventClosing.clockOutTime')}</label>
                      <input type="time" value={selOut} onChange={e => setSelOut(e.target.value)} style={{ ...fieldStyle, width: '120px', height: '32px' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('eventClosing.hoursDelta')}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button onClick={() => setSelDelta(d => Math.round((d - 0.5) * 2) / 2)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                        <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '44px', textAlign: 'center', color: selDelta > 0 ? '#15803d' : selDelta < 0 ? '#dc2626' : '#6b7280' }}>{selDelta > 0 ? '+' : ''}{selDelta}h</span>
                        <button onClick={() => setSelDelta(d => Math.round((d + 0.5) * 2) / 2)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
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
                </div>
              )}

              {/* ── Búsqueda ── */}
              <div style={{ position: 'relative', width: '240px', marginBottom: '12px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} style={{ ...fieldStyle, width: '100%', paddingLeft: '28px', height: '32px' }} />
              </div>

              {/* ── Acordeón de turnos ── */}
              {summary.turnos.map(turno => {
                const key = turno.turno_start
                const isOpen = expanded.has(key)
                const visible = turno.employees.filter(e =>
                  e.user_name.toLowerCase().includes(search.toLowerCase()) ||
                  e.job_role_name.toLowerCase().includes(search.toLowerCase())
                )
                const allSelected = turno.employees.length > 0 && turno.employees.every(e => selected.has(e.assignment_id))
                return (
                  <div key={key} style={{ ...cardStyle, marginBottom: '12px' }}>
                    <GradientStrip />
                    {/* Cabecera del turno */}
                    <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderBottom: isOpen ? '1px solid #f3f4f6' : 'none' }}>
                      <button onClick={() => toggleExpanded(key)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontFamily: "'Poppins',sans-serif" }}>
                        {isOpen ? <ChevronDown size={15} color="#6b7280" /> : <ChevronRight size={15} color="#6b7280" />}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('eventClosing.turno')} {key}</span>
                      </button>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {turno.total} {t('eventClosing.employees')} · {turno.sin_entrada} {t('eventClosing.withoutClockIn')} · {turno.sin_salida} {t('eventClosing.withoutClockOut')}
                      </span>
                      <div style={{ flex: 1 }} />
                      {/* Acciones del turno */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
                        <div>
                          <label style={labelStyle}>{t('eventClosing.clockInTurno')}</label>
                          <input type="time" value={turnoIn[key] || ''} onChange={e => setTurnoIn(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...fieldStyle, width: '110px', height: '30px' }} />
                        </div>
                        <div>
                          <label style={labelStyle}>{t('eventClosing.clockOutTurno')}</label>
                          <input type="time" value={turnoOut[key] || ''} onChange={e => setTurnoOut(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...fieldStyle, width: '110px', height: '30px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Empleados del turno */}
                    {isOpen && (
                      <div>
                        <div style={{ padding: '8px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" checked={allSelected} onChange={() => toggleTurnoSelection(turno)} style={{ accentColor: GREEN, cursor: 'pointer' }} />
                          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{t('eventClosing.selectAllTurno')}</span>
                        </div>
                        {visible.map(emp => {
                          const aid = emp.assignment_id
                          const noEntry = !emp.clock_in
                          const noExit = !emp.clock_out
                          const delta = rowDelta[aid] || 0
                          return (
                            <div key={aid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', background: selected.has(aid) ? '#f0fdf4' : '#fff' }}>
                              <input type="checkbox" checked={selected.has(aid)} onChange={() => toggleSelected(aid)} style={{ accentColor: GREEN, cursor: 'pointer' }} />
                              <div style={{ flex: 1, minWidth: '150px' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{emp.user_name}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                  {emp.job_role_name}{emp.hourly_rate_snapshot ? ` · $${parseFloat(emp.hourly_rate_snapshot).toFixed(2)}/h` : ''}
                                </p>
                              </div>
                              {noEntry && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#fff7ed', color: '#c2410c' }}>{t('eventClosing.noClockIn')}</span>}
                              {!noEntry && noExit && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#fef2f2', color: '#dc2626' }}>{t('eventClosing.noClockOut')}</span>}
                              {emp.is_paused && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8' }}>{t('eventClosing.paused')}</span>}
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="time" value={rowIn[aid] || ''} onChange={e => setRowIn(prev => ({ ...prev, [aid]: e.target.value }))} style={{ ...fieldStyle, width: '104px', height: '30px' }} title={t('eventClosing.clockInTime')} />
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>→</span>
                                <input type="time" value={rowOut[aid] || ''} onChange={e => setRowOut(prev => ({ ...prev, [aid]: e.target.value }))} style={{ ...fieldStyle, width: '104px', height: '30px' }} title={t('eventClosing.clockOutTime')} />
                                {/* Stepper ±horas */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }} title={t('eventClosing.hoursDelta')}>
                                  <button onClick={() => stepDelta(aid, -0.5)} disabled={noExit}
                                    style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: noExit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: noExit ? 0.4 : 1 }}><Minus size={11} /></button>
                                  <span onClick={() => setRowDelta(prev => { const n = { ...prev }; delete n[aid]; return n })}
                                    style={{ fontSize: '11px', fontWeight: 700, minWidth: '40px', textAlign: 'center', cursor: 'pointer', color: delta > 0 ? '#15803d' : delta < 0 ? '#dc2626' : '#9ca3af' }}>
                                    {delta > 0 ? '+' : ''}{delta}h
                                  </span>
                                  <button onClick={() => stepDelta(aid, 0.5)} disabled={noExit}
                                    style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: noExit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: noExit ? 0.4 : 1 }}><Plus size={11} /></button>
                                </div>
                              </div>
                              {emp.hours_worked && (
                                <p style={{ margin: 0, fontSize: '11px', color: '#15803d', fontWeight: 600, width: '100%' }}>
                                  {t('common.total')}: {parseFloat(emp.hours_worked).toFixed(2)}h · ${emp.total_pay ? parseFloat(emp.total_pay).toFixed(2) : '—'}
                                </p>
                              )}
                            </div>
                          )
                        })}
                        {visible.length === 0 && <p style={{ padding: '16px 18px', color: '#9ca3af', fontSize: '12px' }}>{t('eventClosing.noResults')}</p>}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* ── Botón guardar ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                {pendingOpsCount > 0 && (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {pendingOpsCount} {t('eventClosing.pendingChanges')}
                  </span>
                )}
                <button onClick={handleSave} disabled={saving || pendingOpsCount === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: pendingOpsCount > 0 ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#e5e7eb', color: pendingOpsCount > 0 ? '#fff' : '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: pendingOpsCount > 0 ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif", opacity: saving ? 0.7 : 1 }}>
                  <Save size={14} />{saving ? t('eventClosing.saving') : t('eventClosing.saveChanges')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
