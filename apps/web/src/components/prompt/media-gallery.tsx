import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptMedia } from '@/types/database.types';

export interface MediaGalleryProps {
  media: PromptMedia[];
  title: string;
}

export function MediaGallery({ media, title }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="relative aspect-[16/10] w-full rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-text-muted">
        No preview media available
      </div>
    );
  }

  const currentMedia = media[selectedIndex] || media[0];
  const isVideo = currentMedia.media_type === 'VIDEO';

  return (
    <div className="space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        {isVideo ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={title}
            className="w-full h-full object-cover select-none"
          />
        )}

        {/* Media Type Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-text-ivory backdrop-blur-md border border-white/10">
          {isVideo ? (
            <>
              <Play className="h-3 w-3 text-gold fill-gold" />
              <span>4K VIDEO DEMO</span>
            </>
          ) : (
            <span>CERTIFIED OUTPUT</span>
          )}
        </div>
      </div>

      {/* Thumbnails Row */}
      {media.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {media.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition-all duration-300',
                  isSelected
                    ? 'border-gold shadow-gold-sm ring-1 ring-gold scale-105'
                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                )}
              >
                <img
                  src={item.thumbnail_url || item.url}
                  alt={`Preview ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {item.media_type === 'VIDEO' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="h-4 w-4 text-gold fill-gold" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
