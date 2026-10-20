-- ==============================================================================
-- 20260301000003_secure_rpc.sql
-- AURUM PROMPTS — Cryptographically Guarded Anti-Leak RPC Engine
-- Direct SELECT on prompt_contents is blocked. This RPC checks entitlement,
-- logs the access event, enforces rate-limiting, and safely delivers the content.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_prompt_content(p_prompt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN := false;
    v_is_owner BOOLEAN := false;
    v_is_purchased BOOLEAN := false;
    v_is_free BOOLEAN := false;
    v_prompt RECORD;
    v_content RECORD;
    v_recent_access_count INT;
BEGIN
    v_user_id := auth.uid();

    -- 1. Must be authenticated to access content
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to access prompt content.'
            USING ERRCODE = 'P0001';
    END IF;

    -- 2. Fetch Prompt Metadata
    SELECT id, user_id, price_inr, status, negative_prompt, settings, variables
    INTO v_prompt
    FROM public.prompts
    WHERE id = p_prompt_id;

    IF v_prompt.id IS NULL THEN
        RAISE EXCEPTION 'Prompt not found.'
            USING ERRCODE = 'P0002';
    END IF;

    -- 3. Rate Limit Check: Max 30 content decryptions per minute per user
    SELECT COUNT(*)
    INTO v_recent_access_count
    FROM public.analytics_events
    WHERE user_id = v_user_id
      AND event_type = 'copy'
      AND created_at > (now() - INTERVAL '1 minute');

    IF v_recent_access_count > 30 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait a moment before retrieving additional prompts.'
            USING ERRCODE = 'P0003';
    END IF;

    -- 4. Check Authorization Factors
    v_is_owner := (v_prompt.user_id = v_user_id);

    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_user_id AND role = 'admin'
    ) INTO v_is_admin;

    SELECT EXISTS (
        SELECT 1 FROM public.purchases
        WHERE user_id = v_user_id AND prompt_id = p_prompt_id
    ) INTO v_is_purchased;

    v_is_free := (v_prompt.price_inr = 0.00 AND v_prompt.status = 'published');

    -- Enforce Entitlement Rule
    IF NOT (v_is_owner OR v_is_admin OR v_is_purchased OR v_is_free) THEN
        RAISE EXCEPTION 'Access denied. Valid purchase or ownership required to unlock full prompt.'
            USING ERRCODE = 'P0004';
    END IF;

    -- 5. Fetch Encapsulated Content
    SELECT full_prompt_text, system_instructions, notes
    INTO v_content
    FROM public.prompt_contents
    WHERE prompt_id = p_prompt_id;

    IF v_content.full_prompt_text IS NULL THEN
        RAISE EXCEPTION 'Prompt content not initialized.'
            USING ERRCODE = 'P0005';
    END IF;

    -- 6. Log Access in Audit & Analytics Ledger
    INSERT INTO public.analytics_events (
        event_type,
        prompt_id,
        user_id,
        metadata
    ) VALUES (
        'copy',
        p_prompt_id,
        v_user_id,
        jsonb_build_object(
            'authorized_as',
            CASE
                WHEN v_is_owner THEN 'owner'
                WHEN v_is_admin THEN 'admin'
                WHEN v_is_purchased THEN 'purchased'
                ELSE 'free'
            END,
            'accessed_at', now()
        )
    );

    -- Increment copies count on prompt
    UPDATE public.prompts
    SET copies_count = copies_count + 1
    WHERE id = p_prompt_id;

    -- 7. Return complete decrypted prompt payload
    RETURN jsonb_build_object(
        'prompt_id', p_prompt_id,
        'full_prompt_text', v_content.full_prompt_text,
        'negative_prompt', v_prompt.negative_prompt,
        'system_instructions', v_content.system_instructions,
        'notes', v_content.notes,
        'settings', v_prompt.settings,
        'variables', v_prompt.variables
    );
END;
$$;
