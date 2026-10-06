import { db } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { InventoryManager } from "@/components/admin/InventoryManager";

export default async function InventoryPage() {
  const allVariants = await db.query.productVariants.findMany({
    with: {
      product: true,
      inventory: true,
    },
  }).catch((err) => {
    console.error("Failed to load inventory:", err);
    return [];
  });

  return (
    <div className="max-w-7xl mx-auto">
      <InventoryManager initialVariants={allVariants as any} />
    </div>
  );
}
