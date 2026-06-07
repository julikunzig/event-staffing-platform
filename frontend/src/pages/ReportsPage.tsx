import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import {
  Download, BarChart2, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown,
  Search, X, FileText, Users, Calendar, DollarSign, Clock, MapPin,
  Shirt, Phone, Mail, ChevronLeft, ChevronRight, User, Briefcase
} from 'lucide-react'

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

// ── Date helpers ─────────────────────────────────────────────────────────────
const fmt   = (d: Date) => d.toISOString().slice(0, 10)
const today     = () => { const d = new Date(); return fmt(d) }
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return fmt(d) }
const monthStart = () => { const d = new Date(); return fmt(new Date(d.getFullYear(), d.getMonth(), 1)) }
const monthEnd   = () => { const d = new Date(); return fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
const yearStart  = () => fmt(new Date(new Date().getFullYear(), 0, 1))
const yearEnd    = () => fmt(new Date(new Date().getFullYear(), 11, 31))

// DATE_PRESETS se genera dentro del componente para acceder a t()

const PAGE_SIZE = 20
type SortDir = 'asc' | 'desc' | null

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  created:        { label: 'Creado',       bg: '#f3f4f6', color: '#6b7280' },
  published:      { label: 'Publicado',    bg: '#eff6ff', color: '#1d4ed8' },
  filled_pending: { label: 'Pend. Aprobac.', bg: '#fffbeb', color: '#b45309' },
  filled:         { label: 'Llenado',      bg: '#f0fdf4', color: '#15803d' },
  started:        { label: 'Iniciado',     bg: '#fefce8', color: '#854d0e' },
  finished:       { label: 'Finalizado',   bg: '#f0fdfa', color: '#0f766e' },
  cancelled:      { label: 'Cancelado',    bg: '#fef2f2', color: '#dc2626' },
  approved:       { label: 'Confirmado',   bg: '#f0fdf4', color: '#15803d' },
  pending:        { label: 'En espera',    bg: '#fffbeb', color: '#b45309' },
  invited:        { label: 'Invitado',     bg: '#fff7ed', color: '#c2410c' },
  rejected:       { label: 'Rechazado',    bg: '#fef2f2', color: '#dc2626' },
  removed:        { label: 'Removido',     bg: '#f9fafb', color: '#9ca3af' },
  confirmed:      { label: 'Confirmado',   bg: '#f0fdf4', color: '#15803d' },
  completed:      { label: 'Completado',   bg: '#f0fdfa', color: '#0f766e' },
  finished_a:     { label: 'Finalizado',   bg: '#f0fdfa', color: '#0f766e' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ── Autocomplete multi-select ─────────────────────────────────────────────────
interface AutoItem { id: number; label: string; sub?: string }
function MultiSelect({ placeholder, onSearch, selected, onToggle, onClear, loading, clearLabel }:
  { placeholder: string; onSearch: (q: string) => void; selected: AutoItem[]; onToggle: (item: AutoItem) => void; onClear: () => void; loading?: boolean; clearLabel?: string }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<AutoItem[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<any>(null)

  const doSearch = useCallback(async (val: string) => {
    const items = await (onSearch as any)(val)
    if (items) setResults(items)
  }, [onSearch])

  const handleInput = (val: string) => {
    setQ(val); setOpen(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => doSearch(val), 300)
  }

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
          {selected.map(item => (
            <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: `1px solid #bbf7d0`, color: GREEN_DARK, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>
              {item.label}
              <button onClick={() => onToggle(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GREEN_DARK, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
          <button onClick={onClear} style={{ fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>{clearLabel || 'Limpiar todo'}</button>
        </div>
      )}
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input value={q} onChange={e => handleInput(e.target.value)} onFocus={() => { setOpen(true); doSearch(q) }}
          placeholder={placeholder}
          style={{ ...fieldStyle, paddingLeft: '32px' }} />
      </div>
      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>Buscando...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>Sin resultados</div>
          ) : results.map(item => {
            const sel = selected.some(s => s.id === item.id)
            return (
              <div key={item.id} onClick={() => { onToggle(item); setQ('') }}
                style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', background: sel ? '#f0fdf4' : 'transparent' }}
                onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = sel ? '#f0fdf4' : 'transparent' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: sel ? `2px solid ${GREEN}` : '2px solid #d1d5db', background: sel ? GREEN : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {sel && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>{item.label}</div>
                  {item.sub && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.sub}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Modal de ficha (evento o empleado) ───────────────────────────────────────
function DetailModal({ type, data, onClose }: { type: 'event' | 'employee'; data: any; onClose: () => void }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'info' | 'staff' | 'events'>('info')

  const tabs = type === 'event'
    ? [{ key: 'info', label: t('reports.information') }, { key: 'staff', label: `${t('reports.staff')} (${data.assignments?.length || 0})` }]
    : [{ key: 'info', label: t('reports.information') }, { key: 'events', label: `${t('reports.events')} (${data.events?.length || 0})` }]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
      <div style={{ position: 'fixed', zIndex: 101, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: '680px', height: '88vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden', fontFamily: "'Poppins',sans-serif" }}>
        {/* Top bar */}
        <div style={{ height: '3px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})`, flexShrink: 0 }} />
        {/* Header */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>{data.name}</h3>
              {type === 'event' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{data.event_date}</span>
                  <StatusPill status={data.status} />
                </div>
              )}
              {type === 'employee' && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{data.email}</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#9ca3af', flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #f3f4f6' }}>
            {tabs.map((tab: any) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: 'transparent', color: activeTab === tab.key ? GREEN : '#9ca3af', borderBottom: `2px solid ${activeTab === tab.key ? GREEN : 'transparent'}`, fontFamily: "'Poppins',sans-serif" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {/* ── EVENTO INFO ── */}
          {type === 'event' && activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: GREEN }}>{data.total_staff}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Personal</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8' }}>{parseFloat(data.total_hours || 0).toFixed(1)}h</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Horas</div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: GREEN }}>${parseFloat(data.total_pay || 0).toFixed(0)}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
                </div>
              </div>
              {/* Datos */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.address && <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#374151' }}><MapPin size={15} color="#9ca3af" style={{ flexShrink: 0 }} /><span>{[data.address, data.city, data.state].filter(Boolean).join(', ')}</span></div>}
                {data.start_time && <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#374151' }}><Clock size={15} color="#9ca3af" /><span>{data.start_time}{data.end_time ? ` — ${data.end_time}` : ''}</span></div>}
                {data.dress_code && <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#374151' }}><Shirt size={15} color="#9ca3af" /><span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{data.dress_code}</span></div>}
              </div>
            </div>
          )}
          {/* ── EVENTO PERSONAL ── */}
          {type === 'event' && activeTab === 'staff' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data.assignments || []).map((a: any, i: number) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {a.user_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{a.user_name}</span>
                      <StatusPill status={a.status} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{a.user_email}{a.user_phone ? ` · ${a.user_phone}` : ''}</div>
                    <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>{a.job_role}</div>
                    {(a.hours_worked || a.total_pay) && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        {a.hours_worked && <span style={{ fontSize: '11px', color: '#6b7280' }}><Clock size={10} /> {parseFloat(a.hours_worked).toFixed(2)}h</span>}
                        {a.total_pay && <span style={{ fontSize: '11px', color: GREEN, fontWeight: 600 }}>${parseFloat(a.total_pay).toFixed(2)}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!data.assignments || data.assignments.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '13px' }}>Sin personal asignado</div>
              )}
            </div>
          )}
          {/* ── EMPLEADO INFO ── */}
          {type === 'employee' && activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8' }}>{data.total_events}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Eventos</div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: GREEN }}>{parseFloat(data.total_hours || 0).toFixed(1)}h</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Horas</div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: GREEN }}>${parseFloat(data.total_pay || 0).toFixed(0)}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
                </div>
              </div>
              {/* Datos de contacto */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#374151' }}><Mail size={15} color="#9ca3af" />{data.email}</div>
                {data.phone && <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#374151' }}><Phone size={15} color="#9ca3af" />{data.phone}</div>}
              </div>
              {/* Roles */}
              {data.roles && data.roles.length > 0 && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Briefcase size={11} />{t('reports.assignedRoles')}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {data.roles.map((r: any, i: number) => (
                      <div key={i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 12px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{r.job_role_name}</span>
                        <span style={{ color: '#9ca3af', marginLeft: '6px' }}>${parseFloat(r.hourly_rate).toFixed(2)}/h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ── EMPLEADO EVENTOS ── */}
          {type === 'employee' && activeTab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data.events || []).map((ev: any, i: number) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{ev.event_name}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#9ca3af', flexWrap: 'wrap' }}>
                      <span><Calendar size={10} /> {ev.event_date}</span>
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>{ev.job_role}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <StatusPill status={ev.status} />
                    {ev.total_pay && <span style={{ fontSize: '12px', fontWeight: 700, color: GREEN }}>${parseFloat(ev.total_pay).toFixed(2)}</span>}
                  </div>
                </div>
              ))}
              {(!data.events || data.events.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '13px' }}>Sin eventos en el período</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { user }   = useAuth()
  const { t }      = useTranslation()
  const isAdminOrCoord = isAdmin(user) || user?.role === 'coordinator'
  const isEmployee     = user?.role === 'employee'

  const DATE_PRESETS = [
    { key: 'month',     label: t('reports.presetMonth'),     from: monthStart, to: monthEnd   },
    { key: 'year',      label: t('reports.presetYear'),      from: yearStart,  to: yearEnd    },
    { key: 'today',     label: t('reports.presetToday'),     from: today,      to: today      },
    { key: 'yesterday', label: t('reports.presetYesterday'), from: yesterday,  to: yesterday  },
    { key: 'custom',    label: t('reports.presetCustom'),    from: () => '',   to: () => ''   },
  ]

  type TabKey = 'event' | 'employee' | 'me' | 'employees_by_event' | 'payment_consolidation'
  const [tab, setTab]         = useState<TabKey>(isEmployee ? 'me' : 'event')
  const [preset, setPreset]   = useState('month')
  const [fromDate, setFromDate] = useState(monthStart)
  const [toDate, setToDate]     = useState(monthEnd)

  // Autocomplete state
  const [selectedEvents, setSelectedEvents]       = useState<AutoItem[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<AutoItem[]>([])
  const [autoLoading, setAutoLoading]             = useState(false)

  // Report state
  const [report, setReport]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Table state
  const [page, setPage]       = useState(1)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [quickSearch, setQuickSearch] = useState('')

  // Detail modal
  const [detailType, setDetailType] = useState<'event' | 'employee' | null>(null)
  const [detailData, setDetailData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const isEBE = tab === 'employees_by_event'
  const isPC  = tab === 'payment_consolidation'

  const applyPreset = (key: string) => {
    setPreset(key)
    const p = DATE_PRESETS.find(pp => pp.key === key)
    if (p && key !== 'custom') { setFromDate(p.from()); setToDate(p.to()) }
  }

  // Autocomplete search functions
  const searchEvents = useCallback(async (q: string): Promise<AutoItem[]> => {
    setAutoLoading(true)
    try {
      const p = new URLSearchParams()
      if (q) p.set('q', q)
      if (fromDate) p.set('from_date', fromDate)
      if (toDate) p.set('to_date', toDate)
      const res = await api.get<any[]>(`/reports/search/events?${p}`)
      return res.data.map(e => ({ id: e.id, label: e.name, sub: `${e.event_date} · ${e.status}` }))
    } catch { return [] } finally { setAutoLoading(false) }
  }, [fromDate, toDate])

  const searchEmployees = useCallback(async (q: string): Promise<AutoItem[]> => {
    setAutoLoading(true)
    try {
      const res = await api.get<any[]>(`/reports/search/employees?q=${encodeURIComponent(q)}`)
      return res.data.map(e => ({ id: e.id, label: e.name, sub: `${e.email}${e.phone ? ` · ${e.phone}` : ''}` }))
    } catch { return [] } finally { setAutoLoading(false) }
  }, [])

  // ── Exportar Excel ──────────────────────────────────────────────────────────
  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const headers = cols.map(c => c.label)
    const data = [headers, ...sortedRows.map(row => cols.map(col => {
      const v = row[col.key]
      if (v == null || v === '') return ''
      if (['total_pay','total_hours','hours_worked','hourly_rate','regular_pay','overtime_pay'].includes(col.key)) {
        const n = parseFloat(v); return isNaN(n) ? v : n
      }
      return v
    }))]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    XLSX.writeFile(wb, `reporte_${tab}_${Date.now()}.xlsx`)
  }

  // ── Exportar PDF ──────────────────────────────────────────────────────────
  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: sortedRows.length > 0 && cols.length > 6 ? 'landscape' : 'portrait' })
    doc.setFontSize(14)
    doc.text('Reporte — ' + TABS.find(t => t.key === tab)?.label, 14, 16)
    doc.setFontSize(9)
    doc.text(`Generado: ${new Date().toLocaleDateString('es')} ${new Date().toLocaleTimeString('es')}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [cols.map(c => c.label)],
      body: sortedRows.map(row => cols.map(col => {
        const v = row[col.key]
        if (v == null || v === '') return ''
        if (['total_pay','total_hours','hours_worked','hourly_rate','regular_pay','overtime_pay'].includes(col.key)) {
          const n = parseFloat(v); if (isNaN(n)) return v
          return col.key === 'hours_worked' || col.key === 'total_hours' ? n.toFixed(2) : '$' + n.toFixed(2)
        }
        return String(v)
      })),
      styles: { fontSize: 8, fontStyle: 'normal' },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      foot: [cols.map((col, i) => {
        if (i === 0) return 'TOTAL (' + rawRows.length + ')'
        if (['hours_worked','total_hours'].includes(col.key)) return rawRows.reduce((s: number, r: any) => s + parseFloat(r[col.key] || 0), 0).toFixed(2)
        if (['total_pay','regular_pay','overtime_pay'].includes(col.key)) return '$' + rawRows.reduce((s: number, r: any) => s + parseFloat(r[col.key] || 0), 0).toFixed(2)
        return ''
      })],
      footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold' },
    })
    doc.save(`reporte_${tab}_${Date.now()}.pdf`)
  }

  const canFetch = !(tab === 'event' && selectedEvents.length === 0) &&
    !(tab === 'employee' && (selectedEmployees.length === 0 || !fromDate || !toDate)) &&
    !((isEBE || isPC || tab === 'me') && (!fromDate || !toDate))

  const fetchReport = async () => {
    setError(''); setLoading(true); setPage(1); setSortCol(null); setSortDir(null); setQuickSearch('')
    try {
      if (tab === 'event') {
        const ids = selectedEvents.map(e => e.id).join(',')
        const res = await api.get<any>(`/reports/events?event_ids=${ids}`)
        setReport(res.data)
      } else if (tab === 'employee') {
        const ids = selectedEmployees.map(e => e.id).join(',')
        const p = new URLSearchParams()
        p.set('employee_ids', ids); p.set('from', fromDate); p.set('to', toDate)
        const res = await api.get<any>(`/reports/employees?${p}`)
        setReport(res.data)
      } else if (tab === 'me') {
        const res = await api.get<any>(`/reports/me?from=${fromDate}&to=${toDate}`)
        setReport(res.data)
      } else if (isEBE) {
        const res = await api.get<any>(`/reports/employees-by-event?from_date=${fromDate}&to_date=${toDate}`)
        setReport(res.data)
      } else if (isPC) {
        const res = await api.get<any>(`/reports/payment-consolidation?from_date=${fromDate}&to_date=${toDate}`)
        setReport(res.data)
      }
    } catch (e: any) { setError(e.response?.data?.detail || 'Error al generar el reporte') }
    finally { setLoading(false) }
  }

  const download = async (format: 'csv') => {
    const p = new URLSearchParams(); p.set('format', format)
    let url = ''
    if (tab === 'event') { const ids = selectedEvents.map(e => e.id).join(','); url = `/reports/events?event_ids=${ids}&format=${format}` }
    else if (tab === 'employee') { const ids = selectedEmployees.map(e => e.id).join(','); url = `/reports/employees?employee_ids=${ids}&from=${fromDate}&to=${toDate}&format=${format}` }
    else if (tab === 'me')  { url = `/reports/me?from=${fromDate}&to=${toDate}&format=${format}` }
    else if (isEBE) { url = `/reports/employees-by-event?from_date=${fromDate}&to_date=${toDate}&format=${format}` }
    else if (isPC)  { url = `/reports/payment-consolidation?from_date=${fromDate}&to_date=${toDate}&format=${format}` }
    try {
      const res = await api.get(url, { responseType: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      link.download = `reporte_${tab}_${Date.now()}.csv`
      link.click(); URL.revokeObjectURL(link.href)
    } catch { setError('Error al descargar') }
  }

  // Open detail modal
  const openEventDetail = async (eventId: number) => {
    setDetailLoading(true); setDetailType('event'); setDetailData(null)
    try {
      const res = await api.get(`/reports/event-detail/${eventId}`)
      setDetailData(res.data)
    } catch { setDetailData(null) } finally { setDetailLoading(false) }
  }

  const openEmployeeDetailByName = async (name: string) => {
    setDetailLoading(true); setDetailType('employee'); setDetailData(null)
    try {
      const res = await api.get<any[]>(`/reports/search/employees?q=${encodeURIComponent(name)}`)
      const found = res.data[0]
      if (!found) { setDetailType(null); return }
      const p = new URLSearchParams()
      if (fromDate) p.set('from_date', fromDate)
      if (toDate) p.set('to_date', toDate)
      const detail = await api.get(`/reports/employee-detail/${found.id}?${p}`)
      setDetailData(detail.data)
    } catch { setDetailData(null) } finally { setDetailLoading(false) }
  }

  const openEmployeeDetail = async (userId: number) => {
    setDetailLoading(true); setDetailType('employee'); setDetailData(null)
    try {
      const p = new URLSearchParams()
      if (fromDate) p.set('from_date', fromDate)
      if (toDate) p.set('to_date', toDate)
      const res = await api.get(`/reports/employee-detail/${userId}?${p}`)
      setDetailData(res.data)
    } catch { setDetailData(null) } finally { setDetailLoading(false) }
  }

  // Flatten rows
  const rawRows: any[] = useMemo(() => {
    if (!report) return []
    if (isEBE || isPC) return report
    if (Array.isArray(report)) {
      // Reporte por evento: array de EventReportOut o EmployeeReportOut
      if (report[0]?.employees !== undefined) {
        return report.flatMap((r: any) => r.employees.map((e: any) => ({ ...e, event_name: r.event_name, event_date: r.event_date, event_id: r.event_id })))
      }
      if (report[0]?.events !== undefined) {
        return report.flatMap((r: any) => r.events.map((e: any) => ({ ...e, user_name: r.user_name, user_id: r.user_id })))
      }
      return report
    }
    if ('events' in report) return report.events.map((e: any) => ({ ...e, user_name: report.user_name, user_id: report.user_id }))
    if ('employees' in report) return report.employees.map((e: any) => ({ ...e, event_name: report.event_name, event_date: report.event_date, event_id: report.event_id }))
    return []
  }, [report, isEBE, isPC])

  // Quick search filter
  const filteredRows = useMemo(() => {
    if (!quickSearch) return rawRows
    const q = quickSearch.toLowerCase()
    return rawRows.filter(row => Object.values(row).some(v => v && String(v).toLowerCase().includes(q)))
  }, [rawRows, quickSearch])

  // Sort
  const sortedRows = useMemo(() => {
    if (!sortCol || !sortDir) return filteredRows
    return [...filteredRows].sort((a, b) => {
      const va = a[sortCol] ?? '', vb = b[sortCol] ?? ''
      const na = parseFloat(va), nb = parseFloat(vb)
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filteredRows, sortCol, sortDir])

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE)
  const pagedRows  = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Column definitions
  type ColDef = { label: string; key: string; right?: boolean; bold?: boolean; green?: boolean; dim?: boolean; clickable?: 'event' | 'employee' }
  const cols: ColDef[] = isEBE ? [
    { label: 'Fecha', key: 'event_date' },
    { label: 'Inicio', key: 'event_start_time' },
    { label: 'Fin', key: 'event_end_time' },
    { label: 'Evento', key: 'event_name', bold: true, clickable: 'event' },
    { label: 'Empleado', key: 'employee_name', clickable: 'employee' },
    { label: 'Teléfono', key: 'phone', dim: true },
    { label: 'Rol', key: 'job_role' },
    { label: 'Horas', key: 'hours_worked', right: true },
    { label: 'Tarifa/h', key: 'hourly_rate', right: true },
    { label: 'Total', key: 'total_pay', right: true, bold: true, green: true },
  ] : isPC ? [
    { label: 'Empleado', key: 'employee_name', bold: true, clickable: 'employee' },
    { label: 'Teléfono', key: 'phone', dim: true },
    { label: 'Total Horas', key: 'total_hours', right: true },
    { label: 'Total a Pagar', key: 'total_pay', right: true, bold: true, green: true },
  ] : tab === 'event' ? [
    { label: 'Evento', key: 'event_name', bold: true, clickable: 'event' },
    { label: 'Fecha', key: 'event_date' },
    { label: 'Empleado', key: 'user_name', clickable: 'employee' },
    { label: 'Rol', key: 'job_role' },
    { label: 'Entrada', key: 'clock_in' },
    { label: 'Salida', key: 'clock_out' },
    { label: 'Horas', key: 'hours_worked', right: true },
    { label: 'Tarifa/h', key: 'hourly_rate', right: true },
    { label: 'Regular', key: 'regular_pay', right: true },
    { label: 'Overtime', key: 'overtime_pay', right: true },
    { label: 'Total', key: 'total_pay', right: true, bold: true, green: true },
  ] : [
    { label: 'Evento', key: 'event_name', bold: true, clickable: 'event' },
    { label: 'Fecha', key: 'event_date' },
    { label: 'Empleado', key: 'user_name', clickable: 'employee' },
    { label: 'Rol', key: 'job_role' },
    { label: 'Horas', key: 'hours_worked', right: true },
    { label: 'Tarifa/h', key: 'hourly_rate', right: true },
    { label: 'Regular', key: 'regular_pay', right: true },
    { label: 'Overtime', key: 'overtime_pay', right: true },
    { label: 'Total', key: 'total_pay', right: true, bold: true, green: true },
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
    if (['total_pay','total_hours','hours_worked','hourly_rate','regular_pay','overtime_pay'].includes(col.key)) {
      const n = parseFloat(v)
      if (isNaN(n)) return v
      if (col.key === 'hours_worked' || col.key === 'total_hours') return n.toFixed(2)
      return `$${n.toFixed(2)}`
    }
    if (col.key === 'clock_in' || col.key === 'clock_out') {
      try { return new Date(v).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) } catch { return v }
    }
    return v
  }

  const handleCellClick = (col: ColDef, row: any) => {
    if (col.clickable === 'event') {
      const id = row.event_id || row.id
      if (id) openEventDetail(id)
    } else if (col.clickable === 'employee') {
      const id = row.user_id || row.id
      if (id) {
        openEmployeeDetail(id)
      } else {
        // EBE y PC no tienen user_id — buscar por nombre
        const name = row.employee_name || row.user_name
        if (name) openEmployeeDetailByName(name)
      }
    }
  }

  const totalHours = rawRows.reduce((s, r) => s + parseFloat(isEBE ? (r.hours_worked || 0) : (r.total_hours || r.hours_worked || 0)), 0)
  const totalPay   = rawRows.reduce((s, r) => s + parseFloat(r.total_pay || 0), 0)

  const TABS = [
    ...(isAdminOrCoord ? [
      { key: 'event',                 label: t('reports.byEvent'),              icon: <Calendar size={13} /> },
      { key: 'employee',              label: t('reports.byEmployee'),           icon: <User size={13} /> },
      { key: 'employees_by_event',    label: t('reports.eventsByDates'),        icon: <FileText size={13} /> },
      { key: 'payment_consolidation', label: t('reports.paymentConsolidation'), icon: <DollarSign size={13} /> },
    ] : []),
    ...(isEmployee ? [{ key: 'me', label: t('reports.myReport'), icon: <User size={13} /> }] : []),
  ]

  if (!isAdminOrCoord && !isEmployee) return (
    <div style={{ maxWidth: '600px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', gap: '10px', padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
        <AlertCircle size={18} color="#c2410c" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>Solo administradores y coordinadores pueden ver reportes.</p>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", maxWidth: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BarChart2 size={22} color={GREEN} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('reports.title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>Genera, filtra y exporta reportes de eventos y empleados</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map(tb => {
          const active = tab === tb.key
          return (
            <button key={tb.key} onClick={() => { setTab(tb.key as TabKey); setReport(null); setPage(1); setQuickSearch('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px',
                border: active ? 'none' : '1.5px solid #e5e7eb',
                borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s', whiteSpace: 'nowrap',
                background: active ? '#1e293b' : '#fff',
                color: active ? '#fff' : '#6b7280',
                boxShadow: active ? '0 2px 8px rgba(30,41,59,0.2)' : 'none',
              }}>
              <span style={{ opacity: active ? 1 : 0.6 }}>{tb.icon}</span>
              {tb.label}
              {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>

      {/* Filter panel */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px', borderRadius: '1rem' }}>

        {/* Date presets */}
        {tab !== 'event' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>{t('reports.period')}</label>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '12px', marginBottom: '16px' }}>
          {/* Filtro de eventos (autocomplete multi) */}
          {tab === 'event' && (
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>{t('reports.selectEvents')}</label>
              <MultiSelect
                placeholder={t("reports.eventsPlaceholder")}
                onSearch={searchEvents as any}
                selected={selectedEvents}
                onToggle={item => setSelectedEvents(prev => prev.some(s => s.id === item.id) ? prev.filter(s => s.id !== item.id) : [...prev, item])}
                onClear={() => setSelectedEvents([])}
                clearLabel={t('reports.clearAll')}
                loading={autoLoading}
              />
            </div>
          )}

          {/* Filtro de empleados (autocomplete multi) */}
          {tab === 'employee' && (
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>{t('reports.selectEmployees')}</label>
              <MultiSelect
                placeholder={t("reports.searchEmployees")}
                onSearch={searchEmployees as any}
                selected={selectedEmployees}
                onToggle={item => setSelectedEmployees(prev => prev.some(s => s.id === item.id) ? prev.filter(s => s.id !== item.id) : [...prev, item])}
                onClear={() => setSelectedEmployees([])}
                clearLabel={t('reports.clearAll')}
                loading={autoLoading}
              />
            </div>
          )}

          {/* Fechas */}
          {tab !== 'event' && (preset === 'custom' || tab === 'employee' || tab === 'me') && (
            <>
              <div><label style={labelStyle}>Desde *</label><input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPreset('custom') }} style={fieldStyle} /></div>
              <div><label style={labelStyle}>Hasta *</label><input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPreset('custom') }} style={fieldStyle} /></div>
            </>
          )}
          {tab !== 'event' && preset !== 'custom' && tab !== 'employee' && tab !== 'me' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Desde</label><input type="date" value={fromDate} readOnly style={{ ...fieldStyle, opacity: 0.7, cursor: 'default' }} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Hasta</label><input type="date" value={toDate} readOnly style={{ ...fieldStyle, opacity: 0.7, cursor: 'default' }} /></div>
            </div>
          )}
        </div>

        {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={fetchReport} disabled={loading || !canFetch}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '9px', border: 'none', background: !canFetch ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: !canFetch ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: !canFetch ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: canFetch ? '0 2px 8px rgba(45,184,75,0.2)' : 'none' }}>
            {loading ? (
              <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{t('reports.generating')}</>
            ) : (<><BarChart2 size={14} />{t('reports.generate')}</>)}
          </button>
          {report && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }} />
              <button onClick={() => exportExcel()}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #16a34a', background: '#f0fdf4', color: '#15803d', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                <Download size={13} />{t('reports.exportExcel')}
              </button>
              <button onClick={() => exportPDF()}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                <Download size={13} />{t('reports.exportPDF')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid #e5e7eb`, borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{t('reports.generatingReport')}</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {!loading && report && rawRows.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Table toolbar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                {filteredRows.length} {filteredRows.length !== rawRows.length ? `de ${rawRows.length}` : ''} registros
              </span>
              {totalHours > 0 && <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Horas </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{totalHours.toFixed(2)}h</span>
              </div>}
              {totalPay > 0 && <div>
                <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: GREEN }}>${totalPay.toFixed(2)}</span>
              </div>}
            </div>
            {/* Quick search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={quickSearch} onChange={e => { setQuickSearch(e.target.value); setPage(1) }}
                placeholder={t("reports.filterResults")}
                style={{ height: '34px', paddingLeft: '30px', paddingRight: quickSearch ? '28px' : '10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: "'Poppins',sans-serif", width: '200px' }} />
              {quickSearch && <button onClick={() => { setQuickSearch(''); setPage(1) }} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}><X size={13} /></button>}
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
                      <td key={col.key} onClick={() => col.clickable && handleCellClick(col, row)}
                        style={{ padding: '10px 12px', textAlign: col.right ? 'right' : 'left', fontWeight: col.bold ? 600 : 400, color: col.green ? GREEN : col.dim ? '#9ca3af' : '#374151', whiteSpace: col.key === 'event_name' || col.key === 'user_name' || col.key === 'employee_name' ? 'nowrap' : undefined, cursor: col.clickable ? 'pointer' : 'default', textDecoration: col.clickable ? 'underline' : 'none', textDecorationColor: col.clickable ? '#d1d5db' : undefined }}>
                        {fmtVal(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {sortedRows.length > 1 && (
                <tfoot>
                  <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                    {cols.map((col, i) => (
                      <td key={col.key} style={{ padding: '10px 12px', textAlign: col.right ? 'right' : 'left', fontWeight: 700, fontSize: '12px', color: '#111827' }}>
                        {i === 0 ? `Total (${rawRows.length})` :
                          ['hours_worked','total_hours'].includes(col.key) ? rawRows.reduce((s, r) => s + parseFloat(r[col.key] || 0), 0).toFixed(2) :
                          ['total_pay','regular_pay','overtime_pay'].includes(col.key) ? `$${rawRows.reduce((s, r) => s + parseFloat(r[col.key] || 0), 0).toFixed(2)}` : ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedRows.length)} de {sortedRows.length}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setPage(1)} disabled={page === 1} style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                  const n = start + i
                  return n <= totalPages ? (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width: '30px', height: '30px', borderRadius: '7px', border: page === n ? 'none' : '1.5px solid #e5e7eb', background: page === n ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#fff', color: page === n ? '#fff' : '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ) : null
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: page === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && report && rawRows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', color: '#9ca3af', fontSize: '13px' }}>
          <BarChart2 size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
          {t('reports.noRecords')}
        </div>
      )}

      {/* Detail modal */}
      {detailType && (
        detailLoading ? (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
            <div style={{ position: 'fixed', zIndex: 101, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '1rem', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: `3px solid #e5e7eb`, borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{t('reports.loadingDetail')}</p>
            </div>
          </>
        ) : detailData ? (
          <DetailModal type={detailType} data={detailData} onClose={() => { setDetailType(null); setDetailData(null) }} />
        ) : null
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}