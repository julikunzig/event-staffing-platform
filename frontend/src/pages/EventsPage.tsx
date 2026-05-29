import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'

import { Input } from '@/components/ui/input'
import { Plus, MapPin, Clock, Shirt, Pencil, Calendar, List, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EventFormModal from '@/pages/EventFormModal'
import EventDetailModal from '@/pages/EventDetailModal'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

interface Event {
  id: number; name: string; event_date: string; start_time: string
  end_time: string | null; address: string; city: string | null
  state: string | null; zip_code: string | null
  dress_code: string | null; status: string
}
interface Assignment { id: number; event_id: number; status: string; job_role_id: number }

// ── Status helpers ──────────────────────────────────────────────────────────
function getEventStatusMap(t: any) {
  return {
    created:        { label: t('events.status.created'),   shortLabel: t('events.status.created'),   bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', dot: '#9ca3af' },
    published:      { label: t('events.status.published'), shortLabel: t('events.status.published'), bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
    filled_pending: { label: t('events.status.filledPending') || 'Filled Pending', shortLabel: t('events.status.filledPending') || 'Filled Pending', bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#f59e0b' },
    filled:         { label: t('events.status.filled'),    shortLabel: t('events.status.filled'),    bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: GREEN },
    started:        { label: t('events.status.started'),   shortLabel: t('events.status.started'),   bg: '#fefce8', color: '#854d0e', border: '#fef08a', dot: '#eab308' },
    finished:       { label: t('events.status.finished'),  shortLabel: t('events.status.finished'),  bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', dot: '#0d9488' },
    cancelled:      { label: t('events.status.cancelled'), shortLabel: t('events.status.cancelled'), bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' },
  }
}

function getAssignStatusMap(t: any) {
  return {
    pending:  { label: t('events.assignmentStatus.pending'),  shortLabel: t('events.assignmentStatus.pending'),  bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    invited:  { label: t('events.assignmentStatus.invited'),  shortLabel: t('events.assignmentStatus.invited'),  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    approved: { label: t('events.assignmentStatus.approved'), shortLabel: t('events.assignmentStatus.approved'), bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    rejected: { label: t('events.assignmentStatus.rejected'), shortLabel: t('events.assignmentStatus.rejected'), bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    removed:  { label: t('events.assignmentStatus.removed'),  shortLabel: t('events.assignmentStatus.removed'),  bg: '#f9fafb', color: '#9ca3af', border: '#e5e7eb' },
  }
}

function StatusPill({ status, map }: { status: string; map: Record<string, any> }) {
  const s = map[status] || { shortLabel: status, bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '999px', whiteSpace: 'nowrap', fontFamily: "'Poppins',sans-serif" }}>
      {s.shortLabel}
    </span>
  )
}

function statusAccent(status: string) {
  const map: Record<string, string> = {
    published: '#3b82f6', filled: GREEN, started: '#eab308',
    finished: '#0d9488', cancelled: '#ef4444', filled_pending: '#f59e0b',
  }
  return map[status] || '#d1d5db'
}

// ── Calendar helpers ────────────────────────────────────────────────────────
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAYS_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const getDaysInMonth  = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

// ── Day Detail Panel ────────────────────────────────────────────────────────
function DayPanel({ day, year, month, events, myAssignments, onEventClick, onClose, statusMap, assignMap, lang, isAdminUser }:
  { day: number; year: number; month: number; events: Event[]; myAssignments: Assignment[]
    onEventClick: (id: number) => void; onClose: () => void
    statusMap: Record<string, any>; assignMap: Record<string, any>; lang: string; isAdminUser: boolean }) {
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ES
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN})`, borderRadius: '20px 20px 0 0' }} />
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={17} color={GREEN} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827', fontFamily: "'Poppins',sans-serif" }}>{day} {MONTHS[month]} {year}</span>
            <span style={{ background: '#f0fdf4', color: GREEN, border: `1px solid #bbf7d0`, fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px' }}>
              {events.length} {lang === 'en' ? (events.length === 1 ? 'event' : 'events') : (events.length === 1 ? 'evento' : 'eventos')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#9ca3af' }}>
            <X size={18} />
          </button>
        </div>
        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>{lang === 'en' ? 'No events this day' : 'No hay eventos este día'}</p>
            </div>
          ) : events.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map(ev => {
            const myAssign = myAssignments.find(a => a.event_id === ev.id)
            return (
              <div key={ev.id} onClick={() => onEventClick(ev.id)}
                style={{ cursor: 'pointer', borderRadius: '12px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${statusAccent(ev.status)}`, padding: '12px 14px', transition: 'box-shadow 0.15s, transform 0.1s', background: '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '13.5px', color: '#111827', fontFamily: "'Poppins',sans-serif" }}>{ev.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>ID #{ev.id}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
                    <StatusPill status={ev.status} map={statusMap} />
                    {myAssign && <StatusPill status={myAssign.status} map={assignMap} />}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <Clock size={12} color="#9ca3af" />{ev.start_time}{ev.end_time ? ` — ${ev.end_time}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <MapPin size={12} color="#9ca3af" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.address}{ev.city ? `, ${ev.city}` : ''}</span>
                  </div>
                  {ev.dress_code && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <Shirt size={12} color="#9ca3af" /><span style={{ textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em' }}>{ev.dress_code}</span>
                    </div>
                  )}
                  {isAdminUser && ev.status !== 'cancelled' && (
                    <div style={{ paddingTop: '8px', borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
                      <button onClick={e => { e.stopPropagation(); onEventClick(ev.id) }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GREEN, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Pencil size={12} />{lang === 'en' ? 'Edit event' : 'Editar evento'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', background: '#fafafa', borderRadius: '0 0 0 0' }}>
          <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontFamily: "'Poppins',sans-serif", fontWeight: 500, padding: '4px' }}>
            {lang === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Calendar View ───────────────────────────────────────────────────────────
function CalendarView({ events, myAssignments, onEventClick, statusMap, assignMap, lang, isAdminUser }:
  { events: Event[]; myAssignments: Assignment[]; onEventClick: (id: number) => void
    statusMap: Record<string, any>; assignMap: Record<string, any>; lang: string; isAdminUser: boolean }) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ES
  const DAYS   = lang === 'en' ? DAYS_EN : DAYS_ES

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>()
    events.forEach(ev => {
      const d = new Date(ev.event_date + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(ev)
      }
    })
    return map
  }, [events, year, month])

  const prevMonth = () => { setSelectedDay(null); if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { setSelectedDay(null); if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const goToday   = () => { setSelectedDay(null); setYear(today.getFullYear()); setMonth(today.getMonth()) }

  const cells: (number | null)[] = [...Array(getFirstDayOfMonth(year, month)).fill(null), ...Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1

  return (
    <>
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f6'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: "'Poppins',sans-serif" }}>{MONTHS[month]} {year}</h3>
            <button onClick={goToday}
              style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: '#f0fdf4', color: GREEN, border: `1px solid #bbf7d0`, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              {lang === 'en' ? 'Today' : 'Hoy'}
            </button>
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f6'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f3f4f6' }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            const dayEvents  = day ? (eventsByDay.get(day) || []) : []
            const isToday    = day === todayDay
            const isSelected = day === selectedDay
            return (
              <div key={idx} onClick={() => day && dayEvents.length > 0 && setSelectedDay(day)}
                style={{
                  minHeight: '90px', borderBottom: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6',
                  padding: '6px', cursor: day && dayEvents.length > 0 ? 'pointer' : 'default',
                  background: isSelected ? '#f0fdf4' : !day ? '#fafafa' : '#fff',
                  outline: isSelected ? `2px solid ${GREEN}` : 'none', outlineOffset: '-2px',
                  transition: 'background 0.1s',
                }}>
                {day && (
                  <>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: isToday ? 700 : 500, marginBottom: '4px',
                      background: isToday ? `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})` : 'transparent',
                      color: isToday ? '#fff' : isSelected ? GREEN : '#374151',
                    }}>{day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayEvents.slice(0, 3).map(ev => {
                        const s = statusMap[ev.status]
                        return (
                          <button key={ev.id}
                            onClick={e => { e.stopPropagation(); onEventClick(ev.id) }}
                            style={{ width: '100%', textAlign: 'left', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', background: s?.bg || '#f3f4f6', color: s?.color || '#6b7280', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s?.dot || '#9ca3af', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</span>
                          </button>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <button onClick={e => { e.stopPropagation(); setSelectedDay(day) }}
                          style={{ textAlign: 'left', fontSize: '10px', fontWeight: 600, color: GREEN, background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px' }}>
                          +{dayEvents.length - 3} {lang === 'en' ? 'more' : 'más'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {Object.entries(statusMap).map(([key, val]: [string, any]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: val.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#6b7280' }}>{val.shortLabel}</span>
            </div>
          ))}
          <span style={{ fontSize: '10px', color: '#d1d5db', marginLeft: 'auto', fontStyle: 'italic' }}>
            {lang === 'en' ? 'Click a day to see all events' : 'Toca un día para ver todos los eventos'}
          </span>
        </div>
      </div>

      {selectedDay !== null && (
        <DayPanel day={selectedDay} year={year} month={month} events={eventsByDay.get(selectedDay) || []}
          myAssignments={myAssignments} onEventClick={onEventClick} onClose={() => setSelectedDay(null)}
          statusMap={statusMap} assignMap={assignMap} lang={lang} isAdminUser={isAdminUser} />
      )}
    </>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { user }    = useAuth()
  const { t, i18n } = useTranslation()
  const navigate    = useNavigate()
  const lang        = i18n.language || 'es'

  const [events, setEvents]             = useState<Event[]>([])
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchText, setSearchText]     = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [viewMode, setViewMode]         = useState<'list' | 'calendar'>('list')
  const [currentPage, setCurrentPage]   = useState(1)
  const [hoveredCard, setHoveredCard]   = useState<number | null>(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [editEventId, setEditEventId]   = useState<number | null>(null)
  const [detailEventId, setDetailEventId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage]   = useState(12)

  const EVENT_STATUS  = getEventStatusMap(t)
  const ASSIGN_STATUS = getAssignStatusMap(t)

  const fetchEvents = async (status: string, search: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      const url = `/events${params.toString() ? '?' + params.toString() : ''}`
      const [evRes, asRes] = await Promise.all([
        api.get<Event[]>(url),
        api.get<Assignment[]>('/assignments/my-assignments').catch(() => ({ data: [] })),
      ])
      setEvents(evRes.data)
      setMyAssignments((asRes as any).data)
      setCurrentPage(1)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents(statusFilter, searchText) }, [statusFilter, searchText])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchText(searchInput.trim()) }
  const clearSearch  = () => { setSearchInput(''); setSearchText('') }

  const statusFilters = isAdmin(user)
    ? ['', 'created', 'published', 'filled_pending', 'filled', 'started', 'finished', 'cancelled']
    : ['', 'published', 'filled_pending', 'filled', 'started', 'finished']

  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(events.length / itemsPerPage)

  // ── Status summary counts ──
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach(ev => { counts[ev.status] = (counts[ev.status] || 0) + 1 })
    return counts
  }, [events])

  // ── Pagination control component ──
  const PaginationBar = () => totalPages > 1 ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: "'Poppins',sans-serif" }}>
        {lang === 'en'
          ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, events.length)} of ${events.length} events`
          : `Mostrando ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, events.length)} de ${events.length} eventos`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
          «
        </button>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
          <ChevronLeft size={14} />{t('pagination.previous')}
        </button>
        {/* Page numbers */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, idx) => p === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '6px 4px', fontSize: '12px', color: '#9ca3af' }}>…</span>
            ) : (
              <button key={p} onClick={() => setCurrentPage(p as number)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: currentPage === p ? `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})` : '#f9fafb', color: currentPage === p ? '#fff' : '#374151', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {p}
              </button>
            ))}
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
          {t('pagination.next')}<ChevronRight size={14} />
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: '12px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
          »
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: "'Poppins',sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.events')}</h2>
          {!loading && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{events.length} {lang === 'en' ? 'events found' : 'eventos encontrados'}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            {[
              { mode: 'list' as const, icon: <List size={15} />, label: lang === 'en' ? 'List' : 'Lista' },
              { mode: 'calendar' as const, icon: <Calendar size={15} />, label: lang === 'en' ? 'Calendar' : 'Calendario' },
            ].map(({ mode, icon, label }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                  border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s',
                  background: viewMode === mode ? `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})` : '#fff',
                  color: viewMode === mode ? '#fff' : '#6b7280',
                }}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </div>
          {isAdmin(user) && (
            
              <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.25)' }}>
                <Plus size={16} /><span>{t('events.newEvent')}</span>
              </button>
            
          )}
        </div>
      </div>

      {/* ── Search ── */}
      {/* ── Status summary (solo en vista lista y sin filtro activo) ── */}
      {!loading && viewMode === 'list' && !statusFilter && events.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '14px' }}>
          {Object.entries(EVENT_STATUS).map(([key, val]: [string, any]) => {
            const count = statusCounts[key] || 0
            if (!count) return null
            return (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 14px', borderRadius: '10px', border: `1.5px solid ${val.border}`, background: val.bg, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', minWidth: '72px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: val.color, fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>{count}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: val.color, whiteSpace: 'nowrap' }}>{val.shortLabel}</span>
              </button>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSearch} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder={lang === 'en' ? 'Search by name or ID...' : 'Buscar por nombre o ID...'}
              style={{ paddingLeft: '36px', paddingRight: searchInput ? '32px' : '12px', height: '40px' }} />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit"
            style={{ padding: '8px 18px', borderRadius: '10px', border: `1.5px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dcfce7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf4' }}>
            {lang === 'en' ? 'Search' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* ── Status filters ── */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {statusFilters.map(s => {
          const active = statusFilter === s
          const st = EVENT_STATUS[s as keyof typeof EVENT_STATUS] as any
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
                borderRadius: '999px', border: active ? 'none' : '1px solid #e5e7eb',
                background: active ? `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})` : '#fff',
                color: active ? '#fff' : '#6b7280', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Poppins',sans-serif",
                boxShadow: active ? '0 2px 8px rgba(45,184,75,0.25)' : 'none', transition: 'all 0.15s',
              }}>
              {s && st && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : st.dot, flexShrink: 0 }} />}
              {s === '' ? t('common.all') : (st?.shortLabel || s)}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `3px solid #e5e7eb`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView events={events} myAssignments={myAssignments} onEventClick={id => setDetailEventId(id)}
          statusMap={EVENT_STATUS} assignMap={ASSIGN_STATUS} lang={lang} isAdminUser={isAdmin(user)} />
      ) : (
        <>
          {/* ── Top bar: total + items per page + pagination ── */}
          {events.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                  {events.length} {lang === 'en' ? (events.length === 1 ? 'event' : 'events') : (events.length === 1 ? 'evento' : 'eventos')}
                  {statusFilter && EVENT_STATUS[statusFilter as keyof typeof EVENT_STATUS] && (
                    <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 600, color: (EVENT_STATUS[statusFilter as keyof typeof EVENT_STATUS] as any).color }}>
                      · {(EVENT_STATUS[statusFilter as keyof typeof EVENT_STATUS] as any).label}
                    </span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Items per page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{lang === 'en' ? 'Per page:' : 'Por página:'}</span>
                  <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                    style={{ fontSize: '12px', fontWeight: 600, color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '4px 8px', background: '#fff', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", outline: 'none' }}>
                    {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {totalPages > 1 && <PaginationBar />}
              </div>
            </div>
          )}

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>{t('events.noEvents')}</p>
              {searchText && (
                <button onClick={clearSearch} style={{ marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', color: GREEN, fontSize: '13px', fontWeight: 600 }}>
                  {lang === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {paginatedEvents.map(event => {
                const myAssign = myAssignments.find(a => a.event_id === event.id)
                const hovered  = hoveredCard === event.id
                const accent   = statusAccent(event.status)
                return (
                  <div key={event.id} onClick={() => setDetailEventId(event.id)}
                    onMouseEnter={() => setHoveredCard(event.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
                      borderLeft: `4px solid ${accent}`, cursor: 'pointer',
                      transition: 'all 0.15s', padding: '14px 18px',
                      boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                      transform: hovered ? 'translateY(-1px)' : 'none',
                    }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{event.name}</p>

                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(event.event_date + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-US' : 'es', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, alignItems: 'flex-end' }}>
                        <StatusPill status={event.status} map={EVENT_STATUS} />
                        {myAssign && <StatusPill status={myAssign.status} map={ASSIGN_STATUS} />}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
                        <MapPin size={13} color="#9ca3af" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                          {event.address}{event.city ? `, ${event.city}` : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
                        <Clock size={13} color="#9ca3af" />
                        {event.start_time}{event.end_time ? ` — ${event.end_time}` : ''}
                      </div>
                      {event.dress_code && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
                          <Shirt size={13} color="#9ca3af" />
                          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{event.dress_code}</span>
                        </div>
                      )}
                    </div>

                    {/* Edit button */}
                    {isAdmin(user) && event.status !== 'cancelled' && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                        <button onClick={e => { e.stopPropagation(); setEditEventId(event.id) }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: GREEN, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Pencil size={13} />{t('common.edit')}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Bottom pagination ── */}
          {totalPages > 1 && (
            <div style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid #f3f4f6' }}>
              <PaginationBar />
            </div>
          )}
        </>
      )}
    </div>

      {showCreate && (
        <EventFormModal mode="create" onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchEvents(statusFilter, searchText) }} />
      )}
      {editEventId !== null && (
        <EventFormModal mode="edit" eventId={editEventId} onClose={() => setEditEventId(null)}
          onSuccess={() => { setEditEventId(null); fetchEvents(statusFilter, searchText) }} />
      )}
      {detailEventId !== null && (
        <EventDetailModal eventId={detailEventId} onClose={() => setDetailEventId(null)}
          onEdit={id => { setDetailEventId(null); setEditEventId(id) }}
          onStatusChange={() => fetchEvents(statusFilter, searchText)} />
      )}
    </>
  )
}