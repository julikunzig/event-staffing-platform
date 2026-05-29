interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const GREEN      = '#2db84b'
const GREEN_DARK = '#1e9038'

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }: Props) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 60 }} onClick={onCancel} />
      <div style={{
        position: 'fixed', zIndex: 61,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: '400px',
        background: '#fff', borderRadius: '1.25rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden', fontFamily: "'Poppins',sans-serif",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ height: '3px', background: danger ? 'linear-gradient(90deg,#dc2626,#ef4444)' : `linear-gradient(90deg,${GREEN_DARK},${GREEN})` }} />
        <div style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{title}</h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '13.5px', color: '#6b7280', lineHeight: 1.6 }}>{message}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onCancel}
              style={{ padding: '8px 18px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
              {cancelLabel}
            </button>
            <button onClick={onConfirm}
              style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', background: danger ? '#dc2626' : `linear-gradient(135deg,${GREEN_DARK},${GREEN})`, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: danger ? '0 2px 8px rgba(220,38,38,0.25)' : '0 2px 8px rgba(45,184,75,0.25)' }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}