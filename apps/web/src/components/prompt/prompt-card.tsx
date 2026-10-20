import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Copy, Check } from 'lucide-react';
import { VideoHoverPreview } from './video-hover-preview';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { Prompt } from '@/types/database.types';

export interface PromptCardProps {
  prompt: Prompt;
  onFavoriteToggle?: (promptId: string) => void;
  isFavorited?: boolean;
}

export function PromptCard({
  prompt,
  onFavoriteToggle,
  isFavorited = false,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const isVideo = prompt.category?.type === 'VIDEO';
  const coverMedia = prompt.media?.find((m) => m.is_cover) || prompt.media?.[0];
  const coverImageUrl = coverMedia?.thumbnail_url || coverMedia?.url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
  const videoPreviewUrl = isVideo && coverMedia?.media_type === 'VIDEO' ? coverMedia.url : null;

  const handleCopyTeaser = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (prompt.teaser) {
      navigator.clipboard.writeText(prompt.teaser);
      setCopied(true);
      success('Teaser copied with gold clearance');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card group flex flex-col rounded-2xl border border-white/10 bg-surface/70 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold-md">
      {/* Media Showcase Container */}
      <Link to={`/prompt/${prompt.slug}`} className="relative aspect-[4/3] w-full overflow-hidden block">
        {videoPreviewUrl ? (
          <VideoHoverPreview
            videoUrl={videoPreviewUrl}
            posterUrl={coverImageUrl}
            className="h-full w-full"
          />
        ) : (
          <img
            src={coverImageUrl}
            alt={prompt.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* Category & Model Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <Badge variant={isVideo ? 'video' : 'image'} className="uppercase font-mono text-[10px]">
            {isVideo ? 'Video' : 'Image'}
          </Badge>
          {prompt.model && (
            <Badge variant="glass" className="text-[10px] bg-black/60 backdrop-blur-md">
              {prompt.model.name}
            </Badge>
          )}
        </div>

        {/* Favorite Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle?.(prompt.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-text-ivory hover:text-gold hover:bg-black/80 transition-colors z-10"
          aria-label="Add to wishlist"
        >
          <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-gold text-gold' : ''}`} />
        </button>

        {/* Gold Glow Hover Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      {/* Details Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <RatingStars rating={prompt.average_rating} totalReviews={prompt.reviews_count} size="sm" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            {prompt.difficulty}
          </span>
        </div>

        <Link to={`/prompt/${prompt.slug}`}>
          <h3 className="font-serif text-lg font-bold text-text-ivory line-clamp-1 group-hover:text-gold-light transition-colors">
            {prompt.title}
          </h3>
        </Link>

        {prompt.short_description && (
          <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
            {prompt.short_description}
          </p>
        )}

        {/* Teaser Preview Box with Copy */}
        {prompt.teaser && (
          <div className="mt-3 relative rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs text-text-muted italic flex items-center justify-between">
            <span className="line-clamp-1 pr-6 font-serif">
              &ldquo;{prompt.teaser}&rdquo;
            </span>
            <button
              onClick={handleCopyTeaser}
              className="absolute right-2 text-text-muted hover:text-gold p-1"
              title="Copy prompt teaser"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        {/* Bottom Pricing & Action */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <PriceTag
            priceInr={prompt.price_inr}
            compareAtPriceInr={prompt.compare_at_price_inr}
            size="sm"
          />

          <Link
            to={`/prompt/${prompt.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-light transition-colors"
          >
            <span>Inspect</span>
            <Sparkles className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
