"use server";

import { db } from "@/lib/db";
import { inventory, inventoryMovements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/auth";

export async function updateInventoryStock(variantId: string, available: number, reason?: string) {
  try {
    const user = await requireAdminApi();

    const existing = await db.query.inventory.findFirst({
      where: eq(inventory.variantId, variantId),
    });

    const newStock = Math.max(0, Number(available) || 0);

    if (existing) {
      const diff = newStock - (existing.available || 0);
      await db.update(inventory)
        .set({
          available: newStock,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, existing.id));

      if (diff !== 0) {
        await db.insert(inventoryMovements).values({
          id: uuidv4(),
          variantId,
          userId: user.id,
          type: diff > 0 ? "RESTOCK" : "ADJUSTMENT",
          quantity: diff,
          reason: reason || "Manual stock adjustment in Admin",
        }).catch((e) => console.error("Movement log error:", e));
      }
    } else {
      await db.insert(inventory).values({
        id: uuidv4(),
        variantId,
        available: newStock,
        reserved: 0,
        committed: 0,
        incoming: 0,
        updatedAt: new Date(),
      });

      await db.insert(inventoryMovements).values({
        id: uuidv4(),
        variantId,
        userId: user.id,
        type: "RESTOCK",
        quantity: newStock,
        reason: reason || "Initial inventory setup",
      }).catch((e) => console.error("Movement log error:", e));
    }

    revalidatePath("/admin/products/inventory");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_INVENTORY_STOCK_ERROR]", error);
    return { success: false, error: error.message || "Failed to update inventory stock" };
  }
}

export async function bulkUpdateInventoryStock(adjustments: Array<{ variantId: string; available: number }>) {
  try {
    await requireAdminApi();

    for (const adj of adjustments) {
      await updateInventoryStock(adj.variantId, adj.available);
    }

    revalidatePath("/admin/products/inventory");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("[BULK_UPDATE_INVENTORY_ERROR]", error);
    return { success: false, error: error.message || "Failed to bulk update inventory" };
  }
}
