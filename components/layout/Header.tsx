'use client';

import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { Search, Menu, X, Heart, Ticket, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navigation = [
    { name: 'Discover', href: '/discover', icon: Search },
    { name: 'My Tickets', href: '/tickets', icon: Ticket, authRequired: true },
    { name: 'Favorites', href: '/favorites', icon: Heart, authRequired: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-orange">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <span className="hidden sm:block text-xl font-bold">
              <span className="bg-gradient-to-r from-brand-primary to-brand-orange bg-clip-text text-transparent">
                PlatNG
              </span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar variant="header" showSuggestions />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:flex">
            {navigation.map((item) => {
              // Hide auth-required items for non-authenticated users
              if (item.authRequired && !isAuthenticated) return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive(item.href)
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Search Toggle */}
          <button
            className="lg:hidden"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5 text-gray-700" />
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 lg:flex flex-shrink-0">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.full_name || 'Profile'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="border-t border-gray-200 py-3 lg:hidden">
            <SearchBar variant="inline" showSuggestions />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 pb-4 lg:hidden">
            <nav className="space-y-1 pt-4">
              {navigation.map((item) => {
                // Hide auth-required items for non-authenticated users
                if (item.authRequired && !isAuthenticated) return null;

                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth */}
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div className="px-4 pb-2">
                <LanguageSwitcher />
              </div>
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  {user?.full_name || 'Profile'}
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="md" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
