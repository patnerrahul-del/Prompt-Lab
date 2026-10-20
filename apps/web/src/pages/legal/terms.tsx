import { SEO } from '@/components/common/seo';

export function Terms() {
  return (
    <div className="min-h-screen bg-background text-text-ivory py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Terms of Service — Aurum Prompts" />
      <div className="max-w-3xl mx-auto space-y-8 glass-card rounded-3xl p-8 sm:p-12 border border-white/10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory pb-4 border-b border-white/10">
          Terms of Service
        </h1>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
          <p>
            Welcome to Aurum Prompts. By accessing our platform, vault storage, or purchasing
            commercial prompt entitlements, you agree to comply with the terms set forth herein.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">1. Atelier Vault Sanctuary</h3>
          <p>
            Your private vault prompts remain your exclusive intellectual property. Aurum Prompts does
            not inspect, aggregate, or train machine learning models on prompts marked as Private or
            Unlisted.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">2. Marketplace Conduct</h3>
          <p>
            Creators submitting prompts for public listing warrant that their prompts produce authentic,
            high-fidelity results and do not generate unlawful, defamatory, or infringing content.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">3. Payments & Currency</h3>
          <p>
            All marketplace transactions are processed securely in Indian Rupees (INR) through licensed
            payment aggregators. Prices are inclusive of applicable service levies.
          </p>
        </div>
      </div>
    </div>
  );
}
