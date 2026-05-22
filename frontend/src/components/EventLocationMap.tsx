import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface EventLocationMapProps {
  address: string
  city?: string | null
  state?: string | null
  zipCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

export default function EventLocationMap({
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude
}: EventLocationMapProps) {
  const [showMap, setShowMap] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  // Construir dirección completa
  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ')
  
  // Codificar dirección para URLs
  const encodedAddress = encodeURIComponent(fullAddress)
  
  // URLs de navegación
  const navigationUrls = {
    googleMaps: latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
    appleMaps: latitude && longitude
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
      : `http://maps.apple.com/?daddr=${encodedAddress}`,
    waze: latitude && longitude
      ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
      : `https://waze.com/ul?q=${encodedAddress}&navigate=yes`
  }

  // Inicializar mapa con Leaflet
  useEffect(() => {
    if (!showMap || !mapContainer.current || !latitude || !longitude) return

    // Evitar reinicializar si ya existe
    if (map.current) return

    // Cargar Leaflet dinámicamente
    const L = (window as any).L
    if (!L) return

    map.current = L.map(mapContainer.current).setView([latitude, longitude], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    L.marker([latitude, longitude])
      .addTo(map.current)
      .bindPopup(`<strong>${address}</strong><br>${city}, ${state} ${zipCode}`)
      .openPopup()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [showMap, latitude, longitude, address, city, state, zipCode])

  const handleOpenNavigation = (url: string) => {
    window.open(url, '_blank')
  }

  // Detectar si es iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // Detectar si es Android
  const isAndroid = /Android/.test(navigator.userAgent)

  return (
    <div className="space-y-3">
      {/* Dirección con icono - Destacada y clickeable */}
      <div className="flex items-start gap-2 p-3 lg:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleOpenNavigation(navigationUrls.googleMaps)}>
        <MapPin size={20} className="flex-shrink-0 mt-0.5 text-teal-600" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-teal-900 text-sm lg:text-base break-words">{fullAddress}</p>
          {latitude && longitude && (
            <p className="text-xs text-teal-600 mt-1">
              📍 {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
            </p>
          )}
          <p className="text-xs text-teal-700 mt-1.5 font-medium flex items-center gap-1">
            <ExternalLink size={12} />
            Toca para abrir en Google Maps
          </p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-2 flex-1 sm:flex-none"
          onClick={() => handleOpenNavigation(navigationUrls.googleMaps)}
        >
          <Navigation size={14} />
          <span className="hidden sm:inline">Google Maps</span>
          <span className="sm:hidden">Google</span>
        </Button>

        {isIOS && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => handleOpenNavigation(navigationUrls.appleMaps)}
          >
            <Navigation size={14} />
            <span className="hidden sm:inline">Apple Maps</span>
            <span className="sm:hidden">Apple</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="gap-2 flex-1 sm:flex-none"
          onClick={() => handleOpenNavigation(navigationUrls.waze)}
        >
          <Navigation size={14} />
          Waze
        </Button>

        {latitude && longitude && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin size={14} />
            {showMap ? 'Ocultar' : 'Ver'} Mapa
          </Button>
        )}
      </div>

      {/* Mapa embebido con Leaflet */}
      {showMap && latitude && longitude && (
        <Card className="overflow-hidden">
          <div 
            ref={mapContainer}
            className="w-full h-64 lg:h-80 bg-gray-100"
            style={{ zIndex: 1 }}
          />
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-xs text-gray-600 text-center">
              Toca en los botones de navegación para obtener direcciones
            </p>
          </div>
        </Card>
      )}

      {/* Información adicional para móvil */}
      {(isIOS || isAndroid) && (
        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="flex items-start gap-1.5">
            <span className="text-blue-600 mt-0.5">ℹ️</span>
            <span>
              {isIOS && 'Toca "Apple Maps" para abrir en la app nativa de iOS, o '}
              {isAndroid && 'Toca "Google Maps" para abrir en la app nativa de Android, o '}
              "Waze" si lo tienes instalado.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
