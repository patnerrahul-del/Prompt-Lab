import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'right' | 'left' | 'bottom';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 max-w-xl w-full translate-x-0',
    left: 'inset-y-0 left-0 max-w-xl w-full translate-x-0',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] h-auto rounded-t-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bg-surface border-l border-white/10 p-6 text-text-ivory shadow-2xl flex flex-col z-10 transition-transform overflow-y-auto',
          sideClasses[side],
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          {title && <h2 className="text-xl font-serif font-bold text-text-ivory">{title}</h2>}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-ivory hover:bg-white/5 transition-colors ml-auto"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
