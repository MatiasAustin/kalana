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

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings/store");
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
    
    const validLinks = (links || []).filter(
      (link) => link.platform && link.platform.trim() && link.url && link.url.trim()
    );

    if (validLinks.length > 0) {
      const linksToInsert = validLinks.map((link, idx) => ({
        id: uuidv4(),
        platform: link.platform.trim(),
        url: link.url.trim(),
        isActive: link.isActive !== false,
        sortOrder: idx
      }));
      await db.insert(socialLinks).values(linksToInsert);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings/store");
    revalidatePath("/admin/content/navigation");
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
    revalidatePath("/space");
    revalidatePath("/contact");
    revalidatePath("/admin/space/location");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_LOCATION_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentSettings(data: {
  activePaymentGateway: string;
  mayarApiKey?: string;
  mayarPaymeUrl?: string;
  mayarCustomerPortalUrl?: string;
  dokuClientId?: string;
  dokuSecretKey?: string;
}) {
  try {
    await requireAdminApi();

    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 'global')
    });

    const payload = {
      activePaymentGateway: data.activePaymentGateway || 'MAYAR',
      mayarApiKey: data.mayarApiKey ? data.mayarApiKey.trim() : null,
      mayarPaymeUrl: data.mayarPaymeUrl ? data.mayarPaymeUrl.trim() : null,
      mayarCustomerPortalUrl: data.mayarCustomerPortalUrl ? data.mayarCustomerPortalUrl.trim() : null,
      dokuClientId: data.dokuClientId ? data.dokuClientId.trim() : null,
      dokuSecretKey: data.dokuSecretKey ? data.dokuSecretKey.trim() : null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(siteSettings)
        .set(payload)
        .where(eq(siteSettings.id, 'global'));
    } else {
      await db.insert(siteSettings).values({
        id: 'global',
        ...payload,
      });
    }

    revalidatePath('/admin/settings/payments');
    revalidatePath('/checkout');
    revalidatePath('/account/orders');
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_PAYMENT_SETTINGS_ERROR]", error);
    return { success: false, error: error.message };
  }
}


