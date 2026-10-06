import { db } from "@/lib/db";
import { collections, products } from "@/lib/db/schema";
import { desc, asc } from "drizzle-orm";
import { CollectionsManager } from "@/components/admin/CollectionsManager";

export default async function CollectionsPage() {
  const [allCollections, allProducts] = await Promise.all([
    db.query.collections.findMany({
      with: {
        products: true,
      },
      orderBy: [desc(collections.createdAt)],
    }).catch(() => []),
    db.query.products.findMany({
      orderBy: [asc(products.name)],
    }).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <CollectionsManager 
        initialCollections={allCollections as any} 
        allProducts={allProducts as any} 
      />
    </div>
  );
}
