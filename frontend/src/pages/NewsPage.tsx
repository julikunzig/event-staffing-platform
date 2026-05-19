import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Newspaper, Calendar, User, Edit2, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

interface News {
  id: number
  title: string
  content: string
  author_name: string
  published_at: string
  publication_date?: string
  expiration_date?: string
  is_active: boolean
}

export default function NewsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publicationDate, setPublicationDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadNews = async () => {
    try {
      const res = await api.get<News[]>('/news?active_only=false')
      setNews(res.data)
    } catch (err) {
      console.error('Error loading news:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError(t('common.required'))
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload: any = { title, content }
      if (publicationDate) payload.publication_date = publicationDate
      if (expirationDate) payload.expiration_date = expirationDate

      if (editingNews) {
        await api.patch(`/news/${editingNews.id}`, payload)
      } else {
        await api.post('/news', payload)
      }
      setShowForm(false)
      setEditingNews(null)
      setTitle('')
      setContent('')
      setPublicationDate('')
      setExpirationDate('')
      loadNews()
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.errorOccurred'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: News) => {
    setEditingNews(item)
    setTitle(item.title)
    setContent(item.content)
    setPublicationDate(item.publication_date || '')
    setExpirationDate(item.expiration_date || '')
    setError('')
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.confirmDelete'))) return

    try {
      await api.delete(`/news/${id}`)
      loadNews()
    } catch (err: any) {
      alert(err.response?.data?.detail || t('common.errorOccurred'))
    }
  }

  const handleToggleActive = async (item: News) => {
    try {
      await api.patch(`/news/${item.id}`, { is_active: !item.is_active })
      loadNews()
    } catch (err: any) {
      alert(err.response?.data?.detail || t('common.errorOccurred'))
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (pubDate?: string, expDate?: string) => {
    if (!pubDate || !expDate) return null
    const pub = new Date(pubDate).getTime()
    const exp = new Date(expDate).getTime()
    const days = Math.floor((exp - pub) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} días` : null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-slate-900">{t('news.title')}</h2>
        </div>
        {isAdmin(user) && (
          <Button 
            className="gap-2 w-full sm:w-auto" 
            onClick={() => {
              setShowForm(!showForm)
              setEditingNews(null)
              setTitle('')
              setContent('')
              setPublicationDate('')
              setExpirationDate('')
              setError('')
            }}
          >
            <Plus size={16} /> {t('news.newNews')}
          </Button>
        )}
      </div>

      {/* Formulario crear/editar */}
      {showForm && isAdmin(user) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper size={18} />
              {editingNews ? t('common.edit') : t('news.newNews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('news.newsTitle')}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('news.newsTitle')}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{t('news.content')}</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('news.content')}
                  rows={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pubDate">{t('news.publishDate')}</Label>
                  <Input
                    id="pubDate"
                    type="datetime-local"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expDate">{t('news.expirationDate')}</Label>
                  <Input
                    id="expDate"
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingNews(null)
                    setTitle('')
                    setContent('')
                    setPublicationDate('')
                    setExpirationDate('')
                    setError('')
                  }}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t('news.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de noticias */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : news.length === 0 ? (
        <Card className="p-8 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">{t('news.noNews')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <Card key={item.id} className={`${!item.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 break-words">{item.title}</h3>
                      <Badge variant={item.is_active ? 'default' : 'secondary'} className="flex-shrink-0">
                        {item.is_active ? t('news.active') : t('news.inactive')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap break-words">
                      {item.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{item.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                      {item.publication_date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{t('news.publishDate')}: {formatDate(item.publication_date)}</span>
                        </div>
                      )}
                      {item.expiration_date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{t('news.expirationDate')}: {formatDate(item.expiration_date)}</span>
                        </div>
                      )}
                      {calculateDuration(item.publication_date, item.expiration_date) && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{t('news.duration')}: {calculateDuration(item.publication_date, item.expiration_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  {isAdmin(user) && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        title={t('common.edit')}
                        className="gap-1"
                      >
                        <Edit2 size={14} />
                        <span className="hidden sm:inline text-xs">{t('common.edit')}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(item)}
                        title={item.is_active ? t('news.hide') : t('news.show')}
                        className="gap-1"
                      >
                        {item.is_active ? (
                          <>
                            <Eye size={14} />
                            <span className="hidden sm:inline text-xs">{t('news.hide')}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            <span className="hidden sm:inline text-xs">{t('news.show')}</span>
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        title={t('common.delete')}
                        className="gap-1"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline text-xs">{t('common.delete')}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
