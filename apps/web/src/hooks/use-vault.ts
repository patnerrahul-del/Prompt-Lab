import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Prompt, Collection, PromptVersion, PromptCategoryType } from '@/types/database.types';

export function useVault() {
  const { user, profile } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [filterType, setFilterType] = useState<PromptCategoryType | 'ALL'>('ALL');

  // Load user's vault prompts & folders
  const loadVault = useCallback(async () => {
    if (!user && !profile) return;
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Local demo mode: initialize with starter vault items
      const localVault = localStorage.getItem('aurum_vault_prompts');
      if (localVault) {
        setPrompts(JSON.parse(localVault));
      } else {
        const starter: Prompt[] = [
          {
            id: 'v001',
            user_id: profile?.id || 'demo',
            category_id: null,
            model_id: null,
            title: 'Private Horology Studio Concept',
            slug: 'private-horology-studio-concept',
            short_description: 'Exploratory macro photography setup for bespoke chronographs.',
            teaser: 'Haute horlogerie luxury timepiece on black obsidian...',
            negative_prompt: 'deformed, blurry, low resolution',
            settings: { aspect_ratio: '16:9', resolution: '4K' },
            variables: [{ name: 'metal', label: 'Metal', default_value: 'platinum' }],
            difficulty: 'intermediate',
            license_type: 'commercial',
            price_inr: 0,
            compare_at_price_inr: null,
            status: 'draft',
            visibility: 'private',
            is_featured: false,
            average_rating: 0,
            reviews_count: 0,
            copies_count: 4,
            sales_count: 0,
            views_count: 12,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setPrompts(starter);
        localStorage.setItem('aurum_vault_prompts', JSON.stringify(starter));
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          category:categories(*),
          model:ai_models(*),
          media:prompt_media(*)
        `)
        .eq('user_id', user?.id || profile?.id)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setPrompts(data as Prompt[]);
      }

      // Fetch collections
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user?.id || profile?.id)
        .order('name');

      if (cols) setCollections(cols as Collection[]);
    } catch (err) {
      console.error('Error loading vault:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  // Create prompt
  const createPrompt = async (promptData: Partial<Prompt>, fullPromptText: string) => {
    const userId = user?.id || profile?.id;
    if (!userId) throw new Error('Authentication required');

    const newPrompt = {
      ...promptData,
      user_id: userId,
      visibility: promptData.visibility || 'private',
      status: promptData.status || 'draft',
      teaser: promptData.teaser || fullPromptText.slice(0, Math.floor(fullPromptText.length * 0.25)) + '...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const id = 'v_' + Math.random().toString(36).substring(2, 9);
      const created = { ...newPrompt, id, slug: newPrompt.slug || 'prompt-' + id } as Prompt;
      const updated = [created, ...prompts];
      setPrompts(updated);
      localStorage.setItem('aurum_vault_prompts', JSON.stringify(updated));
      localStorage.setItem(`aurum_content_${id}`, fullPromptText);
      return created;
    }

    const { data: promptRow, error: pError } = await supabase
      .from('prompts')
      .insert(newPrompt)
      .select()
      .single();

    if (pError) throw pError;

    // Insert locked content
    const { error: cError } = await supabase
      .from('prompt_contents')
      .insert({
        prompt_id: promptRow.id,
        full_prompt_text: fullPromptText,
      });

    if (cError) throw cError;

    // Snapshot version 1
    await supabase.from('prompt_versions').insert({
      prompt_id: promptRow.id,
      version_number: 1,
      prompt_text: fullPromptText,
      negative_prompt: promptRow.negative_prompt,
      variables: promptRow.variables,
      settings: promptRow.settings,
      change_summary: 'Initial draft in personal vault',
    });

    await loadVault();
    return promptRow;
  };

  // Duplicate prompt
  const duplicatePrompt = async (prompt: Prompt) => {
    const duplicatedTitle = `${prompt.title} (Copy)`;
    let fullText = prompt.teaser || '';

    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('prompt_contents')
        .select('full_prompt_text')
        .eq('prompt_id', prompt.id)
        .single();
      if (data) fullText = data.full_prompt_text;
    } else {
      fullText = localStorage.getItem(`aurum_content_${prompt.id}`) || prompt.teaser || '';
    }

    return createPrompt(
      {
        ...prompt,
        id: undefined,
        title: duplicatedTitle,
        slug: undefined,
        visibility: 'private',
        status: 'draft',
      },
      fullText
    );
  };

  // Delete prompt
  const deletePrompt = async (promptId: string) => {
    if (!isSupabaseConfigured) {
      const updated = prompts.filter((p) => p.id !== promptId);
      setPrompts(updated);
      localStorage.setItem('aurum_vault_prompts', JSON.stringify(updated));
      return;
    }
    const { error } = await supabase.from('prompts').delete().eq('id', promptId);
    if (error) throw error;
    await loadVault();
  };

  // Export prompts (JSON & CSV)
  const exportPrompts = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(prompts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aurum_vault_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV format
      const headers = ['id', 'title', 'visibility', 'difficulty', 'price_inr', 'teaser', 'created_at'];
      const rows = prompts.map((p) => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.visibility,
        p.difficulty,
        p.price_inr,
        `"${(p.teaser || '').replace(/"/g, '""')}"`,
        p.created_at,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `aurum_vault_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // Filtered prompt list
  const filteredPrompts = prompts.filter((p) => {
    if (filterVisibility !== 'all' && p.visibility !== filterVisibility) return false;
    if (filterType !== 'ALL' && p.category?.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.short_description?.toLowerCase().includes(q);
      const matchTeaser = p.teaser?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTeaser) return false;
    }
    return true;
  });

  return {
    prompts: filteredPrompts,
    allPrompts: prompts,
    collections,
    activeCollectionId,
    setActiveCollectionId,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterVisibility,
    setFilterVisibility,
    filterType,
    setFilterType,
    createPrompt,
    duplicatePrompt,
    deletePrompt,
    exportPrompts,
    refreshVault: loadVault,
  };
}
