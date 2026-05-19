import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (newPass !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (newPass.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password', { current_password: current, new_password: newPass })
      setSuccess('Contraseña actualizada correctamente')
      setCurrent(''); setNewPass(''); setConfirm('')
    } catch (e: any) { setError(e.response?.data?.detail || 'Error al cambiar contraseña') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound size={18} />Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Contraseña Actual</Label>
              <PasswordInput value={current} onChange={e => setCurrent(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Nueva Contraseña</Label>
              <PasswordInput value={newPass} onChange={e => setNewPass(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Confirmar Nueva Contraseña</Label>
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
