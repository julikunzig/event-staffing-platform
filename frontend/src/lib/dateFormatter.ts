/**
 * Formatea una fecha en formato americano MM/DD/YYYY
 */
export function formatDateAmerican(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    // Asegurarse de que es una fecha válida
    if (isNaN(date.getTime())) {
      return dateString.toString()
    }

    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    return `${month}/${day}/${year}`
  } catch {
    return dateString.toString()
  }
}

/**
 * Formatea una fecha y hora en formato americano MM/DD/YYYY HH:MM
 */
export function formatDateTimeAmerican(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    if (isNaN(date.getTime())) {
      return dateString.toString()
    }

    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${month}/${day}/${year} ${hours}:${minutes}`
  } catch {
    return dateString.toString()
  }
}
