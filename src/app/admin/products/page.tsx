import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function ProductsPage() {
  const allProducts = await db.query.products.findMany({
    with: {
      variants: true,
      media: {
        with: {
          media: true,
        },
      },
    },
    orderBy: [desc(products.createdAt)],
  }).catch((err) => {
    console.error("Failed to load products:", err);
    return [];
  });

  return (
    <div className="max-w-7xl mx-auto">
      <ProductsTable initialProducts={allProducts as any} />
    </div>
  );
}
