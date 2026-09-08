import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export default function StarRating({ value, size = 18, interactive = false, onChange }: Props) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = interactive && hoverValue > 0 ? hoverValue : value;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < displayValue;
        const star = (
          <Star
            width={size}
            height={size}
            className={filled ? 'text-amber' : 'text-soft-peach'}
            fill={filled ? 'currentColor' : 'none'}
            strokeWidth={filled ? 0 : 1.5}
          />
        );
        if (!interactive) {
          return <span key={i}>{star}</span>;
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            onMouseEnter={() => setHoverValue(i + 1)}
            className="p-0.5 hover:scale-110 transition-transform"
            aria-label={`Rate ${i + 1} star${i === 0 ? '' : 's'}`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
