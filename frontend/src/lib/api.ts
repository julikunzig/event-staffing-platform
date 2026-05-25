import axios from 'axios'

// Usar la URL de la API desde variables de entorno
// Configuración estándar: http://10.0.0.13:8000/api/v1
const API_URL = import.meta.env.VITE_API_URL || 'http://10.0.0.13:8000/api/v1'

console.log('[API] Using API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
})

// Convertir fechas de formato mm/dd/yyyy o dd/mm/yyyy de vuelta a yyyy-mm-dd para el backend
const convertDateToISO = (date: string, lang: string): string => {
  if (!date) return date
  
  // Si ya está en formato ISO (yyyy-mm-dd), devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date
  
  // Si es formato mm/dd/yyyy (inglés) o dd/mm/yyyy (español)
  const parts = date.split('/')
  if (parts.length === 3) {
    if (lang === 'es') {
      // Español: DD/MM/YYYY -> YYYY-MM-DD
      const [day, month, year] = parts
      return `${year}-${month}-${day}${date.includes(' ') ? date.substring(10) : ''}`
    } else {
      // Inglés: MM/DD/YYYY -> YYYY-MM-DD
      const [month, day, year] = parts
      return `${year}-${month}-${day}${date.includes(' ') ? date.substring(10) : ''}`
    }
  }
  
  return date
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // Convertir fechas en el request de vuelta a formato ISO para el backend
  if (config.data) {
    const lang = localStorage.getItem('lang') || 'es'
    const convertDatesInRequest = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(convertDatesInRequest)
      }
      if (obj !== null && typeof obj === 'object') {
        const converted: any = {}
        for (const key in obj) {
          const value = obj[key]
          // Detectar campos de fecha comunes
          if (typeof value === 'string' && (
            key.includes('date') || 
            key.includes('Date') || 
            key.includes('_at') ||
            /^\d{1,2}\/\d{1,2}\/\d{4}/.test(value) // Patrón mm/dd/yyyy o dd/mm/yyyy
          )) {
            converted[key] = convertDateToISO(value, lang)
          } else if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
            converted[key] = convertDatesInRequest(value)
          } else {
            converted[key] = value
          }
        }
        return converted
      }
      return obj
    }
    config.data = convertDatesInRequest(config.data)
  }
  
  return config
})

api.interceptors.response.use(
  (res) => {
    // NO convertir fechas en la respuesta - mantener formato ISO para inputs
    // Las fechas se mostrarán en formato local solo en la UI (cards, tablas, etc.)
    // Los inputs type="date" necesitan formato yyyy-mm-dd
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Función helper para formatear fechas en la UI (no en inputs)
export const formatDateForDisplay = (dateStr: string | null | undefined, lang?: string): string => {
  if (!dateStr) return '—'
  
  const currentLang = lang || localStorage.getItem('lang') || 'es'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    if (currentLang === 'es') {
      // Español: DD/MM/YYYY HH:MM
      return date.toLocaleDateString('es', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) + (dateStr.includes('T') ? ' ' + date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '')
    } else {
      // Inglés: MM/DD/YYYY HH:MM
      return date.toLocaleDateString('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) + (dateStr.includes('T') ? ' ' + date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '')
    }
  } catch {
    return dateStr
  }
}
