import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, Building2, Settings, Users, ChevronDown, ChevronUp, Search, Link2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '@/pages/ConfirmDialog'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 5px', display: 'block',
}

interface Company { id: number; name: string; slug: string; contact_email: string; contact_phone: string | null; is_active: boolean }
interface CompanyConfig { weekly_hours_limit: string; min_shift_hours: string; shift_start_minutes_before: string; week_start_day: string; week_end_day: string }
interface UserResult { id: number; name: string; email: string; phone: string | null }
interface Member { id: number; name: string; email: string; phone: string | null; profile: string }

const PROFILES = ['admin', 'coordinator', 'employee']
const profileStyle: Record<string, { bg: string; color: string }> = {
  admin:       { bg: '#faf5ff', color: '#7c3aed' },
  coordinator: { bg: '#eff6ff', color: '#1d4ed8' },
  employee:    { bg: '#f0fdf4', color: '#15803d' },
}

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [companies, setCompanies]   = useState<Company[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [name, setName]             = useState('')
  const [slug, setSlug]             = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeTab, setActiveTab]   = useState<'config' | 'users'>('config')
  const [configs, setConfigs]       = useState<Record<number, CompanyConfig>>({})
  const [cfgSaving, setCfgSaving]   = useState(false)
  const [cfgMsg, setCfgMsg]         = useState('')
  const [members, setMembers]       = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [searchEmail, setSearchEmail]   = useState('')
  const [searchResult, setSearchResult] = useState<UserResult | null | 'not_found'>()
  const [profileCode, setProfileCode]   = useState('employee')
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [userMsg, setUserMsg]           = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPwd, setNewPwd]     = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  const load = () => api.get<Company[]>('/companies').then(r => setCompanies(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleNameChange = (val: string) => { setName(val); setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await api.post('/companies', { name, slug, contact_email: email, contact_phone: phone || null })
      setSuccess(t('companies.configurationSaved')); setShowForm(false); setName(''); setSlug(''); setEmail(''); setPhone(''); load()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.errorOccurred')) }
  }

  const toggleActive = async (company: Company) => {
    await api.patch(`/companies/${company.id}/${company.is_active ? 'deactivate' : 'activate'}`); load()
  }

  const toggleExpand = async (companyId: number, tab: 'config' | 'users') => {
    if (expandedId === companyId && activeTab === tab) { setExpandedId(null); return }
    setExpandedId(companyId); setActiveTab(tab); setCfgMsg(''); setUserMsg(''); setSearchResult(undefined); setSearchEmail(''); setMemberSearch(''); setShowCreateUser(false)
    if (tab === 'config' && !configs[companyId]) {
      try { const r = await api.get<CompanyConfig>(`/companies/${companyId}/config`); if (r.data) setConfigs(prev => ({ ...prev, [companyId]: r.data })) } catch { }
    }
    if (tab === 'users') loadMembers(companyId)
  }

  const loadMembers = async (cid: number) => {
    setMembersLoading(true)
    try { const r = await api.get<Member[]>(`/users/companies/${cid}/members`); setMembers(r.data) }
    catch { setMembers([]) } finally { setMembersLoading(false) }
  }

  const getConfig = (cid: number): CompanyConfig => configs[cid] || { weekly_hours_limit: '40', min_shift_hours: '0', shift_start_minutes_before: '30', week_start_day: 'monday', week_end_day: 'sunday' }
  const updateConfig = (cid: number, field: keyof CompanyConfig, value: string) => setConfigs(prev => ({ ...prev, [cid]: { ...getConfig(cid), [field]: value } }))

  const saveConfig = async (cid: number) => {
    setCfgSaving(true); setCfgMsg('')
    const cfg = getConfig(cid)
    try {
      await api.put(`/companies/${cid}/config`, { weekly_hours_limit: parseFloat(cfg.weekly_hours_limit), min_shift_hours: parseFloat(cfg.min_shift_hours), shift_start_minutes_before: parseInt(cfg.shift_start_minutes_before), week_start_day: cfg.week_start_day, week_end_day: cfg.week_end_day })
      setCfgMsg('✅ ' + t('companies.configurationSaved'))
    } catch (e: any) { setCfgMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) }
    finally { setCfgSaving(false) }
  }

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault(); setUserSearchLoading(true); setSearchResult(undefined); setUserMsg(''); setShowCreateUser(false)
    try { const r = await api.get<UserResult | null>(`/users/search?email=${encodeURIComponent(searchEmail)}`); setSearchResult(r.data ?? 'not_found'); if (!r.data) setShowCreateUser(true) }
    catch { setUserMsg('❌ ' + t('common.errorOccurred')) } finally { setUserSearchLoading(false) }
  }

  const handleAssociate = async (userId: number, cid: number) => {
    setUserSearchLoading(true); setUserMsg('')
    try { await api.post(`/users/companies/${cid}/members`, { user_id: userId, profile_code: profileCode }); setUserMsg('✅ ' + t('users.associated')); setSearchResult(undefined); setSearchEmail(''); loadMembers(cid) }
    catch (e: any) { setUserMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) } finally { setUserSearchLoading(false) }
  }

  const handleCreateUser = async (e: React.FormEvent, cid: number) => {
    e.preventDefault(); setUserSearchLoading(true); setUserMsg('')
    try {
      const res = await api.post<UserResult>('/users', { name: newName, email: newEmail, password: newPwd, phone: newPhone || null })
      await api.post(`/users/companies/${cid}/members`, { user_id: res.data.id, profile_code: profileCode })
      setUserMsg('✅ ' + t('users.associated')); setShowCreateUser(false); setSearchResult(undefined); setSearchEmail('')
      setNewName(''); setNewEmail(''); setNewPwd(''); setNewPhone(''); loadMembers(cid)
    } catch (e: any) { setUserMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) } finally { setUserSearchLoading(false) }
  }

  const handleRemoveMember = (userId: number, cid: number, memberName: string) => {
    setConfirmDialog({
      title: '¿Desasociar usuario?', message: `${memberName} será removido de la empresa.`,
      onConfirm: async () => { setConfirmDialog(null); await api.delete(`/users/companies/${cid}/members/${userId}`); loadMembers(cid) }
    })
  }

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase()))

  const TabBtn = ({ tab: tb, cid, label, icon }: { tab: 'config'|'users'; cid: number; label: string; icon: React.ReactNode }) => (
    <button onClick={() => toggleExpand(cid, tb)}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: expandedId === cid && activeTab === tb ? '#f0fdf4' : '#fff', color: expandedId === cid && activeTab === tb ? GREEN : '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
      {icon}<span>{label}</span>{expandedId === cid && activeTab === tb ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </button>
  )

  return (
    <div style={{ maxWidth: '900px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('companies.title')}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{companies.length} empresas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.25)' }}>
          <Plus size={15} />{t('companies.newCompany')}
        </button>
      </div>

      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '14px' }}>✓ {success}</div>}

      {/* Formulario nueva empresa */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={14} color={GREEN} /><p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('companies.newCompany')}</p>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div><label style={labelStyle}>{t('companies.name')} *</label><input value={name} onChange={e => handleNameChange(e.target.value)} required style={fieldStyle} /></div>
              <div><label style={labelStyle}>{t('companies.slug')} *</label><input value={slug} onChange={e => setSlug(e.target.value)} required style={fieldStyle} /></div>
              <div><label style={labelStyle}>{t('companies.email')} *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={fieldStyle} /></div>
              <div><label style={labelStyle}>{t('companies.phone')}</label><input value={phone} onChange={e => setPhone(e.target.value)} style={fieldStyle} /></div>
            </div>
            {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.create')}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {companies.map(company => (
            <div key={company.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Header empresa */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: company.is_active ? '#f0fdf4' : '#f3f4f6', border: `1px solid ${company.is_active ? '#bbf7d0' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} color={company.is_active ? GREEN : '#9ca3af'} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{company.name}</p>
                    <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#9ca3af' }}>{company.slug} · {company.contact_email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', background: company.is_active ? '#f0fdf4' : '#f3f4f6', color: company.is_active ? GREEN : '#9ca3af', border: `1px solid ${company.is_active ? '#bbf7d0' : '#e5e7eb'}` }}>
                    {company.is_active ? t('common.active') : t('common.inactive')}
                  </span>
                  <TabBtn tab="config" cid={company.id} label={t('companies.configuration')} icon={<Settings size={12} />} />
                  <TabBtn tab="users" cid={company.id} label={t('nav.users')} icon={<Users size={12} />} />
                  <button onClick={() => toggleActive(company)}
                    style={{ padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                    {company.is_active ? t('common.inactive') : t('common.active')}
                  </button>
                </div>
              </div>

              {/* Panel expandido */}
              {expandedId === company.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px', background: '#fafafa' }}>

                  {/* Config */}
                  {activeTab === 'config' && (
                    <div>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}><Settings size={13} color={GREEN} />{t('companies.configuration')}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        {[
                          { label: t('companies.weeklyHoursLimit'), field: 'weekly_hours_limit' as const },
                          { label: t('companies.minShiftHours'),    field: 'min_shift_hours' as const },
                          { label: t('companies.shiftStartMinutes'),field: 'shift_start_minutes_before' as const },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label style={labelStyle}>{label}</label>
                            <input type="number" step="0.5" min="0" value={getConfig(company.id)[field]} onChange={e => updateConfig(company.id, field, e.target.value)} style={fieldStyle} />
                          </div>
                        ))}
                      </div>
                      {cfgMsg && <p style={{ margin: '0 0 10px', fontSize: '12px', color: cfgMsg.startsWith('✅') ? '#15803d' : '#dc2626' }}>{cfgMsg}</p>}
                      <button onClick={() => saveConfig(company.id)} disabled={cfgSaving}
                        style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                        {cfgSaving ? t('common.loading') : t('companies.saveConfiguration')}
                      </button>
                    </div>
                  )}

                  {/* Usuarios */}
                  {activeTab === 'users' && (
                    <div>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={13} color={GREEN} />{t('nav.users')}</p>

                      {/* Buscar */}
                      <form onSubmit={handleSearchUser} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)} placeholder={t('users.searchByEmail')} type="email" required style={{ ...fieldStyle, flex: 1 }} />
                        <button type="submit" disabled={userSearchLoading}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                          <Search size={13} />{t('common.search')}
                        </button>
                      </form>

                      {searchResult && searchResult !== 'not_found' && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px', color: '#111827' }}>{searchResult.name}</p>
                          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}>{searchResult.email}</p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select value={profileCode} onChange={e => setProfileCode(e.target.value)} style={{ ...fieldStyle, width: 'auto', height: '34px' }}>
                              {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button onClick={() => handleAssociate(searchResult.id, company.id)} disabled={userSearchLoading}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                              <Link2 size={13} />{t('users.associate')}
                            </button>
                            <button onClick={() => setSearchResult(undefined)} style={{ padding: '6px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.cancel')}</button>
                          </div>
                        </div>
                      )}

                      {searchResult === 'not_found' && !showCreateUser && (
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#c2410c' }}>{t('users.notFound')}</p>
                          <button onClick={() => { setShowCreateUser(true); setNewEmail(searchEmail) }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                            <UserPlus size={13} />{t('users.createNew')}
                          </button>
                        </div>
                      )}

                      {showCreateUser && (
                        <form onSubmit={e => handleCreateUser(e, company.id)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                          <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>{t('users.createNew')}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div><label style={labelStyle}>{t('users.name')} *</label><input value={newName} onChange={e => setNewName(e.target.value)} required style={fieldStyle} /></div>
                            <div><label style={labelStyle}>{t('auth.email')} *</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={fieldStyle} /></div>
                            <div><label style={labelStyle}>{t('auth.password')} *</label><input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required style={fieldStyle} /></div>
                            <div><label style={labelStyle}>{t('users.phone')}</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1..." style={fieldStyle} /></div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select value={profileCode} onChange={e => setProfileCode(e.target.value)} style={{ ...fieldStyle, width: 'auto', height: '34px' }}>
                              {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button type="submit" disabled={userSearchLoading} style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('users.createAndAssociate')}</button>
                            <button type="button" onClick={() => { setShowCreateUser(false); setSearchResult(undefined) }} style={{ padding: '6px 10px', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.cancel')}</button>
                          </div>
                        </form>
                      )}

                      {userMsg && <p style={{ fontSize: '12px', color: userMsg.startsWith('✅') ? '#15803d' : '#dc2626', marginBottom: '8px' }}>{userMsg}</p>}

                      {/* Lista miembros */}
                      <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder={t('common.search')} style={{ ...fieldStyle, height: '36px', paddingLeft: '30px' }} />
                      </div>

                      {membersLoading ? <p style={{ fontSize: '12px', color: '#9ca3af' }}>{t('common.loading')}</p> : filteredMembers.length === 0 ? <p style={{ fontSize: '12px', color: '#9ca3af' }}>{t('common.noData')}</p> : (
                        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                          {filteredMembers.map((m, idx) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: idx < filteredMembers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                {(() => { const ps = profileStyle[m.profile] || { bg: '#f3f4f6', color: '#6b7280' }; return <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '999px', background: ps.bg, color: ps.color }}>{m.profile}</span> })()}
                                <button onClick={() => handleRemoveMember(m.id, company.id, m.name)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.delete')}</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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