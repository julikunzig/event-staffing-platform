import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/lib/auth'
import { MessageCircle, ExternalLink, X } from 'lucide-react'

const GREEN = '#2db84b'

// Twilio Sandbox join link - users need to send "join <word>" to this number
const WHATSAPP_JOIN_URL = 'https://wa.me/14155238886?text=join%20painted-fingers'

export default function WhatsAppConnectBanner() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('wa_banner_dismissed') === 'true')
  const isEs = i18n.language === 'es'

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('wa_banner_dismissed', 'true')
  }

  const handleConnect = () => {
    window.open(WHATSAPP_JOIN_URL, '_blank')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderRadius: '14px',
      background: 'linear-gradient(135deg, #111827, #1f2937)',
      border: `2px solid ${GREEN}44`,
      marginBottom: '16px', gap: '12px', flexWrap: 'wrap',
      boxShadow: `0 4px 20px ${GREEN}15`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${GREEN}20`, border: `1.5px solid ${GREEN}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <MessageCircle size={22} color={GREEN} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: "'Poppins',sans-serif" }}>
            {isEs ? 'Conecta tu WhatsApp' : 'Connect your WhatsApp'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af', fontFamily: "'Poppins',sans-serif" }}>
            {isAdmin(user)
              ? (isEs ? 'Envía invitaciones y recibe respuestas directo en tu chat.' : 'Send invitations and receive responses directly in your chat.')
              : (isEs ? 'Recibe tus turnos, avisos y reportes directo en tu chat.' : 'Receive your shifts, alerts and reports directly in your chat.')
            }
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button onClick={handleConnect}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '10px',
            border: `1.5px solid ${GREEN}`,
            background: 'transparent', color: '#fff',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Poppins',sans-serif",
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GREEN}20` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
          <ExternalLink size={14} />
          {isEs ? 'Conectar ahora' : 'Connect now'}
        </button>
        <button onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
