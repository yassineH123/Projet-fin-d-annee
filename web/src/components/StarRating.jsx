import { Star } from 'lucide-react';
import { useState } from 'react';

export function StarDisplay({ rating, count, size = 16 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'} fill={s <= Math.round(rating) ? 'currentColor' : 'none'} />
        ))}
      </div>
      {rating > 0 ? (
        <span className="text-sm text-slate-300 font-medium">{Number(rating).toFixed(1)}</span>
      ) : null}
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star size={28}
            className={(hover || value) >= s ? 'text-yellow-400' : 'text-slate-600'}
            fill={(hover || value) >= s ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}
