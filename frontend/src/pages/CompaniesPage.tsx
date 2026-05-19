import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2, Settings, Users, ChevronDown, ChevronUp, Search, Link2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Company {
  id: number; name: string; slug: string
  contact_email: string; contact_phone: string | null; is_active: boolean
}

interface CompanyConfig {
  weekly_hours_limit: string
  min_shift_hours: string
  shift_start_minutes_before: string
  week_start_day: string
  week_end_day: string
}

interface UserResult { id: number; name: string; email: string; phone: string | null }
interface Member { id: number; name: string; email: string; phone: string | null; profile: string }

const PROFILES = ['admin', 'coordinator', 'employee']

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Panel expandido por empresa
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'users'>('config')

  // Config de turnos
  const [configs, setConfigs] = useState<Record<number, CompanyConfig>>({})
  const [cfgSaving, setCfgSaving] = useState(false)
  const [cfgMsg, setCfgMsg] = useState('')

  // Gestión de usuarios
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<UserResult | null | 'not_found'>()
  const [profileCode, setProfileCode] = useState('employee')
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [userMsg, setUserMsg] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  // Crear nuevo usuario
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const load = () => {
    api.get<Company[]>('/companies').then(r => setCompanies(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/companies', { name, slug, contact_email: email, contact_phone: phone || null })
      setSuccess(t('companies.configurationSaved'))
      setShowForm(false); setName(''); setSlug(''); setEmail(''); setPhone('')
      load()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.errorOccurred')) }
  }

  const toggleActive = async (company: Company) => {
    const endpoint = company.is_active ? 'deactivate' : 'activate'
    await api.patch(`/companies/${company.id}/${endpoint}`)
    load()
  }

  const toggleExpand = async (companyId: number, tab: 'config' | 'users' = 'config') => {
    if (expandedId === companyId && activeTab === tab) {
      setExpandedId(null)
      return
    }
    setExpandedId(companyId)
    setActiveTab(tab)
    setCfgMsg(''); setUserMsg(''); setSearchResult(undefined); setSearchEmail('')
    setMemberSearch(''); setShowCreateUser(false)

    if (tab === 'config' && !configs[companyId]) {
      try {
        const r = await api.get<CompanyConfig>(`/companies/${companyId}/config`)
        if (r.data) setConfigs(prev => ({ ...prev, [companyId]: r.data }))
      } catch { }
    }

    if (tab === 'users') {
      loadMembers(companyId)
    }
  }

  const loadMembers = async (companyId: number) => {
    setMembersLoading(true)
    try {
      const r = await api.get<Member[]>(`/users/companies/${companyId}/members`)
      setMembers(r.data)
    } catch { setMembers([]) }
    finally { setMembersLoading(false) }
  }

  const getConfig = (companyId: number): CompanyConfig =>
    configs[companyId] || { weekly_hours_limit: '40', min_shift_hours: '0', shift_start_minutes_before: '30', week_start_day: 'monday', week_end_day: 'sunday' }

  const updateConfig = (companyId: number, field: keyof CompanyConfig, value: string) => {
    setConfigs(prev => ({ ...prev, [companyId]: { ...getConfig(companyId), [field]: value } }))
  }

  const saveConfig = async (companyId: number) => {
    setCfgSaving(true); setCfgMsg('')
    const cfg = getConfig(companyId)
    try {
      await api.put(`/companies/${companyId}/config`, {
        weekly_hours_limit: parseFloat(cfg.weekly_hours_limit),
        min_shift_hours: parseFloat(cfg.min_shift_hours),
        shift_start_minutes_before: parseInt(cfg.shift_start_minutes_before),
        week_start_day: cfg.week_start_day,
        week_end_day: cfg.week_end_day,
      })
      setCfgMsg('✅ ' + t('companies.configurationSaved'))
    } catch (e: any) { setCfgMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) }
    finally { setCfgSaving(false) }
  }

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserSearchLoading(true); setSearchResult(undefined); setUserMsg(''); setShowCreateUser(false)
    try {
      const r = await api.get<UserResult | null>(`/users/search?email=${encodeURIComponent(searchEmail)}`)
      setSearchResult(r.data ?? 'not_found')
      if (!r.data) setShowCreateUser(true)
    } catch { setUserMsg('❌ ' + t('common.errorOccurred')) }
    finally { setUserSearchLoading(false) }
  }

  const handleAssociate = async (userId: number, companyId: number) => {
    setUserSearchLoading(true); setUserMsg('')
    try {
      await api.post(`/users/companies/${companyId}/members`, { user_id: userId, profile_code: profileCode })
      setUserMsg('✅ ' + t('users.associated'))
      setSearchResult(undefined); setSearchEmail('')
      loadMembers(companyId)
    } catch (e: any) { setUserMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) }
    finally { setUserSearchLoading(false) }
  }

  const handleCreateUser = async (e: React.FormEvent, companyId: number) => {
    e.preventDefault()
    setUserSearchLoading(true); setUserMsg('')
    try {
      const res = await api.post<UserResult>('/users', {
        name: newName, email: newEmail, password: newPassword, phone: newPhone || null
      })
      await api.post(`/users/companies/${companyId}/members`, { user_id: res.data.id, profile_code: profileCode })
      setUserMsg('✅ ' + t('users.associated'))
      setShowCreateUser(false); setSearchResult(undefined); setSearchEmail('')
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewPhone('')
      loadMembers(companyId)
    } catch (e: any) { setUserMsg(`❌ ${e.response?.data?.detail || t('common.errorOccurred')}`) }
    finally { setUserSearchLoading(false) }
  }

  const handleRemoveMember = async (userId: number, companyId: number) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await api.delete(`/users/companies/${companyId}/members/${userId}`)
      loadMembers(companyId)
    } catch { }
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const profileColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    coordinator: 'bg-blue-100 text-blue-700',
    employee: 'bg-emerald-100 text-emerald-700',
    super_admin: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{t('companies.title')}</h2>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {t('companies.newCompany')}
        </Button>
      </div>

      {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">{success}</div>}

      {/* Formulario nueva empresa */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 size={18} />{t('companies.newCompany')}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t('companies.name')} *</Label>
                  <Input value={name} onChange={e => handleNameChange(e.target.value)} required placeholder={t('companies.name')} />
                </div>
                <div className="space-y-1">
                  <Label>{t('companies.slug')} *</Label>
                  <Input value={slug} onChange={e => setSlug(e.target.value)} required placeholder={t('companies.slug')} />
                </div>
                <div className="space-y-1">
                  <Label>{t('companies.email')} *</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t('companies.email')} />
                </div>
                <div className="space-y-1">
                  <Label>{t('companies.phone')}</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('companies.phone')} />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit">{t('common.create')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de empresas */}
      {loading ? <p className="text-slate-500">{t('common.loading')}</p> : (
        <div className="space-y-3">
          {companies.length === 0 && <p className="text-slate-500">{t('common.noData')}</p>}
          {companies.map(company => (
            <Card key={company.id}>
              {/* Cabecera de la empresa */}
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.slug} · {company.contact_email}</p>
                    {company.contact_phone && <p className="text-xs text-slate-400">{company.contact_phone}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge variant={company.is_active ? 'default' : 'secondary'}>
                      {company.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                    {/* Botón configuración */}
                    <Button size="sm" variant="outline" className="gap-1"
                      onClick={() => toggleExpand(company.id, 'config')}>
                      <Settings size={13} />
                      <span className="text-xs">{t('companies.configuration')}</span>
                      {expandedId === company.id && activeTab === 'config'
                        ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </Button>
                    {/* Botón usuarios */}
                    <Button size="sm" variant="outline" className="gap-1"
                      onClick={() => toggleExpand(company.id, 'users')}>
                      <Users size={13} />
                      <span className="text-xs">{t('nav.users')}</span>
                      {expandedId === company.id && activeTab === 'users'
                        ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(company)}>
                      {company.is_active ? t('common.inactive') : t('common.active')}
                    </Button>
                  </div>
                </div>

                {/* Panel expandido */}
                {expandedId === company.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">

                    {/* ── Tab: Configuración de turnos ── */}
                    {activeTab === 'config' && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <Settings size={14} /> {t('companies.configuration')}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t('companies.weeklyHoursLimit')}</Label>
                            <Input
                              type="number" step="0.5" min="1"
                              value={getConfig(company.id).weekly_hours_limit}
                              onChange={e => updateConfig(company.id, 'weekly_hours_limit', e.target.value)}
                            />
                            <p className="text-xs text-slate-400">{t('roles.weeklyConfig')}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t('companies.minShiftHours')}</Label>
                            <Input
                              type="number" step="0.5" min="0"
                              value={getConfig(company.id).min_shift_hours}
                              onChange={e => updateConfig(company.id, 'min_shift_hours', e.target.value)}
                            />
                            <p className="text-xs text-slate-400">0 = {t('common.noData')}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t('companies.shiftStartMinutes')}</Label>
                            <Input
                              type="number" step="1" min="1"
                              value={getConfig(company.id).shift_start_minutes_before}
                              onChange={e => updateConfig(company.id, 'shift_start_minutes_before', e.target.value)}
                            />
                            <p className="text-xs text-slate-400">15, 30, 40, 60...</p>
                          </div>
                        </div>
                        {cfgMsg && <p className="text-xs">{cfgMsg}</p>}
                        <Button size="sm" onClick={() => saveConfig(company.id)} disabled={cfgSaving} className="gap-1">
                          {cfgSaving ? t('common.loading') : t('companies.saveConfiguration')}
                        </Button>
                      </div>
                    )}

                    {/* ── Tab: Usuarios ── */}
                    {activeTab === 'users' && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <Users size={14} /> {t('nav.users')}
                        </p>

                        {/* Buscar y asociar */}
                        <form onSubmit={e => handleSearchUser(e)} className="flex gap-2">
                          <Input
                            value={searchEmail}
                            onChange={e => setSearchEmail(e.target.value)}
                            placeholder={t('users.searchByEmail')}
                            type="email" required className="flex-1"
                          />
                          <Button type="submit" size="sm" disabled={userSearchLoading} className="gap-1">
                            <Search size={13} /> {t('common.search')}
                          </Button>
                        </form>

                        {/* Resultado de búsqueda */}
                        {searchResult && searchResult !== 'not_found' && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                            <p className="text-sm font-medium">{searchResult.name}</p>
                            <p className="text-xs text-slate-500">{searchResult.email}</p>
                            <div className="flex gap-2 items-center">
                              <select value={profileCode} onChange={e => setProfileCode(e.target.value)}
                                className="border rounded px-2 py-1 text-sm">
                                {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <Button size="sm" onClick={() => handleAssociate(searchResult.id, company.id)}
                                disabled={userSearchLoading} className="gap-1">
                                <Link2 size={13} /> {t('users.associate')}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setSearchResult(undefined)}>{t('common.cancel')}</Button>
                            </div>
                          </div>
                        )}

                        {searchResult === 'not_found' && !showCreateUser && (
                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-orange-700 mb-2">{t('users.notFound')}</p>
                            <Button size="sm" onClick={() => { setShowCreateUser(true); setNewEmail(searchEmail) }} className="gap-1">
                              <UserPlus size={13} /> {t('users.createNew')}
                            </Button>
                          </div>
                        )}

                        {showCreateUser && (
                          <form onSubmit={e => handleCreateUser(e, company.id)}
                            className="p-3 bg-slate-50 rounded-lg border space-y-3">
                            <p className="text-sm font-medium">{t('users.createNew')}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1"><Label className="text-xs">{t('users.name')} *</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} required /></div>
                              <div className="space-y-1"><Label className="text-xs">{t('auth.email')} *</Label>
                                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required /></div>
                              <div className="space-y-1"><Label className="text-xs">{t('auth.password')} *</Label>
                                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                              <div className="space-y-1"><Label className="text-xs">{t('users.phone')}</Label>
                                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1..." /></div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <select value={profileCode} onChange={e => setProfileCode(e.target.value)}
                                className="border rounded px-2 py-1 text-sm">
                                {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <Button type="submit" size="sm" disabled={userSearchLoading}>{t('users.createAndAssociate')}</Button>
                              <Button type="button" size="sm" variant="ghost"
                                onClick={() => { setShowCreateUser(false); setSearchResult(undefined) }}>{t('common.cancel')}</Button>
                            </div>
                          </form>
                        )}

                        {userMsg && <p className="text-xs">{userMsg}</p>}

                        {/* Lista de miembros */}
                        <div className="space-y-2">
                          <div className="relative">
                            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                            <Input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                              placeholder={t('common.search')} className="pl-8 h-8 text-xs" />
                          </div>

                          {membersLoading ? (
                            <p className="text-xs text-slate-500">{t('common.loading')}</p>
                          ) : filteredMembers.length === 0 ? (
                            <p className="text-xs text-slate-500">{t('common.noData')}</p>
                          ) : (
                            <div className="max-h-56 overflow-y-auto border rounded-lg divide-y">
                              {filteredMembers.map(m => (
                                <div key={m.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{m.email}</p>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profileColor[m.profile] || 'bg-slate-100 text-slate-600'}`}>
                                      {m.profile}
                                    </span>
                                    <Button size="sm" variant="ghost" className="text-red-500 h-6 px-2 text-xs"
                                      onClick={() => handleRemoveMember(m.id, company.id)}>
                                      {t('common.delete')}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
