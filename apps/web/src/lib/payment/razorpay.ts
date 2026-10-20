import type { PaymentProvider, CreateOrderParams, OrderResult, PaymentSuccessCallback } from './provider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export class RazorpayProvider implements PaymentProvider {
  private keyId: string;

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    if (!isSupabaseConfigured) {
      // Local test simulation mode
      return {
        orderId: 'ord_' + Math.random().toString(36).substring(2, 9),
        paymentOrderId: 'order_' + Math.random().toString(36).substring(2, 9),
        currency: 'INR',
        amount: 79900, // paise
        keyId: this.keyId,
      };
    }

    const { data, error } = await supabase.functions.invoke('create-order', {
      body: params,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to initiate secure order on server');
    }

    return {
      orderId: data.order_id,
      paymentOrderId: data.razorpay_order_id,
      currency: data.currency || 'INR',
      amount: data.amount,
      keyId: data.key_id || this.keyId,
    };
  }

  openCheckout(
    order: OrderResult,
    onSuccess: (result: PaymentSuccessCallback) => void,
    onDismiss?: () => void
  ): void {
    if (typeof window.Razorpay === 'undefined') {
      // If Razorpay script is blocked or offline, execute local simulated test mode
      console.warn('Razorpay SDK not loaded. Executing test-mode simulated purchase.');
      setTimeout(() => {
        onSuccess({
          orderId: order.orderId,
          paymentId: 'pay_test_' + Math.random().toString(36).substring(2, 9),
          signature: 'simulated_test_signature',
        });
      }, 1000);
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'AURUM PROMPTS',
      description: 'Private Prompt Commercial Entitlement',
      order_id: order.paymentOrderId,
      theme: {
        color: '#0A0A0B',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: (response: any) => {
        onSuccess({
          orderId: order.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async verifyPayment(payload: PaymentSuccessCallback): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: payload,
    });

    if (error || !data?.success) {
      return { success: false, error: error?.message || 'Server verification failed' };
    }

    return { success: true };
  }
}

export const paymentProvider = new RazorpayProvider();
