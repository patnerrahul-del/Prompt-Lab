-- ==============================================================================
-- 20260301000000_init_schema.sql
-- AURUM PROMPTS — Luxury AI Prompt Vault & Marketplace
-- Full PostgreSQL schema with pg_trgm search, foreign keys, and indexes.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('visitor', 'user', 'seller', 'admin')),
    seller_balance_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (seller_balance_inr >= 0),
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('IMAGE', 'VIDEO')),
    description TEXT,
    icon TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. AI_MODELS (Admin-managed catalog: Midjourney, Flux, Veo, Sora, Kling, Runway, etc.)
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'BOTH' CHECK (category IN ('IMAGE', 'VIDEO', 'BOTH')),
    copy_template TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PROMPTS (Public metadata; locked content is in prompt_contents)
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    teaser TEXT, -- First ~20% of prompt shown free
    negative_prompt TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb, -- aspect_ratio, resolution, duration, seed, etc.
    variables JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { name, default_value, label, options }
    difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
    license_type TEXT NOT NULL DEFAULT 'commercial' CHECK (license_type IN ('personal', 'commercial', 'exclusive')),
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_inr >= 0),
    compare_at_price_inr NUMERIC(10, 2) CHECK (compare_at_price_inr IS NULL OR compare_at_price_inr >= price_inr),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    copies_count INT NOT NULL DEFAULT 0,
    sales_count INT NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PROMPT_CONTENTS (STRICTLY ISOLATED & ENCRYPTED CONTENT)
CREATE TABLE IF NOT EXISTS public.prompt_contents (
    prompt_id UUID PRIMARY KEY REFERENCES public.prompts(id) ON DELETE CASCADE,
    full_prompt_text TEXT NOT NULL,
    system_instructions TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PROMPT_VERSIONS (Version history snapshotting on prompt edit)
CREATE TABLE IF NOT EXISTS public.prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    prompt_text TEXT NOT NULL,
    negative_prompt TEXT,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (prompt_id, version_number)
);

-- 7. PROMPT_MEDIA (Cover & sample gallery for image & video previews)
CREATE TABLE IF NOT EXISTS public.prompt_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    blur_hash TEXT,
    width INT,
    height INT,
    duration_seconds NUMERIC(6, 2),
    display_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TAGS & PROMPT_TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.prompt_tags (
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);

-- 9. COLLECTIONS (Folders in personal vault) & COLLECTION_ITEMS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, slug)
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (collection_id, prompt_id)
);

-- 10. FAVORITES (Wishlist / Bookmarks)
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, prompt_id)
);

-- 11. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_uses INT,
    uses_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. ORDERS & ORDER_ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    subtotal_inr NUMERIC(10, 2) NOT NULL CHECK (subtotal_inr >= 0),
    discount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_inr >= 0),
    total_inr NUMERIC(10, 2) NOT NULL CHECK (total_inr >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE RESTRICT,
    unit_price_inr NUMERIC(10, 2) NOT NULL CHECK (unit_price_inr >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (order_id, prompt_id)
);

-- 13. PURCHASES (Entitlement table for unlocked prompts)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    price_paid_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, prompt_id)
);

-- 14. REVIEWS (Verified buyers only)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (prompt_id, user_id)
);

-- 15. BUNDLES & BUNDLE_ITEMS
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    price_inr NUMERIC(10, 2) NOT NULL CHECK (price_inr >= 0),
    compare_at_price_inr NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.bundle_items (
    bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, prompt_id)
);

-- 16. SELLER_PAYOUTS
CREATE TABLE IF NOT EXISTS public.seller_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_inr NUMERIC(12, 2) NOT NULL CHECK (amount_inr > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
    payout_method TEXT NOT NULL DEFAULT 'bank_transfer',
    payout_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

-- 17. ANALYTICS_EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'copy', 'purchase', 'favorite', 'search')),
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. SITE_SETTINGS (Key-value store for feature flags, commission %, maintenance mode)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & TYPO-TOLERANT SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model_id ON public.prompts(model_id);
CREATE INDEX IF NOT EXISTS idx_prompts_status_visibility ON public.prompts(status, visibility);
CREATE INDEX IF NOT EXISTS idx_prompts_price ON public.prompts(price_inr);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON public.prompts(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON public.prompts(created_at DESC);

-- GIN trigram indexes for typo-tolerant fuzzy search on title and description
CREATE INDEX IF NOT EXISTS idx_prompts_title_trgm ON public.prompts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prompts_desc_trgm ON public.prompts USING gin (short_description gin_trgm_ops);

-- Purchases, Orders, Collections indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_prompt_id ON public.purchases(prompt_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_collection_items_prompt_id ON public.collection_items(prompt_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type, created_at DESC);
