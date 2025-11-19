'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

/**
 * Payment Failed Page
 *
 * Displayed when Paystack payment fails.
 * Shows error message and options to retry.
 */
function FailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const message = searchParams.get('message') || 'Payment was not completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Error Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <XCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Payment Failed</h1>
          <p className="mt-3 text-lg text-gray-600">
            Unfortunately, we couldn't process your payment
          </p>
        </div>

        {/* Error Details */}
        <div className="mb-6 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            What Happened?
          </h2>

          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-red-800">
              <strong>Error:</strong> {message}
            </p>
            {reference && (
              <p className="mt-2 text-sm text-red-700">
                Reference: <span className="font-mono">{reference}</span>
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Common Reasons:</h3>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>Insufficient funds in your account</li>
              <li>Card was declined by your bank</li>
              <li>Incorrect card details entered</li>
              <li>Transaction timeout or network error</li>
              <li>Daily transaction limit exceeded</li>
            </ul>
          </div>
        </div>

        {/* What to Do */}
        <div className="mb-6 rounded-xl bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-blue-900">What Should I Do?</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>1. Check your card details and account balance</p>
                <p>2. Contact your bank if the issue persists</p>
                <p>3. Try a different payment method</p>
                <p>4. Contact our support team if you need assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.history.back()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-4 font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/discover"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
            Browse Events
          </Link>
        </div>

        {/* Alternative Payment Methods */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-semibold text-gray-900">
            Alternative Payment Methods
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-brand-primary">
              <div className="mb-2 text-2xl">💳</div>
              <h4 className="font-semibold text-gray-900">Debit/Credit Card</h4>
              <p className="mt-1 text-sm text-gray-600">
                Visa, Mastercard, Verve accepted
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-brand-primary">
              <div className="mb-2 text-2xl">🏦</div>
              <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
              <p className="mt-1 text-sm text-gray-600">
                Direct transfer via Paystack
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-brand-primary">
              <div className="mb-2 text-2xl">📱</div>
              <h4 className="font-semibold text-gray-900">USSD</h4>
              <p className="mt-1 text-sm text-gray-600">
                Pay with your bank's USSD code
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-brand-primary">
              <div className="mb-2 text-2xl">💰</div>
              <h4 className="font-semibold text-gray-900">Mobile Money</h4>
              <p className="mt-1 text-sm text-gray-600">
                MTN, Airtel, and more
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Still having issues?{' '}
            <a href="mailto:support@platng.com" className="text-brand-primary hover:underline">
              Contact Support
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Our team is available 24/7 to help you complete your purchase
          </p>
        </div>

        {/* No Charge Notice */}
        <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <p className="text-center text-sm text-green-800">
            <strong>✓ No money was charged</strong> - Your account was not debited for this failed transaction
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
