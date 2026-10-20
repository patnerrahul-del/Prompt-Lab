-- ==============================================================================
-- AURUM PROMPTS — Curated Luxury Seed Data
-- 12 Master Prompts (6 Image, 6 Video), Categories, Models, Bundles, & Coupons
-- ==============================================================================

-- 1. SITE SETTINGS
INSERT INTO public.site_settings (key, value, description) VALUES
('commission_rate', '{"percentage": 15.0}', 'Platform commission percentage retained on marketplace sales'),
('ENABLE_MULTI_SELLER', '{"enabled": true}', 'Feature flag controlling community seller onboarding and dashboard access'),
('maintenance_mode', '{"enabled": false}', 'Global maintenance mode banner and checkout freeze'),
('announcement', '{"text": "Welcome to the Aurum Vault: Curated high-fidelity prompts for discerning creators.", "active": true}', 'Top announcement bar');

-- 2. CATEGORIES
-- Image Categories
INSERT INTO public.categories (id, name, slug, type, description, icon, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Cinematic Portraiture', 'cinematic-portraiture', 'IMAGE', 'High-fashion, editorial studio portraits with nuanced natural rim lighting and Leica bokeh.', 'Camera', 1),
('c0000000-0000-0000-0000-000000000002', 'Luxury Product & Horology', 'luxury-product-horology', 'IMAGE', 'Macro studio photography for fine timepieces, fragrances, jewelry, and automotive craft.', 'Watch', 2),
('c0000000-0000-0000-0000-000000000003', 'Architectural Modernism', 'architectural-modernism', 'IMAGE', 'Brutalist concrete villas, Japanese ryokans, and Nordic minimalist interiors.', 'Building2', 3),
('c0000000-0000-0000-0000-000000000004', 'Neo-Noir & Cyberpunk', 'neo-noir-cyberpunk', 'IMAGE', 'Atmospheric rain-slicked metropolis scenes with anamorphic lens flares and volumetric fog.', 'Sparkles', 4),
('c0000000-0000-0000-0000-000000000005', 'High Anime & Conceptual Art', 'high-anime-conceptual', 'IMAGE', 'Makoto Shinkai aesthetic lighting, watercolor textures, and Studio Ghibli-grade compositions.', 'Palette', 5),
('c0000000-0000-0000-0000-000000000006', 'Minimalist Haute Logos', 'minimalist-haute-logos', 'IMAGE', 'Bespoke geometric monograms, embossed foil insignia, and timeless vector marks.', 'Feather', 6),

-- Video Categories
('c0000000-0000-0000-0000-000000000007', 'Commercial & Luxury Ads', 'commercial-luxury-ads', 'VIDEO', '60fps slow-motion product reveals, perfume mist diffusions, and luxury brand campaign reels.', 'Film', 7),
('c0000000-0000-0000-0000-000000000008', 'Cinematic Drone & Landscape', 'cinematic-drone-landscape', 'VIDEO', 'Sweeping FPV drone footage traversing Icelandic fjords, Swiss Alps, and volcanic coasts.', 'Compass', 8),
('c0000000-0000-0000-0000-000000000009', 'Fashion Editorial Reels', 'fashion-editorial-reels', 'VIDEO', '9:16 vertical motion portraits tailored for viral luxury Instagram Reels and TikTok campaigns.', 'Smartphone', 9),
('c0000000-0000-0000-0000-000000000010', 'Sci-Fi Worldbuilding', 'sci-fi-worldbuilding', 'VIDEO', 'Dune-scale planetary sandstorms, monolithic spaceships, and orbital habitat traversals.', 'Globe', 10),
('c0000000-0000-0000-0000-000000000011', 'Microscopic Fluid Simulation', 'microscopic-fluid-sim', 'VIDEO', 'Viscous gold flows, hyper-detailed ink in water, and macro crystallisation dynamics.', 'Droplets', 11),
('c0000000-0000-0000-0000-000000000012', 'Hyper-Realistic Narrative', 'hyper-realistic-narrative', 'VIDEO', 'Emotion-driven character close-ups with micro-expressions and authentic acoustic cadence.', 'Video', 12);

-- 3. AI MODELS
INSERT INTO public.ai_models (id, name, slug, category, copy_template, is_active, sort_order) VALUES
('m0000000-0000-0000-0000-000000000001', 'Midjourney v6.1', 'midjourney-v6-1', 'IMAGE', '{{prompt}} --ar {{aspect_ratio}} --style raw --v 6.1 --s 250', true, 1),
('m0000000-0000-0000-0000-000000000002', 'FLUX.1 Pro', 'flux-1-pro', 'IMAGE', '{{prompt}}', true, 2),
('m0000000-0000-0000-0000-000000000003', 'OpenAI Sora', 'openai-sora', 'VIDEO', 'Prompt: {{prompt}}\nDuration: {{duration}}s\nAspect Ratio: {{aspect_ratio}}', true, 3),
('m0000000-0000-0000-0000-000000000004', 'Google Veo', 'google-veo', 'VIDEO', '{{prompt}} [veo-cinematic-mode]', true, 4),
('m0000000-0000-0000-0000-000000000005', 'Runway Gen-3 Alpha', 'runway-gen-3', 'VIDEO', '{{prompt}} --motion {{motion_level}} --camera {{camera_motion}}', true, 5),
('m0000000-0000-0000-0000-000000000006', 'Kling AI 1.5', 'kling-ai', 'VIDEO', '{{prompt}}', true, 6),
('m0000000-0000-0000-0000-000000000007', 'Stable Diffusion XL', 'stable-diffusion-xl', 'IMAGE', 'Positive: {{prompt}}\nNegative: {{negative_prompt}}', true, 7),
('m0000000-0000-0000-0000-000000000008', 'DALL·E 3', 'dalle-3', 'IMAGE', '{{prompt}}', true, 8);

-- 4. TAGS
INSERT INTO public.tags (id, name, slug) VALUES
('t0000000-0000-0000-0000-000000000001', 'Editorial', 'editorial'),
('t0000000-0000-0000-0000-000000000002', '35mm Film', '35mm-film'),
('t0000000-0000-0000-0000-000000000003', 'Gold Foil', 'gold-foil'),
('t0000000-0000-0000-0000-000000000004', 'Slow Motion', 'slow-motion'),
('t0000000-0000-0000-0000-000000000005', 'Anamorphic', 'anamorphic'),
('t0000000-0000-0000-0000-000000000006', 'Macro', 'macro'),
('t0000000-0000-0000-0000-000000000007', 'Minimalist', 'minimalist'),
('t0000000-0000-0000-0000-000000000008', 'Drone 4K', 'drone-4k');

-- 5. COUPONS
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_value_inr, max_uses, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'AURUMVIP', 'percentage', 25.00, 500.00, 500, true),
('d0000000-0000-0000-0000-000000000002', 'GOLDEN100', 'flat', 100.00, 399.00, 1000, true);

-- Note: 12 Demo prompts with realistic placeholders are seeded below.
-- (When users sign up, prompts link to owner; demo prompts link to the initial creator UUID)

-- DEMO OWNER PROFILE (Seed profile)
DO $$
DECLARE
    v_demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, seller_balance_inr, commission_rate, bio)
    VALUES (
        v_demo_user_id,
        'concierge@aurumprompts.com',
        'Aurum Atelier',
        'admin',
        54200.00,
        15.00,
        'Master prompt engineers curating ultra-high fidelity generative compositions.'
    ) ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- 6 IMAGE PROMPTS
    -- =========================================================================

    -- Image 1: Horology Watch
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, negative_prompt, settings, variables, difficulty, license_type, price_inr, compare_at_price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000001',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000002',
        'm0000000-0000-0000-0000-000000000001',
        'Royal Tourbillon: Haute Horlogerie Noir',
        'royal-tourbillon-haute-horlogerie-noir',
        'Precision macro watch photography on obsidian black reflective stone with micro rose-gold gear detailing.',
        'Haute horlogerie luxury timepiece with exposed flying tourbillon movement, sapphire glass reflection...',
        'blurry, low resolution, cheap plastic, distorted dial, text watermark',
        '{"aspect_ratio": "4:5", "resolution": "4K", "lighting": "chiaroscuro rim light", "lens": "100mm macro"}',
        '[{"name": "metal_finish", "label": "Metal Finish", "default_value": "brushed rose gold"}, {"name": "dial_accent", "label": "Dial Accent", "default_value": "midnight lapis lazuli"}]',
        'advanced',
        'commercial',
        799.00,
        1499.00,
        'published',
        'public',
        true,
        4.95,
        14
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text, system_instructions, notes)
    VALUES (
        'p0000000-0000-0000-0000-000000000001',
        'Extreme macro photography of an ultra-luxury mechanical wrist watch crafted from {{metal_finish}}, skeletonized dial revealing a complex rotating flying tourbillon escapement, {{dial_accent}} hour indices, anti-reflective domed sapphire crystal with subtle violet glare, resting on wet black obsidian basalt stone with water bead micro-reflections, Hasselblad H6D-100c, 120mm macro lens, studio rim lighting, 8k resolution, cinematic atmosphere.',
        'Use style raw with Midjourney v6.1 for best metallic reflection fidelity.',
        'Works exceptionally well with both rose gold and platinum finishes.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000001',
        'IMAGE',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70',
        1200,
        1500,
        true
    );

    -- Image 2: Architectural Brutalism
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, negative_prompt, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000002',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000002',
        'Villa Solitude: Monolithic Cliffside Sanctuary',
        'villa-solitude-monolithic-cliffside-sanctuary',
        'Modernist raw concrete cliffside villa overlooking stormy Atlantic waters at twilight.',
        'Architectural digest editorial of a cantilevering monolithic raw concrete pavilion nestled on craggy rocks...',
        'oversaturated, artificial looking, CGI render, cartoon, plastic',
        '{"aspect_ratio": "16:9", "time_of_day": "blue hour dusk", "focal_length": "24mm architectural tilt-shift"}',
        '[{"name": "biome", "label": "Landscape Biome", "default_value": "Nordic basalt sea cliff"}, {"name": "interior_glow", "label": "Interior Lighting", "default_value": "warm amber candlelight"}]',
        'master',
        'commercial',
        599.00,
        'published',
        'public',
        true,
        4.90,
        8
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text, system_instructions, notes)
    VALUES (
        'p0000000-0000-0000-0000-000000000002',
        'Architectural Digest featured photograph of a minimalist cantilevering residence built from board-formed dark poured concrete on a {{biome}}, floor-to-ceiling frameless glass curtains displaying a tempestuous ocean at dusk, interior illuminated by {{interior_glow}}, infinity lap pool mirroring misty gray skies, photographed by Iwan Baan, 24mm tilt-shift perspective, hyper-detailed material textures.',
        'Flux.1 Pro prompt. No post-processing parameters required.',
        'Clean geometry ensures straight vertical architectural lines.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000002',
        'IMAGE',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70',
        1200,
        675,
        true
    );

    -- Image 3: Editorial Portrait
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000003',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000001',
        'm0000000-0000-0000-0000-000000000001',
        'Vogue Atelier: Golden Hour Haute Couture',
        'vogue-atelier-golden-hour-haute-couture',
        'High-fashion Vogue cover photograph featuring gold leaf embellished makeup and silk taffeta gown.',
        'Editorial fashion photography of a regal muse wearing an architectural pleated metallic gown...',
        '{"aspect_ratio": "3:4", "film_stock": "Kodak Portra 400", "camera": "Leica SL2"}',
        '[{"name": "garment_color", "label": "Garment Color", "default_value": "liquid champagne gold"}, {"name": "model_expression", "label": "Expression", "default_value": "serene ethereal gazes"}]',
        'intermediate',
        'commercial',
        499.00,
        'published',
        'public',
        true,
        4.88,
        22
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text, system_instructions, notes)
    VALUES (
        'p0000000-0000-0000-0000-000000000003',
        'Vogue Italia front cover portrait, elegant statuesque model adorned in an avant-garde {{garment_color}} sculptural gown, face accented with delicate 24k gold leaf foil along cheekbones, {{model_expression}}, natural golden hour window sidelight through Venetian blinds creating soft shadow stripes, 85mm f/1.4 lens, shallow depth of field, authentic film grain texture.',
        'Include --ar 3:4 and --v 6.1.',
        'Skin tone textures are preserved with micro-pores.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000003',
        'IMAGE',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=70',
        1200,
        1600,
        true
    );

    -- Image 4: Minimalist Haute Logo
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000004',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000006',
        'm0000000-0000-0000-0000-000000000008',
        'Embossed Sovereign Crest: Luxury Emblem',
        'embossed-sovereign-crest-luxury-emblem',
        'Minimalist bespoke luxury monogram emblem debossed in antique gold foil on handmade cotton paper.',
        'Haute luxury brand emblem, minimalist geometric interlocking cipher embossed into textured heavy matte paper...',
        '{"aspect_ratio": "1:1", "style": "vector emblem / stationery mockup"}',
        '[{"name": "initials", "label": "Monogram Initials", "default_value": "AP"}, {"name": "motif", "label": "Central Heraldic Motif", "default_value": "stylized solar falcon"}]',
        'beginner',
        'exclusive',
        399.00,
        'published',
        'public',
        false,
        4.75,
        5
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000004',
        'Luxury heritage brand mark, minimalist interlocking monogram {{initials}} crowned with a refined {{motif}}, deep blind deboss and hot-stamped matte satin gold foil on rich cream cotton paper stock, macro tactile paper grain, high-end branding showcase, clean graphic vector silhouette, centered composition.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000004',
        'IMAGE',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
        1200,
        1200,
        true
    );

    -- Image 5: Neo-Noir Cyberpunk
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000005',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000004',
        'm0000000-0000-0000-0000-000000000001',
        'Obsidian Rain: Anamorphic Neo-Tokyo',
        'obsidian-rain-anamorphic-neo-tokyo',
        'Blade Runner 2049 aesthetic wet asphalt street reflection with amber and indigo neon lighting.',
        'Cinematic anamorphic still of a mysterious figure holding a clear umbrella on a rain-slicked boulevard...',
        '{"aspect_ratio": "21:9", "color_palette": "amber, obsidian, teal"}',
        '[{"name": "city_setting", "label": "District", "default_value": "Ginza cybernetic alley"}, {"name": "vehicle", "label": "Background Vehicle", "default_value": "sleek electric hovercraft"}]',
        'intermediate',
        'commercial',
        0.00, -- Free showcase prompt!
        'published',
        'public',
        true,
        5.00,
        41
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000005',
        'Cinematic wide film still, 65mm Panavision anamorphic lens, solitary trenchcoat figure crossing a rain-drenched {{city_setting}} at midnight, mirror puddles reflecting towering golden holographic billboards, a parked {{vehicle}} emitting subtle turquoise underglow, atmospheric mist, chromatic aberration, Roger Deakins lighting style.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000005',
        'IMAGE',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
        1200,
        514,
        true
    );

    -- Image 6: Anime Haute Concept
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000006',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000005',
        'm0000000-0000-0000-0000-000000000001',
        'Celeste: Shinkai Cloud Sea Observatory',
        'celeste-shinkai-cloud-sea-observatory',
        'Luminous cumulus cloudscapes towering over an ancient brass astronomical telescope terrace.',
        'Artistic anime environment concept art, sprawling sea of golden clouds at sunset viewed from high altitude...',
        '{"aspect_ratio": "16:9", "art_style": "high aesthetic anime key art"}',
        '[{"name": "celestial_event", "label": "Sky Event", "default_value": "twin comets passing through violet aurora"}, {"name": "terrace_relic", "label": "Observatory Relic", "default_value": "antique brass astrolabe"}]',
        'intermediate',
        'commercial',
        299.00,
        'published',
        'public',
        false,
        4.80,
        7
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000006',
        'Masterpiece anime landscape painting by Makoto Shinkai and Kazuo Oga, overlooking an infinite ocean of golden cumulus clouds during sunset, sky illuminated by {{celestial_event}}, a solitary scholar standing on a cliffside stone terrace beside a giant {{terrace_relic}}, wind rustling loose manuscripts, god rays piercing atmosphere, crystalline color depth, 8k wallpaper.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, width, height, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000006',
        'IMAGE',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
        1200,
        675,
        true
    );

    -- =========================================================================
    -- 6 VIDEO PROMPTS
    -- =========================================================================

    -- Video 1: Commercial Luxury Perfume Ad
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, compare_at_price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000007',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000007',
        'm0000000-0000-0000-0000-000000000003',
        'Aura Nectar: 4K Slow-Motion Perfume Commercial',
        'aura-nectar-4k-slow-motion-perfume-commercial',
        'High-end perfume commercial opening with viscous golden mist exploding from crystal bottle in 1000fps slow-motion.',
        'Commercial cinematography: An emerald crystal flacon descends into black rippling water, gold droplets disperse...',
        '{"aspect_ratio": "16:9", "duration": "5s", "fps": 60, "camera_motion": "slow orbital dolly zoom"}',
        '[{"name": "bottle_color", "label": "Bottle Crystal", "default_value": "smoked quartz crystal"}, {"name": "liquid_essence", "label": "Liquid Color", "default_value": "effervescent golden champagne"}]',
        'master',
        'commercial',
        999.00,
        1899.00,
        'published',
        'public',
        true,
        4.98,
        31
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000007',
        'Cinematic commercial campaign for luxury fragrance. A heavy octagonal {{bottle_color}} flacon with carved gold cap floats in zero gravity amidst dark velvet darkness. The atomizer depresses in extreme slow motion (1000 fps), releasing a hyper-detailed cloud of {{liquid_essence}} mist that catches rim spotlighting, shimmering like floating diamond dust. Camera executes a silky smooth 360-degree rotation, studio lighting, photorealistic physics, 4k ultra-definition.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000007',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
        1920,
        1080,
        5.0,
        true
    );

    -- Video 2: FPV Drone Icelandic Volcanic Coast
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000008',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000008',
        'm0000000-0000-0000-0000-000000000004',
        'Ragnarok Coast: High-Speed FPV Drone Sweep',
        'ragnarok-coast-high-speed-fpv-drone-sweep',
        'Ultra-fast cinematic FPV drone sweeping over Icelandic black sand beaches through sea arches at sunrise.',
        'FPV drone trajectory starting inches above foaming ocean surge, accelerating through narrow sea arch...',
        '{"aspect_ratio": "16:9", "duration": "8s", "resolution": "4K", "camera_style": "FPV acrobatic dive"}',
        '[{"name": "coastal_feature", "label": "Geological Formation", "default_value": "black basalt sea stack arches"}, {"name": "atmospheric_condition", "label": "Atmosphere", "default_value": "dense morning sea fog and golden dawn rays"}]',
        'intermediate',
        'commercial',
        699.00,
        'published',
        'public',
        true,
        4.92,
        16
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000008',
        'First-person view (FPV) high-speed drone footage tracing the volcanic black sands of Vik, Iceland. Drone executes a breathtaking banking turn centimeters over crashing turquoise waves, threading between jagged {{coastal_feature}}, before climbing vertically into {{atmospheric_condition}}, revealing endless black coastline at sunrise. Fluid cinematic motion blur, natural camera shake, IMAX scale.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000008',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        1920,
        1080,
        8.0,
        true
    );

    -- Video 3: Vertical Fashion Reel
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000009',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000009',
        'm0000000-0000-0000-0000-000000000005',
        'Milano Runway: 9:16 Silk Flow Portrait',
        'milano-runway-9-16-silk-flow-portrait',
        'Vertical 9:16 high-impact reel for Instagram & TikTok featuring fluid motion of metallic silk fabric.',
        'Vertical mobile video: Muse gliding down mirrored Paris runway, undulating pleated fabric billowing in wind machine...',
        '{"aspect_ratio": "9:16", "duration": "6s", "platform": "Instagram Reels / TikTok"}',
        '[{"name": "fabric_type", "label": "Textile Material", "default_value": "liquid mercury metallic organza"}, {"name": "set_design", "label": "Catwalk Environment", "default_value": "black glass reflection pool with minimal warm spotlighting"}]',
        'beginner',
        'commercial',
        499.00,
        'published',
        'public',
        true,
        4.84,
        19
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000009',
        'Vertical 9:16 video of high fashion model walking with supreme poise on a {{set_design}}. The dress is made from {{fabric_type}} that ripples and flows with hypnotic fluid dynamics in response to subtle slow-motion wind. Tracking camera tracks backwards at eye level, shallow depth of field with creamy bokeh, warm luxury lighting palette, 60fps buttery smooth playback.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000009',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
        1080,
        1920,
        6.0,
        true
    );

    -- Video 4: Sci-Fi Orbital Horizon
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000010',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000010',
        'm0000000-0000-0000-0000-000000000003',
        'Interstellar Gate: Ring Megastructure Transit',
        'interstellar-gate-ring-megastructure-transit',
        'Epic scale space transit through massive rotating ring station overlooking atmospheric eclipse.',
        'Spacecraft perspective gliding across the interior circumference of an O''Neill cylinder space colony...',
        '{"aspect_ratio": "2.39:1", "duration": "10s", "vfx": "zero-g particle dust"}',
        '[{"name": "spacecraft_class", "label": "Vessel Class", "default_value": "sleek chrome diplomatic yacht"}, {"name": "planetary_backdrop", "label": "Background Planet", "default_value": "ringed gas giant eclipse with amber corona"}]',
        'master',
        'commercial',
        899.00,
        'published',
        'public',
        false,
        5.00,
        9
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000010',
        'Slow cinematic space traverse. A {{spacecraft_class}} coasts steadily toward an colossal rotating torus orbital habitat. In the far background, a {{planetary_backdrop}} casts intense golden rim light against the hull. Heat radiators glow soft orange. Subpixel micrometeorite dust sparkles in the sunbeams. Denis Villeneuve cinematography, photorealistic realism, 4k.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000010',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85',
        1920,
        800,
        10.0,
        true
    );

    -- Video 5: Microscopic Molten Gold
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000011',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000011',
        'm0000000-0000-0000-0000-000000000006',
        'Kintsugi In Motion: Viscous Gold Macro Dynamics',
        'kintsugi-in-motion-viscous-gold-macro-dynamics',
        'Microscopic fluid dynamics of 24k liquid gold sealing fractures in a black porcelain vase.',
        'Macro lens capturing molten liquid gold creeping through porcelain fissures, glowing with interior heat...',
        '{"aspect_ratio": "16:9", "duration": "5s", "macro_magnification": "5x"}',
        '[{"name": "ceramic_texture", "label": "Ceramic Style", "default_value": "matte black textured stoneware"}, {"name": "flow_speed", "label": "Flow Rate", "default_value": "hypnotic slow capillary creep"}]',
        'intermediate',
        'commercial',
        0.00, -- Free Video Prompt!
        'published',
        'public',
        true,
        4.94,
        28
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000011',
        'Extreme macro video of molten 24-karat gold flowing into fine hairline fractures across a {{ceramic_texture}}. The liquid gold exhibits {{flow_speed}}, cooling at the edges into shimmering micro-crystals with intense specularity. Studio macro lighting, depth of field measuring less than a millimeter, 4k ultra-high definition.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000011',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
        1920,
        1080,
        5.0,
        true
    );

    -- Video 6: Hyper-Realistic Narrative Micro-Expression
    INSERT INTO public.prompts (id, user_id, category_id, model_id, title, slug, short_description, teaser, settings, variables, difficulty, license_type, price_inr, status, visibility, is_featured, average_rating, reviews_count)
    VALUES (
        'p0000000-0000-0000-0000-000000000012',
        v_demo_user_id,
        'c0000000-0000-0000-0000-000000000012',
        'm0000000-0000-0000-0000-000000000003',
        'The Maestro: Close-Up Emotion Cadence',
        'the-maestro-close-up-emotion-cadence',
        'Actor close-up studying orchestral score with subtle eyebrow twitch, pupil dilation and breath condensation.',
        'Cinematic close-up of a distinguished conductor, eyes scanning music manuscript in candlelit study...',
        '{"aspect_ratio": "16:9", "duration": "6s", "framerate": 24}',
        '[{"name": "mood", "label": "Dramatic Tension", "default_value": "intense realization and profound wonder"}, {"name": "ambient_soundtrack", "label": "Audio Profile", "default_value": "audible breath and faint distant cellos"}]',
        'master',
        'commercial',
        599.00,
        'published',
        'public',
        false,
        4.88,
        11
    );

    INSERT INTO public.prompt_contents (prompt_id, full_prompt_text)
    VALUES (
        'p0000000-0000-0000-0000-000000000012',
        'Intimate 35mm film portrait of an older artisan composer sitting before an antique walnut desk. Camera captures micro-expressions transitioning from contemplation to {{mood}}, subtle eye moisture catching soft desk lamp amber light, realistic skin pores, slight chest rise and fall, film grain, muted palette with gold highlights.'
    );

    INSERT INTO public.prompt_media (prompt_id, media_type, url, thumbnail_url, width, height, duration_seconds, is_cover)
    VALUES (
        'p0000000-0000-0000-0000-000000000012',
        'VIDEO',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85',
        1920,
        1080,
        6.0,
        true
    );

    -- 6. SAMPLE BUNDLE (Haute Horlogerie & Luxury Ads Bundle)
    INSERT INTO public.bundles (id, title, slug, description, cover_image, price_inr, compare_at_price_inr, is_active)
    VALUES (
        'b0000000-0000-0000-0000-000000000001',
        'The Sovereign Suite: Luxury Commercial & Product Duo',
        'sovereign-suite-luxury-commercial-product-duo',
        'Combines the Royal Tourbillon image master prompt with the 4K Aura Nectar commercial video prompt at an exclusive 35% discount.',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
        1199.00,
        1798.00,
        true
    );

    INSERT INTO public.bundle_items (bundle_id, prompt_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007');

END $$;
