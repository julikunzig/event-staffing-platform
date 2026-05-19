interface ProgressBarProps {
  /** Cupos aprobados (verde emerald) */
  value: number
  /** Total de cupos requeridos */
  max: number
  /** Cupos pendientes de aprobación (ámbar) */
  pending?: number
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({
  value,
  max,
  pending = 0,
  showLabel = true,
  className = '',
}: ProgressBarProps) {
  const approved = Math.min(value, max)
  const pendingCapped = Math.min(pending, max - approved)
  const total = approved + pendingCapped

  const approvedPct = max > 0 ? (approved / max) * 100 : 0
  const pendingPct = max > 0 ? (pendingCapped / max) * 100 : 0
  const isFull = total >= max
  const allApproved = approved >= max

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">
            {approved}/{max}
            {pendingCapped > 0 && (
              <span className="text-amber-500 ml-1">(+{pendingCapped} pendiente{pendingCapped !== 1 ? 's' : ''})</span>
            )}
          </span>
          <span className={`text-xs font-semibold ${allApproved ? 'text-emerald-600' : isFull ? 'text-amber-600' : 'text-slate-400'}`}>
            {allApproved ? '✓ Completo' : isFull ? '⏳ Pend. aprobación' : `${Math.round((total / max) * 100)}%`}
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
        {/* Segmento verde emerald: aprobados */}
        {approvedPct > 0 && (
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${approvedPct}%`,
              background: 'linear-gradient(90deg, #10b981, #059669)',
              borderRadius: pendingPct > 0 ? '9999px 0 0 9999px' : '9999px',
            }}
          />
        )}
        {/* Segmento ámbar: pendientes */}
        {pendingPct > 0 && (
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${pendingPct}%`,
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              borderRadius: approvedPct > 0 ? '0 9999px 9999px 0' : '9999px',
            }}
          />
        )}
      </div>
    </div>
  )
}
