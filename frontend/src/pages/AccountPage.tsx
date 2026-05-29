import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { User, FileText, Briefcase, Upload, Trash2, Save, Lock, Globe, Bell, Link as LinkIcon, ChevronDown } from 'lucide-react'
import PushNotificationToggle from '@/components/PushNotificationToggle'
import ConfirmDialog from '@/pages/ConfirmDialog'

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

const fieldStyle: React.CSSProperties = {
  height: '40px', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  color: '#111827', borderRadius: '8px', fontSize: '13px', width: '100%',
  padding: '0 12px', outline: 'none', fontFamily: "'Poppins',sans-serif",
}
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#6b7280', margin: '0 0 5px', display: 'block',
}

interface Profile { id: number; name: string; email: string; phone: string | null; address: string | null; city: string | null; state: string | null; zip_code: string | null; photo_url: string | null; preferred_lang: string }
interface Document { id: number; doc_type: string; name: string; url: string; created_at: string }
interface JobRole { id: number; name: string; hourly_rate: string }

const DOC_TYPES = [
  { value: 'photo', label: '📷 Fotografía' },
  { value: 'w9',    label: '📄 Documento W9' },
  { value: 'certification', label: '🏆 Certificación' },
  { value: 'other', label: '📎 Otro' },
]

const TABS = [
  { key: 'profile',       label: 'Perfil',          icon: User },
  { key: 'password',      label: 'Contraseña',       icon: Lock },
  { key: 'documents',     label: 'Documentos',       icon: FileText },
  { key: 'roles',         label: 'Mis Roles',        icon: Briefcase },
  { key: 'notifications', label: 'Notificaciones',   icon: Bell },
]

export default function AccountPage() {
  const { t, i18n } = useTranslation()
  const [tab, setTab]           = useState<string>('profile')
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [myRoles, setMyRoles]   = useState<JobRole[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [address, setAddress]   = useState('')
  const [city, setCity]         = useState('')
  const [state, setState]       = useState('')
  const [zipCode, setZipCode]   = useState('')
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [docType, setDocType]   = useState('other')
  const [docName, setDocName]   = useState('')
  const [docUrl, setDocUrl]     = useState('')
  const [addingDoc, setAddingDoc] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Profile>('/users/me/profile'),
      api.get<Document[]>('/users/me/documents'),
      api.get<JobRole[]>('/job-roles/my-roles'),
    ]).then(([pRes, dRes, rRes]) => {
      const p = pRes.data; setProfile(p); setName(p.name); setPhone(p.phone || '')
      setAddress(p.address || ''); setCity(p.city || ''); setState(p.state || ''); setZipCode(p.zip_code || '')
      setDocuments(dRes.data); setMyRoles(rRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const msg = (ok: boolean, txt: string) => { if (ok) setSuccess(txt); else setError(txt) }
  const clearMsg = () => { setSuccess(''); setError('') }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); clearMsg()
    try {
      await api.patch('/users/me/profile', { name: name || undefined, phone: phone || null, address: address || null, city: city || null, state: state || null, zip_code: zipCode || null })
      msg(true, t('common.success') || 'Guardado correctamente')
    } catch (e: any) { msg(false, e.response?.data?.detail || t('common.error')) }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); clearMsg()
    if (newPwd !== confirmPwd) { msg(false, t('forms.passwordsDoNotMatch') || 'Las contraseñas no coinciden'); return }
    if (newPwd.length < 8) { msg(false, t('forms.passwordTooShort') || 'Mínimo 8 caracteres'); return }
    setSaving(true)
    try {
      await api.post('/auth/change-password', { current_password: currentPwd, new_password: newPwd })
      msg(true, t('forms.passwordChangedSuccessfully') || 'Contraseña cambiada')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (e: any) { msg(false, e.response?.data?.detail || t('common.error')) }
    finally { setSaving(false) }
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault(); if (!docUrl) return; setSaving(true); clearMsg()
    try {
      const res = await api.post('/users/me/documents/url', { doc_type: docType, name: docName || docType, url: docUrl })
      setDocuments(prev => [{ ...res.data, created_at: new Date().toISOString() }, ...prev])
      setDocUrl(''); setDocName(''); setAddingDoc(false)
    } catch (e: any) { msg(false, e.response?.data?.detail || t('forms.errorAddingDocument')) }
    finally { setSaving(false) }
  }

  const handleDeleteDoc = (docId: number) => {
    setConfirmDialog({
      title: '¿Eliminar documento?', message: 'El documento será eliminado permanentemente.',
      onConfirm: async () => {
        setConfirmDialog(null)
        await api.delete(`/users/me/documents/${docId}`)
        setDocuments(prev => prev.filter(d => d.id !== docId))
      }
    })
  }

  const SaveBtn = ({ label }: { label: string }) => (
    <button type="submit" disabled={saving}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.2)' }}>
      <Save size={14} />{saving ? t('common.loading') : label}
    </button>
  )

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('common.loading')}</p>

  const initial = profile?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div style={{ maxWidth: '640px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Profile banner */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initial}</div>
        <div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>{profile?.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{profile?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => { setTab(tb.key); clearMsg() }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === tb.key ? GREEN : 'transparent'}`, background: 'transparent', color: tab === tb.key ? GREEN : '#9ca3af', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s', marginBottom: '-1px' }}>
            <tb.icon size={13} />{tb.label}
          </button>
        ))}
      </div>

      {/* Mensajes */}
      {success && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '14px' }}>✓ {success}</div>}
      {error   && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>⚠ {error}</div>}

      {/* ── PERFIL ── */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.personalInfo')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={13} color="#9ca3af" />
              <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}
                style={{ ...fieldStyle, width: 'auto', height: '32px', fontSize: '12px' }}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>{t('forms.fullName')}</label>
              <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('forms.email')}</label>
              <input value={profile?.email || ''} disabled style={{ ...fieldStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={labelStyle}>{t('forms.phone')}</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" style={fieldStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>{t('forms.address')}</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('forms.city')}</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('forms.state')}</label>
              <div style={{ position: 'relative' }}>
                <select value={state} onChange={e => setState(e.target.value)} style={{ ...fieldStyle, paddingRight: '28px', appearance: 'none' }}>
                  <option value="">{t('forms.selectState')}</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('forms.zipCode')}</label>
              <input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33101" style={fieldStyle} />
            </div>
          </div>
          <SaveBtn label={t('forms.saveChanges')} />
        </form>
      )}

      {/* ── CONTRASEÑA ── */}
      {tab === 'password' && (
        <form onSubmit={handleChangePassword} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.changePassword')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: t('forms.currentPassword') || 'Contraseña Actual', val: currentPwd, set: setCurrentPwd },
              { label: t('forms.newPassword')     || 'Nueva Contraseña',   val: newPwd,     set: setNewPwd },
              { label: t('forms.confirmPassword') || 'Confirmar',          val: confirmPwd, set: setConfirmPwd },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label style={labelStyle}>{label} *</label>
                <input type="password" value={val} onChange={e => set(e.target.value)} required style={fieldStyle} />
              </div>
            ))}
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{t('forms.passwordRequirements') || 'Mínimo 8 caracteres'}</p>
          </div>
          <SaveBtn label={t('forms.changePassword') || 'Cambiar Contraseña'} />
        </form>
      )}

      {/* ── DOCUMENTOS ── */}
      {tab === 'documents' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.myDocuments')}</p>
            <button onClick={() => setAddingDoc(!addingDoc)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              <Upload size={13} />{t('forms.addDocument')}
            </button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {addingDoc && (
              <form onSubmit={handleAddDocument} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{t('forms.addDocument')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>{t('forms.documentType')}</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)} style={{ ...fieldStyle, appearance: 'none' }}>
                      {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t('forms.documentName')}</label>
                    <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Mi W9 2024" style={fieldStyle} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>{t('forms.uploadDocumentUrl')} *</label>
                    <input value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://drive.google.com/..." required style={fieldStyle} />
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{t('forms.uploadDocumentUrlHint')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={saving}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.save')}</button>
                  <button type="button" onClick={() => setAddingDoc(false)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>{t('common.cancel')}</button>
                </div>
              </form>
            )}
            {documents.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '1.5rem 0' }}>{t('forms.noDocumentsUploaded')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <LinkIcon size={14} color={GREEN} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{DOC_TYPES.find(d => d.value === doc.doc_type)?.label || doc.doc_type}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: GREEN, fontWeight: 600, textDecoration: 'none' }}>{t('forms.viewDocument')}</a>
                      <button onClick={() => handleDeleteDoc(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MIS ROLES ── */}
      {tab === 'roles' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('forms.myRoles')}</p>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {myRoles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '1rem 0' }}>{t('forms.noRolesAssigned')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myRoles.map(role => (
                  <div key={role.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{role.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>${parseFloat(role.hourly_rate).toFixed(2)}/hora</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0' }}>{t('common.active')}</span>
                  </div>
                ))}
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{t('forms.myRolesDescription')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICACIONES ── */}
      {tab === 'notifications' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Bell size={15} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t('push.notifications') || 'Notificaciones Push'}</p>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
            {t('push.description') || 'Activa las notificaciones push para recibir alertas de nuevos eventos e invitaciones directamente en tu dispositivo.'}
          </p>
          <PushNotificationToggle />
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} danger
          onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />
      )}
    </div>
  )
}