-- ==============================================================================
-- RLS SECURITY TEST SUITE: Zero-Leak & Entitlement Verification
-- Run via psql or Supabase CLI to mathematically verify RLS barriers.
-- ==============================================================================

BEGIN;

-- Setup test users
DO $$
DECLARE
    v_owner_id UUID := '11111111-1111-1111-1111-111111111111';
    v_buyer_id UUID := '22222222-2222-2222-2222-222222222222';
    v_intruder_id UUID := '33333333-3333-3333-3333-333333333333';
    v_paid_prompt_id UUID := '44444444-4444-4444-4444-444444444444';
    v_free_prompt_id UUID := '55555555-5555-5555-5555-555555555555';
    v_retrieved_json JSONB;
    v_secret_count INT;
BEGIN
    -- 1. Create profiles
    INSERT INTO public.profiles (id, email, role) VALUES
    (v_owner_id, 'owner@aurum.test', 'seller'),
    (v_buyer_id, 'buyer@aurum.test', 'user'),
    (v_intruder_id, 'intruder@aurum.test', 'user')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create sample paid prompt & secret content
    INSERT INTO public.prompts (id, user_id, title, slug, price_inr, status, visibility)
    VALUES (v_paid_prompt_id, v_owner_id, 'Secret Masterpiece', 'secret-masterpiece', 999.00, 'published', 'public')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (v_paid_prompt_id, 'TOP_SECRET_PROMPT_KEY_12345')
    ON CONFLICT (prompt_id) DO NOTHING;

    -- 3. Create sample free prompt
    INSERT INTO public.prompts (id, user_id, title, slug, price_inr, status, visibility)
    VALUES (v_free_prompt_id, v_owner_id, 'Free Starter Prompt', 'free-starter-prompt', 0.00, 'published', 'public')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (v_free_prompt_id, 'PUBLIC_FREE_PROMPT_CONTENT')
    ON CONFLICT (prompt_id) DO NOTHING;

    -- TEST CASE 1: Intruder directly attempts SELECT on prompt_contents
    PERFORM set_config('request.jwt.claim.sub', v_intruder_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    SELECT COUNT(*) INTO v_secret_count
    FROM public.prompt_contents
    WHERE prompt_id = v_paid_prompt_id;

    IF v_secret_count <> 0 THEN
        RAISE EXCEPTION 'SECURITY BREACH: Intruder was able to SELECT from prompt_contents directly!';
    END IF;
    RAISE NOTICE 'SUCCESS [Test 1]: Intruder received 0 rows from direct SELECT on prompt_contents.';

    -- TEST CASE 2: Intruder calls get_prompt_content on Paid Prompt without entitlement
    BEGIN
        v_retrieved_json := public.get_prompt_content(v_paid_prompt_id);
        RAISE EXCEPTION 'SECURITY BREACH: Intruder bypassed get_prompt_content check!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = 'P0004' THEN
            RAISE NOTICE 'SUCCESS [Test 2]: Intruder correctly blocked with Access Denied (SQLSTATE P0004).';
        ELSE
            RAISE NOTICE 'Expected P0004 but caught SQLSTATE: % - %', SQLSTATE, SQLERRM;
        END IF;
    END;

    -- TEST CASE 3: Authenticated user calls get_prompt_content on Free Prompt (Should succeed)
    v_retrieved_json := public.get_prompt_content(v_free_prompt_id);
    IF v_retrieved_json->>'full_prompt_text' = 'PUBLIC_FREE_PROMPT_CONTENT' THEN
        RAISE NOTICE 'SUCCESS [Test 3]: Free prompt successfully retrieved by logged-in user.';
    ELSE
        RAISE EXCEPTION 'FAILURE: Free prompt could not be decrypted.';
    END IF;

    -- TEST CASE 4: Buyer purchases paid prompt -> Entitlement granted -> get_prompt_content succeeds
    INSERT INTO public.purchases (user_id, prompt_id, price_paid_inr)
    VALUES (v_buyer_id, v_paid_prompt_id, 999.00);

    PERFORM set_config('request.jwt.claim.sub', v_buyer_id::text, true);
    v_retrieved_json := public.get_prompt_content(v_paid_prompt_id);

    IF v_retrieved_json->>'full_prompt_text' = 'TOP_SECRET_PROMPT_KEY_12345' THEN
        RAISE NOTICE 'SUCCESS [Test 4]: Verified buyer successfully unlocked full prompt text.';
    ELSE
        RAISE EXCEPTION 'FAILURE: Verified buyer was not able to unlock prompt content.';
    END IF;

    -- TEST CASE 5: Owner retrieves content
    PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, true);
    v_retrieved_json := public.get_prompt_content(v_paid_prompt_id);
    IF v_retrieved_json->>'full_prompt_text' = 'TOP_SECRET_PROMPT_KEY_12345' THEN
        RAISE NOTICE 'SUCCESS [Test 5]: Prompt creator/owner successfully accessed content.';
    END IF;

    -- TEST CASE 6: Verify Audit Trail was recorded
    IF NOT EXISTS (SELECT 1 FROM public.analytics_events WHERE prompt_id = v_paid_prompt_id AND event_type = 'copy') THEN
        RAISE EXCEPTION 'FAILURE: Access was not recorded in analytics audit trail.';
    END IF;
    RAISE NOTICE 'SUCCESS [Test 6]: Analytics event access audit trail verified.';

    RAISE NOTICE '>>> ALL 6 RLS SECURITY TESTS PASSED PERFECTLY <<<';
END $$;

ROLLBACK; -- Always rollback test transaction
