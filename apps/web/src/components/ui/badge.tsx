import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        gold: 'bg-gold/15 text-gold-light border border-gold/30',
        outline: 'border border-white/15 text-text-muted',
        glass: 'glass-panel text-text-ivory border-white/10',
        success: 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30',
        warning: 'bg-amber-950/40 text-amber-300 border border-amber-500/30',
        video: 'bg-indigo-950/50 text-indigo-300 border border-indigo-500/40',
        image: 'bg-amber-950/50 text-amber-200 border border-amber-500/40',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
