import { SEO } from '@/components/common/seo';

export function License() {
  return (
    <div className="min-h-screen bg-background text-text-ivory py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Commercial Prompt License — Aurum Prompts" />
      <div className="max-w-3xl mx-auto space-y-8 glass-card rounded-3xl p-8 sm:p-12 border border-white/10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory pb-4 border-b border-white/10">
          Commercial Prompt License Agreement
        </h1>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
          <p>
            This Commercial Prompt License (&ldquo;Agreement&rdquo;) defines the rights and restrictions
            governing the use of certified AI prompts acquired through the Aurum Prompts Marketplace.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">1. Grant of License</h3>
          <p>
            Upon successful payment and issuance of cryptographic entitlement, Aurum Prompts grants the
            purchaser a non-exclusive, perpetual, worldwide, irrevocable license to use, synthesize, and
            adapt the prompt text, variable schemas, and model configuration settings.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">2. Commercial Outputs</h3>
          <p>
            All media generated through the execution of certified prompts (including still imagery,
            cinematography, 3D textures, advertising creatives, and video assets) is 100% owned by the
            purchaser and may be used for commercial client engagements, advertising broadcasts, print,
            and digital products with zero royalty obligations.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">3. Restrictions on Resale</h3>
          <p>
            Purchasers are strictly prohibited from re-licensing, sub-licensing, or publicly redistributing
            the underlying prompt syntax, system instructions, or raw variables in any competing prompt
            marketplace or public database.
          </p>
        </div>
      </div>
    </div>
  );
}
