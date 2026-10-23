import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  DollarSign,
  ShoppingCart,
  Users,
  Check,
  Sliders,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Film,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Trash2,
  Star,
  Layers,
  Search,
  Download,
  Tag,
  CheckCircle2,
  Building2,
  Wallet,
  MessageSquare,
  BarChart3,
  Gift,
  Key,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { formatINR, formatDate, extractVariables } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useMarketplace } from '@/hooks/use-marketplace';
import { SEO } from '@/components/common/seo';
import { getSecurityIncidents, simulateAttackProbe, type SecurityIncident } from '@/lib/security/audit';
import type { PromptDifficulty, PromptLicenseType, PromptCategoryType } from '@/types/database.types';

// ==============================================================================
// ERP & CRM DATA STRUCTURES
// ==============================================================================
interface CRMCustomer {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'email';
  tier: 'VIP Collector' | 'Standard' | 'Enterprise';
  ordersCount: number;
  lifetimeValueInr: number;
  status: 'active' | 'suspended';
  lastActive: string;
}

interface SellerPartner {
  id: string;
  name: string;
  email: string;
  promptsCount: number;
  totalGmvInr: number;
  commissionRate: number;
  pendingBalanceInr: number;
  payoutUpi: string;
}

interface CouponCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  timesUsed: number;
  maxUses: number;
  expiryDate: string;
  isActive: boolean;
}

interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'resolved';
  createdAt: string;
}

// Financial Analytics Data
const REVENUE_DATA = [
  { month: 'Jan', gross: 240000, net: 36000, orders: 120 },
  { month: 'Feb', gross: 380000, net: 57000, orders: 185 },
  { month: 'Mar', gross: 560000, net: 84000, orders: 270 },
  { month: 'Apr', gross: 820000, net: 123000, orders: 395 },
  { month: 'May', gross: 1240000, net: 186000, orders: 580 },
  { month: 'Jun', gross: 1840000, net: 276000, orders: 840 },
];

export function AdminDashboard() {
  const { success, error: toastError } = useToast();
  const { allPrompts, orders, addMarketplacePrompt, deleteMarketplacePrompt, toggleFeatured } = useMarketplace();

  // Active ERP/CRM Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'customers' | 'sellers' | 'orders' | 'coupons' | 'tickets' | 'security' | 'settings'>('overview');

  // Collapsible Sidebar & Mobile Drawer State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aurum_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState('');

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aurum_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Security Audit & Intrusion Detection State
  const [securityLogs, setSecurityLogs] = useState<SecurityIncident[]>(() => getSecurityIncidents());

  // Governance & ERP Global Parameters
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [multiSellerEnabled, setMultiSellerEnabled] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  // New Prompt Studio Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<PromptCategoryType>('IMAGE');
  const [newTargetModel, setNewTargetModel] = useState('Midjourney v6.1');
  const [newMasterPrompt, setNewMasterPrompt] = useState('');
  const [newNegativePrompt, setNewNegativePrompt] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState('16:9');
  const [newDuration, setNewDuration] = useState('5s');
  const [isFree, setIsFree] = useState(false);
  const [newPriceInr, setNewPriceInr] = useState<number>(599);
  const [newCompareAtPrice, setNewCompareAtPrice] = useState<number>(1199);
  const [isFeatured, setIsFeatured] = useState(true);
  const [newDifficulty] = useState<PromptDifficulty>('advanced');
  const [newLicenseType] = useState<PromptLicenseType>('commercial');

  // Media inputs
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [isPublishing, setIsPublishing] = useState(false);

  // ==============================================================================
  // CRM STATE: CUSTOMERS
  // ==============================================================================
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<CRMCustomer[]>([
    {
      id: 'cust_01',
      name: 'Rahul Chandrabanshi',
      email: 'collector.google@aurumprompts.com',
      provider: 'google',
      tier: 'VIP Collector',
      ordersCount: 14,
      lifetimeValueInr: 12850,
      status: 'active',
      lastActive: new Date().toISOString(),
    },
    {
      id: 'cust_02',
      name: 'Elena Rostova',
      email: 'elena@vogue-paris.com',
      provider: 'google',
      tier: 'Enterprise',
      ordersCount: 28,
      lifetimeValueInr: 34900,
      status: 'active',
      lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'cust_03',
      name: 'Julian Thorne',
      email: 'julian@thorne-studios.co.uk',
      provider: 'email',
      tier: 'VIP Collector',
      ordersCount: 9,
      lifetimeValueInr: 8900,
      status: 'active',
      lastActive: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'cust_04',
      name: 'Marcus Vance',
      email: 'marcus.vance@cinematic.io',
      provider: 'google',
      tier: 'Standard',
      ordersCount: 3,
      lifetimeValueInr: 2199,
      status: 'active',
      lastActive: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]);

  // ==============================================================================
  // CRM STATE: SELLERS & CREATORS
  // ==============================================================================
  const [sellers, setSellers] = useState<SellerPartner[]>([
    {
      id: 'sel_01',
      name: 'Kaito Tanaka Studio',
      email: 'kaito@visuals.jp',
      promptsCount: 18,
      totalGmvInr: 245000,
      commissionRate: 15,
      pendingBalanceInr: 42500,
      payoutUpi: 'kaito.tokyo@okaxis',
    },
    {
      id: 'sel_02',
      name: 'Aurelia Dupont',
      email: 'aurelia@haute-ai.fr',
      promptsCount: 12,
      totalGmvInr: 189000,
      commissionRate: 15,
      pendingBalanceInr: 28900,
      payoutUpi: 'aurelia@okhdfcbank',
    },
    {
      id: 'sel_03',
      name: 'Sora Motion Collective',
      email: 'sora@creativefilms.la',
      promptsCount: 24,
      totalGmvInr: 410000,
      commissionRate: 15,
      pendingBalanceInr: 68000,
      payoutUpi: 'soramotion@icici',
    },
  ]);

  // ==============================================================================
  // MARKETING & CRM: COUPONS ENGINE
  // ==============================================================================
  const [coupons, setCoupons] = useState<CouponCode[]>([
    {
      id: 'cp_1',
      code: 'AURUMVIP',
      discountType: 'percentage',
      discountValue: 25,
      timesUsed: 142,
      maxUses: 500,
      expiryDate: '2026-12-31',
      isActive: true,
    },
    {
      id: 'cp_2',
      code: 'GOLDEN100',
      discountType: 'flat',
      discountValue: 100,
      timesUsed: 389,
      maxUses: 1000,
      expiryDate: '2026-12-31',
      isActive: true,
    },
    {
      id: 'cp_3',
      code: 'LAUNCH50',
      discountType: 'percentage',
      discountValue: 50,
      timesUsed: 50,
      maxUses: 50,
      expiryDate: '2026-06-30',
      isActive: false,
    },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(20);
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');

  // ==============================================================================
  // SUPPORT & DISPUTE TICKETS
  // ==============================================================================
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt_01',
      customerName: 'Elena Rostova',
      customerEmail: 'elena@vogue-paris.com',
      subject: 'Inquiry regarding 8K Billboard Commercial License Extension',
      priority: 'urgent',
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'tkt_02',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus.vance@cinematic.io',
      subject: 'Assistance with Runway Gen-3 60fps Motion Interpolation parameters',
      priority: 'medium',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ]);

  // Form submission: Create and Publish new prompt to live marketplace
  const handlePublishPrompt = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMasterPrompt.trim()) {
      toastError('Title and Master Prompt are mandatory.');
      return;
    }

    setIsPublishing(true);
    try {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      const parsedVars = extractVariables(newMasterPrompt).map((v) => ({
        name: v,
        label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        default_value: '',
      }));

      const isVideo = newCategoryType === 'VIDEO';

      await addMarketplacePrompt({
        title: newTitle.trim(),
        slug: generatedSlug,
        short_description: newDescription.trim() || null,
        full_prompt_text: newMasterPrompt.trim(),
        negative_prompt: newNegativePrompt.trim() || null,
        price_inr: isFree ? 0 : Number(newPriceInr),
        compare_at_price_inr: isFree ? null : Number(newCompareAtPrice),
        is_featured: isFeatured,
        difficulty: newDifficulty,
        license_type: newLicenseType,
        settings: {
          aspect_ratio: newAspectRatio,
          duration: isVideo ? newDuration : undefined,
          target_engine: newTargetModel,
        },
        variables: parsedVars,
        category: {
          id: 'cat_' + Math.random().toString(36).substring(2, 8),
          name: isVideo ? 'Generative Video' : 'Haute Image',
          slug: isVideo ? 'generative-video' : 'haute-image',
          type: newCategoryType,
          description: null,
          icon: isVideo ? 'Film' : 'Image',
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
        model: {
          id: 'mod_' + Math.random().toString(36).substring(2, 8),
          name: newTargetModel,
          slug: newTargetModel.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: newCategoryType,
          copy_template: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
        media: [
          {
            id: 'm_' + Math.random().toString(36).substring(2, 8),
            prompt_id: '',
            media_type: isVideo ? 'VIDEO' : 'IMAGE',
            url: isVideo ? videoUrl : coverImageUrl,
            thumbnail_url: coverImageUrl,
            display_order: 0,
            is_cover: true,
            created_at: new Date().toISOString(),
          },
        ],
      });

      success(`Master prompt "${newTitle}" published live to marketplace`);
      // Reset studio
      setNewTitle('');
      setNewDescription('');
      setNewMasterPrompt('');
      setNewNegativePrompt('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish prompt';
      toastError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  // ERP Actions
  const handleApprovePayout = (sellerId: string, name: string, amount: number) => {
    setSellers(sellers.map((s) => (s.id === sellerId ? { ...s, pendingBalanceInr: 0 } : s)));
    success(`Settled ${formatINR(amount)} payout to ${name} via Razorpay Route.`);
  };

  const handleToggleCustomerStatus = (customerId: string) => {
    setCustomers(
      customers.map((c) =>
        c.id === customerId ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c
      )
    );
    success('Customer account permissions updated');
  };

  const handleCreateCoupon = (e: FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const cleanCode = newCouponCode.trim().toUpperCase();
    const newC: CouponCode = {
      id: 'cp_' + Math.random().toString(36).substring(2, 8),
      code: cleanCode,
      discountType: newCouponType,
      discountValue: Number(newCouponDiscount),
      timesUsed: 0,
      maxUses: 250,
      expiryDate: '2026-12-31',
      isActive: true,
    };
    setCoupons([newC, ...coupons]);
    setNewCouponCode('');
    success(`Voucher code "${cleanCode}" registered in marketing engine`);
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: 'resolved' } : t)));
    success('Ticket marked as resolved');
  };

  const handleTriggerSimulatedProbe = () => {
    const probe = simulateAttackProbe();
    setSecurityLogs(getSecurityIncidents());
    toastError(`🚨 ATTACK INTERCEPTED & BLOCKED: ${probe.threatType.replace(/_/g, ' ')} from ${probe.source} was BLOCKED by Firewall!`);
  };

  const handleClearSecurityLogs = () => {
    localStorage.removeItem('aurum_security_audit_events');
    setSecurityLogs(getSecurityIncidents());
    success('Security incident audit logs reset to baseline.');
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const navGroups = [
    {
      group: 'Core Financials',
      items: [
        { id: 'overview' as const, label: 'ERP Financial Ledger', short: 'Ledger', icon: BarChart3, desc: 'Balance sheet, GMV, and net revenue' },
        { id: 'orders' as const, label: 'Order Transactions', short: 'Orders', icon: ShoppingCart, badge: orders.length, desc: 'Real-time sales & receipts' },
      ],
    },
    {
      group: 'Catalog & Studio',
      items: [
        { id: 'studio' as const, label: 'Prompt Studio & SKUs', short: 'Studio', icon: Sparkles, isHighlight: true, desc: 'Post new text, image & video prompts' },
      ],
    },
    {
      group: 'CRM & Network',
      items: [
        { id: 'customers' as const, label: 'CRM Collectors', short: 'Collectors', icon: Users, badge: customers.length, desc: 'VIP profiles, lifetime value, and status' },
        { id: 'sellers' as const, label: 'Creator Disbursements', short: 'Sellers', icon: Building2, badge: sellers.length, desc: 'Partner commission payouts & UPI' },
      ],
    },
    {
      group: 'Growth & Support',
      items: [
        { id: 'coupons' as const, label: 'Promotional Vouchers', short: 'Vouchers', icon: Gift, badge: coupons.length, desc: 'Discount campaigns & coupon codes' },
        { id: 'tickets' as const, label: 'Concierge Helpdesk', short: 'Support', icon: MessageSquare, badge: tickets.filter(t => t.status === 'open').length, badgeColor: 'bg-gold/20 text-gold-light border-gold/40', desc: 'Customer service resolution center' },
      ],
    },
    {
      group: 'Defense & Governance',
      items: [
        { id: 'security' as const, label: 'Cyber Shield & IDS', short: 'Security', icon: Shield, badge: securityLogs.length, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40', desc: 'Real-time intrusion detection and logs' },
        { id: 'settings' as const, label: 'Platform Governance', short: 'Settings', icon: Sliders, desc: 'Global commission rules & OAuth' },
      ],
    },
  ];

  const currentTabMeta = {
    overview: { title: 'ERP Financial Ledger', desc: 'Gross merchandise volume, retained platform revenue, and fiscal balance sheets' },
    studio: { title: 'Master Prompt Studio', desc: 'Author and distribute verified text, image, and generative video prompts' },
    customers: { title: 'CRM Collector Directory', desc: 'VIP customer accounts, lifetime value, and order history' },
    sellers: { title: 'Creator Partner Disbursements', desc: 'Creator network revenue shares, UPI payouts, and approvals' },
    orders: { title: 'Live Order Ledger', desc: 'Real-time Razorpay payments, customer receipts, and SKU delivery' },
    coupons: { title: 'Promotional Voucher Engine', desc: 'Campaign discount codes, redemptions, and margin governance' },
    tickets: { title: 'Concierge Helpdesk', desc: 'Customer support inquiries, SLA resolutions, and order disputes' },
    security: { title: 'Cyber Shield & IDS Defense', desc: 'Cryptographic HMAC protection, anti-leak RLS, and attack mitigation' },
    settings: { title: 'Platform Governance & Cloud', desc: 'Global commission rules, maintenance mode, and OAuth credentials' },
  }[activeTab];

  return (
    <div className="min-h-screen bg-[#070709] text-text-ivory flex selection:bg-gold/30 font-sans">
      <SEO
        title="Aurum Enterprise ERP & CRM Command Center"
        description="Comprehensive enterprise resource planning, financial ledger, CRM collector directory, and prompt asset studio."
      />

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ========================================================================= */}
      {/* ENTERPRISE COLLAPSIBLE SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0b0c10]/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
      >
        {/* SIDEBAR HEADER / BRAND */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold via-champagne to-gold-dark p-0.5 shadow-gold-sm shrink-0 flex items-center justify-center">
              <div className="h-full w-full bg-black/90 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-bold tracking-widest text-text-ivory uppercase truncate">
                    Aurum ERP
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-gold/20 text-gold-light border border-gold/30">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted truncate">
                  Executive Suite v2.4
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden h-8 w-8 p-0 text-text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex h-8 w-8 p-0 text-text-muted hover:text-gold hover:bg-gold/10 rounded-lg"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* SIDEBAR QUICK SEARCH FILTER (WHEN EXPANDED) */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                placeholder="Filter ERP modules..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-ivory placeholder:text-text-muted/60 focus:outline-none focus:border-gold/50 transition-all font-mono"
              />
              {sidebarFilter && (
                <button
                  onClick={() => setSidebarFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* NAVIGATION ITEMS LIST */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 custom-scrollbar">
          {navGroups.map((grp) => {
            const filteredItems = grp.items.filter(
              (item) =>
                !sidebarFilter ||
                item.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
                item.desc.toLowerCase().includes(sidebarFilter.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={grp.group} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-text-muted/60 font-semibold">
                    {grp.group}
                  </div>
                )}
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileOpen(false);
                      }}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full group relative flex items-center rounded-xl transition-all duration-200 ${
                        isSidebarCollapsed
                          ? 'justify-center h-11'
                          : 'gap-3 px-3 py-2 text-left'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-gold/25 via-gold/15 to-transparent border border-gold/40 text-gold-light font-semibold shadow-gold-sm'
                          : 'text-text-muted hover:text-text-ivory hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-gold rounded-r-full shadow-gold-sm" />
                      )}

                      <Icon
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-gold'
                            : item.isHighlight
                            ? 'text-champagne'
                            : 'text-text-muted group-hover:text-gold-light'
                        } ${isSidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`}
                      />

                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs truncate font-medium">
                              {item.label}
                            </span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                                  item.badgeColor ||
                                  'bg-white/10 text-text-muted border-white/20'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-muted/70 truncate font-light">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-black/40">
          {/* Link to public store */}
          <Link
            to="/"
            title="Visit public storefront"
            className={`flex items-center rounded-xl border border-white/10 hover:border-gold/40 hover:bg-gold/5 text-text-muted hover:text-gold-light transition-all text-xs font-mono ${
              isSidebarCollapsed
                ? 'justify-center h-10 w-full'
                : 'gap-2.5 px-3 py-2 w-full'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5 text-gold" />
            {!isSidebarCollapsed && <span>Public Storefront</span>}
          </Link>

          {/* System status pill */}
          {!isSidebarCollapsed && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-300 font-semibold uppercase">
                  Razorpay & Supabase
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">LIVE</span>
            </div>
          )}

          {/* Admin User Card */}
          <div
            className={`flex items-center rounded-xl p-2 bg-surface/80 border border-white/5 ${
              isSidebarCollapsed ? 'justify-center' : 'gap-2.5'
            }`}
          >
            <div className="h-7 w-7 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center font-serif text-xs font-bold text-gold shrink-0">
              RC
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-text-ivory truncate">
                  Rahul Chandrabanshi
                </span>
                <span className="text-[10px] font-mono text-gold-light truncate">
                  Super Administrator
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT & EXECUTIVE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* EXECUTIVE STICKY TOPBAR */}
        <header className="sticky top-0 z-30 h-16 bg-[#0b0c10]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile trigger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden h-9 w-9 p-0 text-text-ivory"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={toggleSidebar}
              className="hidden lg:flex h-9 w-9 p-0 text-text-muted hover:text-gold"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 text-xs font-mono text-text-muted min-w-0">
              <span className="hidden sm:inline text-gold font-bold">AURUM ERP</span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted/60 shrink-0" />
              <span className="text-text-ivory font-semibold truncate font-serif text-sm">
                {currentTabMeta.title}
              </span>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cyber Shield Status Pill */}
            <button
              onClick={() => setActiveTab('security')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:bg-emerald-500/20 transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Shield: Armed</span>
              {securityLogs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                  {securityLogs.length} events
                </span>
              )}
            </button>

            {/* Quick Post Prompt Shortcut */}
            <Button
              variant="gold"
              size="sm"
              onClick={() => setActiveTab('studio')}
              className="gap-1.5 shadow-gold-sm text-xs font-semibold h-9"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+ Post Prompt</span>
              <span className="sm:hidden">+ Post</span>
            </Button>

            {/* Export CSV */}
            <Button
              variant="glass"
              size="sm"
              onClick={() => success('Consolidated financial books exported as CSV')}
              className="hidden sm:flex gap-1.5 text-xs h-9"
            >
              <Download className="h-3.5 w-3.5 text-gold" />
              <span>Export CSV</span>
            </Button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {/* Executive Overview Header Card */}
          <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 bg-surface/90 relative overflow-hidden shadow-luxury">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[130px] pointer-events-none rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-gold-light font-semibold">
                    Aurum Enterprise ERP & CRM Command Center
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-ivory">
                  {currentTabMeta.title}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted max-w-2xl font-light">
                  {currentTabMeta.desc}
                </p>
              </div>

              {/* Quick status pill */}
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2 rounded-2xl shrink-0 font-mono text-xs">
                <Radio className="h-3.5 w-3.5 text-gold animate-pulse" />
                <span className="text-text-muted">Live Active Engines:</span>
                <span className="text-gold font-bold">9 Master Modules</span>
              </div>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase">
                  <DollarSign className="h-3.5 w-3.5 text-gold" />
                  <span>Total GMV Volume</span>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-gold-light">
                  {formatINR(1840000)}
                </div>
                <span className="text-[10px] font-mono text-emerald-400">↑ 24.8% vs last month</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Platform Net Revenue</span>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-text-ivory">
                  {formatINR(276000)}
                </div>
                <span className="text-[10px] font-mono text-text-muted">15% Standard Retained</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Active CRM Collectors</span>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-text-ivory">
                  {customers.length + 1416}
                </div>
                <span className="text-[10px] font-mono text-emerald-400">↑ 62 New this week</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase">
                  <Layers className="h-3.5 w-3.5 text-champagne" />
                  <span>Total Catalog Prompts</span>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-text-ivory">
                  {allPrompts.length}
                </div>
                <span className="text-[10px] font-mono text-text-muted">Zero-leak protected</span>
              </div>
            </div>
          </div>

          {/* Quick horizontal switch pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {navGroups.flatMap(g => g.items).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-gold/20 text-gold-light border-gold/40 shadow-gold-sm font-semibold'
                      : 'bg-surface/60 text-text-muted hover:text-text-ivory hover:bg-white/5 border-white/5'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-gold' : 'text-text-muted'}`} />
                  <span>{item.short}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9px] px-1 rounded-full bg-white/10 text-text-muted">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* ENTERPRISE MODULE NAVIGATION TABS */}
          {/* ========================================================================= */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: FINANCIAL BI & ERP REVENUE LEDGER */}
          {/* ========================================================================= */}
          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Trend Area Chart */}
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Monthly Gross Volume & Net Platform Take
                  </h3>
                  <p className="text-xs text-text-muted">
                    Consolidated Razorpay INR settlement trends
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                    <span className="text-text-muted">Gross Sales (₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-text-muted">Platform Take (15%)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#C9A24B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#666" tickLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#666" tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141416', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                    />
                    <Area type="monotone" dataKey="gross" stroke="#C9A24B" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
                    <Area type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#netGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* General Ledger Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-2">
                <span className="text-xs font-mono uppercase text-text-muted">Pending Seller Disbursements</span>
                <div className="text-2xl font-serif font-bold text-amber-300">
                  {formatINR(139400)}
                </div>
                <p className="text-[11px] text-text-muted">
                  3 verified creators ready for scheduled UPI disbursement.
                </p>
              </div>
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-2">
                <span className="text-xs font-mono uppercase text-text-muted">Razorpay Gateway Fees (2% + GST)</span>
                <div className="text-2xl font-serif font-bold text-text-ivory">
                  {formatINR(43424)}
                </div>
                <p className="text-[11px] text-text-muted">
                  Standard processing expense automatically accounted for.
                </p>
              </div>
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-2">
                <span className="text-xs font-mono uppercase text-text-muted">Net Operating Surplus</span>
                <div className="text-2xl font-serif font-bold text-emerald-400">
                  {formatINR(232576)}
                </div>
                <p className="text-[11px] text-text-muted">
                  Retained platform cash balance after all creator payouts.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: PROMPT STUDIO & INVENTORY MASTER */}
          {/* ========================================================================= */}
          <TabsContent value="studio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Post Prompt Studio Form */}
              <div className="lg:col-span-7 glass-card rounded-2xl border border-gold/30 bg-surface/90 p-6 sm:p-8 space-y-6 shadow-luxury">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-text-ivory">
                        Master Prompt Creation Studio
                      </h3>
                      <p className="text-xs text-text-muted">
                        Publish certified Image & Video prompts directly to the public marketplace
                      </p>
                    </div>
                  </div>
                  <Badge variant={newCategoryType === 'VIDEO' ? 'video' : 'image'} className="uppercase font-mono text-xs">
                    {newCategoryType}
                  </Badge>
                </div>

                <form onSubmit={handlePublishPrompt} className="space-y-5">
                  {/* Modality Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-text-muted mb-2">
                      Prompt Type (Modality)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewCategoryType('IMAGE')}
                        className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-xs font-mono uppercase tracking-wider transition-all ${
                          newCategoryType === 'IMAGE'
                            ? 'border-gold bg-gold/20 text-gold-light font-bold shadow-gold-sm'
                            : 'border-white/10 bg-surface text-text-muted hover:border-white/20'
                        }`}
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span>Image Prompt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCategoryType('VIDEO')}
                        className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-xs font-mono uppercase tracking-wider transition-all ${
                          newCategoryType === 'VIDEO'
                            ? 'border-indigo-400 bg-indigo-950/60 text-indigo-300 font-bold shadow-indigo-sm'
                            : 'border-white/10 bg-surface text-text-muted hover:border-white/20'
                        }`}
                      >
                        <Film className="h-4 w-4" />
                        <span>Video Prompt</span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                      Prompt Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Royal Tourbillon: Haute Horlogerie Noir"
                      className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                      Short Description (Teaser Headline)
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Precision macro watch photography on obsidian black reflective stone..."
                      className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  {/* Target AI Model & Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                        Target AI Model
                      </label>
                      <select
                        value={newTargetModel}
                        onChange={(e) => setNewTargetModel(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-xs text-text-ivory focus:border-gold focus:outline-none"
                      >
                        {newCategoryType === 'IMAGE' ? (
                          <>
                            <option value="Midjourney v6.1">Midjourney v6.1</option>
                            <option value="FLUX.1 Pro">FLUX.1 Pro</option>
                            <option value="FLUX.1 Schnell">FLUX.1 Schnell</option>
                            <option value="DALL·E 3">DALL·E 3</option>
                            <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                          </>
                        ) : (
                          <>
                            <option value="OpenAI Sora">OpenAI Sora</option>
                            <option value="Google Veo 2">Google Veo 2</option>
                            <option value="Runway Gen-3 Alpha">Runway Gen-3 Alpha</option>
                            <option value="Kling AI 1.5">Kling AI 1.5</option>
                            <option value="Luma Dream Machine">Luma Dream Machine</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                        {newCategoryType === 'VIDEO' ? 'Duration / Aspect' : 'Aspect Ratio'}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={newAspectRatio}
                          onChange={(e) => setNewAspectRatio(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-xs text-text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Vertical)</option>
                          <option value="1:1">1:1 (Square)</option>
                          <option value="4:5">4:5 (Portrait)</option>
                          <option value="21:9">21:9 (Ultrawide)</option>
                        </select>

                        {newCategoryType === 'VIDEO' && (
                          <select
                            value={newDuration}
                            onChange={(e) => setNewDuration(e.target.value)}
                            className="w-28 rounded-xl border border-indigo-500/30 bg-surface px-2.5 py-2.5 text-xs text-indigo-200 focus:border-indigo-400 focus:outline-none font-mono"
                          >
                            <option value="5s">5s</option>
                            <option value="10s">10s</option>
                            <option value="15s">15s</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="p-4 rounded-xl border border-gold/30 bg-black/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-gold-light">
                        Pricing Tier (INR)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFree(!isFree)}
                        className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                          isFree
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-gold/15 text-gold-light border-gold/30'
                        }`}
                      >
                        {isFree ? '🎁 COMPLIMENTARY (FREE ₹0)' : '💎 COMMERCIAL PAID (₹)'}
                      </button>
                    </div>

                    {!isFree && (
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-[11px] font-mono text-text-muted mb-1">
                            Listing Price (₹ INR)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newPriceInr}
                            onChange={(e) => setNewPriceInr(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-surface p-2 text-sm text-gold-light font-mono focus:border-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-text-muted mb-1">
                            Compare-at Price (₹ Strikethrough)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={newCompareAtPrice}
                            onChange={(e) => setNewCompareAtPrice(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-surface p-2 text-sm text-text-muted font-mono focus:border-gold focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media Preview URLs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                        Cover Image Preview URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2 text-xs font-mono text-text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>

                    {newCategoryType === 'VIDEO' && (
                      <div>
                        <label className="block text-xs font-mono uppercase text-indigo-300 mb-1">
                          Hover-to-Play Video Preview URL (.mp4) *
                        </label>
                        <input
                          type="url"
                          required
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full rounded-xl border border-indigo-500/30 bg-surface px-4 py-2 text-xs font-mono text-indigo-200 focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Confidential Master Prompt Syntax (Zero-Leak) */}
                  <div className="p-4 rounded-xl border border-gold/40 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-gold-light font-semibold">
                        Master Prompt Syntax (RLS Encrypted) *
                      </label>
                      <span className="text-[10px] font-mono text-text-muted">
                        Use {'{{variable}}'} for customization
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={newMasterPrompt}
                      onChange={(e) => setNewMasterPrompt(e.target.value)}
                      placeholder="e.g. Extreme macro shot of an haute horlogerie watch with {{metal_finish}} tourbillon movement on black obsidian stone, rim lighting --ar 16:9 --style raw --v 6.1"
                      className="w-full rounded-lg border border-white/10 bg-surface/90 p-3 text-xs font-mono text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Featured Flag Toggle */}
                  <label className="flex items-center gap-2.5 text-xs font-mono text-text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-white/20 bg-surface text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Pin to Featured & Trending Marketplace Showcase</span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full py-3.5 text-sm font-semibold shadow-gold-md gap-2"
                    isLoading={isPublishing}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Publish Asset to Live Marketplace</span>
                  </Button>
                </form>
              </div>

              {/* Right Column: Live Inventory Master & Live Card Simulation */}
              <div className="lg:col-span-5 space-y-6">
                {/* Live Card Simulation Preview */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-gold block">
                    Live Marketplace Card Simulation
                  </span>
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-elevated/70">
                    <div className="relative aspect-video">
                      <img src={coverImageUrl} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <Badge variant={newCategoryType === 'VIDEO' ? 'video' : 'image'} className="text-[10px] font-mono">
                          {newCategoryType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono bg-black/50">
                          {newTargetModel}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-serif font-bold text-base text-text-ivory truncate">
                        {newTitle || 'Untitled Haute Prompt Asset'}
                      </h4>
                      <p className="text-xs text-text-muted line-clamp-2">
                        {newDescription || 'Short description preview will appear here in the marketplace search and catalog.'}
                      </p>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-gold-light font-bold">
                          {isFree ? 'Complimentary (₹0)' : formatINR(newPriceInr)}
                        </span>
                        <span className="text-text-muted">{newAspectRatio}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SKU Management Ledger */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="font-serif text-lg font-bold">Catalog SKU Master ({allPrompts.length})</h4>
                    <span className="text-xs font-mono text-text-muted">Live Stock</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {allPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={p.media?.[0]?.url || coverImageUrl}
                            alt={p.title}
                            className="h-9 w-9 rounded-lg object-cover shrink-0 border border-white/10"
                          />
                          <div className="truncate">
                            <p className="font-serif font-bold text-text-ivory truncate">{p.title}</p>
                            <span className="text-[10px] font-mono text-text-muted">
                              {p.price_inr === 0 ? 'Free' : formatINR(p.price_inr)} • {p.category?.type || 'IMAGE'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              toggleFeatured(p.id);
                              success(`Featured status toggled for "${p.title}"`);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              p.is_featured
                                ? 'bg-gold/20 text-gold border-gold/40'
                                : 'bg-surface text-text-muted border-white/10'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            to={`/prompt/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-surface border border-white/10 text-text-muted hover:text-gold"
                            title="View Live Page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete "${p.title}" from catalog?`)) {
                                deleteMarketplacePrompt(p.id);
                                success('Prompt deleted');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-surface border border-white/10 text-text-muted hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: CRM CUSTOMERS DIRECTORY */}
          {/* ========================================================================= */}
          <TabsContent value="customers" className="space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    CRM Collector Directory & Lifetime Accounts
                  </h3>
                  <p className="text-xs text-text-muted">
                    Full collector lifecycle, Google OAuth attribution, and total spend analytics
                  </p>
                </div>

                {/* Customer Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-white/10 bg-surface pl-9 pr-4 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                      <th className="pb-3 font-medium">Collector / Client</th>
                      <th className="pb-3 font-medium">Provider</th>
                      <th className="pb-3 font-medium">CRM Tier</th>
                      <th className="pb-3 font-medium">Orders Count</th>
                      <th className="pb-3 font-medium">Lifetime Value (LTV)</th>
                      <th className="pb-3 font-medium">Account Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 border border-gold/30 text-gold-light font-serif font-bold text-xs">
                              {cust.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-serif font-bold text-text-ivory">{cust.name}</p>
                              <p className="text-xs font-mono text-text-muted">{cust.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-text-muted uppercase">
                            {cust.provider === 'google' ? '🌐 Google SSO' : '✉️ Email Auth'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <Badge variant={cust.tier === 'VIP Collector' ? 'gold' : cust.tier === 'Enterprise' ? 'warning' : 'outline'}>
                            {cust.tier}
                          </Badge>
                        </td>
                        <td className="py-3.5 font-mono text-xs text-text-ivory">
                          {cust.ordersCount} acquisitions
                        </td>
                        <td className="py-3.5 font-serif font-bold text-gold-light">
                          {formatINR(cust.lifetimeValueInr)}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-mono uppercase border ${
                              cust.status === 'active'
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                : 'bg-red-950/40 text-red-300 border-red-500/30'
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => handleToggleCustomerStatus(cust.id)}
                            className="text-xs"
                          >
                            {cust.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: CRM SELLERS & CREATOR PARTNERSHIPS */}
          {/* ========================================================================= */}
          <TabsContent value="sellers" className="space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Seller Partner Accounts & Automated Settlements
                  </h3>
                  <p className="text-xs text-text-muted">
                    Manage approved community studios, track creator earnings, and execute payouts
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {sellers.length} Verified Creators
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                      <th className="pb-3 font-medium">Studio / Creator</th>
                      <th className="pb-3 font-medium">Active SKUs</th>
                      <th className="pb-3 font-medium">Total GMV Generated</th>
                      <th className="pb-3 font-medium">Commission Rate</th>
                      <th className="pb-3 font-medium">Pending Payout (INR)</th>
                      <th className="pb-3 font-medium">Registered UPI / Bank</th>
                      <th className="pb-3 font-medium text-right">Disbursement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sellers.map((sel) => (
                      <tr key={sel.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Building2 className="h-4 w-4 text-gold shrink-0" />
                            <div>
                              <p className="font-serif font-bold text-text-ivory">{sel.name}</p>
                              <p className="text-xs font-mono text-text-muted">{sel.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono text-xs">{sel.promptsCount} Prompts</td>
                        <td className="py-3.5 font-serif font-semibold text-text-ivory">
                          {formatINR(sel.totalGmvInr)}
                        </td>
                        <td className="py-3.5 font-mono text-xs text-gold">
                          {sel.commissionRate}%
                        </td>
                        <td className="py-3.5 font-serif font-bold text-amber-300">
                          {formatINR(sel.pendingBalanceInr)}
                        </td>
                        <td className="py-3.5 font-mono text-xs text-text-muted">
                          {sel.payoutUpi}
                        </td>
                        <td className="py-3.5 text-right">
                          {sel.pendingBalanceInr > 0 ? (
                            <Button
                              variant="gold"
                              size="sm"
                              onClick={() => handleApprovePayout(sel.id, sel.name, sel.pendingBalanceInr)}
                              className="text-xs gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Settle Payout</span>
                            </Button>
                          ) : (
                            <span className="text-xs font-mono text-emerald-400">All Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 5: ORDERS & RAZORPAY INVOICES */}
          {/* ========================================================================= */}
          <TabsContent value="orders" className="space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Settled Transaction Ledger
                  </h3>
                  <p className="text-xs text-text-muted">
                    Audited customer orders, Razorpay transaction IDs, and settlement dates
                  </p>
                </div>
                <Badge variant="gold" className="font-mono text-xs uppercase">
                  Razorpay Route Active
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Collector</th>
                      <th className="pb-3 font-medium">Asset Title</th>
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
                        <td className="py-3 font-mono text-xs text-text-muted">
                          {(ord.metadata as any)?.customer_email || 'collector@aurumprompts.com'}
                        </td>
                        <td className="py-3 font-serif font-bold text-text-ivory max-w-xs truncate">
                          {(ord.metadata as any)?.prompt_title || 'Haute Prompt Entitlement'}
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
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 6: MARKETING & COUPON ENGINE */}
          {/* ========================================================================= */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Create Coupon */}
              <div className="lg:col-span-5 glass-card rounded-2xl border border-white/10 p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Tag className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-xl font-bold">Register Promo Voucher</h3>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      placeholder="e.g. AURUM50"
                      className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-xs font-mono uppercase text-text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                        Type
                      </label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Cash (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                        Discount Value
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-xs font-mono text-gold-light focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="gold" className="w-full mt-2">
                    Add Voucher to Campaign
                  </Button>
                </form>
              </div>

              {/* Right Column: Active Coupons Table */}
              <div className="lg:col-span-7 glass-card rounded-2xl border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl font-bold border-b border-white/10 pb-3">
                  Active Vouchers Directory ({coupons.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Discount</th>
                        <th className="pb-3">Redemptions</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 font-bold text-gold-light">{c.code}</td>
                          <td className="py-3">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                          </td>
                          <td className="py-3 text-text-muted">
                            {c.timesUsed} / {c.maxUses}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                                c.isActive ? 'bg-emerald-950/40 text-emerald-300' : 'bg-red-950/40 text-red-300'
                              }`}
                            >
                              {c.isActive ? 'ACTIVE' : 'EXPIRED'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCoupon(c.id)}
                              className="text-xs text-text-muted hover:text-gold"
                            >
                              {c.isActive ? 'Deactivate' : 'Enable'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 7: SUPPORT & DISPUTE TICKETS */}
          {/* ========================================================================= */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Client Inquiries & Support Tickets
                  </h3>
                  <p className="text-xs text-text-muted">
                    Concierge resolutions for enterprise licenses and prompt customization support
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {tickets.length} Inquiries
                </Badge>
              </div>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-white/10 bg-surface/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={t.priority === 'urgent' ? 'warning' : 'outline'} className="text-[10px] uppercase font-mono">
                          {t.priority}
                        </Badge>
                        <span className="text-xs font-mono text-text-muted">{formatDate(t.createdAt)}</span>
                      </div>
                      <h4 className="font-serif font-bold text-text-ivory text-base">{t.subject}</h4>
                      <p className="text-xs font-mono text-text-muted">
                        From: <span className="text-gold-light">{t.customerName}</span> ({t.customerEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {t.status === 'open' ? (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleResolveTicket(t.id)}
                          className="gap-1.5 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Resolved</span>
                        </Button>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 8: CYBER SECURITY & INTRUSION DETECTION SHIELD */}
          {/* ========================================================================= */}
          <TabsContent value="security" className="space-y-6">
            <div className="glass-card rounded-2xl border border-red-500/30 bg-surface/90 p-6 sm:p-8 space-y-6 shadow-luxury">
              {/* Shield Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Shield Armor Active • 100% Zero-Leak Enforced
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-text-ivory">
                    Cyber Security & Intrusion Monitoring Center
                  </h3>
                  <p className="text-xs text-text-muted">
                    Real-time detection of SQL injections, prompt leak attempts, unauthorized route access, and payment tampering
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleTriggerSimulatedProbe}
                    className="gap-2 text-xs border-red-500/30 text-red-300 hover:bg-red-950/40"
                  >
                    <Shield className="h-4 w-4 text-red-400" />
                    <span>Simulate Hacker Attack (Test Alert)</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSecurityLogs}
                    className="text-xs text-text-muted hover:text-text-ivory"
                  >
                    Reset Logs
                  </Button>
                </div>
              </div>

              {/* Threat Intelligence Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Total Attacks Intercepted</span>
                  <div className="text-2xl font-serif font-bold text-red-400">{securityLogs.length}</div>
                  <span className="text-[10px] font-mono text-emerald-400">100% Neutralized</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Critical Injections Blocked</span>
                  <div className="text-2xl font-serif font-bold text-amber-300">
                    {securityLogs.filter((s) => s.threatLevel === 'CRITICAL').length}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">SQLi / Remote Probes</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Prompt Leaks Thwarted</span>
                  <div className="text-2xl font-serif font-bold text-gold-light">
                    {securityLogs.filter((s) => s.threatType === 'PROMPT_LEAK_EXFILTRATION_PROBE').length}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">Postgres RLS Defense</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Payment Forgeries Rejected</span>
                  <div className="text-2xl font-serif font-bold text-emerald-400">
                    {securityLogs.filter((s) => s.threatType === 'WEBHOOK_SIGNATURE_MISMATCH').length}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">HMAC SHA256 Enforced</span>
                </div>
              </div>

              {/* Active Security Architecture Protocols */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/30 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Zero-Leak RLS:</strong> Direct SELECT on prompt_contents blocked for all users except owner/admin.</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Payment Anti-Tamper:</strong> Authoritative prices fetched strictly on server, client price ignored.</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Cryptographic Webhook:</strong> Web Crypto HMAC SHA256 verifies signature before order settlement.</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Anti-Clickjacking / CSP:</strong> X-Frame-Options DENY and Content-Security-Policy active.</span>
                </div>
              </div>

              {/* Live Incident Audit Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-serif text-lg font-bold">Live Incident & Attack Log</h4>
                  <span className="text-xs font-mono text-text-muted">Forensic Audit Trail</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-mono uppercase text-text-muted">
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3">Threat Vector</th>
                        <th className="pb-3">Severity</th>
                        <th className="pb-3">Attacker IP / Origin</th>
                        <th className="pb-3">Target Endpoint</th>
                        <th className="pb-3">Firewall Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 text-text-muted">{formatDate(log.timestamp)}</td>
                          <td className="py-3 font-bold text-text-ivory">
                            {log.threatType.replace(/_/g, ' ')}
                            <p className="font-sans font-normal text-[11px] text-text-muted mt-0.5 line-clamp-1">
                              {log.details}
                            </p>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                log.threatLevel === 'CRITICAL'
                                  ? 'bg-red-950/50 text-red-300 border-red-500/40'
                                  : log.threatLevel === 'HIGH'
                                  ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                                  : 'bg-white/10 text-text-muted border-white/10'
                              }`}
                            >
                              {log.threatLevel}
                            </span>
                          </td>
                          <td className="py-3 text-text-muted truncate max-w-[150px]">{log.source}</td>
                          <td className="py-3 text-gold-light truncate max-w-[180px]">{log.target}</td>
                          <td className="py-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                              {log.actionTaken}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 9: GOVERNANCE & CREDENTIALS */}
          {/* ========================================================================= */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Site Governance Parameters */}
              <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                  <Sliders className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Global ERP Parameters & Feature Flags
                  </h3>
                </div>

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
                  <Button variant="gold" onClick={() => success('Global configuration saved')}>
                    Save Global Configuration
                  </Button>
                </div>
              </div>

              {/* Google OAuth Credentials */}
              <div className="glass-card rounded-2xl border border-gold/30 bg-surface/90 p-6 sm:p-8 space-y-5 shadow-gold-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Key className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Google OAuth & Cloud Security Credentials
                  </h3>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  Connect your Google Cloud OAuth Client ID & Client Secret in Supabase to enable seamless 1-click Google Sign-In for both Collectors and Platform Administrators.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase text-text-muted">1. Google Cloud Console Authorized Origin:</span>
                    <div className="text-text-ivory font-bold">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-gold/40 space-y-1.5">
                    <span className="text-[10px] uppercase text-gold">2. Supabase OAuth Callback (Redirect URI):</span>
                    <div className="text-gold font-bold break-all">
                      {(import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co') + '/auth/v1/callback'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase text-text-muted">3. Automatic Admin Email Whitelist:</span>
                    <div className="text-emerald-400 font-bold">
                      VITE_ADMIN_EMAILS=your.email@gmail.com,concierge@aurumprompts.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}
