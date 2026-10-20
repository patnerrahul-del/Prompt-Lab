import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoHoverPreviewProps {
  videoUrl: string;
  posterUrl?: string | null;
  className?: string;
  autoPlayOnHover?: boolean;
}

export function VideoHoverPreview({
  videoUrl,
  posterUrl,
  className,
  autoPlayOnHover = true,
}: VideoHoverPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMouseEnter = () => {
    if (!autoPlayOnHover || !videoRef.current) return;
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Browser autoplay policy catch
      });
  };

  const handleMouseLeave = () => {
    if (!autoPlayOnHover || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative w-full h-full overflow-hidden bg-surface group', className)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Video Indicator Pill */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono tracking-wider text-text-ivory backdrop-blur-md border border-white/10 z-10">
        <Play className={cn('h-2.5 w-2.5 text-gold', isPlaying && 'fill-gold')} />
        <span>{isPlaying ? 'PLAYING' : 'VIDEO PREVIEW'}</span>
      </div>

      {!isLoaded && posterUrl && (
        <img
          src={posterUrl}
          alt="Video Preview Poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
