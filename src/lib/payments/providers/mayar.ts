import { PaymentGatewayProvider, PaymentTransactionRequest, PaymentTransactionResponse } from '../types';

export class MayarPaymentProvider implements PaymentGatewayProvider {
  private apiKey: string;
  private paymeUrl: string;

  constructor(apiKey: string, paymeUrl?: string) {
    this.apiKey = apiKey || process.env.MAYAR_API_KEY || '';
    this.paymeUrl = paymeUrl || process.env.MAYAR_PAYME_URL || 'https://mayar.to/kalanaspaceroastery';
  }

  async createTransaction(request: PaymentTransactionRequest): Promise<PaymentTransactionResponse> {
    const fallbackUrl = this.paymeUrl || 'https://mayar.to/kalanaspaceroastery';

    // If API key is provided, attempt to create dynamic payment request via Mayar Headless API
    if (this.apiKey) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : '');
        const redirectUrl = appUrl ? `${appUrl}/checkout/success?order=${request.orderNumber}` : undefined;

        const payload: Record<string, any> = {
          name: `${request.customerDetails.firstName || ''} ${request.customerDetails.lastName || ''}`.trim() || 'Pelanggan KALANA',
          email: request.customerDetails.email,
          mobile: request.customerDetails.phone || '081234567890',
          amount: Math.round(request.amount),
          description: `Pesanan ${request.orderNumber} - KALANA Space & Roastery`,
        };

        if (redirectUrl) {
          payload.redirectUrl = redirectUrl;
        }

        const response = await fetch('https://api.mayar.id/hl/v1/payment/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.data?.link) {
          return {
            success: true,
            paymentUrl: data.data.link,
            paymentToken: data.data.transactionId || data.data.id || `mayar_${request.orderNumber}`,
            provider: 'MAYAR'
          };
        } else {
          console.warn("[MAYAR_API_WARN_FALLBACK_TO_PAYME]", data?.messages || data?.message || response.statusText);
        }
      } catch (error: any) {
        console.warn("[MAYAR_API_ERROR_FALLBACK_TO_PAYME]", error?.message);
      }
    }

    // Direct / Fallback to active PayMe Link (instant & fully functional)
    return {
      success: true,
      paymentUrl: fallbackUrl,
      paymentToken: `payme_${request.orderNumber}_${Date.now()}`,
      provider: 'MAYAR'
    };
  }
}

