import i18n from 'i18next'

/**
 * Traduce un rol de usuario
 */
export function translateRole(role: string): string {
  const t = i18n.t.bind(i18n)
  
  const roleMap: Record<string, string> = {
    'super_admin': t('roles.superAdmin') || 'Super Admin',
    'admin': t('roles.admin') || 'Admin',
    'coordinator': t('roles.coordinator') || 'Coordinator',
    'employee': t('roles.employee') || 'Employee',
  }

  return roleMap[role] || role
}

/**
 * Traduce un estado de evento
 */
export function translateEventStatus(status: string): string {
  const t = i18n.t.bind(i18n)
  
  const statusMap: Record<string, string> = {
    'created': t('events.status.created') || 'Created',
    'published': t('events.status.published') || 'Published',
    'filled': t('events.status.filled') || 'Filled',
    'filled_pending': t('events.status.filledPending') || 'Filled Pending',
    'started': t('events.status.started') || 'Started',
    'finished': t('events.status.finished') || 'Finished',
    'cancelled': t('events.status.cancelled') || 'Cancelled',
  }

  return statusMap[status] || status
}

/**
 * Traduce un estado de asignación
 */
export function translateAssignmentStatus(status: string): string {
  const t = i18n.t.bind(i18n)
  
  const statusMap: Record<string, string> = {
    'pending': t('events.assignmentStatus.pending') || 'Pending',
    'invited': t('events.assignmentStatus.invited') || 'Invited',
    'approved': t('events.assignmentStatus.approved') || 'Approved',
    'rejected': t('events.assignmentStatus.rejected') || 'Rejected',
    'removed': t('events.assignmentStatus.removed') || 'Removed',
  }

  return statusMap[status] || status
}
