import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-surface/40 pb-20 md:pb-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/[0.06]">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-text-ivory">
                AURUM
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold font-mono">
                VAULT
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              The premier vault and marketplace for certified AI prompts. Engineered for professional
              art directors, generative cinematographers, and worldbuilders.
            </p>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li>
                <Link to="/browse?category=IMAGE" className="hover:text-text-ivory transition-colors">
                  Image Prompts (Midjourney, Flux)
                </Link>
              </li>
              <li>
                <Link to="/browse?category=VIDEO" className="hover:text-text-ivory transition-colors">
                  Video Prompts (Sora, Veo, Kling)
                </Link>
              </li>
              <li>
                <Link to="/browse?bundles=true" className="hover:text-text-ivory transition-colors">
                  Curated Studio Bundles
                </Link>
              </li>
              <li>
                <Link to="/browse?free=true" className="hover:text-text-ivory transition-colors">
                  Complimentary Prompts
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li>
                <Link to="/license" className="hover:text-text-ivory transition-colors">
                  Commercial Prompt License
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-text-ivory transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-text-ivory transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-text-ivory transition-colors">
                  Refund & Guarantee Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold mb-4">
              The Aurum Dispatch
            </h4>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Receive private access to weekly unlisted prompt drops, model parameter breakdowns, and
              exclusive discounts.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gold/10 border border-gold/30 text-gold-light text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>You are enrolled in the Aurum Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="concierge@atelier.com"
                    className="w-full rounded-lg border border-white/10 bg-elevated px-3 py-2 text-xs text-text-ivory placeholder:text-text-muted/50 focus:border-gold focus:outline-none"
                  />
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    className="absolute right-1 top-1 bottom-1 px-3 text-xs"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} AURUM PROMPTS INC. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero-Leak RLS Cryptographic Content Shield Active</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
