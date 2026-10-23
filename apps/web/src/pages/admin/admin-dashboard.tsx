import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  DollarSign,
  ShoppingCart,
  Users,
  Check,
  X,
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
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatINR, formatDate, extractVariables } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useMarketplace } from '@/hooks/use-marketplace';
import { SEO } from '@/components/common/seo';
import type { PromptDifficulty, PromptLicenseType, PromptCategoryType } from '@/types/database.types';

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
  const { success, error: toastError } = useToast();
  const { allPrompts, orders, addMarketplacePrompt, deleteMarketplacePrompt, toggleFeatured } = useMarketplace();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'orders' | 'moderation' | 'settings'>('create');

  // Governance state
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [multiSellerEnabled, setMultiSellerEnabled] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  // New Prompt Form State
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
  const [newDifficulty, setNewDifficulty] = useState<PromptDifficulty>('advanced');
  const [newLicenseType, setNewLicenseType] = useState<PromptLicenseType>('commercial');

  // Media inputs
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [isPublishing, setIsPublishing] = useState(false);

  // Moderation state
  const [pendingSubmissions, setPendingSubmissions] = useState([
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

  const handlePostPrompt = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMasterPrompt.trim()) {
      toastError('Title and Master Prompt text are mandatory.');
      return;
    }

    setIsPublishing(true);
    try {
      const vars = extractVariables(newMasterPrompt).map((v) => ({
        name: v,
        label: v.replace(/_/g, ' '),
        default_value: '',
      }));

      const mediaItems =
        newCategoryType === 'VIDEO'
          ? [
              {
                media_type: 'VIDEO' as const,
                url: videoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnail_url: coverImageUrl.trim() || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
                is_cover: true,
              },
            ]
          : [
              {
                media_type: 'IMAGE' as const,
                url: coverImageUrl.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
                thumbnail_url: coverImageUrl.trim(),
                is_cover: true,
              },
            ];

      await addMarketplacePrompt(
        {
          title: newTitle,
          short_description: newDescription,
          negative_prompt: newNegativePrompt,
          difficulty: newDifficulty,
          license_type: newLicenseType,
          price_inr: isFree ? 0 : Number(newPriceInr),
          compare_at_price_inr: isFree ? null : Number(newCompareAtPrice) || null,
          is_featured: isFeatured,
          status: 'published',
          visibility: 'public',
          settings: {
            aspect_ratio: newAspectRatio,
            ...(newCategoryType === 'VIDEO' ? { duration: newDuration } : {}),
          },
          variables: vars,
          category: {
            id: 'cat_admin_' + newCategoryType.toLowerCase(),
            name: newCategoryType === 'VIDEO' ? 'Cinema & Video Motion' : 'Haute Fine Art',
            slug: newCategoryType === 'VIDEO' ? 'video-motion' : 'haute-art',
            type: newCategoryType,
            description: null,
            icon: newCategoryType === 'VIDEO' ? 'Film' : 'Image',
            sort_order: 1,
            created_at: new Date().toISOString(),
          },
          model: {
            id: 'mod_' + newTargetModel.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: newTargetModel,
            slug: newTargetModel.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category: newCategoryType,
            copy_template: null,
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
          },
        },
        newMasterPrompt,
        mediaItems
      );

      success(`Published "${newTitle}" immediately to the website marketplace!`);
      // Reset form fields
      setNewTitle('');
      setNewDescription('');
      setNewMasterPrompt('');
      setNewNegativePrompt('');
      setActiveTab('manage');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish prompt';
      toastError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete "${title}" from the website marketplace?`)) return;
    await deleteMarketplacePrompt(id);
    success('Prompt deleted from marketplace');
  };

  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured(id);
    success('Featured status updated');
  };

  const handleApproveSubmission = (id: string, title: string) => {
    setPendingSubmissions((prev) => prev.filter((p) => p.id !== id));
    success(`Approved "${title}" for marketplace release`);
  };

  const handleRejectSubmission = (id: string, title: string) => {
    setPendingSubmissions((prev) => prev.filter((p) => p.id !== id));
    success(`Rejected submission "${title}"`);
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Admin Command Center — Aurum Prompts" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                Full System Governance & Content Atelier
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Admin Command Center
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Post new Image & Video prompts directly to the site, inspect orders, and oversee platform billing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="gold" className="uppercase font-mono tracking-widest">
              Role: Super Administrator
            </Badge>
            <Link to="/browse">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>View Live Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
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
              <span className="text-xs font-mono uppercase">Live Website Prompts</span>
              <Layers className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl font-bold text-text-ivory">
              {allPrompts.length}
            </div>
            <p className="text-[11px] text-gold-light font-mono">
              {allPrompts.filter((p) => p.category?.type === 'IMAGE').length} Images •{' '}
              {allPrompts.filter((p) => p.category?.type === 'VIDEO').length} Videos
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-mono uppercase">Verified Orders</span>
              <ShoppingCart className="h-4 w-4 text-gold" />
            </div>
            <div className="font-serif text-3xl font-bold text-text-ivory">{orders.length + 685}</div>
            <p className="text-[11px] text-emerald-400 font-mono">Razorpay 256-bit Settlement</p>
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

          <div className="h-64 w-full pt-4">
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
                  formatter={(value: any) => [formatINR(Number(value) || 0), 'Gross Volume']}
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

        {/* Administration Studio Navigation Tabs */}
        <Tabs
          defaultValue="create"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
            <TabsTrigger value="create" className="gap-1.5">
              <PlusCircle className="h-4 w-4 text-gold" />
              <span>Post New Prompt</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-1.5">
              <Layers className="h-4 w-4" />
              <span>All Prompts ({allPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span>Submissions ({pendingSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Sliders className="h-4 w-4" />
              <span>Governance</span>
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: POST NEW PROMPT (IMAGE & VIDEO ATELIER STUDIO) */}
          {/* ========================================================================= */}
          <TabsContent value="create">
            <form onSubmit={handlePostPrompt} className="glass-card rounded-3xl border border-gold/40 p-6 sm:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-text-ivory">
                    Publish New Prompt to Marketplace
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Upload image or video prompt assets with custom INR pricing, locked prompt syntax, and model tags.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    isLoading={isPublishing}
                    className="gap-2 shadow-gold-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Publish to Live Website</span>
                  </Button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Prompt Metadata & Text */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Modality Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-gold tracking-widest mb-2">
                      Prompt Category Modality
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewCategoryType('IMAGE')}
                        className={`flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold border transition-all ${
                          newCategoryType === 'IMAGE'
                            ? 'border-gold bg-gold/15 text-gold-light shadow-gold-sm'
                            : 'border-white/10 bg-surface text-text-muted hover:text-text-ivory'
                        }`}
                      >
                        <ImageIcon className="h-4 w-4 text-gold" />
                        <span>IMAGE PROMPT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewCategoryType('VIDEO')}
                        className={`flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold border transition-all ${
                          newCategoryType === 'VIDEO'
                            ? 'border-indigo-400 bg-indigo-950/50 text-indigo-200 shadow-gold-sm'
                            : 'border-white/10 bg-surface text-text-muted hover:text-text-ivory'
                        }`}
                      >
                        <Film className="h-4 w-4 text-indigo-400" />
                        <span>VIDEO PROMPT</span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-text-muted">
                      Prompt Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Royal Tourbillon: Haute Horlogerie Noir"
                      className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-base font-serif font-bold text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-text-muted">
                      Short Teaser Description
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Brief 1-2 sentence aesthetic summary shown on catalog cards..."
                      className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2 text-xs text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  {/* Master Prompt Syntax (LOCKED) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-gold tracking-widest">
                        Master Prompt Syntax (Strictly Locked Behind RLS) *
                      </label>
                      <span className="text-[11px] font-mono text-text-muted">
                        Wrap dynamic fields in {'{{variable}}'}
                      </span>
                    </div>
                    <textarea
                      required
                      rows={6}
                      value={newMasterPrompt}
                      onChange={(e) => setNewMasterPrompt(e.target.value)}
                      placeholder="Type your complete master prompt here. Example: A breathtaking cinematic photograph of a {{subject}} in {{lighting}} lighting, 85mm lens, photorealistic..."
                      className="w-full rounded-xl border border-white/15 bg-black/60 p-4 font-mono text-xs leading-relaxed text-text-ivory placeholder:text-text-muted/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Negative Prompt */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-text-muted">
                      Negative Prompt (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={newNegativePrompt}
                      onChange={(e) => setNewNegativePrompt(e.target.value)}
                      placeholder="low quality, deformed, blurry, extra fingers, cartoon, text..."
                      className="w-full rounded-xl border border-white/10 bg-surface p-3 font-mono text-xs text-text-ivory placeholder:text-text-muted/30 focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right Column: Media Assets, Model & Pricing */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Media Asset Inputs */}
                  <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-mono uppercase tracking-widest text-gold">
                        Media Showcase Previews
                      </h4>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                        Cover Image / Poster URL
                      </label>
                      <input
                        type="url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>

                    {newCategoryType === 'VIDEO' && (
                      <div>
                        <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                          Video MP4 URL (Hover-to-Play Preview)
                        </label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://.../video.mp4"
                          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none font-mono"
                        />
                      </div>
                    )}

                    {/* Live Preview Thumbnail */}
                    <div className="relative aspect-video w-full rounded-xl border border-white/10 bg-black overflow-hidden">
                      {newCategoryType === 'VIDEO' && videoUrl ? (
                        <video
                          src={videoUrl}
                          poster={coverImageUrl}
                          muted
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={coverImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-gold-light border border-white/10">
                        {newCategoryType === 'VIDEO' ? 'VIDEO PREVIEW' : 'COVER IMAGE'}
                      </div>
                    </div>
                  </div>

                  {/* Target Model & Technical Settings */}
                  <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                        Target AI Model
                      </label>
                      <select
                        value={newTargetModel}
                        onChange={(e) => setNewTargetModel(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                      >
                        <option value="Midjourney v6.1">Midjourney v6.1</option>
                        <option value="FLUX.1 Pro">FLUX.1 Pro</option>
                        <option value="OpenAI Sora">OpenAI Sora</option>
                        <option value="Google Veo">Google Veo</option>
                        <option value="Runway Gen-3 Alpha">Runway Gen-3 Alpha</option>
                        <option value="Kling AI 1.5">Kling AI 1.5</option>
                        <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                        <option value="DALL·E 3">DALL·E 3</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                          Aspect Ratio
                        </label>
                        <select
                          value={newAspectRatio}
                          onChange={(e) => setNewAspectRatio(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Vertical Reel)</option>
                          <option value="1:1">1:1 (Square)</option>
                          <option value="4:5">4:5 (Portrait)</option>
                          <option value="21:9">21:9 (Ultrawide)</option>
                        </select>
                      </div>

                      {newCategoryType === 'VIDEO' ? (
                        <div>
                          <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={newDuration}
                            onChange={(e) => setNewDuration(e.target.value)}
                            placeholder="5s"
                            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                            Difficulty
                          </label>
                          <select
                            value={newDifficulty}
                            onChange={(e) => setNewDifficulty(e.target.value as any)}
                            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="master">Master</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Razorpay Billing Configuration */}
                  <div className="glass-card rounded-2xl border border-gold/30 p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-mono uppercase tracking-widest text-gold">
                        Pricing & Monetization (INR)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFree(!isFree)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${
                          isFree
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-gold/15 border-gold/40 text-gold-light'
                        }`}
                      >
                        {isFree ? 'COMPLIMENTARY (FREE)' : 'COMMERCIAL PAID'}
                      </button>
                    </div>

                    {!isFree ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                            Price in INR (₹)
                          </label>
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={newPriceInr}
                            onChange={(e) => setNewPriceInr(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-base font-serif font-bold text-gold-light focus:border-gold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-text-muted mb-1">
                            Compare-at Price (₹)
                          </label>
                          <input
                            type="number"
                            min={newPriceInr}
                            step={10}
                            value={newCompareAtPrice}
                            onChange={(e) => setNewCompareAtPrice(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-base font-serif text-text-muted line-through focus:border-gold focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                        This prompt will be available as a complimentary showcase for all authenticated collectors.
                      </div>
                    )}

                    {/* Featured on Homepage Toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-medium text-text-ivory">
                        Feature on Homepage Carousel
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className="text-gold p-1"
                      >
                        {isFeatured ? (
                          <ToggleRight className="h-6 w-6 text-gold" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: MANAGE ALL PROMPTS */}
          {/* ========================================================================= */}
          <TabsContent value="manage">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Catalog Items ({allPrompts.length})
                  </h3>
                  <p className="text-xs text-text-muted">Direct management of all prompt listings on the platform</p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setActiveTab('create')}
                  className="gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post New Prompt</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="pb-3 font-medium">Prompt Asset</th>
                      <th className="pb-3 font-medium">Modality</th>
                      <th className="pb-3 font-medium">Model</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Rating</th>
                      <th className="pb-3 font-medium">Featured</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPrompts.map((p) => {
                      const isVideo = p.category?.type === 'VIDEO';
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-serif font-bold text-text-ivory max-w-xs truncate">
                            <Link to={`/prompt/${p.slug}`} className="hover:text-gold-light transition-colors">
                              {p.title}
                            </Link>
                          </td>
                          <td className="py-3 font-mono text-xs">
                            <Badge variant={isVideo ? 'video' : 'image'} className="text-[10px] uppercase">
                              {isVideo ? 'Video' : 'Image'}
                            </Badge>
                          </td>
                          <td className="py-3 font-mono text-xs text-text-muted">
                            {p.model?.name || 'General'}
                          </td>
                          <td className="py-3 font-serif font-semibold text-gold-light">
                            {p.price_inr === 0 ? 'Complimentary' : formatINR(p.price_inr)}
                          </td>
                          <td className="py-3 font-mono text-xs text-text-muted">
                            ★ {p.average_rating.toFixed(1)}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleToggleFeatured(p.id)}
                              className={`p-1 rounded ${p.is_featured ? 'text-gold' : 'text-text-muted hover:text-gold'}`}
                              title="Toggle Featured"
                            >
                              <Star className={`h-4 w-4 ${p.is_featured ? 'fill-gold' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <Link
                              to={`/prompt/${p.slug}`}
                              className="inline-block p-1 text-text-muted hover:text-gold"
                              title="View on Site"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id, p.title)}
                              className="p-1 text-text-muted hover:text-red-400"
                              title="Delete Prompt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: ORDERS & RAZORPAY SETTLEMENTS */}
          {/* ========================================================================= */}
          <TabsContent value="orders">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-ivory">
                    Order Ledger & Transactions
                  </h3>
                  <p className="text-xs text-text-muted">Cryptographic entitlements, customer emails, and Razorpay payment identifiers</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer Email</th>
                      <th className="pb-3 font-medium">Prompt Asset</th>
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
          {/* TAB 4: MODERATION QUEUE */}
          {/* ========================================================================= */}
          <TabsContent value="moderation" className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-text-muted">
                Zero pending submissions in moderation queue.
              </div>
            ) : (
              pendingSubmissions.map((sub) => (
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
                      onClick={() => handleApproveSubmission(sub.id, sub.title)}
                      className="gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectSubmission(sub.id, sub.title)}
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

          {/* ========================================================================= */}
          {/* TAB 5: GOVERNANCE & SITE CONFIGURATION */}
          {/* ========================================================================= */}
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
                <Button variant="gold" onClick={() => success('Global configuration saved')}>
                  Save Global Configuration
                </Button>
              </div>
            </div>

            {/* Google OAuth & Security Setup */}
            <div className="glass-card rounded-2xl border border-gold/30 bg-surface/90 p-6 sm:p-8 space-y-5 max-w-2xl mt-6 shadow-gold-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="h-2 w-2 rounded-full bg-gold" />
                <h3 className="font-serif text-xl font-bold text-text-ivory">
                  Google OAuth & Authentication Credentials
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
                  <p className="text-[10px] text-text-muted font-sans">
                    Any Google account matching this variable in <code>.env</code> is instantly granted Master Admin permissions upon login.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
