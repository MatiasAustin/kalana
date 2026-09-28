import { PaymentGatewayProvider, PaymentTransactionRequest, PaymentTransactionResponse } from '../types';

export class MayarPaymentProvider implements PaymentGatewayProvider {
  private apiKey: string;
  private isProduction: boolean;

  constructor(apiKey: string) {
    this.apiKey = apiKey || process.env.MAYAR_API_KEY || '';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async createTransaction(request: PaymentTransactionRequest): Promise<PaymentTransactionResponse> {
    if (!this.apiKey) {
      console.warn("MAYAR_API_KEY is not set. Generating mock payment URL for development.");
      return {
        success: true,
        paymentUrl: `https://mock.mayar.id/pay/${request.orderNumber}`,
        paymentToken: `mock_mayar_token_${Date.now()}`,
        provider: 'MAYAR'
      };
    }

    try {
      // Implement Mayar API Call here
      // https://docs.mayar.id/api/payment-link
      
      const payload = {
        name: `Order ${request.orderNumber}`,
        description: `Payment for KALANA Order ${request.orderNumber}`,
        amount: request.amount,
        customer_name: `${request.customerDetails.firstName} ${request.customerDetails.lastName}`,
        customer_email: request.customerDetails.email,
        customer_phone: request.customerDetails.phone,
        is_single_use: true,
      };

      const response = await fetch('https://api.mayar.id/v1/payment/link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Mayar transaction');
      }

      return {
        success: true,
        paymentUrl: data.data.link,
        paymentToken: data.data.id,
        provider: 'MAYAR'
      };
    } catch (error: any) {
      console.error("[MAYAR_CREATE_TRANSACTION_ERROR]", error);
      return {
        success: false,
        provider: 'MAYAR',
        error: error.message
      };
    }
  }
}
