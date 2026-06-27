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

/**
 * Extrae un string seguro de un error de axios. El `detail` de FastAPI puede
 * ser un string normal o, en errores de validación (422), un array de
 * objetos {type, loc, msg, input} — eso no es renderizable directo en JSX.
 */
export function extractErrorDetail(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string' && detail) return parseErrorMessage(detail)
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => (typeof d === 'string' ? d : d?.msg)).filter(Boolean).join(', ') || fallback
  }
  return fallback
}
