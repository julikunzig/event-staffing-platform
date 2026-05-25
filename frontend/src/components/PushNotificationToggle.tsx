import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, BellOff } from 'lucide-react'
import { subscribeToPush, unsubscribeFromPush, isPushSupported, getPushPermissionStatus } from '@/lib/pushNotifications'

export default function PushNotificationToggle() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<string>('default')
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(isPushSupported())
    setStatus(getPushPermissionStatus())
  }, [])

  // Not supported — show info message
  if (!supported) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isHTTP = window.location.protocol === 'http:'
    return (
      <div className="px-3 py-2 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <BellOff size={13} />
          <span className="font-medium">{t('push.notifications')}</span>
        </div>
        {isIOS && (
          <p className="text-slate-500">
            En iPhone: agrega la app a la pantalla de inicio desde Safari (compartir → Agregar a pantalla de inicio) y luego activa las notificaciones.
          </p>
        )}
        {isHTTP && !isIOS && (
          <p className="text-slate-500">
            Requiere HTTPS para funcionar en producción.
          </p>
        )}
        {!isIOS && !isHTTP && (
          <p className="text-slate-500">Tu navegador no soporta notificaciones push.</p>
        )}
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="px-3 py-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <BellOff size={13} />
          <span>{t('push.blocked')}</span>
        </div>
        <p className="text-slate-500 mt-1">Actívalas en Configuración del navegador → Notificaciones.</p>
      </div>
    )
  }

  return (
    <button
      onClick={async () => {
        setLoading(true)
        try {
          if (status === 'granted') {
            await unsubscribeFromPush()
            setStatus('default')
          } else {
            const ok = await subscribeToPush()
            setStatus(ok ? 'granted' : 'denied')
          }
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
        status === 'granted'
          ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {status === 'granted' ? <Bell size={15} className="text-teal-600" /> : <Bell size={15} />}
      {loading
        ? t('common.loading')
        : status === 'granted'
          ? t('push.enabled')
          : t('push.enable')
      }
    </button>
  )
}
