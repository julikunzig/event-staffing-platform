import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e9038'

interface Settlement {
  id: number
  company_id: number
  created_by: number
  creator_name: string | null
  status: string
  period_start: string
  period_end: string
  total_amount: string
  created_at: string
  updated_at: string
  item_count: number
  employee_count: number
}

interface SettlementItem {
  id: number
  shift_id: number
  week_start: string
  week_end: string
  hours_worked: string
  hourly_rate: string
  regular_hours: string
  overtime_hours: string
  regular_pay: string
  overtime_pay: string
  total_pay: string
}

interface EmployeeDetail {
  user_id: number
  user_name: string
  total_hours: string
  total_regular_hours: string
  total_overtime_hours: string
  total_regular_pay: string
  total_overtime_pay: string
  total_pay: string
  items: SettlementItem[]
}

interface SettlementDetail {
  id: number
  company_id: number
  created_by: number
  creator_name: string | null
  status: string
  period_start: string
  period_end: string
  total_amount: string
  created_at: string
  updated_at: string
  employees: EmployeeDetail[]
}

export default function PayrollPage() {
  const { t } = useTranslation()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadSettlements = async () => {
    try {
      setLoading(true)
      const res = await api.get<Settlement[]>('/payroll/settlements')
      setSettlements(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettlements() }, [])

  const handleSettle = async () => {
    setSettling(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.post('/payroll/settle')
      setSuccessMsg(
        `${t('payroll.settleSuccess')}: ${res.data.employees_count} ${t('payroll.employees')}, ${res.data.shifts_count} ${t('payroll.shifts')}, $${Number(res.data.total_amount).toFixed(2)}`
      )
      await loadSettlements()
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.errorOccurred'))
    } finally {
      setSettling(false)
    }
  }

  const handleViewDetail = async (id: number) => {
    setLoadingDetail(true)
    try {
      const res = await api.get<SettlementDetail>(`/payroll/settlements/${id}`)
      setSelectedSettlement(res.data)
    } catch {
      setError(t('common.errorOccurred'))
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleProcess = async (id: number) => {
    if (!confirm(t('payroll.confirmProcess'))) return
    setProcessing(true)
    try {
      await api.patch(`/payroll/settlements/${id}/process`)
      setSuccessMsg(t('payroll.processSuccess'))
      await loadSettlements()
      if (selectedSettlement?.id === id) {
        setSelectedSettlement({ ...selectedSettlement, status: 'procesando_pago' })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.errorOccurred'))
    } finally {
      setProcessing(false)
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      liquidado: { bg: 'rgba(45,184,75,0.12)', color: GREEN, label: t('payroll.statusSettled') },
      procesando_pago: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', label: t('payroll.statusProcessing') },
    }
    const s = styles[status] || { bg: '#eee', color: '#666', label: status }
    return (
      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    )
  }

  const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString()
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1d1e', margin: 0, fontFamily: "'Poppins',sans-serif" }}>
            {t('payroll.title')}
          </h1>
          <button
            onClick={handleSettle}
            disabled={settling}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: settling ? 'not-allowed' : 'pointer',
              opacity: settling ? 0.7 : 1, fontFamily: "'Poppins',sans-serif",
              boxShadow: '0 2px 8px rgba(45,184,75,0.3)',
            }}
          >
            {settling ? t('payroll.settling') : t('payroll.settle')}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', marginBottom: '16px', fontSize: '13px', fontWeight: 500 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(45,184,75,0.1)', color: GREEN_DARK, marginBottom: '16px', fontSize: '13px', fontWeight: 500 }}>
            {successMsg}
          </div>
        )}

        {/* Detail view */}
        {selectedSettlement && (
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedSettlement(null)}
              style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '0', marginBottom: '12px', fontFamily: "'Poppins',sans-serif" }}
            >
              ← {t('common.back')}
            </button>

            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1a1d1e', fontFamily: "'Poppins',sans-serif" }}>
                    {t('payroll.settlementDetail')} #{selectedSettlement.id}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                    {formatDate(selectedSettlement.period_start)} — {formatDate(selectedSettlement.period_end)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {statusBadge(selectedSettlement.status)}
                  {selectedSettlement.status === 'liquidado' && (
                    <button
                      onClick={() => handleProcess(selectedSettlement.id)}
                      disabled={processing}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: '1px solid #3b82f6',
                        background: 'rgba(59,130,246,0.08)', color: '#3b82f6',
                        fontSize: '12px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: "'Poppins',sans-serif",
                      }}
                    >
                      {processing ? '...' : t('payroll.processForPayment')}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'rgba(45,184,75,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{t('common.total')}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: GREEN_DARK }}>${Number(selectedSettlement.total_amount).toFixed(2)}</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{t('payroll.employees')}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>{selectedSettlement.employees.length}</p>
                </div>
              </div>

              {/* Employee breakdown */}
              {selectedSettlement.employees.map((emp) => (
                <div key={emp.user_id} style={{ marginBottom: '16px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1d1e' }}>{emp.user_name}</span>
                      <span style={{ marginLeft: '12px', fontSize: '12px', color: '#666' }}>
                        {Number(emp.total_hours).toFixed(2)} {t('common.hours')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      {Number(emp.total_overtime_hours) > 0 && (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                          OT: {Number(emp.total_overtime_hours).toFixed(2)}h (${Number(emp.total_overtime_pay).toFixed(2)})
                        </span>
                      )}
                      <span style={{ fontWeight: 700, color: GREEN_DARK }}>${Number(emp.total_pay).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 12px' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginTop: '8px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('payroll.week')}</th>
                          <th style={{ textAlign: 'right', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('common.hours')}</th>
                          <th style={{ textAlign: 'right', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('common.rate')}</th>
                          <th style={{ textAlign: 'right', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('payroll.regular')}</th>
                          <th style={{ textAlign: 'right', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('payroll.overtime')}</th>
                          <th style={{ textAlign: 'right', padding: '6px 4px', color: '#666', fontWeight: 500 }}>{t('common.total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.items.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                            <td style={{ padding: '6px 4px', color: '#333' }}>
                              {formatDate(item.week_start)} - {formatDate(item.week_end)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', color: '#333' }}>{Number(item.hours_worked).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', color: '#333' }}>${Number(item.hourly_rate).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', color: '#333' }}>${Number(item.regular_pay).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', color: Number(item.overtime_pay) > 0 ? '#f59e0b' : '#333' }}>
                              ${Number(item.overtime_pay).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 600, color: '#1a1d1e' }}>${Number(item.total_pay).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlements list */}
        {!selectedSettlement && (
          <>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '13px' }}>{t('common.loading')}</p>
            ) : settlements.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{t('payroll.noSettlements')}</p>
                <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>{t('payroll.noSettlementsDesc')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settlements.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleViewDetail(s.id)}
                    style={{
                      background: '#fff', borderRadius: '12px', padding: '16px 20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d1e' }}>
                            #{s.id}
                          </span>
                          {statusBadge(s.status)}
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                          {formatDate(s.period_start)} — {formatDate(s.period_end)}
                          {s.creator_name && <span> · {t('payroll.createdBy')} {s.creator_name}</span>}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: GREEN_DARK }}>${Number(s.total_amount).toFixed(2)}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#999' }}>
                          {s.employee_count} {t('payroll.employees')} · {s.item_count} {t('payroll.shifts')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {loadingDetail && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', fontSize: '14px', fontWeight: 500 }}>
              {t('common.loading')}
            </div>
          </div>
        )}
    </div>
  )
}