import { useState } from 'react';
import { Shield, DollarSign, ShoppingCart, Users, Check, X, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatINR, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { SEO } from '@/components/common/seo';

// Demo Recharts Analytics Data
const REVENUE_DATA = [
  { month: 'Jan', revenue: 42000, orders: 48 },
  { month: 'Feb', revenue: 58000, orders: 65 },
  { month: 'Mar', revenue: 76000, orders: 92 },
  { month: 'Apr', revenue: 94000, orders: 114 },
  { month: 'May', revenue: 128000, orders: 156 },
  { month: 'Jun', revenue: 184000, orders: 210 },
];

export function AdminDashboard() {
  const { success } = useToast();

  // Feature Flags State
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [multiSellerEnabled, setMultiSellerEnabled] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  // Moderation Queue State
  const [pendingPrompts, setPendingPrompts] = useState([
    {
      id: 'sub_1',
      title: 'Cinematic Cybernetic Geisha: 8K Neon Portrait',
      creator: 'Kaito Tanaka (kaito@visuals.jp)',
      category: 'IMAGE (Midjourney v6.1)',
      price: 599,
      submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'sub_2',
      title: 'Monolithic Titanium Rover: Mars Surface Traverse',
      creator: 'Aria Thorne (aria@atelier.de)',
      category: 'VIDEO (OpenAI Sora)',
      price: 899,
      submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);

  const handleApprove = (id: string, title: string) => {
    setPendingPrompts((prev) => prev.filter((p) => p.id !== id));
    success(`Approved "${title}" for public marketplace`);
  };

  const handleReject = (id: string, title: string) => {
    setPendingPrompts((prev) => prev.filter((p) => p.id !== id));
    success(`Rejected submission "${title}"`);
  };

  const handleSaveSettings = () => {
    success('Site settings and feature flags updated in database');
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Admin Command Center — Aurum Prompts" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                Full System Governance
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Admin Command Center
            </h1>
          </div>
          <Badge variant="gold" className="uppercase font-mono tracking-widest">
            Role: Super Administrator
          </Badge>
        </div>

        {/* High-Level KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Gross Marketplace Volume</span>
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl font-bold text-gold-light">
              {formatINR(582000)}
            </div>
            <p className="text-[11px] text-emerald-400 font-mono">+24.5% vs last month</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Platform Net Commission</span>
              <Shield className="h-4 w-4 text-champagne" />
            </div>
            <div className="font-serif text-3xl font-bold text-text-ivory">
              {formatINR(87300)}
            </div>
            <p className="text-[11px] text-text-muted font-mono">{commissionRate}% standard take rate</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Verified Orders</span>
              <ShoppingCart className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl font-bold text-text-ivory">685</div>
            <p className="text-[11px] text-emerald-400 font-mono">100% Razorpay settlement rate</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Registered Creators</span>
              <Users className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl font-bold text-text-ivory">142</div>
            <p className="text-[11px] text-text-muted font-mono">Multi-seller mode active</p>
          </div>
        </div>

        {/* Visual Revenue Growth Chart (Recharts) */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-text-ivory">
                Marketplace Gross Volume Curve
              </h3>
              <p className="text-xs text-text-muted">6-month revenue and acquisition trajectory</p>
            </div>
            <span className="text-xs font-mono text-gold-light bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
              Currency: INR (₹)
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9A968C" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#9A968C"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121214',
                    borderColor: 'rgba(201, 162, 75, 0.4)',
                    borderRadius: '0.75rem',
                    color: '#F5F1E8',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatINR(value), 'Gross Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A24B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#goldArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Administration Tabs */}
        <Tabs defaultValue="moderation">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="moderation">Moderation ({pendingPrompts.length})</TabsTrigger>
            <TabsTrigger value="settings">Site Governance</TabsTrigger>
          </TabsList>

          {/* Prompt Moderation Queue */}
          <TabsContent value="moderation" className="space-y-4">
            {pendingPrompts.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-text-muted">
                Zero pending submissions in moderation queue. All community submissions reviewed.
              </div>
            ) : (
              pendingPrompts.map((sub) => (
                <div
                  key={sub.id}
                  className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-text-ivory">{sub.title}</h4>
                    <p className="text-xs text-text-muted">
                      By <span className="text-gold-light">{sub.creator}</span> • {sub.category}
                    </p>
                    <p className="text-[11px] font-mono text-text-muted">
                      Target Listing Price: {formatINR(sub.price)} • Submitted {formatDate(sub.submittedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleApprove(sub.id, sub.title)}
                      className="gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(sub.id, sub.title)}
                      className="gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Site Governance & Feature Flags */}
          <TabsContent value="settings">
            <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 max-w-2xl">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <Sliders className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-xl font-bold text-text-ivory">
                  Global Parameters & Feature Flags
                </h3>
              </div>

              {/* Commission Percentage */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-text-muted">
                  Default Platform Commission Rate (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-32 rounded-lg border border-white/10 bg-surface p-2 text-sm text-gold-light font-mono focus:border-gold focus:outline-none"
                  />
                  <span className="text-xs text-text-muted">
                    Percent retained by platform on community marketplace sales.
                  </span>
                </div>
              </div>

              {/* Multi-Seller Mode Flag */}
              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-text-ivory">ENABLE_MULTI_SELLER</h4>
                  <p className="text-xs text-text-muted">
                    Allows authenticated users to onboard as creators and upload prompts for review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMultiSellerEnabled(!multiSellerEnabled)}
                  className="p-1 text-gold"
                >
                  {multiSellerEnabled ? (
                    <ToggleRight className="h-7 w-7 text-gold" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-text-muted" />
                  )}
                </button>
              </div>

              {/* Maintenance Mode Flag */}
              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-text-ivory">Maintenance Mode</h4>
                  <p className="text-xs text-text-muted">
                    Displays temporary concierge notice and suspends new payment sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className="p-1 text-gold"
                >
                  {maintenanceMode ? (
                    <ToggleRight className="h-7 w-7 text-red-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-text-muted" />
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button variant="gold" onClick={handleSaveSettings}>
                  Save Global Configuration
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
