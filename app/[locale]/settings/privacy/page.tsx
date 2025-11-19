'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Save, Download } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showAttendance: boolean;
  showFavorites: boolean;
  allowMessages: boolean;
  shareData: boolean;
  analytics: boolean;
}

export default function PrivacyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showAttendance: true,
    showFavorites: false,
    allowMessages: true,
    shareData: false,
    analytics: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/privacy');
    }
  }, [isAuthenticated, router]);

  const handleToggle = (setting: keyof Omit<PrivacySettings, 'profileVisibility'>) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleVisibilityChange = (value: 'public' | 'private' | 'friends') => {
    setSettings((prev) => ({
      ...prev,
      profileVisibility: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDownloadData = async () => {
    setIsDownloading(true);

    // Simulate data export
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsDownloading(false);

    // In production, this would trigger a download
    alert('Your data export will be sent to your email within 24 hours.');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/settings"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary/10 p-3">
              <Shield className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Privacy Settings
              </h1>
              <p className="text-gray-600">
                Control your privacy and data sharing
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Visibility
                </h2>
                <p className="text-sm text-gray-600">
                  Who can see your profile information
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-brand-primary transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Public</p>
                  <p className="text-sm text-gray-600">
                    Anyone can see your profile
                  </p>
                </div>
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.profileVisibility === 'public'}
                  onChange={() => handleVisibilityChange('public')}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-brand-primary transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Friends Only</p>
                  <p className="text-sm text-gray-600">
                    Only people you follow can see your profile
                  </p>
                </div>
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.profileVisibility === 'friends'}
                  onChange={() => handleVisibilityChange('friends')}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-brand-primary transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Private</p>
                  <p className="text-sm text-gray-600">
                    Only you can see your profile
                  </p>
                </div>
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.profileVisibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                />
              </label>
            </div>
          </div>

          {/* Activity Privacy */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <EyeOff className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Activity Privacy
                </h2>
                <p className="text-sm text-gray-600">
                  Control what others can see
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Event Attendance</p>
                  <p className="text-sm text-gray-600">
                    Let others see events you're attending
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.showAttendance}
                    onChange={() => handleToggle('showAttendance')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('showAttendance')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Favorites</p>
                  <p className="text-sm text-gray-600">
                    Display your favorite events publicly
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.showFavorites}
                    onChange={() => handleToggle('showFavorites')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('showFavorites')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow Messages</p>
                  <p className="text-sm text-gray-600">
                    Let other users send you messages
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.allowMessages}
                    onChange={() => handleToggle('allowMessages')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('allowMessages')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Data & Analytics */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Lock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Data & Analytics
                </h2>
                <p className="text-sm text-gray-600">
                  How we use your data
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Share Data with Partners</p>
                  <p className="text-sm text-gray-600">
                    Help improve event recommendations
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.shareData}
                    onChange={() => handleToggle('shareData')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('shareData')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Analytics & Performance</p>
                  <p className="text-sm text-gray-600">
                    Help us improve the platform
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={() => handleToggle('analytics')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('analytics')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Export */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Data
              </h2>
              <p className="text-sm text-gray-600">
                Download or manage your personal data
              </p>
            </div>

            <button
              onClick={handleDownloadData}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-brand-primary bg-white px-6 py-3 font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"></div>
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download My Data
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              We'll send a copy of your data to your email
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-600">
                Privacy settings saved successfully!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Settings
                </>
              )}
            </button>
            <Link
              href="/settings"
              className="flex items-center justify-center rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Your Privacy Matters:</strong> We take your privacy
            seriously. Read our{' '}
            <a href="/privacy-policy" className="underline hover:no-underline">
              Privacy Policy
            </a>{' '}
            to learn more about how we protect your data.
          </p>
        </div>
      </div>
    </div>
  );
}
