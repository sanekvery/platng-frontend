'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import {
  User,
  Lock,
  Bell,
  Globe,
  Mail,
  Shield,
  Trash2,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SettingsSection {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: user } = useCurrentUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const sections: SettingsSection[] = [
    {
      title: 'Profile',
      description: 'Manage your personal information and avatar',
      icon: User,
      href: '/settings/profile',
    },
    {
      title: 'Security',
      description: 'Password, two-factor authentication, and security settings',
      icon: Lock,
      href: '/settings/security',
    },
    {
      title: 'Email & Notifications',
      description: 'Manage email preferences and notification settings',
      icon: Bell,
      href: '/settings/notifications',
      badge: user?.is_verified ? undefined : 'Verify Email',
    },
    {
      title: 'Language & Region',
      description: 'Set your language and regional preferences',
      icon: Globe,
      href: '/settings/preferences',
    },
    {
      title: 'Privacy',
      description: 'Control your privacy and data sharing settings',
      icon: Shield,
      href: '/settings/privacy',
    },
  ];

  const dangerZone: SettingsSection[] = [
    {
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      icon: Trash2,
      href: '/settings/delete-account',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary/10 p-3">
              <SettingsIcon className="h-8 w-8 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user.avatar_url ? (
                <div className="h-16 w-16 rounded-full relative overflow-hidden">
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-orange text-2xl font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.full_name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  {user.is_verified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Mail className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-orange-600">
                      <Mail className="h-3 w-3" />
                      Not verified
                    </span>
                  )}
                  {user.is_active && (
                    <span className="text-xs text-gray-400">• Active</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              General Settings
            </h2>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="block rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {section.title}
                            </h3>
                            {section.badge && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                {section.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-red-600">
              Danger Zone
            </h2>
            <div className="space-y-2">
              {dangerZone.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="block rounded-lg border-2 border-red-200 bg-white p-4 transition-all hover:border-red-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-50 p-3">
                          <Icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-600">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> Contact our support team if you have
            questions about your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
