-- ==============================================================================
-- 20260301000002_functions_triggers.sql
-- AURUM PROMPTS — Database Triggers & Automated Business Logic
-- 1. Profile auto-provisioning on auth signup
-- 2. updated_at timestamp auto-update
-- 3. Review aggregates (average_rating, reviews_count)
-- 4. Version history auto-snapshotting
-- 5. SEO Slug generator
-- ==============================================================================

-- 1. HANDLE NEW USER SIGNUP (Auto create public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    -- Check if this is the first user in the system; if so, promote to admin
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        CASE WHEN is_first_user THEN 'admin' ELSE 'user' END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prompts_updated_at BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prompt_contents_updated_at BEFORE UPDATE ON public.prompt_contents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. REVIEWS AGGREGATE TRIGGER
CREATE OR REPLACE FUNCTION public.update_prompt_review_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_prompt_id UUID;
    avg_score NUMERIC(3, 2);
    total_revs INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_prompt_id := OLD.prompt_id;
    ELSE
        target_prompt_id := NEW.prompt_id;
    END IF;

    SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
        COUNT(*)
    INTO avg_score, total_revs
    FROM public.reviews
    WHERE prompt_id = target_prompt_id;

    UPDATE public.prompts
    SET
        average_rating = avg_score,
        reviews_count = total_revs
    WHERE id = target_prompt_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_reviews_aggregate
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_prompt_review_stats();

-- 4. PROMPT SLUG GENERATOR
CREATE OR REPLACE FUNCTION public.generate_prompt_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 1;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        base_slug := trim(both '-' from base_slug);
        IF base_slug = '' THEN
            base_slug := 'prompt';
        END IF;

        final_slug := base_slug;
        WHILE EXISTS (SELECT 1 FROM public.prompts WHERE slug = final_slug AND id <> NEW.id) LOOP
            final_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prompts_slug
    BEFORE INSERT OR UPDATE OF title ON public.prompts
    FOR EACH ROW EXECUTE FUNCTION public.generate_prompt_slug();
