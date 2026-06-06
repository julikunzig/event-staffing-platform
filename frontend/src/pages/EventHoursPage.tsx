import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Clock, Search, Save, Users } from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface EventItem { id: number; name: string; event_date: string; start_time: string; status: string }
interface ShiftItem {
  shift_id: number; assignment_id: number; user_id: number
  user_name: string; job_role_name: string
  clock_in: string | null; clock_out: string | null
  hours_worked: string | null; hourly_rate_snapshot: string; total_pay: string | null
}

const fieldStyle: React.CSSProperties = {
  height: '36px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 10px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}

export default function EventHoursPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [configEnabled, setConfigEnabled] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editClockIns, setEditClockIns] = useState<Record<number, string>>({})
  const [editClockOuts, setEditClockOuts] = useState<Record<number, string>>({})
  const [bulkClockIn, setBulkClockIn] = useState('')
  const [bulkClockOut, setBulkClockOut] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const configRes = await api.get(`/companies/${user?.company_id}/weekly-config`)
        setConfigEnabled(configRes.data?.admin_can_clock_in_all || false)
        const evRes = await api.get<EventItem[]>('/events')
        setEvents(evRes.data.filter(e => e.status === 'started' || e.status === 'finished'))
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [user?.company_id])

  const selectEvent = async (ev: EventItem) => {
    setSelectedEvent(ev); setShiftsLoading(true); setError(''); setSuccess('')
    setEditClockIns({}); setEditClockOuts({}); setBulkClockIn(''); setBulkClockOut('')
    try {
      const res = await api.get<ShiftItem[]>(`/shifts/events/${ev.id}/active`)
      setShifts(res.data)
      const ins: Record<number, string> = {}
      const outs: Record<number, string> = {}
      for (const s of res.data) {
        if (s.clock_in) {
          // Extract time directly from ISO string (naive, no timezone conversion)
          const match = s.clock_in.match(/T(\d{2}):(\d{2})/)
          if (match) ins[s.shift_id] = `${match[1]}:${match[2]}`
        }
        if (s.clock_out) {
          const match = s.clock_out.match(/T(\d{2}):(\d{2})/)
          if (match) outs[s.shift_id] = `${match[1]}:${match[2]}`
        }
      }
      setEditClockIns(ins); setEditClockOuts(outs)
    } catch { setShifts([]) } finally { setShiftsLoading(false) }
  }

  const handleSaveIndividual = async (shiftId: number) => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const clockInStr = editClockIns[shiftId]
      const clockOutStr = editClockOuts[shiftId]
      if (clockInStr) {
        const isoStr = `${selectedEvent!.event_date}T${clockInStr}:00`
        await api.patch(`/shifts/${shiftId}/clock-in`, { clock_in: isoStr })
      }
      if (clockOutStr) {
        const isoStr = `${selectedEvent!.event_date}T${clockOutStr}:00`
        await api.patch(`/shifts/${shiftId}/clock-out`, { clock_out: isoStr })
      }
      setSuccess(`✅ ${t('eventHoursPage.hoursUpdated')}`)
      await selectEvent(selectedEvent!)
    } catch (e: any) { setError(e.response?.data?.detail || t('eventHoursPage.errorSaving')) }
    finally { setSaving(false) }
  }

  const handleSaveAll = async () => {
    if (!bulkClockIn && !bulkClockOut) { setError(t('eventHoursPage.enterAtLeastOneTime')); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      let updated = 0
      for (const shift of shifts) {
        if (bulkClockIn) {
          const isoStr = `${selectedEvent!.event_date}T${bulkClockIn}:00`
          await api.patch(`/shifts/${shift.shift_id}/clock-in`, { clock_in: isoStr })
        }
        if (bulkClockOut) {
          const isoStr = `${selectedEvent!.event_date}T${bulkClockOut}:00`
          await api.patch(`/shifts/${shift.shift_id}/clock-out`, { clock_out: isoStr })
        }
        updated++
      }
      setSuccess(`✅ ${t('eventHoursPage.hoursUpdatedBulk').replace('{count}', String(updated))}`)
      await selectEvent(selectedEvent!)
    } catch (e: any) { setError(e.response?.data?.detail || t('eventHoursPage.errorSaving')) }
    finally { setSaving(false) }
  }

  const filteredShifts = shifts.filter(s => s.user_name.toLowerCase().includes(search.toLowerCase()) || s.job_role_name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>
  if (!configEnabled) return (
    <div style={{ maxWidth: '600px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.eventHours')}</h2>
      <div style={{ padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', color: '#c2410c', fontSize: '13px' }}>
        ⚠ {t('eventHoursPage.featureDisabled')}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '860px', fontFamily: "'Poppins',sans-serif" }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('nav.eventHours')}</h2>

      {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}
      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '12px' }}>✓ {success}</div>}

      {!selectedEvent ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('eventHoursPage.selectEvent')}</p>
          </div>
          <div style={{ padding: '14px 20px' }}>
            {events.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('eventHoursPage.noStartedFinished')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.map(ev => (
                  <button key={ev.id} onClick={() => selectEvent(ev)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", textAlign: 'left', width: '100%' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{ev.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>{ev.event_date} · {ev.start_time}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: ev.status === 'started' ? '#fefce8' : '#f0fdf4', color: ev.status === 'started' ? '#854d0e' : '#15803d' }}>
                      {ev.status === 'started' ? t('eventHoursPage.started') : t('eventHoursPage.finished')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <button onClick={() => setSelectedEvent(null)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: "'Poppins',sans-serif" }}>{t('eventHoursPage.back')}</button>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{selectedEvent.name}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{selectedEvent.event_date} · {selectedEvent.status === 'started' ? t('eventHoursPage.started') : t('eventHoursPage.finished')}</p>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
            <div style={{ padding: '14px 18px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#111827' }}>{t('eventHoursPage.modifyAll')}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: '4px' }}>{t('eventHoursPage.clockInTime')}</label>
                  <input type="time" value={bulkClockIn} onChange={e => setBulkClockIn(e.target.value)} style={{ ...fieldStyle, width: '130px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: '4px' }}>{t('eventHoursPage.clockOutTime')}</label>
                  <input type="time" value={bulkClockOut} onChange={e => setBulkClockOut(e.target.value)} style={{ ...fieldStyle, width: '130px' }} />
                </div>
                <button onClick={handleSaveAll} disabled={saving || (!bulkClockIn && !bulkClockOut)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", opacity: saving ? 0.7 : 1 }}>
                  <Users size={13} />{saving ? t('eventHoursPage.saving') : t('eventHoursPage.applyToAll')}
                </button>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('eventHoursPage.employees')} ({shifts.length})</p>
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} style={{ ...fieldStyle, paddingLeft: '28px', height: '32px' }} />
              </div>
            </div>
            {shiftsLoading ? <p style={{ padding: '20px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('common.loading')}</p> : (
              <div>
                {filteredShifts.map(shift => (
                  <div key={shift.shift_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{shift.user_name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{shift.job_role_name} · ${parseFloat(shift.hourly_rate_snapshot).toFixed(2)}/h</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="time" value={editClockIns[shift.shift_id] || ''} onChange={e => setEditClockIns(prev => ({ ...prev, [shift.shift_id]: e.target.value }))} style={{ ...fieldStyle, width: '110px', height: '32px' }} title={t('eventHoursPage.clockInTime')} />
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>→</span>
                      <input type="time" value={editClockOuts[shift.shift_id] || ''} onChange={e => setEditClockOuts(prev => ({ ...prev, [shift.shift_id]: e.target.value }))} style={{ ...fieldStyle, width: '110px', height: '32px' }} title={t('eventHoursPage.clockOutTime')} />
                      <button onClick={() => handleSaveIndividual(shift.shift_id)} disabled={saving}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: GREEN, color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Save size={11} />
                      </button>
                    </div>
                    {shift.hours_worked && <p style={{ margin: 0, fontSize: '11px', color: '#15803d', fontWeight: 600, width: '100%' }}>{t('common.total')}: {parseFloat(shift.hours_worked).toFixed(2)}h · ${shift.total_pay ? parseFloat(shift.total_pay).toFixed(2) : '—'}</p>}
                  </div>
                ))}
                {filteredShifts.length === 0 && <p style={{ padding: '20px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>{t('eventHoursPage.noShifts')}</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
