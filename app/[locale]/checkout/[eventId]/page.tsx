'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useEvent } from '@/hooks/useEvents';
import { useCreateOrder, validateTicketSelection } from '@/hooks/useOrders';
import { Link } from '@/i18n/routing';
import { logger } from '@/lib/utils/logger';
import type { PaystackConfig, PaystackResponse } from '@/types/paystack';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  CreditCard,
  ShoppingCart,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import { formatEventDate, formatNaira } from '@/lib/utils';
import { TicketType } from '@/types/ticket';

interface TicketSelection {
  ticketType: TicketType;
  quantity: number;
}

/**
 * Checkout Page Component
 *
 * Handles ticket purchase flow:
 * 1. Display event details
 * 2. Select ticket types and quantities
 * 3. Calculate total
 * 4. Integrate with Paystack payment
 * 5. Redirect to success/failure page
 */
export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.eventId as string);
  const { isAuthenticated, user } = useAuthStore();

  const { data: event, isLoading, error } = useEvent(eventId);
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout/${eventId}`);
    }
  }, [isAuthenticated, router, eventId]);

  // Set user info from auth store
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  // Check if Paystack script is loaded
  useEffect(() => {
    const checkPaystack = setInterval(() => {
      if (typeof window !== 'undefined' && typeof (window as any).PaystackPop !== 'undefined') {
        setIsPaystackLoaded(true);
        clearInterval(checkPaystack);
      }
    }, 100);

    // Clear interval after 10 seconds (timeout)
    const timeout = setTimeout(() => {
      clearInterval(checkPaystack);
      if (!isPaystackLoaded) {
        logger.warn('Paystack script failed to load after 10 seconds');
      }
    }, 10000);

    return () => {
      clearInterval(checkPaystack);
      clearTimeout(timeout);
    };
  }, [isPaystackLoaded]);

  // Initialize selections when event loads
  useEffect(() => {
    if (event?.tickets) {
      setSelections(
        event.tickets
          .filter((ticket: TicketType) => ticket.is_available)
          .map((ticket: TicketType) => ({
            ticketType: ticket,
            quantity: 0,
          }))
      );
    }
  }, [event]);

  const handleQuantityChange = (ticketId: number, delta: number) => {
    setSelections(prev =>
      prev.map(sel => {
        if (sel.ticketType.id === ticketId) {
          const newQuantity = Math.max(0, Math.min(sel.quantity + delta, 10));
          // Check availability
          const available = sel.ticketType.quantity_available - sel.ticketType.quantity_sold;
          return {
            ...sel,
            quantity: Math.min(newQuantity, available),
          };
        }
        return sel;
      })
    );
    setValidationError('');
  };

  const getTotalAmount = () => {
    return selections.reduce((sum, sel) => sum + sel.ticketType.price * sel.quantity, 0);
  };

  const getTotalTickets = () => {
    return selections.reduce((sum, sel) => sum + sel.quantity, 0);
  };

  const handlePayment = async () => {
    // Basic validation
    if (getTotalTickets() === 0) {
      setValidationError('Please select at least one ticket');
      return;
    }

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (!fullName || fullName.trim().length < 2) {
      setValidationError('Please enter your full name');
      return;
    }

    // Validate ticket availability
    if (event?.tickets) {
      const ticketSelections: Record<number, number> = {};
      selections.forEach(sel => {
        if (sel.quantity > 0) {
          ticketSelections[sel.ticketType.id] = sel.quantity;
        }
      });

      const validation = validateTicketSelection(event.tickets, ticketSelections);
      if (!validation.valid) {
        setValidationError(validation.errors[0]);
        return;
      }
    }

    setIsProcessing(true);
    setValidationError('');

    // Create order in backend
    createOrder(
      {
        event_id: eventId,
        tickets: selections
          .filter(sel => sel.quantity > 0)
          .map(sel => ({
            ticket_type_id: sel.ticketType.id,
            quantity: sel.quantity,
          })),
        customer_info: {
          email,
          phone,
          full_name: fullName,
        },
      },
      {
        onSuccess: (orderResponse) => {
          // Order created successfully, now initialize Paystack payment
          const paymentReference = orderResponse.payment_intent?.reference || `ORDER_${orderResponse.order.id}`;

          if (typeof window !== 'undefined' && window.PaystackPop) {
            const config: PaystackConfig = {
              key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
              email,
              amount: getTotalAmount() * 100, // Paystack expects amount in kobo
              currency: 'NGN',
              ref: paymentReference,
              metadata: {
                order_id: orderResponse.order.id,
                custom_fields: [
                  {
                    display_name: 'Event',
                    variable_name: 'event_name',
                    value: event?.title || '',
                  },
                  {
                    display_name: 'Tickets',
                    variable_name: 'ticket_count',
                    value: getTotalTickets().toString(),
                  },
                ],
              },
              callback: (response: PaystackResponse) => {
                // Payment successful - redirect to success page for verification
                router.push(`/checkout/success?reference=${response.reference}`);
              },
              onClose: () => {
                // User closed payment modal
                setIsProcessing(false);
              },
            };

            const handler = window.PaystackPop.setup(config);
            handler.openIframe();
          } else {
            // Fallback for development/testing without Paystack script
            logger.warn('Paystack not loaded, using mock payment flow');
            router.push(`/checkout/success?reference=${paymentReference}`);
          }
        },
        onError: (error: unknown) => {
          logger.error('Order creation failed', error);
          const errorMessage = error && typeof error === 'object' && 'response' in error
            ? (error.response as any)?.data?.message || 'Failed to create order. Please try again.'
            : 'Failed to create order. Please try again.';
          setValidationError(errorMessage);
          setIsProcessing(false);
        },
      }
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Event Not Found</h1>
            <p className="mt-2 text-gray-600">
              The event you're trying to book tickets for doesn't exist.
            </p>
            <Link
              href="/discover"
              className="mt-6 inline-block rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const totalTickets = getTotalTickets();

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/events/${eventId}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Ticket Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Event Details</h2>
              <div className="flex gap-4">
                {event.image_url && (
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg relative">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                      {formatEventDate(event.start_datetime)}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-brand-primary" />
                        {event.venue.name}, {event.venue.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Ticket className="h-6 w-6 text-brand-primary" />
                Select Tickets
              </h2>

              <div className="space-y-4">
                {selections.map((selection) => {
                  const available =
                    selection.ticketType.quantity_available -
                    selection.ticketType.quantity_sold;
                  const isSoldOut = available <= 0;

                  return (
                    <div
                      key={selection.ticketType.id}
                      className={`rounded-lg border-2 p-4 transition-colors ${
                        selection.quantity > 0
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200'
                      } ${isSoldOut ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {selection.ticketType.name}
                            </h3>
                            {isSoldOut && (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                Sold Out
                              </span>
                            )}
                          </div>
                          {selection.ticketType.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {selection.ticketType.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-4">
                            <p className="text-lg font-bold text-gray-900">
                              {selection.ticketType.price === 0
                                ? 'Free'
                                : formatNaira(selection.ticketType.price)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {available} available
                            </p>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        {!isSoldOut && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleQuantityChange(selection.ticketType.id, -1)
                              }
                              disabled={selection.quantity === 0}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-lg font-semibold text-gray-900">
                              {selection.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(selection.ticketType.id, 1)
                              }
                              disabled={selection.quantity >= available}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tickets will be sent to this email
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <ShoppingCart className="h-6 w-6 text-brand-primary" />
                  Order Summary
                </h2>

                <div className="space-y-3">
                  {selections
                    .filter((sel) => sel.quantity > 0)
                    .map((sel) => (
                      <div
                        key={sel.ticketType.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {sel.ticketType.name} x {sel.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatNaira(sel.ticketType.price * sel.quantity)}
                        </span>
                      </div>
                    ))}

                  {totalTickets === 0 && (
                    <p className="text-center text-sm text-gray-500">
                      No tickets selected
                    </p>
                  )}
                </div>

                <div className="my-4 border-t border-gray-200"></div>

                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-primary">
                    {formatNaira(totalAmount)}
                  </span>
                </div>

                {validationError && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-red-600">{validationError}</p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || isCreatingOrder || totalTickets === 0 || !isPaystackLoaded}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!isPaystackLoaded ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Loading payment system...
                    </>
                  ) : (isProcessing || isCreatingOrder) ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {isCreatingOrder ? 'Creating order...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Secure payment powered by Paystack
                </p>
              </div>

              {/* Security Notice */}
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>🔒 Secure Checkout</strong>
                  <br />
                  Your payment information is encrypted and secure. We never store
                  your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
