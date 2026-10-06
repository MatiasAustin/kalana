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
    revalidatePath("/");
    revalidatePath("/product/" + data.slug);
    
    return { success: true, id: productId };
  } catch (error: any) {
    console.error("[CREATE_PRODUCT_ERROR]", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdminApi();

    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.delete(productMedia).where(eq(productMedia.productId, productId));
    await db.delete(products).where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_PRODUCT_ERROR]", error);
    return { success: false, error: "Failed to delete product. It may be linked to existing orders." };
  }
}

export async function updateProduct(id: string, data: CreateProductInput) {
  try {
    await requireAdminApi();

    await db.update(products)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description,
        blend: data.blend,
        roast: data.roast,
        tastingNotes: data.tastingNotes,
        status: data.status,
      })
      .where(eq(products.id, id));

    const existingVariants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, id)
    });

    for (const v of data.variants) {
      if (v.id && !v.id.startsWith('new-')) {
        await db.update(productVariants).set({
          name: v.name,
          sku: v.sku,
          price: v.price,
          weight: v.weight,
        }).where(eq(productVariants.id, v.id));
      } else {
        await db.insert(productVariants).values({
          id: uuidv4(),
          productId: id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          weight: v.weight,
          status: 'ACTIVE',
        });
      }
    }

    const inputVariantIds = data.variants.map(v => v.id).filter(vid => vid && !vid.startsWith('new-'));
    const variantsToDelete = existingVariants.filter(ev => !inputVariantIds.includes(ev.id));
    for (const v of variantsToDelete) {
      await db.delete(productVariants).where(eq(productVariants.id, v.id));
    }

    // Recreate media associations
    await db.delete(productMedia).where(eq(productMedia.productId, id));
    if (data.mediaIds && data.mediaIds.length > 0) {
      const mediaToInsert = data.mediaIds.map((mediaId, idx) => ({
        id: uuidv4(),
        productId: id,
        mediaId,
        sortOrder: idx,
        isPrimary: idx === 0,
      }));
      await db.insert(productMedia).values(mediaToInsert);
    }

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    revalidatePath("/");
    revalidatePath("/product/" + data.slug);
    
    return { success: true, id };
  } catch (error: any) {
    console.error("[UPDATE_PRODUCT_ERROR]", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function updateProductStatus(id: string, status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  try {
    await requireAdminApi();

    await db.update(products).set({ status }).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_PRODUCT_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

export async function bulkUpdateProductStatus(ids: string[], status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  try {
    await requireAdminApi();

    for (const id of ids) {
      await db.update(products).set({ status }).where(eq(products.id, id));
    }

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("[BULK_UPDATE_PRODUCT_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to bulk update status" };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    await requireAdminApi();

    for (const id of ids) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      await db.delete(productMedia).where(eq(productMedia.productId, id));
      await db.delete(products).where(eq(products.id, id));
    }

    revalidatePath("/admin/products");
    revalidatePath("/roastery");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("[BULK_DELETE_PRODUCTS_ERROR]", error);
    return { success: false, error: "Failed to delete selected products." };
  }
}

export async function duplicateProduct(id: string) {
  try {
    await requireAdminApi();

    const original = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        variants: true,
        media: true,
      },
    });

    if (!original) throw new Error("Product not found");

    const newProductId = uuidv4();
    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newName = `${original.name} (Copy)`;

    await db.insert(products).values({
      id: newProductId,
      name: newName,
      slug: newSlug,
      description: original.description,
      blend: original.blend,
      roast: original.roast,
      tastingNotes: original.tastingNotes,
      status: "DRAFT",
    });

    if (original.variants && original.variants.length > 0) {
      const copyVariants = original.variants.map((v) => ({
        id: uuidv4(),
        productId: newProductId,
        name: v.name,
        sku: v.sku ? `${v.sku}-COPY` : null,
        price: v.price,
        weight: v.weight,
        status: v.status,
      }));
      await db.insert(productVariants).values(copyVariants);
    }

    if (original.media && original.media.length > 0) {
      const copyMedia = original.media.map((pm, idx) => ({
        id: uuidv4(),
        productId: newProductId,
        mediaId: pm.mediaId,
        sortOrder: idx,
        isPrimary: idx === 0,
      }));
      await db.insert(productMedia).values(copyMedia);
    }

    revalidatePath("/admin/products");

    return { success: true, newId: newProductId };
  } catch (error: any) {
    console.error("[DUPLICATE_PRODUCT_ERROR]", error);
    return { success: false, error: error.message || "Failed to duplicate product" };
  }
}
