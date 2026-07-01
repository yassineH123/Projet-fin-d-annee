import { Link } from 'react-router-dom';

export default function EmptyState({
  icon,
  emoji,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
  color = '#C1272D',
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '52px 24px', background: 'var(--card-bg)', borderRadius: 20,
      border: '1px solid var(--border-color)',
      animation: 'esEnter 0.45s cubic-bezier(0.16,1,0.3,1) both',
    }}>

      {/* Icon with float + pulse ring */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          opacity: 0,
          animation: 'esPulse 2.4s ease-out 0.6s infinite',
        }} />
        {/* Inner glow ring */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: `1px solid ${color}30`,
          animation: 'esPulse 2.4s ease-out 1.2s infinite',
        }} />

        {/* Icon box */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `${color}10`,
          border: `1.5px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          animation: 'esFloat 3.5s ease-in-out 0.3s infinite',
          position: 'relative', zIndex: 1,
        }}>
          {emoji || icon}
        </div>
      </div>

      {/* Text */}
      <div style={{ maxWidth: 280, animation: 'esSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
        <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 20,
          animation: 'esSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both',
        }}>
          {actionLabel && (
            actionTo
              ? <Link to={actionTo} className="btn-primary px-6 py-2.5 text-sm">{actionLabel}</Link>
              : <button onClick={onAction} className="btn-primary px-6 py-2.5 text-sm">{actionLabel}</button>
          )}
          {secondaryLabel && secondaryTo && (
            <Link to={secondaryTo} className="btn-secondary px-6 py-2.5 text-sm">{secondaryLabel}</Link>
          )}
        </div>
      )}

      {/* Zellige dots décoratifs */}
      <div style={{ display: 'flex', gap: 5, marginTop: 24, opacity: 0.35 }}>
        {['#C1272D','#D4890A','#006233','#D4890A','#C1272D'].map((c, i) => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
        ))}
      </div>

      <style>{`
        @keyframes esEnter   { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes esSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes esFloat   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
        @keyframes esPulse   { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(1.55); opacity:0; } }
      `}</style>
    </div>
  );
}
