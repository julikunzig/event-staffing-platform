import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import { Download, BarChart2, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 5px', display: 'block',
}

// ── Date helpers ────────────────────────────────────────────────────────────
const fmt = (d: Date) => d.toISOString().slice(0, 10)
const today = () => { const d = new Date(); return fmt(d) }
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return fmt(d) }
const monthStart = () => { const d = new Date(); return fmt(new Date(d.getFullYear(), d.getMonth(), 1)) }
const monthEnd   = () => { const d = new Date(); return fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
const yearStart  = () => fmt(new Date(new Date().getFullYear(), 0, 1))
const yearEnd    = ()  => fmt(new Date(new Date().getFullYear(), 11, 31))

const DATE_PRESETS = [
  { key: 'month', label: 'Mes actual',  from: monthStart,  to: monthEnd  },
  { key: 'year',  label: 'Año actual',  from: yearStart,   to: yearEnd   },
  { key: 'today', label: 'Hoy',         from: today,       to: today     },
  { key: 'yesterday', label: 'Ayer',    from: yesterday,   to: yesterday },
  { key: 'custom',label: 'Personalizado', from: () => '', to: () => '' },
]

const PAGE_SIZE = 20

interface EmployeesByEventRow { event_date: string; event_start_time: string | null; event_end_time: string | null; event_name: string; employee_name: string; phone: string | null; job_role: string; hours_worked: string | null; hourly_rate: string; total_pay: string | null }
interface PaymentConsolidationRow { employee_name: string; phone: string | null; total_hours: string; total_pay: string }

type SortDir = 'asc' | 'desc' | null

export default function ReportsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const isAdminOrCoord = isAdmin(user) || user?.role === 'coordinator'
  const isEmployee = user?.role === 'employee'

  const [tab, setTab] = useState<'event'|'employee'|'me'|'employees_by_event'|'payment_consolidation'>(isEmployee ? 'me' : 'event')
  const [eventDate, setEventDate]           = useState('')
  const [eventName, setEventName]           = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [preset, setPreset]                 = useState('month')
  const [fromDate, setFromDate]             = useState(monthStart)
  const [toDate, setToDate]                 = useState(monthEnd)
  const [report, setReport]                 = useState<any>(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  // Paginación
  const [page, setPage] = useState(1)

  // Sort
  const [sortCol, setSortCol]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>(null)

  const applyPreset = (key: string) => {
    setPreset(key)
    const p = DATE_PRESETS.find(p => p.key === key)
    if (p && key !== 'custom') { setFromDate(p.from()); setToDate(p.to()) }
  }

  const isEBE = tab === 'employees_by_event'
  const isPC  = tab === 'payment_consolidation'
  const needsDates = tab !== 'event'
  const canFetch = !(tab === 'event' && !eventDate) &&
    !(tab === 'employee' && (!employeeSearch || !fromDate || !toDate)) &&
    !((isEBE || isPC || tab === 'me') && (!fromDate || !toDate))

  const fetchReport = async () => {
    setError(''); setLoading(true); setPage(1); setSortCol(null); setSortDir(null)
    try {
      if (tab === 'event') {
        const p = new URLSearchParams(); if (eventDate) p.append('event_date', eventDate); if (eventName) p.append('event_name', eventName)
        setReport((await api.get<any>(`/reports/events?${p}`)).data)
      } else if (tab === 'employee') {
        const p = new URLSearchParams(); if (employeeSearch) p.append('employee_search', employeeSearch); if (fromDate) p.append('from', fromDate); if (toDate) p.append('to', toDate)
        setReport((await api.get<any>(`/reports/employees?${p}`)).data)
      } else if (tab === 'me') {
        setReport((await api.get<any>(`/reports/me?from=${fromDate}&to=${toDate}`)).data)
      } else if (isEBE) {
        const p = new URLSearchParams(); if (fromDate) p.append('from_date', fromDate); if (toDate) p.append('to_date', toDate)
        setReport((await api.get<EmployeesByEventRow[]>(`/reports/employees-by-event?${p}`)).data)
      } else if (isPC) {
        const p = new URLSearchParams(); if (fromDate) p.append('from_date', fromDate); if (toDate) p.append('to_date', toDate)
        setReport((await api.get<PaymentConsolidationRow[]>(`/reports/payment-consolidation?${p}`)).data)
      }
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setLoading(false) }
  }

  const download = async (format: 'csv'|'pdf'|'excel') => {
    const mimes: Record<string,string> = { csv: 'text/csv', pdf: 'application/pdf', excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    const exts:  Record<string,string> = { csv: 'csv', pdf: 'pdf', excel: 'xlsx' }
    const p = new URLSearchParams(); p.append('format', format)
    let url = ''
    if (tab === 'event')       { if (eventDate) p.append('event_date', eventDate); if (eventName) p.append('event_name', eventName); url = `/reports/events?${p}` }
    else if (tab === 'employee'){ if (employeeSearch) p.append('employee_search', employeeSearch); if (fromDate) p.append('from', fromDate); if (toDate) p.append('to', toDate); url = `/reports/employees?${p}` }
    else if (tab === 'me')      { url = `/reports/me?from=${fromDate}&to=${toDate}&format=${format}` }
    else if (isEBE)             { if (fromDate) p.append('from_date', fromDate); if (toDate) p.append('to_date', toDate); url = `/reports/employees-by-event?${p}` }
    else if (isPC)              { if (fromDate) p.append('from_date', fromDate); if (toDate) p.append('to_date', toDate); url = `/reports/payment-consolidation?${p}` }
    try {
      const res = await api.get(url, { responseType: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([res.data], { type: mimes[format] }))
      link.download = `reporte_${Date.now()}.${exts[format]}`
      link.click(); URL.revokeObjectURL(link.href)
    } catch { setError(t('common.error')) }
  }

  // ── Flatten report rows ──────────────────────────────────────────────────
  const rawRows: any[] = useMemo(() => {
    if (!report) return []
    if (isEBE || isPC) return report
    if (Array.isArray(report)) return report.flatMap((r: any) => r.employees.map((e: any) => ({ ...e, event_name: r.event_name, event_date: r.event_date, event_start_time: r.event_start_time, event_end_time: r.event_end_time })))
    if ('events' in report) return report.events
    if ('employees' in report) return report.employees
    return []
  }, [report, isEBE, isPC])

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortedRows = useMemo(() => {
    if (!sortCol || !sortDir) return rawRows
    return [...rawRows].sort((a, b) => {
      const va = a[sortCol] ?? ''
      const vb = b[sortCol] ?? ''
      const na = parseFloat(va), nb = parseFloat(vb)
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rawRows, sortCol, sortDir])

  // ── Paginate ─────────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(sortedRows.length / PAGE_SIZE)
  const pagedRows   = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Column definitions ────────────────────────────────────────────────────
  type ColDef = { label: string; key: string; right?: boolean; bold?: boolean; green?: boolean; dim?: boolean }
  const cols: ColDef[] = isEBE
    ? [
        { label: 'Fecha',      key: 'event_date' },
        { label: 'Inicio',     key: 'event_start_time' },
        { label: 'Fin',        key: 'event_end_time' },
        { label: 'Evento',     key: 'event_name', bold: true },
        { label: 'Empleado',   key: 'employee_name' },
        { label: 'Teléfono',   key: 'phone', dim: true },
        { label: 'Rol',        key: 'job_role' },
        { label: 'Horas',      key: 'hours_worked', right: true },
        { label: 'Tarifa/h',   key: 'hourly_rate', right: true },
        { label: 'Total',      key: 'total_pay', right: true, bold: true, green: true },
      ]
    : isPC
    ? [
        { label: 'Empleado',     key: 'employee_name', bold: true },
        { label: 'Teléfono',     key: 'phone', dim: true },
        { label: 'Total Horas',  key: 'total_hours', right: true },
        { label: 'Total a Pagar',key: 'total_pay', right: true, bold: true, green: true },
      ]
    : Array.isArray(report)
    ? [
        { label: 'Evento',   key: 'event_name', bold: true },
        { label: 'Fecha',    key: 'event_date' },
        { label: 'Inicio',   key: 'event_start_time' },
        { label: 'Fin',      key: 'event_end_time' },
        { label: 'Empleado', key: 'user_name' },
        { label: 'Rol',      key: 'job_role' },
        { label: 'Horas',    key: 'hours_worked', right: true },
        { label: 'Total',    key: 'total_pay', right: true, bold: true, green: true },
      ]
    : report && 'events' in report
    ? [
        { label: 'Evento',   key: 'event_name', bold: true },
        { label: 'Fecha',    key: 'event_date' },
        { label: 'Inicio',   key: 'event_start_time' },
        { label: 'Fin',      key: 'event_end_time' },
        { label: 'Rol',      key: 'job_role' },
        { label: 'Horas',    key: 'hours_worked', right: true },
        { label: 'Valor/h',  key: 'hourly_rate', right: true },
        { label: 'Regular',  key: 'regular_pay', right: true },
        { label: 'Overtime', key: 'overtime_pay', right: true },
        { label: 'Total',    key: 'total_pay', right: true, bold: true, green: true },
      ]
    : [
        { label: 'Evento', key: 'event_name', bold: true },
        { label: 'Fecha',  key: 'event_date' },
        { label: 'Inicio', key: 'event_start_time' },
        { label: 'Fin',    key: 'event_end_time' },
        { label: 'Rol',    key: 'job_role' },
        { label: 'Horas',  key: 'hours_worked', right: true },
        { label: 'Total',  key: 'total_pay', right: true, bold: true, green: true },
      ]

  const handleSort = (key: string) => {
    if (sortCol !== key) { setSortCol(key); setSortDir('asc'); setPage(1) }
    else if (sortDir === 'asc') { setSortDir('desc'); setPage(1) }
    else { setSortCol(null); setSortDir(null) }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown size={11} style={{ opacity: 0.3 }} />
    if (sortDir === 'asc')  return <ChevronUp   size={11} color={GREEN} />
    return <ChevronDown size={11} color={GREEN} />
  }

  const fmtVal = (col: ColDef, row: any) => {
    const v = row[col.key]
    if (v == null || v === '') return '—'
    if (col.green || col.key === 'total_pay' || col.key === 'total_hours' || col.key === 'hours_worked' || col.key === 'hourly_rate' || col.key === 'regular_pay' || col.key === 'overtime_pay') {
      const n = parseFloat(v)
      if (isNaN(n)) return v
      if (col.key === 'hours_worked' || col.key === 'total_hours') return n.toFixed(2)
      return `$${n.toFixed(2)}`
    }
    return v
  }

  // Totals
  const totalHours = rawRows.reduce((s, r) => s + parseFloat(isEBE ? (r.hours_worked||0) : (r.total_hours||r.hours_worked||0)), 0)
  const totalPay   = rawRows.reduce((s, r) => s + parseFloat(r.total_pay||0), 0)

  const TABS = [
    ...(isAdminOrCoord ? [
      { key: 'event',                 label: t('reports.byEvent') },
      { key: 'employee',              label: t('reports.byEmployee') },
      { key: 'employees_by_event',    label: t('reports.eventsByDates') },
      { key: 'payment_consolidation', label: t('reports.paymentConsolidation') },
    ] : []),
    ...(isEmployee ? [{ key: 'me', label: t('reports.myReport') }] : []),
  ]

  if (!isAdminOrCoord && !isEmployee) return (
    <div style={{ maxWidth: '600px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', gap: '10px', padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
        <AlertCircle size={18} color="#c2410c" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>{t('reports.onlyAdminCanView')}</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BarChart2 size={22} color={GREEN} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.reports')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>Genera y descarga reportes</p>
        </div>
      </div>

      {/* Report type tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => { setTab(tb.key as any); setReport(null); setPage(1) }}
            style={{ padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s', whiteSpace: 'nowrap', background: tab === tb.key ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#fff', color: tab === tb.key ? '#fff' : '#374151', border: tab === tb.key ? 'none' : '1.5px solid #e5e7eb', boxShadow: tab === tb.key ? '0 2px 8px rgba(45,184,75,0.25)' : 'none' }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        {/* Date presets — shown when tab uses dates */}
        {needsDates && (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Período</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DATE_PRESETS.map(p => (
                <button key={p.key} onClick={() => applyPreset(p.key)}
                  style={{ padding: '5px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s', background: preset === p.key ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#f9fafb', color: preset === p.key ? '#fff' : '#374151', border: preset === p.key ? 'none' : '1.5px solid #e5e7eb' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '12px', marginBottom: '14px' }}>
          {tab === 'event' && (<>
            <div><label style={labelStyle}>{t('reports.eventDate')} *</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>{t('reports.eventName')}</label><input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Nombre del evento" style={fieldStyle} /></div>
          </>)}
          {tab === 'employee' && (
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>{t('reports.employee')} *</label>
              <input value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} placeholder="Nombre, email o teléfono" style={fieldStyle} />
            </div>
          )}
          {needsDates && (preset === 'custom' || tab === 'employee') && (<>
            <div><label style={labelStyle}>{t('reports.from')} *</label><input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPreset('custom') }} style={fieldStyle} /></div>
            <div><label style={labelStyle}>{t('reports.to')} *</label><input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPreset('custom') }} style={fieldStyle} /></div>
          </>)}
          {needsDates && preset !== 'custom' && tab !== 'employee' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>{t('reports.from')}</label><input type="date" value={fromDate} readOnly style={{ ...fieldStyle, opacity: 0.7, cursor: 'default' }} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>{t('reports.to')}</label><input type="date" value={toDate} readOnly style={{ ...fieldStyle, opacity: 0.7, cursor: 'default' }} /></div>
            </div>
          )}
        </div>

        {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={fetchReport} disabled={loading || !canFetch}
            style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: !canFetch ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: !canFetch ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: !canFetch ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: canFetch ? '0 2px 8px rgba(45,184,75,0.2)' : 'none' }}>
            {loading ? t('common.loading') : t('reports.generate')}
          </button>
          {report && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }} />
              {(['csv','pdf','excel'] as const).map(fmt => (
                <button key={fmt} onClick={() => download(fmt)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                  <Download size={13} />{fmt.toUpperCase()}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Results table */}
      {report && rawRows.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Table header summary */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                {isEBE ? t('reports.eventsByDates') : isPC ? t('reports.paymentConsolidation') : Array.isArray(report) ? t('reports.byEvent') : 'event_name' in report ? report.event_name : report.user_name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                {rawRows.length} registros · página {page} de {totalPages}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {totalHours > 0 && <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('reports.totalHours')}</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>{totalHours.toFixed(2)}h</p>
              </div>}
              {totalPay > 0 && <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('reports.totalPay')}</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: GREEN }}>${totalPay.toFixed(2)}</p>
              </div>}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {cols.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)}
                      style={{ padding: '10px 12px', textAlign: col.right ? 'right' : 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: sortCol === col.key ? GREEN : '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {col.label}<SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    {cols.map(col => (
                      <td key={col.key} style={{ padding: '10px 12px', textAlign: col.right ? 'right' : 'left', fontWeight: col.bold ? 600 : 400, color: col.green ? GREEN : col.dim ? '#9ca3af' : '#374151', whiteSpace: col.key === 'event_name' || col.key === 'employee_name' ? 'nowrap' : undefined }}>
                        {fmtVal(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {/* Footer totals */}
              {sortedRows.length > 1 && (
                <tfoot>
                  <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                    {cols.map((col, i) => (
                      <td key={col.key} style={{ padding: '10px 12px', textAlign: col.right ? 'right' : 'left', fontWeight: 700, fontSize: '12px', color: '#111827' }}>
                        {i === 0 ? `Total (${rawRows.length})` :
                          col.key === 'hours_worked' || col.key === 'total_hours' ? rawRows.reduce((s, r) => s + parseFloat(r[col.key]||0), 0).toFixed(2) :
                          col.key === 'total_pay' ? `$${rawRows.reduce((s, r) => s + parseFloat(r[col.key]||0), 0).toFixed(2)}` :
                          col.key === 'regular_pay' ? `$${rawRows.reduce((s, r) => s + parseFloat(r[col.key]||0), 0).toFixed(2)}` :
                          col.key === 'overtime_pay' ? `$${rawRows.reduce((s, r) => s + parseFloat(r[col.key]||0), 0).toFixed(2)}` : ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                Mostrando {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, sortedRows.length)} de {sortedRows.length}
              </p>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setPage(1)} disabled={page === 1}
                  style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>«</button>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  style={{ padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                  const n = start + i
                  return n <= totalPages ? (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width: '30px', height: '30px', borderRadius: '7px', border: 'none', background: page === n ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#fff', border: page === n ? 'none' : '1.5px solid #e5e7eb', color: page === n ? '#fff' : '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                      {n}
                    </button>
                  ) : null
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  style={{ padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {report && rawRows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', color: '#9ca3af', fontSize: '13px' }}>
          No se encontraron registros para el período seleccionado.
        </div>
      )}
    </div>
  )
}