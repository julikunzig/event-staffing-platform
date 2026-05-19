import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error al procesar la solicitud')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail size={20} /> Recuperar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} className="text-green-600" />
              </div>
              <p className="text-gray-700 font-medium">¡Revisa tu correo!</p>
              <p className="text-sm text-gray-500">
                Si el email <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="text-xs text-gray-400">El enlace expira en 2 horas.</p>
              <Link to="/login">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft size={16} /> Volver al Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="tu@email.com" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </Button>
              <Link to="/login">
                <Button type="button" variant="ghost" className="w-full gap-2">
                  <ArrowLeft size={16} /> Volver al Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
