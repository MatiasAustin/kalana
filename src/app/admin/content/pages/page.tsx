import { PagesEditor } from "@/components/admin/PagesEditor";
import { getPageContent } from "@/lib/cms-api";
import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const SYSTEM_SLUGS = new Set([
  "about",
  "roastery",
  "space",
  "workshops",
  "contact",
  "goods",
  "terms",
  "privacy",
  "shipping",
  "homepage",
  "navigation",
  "announcement",
  "blog_articles",
]);

export default async function AdminPagesPage() {
  const [
    about,
    roastery,
    space,
    workshops,
    contact,
    goods,
    terms,
    privacy,
    shipping,
  ] = await Promise.all([
    getPageContent("about"),
    getPageContent("roastery"),
    getPageContent("space"),
    getPageContent("workshops"),
    getPageContent("contact"),
    getPageContent("goods"),
    getPageContent("terms"),
    getPageContent("privacy"),
    getPageContent("shipping"),
  ]);

  const initialPagesData: Record<string, any> = {
    about,
    roastery,
    space,
    workshops,
    contact,
    goods,
    terms,
    privacy,
    shipping,
  };

  const customPagesList: Array<{ slug: string; title: string }> = [];

  try {
    const allDbPages = await db.query.sitePages.findMany();
    allDbPages.forEach((p) => {
      if (!SYSTEM_SLUGS.has(p.slug)) {
        try {
          const parsed = typeof p.data === "string" ? JSON.parse(p.data) : p.data;
          initialPagesData[p.slug] = {
            ...parsed,
            title: p.title || p.slug,
          };
          customPagesList.push({
            slug: p.slug,
            title: p.title || p.slug,
          });
        } catch (e) {
          console.error(`Failed to parse custom page data for ${p.slug}:`, e);
        }
      }
    });
  } catch (err) {
    console.error("[FETCH_CUSTOM_PAGES_ERROR]", err);
  }

  return (
    <PagesEditor
      initialPagesData={initialPagesData}
      customPages={customPagesList}
    />
  );
}
