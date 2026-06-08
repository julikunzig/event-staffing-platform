import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { DollarSign, Eye, X, CheckSquare, Square } from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface FinishedEvent { id: number; event_code: string | null; name: string; event_date: string; start_time: string; address: string; city: string | null }
interface EventDetail { id: number; event_code: string | null; name: string; event_date: string; roles: { role_name: string; base_rate: number; employees: { user_name: string; hours_worked: number; hourly_rate: number }[] }[] }
interface SettleResult { settlement_id: number; events_settled: number; total_regular: number; total_overtime: number; total_general: number; by_role: { role: string; regular: number; overtime: number; total: number }[] }
interface Settlement { id: number; status: string; period_start: string; period_end: string; total_amount: number; created_at: string; creator_name: string | null; shifts_count: number; employees_count: number }

export default function PayrollPage() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<FinishedEvent[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SettleResult | null>(null)
  const [detailEvent, setDetailEvent] = useState<EventDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, setRes] = await Promise.all([
          api.get<FinishedEvent[]>('/payroll/finished-events'),
          api.get<Settlement[]>('/payroll/settlements'),
        ])
        setEvents(evRes.data)
        setSettlements(setRes.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleSelect = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }
  const selectAll = () => { if (selected.size === events.length) setSelected(new Set()); else setSelected(new Set(events.map(e => e.id))) }

  const openDetail = async (id: number) => {
    setDetailLoading(true)
    try { const res = await api.get<EventDetail>(`/payroll/events/${id}/detail`); setDetailEvent(res.data) }
    catch { setError('Error loading detail') }
    finally { setDetailLoading(false) }
  }

  const handleSettle = async () => {
    if (selected.size === 0) { setError(t('payroll.selectAtLeastOne')); return }
    if (!confirm(t('payroll.confirmSettle'))) return
    setSettling(true); setError(''); setResult(null)
    try {
      const res = await api.post<SettleResult>('/payroll/settle', { event_ids: Array.from(selected) })
      setResult(res.data)
      setSelected(new Set())
      // Reload events
      const evRes = await api.get<FinishedEvent[]>('/payroll/finished-events')
      setEvents(evRes.data)
      const setRes = await api.get<Settlement[]>('/payroll/settlements')
      setSettlements(setRes.data)
    } catch (e: any) { setError(e.response?.data?.detail || 'Error') }
    finally { setSettling(false) }
  }

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  return (
    <div style={{ maxWidth: '900px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('payroll.title')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowHistory(!showHistory)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
            {showHistory ? t('payroll.showEvents') : t('payroll.history')}
          </button>
          <button onClick={handleSettle} disabled={settling || selected.size === 0}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: selected.size === 0 ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: selected.size === 0 ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: selected.size === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
            <DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {settling ? t('payroll.settling') : `${t('payroll.settle')} (${selected.size})`}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

      {/* Settlement Result */}
      {result && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#15803d' }}>✅ {t('payroll.settleSuccess')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: '#fff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payroll.eventsSettled')}</p>
              <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>{result.events_settled}</p>
            </div>
            <div style={{ padding: '10px', background: '#fff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payroll.totalRegular')}</p>
              <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>${result.total_regular.toFixed(2)}</p>
            </div>
            <div style={{ padding: '10px', background: '#fff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payroll.totalOvertime')}</p>
              <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>${result.total_overtime.toFixed(2)}</p>
            </div>
            <div style={{ padding: '10px', background: '#fff', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payroll.totalGeneral')}</p>
              <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: GREEN_DARK }}>${result.total_general.toFixed(2)}</p>
            </div>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>{t('payroll.byRole')}:</p>
          {result.by_role.map(r => (
            <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 600 }}>{r.role}</span>
              <span>Regular: ${r.regular.toFixed(2)} | OT: ${r.overtime.toFixed(2)} | <strong>${r.total.toFixed(2)}</strong></span>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {showHistory ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('payroll.history')} ({settlements.length})</p>
          </div>
          {settlements.length === 0 ? (
            <p style={{ padding: '20px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('payroll.noSettlements')}</p>
          ) : settlements.map(s => (
            <div key={s.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>#{s.id} · {s.period_start} — {s.period_end}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{s.employees_count} {t('payroll.employees')} · {s.shifts_count} {t('payroll.shifts')} · {s.creator_name}</p>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: GREEN_DARK }}>${s.total_amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        /* Events List */
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('payroll.finishedEvents')} ({events.length})</p>
            <button onClick={selectAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: GREEN, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
              {selected.size === events.length ? <CheckSquare size={14} /> : <Square size={14} />}
              {t('payroll.selectAll')}
            </button>
          </div>
          {events.length === 0 ? (
            <p style={{ padding: '30px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('payroll.noFinishedEvents')}</p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: '1px solid #f3f4f6' }}>
                  <input type="checkbox" checked={selected.has(ev.id)} onChange={() => toggleSelect(ev.id)} style={{ width: '16px', height: '16px', accentColor: GREEN, cursor: 'pointer' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{ev.event_code && `#${ev.event_code} · `}{ev.event_date} · {ev.city}</p>
                  </div>
                  <button onClick={() => openDetail(ev.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                    <Eye size={13} />{t('common.view') || 'Ver'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailEvent && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} onClick={() => setDetailEvent(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: '16px', zIndex: 51, padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{detailEvent.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>{detailEvent.event_code && `#${detailEvent.event_code} · `}{detailEvent.event_date}</p>
              </div>
              <button onClick={() => setDetailEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            {detailEvent.roles.map(role => (
              <div key={role.role_name} style={{ marginBottom: '14px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: GREEN, textTransform: 'uppercase' }}>{role.role_name}</p>
                {role.employees.map((emp, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: i % 2 === 0 ? '#f9fafb' : '#fff', borderRadius: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#374151' }}>{emp.user_name}</span>
                    <span style={{ color: '#6b7280' }}>{emp.hours_worked.toFixed(2)}h · ${emp.hourly_rate.toFixed(2)}/h</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {detailLoading && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>{t('common.loading')}</div></div>}
    </div>
  )
}
