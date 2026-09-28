import { PaymentGatewayProvider } from './types';
import { MayarPaymentProvider } from './providers/mayar';
import { DokuPaymentProvider } from './providers/doku';

export function getPaymentGateway(): PaymentGatewayProvider {
  // You can determine which gateway to use via environment variables
  // or a database setting. For example:
  const activeProvider = process.env.ACTIVE_PAYMENT_GATEWAY || 'MAYAR';

  switch (activeProvider.toUpperCase()) {
    case 'MAYAR':
      return new MayarPaymentProvider();
    case 'DOKU':
      return new DokuPaymentProvider();
    // case 'MIDTRANS':
    //   return new MidtransPaymentProvider();
    default:
      console.warn(`Payment provider ${activeProvider} not recognized. Falling back to MAYAR.`);
      return new MayarPaymentProvider();
  }
}

export * from './types';
