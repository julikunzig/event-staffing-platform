import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token inválido. Solicita un nuevo enlace de recuperación.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error al restablecer la contraseña')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <KeyRound size={20} /> Nueva Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-gray-700 font-medium">¡Contraseña actualizada!</p>
              <p className="text-sm text-gray-500">
                Tu contraseña fue restablecida correctamente. Serás redirigido al login en unos segundos...
              </p>
              <Link to="/login">
                <Button className="w-full">Ir al Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">Ingresa tu nueva contraseña.</p>
              <div className="space-y-1">
                <Label>Nueva Contraseña</Label>
                <Input type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required
                  placeholder="Mínimo 6 caracteres" disabled={!token} />
              </div>
              <div className="space-y-1">
                <Label>Confirmar Contraseña</Label>
                <Input type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required
                  disabled={!token} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || !token}>
                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
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
