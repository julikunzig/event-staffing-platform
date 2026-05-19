import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, UserPlus, Link2, ChevronLeft, ChevronRight, Pencil, X, Check } from 'lucide-react'

interface Member { id: number; name: string; email: string; phone: string | null; profile: string; is_active: boolean }
interface UserResult { id: number; name: string; email: string; phone: string | null; is_active: boolean }

const PROFILES = ['admin', 'coordinator', 'employee']
const PAGE_SIZE = 10

const profileColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  coordinator: 'bg-blue-100 text-blue-700',
  employee: 'bg-emerald-100 text-emerald-700',
  super_admin: 'bg-red-100 text-red-700',
}

export default function UsersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const companyId = user?.company_id

  const profileNames: Record<string, string> = {
    admin: t('roles.admin') || 'Administrador',
    coordinator: t('roles.coordinator') || 'Coordinador',
    employee: t('roles.employee') || 'Empleado',
  }
  const [members, setMembers] = useState<Member[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<UserResult | null | 'not_found'>()
  const [showCreate, setShowCreate] = useState(false)
  const [profileCode, setProfileCode] = useState('employee')

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // Edición de usuario
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editProfile, setEditProfile] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const url = searchQ
        ? `/users/companies/${companyId}/members?q=${encodeURIComponent(searchQ)}`
        : `/users/companies/${companyId}/members`
      const res = await api.get<Member[]>(url)
      setMembers(res.data)
      setPage(1)
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }, [companyId, searchQ])

  useEffect(() => { loadMembers() }, [loadMembers])

  const totalPages = Math.ceil(members.length / PAGE_SIZE)
  const paginated = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSearchResult(undefined); setShowCreate(false)
    setActionLoading(true)
    try {
      const res = await api.get<UserResult | null>(`/users/search?email=${encodeURIComponent(searchEmail)}`)
      setSearchResult(res.data ?? 'not_found')
      if (!res.data) setShowCreate(true)
    } catch { setError(t('forms.errorLoadingUsers')) }
    finally { setActionLoading(false) }
  }

  const handleAssociate = async (userId: number) => {
    setError(''); setActionLoading(true)
    try {
      await api.post(`/users/companies/${companyId}/members`, { user_id: userId, profile_code: profileCode })
      setSuccess(t('forms.userAssociated'))
      setSearchResult(undefined); setSearchEmail('')
      loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setActionLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setActionLoading(true)
    try {
      const res = await api.post<UserResult>('/users', {
        name: newName, email: newEmail, password: newPassword, phone: newPhone || null
      })
      await api.post(`/users/companies/${companyId}/members`, { user_id: res.data.id, profile_code: profileCode })
      setSuccess(t('forms.userAssociated'))
      setShowCreate(false); setSearchResult(undefined); setSearchEmail('')
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewPhone('')
      loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setActionLoading(false) }
  }

  const handleRemove = async (userId: number) => {
    if (!confirm(t('forms.confirmRemoveUser'))) return
    setActionLoading(true)
    try {
      await api.delete(`/users/companies/${companyId}/members/${userId}`)
      setSuccess(t('forms.userRemoved'))
      loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setActionLoading(false) }
  }

  const startEdit = (member: Member) => {
    setEditingId(member.id)
    setEditName(member.name)
    setEditPhone(member.phone || '')
    setEditProfile(member.profile)
    setError(''); setSuccess('')
  }

  const cancelEdit = () => { setEditingId(null) }

  const handleSaveEdit = async (member: Member) => {
    setActionLoading(true); setError('')
    try {
      // Actualizar datos del usuario
      await api.patch(`/users/${member.id}`, {
        name: editName || undefined,
        phone: editPhone || null,
      })
      // Actualizar rol si cambió
      if (editProfile !== member.profile) {
        await api.patch(`/users/companies/${companyId}/members/${member.id}/role`, {
          profile_code: editProfile
        })
      }
      setSuccess(t('forms.userUpdated'))
      setEditingId(null)
      loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setActionLoading(false) }
  }

  // Editar usuario desde resultado de búsqueda
  const [editingSearch, setEditingSearch] = useState(false)
  const [editSearchName, setEditSearchName] = useState('')
  const [editSearchPhone, setEditSearchPhone] = useState('')

  const handleSaveSearchEdit = async (userId: number) => {
    setActionLoading(true); setError('')
    try {
      const res = await api.patch<UserResult>(`/users/${userId}`, {
        name: editSearchName || undefined,
        phone: editSearchPhone || null,
      })
      setSearchResult(res.data)
      setEditingSearch(false)
      setSuccess(t('forms.userUpdated'))
      loadMembers()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setActionLoading(false) }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{t('users.title')}</h2>

      {/* Buscar y asociar */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus size={16} />{t('forms.addUser')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
              placeholder={t('forms.searchByEmail')} type="email" required className="flex-1" />
            <Button type="submit" disabled={actionLoading} className="gap-2">
              <Search size={14} /> {t('common.search')}
            </Button>
          </form>

          {searchResult && searchResult !== 'not_found' && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
              {!editingSearch ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{searchResult.name}</p>
                      <p className="text-sm text-gray-500">{searchResult.email}</p>
                      {searchResult.phone && <p className="text-sm text-gray-500">{searchResult.phone}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="gap-1"
                      onClick={() => { setEditingSearch(true); setEditSearchName(searchResult.name); setEditSearchPhone(searchResult.phone || '') }}>
                      <Pencil size={12} /> {t('common.edit')}
                    </Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={profileCode} onChange={e => setProfileCode(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm">
                      {PROFILES.map(p => (
                        <option key={p} value={p}>{profileNames[p]}</option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => handleAssociate(searchResult.id)} disabled={actionLoading} className="gap-1">
                      <Link2 size={14} /> {t('forms.associateUser')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSearchResult(undefined)}>{t('common.cancel')}</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('common.edit')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">{t('forms.fullName')}</Label><Input value={editSearchName} onChange={e => setEditSearchName(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('forms.phone')}</Label><Input value={editSearchPhone} onChange={e => setEditSearchPhone(e.target.value)} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveSearchEdit(searchResult.id)} disabled={actionLoading} className="gap-1"><Check size={12} /> {t('common.save')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSearch(false)}>{t('common.cancel')}</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {searchResult === 'not_found' && !showCreate && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 mb-2">{t('forms.userNotFound')}</p>
              <Button size="sm" onClick={() => { setShowCreate(true); setNewEmail(searchEmail) }} className="gap-1">
                <UserPlus size={14} /> {t('forms.createNewUser')}
              </Button>
            </div>
          )}

          {showCreate && (
            <form onSubmit={handleCreate} className="space-y-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium">{t('forms.createNewUser')}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>{t('forms.fullName')} *</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t('auth.email')} *</Label><Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t('auth.password')} *</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t('forms.phone')}</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1234567890" /></div>
              </div>
              <div className="flex gap-2 items-center">
                <select value={profileCode} onChange={e => setProfileCode(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm">
                  {PROFILES.map(p => (
                    <option key={p} value={p}>{profileNames[p]}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" disabled={actionLoading}>{t('forms.createAndAssociate')}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setShowCreate(false); setSearchResult(undefined) }}>{t('common.cancel')}</Button>
              </div>
            </form>
          )}

          {success && <p className="text-sm text-green-600">{success}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('forms.companyUsers')} ({members.length})</CardTitle>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <Input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder={t('forms.filterByName')} className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-sm">{t('common.loading')}</p>
          ) : paginated.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('forms.noUsers')}{searchQ ? ` ${t('forms.noUsersMatching')}` : ''}.</p>
          ) : (
            <div className="space-y-2">
              {paginated.map(member => (
                <div key={member.id} className="border rounded-lg overflow-hidden">
                  {editingId === member.id ? (
                    /* Formulario de edición inline */
                    <div className="p-3 bg-yellow-50 space-y-3">
                      <p className="text-sm font-medium text-gray-700">{t('forms.editingUser')}: {member.email}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><Label className="text-xs">{t('forms.fullName')}</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">{t('forms.phone')}</Label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-xs">{t('forms.role')}:</Label>
                        <select value={editProfile} onChange={e => setEditProfile(e.target.value)}
                          className="border rounded-md px-2 py-1 text-sm">
                          {PROFILES.map(p => (
                            <option key={p} value={p}>{profileNames[p]}</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={() => handleSaveEdit(member)} disabled={actionLoading} className="gap-1 ml-auto">
                          <Check size={12} /> {t('common.save')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}><X size={12} /></Button>
                      </div>
                    </div>
                  ) : (
                    /* Vista normal */
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profileColor[member.profile] || 'bg-gray-100 text-gray-600'}`}>
                          {profileNames[member.profile] || member.profile}
                        </span>
                        <Button size="sm" variant="outline" className="h-7 px-2 gap-1"
                          onClick={() => startEdit(member)}>
                          <Pencil size={12} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2"
                          onClick={() => handleRemove(member.id)} disabled={actionLoading}>
                          {t('forms.removeUser')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <p className="text-xs text-gray-500">{t('common.loading')} {page} de {totalPages} · {members.length} {t('users.title')}</p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1} className="h-7 w-7 p-0"><ChevronLeft size={14} /></Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <Button key={pageNum} size="sm"
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                      className="h-7 w-7 p-0 text-xs">{pageNum}</Button>
                  )
                })}
                <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages} className="h-7 w-7 p-0"><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
