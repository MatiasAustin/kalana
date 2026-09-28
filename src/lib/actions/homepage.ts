"use server";

import { db } from "@/lib/db";
import { homepageSections } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function updateHomepageSections(sections: any[]) {
  try {
    await requireAdminApi();

    // Delete all current sections
    await db.delete(homepageSections);
    
    // Insert new ones
    if (sections && sections.length > 0) {
      const sectionsToInsert = sections.map((sec, idx) => ({
        id: sec.id || uuidv4(),
        type: sec.type,
        sortOrder: idx,
        isEnabled: sec.isEnabled,
        data: typeof sec.data === 'string' ? sec.data : JSON.stringify(sec.data)
      }));
      await db.insert(homepageSections).values(sectionsToInsert);
    }

    revalidatePath("/");
    revalidatePath("/admin/content/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_HOMEPAGE_ERROR]", error);
    return { success: false, error: error.message };
  }
}
