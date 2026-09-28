import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { db } from "@/lib/db";
import { homepageSections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export default async function HomepageEditorPage() {
  const sections = await db.query.homepageSections.findMany({
    orderBy: [asc(homepageSections.sortOrder)]
  });

  const parsedSections = sections.map(s => ({
    ...s,
    data: typeof s.data === 'string' ? JSON.parse(s.data) : s.data
  }));

  return <HomepageEditor initialSections={parsedSections} />;
}
