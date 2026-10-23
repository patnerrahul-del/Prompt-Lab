import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Key,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Vault,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useVault } from '@/hooks/use-vault';
import { useToast } from '@/components/ui/toast';
import { formatINR, formatDate } from '@/lib/utils';
import { SEO } from '@/components/common/seo';
import type { UserRole } from '@/types/database.types';

export function UserDashboard() {
  const { user, profile, role, setRole, isAdmin, signOut, isSubscribed, toggleSubscription } = useAuth();
  const { allPrompts, orders } = useMarketplace();
  const { prompts: vaultPrompts } = useVault();
  const { success } = useToast();
  const navigate = useNavigate();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isGoogleUser = user?.app_metadata?.provider === 'google' || user?.email?.includes('google') || user?.email?.includes('@gmail.com');

  // Supabase Project Ref & OAuth Callback URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const supabaseOAuthCallback = `${supabaseUrl}/auth/v1/callback`;
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://aurumprompts.com';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Purchased or complimentary unlocked prompts (or ALL prompts if user holds VIP Subscription!)
  const unlockedPrompts = isSubscribed
    ? allPrompts
    : allPrompts.filter((p) => p.price_inr === 0 || p.has_purchased);

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title="User Control Panel & Collector Profile — Aurum Prompts"
        description="Manage your AI prompt vault, unlocked commercial acquisitions, and Google OAuth security settings."
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* TOP PROFILE & CREDENTIALS BANNER */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 bg-surface/80 relative overflow-hidden shadow-luxury">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Identity Details */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gold/20 border border-gold/40 text-gold-light font-serif font-bold text-2xl shadow-gold-sm overflow-hidden">
                  {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                    <img
                      src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                      alt={profile?.full_name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {isGoogleUser && (
                  <div
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-surface border border-white/20 p-1 flex items-center justify-center shadow"
                    title="Authenticated via Google OAuth"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-ivory">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Authenticated Collector'}
                  </h1>
                  <Badge variant={role === 'admin' ? 'gold' : role === 'seller' ? 'warning' : 'outline'}>
                    {role === 'admin' ? 'Master Admin' : role === 'seller' ? 'Verified Seller' : 'Collector'}
                  </Badge>
                </div>

                <p className="text-sm font-mono text-text-muted flex items-center gap-2">
                  <span>{user?.email || profile?.email || 'collector@aurumprompts.com'}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isGoogleUser ? 'Google SSO Connected' : 'Email Verified'}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Role Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAdmin && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2 shadow-gold-sm"
                >
                  <Shield className="h-4 w-4" />
                  <span>Open Admin Studio</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/vault/new')}
                className="gap-2"
              >
                <Vault className="h-4 w-4 text-gold" />
                <span>+ Create Vault Prompt</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-red-300 hover:bg-red-950/30"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Role Sandbox & Simulation Toolbar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-text-muted font-mono">
              <Key className="h-3.5 w-3.5 text-gold" />
              <span>Permission Role Sandbox:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['user', 'seller', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    success(`Active role switched to: ${r.toUpperCase()}`);
                  }}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                    role === r
                      ? 'bg-gold-gradient text-obsidian font-bold shadow-gold-sm'
                      : 'border border-white/10 bg-white/[0.04] text-text-muted hover:text-text-ivory'
                  }`}
                >
                  {r === 'admin' ? '🛡️ Admin' : r === 'seller' ? '💼 Seller' : '👤 User'}
                </button>
              ))}
            </div>
          </div>

          {/* VIP All-Access Subscription Card */}
          <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="font-serif font-bold text-sm text-text-ivory">
                  Aurum VIP All-Access Membership Pass
                </span>
                <Badge variant={isSubscribed ? 'gold' : 'outline'} className="text-[10px] font-mono uppercase">
                  {isSubscribed ? '👑 ACTIVE SUBSCRIBER' : 'FREE TIER'}
                </Badge>
              </div>
              <p className="text-xs text-text-muted">
                {isSubscribed
                  ? 'All paid Image & Video prompts unlocked. 1-click copy, .TXT export, and .PDF dossier download enabled.'
                  : 'Activate VIP Membership to instantly unlock all paid prompts with 1-click copy, .TXT download, and .PDF export.'}
              </p>
            </div>
            <Button
              variant={isSubscribed ? 'glass' : 'gold'}
              size="sm"
              onClick={() => {
                toggleSubscription();
                success(isSubscribed ? 'VIP Subscription paused' : '🎉 VIP All-Access Subscription Activated! All paid prompts unlocked.');
              }}
              className="text-xs font-semibold whitespace-nowrap"
            >
              {isSubscribed ? 'Pause VIP' : '👑 Activate VIP Pass'}
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS METRICS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Unlocked Prompts
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-light">
              {unlockedPrompts.length}
            </div>
          </div>
          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Private Vault Prompts
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-ivory">
              {vaultPrompts.length}
            </div>
          </div>
          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Settled Acquisitions
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-ivory">
              {orders.length}
            </div>
          </div>
          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Commercial License
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
              Active
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DASHBOARD TABS */}
        {/* ========================================================================= */}
        <Tabs defaultValue="acquisitions" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="acquisitions" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Unlocked ({unlockedPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-2">
              <Vault className="h-4 w-4" />
              <span>Personal Vault ({vaultPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Invoices & Razorpay</span>
            </TabsTrigger>
            <TabsTrigger value="google_creds" className="gap-2">
              <Key className="h-4 w-4" />
              <span>Google Credentials</span>
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: UNLOCKED ACQUISITIONS */}
          {/* ========================================================================= */}
          <TabsContent value="acquisitions" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h2 className="font-serif text-xl font-bold text-text-ivory">
                Your Certified Unlocked Prompts
              </h2>
              <span className="text-xs font-mono text-text-muted">
                Immediate zero-leak commercial atelier access
              </span>
            </div>

            {unlockedPrompts.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center space-y-4">
                <Lock className="h-10 w-10 text-gold mx-auto" />
                <h3 className="font-serif text-lg font-bold">No prompts unlocked yet</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Acquire premium prompts from the curated marketplace or unlock complimentary assets.
                </p>
                <Button variant="gold" size="sm" onClick={() => navigate('/browse')}>
                  Explore Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card rounded-2xl border border-white/10 hover:border-gold/40 p-5 space-y-4 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-elevated border border-white/5">
                        <img
                          src={p.media?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-2 left-2 rounded-md bg-obsidian/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono uppercase text-gold-light border border-gold/30">
                          {p.category?.type || 'PROMPT'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-text-ivory text-base line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-text-muted line-clamp-2 mt-1">
                          {p.short_description || p.teaser}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {p.price_inr === 0 ? 'Complimentary' : 'Verified License'}
                      </span>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => navigate(`/prompt/${p.slug}`)}
                        className="gap-1.5 text-xs"
                      >
                        <span>Open Atelier</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: MY PERSONAL VAULT */}
          {/* ========================================================================= */}
          <TabsContent value="vault" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h2 className="font-serif text-xl font-bold text-text-ivory">
                Personal Vault Workflows
              </h2>
              <Button
                variant="gold"
                size="sm"
                onClick={() => navigate('/vault/new')}
                className="gap-1.5 text-xs"
              >
                <span>+ Create New Prompt</span>
              </Button>
            </div>

            {vaultPrompts.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center space-y-4">
                <Vault className="h-10 w-10 text-gold mx-auto" />
                <h3 className="font-serif text-lg font-bold">Your private vault is empty</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Save your confidential AI prompt iterations, test variations, and publish them to the store when ready.
                </p>
                <Button variant="gold" size="sm" onClick={() => navigate('/vault/new')}>
                  Create Your First Prompt
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vaultPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card rounded-2xl border border-white/10 hover:border-gold/40 p-5 space-y-4 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                        <span className="capitalize">{p.visibility}</span>
                        <span>{formatDate(p.created_at)}</span>
                      </div>
                      <h4 className="font-serif font-bold text-text-ivory text-base">
                        {p.title}
                      </h4>
                      <p className="text-xs text-text-muted line-clamp-2">
                        {p.teaser || p.short_description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vault/edit/${p.id}`)}
                        className="text-xs"
                      >
                        Edit in Vault
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/prompt/${p.slug}`)}
                        className="text-xs text-gold-light"
                      >
                        View Page
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: ORDERS & RAZORPAY INVOICES */}
          {/* ========================================================================= */}
          <TabsContent value="orders" className="space-y-4">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Settled Transactions & Invoices
                  </h3>
                  <p className="text-xs text-text-muted">
                    Official 256-bit encrypted Razorpay transaction receipts
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {orders.length} Invoices
                </Badge>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-muted">
                  No billing history recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                        <th className="pb-3 font-medium">Order Reference</th>
                        <th className="pb-3 font-medium">Asset Acquired</th>
                        <th className="pb-3 font-medium">Settled Amount</th>
                        <th className="pb-3 font-medium">Razorpay Payment ID</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono text-xs text-text-ivory">{ord.id}</td>
                          <td className="py-3 font-serif font-bold text-text-ivory max-w-xs truncate">
                            {(ord.metadata as any)?.prompt_title || 'Certified Haute Prompt'}
                          </td>
                          <td className="py-3 font-serif font-semibold text-gold-light">
                            {formatINR(ord.total_inr)}
                          </td>
                          <td className="py-3 font-mono text-xs text-gold">
                            {ord.razorpay_payment_id || 'pay_test_simulated'}
                          </td>
                          <td className="py-3">
                            <span className="inline-block rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono uppercase text-emerald-300">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-xs text-text-muted">
                            {formatDate(ord.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: GOOGLE LOGIN & CLOUD CREDENTIALS SETUP */}
          {/* ========================================================================= */}
          <TabsContent value="google_creds" className="space-y-6">
            <div className="glass-card rounded-2xl border border-gold/30 bg-surface/90 p-6 sm:p-8 space-y-6 shadow-gold-sm">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-surface border border-white/20 shadow">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-text-ivory">
                      Google OAuth & Cloud Console Setup
                    </h3>
                    <p className="text-xs text-text-muted">
                      Complete credential parameters required to enable 1-click Google Sign-In for User and Admin panels
                    </p>
                  </div>
                </div>

                <Badge variant="gold" className="font-mono text-xs uppercase">
                  Production Guide
                </Badge>
              </div>

              {/* Step 1: Google Cloud Console */}
              <div className="space-y-3">
                <h4 className="font-serif text-base font-semibold text-gold-light flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-mono">1</span>
                  <span>Google Cloud Console (Credentials Creation)</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">Google Cloud Console Credentials <ExternalLink className="h-3 w-3" /></a>, select or create your project, and click <strong>Create Credentials &rarr; OAuth Client ID</strong> (Application type: <em>Web application</em>).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Authorized JavaScript Origins */}
                  <div className="rounded-xl border border-white/10 bg-elevated p-4 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                      Authorized JavaScript Origins
                    </span>
                    <div className="flex items-center justify-between bg-black/40 rounded-lg p-2.5 font-mono text-xs text-text-ivory border border-white/5">
                      <span className="truncate">{appOrigin}</span>
                      <button
                        onClick={() => copyToClipboard(appOrigin, 'Authorized Origin')}
                        className="text-text-muted hover:text-gold ml-2"
                        title="Copy Origin"
                      >
                        {copiedField === 'Authorized Origin' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Also add <code>http://localhost:5173</code> for local testing.
                    </p>
                  </div>

                  {/* Authorized Redirect URIs */}
                  <div className="rounded-xl border border-white/10 bg-elevated p-4 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gold-light block">
                      Authorized Redirect URI (Crucial)
                    </span>
                    <div className="flex items-center justify-between bg-black/40 rounded-lg p-2.5 font-mono text-xs text-gold border border-gold/30">
                      <span className="truncate">{supabaseOAuthCallback}</span>
                      <button
                        onClick={() => copyToClipboard(supabaseOAuthCallback, 'OAuth Callback URI')}
                        className="text-text-muted hover:text-gold ml-2"
                        title="Copy Callback URI"
                      >
                        {copiedField === 'OAuth Callback URI' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Must match exactly in Google Cloud Console.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Supabase Provider Setup */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="font-serif text-base font-semibold text-gold-light flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-mono">2</span>
                  <span>Connect Google Credentials in Supabase Dashboard</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="h-3 w-3" /></a> &rarr; <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Google</strong>.
                </p>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-text-muted">1. Enable Google provider:</span>
                    <span className="text-emerald-400 font-bold">Toggle ON</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-text-muted">2. Client ID:</span>
                    <span className="text-text-ivory">Paste from Google Cloud (e.g. 12345...apps.googleusercontent.com)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-muted">3. Client Secret:</span>
                    <span className="text-text-ivory">Paste from Google Cloud (GOCSPX-...)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Admin Automatic Role Grant */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="font-serif text-base font-semibold text-gold-light flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-mono">3</span>
                  <span>Automatic Admin Privileges for Google Login</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  To automatically grant your Google Account full <strong>Master Admin</strong> access whenever you log in with Google, add your Gmail in <code>.env</code>:
                </p>

                <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 font-mono text-xs flex items-center justify-between text-gold">
                  <code>VITE_ADMIN_EMAILS=your.email@gmail.com,concierge@aurumprompts.com</code>
                  <button
                    onClick={() => copyToClipboard('VITE_ADMIN_EMAILS=your.email@gmail.com,concierge@aurumprompts.com', 'Admin Email Env')}
                    className="text-text-muted hover:text-gold ml-2"
                  >
                    {copiedField === 'Admin Email Env' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
