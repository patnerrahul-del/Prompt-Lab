import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Image, Film, Shield, Vault, Sparkles, X, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isSeller, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Browse All Prompts', path: '/browse', icon: Search, group: 'Explore' },
    { label: 'Image Prompts (Midjourney, Flux, SD)', path: '/browse?category=IMAGE', icon: Image, group: 'Explore' },
    { label: 'Video Prompts (Sora, Veo, Kling, Runway)', path: '/browse?category=VIDEO', icon: Film, group: 'Explore' },
    { label: 'Curated Bundles', path: '/browse?bundles=true', icon: Sparkles, group: 'Explore' },
    { label: 'Personal Vault', path: '/vault', icon: Vault, group: 'Studio' },
    { label: 'Create New Prompt', path: '/vault/new', icon: PlusCircle, group: 'Studio' },
    ...(isSeller ? [{ label: 'Seller Dashboard', path: '/seller', icon: Sparkles, group: 'Creator' }] : []),
    ...(isAdmin ? [{ label: 'Admin Command Center', path: '/admin', icon: Shield, group: 'Operations' }] : []),
  ];

  const filtered = quickLinks.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setSearch('');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-gold/40 bg-surface p-4 text-text-ivory shadow-gold-md z-10 animate-fade-in overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 pb-3">
          <Search className="h-5 w-5 text-gold ml-2 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts, categories, collections, or actions... (Esc to close)"
            className="w-full bg-transparent text-base text-text-ivory placeholder:text-text-muted/60 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-text-muted hover:text-text-ivory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              No results found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors group hover:bg-white/[0.06]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-white/[0.04] text-text-muted group-hover:text-gold group-hover:bg-gold/10 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-text-ivory">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                    {item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted px-2">
          <span>Navigate with arrows or click</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
