'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar, Save } from 'lucide-react';

interface NotificationSettings {
  email: {
    eventReminders: boolean;
    newEvents: boolean;
    ticketUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  push: {
    eventReminders: boolean;
    ticketUpdates: boolean;
    lastMinuteDeals: boolean;
  };
  sms: {
    eventReminders: boolean;
    emergencyUpdates: boolean;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      eventReminders: true,
      newEvents: true,
      ticketUpdates: true,
      promotions: false,
      newsletter: false,
    },
    push: {
      eventReminders: true,
      ticketUpdates: true,
      lastMinuteDeals: false,
    },
    sms: {
      eventReminders: false,
      emergencyUpdates: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/notifications');
    }
  }, [isAuthenticated, router]);

  const handleToggle = (
    category: keyof NotificationSettings,
    setting: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
      },
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
              <Bell className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notification Preferences
              </h1>
              <p className="text-gray-600">
                Manage how and when you receive notifications
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Notifications
                </h2>
                <p className="text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Event Reminders</p>
                  <p className="text-sm text-gray-600">
                    Get notified before your events start
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.email.eventReminders}
                    onChange={() => handleToggle('email', 'eventReminders')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('email', 'eventReminders')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">New Events</p>
                  <p className="text-sm text-gray-600">
                    Notifications about new events in your area
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.email.newEvents}
                    onChange={() => handleToggle('email', 'newEvents')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('email', 'newEvents')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ticket Updates</p>
                  <p className="text-sm text-gray-600">
                    Important updates about your tickets
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.email.ticketUpdates}
                    onChange={() => handleToggle('email', 'ticketUpdates')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('email', 'ticketUpdates')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Promotions</p>
                  <p className="text-sm text-gray-600">
                    Special offers and discounts
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.email.promotions}
                    onChange={() => handleToggle('email', 'promotions')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('email', 'promotions')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-600">
                    Weekly roundup of events and news
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.email.newsletter}
                    onChange={() => handleToggle('email', 'newsletter')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('email', 'newsletter')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Push Notifications
                </h2>
                <p className="text-sm text-gray-600">
                  Receive instant alerts on your device
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Event Reminders</p>
                  <p className="text-sm text-gray-600">
                    Upcoming event notifications
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.push.eventReminders}
                    onChange={() => handleToggle('push', 'eventReminders')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('push', 'eventReminders')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ticket Updates</p>
                  <p className="text-sm text-gray-600">
                    Changes to your booked tickets
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.push.ticketUpdates}
                    onChange={() => handleToggle('push', 'ticketUpdates')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('push', 'ticketUpdates')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Last-Minute Deals</p>
                  <p className="text-sm text-gray-600">
                    Flash sales and limited offers
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.push.lastMinuteDeals}
                    onChange={() => handleToggle('push', 'lastMinuteDeals')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('push', 'lastMinuteDeals')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  SMS Notifications
                </h2>
                <p className="text-sm text-gray-600">
                  Text message updates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Event Reminders</p>
                  <p className="text-sm text-gray-600">
                    SMS reminders before events
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.sms.eventReminders}
                    onChange={() => handleToggle('sms', 'eventReminders')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('sms', 'eventReminders')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Emergency Updates</p>
                  <p className="text-sm text-gray-600">
                    Critical event changes or cancellations
                  </p>
                </div>
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={settings.sms.emergencyUpdates}
                    onChange={() => handleToggle('sms', 'emergencyUpdates')}
                    className="peer sr-only"
                  />
                  <div
                    onClick={() => handleToggle('sms', 'emergencyUpdates')}
                    className="h-6 w-11 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-brand-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  ></div>
                </div>
              </label>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-600">
                Notification preferences saved successfully!
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
                  Save Preferences
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

        {/* Info */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can always update your notification
            preferences. Some critical notifications cannot be disabled for
            security reasons.
          </p>
        </div>
      </div>
    </div>
  );
}
