'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';
import { Home, Search, Heart, Ticket, User } from 'lucide-react';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Mobile Bottom Navigation Bar
 * Fixed to bottom of screen on mobile devices
 * Hidden on desktop (md and up)
 */
export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Search,
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Heart,
      authRequired: true,
    },
    {
      name: 'Tickets',
      href: '/tickets',
      icon: Ticket,
      authRequired: true,
    },
    {
      name: isAuthenticated ? 'Profile' : 'Login',
      href: isAuthenticated ? '/profile' : '/login',
      icon: User,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          // Hide auth-required items if not authenticated
          if (item.authRequired && !isAuthenticated) {
            return <div key={item.name} />; // Empty div to maintain grid
          }

          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                active
                  ? 'text-brand-primary'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'fill-current')} strokeWidth={active ? 2 : 1.5} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
