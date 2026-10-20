import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatINR, formatDate } from '@/lib/utils';
import { SEO } from '@/components/common/seo';

export function OrderReceipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as { promptTitle?: string; amountPaid?: number; paymentId?: string } | null;

  const promptTitle = state?.promptTitle || 'Haute AI Prompt Acquisition';
  const amountPaid = state?.amountPaid !== undefined ? state.amountPaid : 799;
  const paymentId = state?.paymentId || 'pay_test_' + orderId?.slice(0, 8);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Acquisition Receipt — Aurum Prompts" />

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl border border-gold/40 p-8 sm:p-10 space-y-8 shadow-gold-md relative overflow-hidden">
          {/* Success Banner */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/40 shadow-gold-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-gold block">
              Cryptographic Entitlement Granted
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory">
              Acquisition Confirmed
            </h1>
            <p className="text-sm text-text-muted">
              Your commercial reproduction license and prompt decryption key have been committed to
              your private ledger.
            </p>
          </div>

          {/* Receipt Specifications */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5 font-mono">
              <span className="text-text-muted">Order Reference:</span>
              <span className="text-text-ivory">{orderId || 'ord_aurum_102'}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5 font-mono">
              <span className="text-text-muted">Payment ID:</span>
              <span className="text-gold-light">{paymentId}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-text-muted">Acquired Asset:</span>
              <span className="text-text-ivory font-serif font-bold">{promptTitle}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-text-muted">Timestamp:</span>
              <span className="text-text-ivory font-mono">{formatDate(new Date().toISOString())}</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="font-serif font-bold text-text-ivory">Total Amount Settled:</span>
              <span className="font-serif text-2xl font-bold text-gold-light">
                {formatINR(amountPaid)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Button
              variant="gold"
              size="lg"
              onClick={() => navigate('/vault?tab=purchased')}
              className="w-full gap-2 shadow-gold-sm text-base py-3.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Access Decrypted Prompt in Personal Vault</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="glass"
              size="md"
              onClick={handlePrint}
              className="w-full gap-2 border-white/10 hover:border-gold/30"
            >
              <Download className="h-4 w-4 text-gold" />
              <span>Download Official Receipt / Invoice</span>
            </Button>
          </div>

          {/* Security Assurance */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-mono text-text-muted">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Authenticated by Aurum Prompts Zero-Leak Security Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
