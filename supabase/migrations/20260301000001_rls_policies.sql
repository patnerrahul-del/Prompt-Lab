-- ==============================================================================
-- 20260301000001_rls_policies.sql
-- AURUM PROMPTS — Zero-Leak Security & Row Level Security Policies
-- Every table has RLS enabled. Prompt contents are completely blocked from
-- direct SELECT except for owner and admin.
-- ==============================================================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile details"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- Regular users cannot escalate their role or balance directly
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
        AND (seller_balance_inr = (SELECT seller_balance_inr FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- 2. CATEGORIES & AI_MODELS (Public read, admin write)
CREATE POLICY "Categories viewable by all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "AI Models viewable by all" ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "Admins manage AI Models" ON public.ai_models FOR ALL USING (public.is_admin());

-- 3. PROMPTS
CREATE POLICY "Public can view published and non-private prompts"
    ON public.prompts FOR SELECT
    USING (
        (status = 'published' AND visibility IN ('public', 'unlisted'))
        OR auth.uid() = user_id
        OR public.is_admin()
    );

CREATE POLICY "Authenticated users can create prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners and admins can update prompts"
    ON public.prompts FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Owners and admins can delete prompts"
    ON public.prompts FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- 4. PROMPT_CONTENTS (ANTI-LEAK VAULT: ONLY OWNER & ADMIN CAN DIRECT SELECT)
CREATE POLICY "Only owner and admin can view locked prompt text directly"
    ON public.prompt_contents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_contents.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Owners and admins can insert prompt contents"
    ON public.prompt_contents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_contents.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Owners and admins can update prompt contents"
    ON public.prompt_contents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_contents.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 5. PROMPT_VERSIONS & PROMPT_MEDIA
CREATE POLICY "Owners and admins can view version history"
    ON public.prompt_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Prompt media viewable according to prompt visibility"
    ON public.prompt_media FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_media.prompt_id
            AND (
                (prompts.status = 'published' AND prompts.visibility IN ('public', 'unlisted'))
                OR prompts.user_id = auth.uid()
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Owners manage prompt media"
    ON public.prompt_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_media.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 6. TAGS & PROMPT_TAGS
CREATE POLICY "Tags are viewable by all" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Prompt tags viewable by all" ON public.prompt_tags FOR SELECT USING (true);
CREATE POLICY "Owners can link prompt tags" ON public.prompt_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_tags.prompt_id
            AND (prompts.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 7. COLLECTIONS & COLLECTION_ITEMS
CREATE POLICY "Collections viewable by owner or if public"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id OR is_public = true OR public.is_admin());

CREATE POLICY "Users manage their own collections"
    ON public.collections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collection items viewable if collection viewable"
    ON public.collection_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_items.collection_id
            AND (collections.user_id = auth.uid() OR collections.is_public = true OR public.is_admin())
        )
    );

CREATE POLICY "Users manage their collection items"
    ON public.collection_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- 8. FAVORITES
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. COUPONS (Active coupons readable by authenticated users during checkout)
CREATE POLICY "Users can query active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- 10. ORDERS & ORDER_ITEMS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Order items viewable by order owner or admin"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 11. PURCHASES (ENTITLEMENTS)
CREATE POLICY "Users view own entitlements" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 12. REVIEWS
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Verified buyers can create review"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (
                SELECT 1 FROM public.purchases
                WHERE purchases.user_id = auth.uid()
                AND purchases.prompt_id = reviews.prompt_id
            )
            OR public.is_admin()
        )
    );

CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users and admins can delete reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 13. BUNDLES & BUNDLE_ITEMS
CREATE POLICY "Active bundles viewable by all" ON public.bundles FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL USING (public.is_admin());
CREATE POLICY "Bundle items viewable by all" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "Admins manage bundle items" ON public.bundle_items FOR ALL USING (public.is_admin());

-- 14. SELLER_PAYOUTS
CREATE POLICY "Sellers view own payouts" ON public.seller_payouts FOR SELECT USING (auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers can request payout" ON public.seller_payouts FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Admins manage payouts" ON public.seller_payouts FOR ALL USING (public.is_admin());

-- 15. ANALYTICS_EVENTS
CREATE POLICY "Anyone can log analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view analytics" ON public.analytics_events FOR SELECT USING (public.is_admin());

-- 16. SITE_SETTINGS
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());
