import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Users, ChevronDown, ChevronUp, Search } from 'lucide-react'

interface JobRole { id: number; name: string; hourly_rate: string; is_active: boolean }
interface Member { id: number; name: string; email: string; phone: string | null; profile: string }

export default function JobRolesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [roles, setRoles] = useState<JobRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [error, setError] = useState('')

  // Asignación masiva
  const [expandedRole, setExpandedRole] = useState<number | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [searchFilter, setSearchFilter] = useState('')
  const [assignResult, setAssignResult] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

  const load = () => api.get<JobRole[]>('/job-roles').then(r => setRoles(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      if (editId) {
        await api.patch(`/job-roles/${editId}`, { name, hourly_rate: parseFloat(rate) })
      } else {
        await api.post('/job-roles', { name, hourly_rate: parseFloat(rate) })
      }
      setShowForm(false); setEditId(null); setName(''); setRate('')
      load()
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
  }

  const handleEdit = (role: JobRole) => {
    setEditId(role.id); setName(role.name); setRate(role.hourly_rate); setShowForm(true)
  }

  const handleDeactivate = async (id: number) => {
    await api.delete(`/job-roles/${id}/deactivate`); load()
  }

  const toggleExpand = async (roleId: number) => {
    if (expandedRole === roleId) {
      setExpandedRole(null); return
    }
    setExpandedRole(roleId)
    setSelectedIds(new Set())
    setAssignResult('')
    setSearchFilter('')
    setMembersLoading(true)
    try {
      const [membersRes, withRolesRes] = await Promise.all([
        api.get<Member[]>(`/users/companies/${user?.company_id}/members`),
        api.get<{id: number; roles: {id: number}[]}[]>('/job-roles/employees-with-roles'),
      ])
      setMembers(membersRes.data.filter(m => m.profile === 'employee'))
      // Pre-seleccionar los que ya tienen este rol
      const alreadyHave = new Set(
        withRolesRes.data
          .filter(e => e.roles.some(r => r.id === roleId))
          .map(e => e.id)
      )
      setSelectedIds(alreadyHave as Set<number>)
    } catch { setMembers([]) }
    finally { setMembersLoading(false) }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = (filtered: Member[]) => {
    const next = new Set(selectedIds)
    filtered.forEach(m => next.add(m.id))
    setSelectedIds(next)
  }

  const clearAll = () => setSelectedIds(new Set())

  const handleBulkAssign = async (roleId: number) => {
    if (selectedIds.size === 0) return
    setAssignLoading(true); setAssignResult('')
    const payload = { user_ids: Array.from(selectedIds) }
    console.log('Sending bulk assign:', JSON.stringify(payload))
    try {
      const res = await api.post(`/job-roles/bulk-assign/${roleId}`, payload)
      const data = res.data as { assigned: number[]; skipped: number[] }
      setAssignResult(`✅ ${data.assigned.length} ${t('forms.associate')}${data.skipped.length > 0 ? `, ${data.skipped.length} ${t('forms.selectRoleForRow')}` : ''}`)
      setSelectedIds(new Set())
    } catch (e: any) {
      setAssignResult(`❌ ${e.response?.data?.detail?.[0]?.msg || e.response?.data?.detail || JSON.stringify(e.response?.data) || t('common.error')}`)
      console.error('Detail:', JSON.stringify(e.response?.data?.detail))
    } finally { setAssignLoading(false) }
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.email.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{t('roles.title')}</h2>
        <Button className="gap-2" onClick={() => { setShowForm(!showForm); setEditId(null); setName(''); setRate('') }}>
          <Plus size={16} /> {t('roles.newRole')}
        </Button>
      </div>

      {/* Formulario nuevo rol */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editId ? `${t('roles.editRate')} — ${name}` : t('roles.newRole')}</CardTitle>
            {editId && <p className="text-sm text-gray-500">{t('common.edit')} {t('roles.hourlyRate')} {t('common.of')} <strong>{name}</strong></p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('roles.roleName')}</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Bartender" />
              </div>
              <div className="space-y-2">
                <Label>{t('roles.hourlyRate')}</Label>
                <Input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} required placeholder="25.00" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-gray-500">{t('common.loading')}</p> : (
        <div className="space-y-3">
          {roles.map(role => (
            <Card key={role.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-gray-500">${parseFloat(role.hourly_rate).toFixed(2)}/{t('common.hour')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                    {role.is_active && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1"
                          onClick={() => toggleExpand(role.id)}>
                          <Users size={14} />
                          <span className="text-xs">{t('roles.assignStaff')}</span>
                          {expandedRole === role.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeactivate(role.id)}>
                          {t('roles.deactivate')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Panel de asignación masiva */}
                {expandedRole === role.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t('roles.assignStaff')} <strong>{role.name}</strong></p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => selectAll(filteredMembers)}>
                          {t('roles.selectAll')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={clearAll}>
                          {t('roles.clear')}
                        </Button>
                      </div>
                    </div>

                    {/* Buscador */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <Input
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder={t('common.search')}
                        className="pl-8"
                      />
                    </div>

                    {membersLoading ? (
                      <p className="text-sm text-gray-500">{t('common.loading')}</p>
                    ) : filteredMembers.length === 0 ? (
                      <p className="text-sm text-gray-500">{t('common.noData')}</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                        {filteredMembers.map(member => (
                          <label key={member.id}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(member.id)}
                              onChange={() => toggleSelect(member.id)}
                              className="rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{member.name}</p>
                              <p className="text-xs text-gray-500 truncate">{member.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {selectedIds.size} {t('common.selected')}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleBulkAssign(role.id)}
                        disabled={assignLoading || selectedIds.size === 0}
                      >
                        {assignLoading ? t('roles.associating') : `${t('roles.associate')} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
                      </Button>
                    </div>

                    {assignResult && (
                      <p className="text-sm">{assignResult}</p>
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
