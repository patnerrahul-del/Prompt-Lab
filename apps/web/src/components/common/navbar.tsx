import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Vault, LogIn, LogOut, Shield, Sparkles, User, Menu, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, isUser, isSeller, isAdmin, signOut, openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Marketplace', path: '/browse' },
    { label: 'Image Prompts', path: '/browse?category=IMAGE' },
    { label: 'Video Prompts', path: '/browse?category=VIDEO' },
    { label: 'Vault', path: '/vault', requiresAuth: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-background/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gold/40 bg-surface shadow-gold-sm transition-all duration-300 group-hover:border-gold group-hover:shadow-gold-md">
              <svg className="h-6 w-6" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" stroke="#C9A24B" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M50 20L62 44H38L50 20Z" fill="url(#navGold)" />
                <path d="M50 34L72 76H60L55 65H45L40 76H28L50 34ZM48 57H52L50 51L48 57Z" fill="url(#navGold)" />
                <defs>
                  <linearGradient id="navGold" x1="28" y1="20" x2="72" y2="76" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E8D8A8" />
                    <stop offset="50%" stopColor="#C9A24B" />
                    <stop offset="100%" stopColor="#8A6A22" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-text-ivory group-hover:text-gold-light transition-colors">
                AURUM
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-medium -mt-1">
                Prompt Vault
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path.includes('?') && location.search.includes(link.path.split('?')[1]));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors relative py-1 hover:text-gold-light',
                    isActive ? 'text-gold-light font-semibold' : 'text-text-muted'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-gradient rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Search & User Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-muted hover:border-gold/40 hover:text-text-ivory transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-gold" />
              <span>Search Prompts...</span>
              <kbd className="rounded border border-white/10 bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Create Prompt Button (Vault Quick Action) */}
            {isUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/vault/new')}
                className="hidden lg:flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Prompt</span>
              </Button>
            )}

            {/* Profile Dropdown / Sign In */}
            {isUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-gold/40 p-1 hover:border-gold transition-colors focus:outline-none"
                  aria-label="User profile menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold-light font-serif font-bold text-sm">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-64 rounded-xl border border-white/10 bg-surface p-2 text-text-ivory shadow-2xl z-50 animate-fade-in"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-text-ivory truncate">
                        {profile?.full_name || 'Collector'}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      <span className="inline-block mt-1 rounded px-1.5 py-0.5 text-[10px] font-mono uppercase bg-gold/15 text-gold-light border border-gold/30">
                        {profile?.role || 'user'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/vault"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-ivory hover:bg-white/[0.05]"
                      >
                        <Vault className="h-4 w-4 text-gold" />
                        <span>My Personal Vault</span>
                      </Link>
                      <Link
                        to="/vault?tab=purchased"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-ivory hover:bg-white/[0.05]"
                      >
                        <Sparkles className="h-4 w-4 text-champagne" />
                        <span>Unlocked Acquisitions</span>
                      </Link>

                      {isSeller && (
                        <Link
                          to="/seller"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-ivory hover:bg-white/[0.05]"
                        >
                          <User className="h-4 w-4 text-gold" />
                          <span>Seller Studio</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gold-light hover:bg-gold/10 font-medium"
                        >
                          <Shield className="h-4 w-4 text-gold" />
                          <span>Admin Command Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={openAuthModal} variant="gold" size="sm" className="gap-2">
                <LogIn className="h-3.5 w-3.5" />
                <span>Enter Vault</span>
              </Button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-ivory"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-surface/95 px-6 py-4 space-y-3 animate-fade-in backdrop-blur-xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-text-ivory py-2 border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
            {isUser && (
              <Link
                to="/vault/new"
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-gold py-2 border-b border-white/5"
              >
                + Create Prompt
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Quick-Access Bar (360px viewport support) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-surface/90 backdrop-blur-lg flex items-center justify-around py-2.5 px-4 shadow-luxury">
        <Link to="/" className="flex flex-col items-center text-xs text-text-muted hover:text-gold gap-1">
          <Sparkles className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="/browse" className="flex flex-col items-center text-xs text-text-muted hover:text-gold gap-1">
          <Search className="h-5 w-5" />
          <span>Explore</span>
        </Link>
        <Link to="/vault" className="flex flex-col items-center text-xs text-text-muted hover:text-gold gap-1">
          <Vault className="h-5 w-5" />
          <span>Vault</span>
        </Link>
        {isUser ? (
          <Link to="/vault?tab=account" className="flex flex-col items-center text-xs text-text-muted hover:text-gold gap-1">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex flex-col items-center text-xs text-gold gap-1"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In</span>
          </button>
        )}
      </nav>
    </>
  );
}
