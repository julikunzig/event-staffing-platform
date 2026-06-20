import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import {
  CreditCard, Eye, X, CheckSquare, Square, Search, RefreshCw,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Calendar,
} from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface SettledEvent { id: number; event_code: string | null; name: string; event_date: string; start_time: string; address: string; city: string | null }
interface EventDetail { id: number; event_code: string | null; name: string; event_date: string; roles: { role_name: string; base_rate: number; employees: { user_id: number; user_name: string; hours_worked: number; hourly_rate: number; total_pay: number }[] }[] }
interface PayResult { payment_id: number; events_paid: number; employees_paid: number; total_amount: number; items: { user_id: number; user_name: string; total_hours: number; total_amount: number; events_count: number }[] }
interface PaymentHistory { id: number; status: string; total_amount: number; events_count: number; employees_count: number; created_at: string; creator_name: string | null; event_names: string[] }
interface PaymentDetail { payment_id: number; total_amount: number; events_count: number; employees_count: number; created_at: string; items: { user_id: number; user_name: string; total_hours: number; total_amount: number; events_count: number }[]; events: { id: number; name: string; event_date: string; city: string | null }[] }

type SortKey = 'name' | 'event_date' | 'city'
type SortDir = 'asc' | 'desc'

const fieldStyle: React.CSSProperties = {
  height: '36px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px',
  padding: '0 10px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}

function getDatePresets(t: any) {
  return [
    { key: '', label: t('payments.dateAll') || 'Todos' },
    { key: 'today', label: t('payments.dateToday') || 'Hoy' },
    { key: 'yesterday', label: t('payments.dateYesterday') || 'Ayer' },
    { key: 'week', label: t('payments.dateWeek') || 'Esta semana' },
    { key: 'month', label: t('payments.dateMonth') || 'Este mes' },
    { key: 'range', label: t('payments.dateRange') || 'Rango' },
  ]
}

export default function PaymentsPage() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<SettledEvent[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PayResult | null>(null)
  const [detailEvent, setDetailEvent] = useState<EventDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [history, setHistory] = useState<PaymentHistory[]>([])
  const [historyDetail, setHistoryDetail] = useState<PaymentDetail | null>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'history'>('events')
  const [confirmPay, setConfirmPay] = useState(false)

  // Filtros
  const [search, setSearch] = useState('')
  const [datePreset, setDatePreset] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Tabla
  const [sortKey, setSortKey] = useState<SortKey>('event_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Historial
  const [histSearch, setHistSearch] = useState('')
  const [histPage, setHistPage] = useState(1)
  const [histPageSize, setHistPageSize] = useState(10)

  const loadAll = async (silent?: boolean) => {
    if (silent) setRefreshing(true); else setLoading(true)
    try {
      const [evRes, hRes] = await Promise.all([
        api.get<SettledEvent[]>('/payments/settled-events'),
        api.get<PaymentHistory[]>('/payments/history'),
      ])
      setEvents(evRes.data)
      setHistory(hRes.data)
    } catch { setError(t('payments.errorLoading') || 'Error cargando datos') }
    finally { if (silent) setRefreshing(false); else setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  // ── Filtro por fecha ──
  const filteredByDate = useMemo(() => {
    if (!datePreset) return events
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    if (datePreset === 'today') return events.filter(e => e.event_date === todayStr)
    if (datePreset === 'yesterday') {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return events.filter(e => e.event_date === y.toISOString().split('T')[0])
    }
    if (datePreset === 'week') {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay())
      const end = new Date(start); end.setDate(start.getDate() + 6)
      const s = start.toISOString().split('T')[0], en = end.toISOString().split('T')[0]
      return events.filter(e => e.event_date >= s && e.event_date <= en)
    }
    if (datePreset === 'month') {
      const ym = todayStr.slice(0, 7)
      return events.filter(e => e.event_date.startsWith(ym))
    }
    if (datePreset === 'range') {
      return events.filter(e => (!dateFrom || e.event_date >= dateFrom) && (!dateTo || e.event_date <= dateTo))
    }
    return events
  }, [events, datePreset, dateFrom, dateTo])

  // ── Búsqueda + sort ──
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = filteredByDate
    if (q) list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.event_code || '').toLowerCase().includes(q) ||
      (e.city || '').toLowerCase().includes(q)
    )
    const sorted = [...list].sort((a, b) => {
      let av: string = '', bv: string = ''
      if (sortKey === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase() }
      else if (sortKey === 'city') { av = (a.city || '').toLowerCase(); bv = (b.city || '').toLowerCase() }
      else { av = a.event_date; bv = b.event_date }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredByDate, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  const pageClamped = Math.min(page, totalPages)
  const paginated = processed.slice((pageClamped - 1) * pageSize, pageClamped * pageSize)

  useEffect(() => { setPage(1) }, [search, datePreset, dateFrom, dateTo, pageSize])

  // ── Historial: filtro + paginación ──
  const histFiltered = useMemo(() => {
    const q = histSearch.trim().toLowerCase()
    if (!q) return history
    return history.filter(h =>
      `#${h.id}`.includes(q) ||
      String(h.id).includes(q) ||
      (h.creator_name || '').toLowerCase().includes(q) ||
      h.event_names.some(n => n.toLowerCase().includes(q))
    )
  }, [history, histSearch])
  const histTotalPages = Math.max(1, Math.ceil(histFiltered.length / histPageSize))
  const histPageClamped = Math.min(histPage, histTotalPages)
  const histPaginated = histFiltered.slice((histPageClamped - 1) * histPageSize, histPageClamped * histPageSize)
  useEffect(() => { setHistPage(1) }, [histSearch, histPageSize])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'event_date' ? 'desc' : 'asc') }
  }
  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }
  const allVisibleSelected = processed.length > 0 && processed.every(e => selected.has(e.id))
  const selectAllVisible = () => {
    if (allVisibleSelected) {
      const next = new Set(selected); processed.forEach(e => next.delete(e.id)); setSelected(next)
    } else {
      const next = new Set(selected); processed.forEach(e => next.add(e.id)); setSelected(next)
    }
  }

  const openDetail = async (id: number) => {
    setDetailLoading(true)
    try { const res = await api.get<EventDetail>(`/payments/events/${id}/detail`); setDetailEvent(res.data) }
    catch { setError(t('payments.errorDetail') || 'Error cargando detalle') }
    finally { setDetailLoading(false) }
  }

  const openHistoryDetail = async (id: number) => {
    setDetailLoading(true)
    try { const res = await api.get<PaymentDetail>(`/payments/history/${id}`); setHistoryDetail(res.data) }
    catch { setError(t('payments.errorDetail') || 'Error cargando detalle') }
    finally { setDetailLoading(false) }
  }

  const doPay = async () => {
    setConfirmPay(false)
    setPaying(true); setError(''); setResult(null)
    try {
      const res = await api.post<PayResult>('/payments/pay', { event_ids: Array.from(selected) })
      setResult(res.data)
      setSelected(new Set())
      await loadAll(true)
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error') || 'Error') }
    finally { setPaying(false) }
  }

  const handlePayClick = () => {
    if (selected.size === 0) { setError(t('payments.selectAtLeastOne') || 'Selecciona al menos un evento'); return }
    setError(''); setConfirmPay(true)
  }

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  const presets = getDatePresets(t)

  return (
    <div style={{ maxWidth: '960px', fontFamily: "'Poppins',sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('payments.title') || 'Pagos'}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => loadAll(true)} disabled={refreshing} title={t('payments.refresh') || 'Recargar'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: refreshing ? 'default' : 'pointer', color: '#6b7280' }}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'pm-spin 0.8s linear infinite' : 'none' }} />
          </button>
          {activeTab === 'events' && (
            <button onClick={handlePayClick} disabled={paying || selected.size === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: selected.size === 0 ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: selected.size === 0 ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: selected.size === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <CreditCard size={14} />
              {paying ? (t('payments.paying') || 'Pagando...') : `${t('payments.pay') || 'Pagar'} (${selected.size})`}
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        {([
          { key: 'events' as const, label: `${t('payments.settledEvents') || 'Eventos Liquidados'} (${events.length})` },
          { key: 'history' as const, label: `${t('payments.history') || 'Historial de Pagos'} (${history.length})` },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: 'transparent', color: activeTab === tab.key ? GREEN : '#9ca3af', borderBottom: `2px solid ${activeTab === tab.key ? GREEN : 'transparent'}`, marginBottom: '-1px', fontFamily: "'Poppins',sans-serif" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ TAB EVENTOS ════════ */}
      {activeTab === 'events' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('payments.searchEvent') || 'Buscar evento por nombre o código...'} style={{ ...fieldStyle, width: '100%', paddingLeft: '32px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
            <Calendar size={14} color="#9ca3af" />
            {presets.map(p => (
              <button key={p.key} onClick={() => setDatePreset(p.key)}
                style={{ padding: '5px 12px', borderRadius: '999px', border: `1.5px solid ${datePreset === p.key ? GREEN : '#e5e7eb'}`, background: datePreset === p.key ? '#f0fdf4' : '#fff', color: datePreset === p.key ? GREEN_DARK : '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {p.label}
              </button>
            ))}
            {datePreset === 'range' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...fieldStyle, height: '32px' }} />
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...fieldStyle, height: '32px' }} />
              </div>
            )}
          </div>

          {/* Tabla */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={selectAllVisible} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: GREEN, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                {allVisibleSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                {t('payments.selectAll') || 'Seleccionar todos'} ({processed.length})
              </button>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{selected.size} {t('payments.selected') || 'seleccionados'}</span>
            </div>

            {processed.length === 0 ? (
              <p style={{ padding: '30px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('payments.noSettledEvents') || 'No hay eventos liquidados pendientes de pago'}</p>
            ) : (
              <>
                {/* Cabecera */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                  <span style={{ width: '16px' }} />
                  <button onClick={() => toggleSort('name')} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0, textTransform: 'uppercase' }}>
                    {t('payments.colEvent') || 'Evento'} <SortIcon col="name" />
                  </button>
                  <button onClick={() => toggleSort('event_date')} style={{ width: '110px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0, textTransform: 'uppercase' }}>
                    {t('payments.colDate') || 'Fecha'} <SortIcon col="event_date" />
                  </button>
                  <button onClick={() => toggleSort('city')} style={{ width: '110px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0, textTransform: 'uppercase' }}>
                    {t('payments.colCity') || 'Ciudad'} <SortIcon col="city" />
                  </button>
                  <span style={{ width: '60px' }} />
                </div>

                {/* Filas */}
                {paginated.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', background: selected.has(ev.id) ? '#f0fdf4' : '#fff' }}>
                    <input type="checkbox" checked={selected.has(ev.id)} onChange={() => toggleSelect(ev.id)} style={{ width: '16px', height: '16px', accentColor: GREEN, cursor: 'pointer', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</p>
                      {ev.event_code && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>#{ev.event_code}</p>}
                    </div>
                    <span style={{ width: '110px', fontSize: '12px', color: '#374151', flexShrink: 0 }}>{ev.event_date}</span>
                    <span style={{ width: '110px', fontSize: '12px', color: '#6b7280', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.city || '—'}</span>
                    <button onClick={() => openDetail(ev.id)} style={{ width: '60px', padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                      <Eye size={13} />
                    </button>
                  </div>
                ))}

                {/* Footer paginación */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{t('payments.rowsPerPage') || 'Filas'}:</span>
                    {[10, 25, 50].map(size => (
                      <button key={size} onClick={() => setPageSize(size)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: `1.5px solid ${pageSize === size ? GREEN : '#e5e7eb'}`, background: pageSize === size ? '#f0fdf4' : '#fff', color: pageSize === size ? GREEN_DARK : '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {(pageClamped - 1) * pageSize + 1}–{Math.min(pageClamped * pageSize, processed.length)} de {processed.length}
                    </span>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageClamped <= 1}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: pageClamped <= 1 ? 'not-allowed' : 'pointer', opacity: pageClamped <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={15} /></button>
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>{pageClamped} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageClamped >= totalPages}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: pageClamped >= totalPages ? 'not-allowed' : 'pointer', opacity: pageClamped >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={15} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ════════ TAB HISTORIAL ════════ */}
      {activeTab === 'history' && (
        <>
          <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={histSearch} onChange={e => setHistSearch(e.target.value)} placeholder={t('payments.searchPayment') || 'Buscar por #, evento o autor...'} style={{ ...fieldStyle, width: '100%', paddingLeft: '32px' }} />
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            {histFiltered.length === 0 ? (
              <p style={{ padding: '30px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('payments.noHistory') || 'No hay pagos registrados'}</p>
            ) : (
              <>
                {histPaginated.map(h => (
                  <div key={h.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div onClick={() => openHistoryDetail(h.id)} style={{ minWidth: 0, flex: 1, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>#{h.id} · {h.events_count} {t('payments.events') || 'eventos'}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#f0fdf4', color: '#15803d' }}>{t('payments.statusPaid') || 'Pagado'}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                        {h.employees_count} {t('payments.employees') || 'empleados'}{h.creator_name ? ` · ${h.creator_name}` : ''} · {new Date(h.created_at).toLocaleDateString()}
                      </p>
                      {h.event_names.length > 0 && (
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.event_names.slice(0, 3).join(', ')}{h.event_names.length > 3 ? ` +${h.event_names.length - 3} más` : ''}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: GREEN_DARK }}>${h.total_amount.toFixed(2)}</span>
                      <button onClick={() => openHistoryDetail(h.id)} title={t('payments.viewDetail') || 'Ver detalle'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}><Eye size={15} /></button>
                    </div>
                  </div>
                ))}

                {/* Footer paginación historial */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{t('payments.rowsPerPage') || 'Filas'}:</span>
                    {[10, 25, 50].map(size => (
                      <button key={size} onClick={() => setHistPageSize(size)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: `1.5px solid ${histPageSize === size ? GREEN : '#e5e7eb'}`, background: histPageSize === size ? '#f0fdf4' : '#fff', color: histPageSize === size ? GREEN_DARK : '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {(histPageClamped - 1) * histPageSize + 1}–{Math.min(histPageClamped * histPageSize, histFiltered.length)} de {histFiltered.length}
                    </span>
                    <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPageClamped <= 1}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: histPageClamped <= 1 ? 'not-allowed' : 'pointer', opacity: histPageClamped <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={15} /></button>
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>{histPageClamped} / {histTotalPages}</span>
                    <button onClick={() => setHistPage(p => Math.min(histTotalPages, p + 1))} disabled={histPageClamped >= histTotalPages}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: histPageClamped >= histTotalPages ? 'not-allowed' : 'pointer', opacity: histPageClamped >= histTotalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={15} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ════════ MODAL: CONFIRMAR PAGO ════════ */}
      {confirmPay && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }} onClick={() => setConfirmPay(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '440px', background: '#fff', borderRadius: '16px', zIndex: 61, padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{t('payments.confirmTitle') || '¿Pagar eventos seleccionados?'}</h3>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              {(t('payments.confirmMsg') || 'Se procesará el pago de {count} evento(s). Una vez pagados, no podrás modificar las horas trabajadas de estos eventos.').replace('{count}', String(selected.size))}
            </p>
            <p style={{ margin: '0 0 18px', fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
              {t('payments.confirmWarning') || '⚠ Esta acción no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmPay(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('common.cancel') || 'Cancelar'}
              </button>
              <button onClick={doPay} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('payments.confirmPay') || 'Sí, pagar'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════ MODAL: RESULTADO DE PAGO ════════ */}
      {result && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }} onClick={() => setResult(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '560px', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: '16px', zIndex: 61, padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#15803d' }}>✅ {t('payments.paySuccess') || 'Pago procesado exitosamente'}</p>
              <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payments.eventsPaid') || 'Eventos'}</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>{result.events_paid}</p>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payments.employeesPaid') || 'Empleados'}</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>{result.employees_paid}</p>
              </div>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{t('payments.totalPaid') || 'Total Pagado'}</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: GREEN_DARK }}>${result.total_amount.toFixed(2)}</p>
              </div>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>{t('payments.byEmployee') || 'Detalle por empleado'}</p>
            {result.items.map(item => (
              <div key={item.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{item.user_name}</span>
                <span style={{ color: '#6b7280' }}>{item.total_hours.toFixed(2)}h · {item.events_count} ev · <strong style={{ color: GREEN_DARK }}>${item.total_amount.toFixed(2)}</strong></span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ MODAL: DETALLE DE EVENTO ════════ */}
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
                    <span style={{ color: '#6b7280' }}>{emp.hours_worked.toFixed(2)}h · ${emp.hourly_rate.toFixed(2)}/h · <strong>${emp.total_pay.toFixed(2)}</strong></span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ MODAL: DETALLE DE PAGO (HISTORIAL) ════════ */}
      {historyDetail && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} onClick={() => setHistoryDetail(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: '16px', zIndex: 51, padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t('payments.paymentDetail') || 'Detalle del Pago'} #{historyDetail.payment_id}</h3>
              <button onClick={() => setHistoryDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Eventos</p>
                <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700 }}>{historyDetail.events_count}</p>
              </div>
              <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Empleados</p>
                <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700 }}>{historyDetail.employees_count}</p>
              </div>
              <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Total</p>
                <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700, color: GREEN_DARK }}>${historyDetail.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Eventos pagados */}
            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{t('payments.paidEvents') || 'Eventos pagados'}</p>
            {historyDetail.events.map(ev => (
              <div key={ev.id} style={{ padding: '4px 10px', fontSize: '12px', color: '#374151' }}>· {ev.name} ({ev.event_date})</div>
            ))}

            {/* Empleados pagados */}
            <p style={{ margin: '14px 0 6px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{t('payments.paidEmployees') || 'Empleados pagados'}</p>
            {historyDetail.items.map(item => (
              <div key={item.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{item.user_name}</span>
                <span style={{ color: '#6b7280' }}>{item.total_hours.toFixed(2)}h · {item.events_count} ev · <strong style={{ color: GREEN_DARK }}>${item.total_amount.toFixed(2)}</strong></span>
              </div>
            ))}
          </div>
        </>
      )}

      {detailLoading && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>{t('common.loading')}</div></div>}

      <style>{`@keyframes pm-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
