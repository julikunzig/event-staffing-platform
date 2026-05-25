import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, MapPin, Clock, Shirt, Pencil, Calendar, List, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface Event {
  id: number; name: string; event_date: string; start_time: string
  end_time: string | null; address: string; city: string | null
  state: string | null; zip_code: string | null
  dress_code: string | null; status: string
}

interface Assignment { id: number; event_id: number; status: string; job_role_id: number }

// ── Status helpers ──────────────────────────────────────────────────────────
function getEventStatusMap(t: any): Record<string, { label: string; color: string; shortLabel: string; dot: string }> {
  return {
    created:        { label: t('events.status.created'),   shortLabel: t('events.status.created'),   color: 'bg-slate-100 text-slate-700 border-slate-300',   dot: 'bg-slate-400' },
    published:      { label: t('events.status.published'), shortLabel: t('events.status.published'), color: 'bg-blue-100 text-blue-700 border-blue-300',       dot: 'bg-blue-500' },
    filled_pending: { label: t('events.status.filled') + ' - ' + t('events.assignmentStatus.pending'), shortLabel: t('events.assignmentStatus.pending'), color: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
    filled:         { label: t('events.status.filled'),    shortLabel: t('events.status.filled'),    color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
    started:        { label: t('events.status.started'),   shortLabel: t('events.status.started'),   color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
    finished:       { label: t('events.status.finished'),  shortLabel: t('events.status.finished'),  color: 'bg-teal-100 text-teal-700 border-teal-300',       dot: 'bg-teal-600' },
    cancelled:      { label: t('events.status.cancelled'), shortLabel: t('events.status.cancelled'), color: 'bg-red-100 text-red-700 border-red-300',           dot: 'bg-red-500' },
  }
}

function getAssignStatusMap(t: any): Record<string, { label: string; color: string; shortLabel: string }> {
  return {
    pending:  { label: t('events.assignmentStatus.pending'),  shortLabel: t('events.assignmentStatus.pending'),  color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    invited:  { label: t('events.assignmentStatus.invited'),  shortLabel: t('events.assignmentStatus.invited'),  color: 'bg-orange-100 text-orange-700 border-orange-300' },
    approved: { label: t('events.assignmentStatus.approved'), shortLabel: t('events.assignmentStatus.approved'), color: 'bg-green-100 text-green-700 border-green-300' },
    rejected: { label: t('events.assignmentStatus.rejected'), shortLabel: t('events.assignmentStatus.rejected'), color: 'bg-red-100 text-red-700 border-red-300' },
    removed:  { label: t('events.assignmentStatus.removed'),  shortLabel: t('events.assignmentStatus.removed'),  color: 'bg-gray-100 text-gray-500 border-gray-300' },
  }
}

function StatusBadge({ status, map, mobile = false }: { status: string; map: Record<string, any>; mobile?: boolean }) {
  const s = map[status] || { label: status, shortLabel: status, color: 'bg-gray-100 text-gray-600 border-gray-300' }
  return (
    <span className={`text-[10px] lg:text-xs font-medium px-2 py-1 rounded-full border ${s.color} whitespace-nowrap`}>
      {mobile ? s.shortLabel : s.label}
    </span>
  )
}

// ── Calendar helpers ────────────────────────────────────────────────────────
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

// ── Day Detail Panel ────────────────────────────────────────────────────────
function DayPanel({
  day, year, month, events, myAssignments, onEventClick, onClose, statusMap, assignMap, lang, isAdminUser
}: {
  day: number; year: number; month: number
  events: Event[]; myAssignments: Assignment[]
  onEventClick: (id: number) => void
  onClose: () => void
  statusMap: Record<string, any>; assignMap: Record<string, any>
  lang: string; isAdminUser: boolean
}) {
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ES
  const dateLabel = `${day} ${MONTHS[month]} ${year}`

  const statusBorderColor = (status: string) => {
    const map: Record<string, string> = {
      published: '#3b82f6', filled: '#10b981', started: '#eab308',
      finished: '#0d9488', cancelled: '#ef4444', filled_pending: '#f59e0b',
    }
    return map[status] || '#94a3b8'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-teal-600" />
            <h3 className="font-semibold text-slate-800 text-base">{dateLabel}</h3>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              {events.length} {lang === 'en' ? (events.length === 1 ? 'event' : 'events') : (events.length === 1 ? 'evento' : 'eventos')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Events list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{lang === 'en' ? 'No events this day' : 'No hay eventos este día'}</p>
            </div>
          ) : (
            events
              .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
              .map(ev => {
                const st = statusMap[ev.status]
                const myAssign = myAssignments.find(a => a.event_id === ev.id)
                const assignSt = myAssign ? assignMap[myAssign.status] : null
                return (
                  <div
                    key={ev.id}
                    onClick={() => onEventClick(ev.id)}
                    className="cursor-pointer rounded-xl border border-slate-200 hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
                    style={{ borderLeftWidth: 4, borderLeftColor: statusBorderColor(ev.status) }}
                  >
                    <div className="p-3">
                      {/* Name + badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{ev.name}</p>
                          <p className="text-[11px] text-slate-400">ID #{ev.id}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {st?.shortLabel || ev.status}
                          </span>
                          {assignSt && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${assignSt.color}`}>
                              {assignSt.shortLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                        <Clock size={12} className="flex-shrink-0 text-slate-400" />
                        <span>{ev.start_time}{ev.end_time ? ` — ${ev.end_time}` : ''}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-1">
                        <MapPin size={12} className="flex-shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-1">
                          {ev.address}{ev.city ? `, ${ev.city}` : ''}{ev.state ? `, ${ev.state}` : ''}
                        </span>
                      </div>

                      {/* Dress code */}
                      {ev.dress_code && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Shirt size={12} className="flex-shrink-0 text-slate-400" />
                          <span className="uppercase tracking-wide font-medium">{ev.dress_code}</span>
                        </div>
                      )}

                      {/* Edit link for admin */}
                      {isAdminUser && ev.status !== 'cancelled' && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <Link
                            to={`/events/${ev.id}/edit`}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium"
                          >
                            <Pencil size={12} />
                            {lang === 'en' ? 'Edit event' : 'Editar evento'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full text-sm text-slate-600 hover:text-slate-800 font-medium py-1"
          >
            {lang === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Calendar View ───────────────────────────────────────────────────────────
function CalendarView({
  events, myAssignments, onEventClick, statusMap, assignMap, lang, isAdminUser
}: {
  events: Event[]
  myAssignments: Assignment[]
  onEventClick: (id: number) => void
  statusMap: Record<string, any>
  assignMap: Record<string, any>
  lang: string
  isAdminUser: boolean
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ES
  const DAYS = lang === 'en' ? DAYS_EN : DAYS_ES

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Group events by day
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

  const prevMonth = () => {
    setSelectedDay(null)
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDay(null)
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const goToday = () => {
    setSelectedDay(null)
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800">
              {MONTHS[month]} {year}
            </h3>
            <button
              onClick={goToday}
              className="text-xs px-2 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              {lang === 'en' ? 'Today' : 'Hoy'}
            </button>
          </div>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayEvents = day ? (eventsByDay.get(day) || []) : []
            const isToday = day === todayDay
            const isSelected = day === selectedDay
            const hasEvents = dayEvents.length > 0
            return (
              <div
                key={idx}
                onClick={() => day && handleDayClick(day)}
                className={`min-h-[80px] lg:min-h-[100px] border-b border-r border-slate-100 p-1 lg:p-1.5
                  ${!day ? 'bg-slate-50/50' : hasEvents ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100' : 'cursor-default'}
                  ${isSelected ? 'bg-teal-50 ring-2 ring-inset ring-teal-400' : ''}
                  transition-colors
                `}
              >
                {day && (
                  <>
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1
                      ${isToday ? 'bg-teal-600 text-white' : isSelected ? 'bg-teal-100 text-teal-700' : 'text-slate-600'}
                    `}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => {
                        const st = statusMap[ev.status]
                        const myAssign = myAssignments.find(a => a.event_id === ev.id)
                        return (
                          <button
                            key={ev.id}
                            onClick={e => { e.stopPropagation(); onEventClick(ev.id) }}
                            className={`w-full text-left px-1 py-0.5 rounded text-[10px] lg:text-xs font-medium truncate
                              hover:opacity-80 transition-opacity flex items-center gap-1
                              ${st?.color || 'bg-slate-100 text-slate-700'}
                            `}
                            title={`${ev.name} — ${ev.start_time}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st?.dot || 'bg-slate-400'}`} />
                            <span className="truncate">{ev.name}</span>
                            {myAssign && <span className="flex-shrink-0 text-[9px] opacity-70">●</span>}
                          </button>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDayClick(day) }}
                          className="text-[10px] text-teal-600 hover:text-teal-800 pl-1 font-medium"
                        >
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
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3">
          {Object.entries(statusMap).map(([key, val]: [string, any]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              <span className="text-[10px] text-slate-600">{val.shortLabel}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-slate-400 italic">
              {lang === 'en' ? 'Click a day to see all events' : 'Toca un día para ver todos los eventos'}
            </span>
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay !== null && (
        <DayPanel
          day={selectedDay}
          year={year}
          month={month}
          events={eventsByDay.get(selectedDay) || []}
          myAssignments={myAssignments}
          onEventClick={onEventClick}
          onClose={() => setSelectedDay(null)}
          statusMap={statusMap}
          assignMap={assignMap}
          lang={lang}
          isAdminUser={isAdminUser}
        />
      )}
    </>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language || 'es'

  const [events, setEvents] = useState<Event[]>([])
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const EVENT_STATUS = getEventStatusMap(t)
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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(statusFilter, searchText)
  }, [statusFilter, searchText])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchText('')
  }

  const getMyAssignment = (eventId: number) => myAssignments.find(a => a.event_id === eventId)

  const statusFilters = isAdmin(user)
    ? ['', 'created', 'published', 'filled_pending', 'filled', 'started', 'finished', 'cancelled']
    : ['', 'published', 'filled_pending', 'filled', 'started', 'finished']

  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(events.length / itemsPerPage)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-5">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{t('nav.events')}</h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors
                ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <List size={15} />
              <span className="hidden sm:inline">{lang === 'en' ? 'List' : 'Lista'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors border-l border-slate-200
                ${viewMode === 'calendar' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <Calendar size={15} />
              <span className="hidden sm:inline">{lang === 'en' ? 'Calendar' : 'Calendario'}</span>
            </button>
          </div>
          {isAdmin(user) && (
            <Link to="/events/new">
              <Button className="gap-2 h-9 lg:h-10">
                <Plus size={16} />
                <span className="hidden sm:inline">{t('events.newEvent')}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={lang === 'en' ? 'Search by name or ID...' : 'Buscar por nombre o ID...'}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9 px-4">
            {lang === 'en' ? 'Search' : 'Buscar'}
          </Button>
        </div>
      </form>

      {/* Status filters */}
      <div className="mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusFilters.map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="whitespace-nowrap flex-shrink-0 h-8 text-xs lg:text-sm"
            >
              {s === '' ? t('common.all') : (EVENT_STATUS[s]?.shortLabel || s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (searchText || statusFilter) && (
        <p className="text-xs text-slate-500 mb-3">
          {events.length} {lang === 'en' ? 'event(s) found' : 'evento(s) encontrado(s)'}
          {searchText && <span className="ml-1">para "<strong>{searchText}</strong>"</span>}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          myAssignments={myAssignments}
          onEventClick={id => navigate(`/events/${id}`)}
          statusMap={EVENT_STATUS}
          assignMap={ASSIGN_STATUS}
          lang={lang}
          isAdminUser={isAdmin(user)}
        />
      ) : (
        <>
          <div className="grid gap-3 lg:gap-4">
            {events.length === 0 && (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">{t('events.noEvents')}</p>
                {searchText && (
                  <button onClick={clearSearch} className="mt-2 text-sm text-teal-600 hover:underline">
                    {lang === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
                  </button>
                )}
              </Card>
            )}
            {paginatedEvents.map(event => {
              const myAssign = getMyAssignment(event.id)
              const borderColor = EVENT_STATUS[event.status]?.dot?.replace('bg-', '') || 'slate-300'
              return (
                <div
                  key={event.id}
                  className="cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Card className="hover:shadow-md transition-shadow border-l-4"
                    style={{
                      borderLeftColor:
                        event.status === 'published' ? '#3b82f6' :
                        event.status === 'filled' ? '#10b981' :
                        event.status === 'started' ? '#eab308' :
                        event.status === 'finished' ? '#0d9488' :
                        event.status === 'cancelled' ? '#ef4444' :
                        event.status === 'filled_pending' ? '#f59e0b' :
                        '#94a3b8'
                    }}>
                    <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-3 lg:pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base lg:text-lg leading-tight">{event.name}</CardTitle>
                          <p className="text-[11px] text-slate-400 mt-0.5">ID #{event.id}</p>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-1 lg:gap-2 items-end lg:items-center flex-shrink-0">
                          <StatusBadge status={event.status} map={EVENT_STATUS} mobile={true} />
                          {myAssign && <StatusBadge status={myAssign.status} map={ASSIGN_STATUS} mobile={true} />}
                        </div>
                      </div>
                      <p className="text-xs lg:text-sm text-slate-500 mt-1">
                        {new Date(event.event_date + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en' : 'es', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-1.5 px-4 lg:px-6 pb-3 lg:pb-4">
                      <div className="w-full flex items-start gap-2 text-xs lg:text-sm text-slate-600">
                        <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {event.address}{event.city ? `, ${event.city}` : ''}{event.state ? `, ${event.state}` : ''}{event.zip_code ? ` ${event.zip_code}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-600">
                        <Clock size={14} className="flex-shrink-0" />
                        <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                      </div>
                      {event.dress_code && (
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-600">
                          <Shirt size={14} className="flex-shrink-0" />
                          <span className="uppercase tracking-wide font-medium">{event.dress_code}</span>
                        </div>
                      )}
                      {isAdmin(user) && event.status !== 'cancelled' && (
                        <div className="pt-2 border-t mt-2">
                          <Link
                            to={`/events/${event.id}/edit`}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs lg:text-sm text-teal-600 hover:text-teal-800 font-medium active:underline lg:hover:underline"
                          >
                            <Pencil size={14} /> {t('common.edit')}
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9">
                {t('pagination.previous')}
              </Button>
              <span className="text-sm text-slate-600">
                {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
              </span>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9">
                {t('pagination.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
