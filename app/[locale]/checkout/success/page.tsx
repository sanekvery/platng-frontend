'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyPayment } from '@/hooks/useOrders';
import { formatNaira } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { Link } from '@/i18n/routing';
import { CheckCircle, Download, Calendar, Mail, ArrowRight } from 'lucide-react';

/**
 * Payment Success Page
 *
 * Displayed after successful Paystack payment.
 * Shows order confirmation and next steps.
 */
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
  const [orderDetails, setOrderDetails] = useState<{
    reference: string;
    amount: number;
    ticketCount: number;
    eventName: string;
    orderDate: string;
    orderId: number;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found');
      return;
    }

    // Verify payment with backend
    verifyPayment(
      { reference },
      {
        onSuccess: (data) => {
          if (data.status === 'success' && data.order) {
            // Extract order details for display
            setOrderDetails({
              reference,
              amount: data.order.total_amount,
              ticketCount: data.order.tickets?.length || 0,
              eventName: data.order.tickets?.[0]?.event?.title || 'Event',
              orderDate: data.order.created_at,
              orderId: data.order.id,
            });
          } else if (data.status === 'failed') {
            setError(data.message || 'Payment verification failed');
            // Redirect to failed page after showing error
            setTimeout(() => {
              router.push(`/checkout/failed?reference=${reference}&message=${encodeURIComponent(data.message || 'Payment verification failed')}`);
            }, 3000);
          } else {
            setError('Payment is still pending. Please check back later.');
          }
        },
        onError: (error: unknown) => {
          logger.error('Payment verification error', error);
          const errorMessage = error && typeof error === 'object' && 'response' in error
            ? (error.response as any)?.data?.message || 'Failed to verify payment. Please contact support.'
            : 'Failed to verify payment. Please contact support.';
          setError(errorMessage);
        },
      }
    );
  }, [reference, verifyPayment, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verifying Payment...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we confirm your transaction
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-8 flex gap-3 justify-center">
              <Link
                href="/tickets"
                className="rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90"
              >
                View My Tickets
              </Link>
              <Link
                href="/discover"
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-lg">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-3 text-lg text-gray-600">
            Your tickets have been confirmed and sent to your email
          </p>
        </div>

        {/* Order Details */}
        <div className="mb-6 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Order Confirmation
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-4">
              <span className="text-gray-600">Order Reference</span>
              <span className="font-mono font-semibold text-gray-900">
                {reference}
              </span>
            </div>

            {orderDetails && (
              <>
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Event</span>
                  <span className="font-semibold text-gray-900">
                    {orderDetails.eventName}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Number of Tickets</span>
                  <span className="font-semibold text-gray-900">
                    {orderDetails.ticketCount}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatNaira(orderDetails.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(orderDetails.orderDate).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6 rounded-xl bg-blue-50 p-6">
          <h3 className="mb-4 font-semibold text-blue-900">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Check Your Email</p>
                <p className="text-sm text-blue-700">
                  Your tickets have been sent to your email address with QR codes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Download Tickets</p>
                <p className="text-sm text-blue-700">
                  You can download and save your tickets from the My Tickets page
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Event Reminders</p>
                <p className="text-sm text-blue-700">
                  We'll send you reminders before the event starts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tickets"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-4 font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            View My Tickets
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/discover"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Browse More Events
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@platng.com" className="text-brand-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
