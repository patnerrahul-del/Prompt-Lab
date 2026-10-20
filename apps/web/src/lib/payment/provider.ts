export interface CreateOrderParams {
  promptId?: string;
  bundleId?: string;
  couponCode?: string;
  customerEmail: string;
  customerName?: string;
}

export interface OrderResult {
  orderId: string;
  paymentOrderId: string;
  currency: string;
  amount: number;
  keyId: string;
}

export interface PaymentSuccessCallback {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  openCheckout(
    order: OrderResult,
    onSuccess: (result: PaymentSuccessCallback) => void,
    onDismiss?: () => void
  ): void;
  verifyPayment(payload: PaymentSuccessCallback): Promise<{ success: boolean; error?: string }>;
}
