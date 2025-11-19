'use client';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  User,
  Mail,
  Calendar,
  Heart,
  Ticket,
  Settings,
  LogOut,
  Loader2,
  Edit,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { useFavoriteCount } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

/**
 * Profile/Dashboard Page
 *
 * User profile and dashboard with:
 * - User information
 * - Statistics (favorites, tickets)
 * - Quick actions
 * - Account settings
 *
 * Requires authentication
 */
export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser, logout } = useAuthStore();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: favoriteCount } = useFavoriteCount();

  const user = currentUser || authUser;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and view your activity
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              {/* Avatar */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-orange text-3xl font-bold text-white">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.full_name || 'User'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">{user?.email}</p>

                {user?.is_verified && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    <Shield className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    {favoriteCount || 0}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-orange">
                    {user?.tickets_count || 0}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">Tickets</div>
                </div>
              </div>

              {/* Member Since */}
              {user?.created_at && (
                <div className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
                  <Calendar className="mx-auto mb-2 h-5 w-5" />
                  <p>
                    Member since{' '}
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition-all hover:bg-red-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Right Column - Actions & Settings */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Quick Actions
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/favorites"
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="rounded-full bg-red-100 p-3 transition-colors group-hover:bg-red-200">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">My Favorites</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {favoriteCount || 0} saved events
                    </p>
                  </div>
                </Link>

                <Link
                  href="/tickets"
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="rounded-full bg-brand-orange/20 p-3 transition-colors group-hover:bg-brand-orange/30">
                    <Ticket className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">My Tickets</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {user?.tickets_count || 0} upcoming events
                    </p>
                  </div>
                </Link>

                <Link
                  href="/discover"
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="rounded-full bg-brand-primary/20 p-3 transition-colors group-hover:bg-brand-primary/30">
                    <Calendar className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Discover Events
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Find new events near you
                    </p>
                  </div>
                </Link>

                <Link
                  href="/profile/settings"
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="rounded-full bg-gray-100 p-3 transition-colors group-hover:bg-gray-200">
                    <Settings className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Settings</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage your account
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Account Information
              </h3>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-start gap-3">
                      <User className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Full Name
                        </p>
                        <p className="mt-1 text-gray-900">
                          {user?.full_name || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Email Address
                        </p>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                        {user?.is_verified && (
                          <p className="mt-1 text-xs text-green-600">
                            ✓ Verified
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Password
                        </p>
                        <p className="mt-1 text-gray-900">••••••••</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80">
                      <Edit className="h-4 w-4" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
