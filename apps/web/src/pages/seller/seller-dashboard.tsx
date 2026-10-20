import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatINR, formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { SEO } from '@/components/common/seo';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { success } = useToast();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(10000);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const availableBalance = profile?.seller_balance_inr || 54200;

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPayout(true);
    setTimeout(() => {
      setIsSubmittingPayout(false);
      setIsPayoutModalOpen(false);
      success(`Payout request for ${formatINR(payoutAmount)} submitted for review`);
    }, 1000);
  };

  const sellerPrompts = [
    {
      id: 'p1',
      title: 'Royal Tourbillon: Haute Horlogerie Noir',
      salesCount: 42,
      grossEarnings: 33558,
      status: 'published',
      category: 'IMAGE',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'p2',
      title: 'Aura Nectar: 4K Slow-Motion Perfume Commercial',
      salesCount: 78,
      grossEarnings: 77922,
      status: 'published',
      category: 'VIDEO',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'p3',
      title: 'Kintsugi In Motion: Viscous Gold Macro Dynamics',
      salesCount: 28,
      grossEarnings: 0, // Free
      status: 'published',
      category: 'VIDEO',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Creator Studio & Earnings — Aurum Prompts" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                Creator Atelier
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Seller Dashboard
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage your commercial prompt releases, track gross sales, and withdraw royalties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              onClick={() => navigate('/vault/new')}
              className="gap-2 shadow-gold-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Prompt for Review</span>
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-gold/40 space-y-3 shadow-gold-sm">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Available Royalties</span>
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold-light">
              {formatINR(availableBalance)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full mt-2 gap-1.5"
            >
              <span>Request Payout</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Lifetime Gross Sales</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory">
              {formatINR(111480)}
            </div>
            <p className="text-[11px] text-text-muted font-mono">148 total acquisitions across 3 listings</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Platform Commission</span>
              <Clock className="h-4 w-4 text-champagne" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory">
              15.0%
            </div>
            <p className="text-[11px] text-text-muted font-mono">Standard VIP Creator Tier</p>
          </div>
        </div>

        {/* Published Prompts & Performance Table */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="font-serif text-xl font-bold text-text-ivory">
                Active Marketplace Listings
              </h3>
              <p className="text-xs text-text-muted">Performance breakdown of your approved prompt assets</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="pb-3 font-medium">Prompt Asset</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Sales Count</th>
                  <th className="pb-3 font-medium">Gross Earnings</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sellerPrompts.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-serif font-bold text-text-ivory">{item.title}</td>
                    <td className="py-4 font-mono text-xs text-text-muted">{item.category}</td>
                    <td className="py-4 font-mono text-xs text-text-ivory">{item.salesCount}</td>
                    <td className="py-4 font-serif font-semibold text-gold-light">
                      {formatINR(item.grossEarnings)}
                    </td>
                    <td className="py-4">
                      <span className="inline-block rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-xs text-text-muted">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        maxWidth="md"
        title="Request Royalty Withdrawal"
        description={`Available balance: ${formatINR(availableBalance)}. Payouts are settled directly to Indian Bank Accounts or UPI IDs.`}
      >
        <form onSubmit={handleRequestPayout} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
              Withdrawal Amount (INR)
            </label>
            <input
              type="number"
              min={1000}
              max={availableBalance}
              required
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-elevated p-2.5 text-base font-serif font-bold text-gold-light focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
              Settlement Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={`rounded-lg py-2 text-xs font-medium border ${
                  payoutMethod === 'bank'
                    ? 'border-gold bg-gold/15 text-gold-light'
                    : 'border-white/10 text-text-muted hover:text-text-ivory'
                }`}
              >
                NEFT / RTGS Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`rounded-lg py-2 text-xs font-medium border ${
                  payoutMethod === 'upi'
                    ? 'border-gold bg-gold/15 text-gold-light'
                    : 'border-white/10 text-text-muted hover:text-text-ivory'
                }`}
              >
                UPI ID Instant
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
              {payoutMethod === 'bank' ? 'Account Number & IFSC Code' : 'UPI Virtual Payment Address'}
            </label>
            <input
              type="text"
              required
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={payoutMethod === 'bank' ? 'Account #, Bank Name, IFSC' : 'creator@upi'}
              className="w-full rounded-lg border border-white/10 bg-elevated p-2.5 text-sm text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
            />
          </div>

          <Button type="submit" variant="gold" className="w-full mt-2" isLoading={isSubmittingPayout}>
            Confirm Payout Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
