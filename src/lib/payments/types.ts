export interface PaymentTransactionRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface PaymentTransactionResponse {
  success: boolean;
  paymentUrl?: string; // Redirect URL for the user to pay
  paymentToken?: string; // Internal token or reference ID from the gateway
  provider: string; // e.g., 'MAYAR', 'DOKU', 'MIDTRANS', 'MANUAL'
  error?: string;
}

export interface PaymentGatewayProvider {
  createTransaction(request: PaymentTransactionRequest): Promise<PaymentTransactionResponse>;
  handleWebhook?(payload: any, signature: string): Promise<{ success: boolean; orderId?: string; status?: string }>;
}
