import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-card flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/10 max-w-lg mx-auto',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold shadow-gold-sm">
        {icon || <Sparkles className="h-8 w-8" />}
      </div>
      <h3 className="text-xl font-serif font-bold text-text-ivory mb-2">{title}</h3>
      <p className="text-sm text-text-muted mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="gold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
