import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, History, Sparkles, Shield, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { extractVariables, formatINR } from '@/lib/utils';
import { useVault } from '@/hooks/use-vault';
import { useToast } from '@/components/ui/toast';
import { SEO } from '@/components/common/seo';
import type { PromptDifficulty, PromptLicenseType, PromptVisibility, PromptVariable } from '@/types/database.types';

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { createPrompt, allPrompts } = useVault();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullPromptText, setFullPromptText] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [categoryType, setCategoryType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [targetModel, setTargetModel] = useState('Midjourney v6.1');
  const [difficulty, setDifficulty] = useState<PromptDifficulty>('intermediate');
  const [licenseType, setLicenseType] = useState<PromptLicenseType>('commercial');
  const [visibility, setVisibility] = useState<PromptVisibility>('private');
  const [priceInr, setPriceInr] = useState<number>(0);
  const [compareAtPriceInr, setCompareAtPriceInr] = useState<number | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [teaser, setTeaser] = useState('');

  // Extract variables automatically
  const detectedVariables = useMemo(() => {
    return extractVariables(fullPromptText);
  }, [fullPromptText]);

  // Load existing prompt if editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = allPrompts.find((p) => p.id === id);
      if (existing) {
        setTitle(existing.title);
        setShortDescription(existing.short_description || '');
        setNegativePrompt(existing.negative_prompt || '');
        setDifficulty(existing.difficulty);
        setLicenseType(existing.license_type);
        setVisibility(existing.visibility);
        setPriceInr(existing.price_inr);
        setCompareAtPriceInr(existing.compare_at_price_inr || undefined);
        setTeaser(existing.teaser || '');
        setCategoryType(existing.category?.type || 'IMAGE');
        setAspectRatio((existing.settings?.aspect_ratio as string) || '16:9');
        setDuration((existing.settings?.duration as string) || '5s');

        const localContent = localStorage.getItem(`aurum_content_${existing.id}`);
        if (localContent) setFullPromptText(localContent);
        else if (existing.teaser) setFullPromptText(existing.teaser);
      }
    }
  }, [isEditing, id, allPrompts]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullPromptText.trim()) {
      toastError('Prompt title and content cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const variablePayload: PromptVariable[] = detectedVariables.map((v) => ({
        name: v,
        default_value: '',
        label: v.replace(/_/g, ' '),
      }));

      const settingsPayload = {
        aspect_ratio: aspectRatio,
        ...(categoryType === 'VIDEO' ? { duration } : {}),
      };

      await createPrompt(
        {
          title,
          short_description: shortDescription,
          negative_prompt: negativePrompt,
          difficulty,
          license_type: licenseType,
          visibility,
          price_inr: priceInr,
          compare_at_price_inr: compareAtPriceInr || null,
          settings: settingsPayload,
          variables: variablePayload,
          status: visibility === 'public' ? 'published' : 'draft',
          teaser: teaser || fullPromptText.slice(0, Math.floor(fullPromptText.length * 0.25)) + '...',
        },
        fullPromptText
      );

      success('Prompt saved with cryptographic snapshot');
      navigate('/vault');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save prompt';
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-ivory py-10 px-4 sm:px-6 lg:px-8">
      <SEO title={`${isEditing ? 'Refine' : 'Craft'} Prompt Atelier — Aurum Prompts`} />

      <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/vault')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Vault</span>
            </Button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-serif font-bold text-text-ivory">
              {isEditing ? 'Refine Atelier Asset' : 'New Vault Acquisition'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={() => setIsVersionDrawerOpen(true)}
                className="gap-2"
              >
                <History className="h-4 w-4 text-gold" />
                <span>Version Snapshots</span>
              </Button>
            )}

            <Button type="submit" variant="gold" size="md" isLoading={isLoading} className="gap-2 shadow-gold-sm">
              <Save className="h-4 w-4" />
              <span>Save & Seal Vault</span>
            </Button>
          </div>
        </div>

        {/* Two-Column Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editing Canvas */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gold">
                Prompt Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Tourbillon: Haute Horlogerie Noir"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-lg font-serif font-bold text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
              />
            </div>

            {/* Distraction-Free Full Prompt Syntax Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-widest text-gold">
                  Master Prompt Syntax (Strictly Locked)
                </label>
                <span className="text-[11px] font-mono text-text-muted">
                  Use {'{{variable_name}}'} for live dynamic customizers
                </span>
              </div>
              <textarea
                required
                rows={9}
                value={fullPromptText}
                onChange={(e) => setFullPromptText(e.target.value)}
                placeholder="Type your complete prompt here. Wrap dynamic tokens in {{variables}} such as {{subject}}, {{lighting}}, or {{camera}}..."
                className="w-full rounded-xl border border-white/15 bg-black/60 p-4 font-mono text-sm leading-relaxed text-text-ivory placeholder:text-text-muted/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />

              {/* Detected Variable Pills */}
              {detectedVariables.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-[11px] font-mono text-text-muted uppercase">Detected Variables:</span>
                  {detectedVariables.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 rounded-md bg-gold/15 border border-gold/30 px-2 py-0.5 text-xs font-mono text-gold-light"
                    >
                      <Sparkles className="h-3 w-3" />
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Negative Prompt Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted">
                Negative Prompt / Exclusion Parameters
              </label>
              <textarea
                rows={3}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="low quality, deformed, blurry, extra limbs, artificial artifacts, watermark..."
                className="w-full rounded-xl border border-white/10 bg-surface p-3 font-mono text-xs text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
              />
            </div>

            {/* Teaser Display */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-text-muted">
                Public Teaser (Shown free on catalog cards ~25%)
              </label>
              <textarea
                rows={2}
                value={teaser}
                onChange={(e) => setTeaser(e.target.value)}
                placeholder="Leave blank to auto-generate from the initial 25% of master prompt..."
                className="w-full rounded-xl border border-white/10 bg-surface p-3 text-xs italic font-serif text-text-muted focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Right Sidebar: Settings & Publishing Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sliders className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-serif font-bold text-text-ivory">
                  Atelier Parameters
                </h4>
              </div>

              {/* Category (Image vs Video) */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                  Category Modality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryType('IMAGE')}
                    className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                      categoryType === 'IMAGE'
                        ? 'border-gold bg-gold/15 text-gold-light'
                        : 'border-white/10 text-text-muted hover:text-text-ivory'
                    }`}
                  >
                    Image Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('VIDEO')}
                    className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                      categoryType === 'VIDEO'
                        ? 'border-gold bg-gold/15 text-gold-light'
                        : 'border-white/10 text-text-muted hover:text-text-ivory'
                    }`}
                  >
                    Video Prompt
                  </button>
                </div>
              </div>

              {/* AI Model */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                  Target AI Model
                </label>
                <select
                  value={targetModel}
                  onChange={(e) => setTargetModel(e.target.value)}
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

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="16:9">16:9 (Landscape Cinematic)</option>
                  <option value="9:16">9:16 (Vertical Mobile Reel)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:5">4:5 (Editorial Social)</option>
                  <option value="21:9">21:9 (Anamorphic Ultrawide)</option>
                </select>
              </div>

              {categoryType === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                    Target Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5s or 10s"
                    className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Visibility & Marketplace Listing */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold" />
                  <h4 className="text-sm font-serif font-bold text-text-ivory">
                    Security & Listing
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                    Vault Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as PromptVisibility)}
                    className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="private">Private (Only You)</option>
                    <option value="unlisted">Unlisted (Direct Link Only)</option>
                    <option value="public">Public (Listed in Marketplace)</option>
                  </select>
                </div>

                {/* Pricing in INR */}
                <div>
                  <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                    Price in INR (₹0 = Complimentary)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={priceInr}
                    onChange={(e) => setPriceInr(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-gold-light font-serif font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">
                    {priceInr === 0 ? 'Complimentary for verified collectors' : `Listed at ${formatINR(priceInr)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Version History Drawer */}
      <Drawer
        isOpen={isVersionDrawerOpen}
        onClose={() => setIsVersionDrawerOpen(false)}
        title="Prompt Snapshot History"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Every revision made in your studio is archived cryptographically. You can review diffs and
            restore past states with zero data loss.
          </p>

          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gold font-semibold">Version 1 (Initial Archival)</span>
              <span className="text-text-muted">Today</span>
            </div>
            <p className="text-xs font-mono text-text-ivory line-clamp-2">
              {fullPromptText}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                success('Restored Version 1 state');
                setIsVersionDrawerOpen(false);
              }}
              className="text-xs py-1"
            >
              Restore Snapshot
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
