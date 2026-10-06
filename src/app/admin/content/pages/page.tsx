import { PagesEditor } from "@/components/admin/PagesEditor";
import { getPageContent } from "@/lib/cms-api";

export default async function AdminPagesPage() {
  const [about, space, goods, terms, privacy, shipping] = await Promise.all([
    getPageContent("about"),
    getPageContent("space"),
    getPageContent("goods"),
    getPageContent("terms"),
    getPageContent("privacy"),
    getPageContent("shipping"),
  ]);

  const initialPagesData = {
    about,
    space,
    goods,
    terms,
    privacy,
    shipping,
  };

  return <PagesEditor initialPagesData={initialPagesData} />;
}
