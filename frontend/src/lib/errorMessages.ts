/**
 * Parsea mensajes de error del backend
 * Formato: "English message | Spanish message"
 */
export function parseErrorMessage(detail: string): string {
  // Si contiene el separador de idiomas, extraer el mensaje correcto
  if (detail.includes(' | ')) {
    const parts = detail.split(' | ')
    const lang = localStorage.getItem('lang') || 'es'
    
    if (lang === 'es') {
      return parts[1] || parts[0]
    } else {
      return parts[0] || parts[1]
    }
  }
  
  // Si no tiene el separador, devolverlo tal cual
  return detail
}
