import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Film, Image, Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/prompt-card';
import { SEO } from '@/components/common/seo';
import { useMarketplace } from '@/hooks/use-marketplace';

export function Home() {
  const navigate = useNavigate();
  const { prompts, favorites, toggleFavorite } = useMarketplace();

  const imagePrompts = prompts.filter((p) => p.category?.type === 'IMAGE').slice(0, 3);
  const videoPrompts = prompts.filter((p) => p.category?.type === 'VIDEO').slice(0, 3);

  return (
    <div className="relative min-h-screen bg-background text-text-ivory selection:bg-gold/30">
      <SEO />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-gold-dark/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-gold-light mb-8 shadow-gold-sm">
          <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
          <span>Haute Prompts for Discerning Creators</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text-ivory max-w-5xl mx-auto leading-[1.08]">
          The Private Vault of <span className="gold-gradient-text">Master AI Prompts</span>
        </h1>

        <p className="mt-8 text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto font-sans font-light leading-relaxed">
          Store and version your proprietary prompt workflows in a secure personal sanctuary. Acquire
          certified commercial prompts for Midjourney, FLUX, Sora, and Veo with zero-leak protection.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="gold"
            size="lg"
            onClick={() => navigate('/browse')}
            className="w-full sm:w-auto text-base px-8 py-3.5 shadow-gold-md gap-2"
          >
            <span>Explore Certified Marketplace</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/vault')}
            className="w-full sm:w-auto text-base px-8 py-3.5 gap-2 border-white/15 hover:border-gold/50"
          >
            <Vault className="h-4 w-4 text-gold" />
            <span>Open Personal Vault</span>
          </Button>
        </div>

        {/* Certified Model Badges Strip */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-text-muted uppercase tracking-wider">
          <span className="hover:text-gold transition-colors">Midjourney v6.1</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-gold transition-colors">FLUX.1 Pro</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-gold transition-colors">OpenAI Sora</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-gold transition-colors">Google Veo</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-gold transition-colors">Runway Gen-3</span>
          <span className="text-white/10">•</span>
          <span className="hover:text-gold transition-colors">Kling AI 1.5</span>
        </div>
      </section>

      {/* Two Pillars Section: Image Prompts vs Video Prompts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: Image Prompts */}
          <Link
            to="/browse?category=IMAGE"
            className="glass-card group relative rounded-3xl border border-white/10 p-8 sm:p-10 transition-all duration-500 hover:border-gold/50 hover:shadow-gold-md overflow-hidden block"
          >
            <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gold/15 text-gold border border-gold/30">
                  <Image className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-gold-light flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse Images <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div>
                <h3 className="font-serif text-3xl font-bold text-text-ivory mb-2 group-hover:text-gold-light transition-colors">
                  Haute Image Prompts
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Editorial fashion portraits, luxury horology product reveals, architectural brutalism,
                  and embossed brand marks for Midjourney v6.1 and FLUX.1.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['Portrait', 'Product', 'Architecture', 'Anime', 'Minimalist Logos'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono rounded-full bg-white/5 border border-white/10 px-3 py-1 text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Pillar 2: Video Prompts */}
          <Link
            to="/browse?category=VIDEO"
            className="glass-card group relative rounded-3xl border border-white/10 p-8 sm:p-10 transition-all duration-500 hover:border-gold/50 hover:shadow-gold-md overflow-hidden block"
          >
            <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  <Film className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse Videos <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div>
                <h3 className="font-serif text-3xl font-bold text-text-ivory mb-2 group-hover:text-indigo-200 transition-colors">
                  Generative Video Prompts
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  4K 60fps slow-motion commercial perfume ads, FPV drone traversals, 9:16 vertical
                  fashion reels, and cinematic space worldbuilding for Sora, Veo, and Kling.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['Commercial Ads', 'FPV Drones', '9:16 Reels', 'Sci-Fi', 'Fluid Dynamics'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono rounded-full bg-white/5 border border-white/10 px-3 py-1 text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Showcase 1: Featured Image Prompts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                Certified Compositions
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              Curated Image Prompts
            </h2>
          </div>
          <Link
            to="/browse?category=IMAGE"
            className="text-xs font-mono uppercase tracking-wider text-gold hover:text-gold-light flex items-center gap-1.5"
          >
            <span>View All Image Prompts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {imagePrompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              isFavorited={favorites.has(p.id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Showcase 2: Featured Video Prompts with Hover-to-Play */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-300">
                Cinematography in Motion
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory">
              High-Fidelity Video Prompts
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Hover over previews to trigger live video playback.
            </p>
          </div>
          <Link
            to="/browse?category=VIDEO"
            className="text-xs font-mono uppercase tracking-wider text-gold hover:text-gold-light flex items-center gap-1.5"
          >
            <span>View All Video Prompts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoPrompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              isFavorited={favorites.has(p.id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Zero-Leak Security Feature Strip */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-card rounded-3xl border border-gold/40 p-10 sm:p-14 relative overflow-hidden shadow-gold-sm">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 px-3.5 py-1 text-xs font-mono text-gold-light">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>Zero-Leak Cryptographic Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text-ivory leading-tight">
              Full prompt syntax is never delivered to client browsers without verified entitlement.
            </h2>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-light">
              Unlike generic marketplaces where prompt text is exposed in public DOM attributes or client
              JSON payloads, Aurum Prompts isolates all prompt contents in a strictly guarded database
              partition accessible exclusively through server-validated RPCs with audit logging and rate
              limiting.
            </p>

            <div className="pt-2 flex flex-wrap gap-6 text-xs font-mono text-gold-light">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Row-Level Security on 100% of tables
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Verified Buyer Cryptographic Tokens
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Immutable Version Snapshotting
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
