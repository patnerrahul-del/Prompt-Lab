import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Tag, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { paymentProvider } from '@/lib/payment/razorpay';
import { SEO } from '@/components/common/seo';

export function OrderSummary() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { allPrompts } = useMarketplace();
  const { user, profile, isUser, openAuthModal } = useAuth();
  const { success, error: toastError } = useToast();

  const prompt = allPrompts.find((p) => p.id === promptId) || allPrompts[0];

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountInr: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = prompt?.price_inr || 0;
  const discount = appliedCoupon?.discountInr || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'AURUMVIP') {
      const disc = Math.round((subtotal * 25) / 100);
      setAppliedCoupon({ code, discountInr: disc });
      success('25% VIP Collector Discount Applied');
    } else if (code === 'GOLDEN100') {
      setAppliedCoupon({ code, discountInr: Math.min(100, subtotal) });
      success('₹100 Flat Golden Voucher Applied');
    } else {
      toastError('Invalid or expired coupon code');
    }
  };

  const handleCheckout = async () => {
    if (!isUser) {
      openAuthModal();
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order on server (or test simulator)
      const order = await paymentProvider.createOrder({
        promptId: prompt.id,
        couponCode: appliedCoupon?.code,
        customerEmail: user?.email || profile?.email || 'collector@aurumprompts.com',
        customerName: profile?.full_name || undefined,
      });

      // 2. Open client-side Razorpay modal
      paymentProvider.openCheckout(
        order,
        async (result) => {
          // Verify on backend fallback
          await paymentProvider.verifyPayment(result);
          success('Acquisition confirmed. Entitlement registered.');
          navigate(`/checkout/receipt/${result.orderId}`, {
            state: {
              promptTitle: prompt.title,
              amountPaid: total,
              paymentId: result.paymentId,
            },
          });
        },
        () => {
          setIsProcessing(false);
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout initiation failed';
      toastError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Secure Checkout — Aurum Prompts" />

      <div className="max-w-3xl mx-auto space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-text-muted hover:text-text-ivory"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Catalog</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gold">
              Encrypted Checkout
            </span>
            <h1 className="text-3xl font-serif font-bold text-text-ivory">
              Commercial Acquisition
            </h1>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Selected Atelier Item
              </span>
              <h3 className="font-serif text-xl font-bold text-text-ivory mt-1">
                {prompt.title}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Target Model: {prompt.model?.name || 'Multi-model compatible'}
              </p>
            </div>
            <span className="font-serif text-2xl font-bold text-gold-light">
              {formatINR(subtotal)}
            </span>
          </div>

          {/* Coupon Input Form */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-muted">
              Collector Voucher Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code (e.g. AURUMVIP)"
                  className="w-full rounded-lg border border-white/10 bg-surface pl-9 pr-4 py-2 text-xs uppercase font-mono text-text-ivory focus:border-gold focus:outline-none"
                />
              </div>
              <Button type="button" variant="glass" size="sm" onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-white/10 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Item Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Voucher Discount ({appliedCoupon?.code})</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-serif font-bold text-text-ivory pt-3 border-t border-white/10">
              <span>Total Investment</span>
              <span className="text-gold-light text-2xl">{formatINR(total)}</span>
            </div>
          </div>

          {/* Security & Checkout Action */}
          <div className="pt-4 space-y-4">
            <Button
              variant="gold"
              size="lg"
              onClick={handleCheckout}
              isLoading={isProcessing}
              className="w-full text-base py-3.5 shadow-gold-md gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Complete Secure Acquisition • {formatINR(total)}</span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-text-muted">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
              <span>Razorpay 256-bit Encrypted Settlement • Immediate Entitlement Activation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
