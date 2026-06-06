export interface AuthUser {
  user_id: number
  company_id: number
  role: 'super_admin' | 'admin' | 'coordinator' | 'employee'
  exp: number
  name?: string
  must_change_password?: boolean
}

export function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      user_id: Number(payload.sub),
      company_id: payload.company_id,
      role: payload.role,
      exp: payload.exp,
      name: payload.name || '',
      must_change_password: payload.must_change_password || false,
    }
  } catch {
    return null
  }
}

export function getStoredUser(): AuthUser | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  return parseToken(token)
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === 'admin' || user?.role === 'super_admin'
}

export function isCoordinator(user: AuthUser | null) {
  return user?.role === 'coordinator'
}

export function isAdminOrCoord(user: AuthUser | null) {
  return isAdmin(user) || isCoordinator(user)
}
