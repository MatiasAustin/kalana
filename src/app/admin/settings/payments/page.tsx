import { db, client } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";
import { ensureDbSchema } from "@/lib/db/migrate-helper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PaymentSettingsPage() {
  await ensureDbSchema();

  let settings: any = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 'global')
  }).catch(() => null);

  if (!settings) {
    try {
      const raw = await client.execute("SELECT * FROM site_settings WHERE id = 'global' LIMIT 1;");
      if (raw.rows && raw.rows.length > 0) {
        settings = raw.rows[0];
      }
    } catch {}
  }

  const initialData = {
    activePaymentGateway: settings?.activePaymentGateway || settings?.active_payment_gateway || 'MAYAR',
    mayarApiKey: settings?.mayarApiKey || settings?.mayar_api_key || '',
    mayarPaymeUrl: settings?.mayarPaymeUrl || settings?.mayar_payme_url || 'https://mayar.to/kalanaspaceroastery',
    mayarCustomerPortalUrl: settings?.mayarCustomerPortalUrl || settings?.mayar_customer_portal_url || 'https://kalanaspaceroastery.myr.id/portal',
    dokuClientId: settings?.dokuClientId || settings?.doku_client_id || '',
    dokuSecretKey: settings?.dokuSecretKey || settings?.doku_secret_key || '',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
      </div>

      <PaymentSettingsForm initialData={initialData} />
    </div>
  );
}
