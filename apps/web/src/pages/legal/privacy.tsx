import { SEO } from '@/components/common/seo';

export function Privacy() {
  return (
    <div className="min-h-screen bg-background text-text-ivory py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Privacy Policy — Aurum Prompts" />
      <div className="max-w-3xl mx-auto space-y-8 glass-card rounded-3xl p-8 sm:p-12 border border-white/10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-ivory pb-4 border-b border-white/10">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
          <p>
            Aurum Prompts is committed to privacy and cryptographic security. This Privacy Policy
            discloses our data handling practices for vault assets and account credentials.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">1. Data Minimization</h3>
          <p>
            We collect only the essential identifiers required to maintain your account and process
            secure payments: email address, billing profile, and authorized OAuth identity tokens.
          </p>

          <h3 className="font-serif text-xl font-bold text-text-ivory">2. Zero-Leak Vault Encryption</h3>
          <p>
            Locked prompt contents reside in isolated database partitions. We employ Row-Level Security
            (RLS) to ensure that only authenticated owners and verified purchasers can decrypt prompt
            bodies.
          </p>
        </div>
      </div>
    </div>
  );
}
