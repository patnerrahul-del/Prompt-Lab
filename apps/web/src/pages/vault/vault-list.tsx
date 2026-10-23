import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Trash2, Copy, Sparkles, Image, Film, Globe, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceTag } from '@/components/ui/price-tag';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useVault } from '@/hooks/use-vault';
import { useToast } from '@/components/ui/toast';
import { SEO } from '@/components/common/seo';
import { cn } from '@/lib/utils';
import type { Prompt, PromptCategoryType } from '@/types/database.types';

export function VaultList() {
  const navigate = useNavigate();
  const {
    prompts,
    allPrompts,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterVisibility,
    setFilterVisibility,
    filterType,
    setFilterType,
    duplicatePrompt,
    deletePrompt,
    exportPrompts,
  } = useVault();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'my_prompts' | 'purchased'>('my_prompts');

  const handleDuplicate = async (p: Prompt) => {
    try {
      await duplicatePrompt(p);
      success(`Duplicated "${p.title}" as new private draft`);
    } catch {
      toastError('Failed to duplicate prompt');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove "${title}" from your private vault?`)) return;
    try {
      await deletePrompt(id);
      success('Prompt removed from vault');
    } catch {
      toastError('Failed to remove prompt');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
      case 'unlisted':
        return <EyeOff className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Lock className="h-3.5 w-3.5 text-gold" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO title="Personal Prompt Vault — Aurum Prompts" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                Encrypted Private Repository
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Personal Vault
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Organize, version, and privatize your generative AI prompts. List to marketplace with one
              click.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() => exportPrompts('json')}
              className="gap-2"
            >
              <Download className="h-4 w-4 text-gold" />
              <span>Export JSON</span>
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => exportPrompts('csv')}
              className="gap-2"
            >
              <Download className="h-4 w-4 text-gold" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="gold"
              onClick={() => navigate('/vault/new')}
              className="gap-2 shadow-gold-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Craft New Prompt</span>
            </Button>
          </div>
        </div>

        {/* Tab switch & Search Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('my_prompts')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all select-none',
                activeTab === 'my_prompts'
                  ? 'bg-gold-gradient text-obsidian font-semibold shadow-gold-sm'
                  : 'text-text-muted hover:text-text-ivory'
              )}
            >
              Created Prompts ({allPrompts.length})
            </button>
            <button
              onClick={() => setActiveTab('purchased')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all select-none',
                activeTab === 'purchased'
                  ? 'bg-gold-gradient text-obsidian font-semibold shadow-gold-sm'
                  : 'text-text-muted hover:text-text-ivory'
              )}
            >
              Acquisitions & Purchases
            </button>
          </div>

          {/* Search Input */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault prompts..."
                className="w-full rounded-lg border border-white/10 bg-surface pl-9 pr-4 py-2 text-xs text-text-ivory placeholder:text-text-muted/50 focus:border-gold focus:outline-none"
              />
            </div>

            {/* Visibility Filter */}
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
            >
              <option value="all">All Visibility</option>
              <option value="private">Private Only</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public (Store)</option>
            </select>

            {/* Category Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PromptCategoryType | 'ALL')}
              className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="IMAGE">Image Prompts</option>
              <option value="VIDEO">Video Prompts</option>
            </select>
          </div>
        </div>

        {/* Prompts List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            title="Your Vault is Empty"
            description="Start storing and refining your highest fidelity AI prompts in this secure private enclave."
            actionLabel="Create First Prompt"
            onAction={() => navigate('/vault/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((p) => {
              const isVideo = p.category?.type === 'VIDEO';
              return (
                <div
                  key={p.id}
                  className="glass-card group flex flex-col rounded-2xl border border-white/10 p-5 transition-all hover:border-gold/40 hover:shadow-gold-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-white/[0.04]">{getVisibilityIcon(p.visibility)}</span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                        {p.visibility}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={isVideo ? 'video' : 'image'} className="text-[10px] uppercase font-mono">
                        {isVideo ? (
                          <Film className="h-2.5 w-2.5 mr-1 inline" />
                        ) : (
                          <Image className="h-2.5 w-2.5 mr-1 inline" />
                        )}
                        {isVideo ? 'Video' : 'Image'}
                      </Badge>
                      <span className="text-[10px] font-mono rounded bg-white/5 px-2 py-0.5 text-text-muted">
                        v1
                      </span>
                    </div>
                  </div>

                  <Link to={`/vault/edit/${p.id}`}>
                    <h3 className="font-serif text-lg font-bold text-text-ivory group-hover:text-gold-light transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-text-muted line-clamp-2 leading-relaxed flex-1">
                    {p.teaser || p.short_description || 'No teaser configured.'}
                  </p>

                  {/* Variables Counter */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gold">
                        {p.variables?.length || 0} variables
                      </span>
                      <span className="text-white/20">•</span>
                      <PriceTag priceInr={p.price_inr} size="sm" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-white/5"
                        title="Duplicate prompt"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/vault/edit/${p.id}`}
                        className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-white/5"
                        title="Edit in studio"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-950/30"
                        title="Delete from vault"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
