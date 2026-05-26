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
}) {
  return (
    <div className="card flex flex-col items-center text-center py-14 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}
      >
        {emoji || icon}
      </div>

      <div className="max-w-xs">
        <p className="text-white font-bold text-base">{title}</p>
        {description && (
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>

      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-wrap gap-2 justify-center mt-1">
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
    </div>
  );
}
