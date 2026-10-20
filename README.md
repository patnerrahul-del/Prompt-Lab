# AURUM PROMPTS — Premium Luxury Prompt Vault & Marketplace

[![CI](https://github.com/rahulmaithili/Promptlab/actions/workflows/ci.yml/badge.svg)](https://github.com/rahulmaithili/Promptlab/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/deploy-status)](https://app.netlify.com)
[![License: Commercial](https://img.shields.io/badge/License-Commercial-C9A24B.svg)](./apps/web/src/pages/legal/license.tsx)

**AURUM PROMPTS** is a production-ready, ultra-exclusive AI prompt engineering sanctuary and curated marketplace designed with a **"Quiet Luxury"** aesthetic (obsidian black, antique gold foil, champagne typography, and micro-hairline borders). It enables creators to privately store, version, and refine generative image and video prompts, while allowing verified listing and commercial acquisition with a **zero-leak cryptographic content shield**.

---

## 1. System Architecture & Features

### A. Personal Vault
- **Distraction-Free Atelier**: Write and refine prompts with live syntax highlighting and automatic variable detection (`{{subject}}`, `{{lighting}}`, `{{camera}}`).
- **Encrypted Storage**: Visibility controls (`private` by default, `unlisted`, `public`).
- **Immutable Version History**: Every edit creates a cryptographically timestamped snapshot with 1-click restore.
- **Bulk Import & Export**: One-click JSON and CSV export/import for complete creator sovereignty.

### B. Curated Marketplace
- **Two Modality Pillars**: Dedicated catalog architectures for **Image Prompts** (Midjourney v6.1, FLUX.1 Pro, SDXL) and **Video Prompts** (OpenAI Sora, Google Veo, Kling AI, Runway Gen-3).
- **Interactive Previews**: Hover-to-play lazy-loaded 4K video previews and macro photography galleries.
- **Faceted Discovery**: Typo-tolerant fuzzy search, modality filters, AI model selectors, price filters (including complimentary), and sort orders.
- **Live Prompt Customizer**: Form controls for detected variables, real-time prompt interpolation, and 1-click "Copy for Midjourney / Sora / SD" with gold toast animation.

### C. Server-Side Payments & Zero-Leak Security
- **Modular Payment Provider**: Clean `PaymentProvider` abstraction with pluggable `RazorpayProvider` (INR) and Stripe readiness.
- **Server-Side Trust Only**: Prices, discounts, and order amounts are strictly validated on Supabase Edge Functions (`create-order`, `verify-payment`, `razorpay-webhook`). Client-sent prices are never trusted.
- **Zero-Leak Content Shield**: Master prompt text is isolated in `prompt_contents`. Direct `SELECT` is blocked by Postgres Row Level Security (RLS) for all non-owners. Content is accessible only through the audited, rate-limited RPC `get_prompt_content(prompt_id)`.

### D. Governance & Monetization
- **Admin Command Center**: Gross volume analytics, Recharts revenue curve, submission moderation queue, and feature flag management (`ENABLE_MULTI_SELLER`, `commission_rate`, `maintenance_mode`).
- **Creator Studio**: Earnings ledger, sales metrics, and instant payout requests (Bank transfer / UPI).

---

## 2. Monorepo Structure

```
aurum-prompts/
├── .github/workflows/
│   ├── ci.yml                 # Lint, Typecheck, Test, and Web Build
│   └── deploy.yml             # Supabase migrations & Edge Function deployment
├── apps/web/                  # React 18 + Vite + TypeScript Strict + Tailwind CSS
│   ├── public/                # Manifest, PWA icons, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/        # Radix luxury primitives, Prompt cards, Media gallery
│   │   ├── hooks/             # useAuth, useVault, useMarketplace, useLenis
│   │   ├── lib/               # Typed Supabase client, Razorpay adapter, utils
│   │   ├── pages/             # Home, Browse, Detail, Vault, Checkout, Admin, Seller, Legal
│   │   └── types/             # database.types.ts
│   ├── netlify.toml           # SPA 200 rewrite, HSTS, CSP, and asset cache headers
│   └── package.json
├── supabase/
│   ├── functions/             # Deno Edge Functions (create-order, razorpay-webhook, verify-payment)
│   ├── migrations/            # Postgres schema, RLS policies, triggers, anti-leak RPC
│   ├── tests/                 # rls_security.test.sql proving zero-leak protection
│   └── seed.sql               # 12 master demo prompts (6 Image, 6 Video) + categories + models
├── .env.example               # Reference environment template
└── README.md
```

---

## 3. Step-by-Step Setup Guide

### Prerequisites
- Node.js 18+ or 20+
- Git
- Supabase CLI (optional for local migrations)

### 1. Clone & Environment Configuration
```bash
git clone https://github.com/rahulmaithili/Promptlab.git
cd Promptlab
cp .env.example .env
```

Populate `.env` with your project credentials:
```env
# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_APP_URL=http://localhost:5173

# Backend & Edge Functions (Configured in Supabase Secrets)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 2. Database Provisioning (Supabase)
Push migrations and seed the database with the 12 certified luxury prompts:
```bash
supabase link --project-ref your-project-id
supabase db push
supabase db execute --file supabase/seed.sql
```

To run the RLS security test suite proving non-buyers cannot read locked prompts:
```bash
supabase db execute --file supabase/tests/rls_security.test.sql
```

### 3. Deploy Edge Functions
```bash
supabase functions deploy create-order --no-verify-jwt
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
```

Set function secrets:
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_key_id RAZORPAY_KEY_SECRET=your_secret RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Razorpay Webhook Setup
1. In the **Razorpay Dashboard** > Settings > Webhooks, add a new webhook.
2. Webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
3. Secret: Enter a strong random secret and add it to `RAZORPAY_WEBHOOK_SECRET`.
4. Active Events: Select `order.paid` and `payment.captured`.

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The app will run in full interactive mode with offline local storage fallbacks if Supabase credentials are not yet supplied.

---

## 4. Continuous Deployment (CI/CD)

### Netlify Deployment
The repo is pre-configured with `netlify.toml`:
- Base directory: `apps/web`
- Publish directory: `dist`
- Build command: `npm run build`
- Automatic SPA redirect rule: `/* -> /index.html 200`
- Strict security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).

### GitHub Actions Secrets
In your GitHub repository settings, configure:
| Secret Name | Description |
| :--- | :--- |
| `SUPABASE_ACCESS_TOKEN` | Personal access token from Supabase Account |
| `SUPABASE_PROJECT_ID` | Project Reference ID |
| `SUPABASE_DB_PASSWORD` | Postgres Database Password |
| `VITE_SUPABASE_URL` | Production Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Production Supabase Anonymous Key |
| `VITE_RAZORPAY_KEY_ID` | Production Razorpay Key ID |

---

## 5. Security Proof: Zero-Leak Guarantee

To mathematically verify that locked prompt text cannot leak to unauthorized visitors or inspecting client tools:
1. `prompt_contents` has `ROW LEVEL SECURITY` enabled.
2. The SELECT policy explicitly requires `prompts.user_id = auth.uid() OR is_admin()`.
3. Non-buyers querying `supabase.from('prompt_contents').select('*')` receive `0` rows.
4. The RPC `get_prompt_content(p_prompt_id)` enforces:
   - Valid session authentication (`auth.uid() IS NOT NULL`)
   - Entitlement in `purchases` table OR prompt ownership OR `price_inr = 0`
   - Rate limiting: Maximum 30 decryptions per minute
   - Audit trail recorded in `analytics_events` on every access.

---

## 6. Definition of Done Checklist

- [x] Monorepo scaffold with React 18, Vite, strict TypeScript, and Tailwind CSS.
- [x] Complete Supabase migrations (22 tables, strict RLS, triggers, full-text indexes).
- [x] Cryptographic anti-leak RPC (`get_prompt_content`) with rate limiting and audit trail.
- [x] Seed data containing 12 master prompts (6 Image, 6 Video) + categories + models.
- [x] RLS security test suite proving non-buyers cannot access locked text.
- [x] Quiet luxury design system with dark/ivory themes, Cormorant Garamond headings, and gold hairline accents.
- [x] Lenis smooth scrolling (60fps) respecting `prefers-reduced-motion`.
- [x] Personal Vault with distraction-free studio, variable parser, and version history drawer.
- [x] Marketplace catalog with typo-tolerant search, modality tabs, and hover-to-play video cards.
- [x] Razorpay payment provider with server-side order creation and webhook verification.
- [x] Admin Command Center with Recharts analytics and community submission moderation.
- [x] Seller Dashboard with earnings ledger and payout request handling.
- [x] Command Palette (Cmd/Ctrl+K), SEO meta tags, JSON-LD schema, and PWA manifest.
