import { PaymentGatewayProvider } from './types';
import { MayarPaymentProvider } from './providers/mayar';
import { DokuPaymentProvider } from './providers/doku';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getPaymentGateway(): Promise<PaymentGatewayProvider | null> {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 'global')
  });

  if (!settings) return null;

  const activeProvider = settings.activePaymentGateway || 'NONE';

  switch (activeProvider.toUpperCase()) {
    case 'MAYAR':
      return new MayarPaymentProvider(settings.mayarApiKey || '');
    case 'DOKU':
      return new DokuPaymentProvider(settings.dokuClientId || '', settings.dokuSecretKey || '');
    case 'NONE':
      return null;
    default:
      console.warn(`Payment provider ${activeProvider} not recognized.`);
      return null;
  }
}

export * from './types';
