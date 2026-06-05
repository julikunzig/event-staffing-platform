import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Search, Plus, Pencil, Users, ChevronDown, ChevronUp, Briefcase } from 'lucide-react'
import ConfirmDialog from '@/pages/ConfirmDialog'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }
interface Member  { id: number; name: string; email: string; phone: string | null; profile: string }

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 5px', display: 'block',
}

export default function JobRolesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [roles, setRoles]           = useState<JobRole[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState<number | null>(null)
  const [name, setName]             = useState('')
  const [rate, setRate]             = useState('')
  const [error, setError]           = useState('')
  const [expandedRole, setExpandedRole] = useState<number | null>(null)
  const [members, setMembers]       = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [selectedIds, setSelectedIds]   = useState<Set<number>>(new Set())
  const [searchFilter, setSearchFilter] = useState('')
  const [assignResult, setAssignResult] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [customRates, setCustomRates]   = useState<Record<number, string>>({})  // {userId: "25.00"}
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  const load = () => api.get<JobRole[]>('/job-roles').then(r => setRoles(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      if (editId) await api.patch(`/job-roles/${editId}`, { name, hourly_rate: parseFloat(rate) })
      else        await api.post('/job-roles', { name, hourly_rate: parseFloat(rate) })
      setShowForm(false); setEditId(null); setName(''); setRate(''); load()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
  }

  const handleEdit = (role: JobRole) => {
    setEditId(role.id); setName(role.name); setRate(role.hourly_rate); setShowForm(true)
    setExpandedRole(null)
  }

  const handleDeactivate = (role: JobRole) => {
    setConfirmDialog({
      title: `¿Desactivar "${role.name}"?`,
      message: 'El rol quedará inactivo y no podrá asignarse a nuevos eventos.',
      onConfirm: async () => {
        setConfirmDialog(null)
        await api.delete(`/job-roles/${role.id}/deactivate`); load()
      }
    })
  }

  const toggleExpand = async (roleId: number) => {
    if (expandedRole === roleId) { setExpandedRole(null); return }
    setExpandedRole(roleId); setSelectedIds(new Set()); setAssignResult(''); setSearchFilter(''); setCustomRates({})
    setMembersLoading(true)
    try {
      const [membersRes, withRolesRes] = await Promise.all([
        api.get<Member[]>(`/users/companies/${user?.company_id}/members`),
        api.get<{ id: number; roles: { id: number }[] }[]>('/job-roles/employees-with-roles'),
      ])
      setMembers(membersRes.data.filter(m => m.profile === 'employee'))
      const alreadyHave = new Set(withRolesRes.data.filter(e => e.roles.some(r => r.id === roleId)).map(e => e.id))
      setSelectedIds(alreadyHave as Set<number>)
    } catch { setMembers([]) } finally { setMembersLoading(false) }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkAssign = async (roleId: number) => {
    if (selectedIds.size === 0) return
    setAssignLoading(true); setAssignResult('')
    try {
      // Build hourly_rates map for employees with custom rates
      const hourly_rates: Record<string, number> = {}
      for (const [uid, rateStr] of Object.entries(customRates)) {
        if (rateStr && parseFloat(rateStr) > 0) {
          hourly_rates[uid] = parseFloat(rateStr)
        }
      }
      const res = await api.post(`/job-roles/bulk-assign/${roleId}`, {
        user_ids: Array.from(selectedIds),
        hourly_rates: Object.keys(hourly_rates).length > 0 ? hourly_rates : null,
      })
      const data = res.data as { assigned: number[]; skipped: number[] }

      // For skipped employees (already assigned) that have a rate change, update via employee-rate endpoint
      let rateUpdated = 0
      if (data.skipped.length > 0) {
        for (const uid of data.skipped) {
          const rateStr = customRates[uid]
          if (rateStr && parseFloat(rateStr) > 0) {
            try {
              // Get the employee_job_role ID for this user+role
              const empRoles = await api.get(`/users/${uid}/rates`)
              const ejr = empRoles.data.find((r: any) => r.job_role_id === roleId)
              if (ejr) {
                await api.patch(`/job-roles/employee-rate/${ejr.id}`, { hourly_rate_override: parseFloat(rateStr) })
                rateUpdated++
              }
            } catch {}
          }
        }
      }

      let msg = `✅ ${data.assigned.length} asociado(s)`
      if (rateUpdated > 0) msg += `, ${rateUpdated} tarifa(s) actualizada(s)`
      if (data.skipped.length > 0 && rateUpdated === 0) msg += `, ${data.skipped.length} ya asociado(s)`
      setAssignResult(msg)
      setSelectedIds(new Set()); setCustomRates({})
    } catch (e: any) {
      setAssignResult(`❌ ${e.response?.data?.detail || t('common.error')}`)
    } finally { setAssignLoading(false) }
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.email.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '860px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('roles.title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{roles.filter(r => r.is_active).length} roles activos</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setName(''); setRate('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.25)' }}>
          <Plus size={15} />{t('roles.newRole')}
        </button>
      </div>

      {/* Formulario nuevo/editar rol */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '16px 20px' }}>
            <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              {editId ? `${t('common.edit')} — ${name}` : t('roles.newRole')}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>{t('roles.roleName')} *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Bartender" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('roles.hourlyRate')} *</label>
                  <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} required placeholder="25.00" style={fieldStyle} />
                </div>
              </div>
              {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.save')}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '8px 16px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de roles */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {roles.map(role => (
            <div key={role.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Row principal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: role.is_active ? '#f0fdf4' : '#f3f4f6', border: `1px solid ${role.is_active ? '#bbf7d0' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={16} color={role.is_active ? GREEN : '#9ca3af'} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13.5px', color: role.is_active ? '#111827' : '#9ca3af' }}>{role.name}</p>
                    <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#9ca3af' }}>${parseFloat(role.hourly_rate).toFixed(2)}/{t('common.hour')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px',
                    background: role.is_active ? '#f0fdf4' : '#f3f4f6',
                    color: role.is_active ? GREEN : '#9ca3af',
                    border: `1px solid ${role.is_active ? '#bbf7d0' : '#e5e7eb'}`,
                  }}>
                    {role.is_active ? t('common.active') : t('common.inactive')}
                  </span>

                  {role.is_active && (
                    <>
                      <button onClick={() => handleEdit(role)}
                        style={{ padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => toggleExpand(role.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: expandedRole === role.id ? '#f0fdf4' : '#fff', cursor: 'pointer', color: expandedRole === role.id ? GREEN : '#374151', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                        <Users size={13} />{t('roles.assignStaff')}
                        {expandedRole === role.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button onClick={() => handleDeactivate(role)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                        {t('roles.deactivate')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Panel asignación masiva */}
              {expandedRole === role.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                      {t('roles.assignStaff')} — <span style={{ color: GREEN }}>{role.name}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { const n = new Set(selectedIds); filteredMembers.forEach(m => n.add(m.id)); setSelectedIds(n) }}
                        style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: "'Poppins',sans-serif" }}>
                        {t('roles.selectAll')}
                      </button>
                      <button onClick={() => setSelectedIds(new Set())}
                        style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#9ca3af', fontFamily: "'Poppins',sans-serif" }}>
                        {t('roles.clear')}
                      </button>
                    </div>
                  </div>

                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder={t('common.search')}
                      style={{ ...fieldStyle, paddingLeft: '30px', height: '36px' }} />
                  </div>

                  {membersLoading ? (
                    <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>{t('common.loading')}</p>
                  ) : filteredMembers.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>{t('common.noData')}</p>
                  ) : (
                    <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                      {filteredMembers.map((member, idx) => (
                        <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: idx < filteredMembers.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <input type="checkbox" checked={selectedIds.has(member.id)} onChange={() => toggleSelect(member.id)} style={{ accentColor: GREEN, width: '15px', height: '15px' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                          </div>
                          {selectedIds.has(member.id) && (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={`$${role.hourly_rate}/h`}
                              value={customRates[member.id] || ''}
                              onChange={e => setCustomRates(prev => ({ ...prev, [member.id]: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              style={{ width: '90px', height: '30px', fontSize: '12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', padding: '0 8px', background: '#f9fafb', outline: 'none', fontFamily: "'Poppins',sans-serif" }}
                              title="Tarifa personalizada (opcional)"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{selectedIds.size} {t('common.selected')}</p>
                    <button onClick={() => handleBulkAssign(role.id)} disabled={assignLoading || selectedIds.size === 0}
                      style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', background: selectedIds.size === 0 ? '#e5e7eb' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: selectedIds.size === 0 ? '#9ca3af' : '#fff', fontSize: '13px', fontWeight: 700, cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                      {assignLoading ? t('roles.associating') : `${t('roles.associate')}${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
                    </button>
                  </div>

                  {assignResult && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: assignResult.startsWith('✅') ? '#15803d' : '#dc2626' }}>{assignResult}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} danger
          onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />
      )}
    </div>
  )
}