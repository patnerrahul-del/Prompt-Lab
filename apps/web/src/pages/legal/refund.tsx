import { SEO } from '@/components/common/seo';

export function Refund() {
  return (
    <div className="min-h-screen bg-background text-text-ivory py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Refund Policy — Aurum Prompts" />
      <div className="max-w-3xl mx-auto space-y-8 glass-card rounded-3xl p-8 sm:p-12 border border-white/10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory pb-4 border-b border-white/10">
          Refund & Satisfaction Guarantee
        </h1>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
          <p>
            Aurum Prompts guarantees that all certified prompts execute accurately on their designated
            AI model architectures (e.g. Midjourney v6.1, FLUX.1 Pro, OpenAI Sora).
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">1. Digital Nature of Assets</h3>
          <p>
            Due to the immediate cryptographic delivery of digital intellectual property upon purchase,
            prompts that have been decrypted and viewed in the Atelier are generally non-refundable.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">2. Discrepancy Claims</h3>
          <p>
            If a certified prompt fails to generate outputs adhering to the sample aesthetic due to syntax
            obsolescence or model version deprecation, contact concierge@aurumprompts.com within 7 days
            for a full store credit or replacement.
          </p>
        </div>
      </div>
    </div>
  );
}
