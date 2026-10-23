import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, ShieldCheck, Check, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';
import { MediaGallery } from '@/components/prompt/media-gallery';
import { LockedContentShield } from '@/components/prompt/locked-content-shield';
import { ReviewList } from '@/components/marketplace/review-list';
import { PromptCard } from '@/components/prompt/prompt-card';
import { SEO } from '@/components/common/seo';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useToast } from '@/components/ui/toast';
import type { Review } from '@/types/database.types';

export function PromptDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { allPrompts, favorites, toggleFavorite } = useMarketplace();
  const { success } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  // Find prompt by slug or ID
  const prompt = allPrompts.find((p) => p.slug === slug || p.id === slug) || allPrompts[0];

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'r1',
      prompt_id: prompt?.id || 'p1',
      user_id: 'u1',
      rating: 5,
      comment: 'Exceptional fidelity. The metallic reflections and rim lighting rendered exactly as described in Midjourney v6.1.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      user: {
        id: 'u1',
        email: 'collector@studio.com',
        full_name: 'Julian Thorne',
        avatar_url: null,
        role: 'user',
        seller_balance_inr: 0,
        commission_rate: 15,
        bio: null,
        website: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  ]);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background text-text-ivory flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold">Prompt Not Found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/browse')}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isVideo = prompt.category?.type === 'VIDEO';
  const isFavorited = favorites.has(prompt.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    success('Prompt link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReview = async (rating: number, comment: string) => {
    const newRev: Review = {
      id: 'r_' + Math.random().toString(36).substring(2, 9),
      prompt_id: prompt.id,
      user_id: 'current_user',
      rating,
      comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 'current_user',
        email: 'you@atelier.com',
        full_name: 'Verified Collector',
        avatar_url: null,
        role: 'user',
        seller_balance_inr: 0,
        commission_rate: 15,
        bio: null,
        website: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    setReviews([newRev, ...reviews]);
  };

  // Related prompts
  const relatedPrompts = allPrompts
    .filter((p) => p.id !== prompt.id && p.category?.type === prompt.category?.type)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title={`${prompt.title} — Aurum Prompts`}
        description={prompt.short_description || prompt.teaser || undefined}
        canonical={`/prompt/${prompt.slug}`}
        ogImage={prompt.media?.[0]?.url}
      />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-text-muted hover:text-text-ivory"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(prompt.id)}
              className={`p-2 rounded-xl border border-white/10 bg-surface hover:border-gold/50 transition-colors ${
                isFavorited ? 'text-gold border-gold/40' : 'text-text-muted'
              }`}
              title="Add to Wishlist"
            >
              <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-gold' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-white/10 bg-surface text-text-muted hover:text-text-ivory hover:border-gold/50 transition-colors"
              title="Share Prompt"
            >
              {copiedLink ? <Check className="h-4 w-4 text-gold" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Main Showcase & Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <MediaGallery media={prompt.media || []} title={prompt.title} />

            {/* Negative Prompt Section */}
            {prompt.negative_prompt && (
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                  Certified Negative Parameters
                </span>
                <p className="font-mono text-xs text-text-muted leading-relaxed">
                  {prompt.negative_prompt}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Prompt Details & Acquisition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isVideo ? 'video' : 'image'} className="uppercase font-mono text-[10px]">
                  {isVideo ? 'Video Prompt' : 'Image Prompt'}
                </Badge>
                {prompt.model && (
                  <Badge variant="glass" className="text-[10px]">
                    {prompt.model.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {prompt.difficulty}
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory leading-tight">
                {prompt.title}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <RatingStars
                  rating={prompt.average_rating}
                  totalReviews={prompt.reviews_count}
                  size="md"
                />
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono text-text-muted">
                  {prompt.copies_count} decryptions
                </span>
              </div>
            </div>

            {/* Price Tag & Commercial Guarantee */}
            <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                  Acquisition Fee
                </span>
                <PriceTag
                  priceInr={prompt.price_inr}
                  compareAtPriceInr={prompt.compare_at_price_inr}
                  size="lg"
                />
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  <span>Full Commercial Reproduction Rights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-champagne shrink-0" />
                  <span>Verified Syntax for {prompt.model?.name || 'Target AI Model'}</span>
                </div>
              </div>
            </div>

            {/* Certified Model Settings Grid */}
            {prompt.settings && Object.keys(prompt.settings).length > 0 && (
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-gold flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Generation Parameters</span>
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {Object.entries(prompt.settings).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs font-mono"
                    >
                      <span className="text-text-muted capitalize block text-[10px]">
                        {k.replace(/_/g, ' ')}
                      </span>
                      <span className="text-text-ivory font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locked Content Shield / Decryption Engine */}
        <section className="pt-6">
          <LockedContentShield
            prompt={prompt}
            onInitiateCheckout={() => navigate(`/checkout/${prompt.id}`)}
          />
        </section>

        {/* Collector Reviews */}
        <section className="pt-12 border-t border-white/10">
          <ReviewList
            promptId={prompt.id}
            reviews={reviews}
            averageRating={prompt.average_rating}
            totalReviews={prompt.reviews_count}
            hasPurchased={prompt.has_purchased || prompt.price_inr === 0}
            onAddReview={handleAddReview}
          />
        </section>

        {/* Related Prompts Carousel */}
        {relatedPrompts.length > 0 && (
          <section className="pt-12 border-t border-white/10 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-text-ivory">
              Related Atelier Compositions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPrompts.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  isFavorited={favorites.has(p.id)}
                  onFavoriteToggle={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
