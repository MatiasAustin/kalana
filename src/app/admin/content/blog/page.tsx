import { BlogManager } from "@/components/admin/BlogManager";
import { getBlogArticles } from "@/lib/cms-api";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const articles = await getBlogArticles();

  return <BlogManager initialArticles={articles} />;
}
