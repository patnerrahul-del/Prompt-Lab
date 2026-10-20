import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({
  rating,
  totalReviews,
  interactive = false,
  onRatingChange,
  size = 'md',
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayRating >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                'transition-colors p-0.5',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              )}
              aria-label={`${star} star`}
            >
              <Star
                className={cn(
                  starSizes[size],
                  filled
                    ? 'fill-gold text-gold drop-shadow-[0_0_8px_rgba(201,162,75,0.4)]'
                    : 'text-white/20'
                )}
              />
            </button>
          );
        })}
      </div>
      {totalReviews !== undefined && (
        <span className="text-xs text-text-muted font-medium ml-1">
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
}
