import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PaymentSettingsPage() {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 'global')
  });

  const initialData = {
    activePaymentGateway: settings?.activePaymentGateway || 'NONE',
    mayarApiKey: settings?.mayarApiKey || '',
    dokuClientId: settings?.dokuClientId || '',
    dokuSecretKey: settings?.dokuSecretKey || '',
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
