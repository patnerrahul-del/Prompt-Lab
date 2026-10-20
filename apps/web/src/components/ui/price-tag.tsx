import { cn, formatINR } from '@/lib/utils';
import { Badge } from './badge';

export interface PriceTagProps {
  priceInr: number;
  compareAtPriceInr?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({
  priceInr,
  compareAtPriceInr,
  size = 'md',
  className,
}: PriceTagProps) {
  const isFree = priceInr === 0;

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-2xl font-bold',
  };

  if (isFree) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="gold" className="uppercase tracking-wider font-semibold">
          Complimentary
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-serif text-gold-light', sizeClasses[size])}>
        {formatINR(priceInr)}
      </span>
      {compareAtPriceInr && compareAtPriceInr > priceInr && (
        <span className="text-xs text-text-muted line-through">
          {formatINR(compareAtPriceInr)}
        </span>
      )}
    </div>
  );
}
