import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Aurum ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-ivory flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 text-center rounded-2xl border border-red-500/30">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-950/40 text-red-400 border border-red-500/30">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">System Interruption</h2>
            <p className="text-sm text-text-muted mb-6">
              An unexpected anomaly occurred while rendering this view. Your private vault data
              remains secure.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/')}
              >
                Return to Concierge
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload Atelier
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
