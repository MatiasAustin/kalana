import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { db } from "@/lib/db";
import { siteSettings, locations, socialLinks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 'global')
  }).catch(() => null);

  const primaryLocation = await db.query.locations.findFirst({
    where: eq(locations.isPrimary, true)
  }).catch(() => null);

  const socials = await db.query.socialLinks.findMany({
    orderBy: [asc(socialLinks.sortOrder)]
  }).catch(() => []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Details</h1>
        <p className="text-gray-500 mt-1">Manage your brand name, location, and social links.</p>
      </div>

      <StoreSettingsForm 
        initialSettings={settings} 
        initialLocation={primaryLocation} 
        initialSocials={socials} 
      />
    </div>
  );
}
