"use server";

import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function savePageContent(slug: string, title: string, data: any) {
  try {
    await requireAdminApi();

    const existing = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, slug)
    }).catch(() => null);

    const stringData = typeof data === "string" ? data : JSON.stringify(data);

    if (existing) {
      await db.update(sitePages)
        .set({
          title,
          data: stringData,
          updatedAt: new Date()
        })
        .where(eq(sitePages.slug, slug));
    } else {
      await db.insert(sitePages).values({
        id: uuidv4(),
        slug,
        title,
        data: stringData,
        updatedAt: new Date()
      });
    }

    revalidatePath(`/${slug}`);
    revalidatePath(`/p/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/content/pages");
    revalidatePath("/admin/content/announcements");
    revalidatePath("/admin/content/blog");
    revalidatePath("/journal");

    return { success: true };
  } catch (error: any) {
    console.error("[SAVE_PAGE_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function deletePage(slug: string) {
  try {
    await requireAdminApi();

    await db.delete(sitePages).where(eq(sitePages.slug, slug));

    revalidatePath(`/p/${slug}`);
    revalidatePath(`/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/content/pages");

    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_PAGE_ERROR]", error);
    return { success: false, error: error.message || "Failed to delete page" };
  }
}
