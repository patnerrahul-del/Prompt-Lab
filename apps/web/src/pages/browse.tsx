import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/prompt-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SEO } from '@/components/common/seo';
import { useMarketplace } from '@/hooks/use-marketplace';
import type { PromptCategoryType } from '@/types/database.types';

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    prompts,
    isLoading,
    favorites,
    toggleFavorite,
    selectedModality,
    setSelectedModality,
    selectedModelSlug,
    setSelectedModelSlug,
    searchQuery,
    setSearchQuery,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
  } = useMarketplace();

  // Sync with URL query parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam === 'IMAGE' || categoryParam === 'VIDEO') {
      setSelectedModality(categoryParam as PromptCategoryType);
    }
    const freeParam = searchParams.get('free');
    if (freeParam === 'true') {
      setPriceFilter('free');
    }
  }, [searchParams, setSelectedModality, setPriceFilter]);

  const clearAllFilters = () => {
    setSelectedModality('ALL');
    setSelectedModelSlug('all');
    setPriceFilter('all');
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedModality !== 'ALL' ||
    selectedModelSlug !== 'all' ||
    priceFilter !== 'all' ||
    searchQuery !== '';

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Marketplace Catalog — Certified Image & Video AI Prompts"
        description="Search and filter verified generative prompts for Midjourney, FLUX.1, OpenAI Sora, and Google Veo."
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gold block mb-2">
              Curated Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Explore Certified Prompts
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Discover verified commercial AI prompts for image and video synthesis.
            </p>
          </div>

          <span className="text-xs font-mono text-text-muted">
            Showing <span className="text-gold-light font-bold">{prompts.length}</span> verified master prompts
          </span>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, aesthetics, models, or tags... (e.g. tourbillon, perfume, drone)"
                className="w-full rounded-xl border border-white/10 bg-surface pl-10 pr-4 py-2.5 text-sm text-text-ivory placeholder:text-text-muted/50 focus:border-gold focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-text-muted hover:text-text-ivory"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Modality Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'IMAGE', 'VIDEO'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedModality(m);
                    if (m === 'ALL') searchParams.delete('category');
                    else searchParams.set('category', m);
                    setSearchParams(searchParams);
                  }}
                  className={`rounded-lg px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all select-none ${
                    selectedModality === m
                      ? 'bg-gold-gradient text-obsidian font-semibold shadow-gold-sm'
                      : 'border border-white/10 text-text-muted hover:text-text-ivory hover:bg-white/5'
                  }`}
                >
                  {m === 'ALL' ? 'All Prompts' : m === 'IMAGE' ? 'Image Only' : 'Video Only'}
                </button>
              ))}
            </div>

            {/* Price Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(['all', 'free', 'paid'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider transition-all select-none ${
                    priceFilter === p
                      ? 'bg-white/20 text-text-ivory border border-white/30'
                      : 'border border-white/10 text-text-muted hover:text-text-ivory'
                  }`}
                >
                  {p === 'all' ? 'Any Price' : p === 'free' ? 'Complimentary' : 'Paid'}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-text-muted shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Releases</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Clear Pill */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-text-muted">
              <span className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-gold" />
                <span>Filtered View Active</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-7 text-gold hover:text-gold-light"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            title="No Matching Prompts Found"
            description="Try relaxing your search terms or resetting filters to explore the complete catalog."
            actionLabel="Reset Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                isFavorited={favorites.has(p.id)}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
