import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MapPin, Clock, Shirt, Pencil, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface Event {
  id: number; name: string; event_date: string; start_time: string
  end_time: string | null; address: string; city: string | null
  state: string | null; zip_code: string | null
  dress_code: string | null; status: string
}

interface Assignment { id: number; event_id: number; status: string; job_role_id: number }

function getEventStatusMap(t: any): Record<string, { label: string; color: string; shortLabel: string }> {
  return {
    created:        { label: t('events.status.created'),     shortLabel: t('events.status.created'),     color: 'bg-slate-100 text-slate-700 border-slate-300' },
    published:      { label: t('events.status.published'),   shortLabel: t('events.status.published'),   color: 'bg-blue-100 text-blue-700 border-blue-300' },
    filled_pending: { label: t('events.status.filled') + ' - ' + t('events.assignmentStatus.pending'), shortLabel: t('events.assignmentStatus.pending'), color: 'bg-amber-100 text-amber-700 border-amber-300' },
    filled:         { label: t('events.status.filled'),      shortLabel: t('events.status.filled'),      color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    started:        { label: t('events.status.started'),     shortLabel: t('events.status.started'),     color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    finished:       { label: t('events.status.finished'),    shortLabel: t('events.status.finished'),    color: 'bg-teal-100 text-teal-700 border-teal-300' },
    cancelled:      { label: t('events.status.cancelled'),   shortLabel: t('events.status.cancelled'),   color: 'bg-red-100 text-red-700 border-red-300' },
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

function StatusBadge({ status, map, mobile = false }: { status: string; map: Record<string, { label: string; color: string; shortLabel: string }>; mobile?: boolean }) {
  const s = map[status] || { label: status, shortLabel: status, color: 'bg-gray-100 text-gray-600 border-gray-300' }
  return (
    <span className={`text-[10px] lg:text-xs font-medium px-2 py-1 rounded-full border ${s.color} whitespace-nowrap`}>
      {mobile ? s.shortLabel : s.label}
    </span>
  )
}

export default function EventsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
    const url = filter ? `/events?status=${filter}` : '/events'
    Promise.all([
      api.get<Event[]>(url),
      api.get<Assignment[]>('/assignments/my-assignments').catch(() => ({ data: [] })),
    ]).then(([evRes, asRes]) => {
      // Sort events by date (most recent first), then by time (latest first)
      const sortedEvents = evRes.data.sort((a, b) => {
        const dateA = new Date(a.event_date).getTime()
        const dateB = new Date(b.event_date).getTime()
        
        if (dateA !== dateB) {
          return dateB - dateA // Most recent first
        }
        
        // Same day: sort by time (latest first)
        const timeA = a.start_time || '00:00'
        const timeB = b.start_time || '00:00'
        return timeB.localeCompare(timeA)
      })
      setEvents(sortedEvents)
      setMyAssignments((asRes as any).data)
    }).finally(() => setLoading(false))
  }, [filter])

  const getMyAssignment = (eventId: number) => myAssignments.find(a => a.event_id === eventId)

  const EVENT_STATUS = getEventStatusMap(t)
  const ASSIGN_STATUS = getAssignStatusMap(t)

  const filters = isAdmin(user)
    ? ['', 'created', 'published', 'filled_pending', 'filled', 'started', 'finished', 'cancelled']
    : ['', 'published', 'filled_pending', 'filled', 'started', 'finished']

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{t('nav.events')}</h2>
        {isAdmin(user) && (
          <Link to="/events/new">
            <Button className="gap-2 w-full sm:w-auto h-10 lg:h-11">
              <Plus size={18} /> 
              <span className="lg:inline">{t('events.newEvent')}</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros - scroll horizontal en móvil */}
      <div className="mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(s => (
            <Button 
              key={s} 
              variant={filter === s ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter(s)}
              className="whitespace-nowrap flex-shrink-0 h-8 text-xs lg:text-sm"
            >
              {s === '' ? t('common.all') : (EVENT_STATUS[s]?.shortLabel || s)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 lg:gap-4">
            {events.length === 0 && (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">{t('events.noEvents')}</p>
              </Card>
            )}
            {events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(event => {
              const myAssign = getMyAssignment(event.id)
              return (
                <div key={event.id}>
                  <div
                    className="cursor-pointer active:scale-[0.99] transition-transform"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <Card className="hover:shadow-md transition-shadow border-l-4" 
                      style={{ borderLeftColor: event.status === 'published' ? '#3b82f6' : event.status === 'filled' ? '#10b981' : '#94a3b8' }}>
                      <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-3 lg:pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base lg:text-lg leading-tight">{event.name}</CardTitle>
                          <div className="flex flex-col lg:flex-row gap-1 lg:gap-2 items-end lg:items-center flex-shrink-0">
                            <StatusBadge status={event.status} map={EVENT_STATUS} mobile={true} />
                            {myAssign && <StatusBadge status={myAssign.status} map={ASSIGN_STATUS} mobile={true} />}
                          </div>
                        </div>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1">
                          {new Date(event.event_date + 'T00:00:00').toLocaleDateString('es', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
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
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {events.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9"
              >
                {t('pagination.previous')}
              </Button>
              <span className="text-sm text-slate-600">
                {t('pagination.page')} {currentPage} {t('pagination.of')} {Math.ceil(events.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(events.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(events.length / itemsPerPage)}
                className="h-9"
              >
                {t('pagination.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
