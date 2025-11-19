/**
 * Paystack TypeScript type definitions
 */

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: {
    order_id: number;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: 'success' | 'failed' | 'pending';
  message?: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

export interface PaystackPopup {
  setup: (config: PaystackConfig) => PaystackHandler;
}

export interface PaystackHandler {
  openIframe: () => void;
}

/**
 * Paystack Pop global interface
 */
declare global {
  interface Window {
    PaystackPop?: PaystackPopup;
  }
}

export {};
