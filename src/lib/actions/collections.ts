"use server";

import { db } from "@/lib/db";
import { collections, collectionProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth";

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description?: string;
  status?: "ACTIVE" | "DRAFT";
  coverMediaId?: string;
  productIds?: string[];
}

export async function createCollection(data: CreateCollectionInput) {
  try {
    await requireAdminApi();

    const collectionId = uuidv4();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.insert(collections).values({
      id: collectionId,
      name: data.name.trim(),
      slug,
      description: data.description || "",
      status: data.status || "ACTIVE",
      coverMediaId: data.coverMediaId || null,
    });

    if (data.productIds && data.productIds.length > 0) {
      const inserts = data.productIds.map((productId, idx) => ({
        id: uuidv4(),
        collectionId,
        productId,
        sortOrder: idx,
      }));
      await db.insert(collectionProducts).values(inserts);
    }

    revalidatePath("/admin/products/collections");
    revalidatePath("/roastery");
    revalidatePath("/roastery/collection/" + slug);

    return { success: true, id: collectionId };
  } catch (error: any) {
    console.error("[CREATE_COLLECTION_ERROR]", error);
    return { success: false, error: error.message || "Failed to create collection" };
  }
}

export async function updateCollection(id: string, data: CreateCollectionInput) {
  try {
    await requireAdminApi();

    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.update(collections)
      .set({
        name: data.name.trim(),
        slug,
        description: data.description || "",
        status: data.status || "ACTIVE",
        coverMediaId: data.coverMediaId || null,
      })
      .where(eq(collections.id, id));

    // Recreate products association
    await db.delete(collectionProducts).where(eq(collectionProducts.collectionId, id));

    if (data.productIds && data.productIds.length > 0) {
      const inserts = data.productIds.map((productId, idx) => ({
        id: uuidv4(),
        collectionId: id,
        productId,
        sortOrder: idx,
      }));
      await db.insert(collectionProducts).values(inserts);
    }

    revalidatePath("/admin/products/collections");
    revalidatePath("/roastery");
    revalidatePath("/roastery/collection/" + slug);

    return { success: true, id };
  } catch (error: any) {
    console.error("[UPDATE_COLLECTION_ERROR]", error);
    return { success: false, error: error.message || "Failed to update collection" };
  }
}

export async function deleteCollection(id: string) {
  try {
    await requireAdminApi();

    await db.delete(collectionProducts).where(eq(collectionProducts.collectionId, id));
    await db.delete(collections).where(eq(collections.id, id));

    revalidatePath("/admin/products/collections");
    revalidatePath("/roastery");

    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_COLLECTION_ERROR]", error);
    return { success: false, error: error.message || "Failed to delete collection" };
  }
}

export async function toggleCollectionStatus(id: string, currentStatus: string) {
  try {
    await requireAdminApi();

    const newStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    await db.update(collections).set({ status: newStatus }).where(eq(collections.id, id));

    revalidatePath("/admin/products/collections");
    return { success: true };
  } catch (error: any) {
    console.error("[TOGGLE_COLLECTION_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to toggle status" };
  }
}
