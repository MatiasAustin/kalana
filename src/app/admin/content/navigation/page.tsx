import { NavigationEditor } from "@/components/admin/NavigationEditor";
import { getNavigation } from "@/lib/cms-api";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const [nav, socials] = await Promise.all([
    getNavigation(),
    db.query.socialLinks.findMany({
      orderBy: [asc(socialLinks.sortOrder)]
    }).catch(() => [])
  ]);

  return <NavigationEditor initialNav={nav} initialSocials={socials} />;
}
