import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { PlayCircle, Check, X, Send, Info, RefreshCw, AlertCircle, StopCircle } from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface ActionEvent {
  id: number; name: string; event_code: string | null; event_date: string
  start_time: string; end_time: string | null; address: string
  city: string | null; state: string | null; dress_code: string | null
  status: string; assignment_id: number | null; job_role_id: number | null
  job_role_name: string | null; assignment_status: string | null
  shift_start_time: string | null
}

interface EmployeeActions {
  ready_to_clock_out: ActionEvent[]
  ready_to_clock_in: ActionEvent[]
  invitations: ActionEvent[]
  available_to_apply: ActionEvent[]
}

export default function EmployeeDashboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<EmployeeActions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [detailModal, setDetailModal] = useState<ActionEvent | null>(null)
  const [shiftStartMinutes, setShiftStartMinutes] = useState(15)

  const loadData = useCallback(async () => {
    try {
      setError('')
      const [actionsRes, configRes] = await Promise.all([
        api.get<EmployeeActions>('/dashboard/employee-actions'),
        api.get<any>('/companies/current/weekly-config').catch(() => ({ data: { shift_start_minutes: 15 } })),
      ])
      setData(actionsRes.data)
      setShiftStartMinutes(Number(configRes.data?.shift_start_minutes || 15))
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Error')
    } finally { setLoading(false) }
  }, [t])

  useEffect(() => { loadData() }, [loadData])

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise(resolve => {
      if (!navigator.geolocation) { resolve({ lat: 0, lng: 0 }); return }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }), { enableHighAccuracy: false, timeout: 8000 })
    })

  const doAction = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key); setActionError(''); setActionSuccess('')
    try { await fn(); setActionSuccess('✓'); await loadData() }
    catch (e: any) { setActionError(e.response?.data?.detail || e.message || 'Error') }
    finally { setActionLoading(null) }
  }

  const handleClockIn = (id: number) => doAction(`ci-${id}`, async () => {
    const { lat, lng } = await getLocation()
    await api.post(`/shifts/${id}/clock-in`, { latitude: lat, longitude: lng })
  })
  const handleClockOut = (id: number) => doAction(`co-${id}`, async () => {
    const { lat, lng } = await getLocation()
    await api.post(`/shifts/${id}/clock-out`, { latitude: lat, longitude: lng })
  })
  const handleAccept = (id: number) => doAction(`ac-${id}`, () => api.patch(`/assignments/${id}/accept`))
  const handleReject = (id: number) => doAction(`rj-${id}`, () => api.patch(`/assignments/${id}/reject`))
  const handleApply = (eventId: number, roleId: number) => doAction(`ap-${eventId}`, () => api.post(`/assignments/events/${eventId}/apply`, { job_role_id: roleId }))

  const isClockInAllowed = (ev: ActionEvent) => {
    const timeToUse = ev.shift_start_time || ev.start_time
    return (new Date(`${ev.event_date}T${timeToUse}`).getTime() - Date.now()) / 60000 <= shiftStartMinutes
  }

  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
  const fmtTime = (t: string) => t?.slice(0, 5) || ''

  if (loading) return <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontFamily: "'Poppins',sans-serif" }}><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
  if (error) return <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} />{error}<button onClick={() => { setLoading(true); loadData() }} style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '6px', border: 'none', background: GREEN, color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>↻</button></div>

  const totalActions = (data?.ready_to_clock_out.length || 0) + (data?.ready_to_clock_in.length || 0) + (data?.invitations.length || 0) + (data?.available_to_apply.length || 0)

  const statusPill = (type: 'clock_out' | 'clock_in' | 'invited' | 'available') => {
    const map = {
      clock_out: { bg: '#fef2f2', color: '#dc2626', label: t('employeeDashboard.readyToClockOut') || 'En turno' },
      clock_in: { bg: '#f0fdf4', color: '#15803d', label: t('employeeDashboard.readyToClockIn') || 'Listo' },
      invited: { bg: '#fff7ed', color: '#c2410c', label: t('employeeDashboard.invitations') || 'Invitado' },
      available: { bg: '#eff6ff', color: '#1d4ed8', label: t('employeeDashboard.available') || 'Disponible' },
    }
    const s = map[type]
    return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
  }

  const renderRow = (ev: ActionEvent, type: 'clock_out' | 'clock_in' | 'invited' | 'available') => {
    const key = `${type}-${ev.assignment_id || ev.id}`
    const isLoading = actionLoading?.startsWith(key.slice(0, 5)) && actionLoading?.includes(String(ev.assignment_id || ev.id))
    return (
      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
        {/* Code */}
        <span style={{ width: '60px', fontSize: '11px', color: GREEN, fontWeight: 700, flexShrink: 0 }}>{ev.event_code || `#${ev.id}`}</span>
        {/* Name */}
        <span style={{ flex: 1, minWidth: 0, maxWidth: '160px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>{ev.name}</span>
        {/* Date */}
        <span style={{ width: '70px', color: '#6b7280', flexShrink: 0 }}>{fmtDate(ev.event_date)}</span>
        {/* Time */}
        <span style={{ width: '45px', color: '#6b7280', flexShrink: 0 }}>{fmtTime(ev.shift_start_time || ev.start_time)}</span>
        {/* Status */}
        <span style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>{statusPill(type)}</span>
        {/* Role */}
        <span style={{ width: '80px', fontSize: '11px', color: '#374151', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.job_role_name || '—'}</span>
        {/* Actions */}
        <div style={{ width: '130px', display: 'flex', gap: '4px', flexShrink: 0 }}>
          {type === 'clock_out' && (
            <button onClick={() => ev.assignment_id && handleClockOut(ev.assignment_id)} disabled={!!isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <StopCircle size={11} />{isLoading ? '...' : (t('employeeDashboard.btnFinish') || 'Finalizar')}
            </button>
          )}
          {type === 'clock_in' && (
            <button onClick={() => ev.assignment_id && handleClockIn(ev.assignment_id)} disabled={!!isLoading || !isClockInAllowed(ev)}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '6px', border: 'none', background: isClockInAllowed(ev) ? GREEN : '#e5e7eb', color: isClockInAllowed(ev) ? '#fff' : '#9ca3af', fontSize: '10px', fontWeight: 700, cursor: isClockInAllowed(ev) ? 'pointer' : 'not-allowed', fontFamily: "'Poppins',sans-serif" }}>
              <PlayCircle size={11} />{isLoading ? '...' : (t('employeeDashboard.btnStart') || 'Iniciar')}
            </button>
          )}
          {type === 'invited' && (<>
            <button onClick={() => ev.assignment_id && handleAccept(ev.assignment_id)} disabled={!!isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 7px', borderRadius: '6px', border: 'none', background: GREEN, color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <Check size={10} />{t('employeeDashboard.btnYes') || 'Sí'}
            </button>
            <button onClick={() => ev.assignment_id && handleReject(ev.assignment_id)} disabled={!!isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 7px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <X size={10} />{t('employeeDashboard.btnNo') || 'No'}
            </button>
          </>)}
          {type === 'available' && (
            <button onClick={() => ev.job_role_id && handleApply(ev.id, ev.job_role_id)} disabled={!!isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <Send size={10} />{isLoading ? '...' : (t('employeeDashboard.btnApply') || 'Aplicar')}
            </button>
          )}
          <button onClick={() => setDetailModal(ev)} style={{ padding: '4px', borderRadius: '5px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            <Info size={12} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", marginTop: '20px', maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
          📋 {t('nav.employeeDashboard') || 'Mi Panel'} <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>({totalActions})</span>
        </h3>
        <button onClick={() => { setLoading(true); loadData() }}
          style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
          <RefreshCw size={12} />
        </button>
      </div>

      {actionError && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>⚠ {actionError}</div>}
      {actionSuccess && <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '12px', marginBottom: '8px' }}>✅ {actionSuccess}</div>}

      {totalActions === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{t('profile.noActiveEvents') || 'No tienes eventos pendientes.'}</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ width: '60px' }}>{t('employeeDashboard.colCode') || 'Código'}</span>
            <span style={{ flex: 1, minWidth: 0, maxWidth: '160px' }}>{t('employeeDashboard.colEvent') || 'Evento'}</span>
            <span style={{ width: '70px' }}>{t('employeeDashboard.colDate') || 'Fecha'}</span>
            <span style={{ width: '45px' }}>{t('employeeDashboard.colTime') || 'Hora'}</span>
            <span style={{ width: '80px', textAlign: 'center' }}>{t('employeeDashboard.colStatus') || 'Estado'}</span>
            <span style={{ width: '80px' }}>{t('employeeDashboard.colRole') || 'Rol'}</span>
            <span style={{ width: '110px' }}>{t('employeeDashboard.colAction') || 'Acción'}</span>
          </div>
          {/* Rows */}
          {data?.ready_to_clock_out.map(ev => renderRow(ev, 'clock_out'))}
          {data?.ready_to_clock_in.map(ev => renderRow(ev, 'clock_in'))}
          {data?.invitations.map(ev => renderRow(ev, 'invited'))}
          {data?.available_to_apply.map(ev => renderRow(ev, 'available'))}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }} onClick={() => setDetailModal(null)}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', maxWidth: '380px', width: '100%', maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{detailModal.name}</h3>
              <button onClick={() => setDetailModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {detailModal.event_code && <Row l={t('employeeDashboard.colCode') || 'Código'} v={detailModal.event_code} />}
              <Row l={t('employeeDashboard.colDate') || 'Fecha'} v={fmtDate(detailModal.event_date)} />
              <Row l={t('employeeDashboard.colTime') || 'Hora'} v={fmtTime(detailModal.start_time) + (detailModal.end_time ? ` — ${fmtTime(detailModal.end_time)}` : '')} />
              <Row l={t('events.address') || 'Dirección'} v={[detailModal.address, detailModal.city, detailModal.state].filter(Boolean).join(', ')} />
              {detailModal.dress_code && <Row l="Dress code" v={detailModal.dress_code} />}
              {detailModal.job_role_name && <Row l={t('employeeDashboard.colRole') || 'Rol'} v={detailModal.job_role_name} />}
              <Row l={t('employeeDashboard.colStatus') || 'Estado'} v={detailModal.status} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>{l}</span>
      <span style={{ fontWeight: 500, color: '#374151', textAlign: 'right', fontSize: '12px' }}>{v}</span>
    </div>
  )
}
