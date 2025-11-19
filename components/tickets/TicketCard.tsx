'use client';

import Image from 'next/image';
import { UserTicket } from '@/types/ticket';
import { formatEventDate, formatNaira, cn } from '@/lib/utils';
import { Calendar, MapPin, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, memo } from 'react';
import { Link } from '@/i18n/routing';
import { QRCodeSVG } from 'qrcode.react';

interface TicketCardProps {
  ticket: UserTicket;
  showQR?: boolean;
}

/**
 * TicketCard Component
 *
 * Displays user's ticket with event details and QR code for check-in.
 *
 * Features:
 * - Event information
 * - QR code display (expandable)
 * - Ticket status badge
 * - Check-in status
 * - Past/upcoming indicator
 * - Memoized for performance
 *
 * @example
 * ```tsx
 * <TicketCard ticket={userTicket} showQR={true} />
 * ```
 */
const TicketCardComponent = ({ ticket, showQR = false }: TicketCardProps) => {
  const [showQRCode, setShowQRCode] = useState(showQR);
  const [imageError, setImageError] = useState(false);

  const isPastEvent = new Date(ticket.event.start_datetime) < new Date();
  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';
  const isExpired = ticket.status === 'expired';

  const getStatusColor = () => {
    if (isCancelled) return 'bg-red-100 text-red-700';
    if (isExpired) return 'bg-gray-100 text-gray-700';
    if (isUsed) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusIcon = () => {
    if (isCancelled) return <XCircle className="h-4 w-4" />;
    if (isExpired) return <Clock className="h-4 w-4" />;
    if (isUsed) return <CheckCircle className="h-4 w-4" />;
    return <QrCode className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isCancelled) return 'Cancelled';
    if (isExpired) return 'Expired';
    if (isUsed) return `Used ${ticket.checked_in_at ? `on ${new Date(ticket.checked_in_at).toLocaleDateString()}` : ''}`;
    return 'Active';
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <Link href={`/events/${ticket.event.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-orange">
          {ticket.event.image_url && !imageError ? (
            <Image
              src={ticket.event.image_url}
              alt={ticket.event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-6xl opacity-50">🎭</div>
            </div>
          )}

          {/* Past Event Overlay */}
          {isPastEvent && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                Past Event
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute left-3 top-3">
            <span className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm', getStatusColor())}>
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Ticket Type Badge */}
        <div className="mb-2">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            🎫 {ticket.ticket.name}
          </span>
        </div>

        {/* Event Title */}
        <Link href={`/events/${ticket.event.id}`}>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 hover:text-brand-primary transition-colors">
            {ticket.event.title}
          </h3>
        </Link>

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
            <span className="line-clamp-1">{formatEventDate(ticket.event.start_datetime)}</span>
          </div>

          {/* Venue */}
          {ticket.event.venue && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
              <span className="line-clamp-1">
                {ticket.event.venue.name}, {ticket.event.venue.city}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Ticket Price</span>
              <div className="text-lg font-bold text-gray-900">
                {ticket.ticket.price === 0 ? 'Free' : formatNaira(ticket.ticket.price)}
              </div>
            </div>

            {/* QR Code Toggle */}
            {!isCancelled && !isExpired && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
              >
                <QrCode className="h-4 w-4" />
                {showQRCode ? 'Hide QR' : 'Show QR'}
              </button>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {showQRCode && !isCancelled && !isExpired && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-center text-sm font-medium text-gray-700">
                Scan at venue for check-in
              </div>
              <div className="flex justify-center">
                <div className="rounded-lg bg-white p-4 shadow-md">
                  <QRCodeSVG
                    value={ticket.qr_code}
                    size={192}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: '/logo.png',
                      excavate: true,
                      width: 32,
                      height: 32,
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Ticket ID: <span className="font-mono font-medium">#{ticket.id.toString().padStart(6, '0')}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Purchased on {new Date(ticket.created_at).toLocaleDateString()}
                </p>
                <p className="mt-1 font-mono text-xs text-gray-400">
                  {ticket.qr_code}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled/Expired Message */}
        {(isCancelled || isExpired) && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-sm text-gray-600">
              {isCancelled
                ? 'This ticket has been cancelled'
                : 'This ticket has expired'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Memoized TicketCard - only re-renders when ticket id or status changes
 */
export const TicketCard = memo(TicketCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.ticket.id === nextProps.ticket.id &&
    prevProps.ticket.status === nextProps.ticket.status &&
    prevProps.showQR === nextProps.showQR
  );
});

TicketCard.displayName = 'TicketCard';
