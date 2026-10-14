import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ShippingSettingsForm } from "@/components/admin/ShippingSettingsForm";
import { ensureDbSchema } from "@/lib/db/migrate-helper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminShippingSettingsPage() {
  await ensureDbSchema();

  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, "global"),
  }).catch(() => null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-3 font-mono uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Shipping & Delivery</h1>
        <p className="text-gray-500 text-sm mt-1">
          Atur integrasi Biteship API, titik lokasi asal roastery, dan tarif pengiriman real-time.
        </p>
      </div>

      <ShippingSettingsForm initialSettings={settings} />
    </div>
  );
}
