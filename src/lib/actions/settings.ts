"use server";

import { db } from "@/lib/db";
import { siteSettings, locations, socialLinks } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function updateSiteSettings(data: any) {
  try {
    await requireAdminApi();

    // Check if global settings exist
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 'global')
    });

    if (existing) {
      await db.update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, 'global'));
    } else {
      await db.insert(siteSettings).values({
        id: 'global',
        ...data
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SETTINGS_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function updateSocialLinks(links: any[]) {
  try {
    await requireAdminApi();

    // Delete all current and insert new (simple sync)
    await db.delete(socialLinks);
    
    if (links && links.length > 0) {
      const linksToInsert = links.map((link, idx) => ({
        id: uuidv4(),
        platform: link.platform,
        url: link.url,
        isActive: link.isActive,
        sortOrder: idx
      }));
      await db.insert(socialLinks).values(linksToInsert);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SOCIAL_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrimaryLocation(data: any) {
  try {
    await requireAdminApi();

    const existing = await db.query.locations.findFirst({
      where: eq(locations.isPrimary, true)
    });

    if (existing) {
      await db.update(locations)
        .set(data)
        .where(eq(locations.id, existing.id));
    } else {
      await db.insert(locations).values({
        id: uuidv4(),
        isPrimary: true,
        ...data
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_LOCATION_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentSettings(data: { activePaymentGateway: string, mayarApiKey: string, dokuClientId: string, dokuSecretKey: string }) { try { await requireAdminApi(); await db.insert(siteSettings).values({ id: 'global', ...data }).onConflictDoUpdate({ target: siteSettings.id, set: data }); revalidatePath('/admin/settings/payments'); return { success: true }; } catch (error: any) { return { success: false, error: error.message }; } }

