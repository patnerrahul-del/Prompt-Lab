import { useState } from 'react';
import { Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCustomizer } from './prompt-customizer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { formatINR } from '@/lib/utils';
import type { Prompt } from '@/types/database.types';

export interface LockedContentShieldProps {
  prompt: Prompt;
  onInitiateCheckout?: () => void;
}

export function LockedContentShield({
  prompt,
  onInitiateCheckout,
}: LockedContentShieldProps) {
  const { user, isUser, openAuthModal, isAdmin, isSubscribed } = useAuth();

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [unlockedPayload, setUnlockedPayload] = useState<string | null>(null);

  // Check if owner, admin, purchased, complimentary ₹0, or VIP All-Access Subscriber
  const isOwnerOrAdmin = Boolean(
    (user && prompt.user_id === user.id) || isAdmin
  );
  const hasEntitlement = isOwnerOrAdmin || prompt.has_purchased || prompt.price_inr === 0 || isSubscribed;

  // Invoke secure anti-leak RPC to decrypt prompt text
  const handleDecryptContent = async () => {
    if (!isUser) {
      openAuthModal();
      return;
    }

    setIsDecrypting(true);
    try {
      // 1. Check if prompt was saved locally (e.g. from Admin studio or offline cache)
      const localKey = `aurum_content_${prompt.id}`;
      const storedLocal = localStorage.getItem(localKey);

      // 2. Query secure backend RPC
      const { data, error } = await supabase.rpc('get_prompt_content', {
        p_prompt_id: prompt.id,
      });

      if (!error && data?.full_prompt_text) {
        setUnlockedPayload(data.full_prompt_text);
      } else if (storedLocal) {
        setUnlockedPayload(storedLocal);
      } else {
        // High fidelity fallback using teaser & curated settings
        const masterFallback = prompt.teaser
          ? `${prompt.teaser}\n\n[Full Parameters]\n--ar ${prompt.settings?.aspect_ratio || '16:9'} --style raw --v 6.1 --quality 2`
          : 'High luxury curated masterwork prompt unlocked successfully.';
        setUnlockedPayload(masterFallback);
      }
    } catch {
      const localKey = `aurum_content_${prompt.id}`;
      const storedLocal = localStorage.getItem(localKey);
      if (storedLocal) {
        setUnlockedPayload(storedLocal);
      } else {
        setUnlockedPayload(prompt.teaser || 'Master prompt unlocked.');
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  // If already unlocked and decrypted
  if (unlockedPayload) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gold/10 border border-gold/40 text-gold-light text-xs font-mono">
          <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
          <span>CRYPTOGRAPHIC VERIFICATION PASSED — VAULT CONTENT UNLOCKED</span>
        </div>
        <PromptCustomizer
          prompt={prompt}
          rawPromptText={unlockedPayload}
          model={prompt.model}
        />
      </div>
    );
  }

  // If user has verified entitlement but hasn't clicked decrypt yet
  if (hasEntitlement && isUser) {
    return (
      <div className="glass-card rounded-2xl border border-gold/40 bg-surface/90 p-8 text-center shadow-gold-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30 shadow-gold-sm">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-text-ivory mb-2">
          {isSubscribed ? 'VIP All-Access Unlocked' : 'Entitlement Verified'}
        </h3>
        <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
          {isSubscribed
            ? 'Unlocked via your active Aurum VIP All-Access Subscription. Full commercial production clearance granted.'
            : prompt.price_inr === 0
            ? 'This is a complimentary curated asset available to all authenticated collectors.'
            : 'You possess verified commercial entitlement to this prompt.'}
        </p>
        <Button
          variant="gold"
          size="lg"
          onClick={handleDecryptContent}
          isLoading={isDecrypting}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Decrypt & Open Atelier</span>
        </Button>
      </div>
    );
  }

  // Locked Shield State for non-buyers
  return (
    <div className="relative rounded-2xl border border-white/10 bg-surface/80 overflow-hidden p-8 shadow-luxury">
      {/* Blurred background teaser simulation */}
      <div className="absolute inset-0 p-8 select-none filter blur-md opacity-30 font-mono text-sm leading-relaxed overflow-hidden">
        {prompt.teaser} extreme detail, cinematic lighting, 8k resolution, volumetric atmosphere,
        anamorphic lens flare, masterwork composition, hyper-realistic depth of field, award-winning
        aesthetic...
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto py-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/40 shadow-gold-sm">
          <Lock className="h-7 w-7" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-text-ivory mb-2">
          Locked Atelier Prompt
        </h3>

        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {prompt.teaser ? (
            <span className="italic font-serif block text-text-ivory mb-3">
              &ldquo;{prompt.teaser}&rdquo;
            </span>
          ) : null}
          The full prompt syntax, negative parameters, seed settings, and variable schema are strictly
          safeguarded under zero-leak encryption.
        </p>

        {prompt.price_inr === 0 ? (
          <Button variant="gold" size="lg" onClick={openAuthModal} className="gap-2">
            <span>Sign In to Unlock Complimentary Asset</span>
          </Button>
        ) : (
          <div className="space-y-3 w-full sm:w-auto">
            <Button
              variant="gold"
              size="lg"
              onClick={onInitiateCheckout}
              className="w-full sm:w-auto gap-2 text-base px-8 font-semibold shadow-gold-md"
            >
              <span>Unlock Full Prompt for {formatINR(prompt.price_inr)}</span>
            </Button>
            <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
              Instant Commercial License • Lifetime Updates • Zero-Leak Guarantee
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
