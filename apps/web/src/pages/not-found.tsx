import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/seo';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-background text-text-ivory flex items-center justify-center p-6">
      <SEO title="Page Not Found — Aurum Prompts" />
      <div className="glass-card max-w-md w-full p-10 text-center rounded-3xl border border-white/10 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30 shadow-gold-sm">
          <Compass className="h-8 w-8" />
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold block mb-1">
            Error 404
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-ivory">
            Uncharted Territory
          </h1>
          <p className="text-sm text-text-muted mt-2">
            The atelier asset or sanctuary room you requested does not exist or has been relocated.
          </p>
        </div>

        <Button
          variant="gold"
          onClick={() => navigate('/')}
          className="gap-2 mx-auto shadow-gold-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Vault Home</span>
        </Button>
      </div>
    </div>
  );
}
