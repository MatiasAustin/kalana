"use server";

import { db } from "@/lib/db";
import { products, productVariants, productMedia } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type CreateProductInput = {
  name: string;
  slug: string;
  description?: string;
  blend?: string;
  roast?: string;
  tastingNotes?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  variants: {
    id?: string;
    name: string;
    sku: string;
    price: number;
    weight: number;
  }[];
  mediaIds: string[];
};

export async function createProduct(data: CreateProductInput) {
  try {
    await requireAdminApi();

    const productId = uuidv4();
    
    // Create product
    await db.insert(products).values({
      id: productId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      blend: data.blend,
      roast: data.roast,
      tastingNotes: data.tastingNotes,
      status: data.status,
    });

    // Create variants
    if (data.variants && data.variants.length > 0) {
      const variantsToInsert = data.variants.map((v) => ({
        id: uuidv4(),
        productId,
        name: v.name,
        sku: v.sku,
        price: v.price,
        weight: v.weight,
        status: 'ACTIVE',
      }));
      await db.insert(productVariants).values(variantsToInsert);
    }

    // Link media
    if (data.mediaIds && data.mediaIds.length > 0) {
      const mediaToInsert = data.mediaIds.map((mediaId, idx) => ({
        id: uuidv4(),
        productId,
        mediaId,
        sortOrder: idx,
        isPrimary: idx === 0,
      }));
      await db.insert(productMedia).values(mediaToInsert);
    }

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    
    return { success: true, id: productId };
  } catch (error: any) {
    console.error("[CREATE_PRODUCT_ERROR]", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdminApi();

    // In a real production environment with order history, we should SOFT delete or check for existing orders.
    // For now, we'll hard delete the relations then the product.
    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.delete(productMedia).where(eq(productMedia.productId, productId));
    await db.delete(products).where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_PRODUCT_ERROR]", error);
    return { success: false, error: "Failed to delete product. It may be linked to existing orders." };
  }
}
