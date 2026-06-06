import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Layout from './Layout'

interface Props {
  children: React.ReactNode
  roles?: string[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />
  if (user.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <Layout>{children}</Layout>
}
