import { LocationEditor } from "@/components/admin/LocationEditor";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminSpaceLocationPage() {
  const primaryLocation = await db.query.locations.findFirst({
    where: eq(locations.isPrimary, true)
  }).catch(() => null);

  return <LocationEditor initialLocation={primaryLocation} />;
}
