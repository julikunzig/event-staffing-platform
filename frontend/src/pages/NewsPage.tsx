import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Plus, Newspaper, Calendar, User, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
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

interface News { id: number; title: string; content: string; author_name: string; published_at: string; publication_date?: string; expiration_date?: string; is_active: boolean }

export default function NewsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [news, setNews]           = useState<News[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [pubDate, setPubDate]     = useState('')
  const [expDate, setExpDate]     = useState('')
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  const loadNews = async () => {
    try { const res = await api.get<News[]>('/news?active_only=false'); setNews(res.data) }
    catch { } finally { setLoading(false) }
  }
  useEffect(() => { loadNews() }, [])

  const resetForm = () => { setShowForm(false); setEditingNews(null); setTitle(''); setContent(''); setPubDate(''); setExpDate(''); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload: any = { title, content }
      if (pubDate) payload.publication_date = pubDate
      if (expDate) payload.expiration_date = expDate
      if (editingNews) await api.patch(`/news/${editingNews.id}`, payload)
      else             await api.post('/news', payload)
      resetForm(); loadNews()
    } catch (err: any) { setError(err.response?.data?.detail || t('common.errorOccurred')) }
    finally { setSaving(false) }
  }

  const handleEdit = (item: News) => {
    setEditingNews(item); setTitle(item.title); setContent(item.content)
    setPubDate(item.publication_date || ''); setExpDate(item.expiration_date || '')
    setError(''); setShowForm(true)
  }

  const handleDelete = (item: News) => {
    setConfirmDialog({
      title: '¿Eliminar noticia?',
      message: `"${item.title}" será eliminada permanentemente.`,
      onConfirm: async () => { setConfirmDialog(null); await api.delete(`/news/${item.id}`); loadNews() }
    })
  }

  const handleToggle = async (item: News) => {
    await api.patch(`/news/${item.id}`, { is_active: !item.is_active }); loadNews()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ maxWidth: '800px', fontFamily: "'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Newspaper size={22} color={GREEN} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{t('news.title')}</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{news.filter(n => n.is_active).length} activas</p>
          </div>
        </div>
        {isAdmin(user) && (
          <button onClick={() => { resetForm(); setShowForm(!showForm) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: '0 2px 8px rgba(45,184,75,0.25)' }}>
            <Plus size={15} />{t('news.newNews')}
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && isAdmin(user) && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '2px', background: `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={14} color={GREEN} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827' }}>{editingNews ? t('common.edit') : t('news.newNews')}</p>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>{t('news.newsTitle')} *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('news.content')} *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
                style={{ ...fieldStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>{t('news.publishDate')}</label>
                <input type="datetime-local" value={pubDate} onChange={e => setPubDate(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('news.expirationDate')}</label>
                <input type="datetime-local" value={expDate} onChange={e => setExpDate(e.target.value)} style={fieldStyle} />
              </div>
            </div>
            {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>⚠ {error}</div>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm}
                style={{ padding: '8px 16px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '9px', border: 'none', background: `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'Poppins',sans-serif" }}>
                {saving ? t('news.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `3px solid #e5e7eb`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <Newspaper size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '13px' }}>{t('news.noNews')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {news.map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', opacity: item.is_active ? 1 : 0.6 }}>
              <div style={{ borderLeft: `4px solid ${item.is_active ? GREEN : '#d1d5db'}`, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{item.title}</h3>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', background: item.is_active ? '#f0fdf4' : '#f3f4f6', color: item.is_active ? GREEN : '#9ca3af', border: `1px solid ${item.is_active ? '#bbf7d0' : '#e5e7eb'}` }}>
                        {item.is_active ? t('news.active') : t('news.inactive')}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {[
                        { icon: <User size={11} />, text: item.author_name },
                        { icon: <Calendar size={11} />, text: fmt(item.published_at) },
                        ...(item.publication_date ? [{ icon: <Calendar size={11} />, text: `${t('news.publishDate')}: ${fmt(item.publication_date)}` }] : []),
                        ...(item.expiration_date  ? [{ icon: <Calendar size={11} />, text: `${t('news.expirationDate')}: ${fmt(item.expiration_date)}` }]  : []),
                      ].map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9ca3af' }}>{m.icon}{m.text}</div>
                      ))}
                    </div>
                  </div>

                  {isAdmin(user) && (
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => handleEdit(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleToggle(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                        {item.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => handleDelete(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} danger
          onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}