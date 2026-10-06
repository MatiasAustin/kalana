"use server";

import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getBlogArticles } from "@/lib/cms-api";
import { savePageContent } from "./pages";
import { revalidatePath } from "next/cache";

export async function saveAllBlogArticles(articles: any[]) {
  await requireAdminApi();
  const res = await savePageContent("blog_articles", "Coffee Journal Articles", { articles });
  revalidatePath("/journal");
  revalidatePath("/admin/content/blog");
  return res;
}

export async function upsertBlogArticle(article: any) {
  try {
    await requireAdminApi();
    const currentArticles = await getBlogArticles();

    let updatedArticles: any[];
    const exists = currentArticles.find((a) => a.id === article.id || a.slug === article.slug);

    if (exists) {
      updatedArticles = currentArticles.map((a) =>
        a.id === article.id || a.slug === article.slug ? { ...a, ...article, updatedAt: new Date().toISOString() } : a
      );
    } else {
      updatedArticles = [
        {
          ...article,
          id: article.id || `art-${Date.now()}`,
          createdAt: article.createdAt || new Date().toISOString().split("T")[0],
        },
        ...currentArticles,
      ];
    }

    const res = await savePageContent("blog_articles", "Coffee Journal Articles", { articles: updatedArticles });
    revalidatePath("/journal");
    revalidatePath(`/journal/${article.slug}`);
    revalidatePath("/admin/content/blog");
    return res;
  } catch (error: any) {
    console.error("[UPSERT_BLOG_ARTICLE_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogArticle(articleId: string) {
  try {
    await requireAdminApi();
    const currentArticles = await getBlogArticles();
    const filtered = currentArticles.filter((a) => a.id !== articleId);

    const res = await savePageContent("blog_articles", "Coffee Journal Articles", { articles: filtered });
    revalidatePath("/journal");
    revalidatePath("/admin/content/blog");
    return res;
  } catch (error: any) {
    console.error("[DELETE_BLOG_ARTICLE_ERROR]", error);
    return { success: false, error: error.message };
  }
}
