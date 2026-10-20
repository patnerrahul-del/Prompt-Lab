import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Prompt, Bundle, Category, AIModel, PromptCategoryType } from '@/types/database.types';

// Luxury sample fallback dataset for instant zero-latency loading and offline resilience
const DEMO_PROMPTS: Prompt[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    model_id: 'm0000000-0000-0000-0000-000000000001',
    title: 'Royal Tourbillon: Haute Horlogerie Noir',
    slug: 'royal-tourbillon-haute-horlogerie-noir',
    short_description: 'Precision macro watch photography on obsidian black reflective stone with micro rose-gold gear detailing.',
    teaser: 'Haute horlogerie luxury timepiece with exposed flying tourbillon movement, sapphire glass reflection...',
    negative_prompt: 'blurry, low resolution, cheap plastic, distorted dial, text watermark',
    settings: { aspect_ratio: '4:5', resolution: '4K', lighting: 'chiaroscuro rim light' },
    variables: [
      { name: 'metal_finish', label: 'Metal Finish', default_value: 'brushed rose gold' },
      { name: 'dial_accent', label: 'Dial Accent', default_value: 'midnight lapis lazuli' },
    ],
    difficulty: 'advanced',
    license_type: 'commercial',
    price_inr: 799,
    compare_at_price_inr: 1499,
    status: 'published',
    visibility: 'public',
    is_featured: true,
    average_rating: 4.95,
    reviews_count: 14,
    copies_count: 124,
    sales_count: 42,
    views_count: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Luxury Product & Horology',
      slug: 'luxury-product-horology',
      type: 'IMAGE',
      description: null,
      icon: 'Watch',
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    model: {
      id: 'm0000000-0000-0000-0000-000000000001',
      name: 'Midjourney v6.1',
      slug: 'midjourney-v6-1',
      category: 'IMAGE',
      copy_template: null,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    media: [
      {
        id: 'm1',
        prompt_id: 'p0000000-0000-0000-0000-000000000001',
        media_type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
        thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70',
        display_order: 0,
        is_cover: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000007',
    user_id: '00000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000007',
    model_id: 'm0000000-0000-0000-0000-000000000003',
    title: 'Aura Nectar: 4K Slow-Motion Perfume Commercial',
    slug: 'aura-nectar-4k-slow-motion-perfume-commercial',
    short_description: 'High-end perfume commercial opening with viscous golden mist exploding from crystal bottle in 1000fps slow-motion.',
    teaser: 'Commercial cinematography: An emerald crystal flacon descends into black rippling water, gold droplets disperse...',
    negative_prompt: 'jitter, stutter, low resolution, plastic',
    settings: { aspect_ratio: '16:9', duration: '5s', fps: 60 },
    variables: [
      { name: 'bottle_color', label: 'Bottle Crystal', default_value: 'smoked quartz crystal' },
      { name: 'liquid_essence', label: 'Liquid Color', default_value: 'effervescent golden champagne' },
    ],
    difficulty: 'master',
    license_type: 'commercial',
    price_inr: 999,
    compare_at_price_inr: 1899,
    status: 'published',
    visibility: 'public',
    is_featured: true,
    average_rating: 4.98,
    reviews_count: 31,
    copies_count: 210,
    sales_count: 78,
    views_count: 1420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c0000000-0000-0000-0000-000000000007',
      name: 'Commercial & Luxury Ads',
      slug: 'commercial-luxury-ads',
      type: 'VIDEO',
      description: null,
      icon: 'Film',
      sort_order: 7,
      created_at: new Date().toISOString(),
    },
    model: {
      id: 'm0000000-0000-0000-0000-000000000003',
      name: 'OpenAI Sora',
      slug: 'openai-sora',
      category: 'VIDEO',
      copy_template: null,
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    media: [
      {
        id: 'm7',
        prompt_id: 'p0000000-0000-0000-0000-000000000007',
        media_type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
        display_order: 0,
        is_cover: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    model_id: 'm0000000-0000-0000-0000-000000000002',
    title: 'Villa Solitude: Monolithic Cliffside Sanctuary',
    slug: 'villa-solitude-monolithic-cliffside-sanctuary',
    short_description: 'Modernist raw concrete cliffside villa overlooking stormy Atlantic waters at twilight.',
    teaser: 'Architectural digest editorial of a cantilevering monolithic raw concrete pavilion nestled on craggy rocks...',
    negative_prompt: 'cartoon, oversaturated, artificial render',
    settings: { aspect_ratio: '16:9', time_of_day: 'blue hour dusk' },
    variables: [
      { name: 'biome', label: 'Landscape Biome', default_value: 'Nordic basalt sea cliff' },
    ],
    difficulty: 'master',
    license_type: 'commercial',
    price_inr: 599,
    compare_at_price_inr: null,
    status: 'published',
    visibility: 'public',
    is_featured: true,
    average_rating: 4.9,
    reviews_count: 8,
    copies_count: 90,
    sales_count: 26,
    views_count: 670,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c0000000-0000-0000-0000-000000000003',
      name: 'Architectural Modernism',
      slug: 'architectural-modernism',
      type: 'IMAGE',
      description: null,
      icon: 'Building2',
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    model: {
      id: 'm0000000-0000-0000-0000-000000000002',
      name: 'FLUX.1 Pro',
      slug: 'flux-1-pro',
      category: 'IMAGE',
      copy_template: null,
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    media: [
      {
        id: 'm2',
        prompt_id: 'p0000000-0000-0000-0000-000000000002',
        media_type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        thumbnail_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70',
        display_order: 0,
        is_cover: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000005',
    user_id: '00000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    model_id: 'm0000000-0000-0000-0000-000000000001',
    title: 'Obsidian Rain: Anamorphic Neo-Tokyo',
    slug: 'obsidian-rain-anamorphic-neo-tokyo',
    short_description: 'Blade Runner 2049 aesthetic wet asphalt street reflection with amber and indigo neon lighting.',
    teaser: 'Cinematic anamorphic still of a mysterious figure holding a clear umbrella on a rain-slicked boulevard...',
    negative_prompt: 'deformed, low quality',
    settings: { aspect_ratio: '21:9', color_palette: 'amber, obsidian' },
    variables: [
      { name: 'city_setting', label: 'District', default_value: 'Ginza cybernetic alley' },
    ],
    difficulty: 'intermediate',
    license_type: 'commercial',
    price_inr: 0, // Free showcase!
    compare_at_price_inr: null,
    status: 'published',
    visibility: 'public',
    is_featured: true,
    average_rating: 5.0,
    reviews_count: 41,
    copies_count: 530,
    sales_count: 140,
    views_count: 2200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c0000000-0000-0000-0000-000000000004',
      name: 'Neo-Noir & Cyberpunk',
      slug: 'neo-noir-cyberpunk',
      type: 'IMAGE',
      description: null,
      icon: 'Sparkles',
      sort_order: 4,
      created_at: new Date().toISOString(),
    },
    model: {
      id: 'm0000000-0000-0000-0000-000000000001',
      name: 'Midjourney v6.1',
      slug: 'midjourney-v6-1',
      category: 'IMAGE',
      copy_template: null,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    media: [
      {
        id: 'm5',
        prompt_id: 'p0000000-0000-0000-0000-000000000005',
        media_type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
        display_order: 0,
        is_cover: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000008',
    user_id: '00000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000008',
    model_id: 'm0000000-0000-0000-0000-000000000004',
    title: 'Ragnarok Coast: High-Speed FPV Drone Sweep',
    slug: 'ragnarok-coast-high-speed-fpv-drone-sweep',
    short_description: 'Ultra-fast cinematic FPV drone sweeping over Icelandic black sand beaches through sea arches at sunrise.',
    teaser: 'FPV drone trajectory starting inches above foaming ocean surge, accelerating through narrow sea arch...',
    negative_prompt: 'shaky, low frame rate',
    settings: { aspect_ratio: '16:9', duration: '8s', resolution: '4K' },
    variables: [
      { name: 'coastal_feature', label: 'Formation', default_value: 'black basalt sea stack arches' },
    ],
    difficulty: 'intermediate',
    license_type: 'commercial',
    price_inr: 699,
    compare_at_price_inr: null,
    status: 'published',
    visibility: 'public',
    is_featured: true,
    average_rating: 4.92,
    reviews_count: 16,
    copies_count: 85,
    sales_count: 32,
    views_count: 790,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c0000000-0000-0000-0000-000000000008',
      name: 'Cinematic Drone & Landscape',
      slug: 'cinematic-drone-landscape',
      type: 'VIDEO',
      description: null,
      icon: 'Compass',
      sort_order: 8,
      created_at: new Date().toISOString(),
    },
    model: {
      id: 'm0000000-0000-0000-0000-000000000004',
      name: 'Google Veo',
      slug: 'google-veo',
      category: 'VIDEO',
      copy_template: null,
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
    },
    media: [
      {
        id: 'm8',
        prompt_id: 'p0000000-0000-0000-0000-000000000008',
        media_type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        duration_seconds: 8.0,
        display_order: 0,
        is_cover: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export function useMarketplace() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>(DEMO_PROMPTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('aurum_favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Filter state
  const [selectedModality, setSelectedModality] = useState<PromptCategoryType | 'ALL'>('ALL');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedModelSlug, setSelectedModelSlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Load marketplace data
  const loadMarketplace = useCallback(async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setPrompts(DEMO_PROMPTS);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch published prompts
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          category:categories(*),
          model:ai_models(*),
          media:prompt_media(*)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('is_featured', { ascending: false });

      if (!error && data && data.length > 0) {
        setPrompts(data as Prompt[]);
      } else {
        setPrompts(DEMO_PROMPTS);
      }

      // Fetch categories & models
      const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
      if (catData) setCategories(catData as Category[]);

      const { data: modData } = await supabase.from('ai_models').select('*').order('sort_order');
      if (modData) setModels(modData as AIModel[]);

      // Fetch bundles
      const { data: bundleData } = await supabase.from('bundles').select('*').eq('is_active', true);
      if (bundleData) setBundles(bundleData as Bundle[]);
    } catch (err) {
      console.error('Error fetching marketplace:', err);
      setPrompts(DEMO_PROMPTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplace();
  }, [loadMarketplace]);

  // Toggle favorite bookmark
  const toggleFavorite = (promptId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      localStorage.setItem('aurum_favorites', JSON.stringify(Array.from(next)));
      return next;
    });

    if (isSupabaseConfigured && user) {
      if (favorites.has(promptId)) {
        supabase.from('favorites').delete().eq('prompt_id', promptId).eq('user_id', user.id);
      } else {
        supabase.from('favorites').insert({ prompt_id: promptId, user_id: user.id });
      }
    }
  };

  // Filtered & Sorted Prompts
  const filteredPrompts = prompts
    .filter((p) => {
      if (selectedModality !== 'ALL' && p.category?.type !== selectedModality) return false;
      if (selectedCategorySlug !== 'all' && p.category?.slug !== selectedCategorySlug) return false;
      if (selectedModelSlug !== 'all' && p.model?.slug !== selectedModelSlug) return false;
      if (priceFilter === 'free' && p.price_inr > 0) return false;
      if (priceFilter === 'paid' && p.price_inr === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = p.short_description?.toLowerCase().includes(q);
        const inTeaser = p.teaser?.toLowerCase().includes(q);
        const inModel = p.model?.name.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inTeaser && !inModel) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'rating') return b.average_rating - a.average_rating;
      if (sortBy === 'price_asc') return a.price_inr - b.price_inr;
      if (sortBy === 'price_desc') return b.price_inr - a.price_inr;
      if (sortBy === 'popular') return b.copies_count - a.copies_count;
      return 0;
    });

  return {
    prompts: filteredPrompts,
    allPrompts: prompts,
    categories,
    models,
    bundles,
    isLoading,
    favorites,
    toggleFavorite,
    selectedModality,
    setSelectedModality,
    selectedCategorySlug,
    setSelectedCategorySlug,
    selectedModelSlug,
    setSelectedModelSlug,
    searchQuery,
    setSearchQuery,
    priceFilter,
    setPriceFilter,
    sortBy,
    setSortBy,
    refreshMarketplace: loadMarketplace,
  };
}
