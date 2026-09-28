import { PaymentGatewayProvider, PaymentTransactionRequest, PaymentTransactionResponse } from '../types';

export class DokuPaymentProvider implements PaymentGatewayProvider {
  private clientId: string;
  private secretKey: string;

  constructor() {
    this.clientId = process.env.DOKU_CLIENT_ID || '';
    this.secretKey = process.env.DOKU_SECRET_KEY || '';
  }

  async createTransaction(request: PaymentTransactionRequest): Promise<PaymentTransactionResponse> {
    if (!this.clientId || !this.secretKey) {
      console.warn("DOKU credentials not set. Generating mock payment URL for development.");
      return {
        success: true,
        paymentUrl: `https://mock.doku.com/checkout/${request.orderNumber}`,
        paymentToken: `mock_doku_token_${Date.now()}`,
        provider: 'DOKU'
      };
    }

    try {
      // Implement DOKU Joko Checkout API call here
      // For now, we return a simulated success.
      return {
        success: true,
        paymentUrl: `https://joko.doku.com/checkout/link/${request.orderNumber}`,
        paymentToken: `mock_doku_${Date.now()}`,
        provider: 'DOKU'
      };
    } catch (error: any) {
      console.error("[DOKU_CREATE_TRANSACTION_ERROR]", error);
      return {
        success: false,
        provider: 'DOKU',
        error: error.message
      };
    }
  }
}
