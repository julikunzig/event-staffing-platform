import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import { Download, AlertCircle } from 'lucide-react'

interface EmployeeRow { user_name: string; job_role: string; hours_worked: string | null; hourly_rate: string; total_pay: string | null }
interface EventReport { event_name: string; event_date: string; employees: EmployeeRow[]; total_hours: string; total_pay: string }
interface EmployeeReport { user_name: string; events: any[]; total_hours: string; total_pay: string }

// Reporte 1: Listado de empleados por evento
interface EmployeesByEventRow {
  event_date: string
  event_start_time: string | null
  event_end_time: string | null
  event_name: string
  employee_name: string
  phone: string | null
  job_role: string
  hours_worked: string | null
  hourly_rate: string
  total_pay: string | null
}

// Reporte 2: Consolidado de pagos por empleado
interface PaymentConsolidationRow {
  employee_name: string
  phone: string | null
  total_hours: string
  total_pay: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  
  // Permitir admin, coordinador y empleado
  const isAdminOrCoord = isAdmin(user) || user?.role === 'coordinator'
  const isEmployee = user?.role === 'employee'
  
  if (!isAdminOrCoord && !isEmployee) {
    return (
      <div className="max-w-2xl">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700">{t('reports.onlyAdminCanView')}</p>
        </div>
      </div>
    )
  }

  const [tab, setTab] = useState<'event' | 'employee' | 'me' | 'employees_by_event' | 'payment_consolidation'>(isEmployee ? 'me' : 'event')
  const [eventDate, setEventDate] = useState('')
  const [eventName, setEventName] = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setError('')
    setLoading(true)
    try {
      if (tab === 'event') {
        const params = new URLSearchParams()
        if (eventDate) params.append('event_date', eventDate)
        if (eventName) params.append('event_name', eventName)
        const r = await api.get<any>(`/reports/events?${params.toString()}`)
        setReport(r.data)
      } else if (tab === 'employee') {
        const params = new URLSearchParams()
        if (employeeSearch) params.append('employee_search', employeeSearch)
        if (fromDate) params.append('from', fromDate)
        if (toDate) params.append('to', toDate)
        const r = await api.get<EmployeeReport>(`/reports/employees?${params.toString()}`)
        setReport(r.data)
      } else if (tab === 'me') {
        const r = await api.get<EmployeeReport>(`/reports/me?from=${fromDate}&to=${toDate}`)
        setReport(r.data)
      } else if (tab === 'employees_by_event') {
        const params = new URLSearchParams()
        if (fromDate) params.append('from_date', fromDate)
        if (toDate) params.append('to_date', toDate)
        const r = await api.get<EmployeesByEventRow[]>(`/reports/employees-by-event?${params.toString()}`)
        setReport(r.data)
      } else if (tab === 'payment_consolidation') {
        const params = new URLSearchParams()
        if (fromDate) params.append('from_date', fromDate)
        if (toDate) params.append('to_date', toDate)
        const r = await api.get<PaymentConsolidationRow[]>(`/reports/payment-consolidation?${params.toString()}`)
        setReport(r.data)
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = async () => {
    let url = ''
    if (tab === 'event') {
      const params = new URLSearchParams()
      if (eventDate) params.append('event_date', eventDate)
      if (eventName) params.append('event_name', eventName)
      params.append('format', 'csv')
      url = `/reports/events?${params.toString()}`
    } else if (tab === 'employee') {
      const params = new URLSearchParams()
      if (employeeSearch) params.append('employee_search', employeeSearch)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      params.append('format', 'csv')
      url = `/reports/employees?${params.toString()}`
    } else if (tab === 'me') {
      url = `/reports/me?from=${fromDate}&to=${toDate}&format=csv`
    } else if (tab === 'employees_by_event') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'csv')
      url = `/reports/employees-by-event?${params.toString()}`
    } else if (tab === 'payment_consolidation') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'csv')
      url = `/reports/payment-consolidation?${params.toString()}`
    }
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `report_${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      setError(t('common.error'))
    }
  }

  const downloadPDF = async () => {
    let url = ''
    if (tab === 'event') {
      const params = new URLSearchParams()
      if (eventDate) params.append('event_date', eventDate)
      if (eventName) params.append('event_name', eventName)
      params.append('format', 'pdf')
      url = `/reports/events?${params.toString()}`
    } else if (tab === 'employee') {
      const params = new URLSearchParams()
      if (employeeSearch) params.append('employee_search', employeeSearch)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      params.append('format', 'pdf')
      url = `/reports/employees?${params.toString()}`
    } else if (tab === 'me') {
      url = `/reports/me?from=${fromDate}&to=${toDate}&format=pdf`
    } else if (tab === 'employees_by_event') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'pdf')
      url = `/reports/employees-by-event?${params.toString()}`
    } else if (tab === 'payment_consolidation') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'pdf')
      url = `/reports/payment-consolidation?${params.toString()}`
    }
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `report_${Date.now()}.pdf`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      setError(t('common.error'))
    }
  }

  const downloadExcel = async () => {
    let url = ''
    if (tab === 'event') {
      const params = new URLSearchParams()
      if (eventDate) params.append('event_date', eventDate)
      if (eventName) params.append('event_name', eventName)
      params.append('format', 'excel')
      url = `/reports/events?${params.toString()}`
    } else if (tab === 'employee') {
      const params = new URLSearchParams()
      if (employeeSearch) params.append('employee_search', employeeSearch)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      params.append('format', 'excel')
      url = `/reports/employees?${params.toString()}`
    } else if (tab === 'me') {
      url = `/reports/me?from=${fromDate}&to=${toDate}&format=excel`
    } else if (tab === 'employees_by_event') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'excel')
      url = `/reports/employees-by-event?${params.toString()}`
    } else if (tab === 'payment_consolidation') {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      params.append('format', 'excel')
      url = `/reports/payment-consolidation?${params.toString()}`
    }
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `report_${Date.now()}.xlsx`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      setError(t('common.error'))
    }
  }

  const isEmployeesByEvent = tab === 'employees_by_event'
  const isPaymentConsolidation = tab === 'payment_consolidation'

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('nav.reports')}</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          ...(isAdminOrCoord ? [
            { key: 'event', label: t('reports.byEvent') },
            { key: 'employee', label: t('reports.byEmployee') },
            { key: 'employees_by_event', label: t('reports.eventsByDates') },
            { key: 'payment_consolidation', label: t('reports.paymentConsolidation') },
          ] : []),
          ...(isEmployee ? [{ key: 'me', label: t('reports.myReport') }] : []),
        ].map(tab_item => (
          <Button
            key={tab_item.key}
            variant={tab === tab_item.key ? 'default' : 'outline'}
            onClick={() => {
              setTab(tab_item.key as any)
              setReport(null)
            }}
            className="whitespace-nowrap flex-shrink-0"
          >
            {tab_item.label}
          </Button>
        ))}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          {/* Reporte "Por Evento" */}
          {tab === 'event' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.eventDate')} *</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.eventName')} ({t('common.optional')})</Label>
                <Input
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder={t('reports.eventNamePlaceholder') || "Nombre del evento"}
                />
              </div>
            </div>
          )}

          {/* Reporte "Por Empleado" */}
          {tab === 'employee' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.employee')} *</Label>
                <Input
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                  placeholder={t('reports.employeePlaceholder') || "Nombre, email o teléfono"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.from')} *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.to')} *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Reporte "Mi Reporte" */}
          {tab === 'me' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.from')} *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.to')} *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Reporte "Eventos por Fechas" */}
          {tab === 'employees_by_event' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.from')} *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.to')} *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Reporte "Consolidado de Pagos" */}
          {tab === 'payment_consolidation' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.from')} *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('reports.to')} *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={fetchReport}
              disabled={loading || (tab === 'event' && !eventDate) || (tab === 'employee' && (!employeeSearch || !fromDate || !toDate)) || ((tab === 'employees_by_event' || tab === 'payment_consolidation') && (!fromDate || !toDate)) || (tab === 'me' && (!fromDate || !toDate))}
            >
              {loading ? t('common.loading') : t('reports.generate')}
            </Button>
            {report && (
              <>
                <Button variant="outline" onClick={downloadCSV} className="gap-2">
                  <Download size={16} /> {t('reports.downloadCSV')}
                </Button>
                <Button variant="outline" onClick={downloadPDF} className="gap-2">
                  <Download size={16} /> {t('reports.downloadPDF')}
                </Button>
                <Button variant="outline" onClick={downloadExcel} className="gap-2">
                  <Download size={16} /> {t('reports.downloadExcel')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEmployeesByEvent
                ? t('reports.eventsByDates')
                : isPaymentConsolidation
                  ? t('reports.paymentConsolidation')
                  : Array.isArray(report)
                    ? t('reports.byEvent')
                    : 'event_name' in report
                      ? report.event_name
                      : report.user_name}
            </CardTitle>
            {!isEmployeesByEvent && !isPaymentConsolidation && !Array.isArray(report) && (
              <p className="text-sm text-gray-500">
                {t('reports.totalHours')}: {parseFloat(report.total_hours).toFixed(2)}h — {t('reports.totalPay')}: $
                {parseFloat(report.total_pay).toFixed(2)}
              </p>
            )}
            {(isEmployeesByEvent || isPaymentConsolidation) && Array.isArray(report) && (
              <p className="text-sm text-gray-500">
                {t('reports.totalHours')}: {report.reduce((sum: number, row: any) => sum + parseFloat(isEmployeesByEvent ? (row.hours_worked || 0) : (row.total_hours || 0)), 0).toFixed(2)}h — {t('reports.totalPay')}: $
                {report.reduce((sum: number, row: any) => sum + parseFloat(row.total_pay || 0), 0).toFixed(2)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 font-medium">
                    {isEmployeesByEvent ? (
                      <>
                        <th className="text-left py-2 px-2">Fecha Evento</th>
                        <th className="text-left py-2 px-2">Hora Inicio</th>
                        <th className="text-left py-2 px-2">Hora Fin</th>
                        <th className="text-left py-2 px-2">Evento</th>
                        <th className="text-left py-2 px-2">Empleado</th>
                        <th className="text-left py-2 px-2">Teléfono</th>
                        <th className="text-left py-2 px-2">Rol</th>
                        <th className="text-right py-2 px-2">Horas</th>
                        <th className="text-right py-2 px-2">Tarifa/h</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </>
                    ) : isPaymentConsolidation ? (
                      <>
                        <th className="text-left py-2 px-2">Empleado</th>
                        <th className="text-left py-2 px-2">Teléfono</th>
                        <th className="text-right py-2 px-2">Total Horas</th>
                        <th className="text-right py-2 px-2">Total a Pagar</th>
                      </>
                    ) : Array.isArray(report) ? (
                      <>
                        <th className="text-left py-2 px-2">Evento</th>
                        <th className="text-left py-2 px-2">Fecha</th>
                        <th className="text-left py-2 px-2">Hora Inicio</th>
                        <th className="text-left py-2 px-2">Hora Fin</th>
                        <th className="text-left py-2 px-2">Empleado</th>
                        <th className="text-left py-2 px-2">Rol</th>
                        <th className="text-right py-2 px-2">Horas</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </>
                    ) : 'events' in report ? (
                      <>
                        <th className="text-left py-2 px-2">Evento</th>
                        <th className="text-left py-2 px-2">Fecha</th>
                        <th className="text-left py-2 px-2">Hora Inicio</th>
                        <th className="text-left py-2 px-2">Hora Fin</th>
                        <th className="text-left py-2 px-2">Rol</th>
                        <th className="text-right py-2 px-2">Horas</th>
                        <th className="text-right py-2 px-2">Valor/Hora</th>
                        <th className="text-right py-2 px-2">Pago Regular</th>
                        <th className="text-right py-2 px-2">Overtime</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-2 px-2">Evento</th>
                        <th className="text-left py-2 px-2">Fecha</th>
                        <th className="text-left py-2 px-2">Hora Inicio</th>
                        <th className="text-left py-2 px-2">Hora Fin</th>
                        <th className="text-left py-2 px-2">Rol</th>
                        <th className="text-right py-2 px-2">Horas</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(isEmployeesByEvent || isPaymentConsolidation ? report : Array.isArray(report) ? report.flatMap((r: any) => r.employees.map((e: any) => ({ ...e, event_name: r.event_name, event_date: r.event_date }))) : 'events' in report ? report.events : 'employees' in report ? report.employees : report.events).map(
                    (row: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        {isEmployeesByEvent ? (
                          <>
                            <td className="py-2 px-2">{row.event_date}</td>
                            <td className="py-2 px-2">{row.event_start_time || '—'}</td>
                            <td className="py-2 px-2">{row.event_end_time || '—'}</td>
                            <td className="py-2 px-2">{row.event_name}</td>
                            <td className="py-2 px-2">{row.employee_name}</td>
                            <td className="py-2 px-2">{row.phone || '—'}</td>
                            <td className="py-2 px-2">{row.job_role}</td>
                            <td className="text-right py-2 px-2">{row.hours_worked != null ? parseFloat(row.hours_worked).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2">${parseFloat(row.hourly_rate).toFixed(2)}</td>
                            <td className="text-right py-2 px-2 font-medium">{row.total_pay != null ? `$${parseFloat(row.total_pay).toFixed(2)}` : '—'}</td>
                          </>
                        ) : isPaymentConsolidation ? (
                          <>
                            <td className="py-2 px-2">{row.employee_name}</td>
                            <td className="py-2 px-2">{row.phone || '—'}</td>
                            <td className="text-right py-2 px-2">{parseFloat(row.total_hours).toFixed(2)}</td>
                            <td className="text-right py-2 px-2 font-medium">${parseFloat(row.total_pay).toFixed(2)}</td>
                          </>
                        ) : Array.isArray(report) ? (
                          <>
                            <td className="py-2 px-2">{row.event_name}</td>
                            <td className="py-2 px-2">{row.event_date}</td>
                            <td className="py-2 px-2">{row.event_start_time || '—'}</td>
                            <td className="py-2 px-2">{row.event_end_time || '—'}</td>
                            <td className="py-2 px-2">{row.user_name}</td>
                            <td className="py-2 px-2">{row.job_role}</td>
                            <td className="text-right py-2 px-2">{row.hours_worked ? parseFloat(row.hours_worked).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2 font-medium">${row.total_pay ? parseFloat(row.total_pay).toFixed(2) : '—'}</td>
                          </>
                        ) : 'events' in report ? (
                          <>
                            <td className="py-2 px-2">{row.event_name}</td>
                            <td className="py-2 px-2">{row.event_date}</td>
                            <td className="py-2 px-2">{row.event_start_time || '—'}</td>
                            <td className="py-2 px-2">{row.event_end_time || '—'}</td>
                            <td className="py-2 px-2">{row.job_role}</td>
                            <td className="text-right py-2 px-2">{row.hours_worked ? parseFloat(row.hours_worked).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2">${parseFloat(row.hourly_rate).toFixed(2)}</td>
                            <td className="text-right py-2 px-2">${row.regular_pay ? parseFloat(row.regular_pay).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2">${row.overtime_pay ? parseFloat(row.overtime_pay).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2 font-medium">${row.total_pay ? parseFloat(row.total_pay).toFixed(2) : '—'}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2">{row.event_name}</td>
                            <td className="py-2 px-2">{row.event_date}</td>
                            <td className="py-2 px-2">{row.event_start_time || '—'}</td>
                            <td className="py-2 px-2">{row.event_end_time || '—'}</td>
                            <td className="py-2 px-2">{row.job_role}</td>
                            <td className="text-right py-2 px-2">{row.hours_worked ? parseFloat(row.hours_worked).toFixed(2) : '—'}</td>
                            <td className="text-right py-2 px-2 font-medium">${row.total_pay ? parseFloat(row.total_pay).toFixed(2) : '—'}</td>
                          </>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
