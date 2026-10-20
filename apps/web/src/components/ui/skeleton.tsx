import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/[0.05] border border-white/5 relative overflow-hidden',
        className
      )}
      {...props}
    />
  );
}
