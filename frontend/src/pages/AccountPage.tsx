import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, FileText, Briefcase, Upload, Trash2, Save, Lock, Globe } from 'lucide-react'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

interface Profile { id: number; name: string; email: string; phone: string | null; address: string | null; city: string | null; state: string | null; zip_code: string | null; photo_url: string | null; preferred_lang: string }
interface Document { id: number; doc_type: string; name: string; url: string; created_at: string }
interface JobRole { id: number; name: string; hourly_rate: string }

const DOC_TYPES = [
  { value: 'photo', label: '📷 Fotografía' },
  { value: 'w9', label: '📄 Documento W9' },
  { value: 'certification', label: '🏆 Certificación' },
  { value: 'other', label: '📎 Otro' },
]

export default function AccountPage() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<'profile' | 'password' | 'documents' | 'roles'>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [myRoles, setMyRoles] = useState<JobRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Formulario de perfil
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  // Formulario de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Nuevo documento
  const [docType, setDocType] = useState('other')
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [addingDoc, setAddingDoc] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<Profile>('/users/me/profile'),
      api.get<Document[]>('/users/me/documents'),
      api.get<JobRole[]>('/job-roles/my-roles'),
    ]).then(([pRes, dRes, rRes]) => {
      const p = pRes.data
      setProfile(p)
      setName(p.name); setPhone(p.phone || ''); setAddress(p.address || '')
      setCity(p.city || ''); setState(p.state || ''); setZipCode(p.zip_code || '')
      setDocuments(dRes.data)
      setMyRoles(rRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.patch('/users/me/profile', {
        name: name || undefined,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
      })
      setSuccess(t('forms.errorSavingProfile'))
    } catch (e: any) { setError(e.response?.data?.detail || t('common.error')) }
    finally { setSaving(false) }
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docUrl) return
    setSaving(true); setError('')
    try {
      const res = await api.post('/users/me/documents/url', { doc_type: docType, name: docName || docType, url: docUrl })
      setDocuments(prev => [{ ...res.data, created_at: new Date().toISOString() }, ...prev])
      setDocUrl(''); setDocName(''); setAddingDoc(false)
    } catch (e: any) { setError(e.response?.data?.detail || t('forms.errorAddingDocument')) }
    finally { setSaving(false) }
  }

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm(t('forms.confirmDeleteDocument'))) return
    try {
      await api.delete(`/users/me/documents/${docId}`)
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch { }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError(t('forms.passwordsDoNotMatch') || 'Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 8) {
      setError(t('forms.passwordTooShort') || 'La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess(t('forms.passwordChangedSuccessfully') || 'Contraseña cambiada exitosamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">{t('nav.account')}</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'profile', label: t('nav.profile'), icon: User },
          { key: 'password', label: t('forms.changePassword') || 'Cambiar Contraseña', icon: Lock },
          { key: 'documents', label: t('forms.myDocuments'), icon: FileText },
          { key: 'roles', label: t('forms.myRoles'), icon: Briefcase },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {tab === 'profile' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('forms.personalInfo')}</CardTitle>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-500" />
                <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm">
                  <option value="es">{t('common.spanish') || 'Español'}</option>
                  <option value="en">{t('common.english') || 'English'}</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label>{t('forms.fullName')}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t('forms.email')}</Label>
                  <Input value={profile?.email || ''} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <Label>{t('forms.phone')}</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>{t('forms.address')}</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div className="space-y-1">
                  <Label>{t('forms.city')}</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" />
                </div>
                <div className="space-y-1">
                  <Label>{t('forms.state')}</Label>
                  <select value={state} onChange={e => setState(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="">{t('forms.selectState')}</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>{t('forms.zipCode')}</Label>
                  <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33101" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button type="submit" disabled={saving} className="gap-2">
                <Save size={14} /> {saving ? t('common.loading') : t('forms.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cambiar Contraseña */}
      {tab === 'password' && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('forms.changePassword') || 'Cambiar Contraseña'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <Label>{t('forms.currentPassword') || 'Contraseña Actual'}</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>{t('forms.newPassword') || 'Nueva Contraseña'}</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <p className="text-xs text-gray-500">{t('forms.passwordRequirements') || 'Mínimo 8 caracteres'}</p>
              </div>
              <div className="space-y-1">
                <Label>{t('forms.confirmPassword') || 'Confirmar Contraseña'}</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button type="submit" disabled={saving} className="gap-2">
                <Lock size={14} /> {saving ? t('common.loading') : t('forms.changePassword') || 'Cambiar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      {tab === 'documents' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('forms.myDocuments')}</CardTitle>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddingDoc(!addingDoc)}>
                <Upload size={14} /> {t('forms.addDocument')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {addingDoc && (
              <form onSubmit={handleAddDocument} className="p-3 bg-gray-50 rounded-lg border space-y-3">
                <p className="text-sm font-medium">{t('forms.addDocument')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('forms.documentType')}</Label>
                    <select value={docType} onChange={e => setDocType(e.target.value)}
                      className="w-full border rounded-md px-2 py-1.5 text-sm">
                      {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('forms.documentName')}</Label>
                    <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Mi W9 2024" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">{t('forms.uploadDocumentUrl')}</Label>
                    <Input value={docUrl} onChange={e => setDocUrl(e.target.value)}
                      placeholder="https://..." required />
                    <p className="text-xs text-gray-400">{t('forms.uploadDocumentUrlHint')}</p>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>{t('common.save')}</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAddingDoc(false)}>{t('common.cancel')}</Button>
                </div>
              </form>
            )}

            {documents.length === 0 ? (
              <p className="text-sm text-gray-500">{t('forms.noDocumentsUploaded')}</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{DOC_TYPES.find(d => d.value === doc.doc_type)?.label || doc.doc_type}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline">{t('forms.viewDocument')}</a>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mis Roles */}
      {tab === 'roles' && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('forms.myRoles')}</CardTitle></CardHeader>
          <CardContent>
            {myRoles.length === 0 ? (
              <p className="text-sm text-gray-500">{t('forms.noRolesAssigned')}</p>
            ) : (
              <div className="space-y-2">
                {myRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{role.name}</p>
                      <p className="text-xs text-gray-500">${parseFloat(role.hourly_rate).toFixed(2)}/hora</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t('common.active')}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-2">
                  {t('forms.myRolesDescription')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
