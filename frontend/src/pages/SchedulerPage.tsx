import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import {
  Clock, Play, Pause, RotateCcw, RefreshCw,
  CheckCircle2, AlertCircle, Mail, List, ChevronDown, ChevronUp, Save, Send,
} from 'lucide-react'

const GREEN = '#2db84b'
const GREEN_DARK = '#1e8c35'

interface Job {
  id: string
  name: string
  next_run: string | null
  trigger: string
  paused: boolean
}

interface SchedulerStatus {
  running: boolean
  jobs: Job[]
}

interface JobTemplate {
  id: number
  code: string
  subject: string
  html_body: string
  text_body: string | null
}

interface SendLog {
  id: number
  recipient_email: string
  subject: string
  status: string
  sent_at: string | null
  created_at: string
  error_message: string | null
}

type ActiveTab = 'template' | 'logs'

export default function SchedulerPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<SchedulerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Per-job expanded panel state
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, ActiveTab>>({})

  // Template state per job
  const [templates, setTemplates] = useState<Record<string, JobTemplate | null>>({})
  const [templateLoading, setTemplateLoading] = useState<Record<string, boolean>>({})
  const [templateSaving, setTemplateSaving] = useState<Record<string, boolean>>({})
  const [templateEdits, setTemplateEdits] = useState<Record<string, { subject: string; html_body: string }>>({})

  // Logs state per job
  const [logs, setLogs] = useState<Record<string, SendLog[]>>({})
  const [logsLoading, setLogsLoading] = useState<Record<string, boolean>>({})

  // Test email state per job
  const [testEmail, setTestEmail] = useState<Record<string, string>>({})
  const [testSending, setTestSending] = useState<Record<string, boolean>>({})

  const load = async () => {
    try {
      const res = await api.get<SchedulerStatus>('/scheduler/jobs')
      setStatus(res.data)
    } catch {
      setStatus({ running: false, jobs: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const formatDate = (iso: string | null): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const formatNextRun = (iso: string | null): string => {
    if (!iso) return t('scheduler.nextRunPaused')
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    })
  }

  const runNow = async (jobId: string) => {
    setActionId(jobId + '_run')
    try {
      await api.post(`/scheduler/jobs/${jobId}/run`)
      showToast(t('scheduler.jobQueued'), true)
    } catch {
      showToast(t('scheduler.jobError'), false)
    } finally {
      setActionId(null)
    }
  }

  const togglePause = async (job: Job) => {
    const endpoint = job.paused ? 'resume' : 'pause'
    setActionId(job.id + '_toggle')
    try {
      await api.post(`/scheduler/jobs/${job.id}/${endpoint}`)
      showToast(job.paused ? t('scheduler.resumed') : t('scheduler.pausedMsg'), true)
      await load()
    } catch {
      showToast(t('scheduler.pauseError'), false)
    } finally {
      setActionId(null)
    }
  }

  const loadTemplate = async (jobId: string) => {
    if (templates[jobId] !== undefined) return
    setTemplateLoading(p => ({ ...p, [jobId]: true }))
    try {
      const res = await api.get<JobTemplate>(`/scheduler/jobs/${jobId}/template`)
      setTemplates(p => ({ ...p, [jobId]: res.data }))
      setTemplateEdits(p => ({ ...p, [jobId]: { subject: res.data.subject, html_body: res.data.html_body } }))
    } catch {
      setTemplates(p => ({ ...p, [jobId]: null }))
    } finally {
      setTemplateLoading(p => ({ ...p, [jobId]: false }))
    }
  }

  const loadLogs = async (jobId: string) => {
    setLogsLoading(p => ({ ...p, [jobId]: true }))
    try {
      const res = await api.get<{ items: SendLog[] }>(`/scheduler/jobs/${jobId}/logs?limit=50`)
      setLogs(p => ({ ...p, [jobId]: res.data.items }))
    } catch {
      setLogs(p => ({ ...p, [jobId]: [] }))
    } finally {
      setLogsLoading(p => ({ ...p, [jobId]: false }))
    }
  }

  const toggleJob = (jobId: string) => {
    if (expandedJob === jobId) {
      setExpandedJob(null)
      return
    }
    setExpandedJob(jobId)
    const tab = activeTab[jobId] || 'template'
    if (tab === 'template') loadTemplate(jobId)
    else loadLogs(jobId)
  }

  const switchTab = (jobId: string, tab: ActiveTab) => {
    setActiveTab(p => ({ ...p, [jobId]: tab }))
    if (tab === 'template') loadTemplate(jobId)
    else loadLogs(jobId)
  }

  const saveTemplate = async (jobId: string) => {
    const edits = templateEdits[jobId]
    if (!edits) return
    setTemplateSaving(p => ({ ...p, [jobId]: true }))
    try {
      await api.put(`/scheduler/jobs/${jobId}/template`, {
        subject: edits.subject,
        html_body: edits.html_body,
      })
      setTemplates(p => p[jobId] ? { ...p, [jobId]: { ...p[jobId]!, subject: edits.subject, html_body: edits.html_body } } : p)
      showToast(t('scheduler.templateSaved'), true)
    } catch {
      showToast(t('scheduler.templateError'), false)
    } finally {
      setTemplateSaving(p => ({ ...p, [jobId]: false }))
    }
  }

  const sendTest = async (jobId: string) => {
    const email = testEmail[jobId]?.trim()
    if (!email) return
    setTestSending(p => ({ ...p, [jobId]: true }))
    try {
      await api.post(`/scheduler/jobs/${jobId}/template/test`, { to_email: email })
      showToast(t('scheduler.testSent'), true)
    } catch (err: any) {
      const detail = err?.response?.data?.detail || t('scheduler.testError')
      showToast(detail, false)
    } finally {
      setTestSending(p => ({ ...p, [jobId]: false }))
    }
  }

  const statusColor = (s: string) => s === 'success' ? '#166534' : s === 'failed' ? '#991b1b' : '#92400e'
  const statusBg = (s: string) => s === 'success' ? '#f0fdf4' : s === 'failed' ? '#fef2f2' : '#fefce8'
  const statusLabel = (s: string) => s === 'success' ? t('scheduler.statusSuccess') : s === 'failed' ? t('scheduler.statusFailed') : t('scheduler.statusPending')

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          background: toast.ok ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.ok ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '10px', padding: '12px 18px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          color: toast.ok ? '#166534' : '#991b1b', fontSize: '13px', fontWeight: 600,
        }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
            {t('scheduler.title')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            {t('scheduler.subtitle')}
          </p>
        </div>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#f9fafb', border: '1px solid #e5e7eb',
          borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
          fontSize: '12px', fontWeight: 600, color: '#374151',
        }}>
          <RefreshCw size={13} /> {t('scheduler.refresh')}
        </button>
      </div>

      {/* Estado */}
      <div style={{ ...card, marginBottom: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: status?.running ? GREEN : '#ef4444',
          boxShadow: status?.running ? `0 0 0 3px rgba(45,184,75,0.2)` : undefined,
        }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Scheduler {status?.running ? t('scheduler.active') : t('scheduler.inactive')}
        </span>
        {loading && <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>{t('scheduler.loading')}</span>}
      </div>

      {/* Jobs */}
      {status?.jobs.map(job => {
        const label = t(`scheduler.jobs.${job.id}.label`, { defaultValue: job.name })
        const desc = t(`scheduler.jobs.${job.id}.desc`, { defaultValue: '' })
        const isRunning = actionId?.startsWith(job.id)
        const isExpanded = expandedJob === job.id
        const tab = activeTab[job.id] || 'template'

        return (
          <div key={job.id} style={{ ...card, marginBottom: '14px', overflow: 'hidden' }}>
            {/* Job header */}
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={15} color={GREEN} />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{label}</span>
                    {job.paused && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, background: '#fef3c7',
                        color: '#92400e', borderRadius: '999px', padding: '2px 8px',
                      }}>{t('scheduler.paused')}</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>{desc}</p>
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    <span style={{ color: '#9ca3af' }}>{t('scheduler.nextRun')} </span>
                    <strong>{formatNextRun(job.next_run)}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{job.trigger}</div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  <button
                    onClick={() => togglePause(job)}
                    disabled={!!isRunning}
                    title={job.paused ? t('common.resume') : t('common.pause')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 13px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
                      background: '#fff', cursor: isRunning ? 'not-allowed' : 'pointer',
                      fontSize: '12px', fontWeight: 600, color: '#374151',
                      opacity: isRunning ? 0.6 : 1,
                    }}
                  >
                    {job.paused ? <><RotateCcw size={13} /> {t('common.resume')}</> : <><Pause size={13} /> {t('common.pause')}</>}
                  </button>
                  <button
                    onClick={() => runNow(job.id)}
                    disabled={!!isRunning || job.paused}
                    title={t('scheduler.runNow')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 13px', borderRadius: '8px', border: 'none',
                      background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`,
                      cursor: (isRunning || job.paused) ? 'not-allowed' : 'pointer',
                      fontSize: '12px', fontWeight: 600, color: '#fff',
                      opacity: (isRunning || job.paused) ? 0.6 : 1,
                    }}
                  >
                    <Play size={13} /> {t('scheduler.runNow')}
                  </button>
                  <button
                    onClick={() => toggleJob(job.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '7px 11px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
                      background: isExpanded ? '#f9fafb' : '#fff', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, color: '#374151',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded panel */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid #f0f0f0' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  {(['template', 'logs'] as ActiveTab[]).map(t2 => (
                    <button
                      key={t2}
                      onClick={() => switchTab(job.id, t2)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 18px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600, background: 'transparent',
                        color: tab === t2 ? GREEN_DARK : '#6b7280',
                        borderBottom: tab === t2 ? `2px solid ${GREEN}` : '2px solid transparent',
                      }}
                    >
                      {t2 === 'template' ? <><Mail size={13} /> {t('scheduler.tabTemplate')}</> : <><List size={13} /> {t('scheduler.tabLogs')}</>}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '20px 22px' }}>
                  {/* Template tab */}
                  {tab === 'template' && (
                    templateLoading[job.id] ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>
                    ) : templates[job.id] === null ? (
                      <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('scheduler.templateNotFound')}</p>
                    ) : templates[job.id] ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            {t('scheduler.templateSubject')}
                          </label>
                          <input
                            value={templateEdits[job.id]?.subject ?? ''}
                            onChange={e => setTemplateEdits(p => ({ ...p, [job.id]: { ...p[job.id], subject: e.target.value } }))}
                            style={{
                              width: '100%', padding: '8px 12px', borderRadius: '8px',
                              border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#111827',
                              fontFamily: 'inherit', boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            {t('scheduler.templateBody')}
                          </label>
                          <textarea
                            value={templateEdits[job.id]?.html_body ?? ''}
                            onChange={e => setTemplateEdits(p => ({ ...p, [job.id]: { ...p[job.id], html_body: e.target.value } }))}
                            rows={14}
                            style={{
                              width: '100%', padding: '10px 12px', borderRadius: '8px',
                              border: '1.5px solid #e5e7eb', fontSize: '12px', color: '#111827',
                              fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box',
                              lineHeight: '1.6',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => saveTemplate(job.id)}
                            disabled={templateSaving[job.id]}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '9px 18px', borderRadius: '8px', border: 'none',
                              background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`,
                              color: '#fff', fontSize: '13px', fontWeight: 600,
                              cursor: templateSaving[job.id] ? 'not-allowed' : 'pointer',
                              opacity: templateSaving[job.id] ? 0.7 : 1,
                            }}
                          >
                            <Save size={13} />
                            {templateSaving[job.id] ? t('scheduler.saving') : t('scheduler.saveTemplate')}
                          </button>
                        </div>

                        {/* Test send */}
                        <div style={{
                          marginTop: '4px', paddingTop: '16px',
                          borderTop: '1px dashed #e5e7eb',
                        }}>
                          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            {t('scheduler.testEmail')}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="email"
                              placeholder="ejemplo@correo.com"
                              value={testEmail[job.id] || ''}
                              onChange={e => setTestEmail(p => ({ ...p, [job.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && sendTest(job.id)}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: '8px',
                                border: '1.5px solid #e5e7eb', fontSize: '13px',
                                fontFamily: 'inherit', color: '#111827',
                              }}
                            />
                            <button
                              onClick={() => sendTest(job.id)}
                              disabled={testSending[job.id] || !testEmail[job.id]?.trim()}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: testSending[job.id] || !testEmail[job.id]?.trim()
                                  ? '#e5e7eb' : '#111827',
                                color: testSending[job.id] || !testEmail[job.id]?.trim()
                                  ? '#9ca3af' : '#fff',
                                fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                                cursor: testSending[job.id] || !testEmail[job.id]?.trim()
                                  ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Send size={13} />
                              {testSending[job.id] ? t('scheduler.sendingTest') : t('scheduler.sendTest')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null
                  )}

                  {/* Logs tab */}
                  {tab === 'logs' && (
                    logsLoading[job.id] ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>
                    ) : !logs[job.id] || logs[job.id].length === 0 ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                        {t('scheduler.logsEmpty')}
                      </p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                              {[t('scheduler.logsRecipient'), t('scheduler.logsDate'), t('scheduler.logsStatus')].map(h => (
                                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {logs[job.id].map(log => (
                              <tr key={log.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                <td style={{ padding: '8px 10px', color: '#111827' }}>{log.recipient_email}</td>
                                <td style={{ padding: '8px 10px', color: '#374151', whiteSpace: 'nowrap' }}>
                                  {formatDate(log.sent_at || log.created_at)}
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <span style={{
                                    display: 'inline-block', padding: '2px 9px', borderRadius: '999px',
                                    fontSize: '11px', fontWeight: 700,
                                    background: statusBg(log.status), color: statusColor(log.status),
                                  }}>
                                    {statusLabel(log.status)}
                                  </span>
                                  {log.error_message && (
                                    <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '11px' }}>
                                      {log.error_message}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {status && status.jobs.length === 0 && (
        <div style={{ ...card, padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
          {t('scheduler.noJobs')}
        </div>
      )}
    </div>
  )
}
