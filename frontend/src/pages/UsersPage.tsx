import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Search, UserPlus, Link2, ChevronLeft, ChevronRight, Pencil, X, Check, Users } from 'lucide-react'
import ConfirmDialog from '@/pages/ConfirmDialog'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

interface Member { id: number; name: string; email: string; phone: string | null; profile: string; is_active: boolean }
interface UserResult { id: number; name: string; email: string; phone: string | null; is_active: boolean }

const PROFILES = ['admin', 'coordinator', 'employee']
const PAGE_SIZE = 10

const profileStyle: Record<string, { bg: string; color: string; border: string }> = {
  admin:       { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  coordinator: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  employee:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  super_admin: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}

const sectionTitle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 6px',
}

export default function UsersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const companyId = user?.company_id

  const profileNames: Record<string, string> = {
    admin:       t('roles.admin')       || 'Administrador',
    coordinator: t('roles.coordinator') || 'Coordinador',
    employee:    t('roles.employee')    || 'Empleado',
  }

  const [members, setMembers]           = useState<Member[]>([])
  const [searchQ, setSearchQ]           = useState('')
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(true)
  const [searchEmail, setSearchEmail]   = useState('')
  const [searchResult, setSearchResult] = useState<UserResult | null | 'not_found'>()
  const [showCreate, setShowCreate]     = useState(false)
  const [profileCode, setProfileCode]   = useState('employee')
  const [newName, setNewName]           = useState('')
  const [newEmail, setNewEmail]         = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [newPhone, setNewPhone]         = useState('')
  const [editingId, setEditingId]       = useState<number | null>(null)
  const [editName, setEditName]         = useState('')
  const [editPhone, setEditPhone]       = useState('')
  const [editProfile, setEditProfile]   = useState('')
  const [editRates, setEditRates]       = useState<{id: number; role_name: string; base_rate: number; hourly_rate_override: number | null}[]>([])
  const [editingSearch, setEditingSearch]     = useState(false)
  const [editSearchName, setEditSearchName]   = useState('')
  const [editSearchPhone, setEditSearchPhone] = useState('')
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const url = searchQ
        ? `/users/companies/${companyId}/members?q=${encodeURIComponent(searchQ)}`
        : `/users/companies/${companyId}/members`
      const res = await api.get<Member[]>(url)
      setMembers(res.data); setPage(1)
    } catch { setMembers([]) } finally { setLoading(false) }
  }, [companyId, searchQ])

  useEffect(() => { loadMembers() }, [loadMembers])

  const totalPages = Math.ceil(members.length / PAGE_SIZE)
  const paginated  = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setSearchResult(undefined); setShowCreate(false); setActionLoading(true)
    try {
      const res = await api.get<UserResult | null>(`/users/search?q=${encodeURIComponent(searchEmail)}`)
      setSearchResult(res.data ?? 'not_found')
      if (!res.data) setShowCreate(true)
    } catch { setError(t('forms.errorLoadingUsers')) } finally { setActionLoading(false) }
  }

  const handleAssociate = async (userId: number) => {
    setError(''); setActionLoading(true)
    try {
      await api.post(`/users/companies/${companyId}/members`, { user_id: userId, profile_code: profileCode })
      setSuccess(t('forms.userAssociated')); setSearchResult(undefined); setSearchEmail(''); loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) } finally { setActionLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setActionLoading(true)
    try {
      const res = await api.post<UserResult>('/users', { name: newName, email: newEmail, password: newPassword, phone: newPhone || null })
      await api.post(`/users/companies/${companyId}/members`, { user_id: res.data.id, profile_code: profileCode })
      setSuccess(t('forms.userAssociated')); setShowCreate(false); setSearchResult(undefined); setSearchEmail('')
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewPhone(''); loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) } finally { setActionLoading(false) }
  }

  const handleRemove = (userId: number, name: string) => {
    setConfirmDialog({
      title: t('forms.confirmRemoveUser') || '¿Desasociar usuario?',
      message: `${name} será removido de la empresa.`,
      onConfirm: async () => {
        setConfirmDialog(null); setActionLoading(true)
        try { await api.delete(`/users/companies/${companyId}/members/${userId}`); setSuccess(t('forms.userRemoved')); loadMembers() }
        catch (e: any) { setError(e.response?.data?.detail || t('common.error')) } finally { setActionLoading(false) }
      }
    })
  }

  const handleSaveEdit = async (member: Member) => {
    setActionLoading(true); setError('')
    try {
      await api.patch(`/users/${member.id}`, { name: editName || undefined, phone: editPhone || null })
      if (editProfile !== member.profile) await api.patch(`/users/companies/${companyId}/members/${member.id}/role`, { profile_code: editProfile })
      // Save rate overrides
      if (editRates.length > 0) {
        await api.patch(`/users/${member.id}/rates`, {
          rates: editRates.map(r => ({ id: r.id, hourly_rate_override: r.hourly_rate_override }))
        })
      }
      setSuccess(t('forms.userUpdated')); setEditingId(null); loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) } finally { setActionLoading(false) }
  }

  const handleSaveSearchEdit = async (userId: number) => {
    setActionLoading(true); setError('')
    try {
      const res = await api.patch<UserResult>(`/users/${userId}`, { name: editSearchName || undefined, phone: editSearchPhone || null })
      setSearchResult(res.data); setEditingSearch(false); setSuccess(t('forms.userUpdated')); loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) } finally { setActionLoading(false) }
  }

  const Btn = ({ onClick, children, danger = false, outline = false, disabled = false, small = false }: any) => (
    <button onClick={onClick} disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: small ? '5px 12px' : '8px 16px', borderRadius: '8px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px', fontWeight: 700, fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
        background: danger ? '#fef2f2' : outline ? '#fff' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`,
        color: danger ? '#dc2626' : outline ? '#374151' : '#fff',
        border: danger ? '1px solid #fecaca' : outline ? '1.5px solid #e5e7eb' : 'none',
        boxShadow: (!danger && !outline) ? '0 2px 6px rgba(45,184,75,0.2)' : 'none',
      }}>
      {children}
    </button>
  )

  return (
    <div style={{ maxWidth: '900px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('users.title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{members.length} usuarios en la empresa</p>
        </div>
      </div>

      {/* Mensajes */}
      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '12px' }}>✓ {success}</div>}
      {error   && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}

      {/* ── Buscar y asociar ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <UserPlus size={15} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.addUser')}</p>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                placeholder={t('forms.searchByEmail') + ' / ' + t('forms.fullName') + ' / ' + t('forms.phone')} type="text" required
                style={{ ...fieldStyle, paddingLeft: '32px' }} />
            </div>
            <Btn disabled={actionLoading}><Search size={13} />{t('common.search')}</Btn>
          </form>

          {/* Resultado encontrado */}
          {searchResult && searchResult !== 'not_found' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
              {!editingSearch ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '13.5px', color: '#111827' }}>{searchResult.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{searchResult.email}</p>
                      {searchResult.phone && <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#6b7280' }}>{searchResult.phone}</p>}
                    </div>
                    <Btn outline small onClick={() => { setEditingSearch(true); setEditSearchName(searchResult.name); setEditSearchPhone(searchResult.phone || '') }}>
                      <Pencil size={12} />{t('common.edit')}
                    </Btn>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={profileCode} onChange={e => setProfileCode(e.target.value)}
                      style={{ ...fieldStyle, width: 'auto', paddingRight: '28px' }}>
                      {PROFILES.map(p => <option key={p} value={p}>{profileNames[p]}</option>)}
                    </select>
                    <Btn small disabled={actionLoading} onClick={() => handleAssociate(searchResult.id)}><Link2 size={13} />{t('forms.associateUser')}</Btn>
                    <Btn outline small onClick={() => setSearchResult(undefined)}>{t('common.cancel')}</Btn>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#374151' }}>{t('common.edit')}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><p style={sectionTitle}>{t('forms.fullName')}</p><input value={editSearchName} onChange={e => setEditSearchName(e.target.value)} style={fieldStyle} /></div>
                    <div><p style={sectionTitle}>{t('forms.phone')}</p><input value={editSearchPhone} onChange={e => setEditSearchPhone(e.target.value)} style={fieldStyle} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Btn small disabled={actionLoading} onClick={() => handleSaveSearchEdit(searchResult.id)}><Check size={12} />{t('common.save')}</Btn>
                    <Btn outline small onClick={() => setEditingSearch(false)}>{t('common.cancel')}</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No encontrado */}
          {searchResult === 'not_found' && !showCreate && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#c2410c' }}>{t('forms.userNotFound')}</p>
              <Btn small onClick={() => { setShowCreate(true); setNewEmail(searchEmail) }}>
                <UserPlus size={13} />{t('forms.createNewUser')}
              </Btn>
            </div>
          )}

          {/* Crear nuevo */}
          {showCreate && (
            <form onSubmit={handleCreate} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.createNewUser')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div><p style={sectionTitle}>{t('forms.fullName')} *</p><input value={newName} onChange={e => setNewName(e.target.value)} required style={fieldStyle} /></div>
                <div><p style={sectionTitle}>{t('auth.email')} *</p><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={fieldStyle} /></div>
                <div><p style={sectionTitle}>{t('auth.password')} *</p><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={fieldStyle} /></div>
                <div><p style={sectionTitle}>{t('forms.phone')}</p><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1234567890" style={fieldStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={profileCode} onChange={e => setProfileCode(e.target.value)} style={{ ...fieldStyle, width: 'auto' }}>
                  {PROFILES.map(p => <option key={p} value={p}>{profileNames[p]}</option>)}
                </select>
                <Btn small disabled={actionLoading}>{t('forms.createAndAssociate')}</Btn>
                <Btn outline small onClick={() => { setShowCreate(false); setSearchResult(undefined) }}>{t('common.cancel')}</Btn>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Lista de usuarios ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={15} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.companyUsers')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({members.length})</span></p>
          </div>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t('forms.filterByName')}
              style={{ ...fieldStyle, height: '36px', paddingLeft: '30px' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>{t('forms.noUsers')}</div>
        ) : (
          <div>
            {paginated.map((member, idx) => (
              <div key={member.id} style={{ borderBottom: idx < paginated.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                {editingId === member.id ? (
                  <div style={{ padding: '14px 20px', background: '#fffbeb' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>{t('forms.editingUser')}: <strong>{member.email}</strong></p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div><p style={sectionTitle}>{t('forms.fullName')}</p><input value={editName} onChange={e => setEditName(e.target.value)} style={fieldStyle} /></div>
                      <div><p style={sectionTitle}>{t('forms.phone')}</p><input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={fieldStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <p style={{ ...sectionTitle, margin: 0 }}>{t('forms.role')}:</p>
                      <select value={editProfile} onChange={e => setEditProfile(e.target.value)} style={{ ...fieldStyle, width: 'auto', height: '34px' }}>
                        {PROFILES.map(p => <option key={p} value={p}>{profileNames[p]}</option>)}
                      </select>
                      <Btn small disabled={actionLoading} onClick={() => handleSaveEdit(member)}><Check size={12} />{t('common.save')}</Btn>
                      <Btn outline small onClick={() => setEditingId(null)}><X size={12} /></Btn>
                    </div>
                    {/* Tarifas por rol */}
                    {editRates.length > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <p style={{ ...sectionTitle, marginBottom: '8px' }}>{t('forms.hourlyRate')} ({t('common.optional')})</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {editRates.map((rate, i) => (
                            <div key={rate.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#374151', minWidth: '100px' }}>{rate.role_name}</span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>(${rate.base_rate}/h)</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={`${rate.base_rate}`}
                                value={rate.hourly_rate_override ?? ''}
                                onChange={e => {
                                  const val = e.target.value ? parseFloat(e.target.value) : null
                                  setEditRates(prev => prev.map((r, idx) => idx === i ? { ...r, hourly_rate_override: val } : r))
                                }}
                                style={{ ...fieldStyle, width: '100px', height: '30px', fontSize: '12px' }}
                              />
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>$/h</span>
                            </div>
                          ))}
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#9ca3af' }}>
                          Dejar vacío para usar la tarifa base del rol
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', gap: '12px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '13.5px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.email}{member.phone ? ` · ${member.phone}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {(() => { const ps = profileStyle[member.profile] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }; return (
                        <span style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px' }}>
                          {profileNames[member.profile] || member.profile}
                        </span>
                      )})()}
                      <button onClick={async () => { setEditingId(member.id); setEditName(member.name); setEditPhone(member.phone || ''); setEditProfile(member.profile); setError(''); setSuccess(''); try { const r = await api.get(`/users/${member.id}/rates`); setEditRates(r.data) } catch { setEditRates([]) } }}
                        style={{ padding: '5px 8px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleRemove(member.id, member.name)}
                        style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                        {t('forms.removeUser')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Página {page} de {totalPages} · {members.length} usuarios</p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.5 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={n} onClick={() => setPage(n)}
                    style={{ width: '30px', height: '30px', borderRadius: '7px', border: 'none', background: page === n ? `linear-gradient(135deg,${GREEN_DARK},${GREEN})` : '#fff', border: page === n ? 'none' : '1.5px solid #e5e7eb', color: page === n ? '#fff' : '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.5 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDialog && (
        <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} danger
          onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />
      )}
    </div>
  )
}