import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        gold: 'bg-gold-gradient text-obsidian font-semibold shadow-gold-sm hover:shadow-gold-md hover:brightness-110 border border-gold-light/40',
        outline: 'border border-gold/40 text-gold hover:border-gold hover:bg-gold/10 hover:text-gold-light',
        glass: 'glass-panel text-text-ivory border-white/10 hover:border-gold/50 hover:bg-white/[0.04]',
        ghost: 'text-text-muted hover:text-text-ivory hover:bg-white/[0.04]',
        danger: 'bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/40 hover:border-red-500/60',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md gap-1.5 tracking-wider uppercase',
        md: 'h-10 px-5 text-sm rounded-lg gap-2',
        lg: 'h-12 px-7 text-base rounded-lg gap-2.5 font-semibold',
        icon: 'h-9 w-9 rounded-lg p-0',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
