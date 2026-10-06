import { db } from "@/lib/db";
import { products, customers } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { DraftOrderBuilder } from "@/components/admin/DraftOrderBuilder";

export default async function NewDraftOrderPage() {
  const [allProducts, allCustomers] = await Promise.all([
    db.query.products.findMany({
      with: {
        variants: true,
      },
      orderBy: [asc(products.name)],
    }).catch(() => []),
    db.query.customers.findMany({
      orderBy: [asc(customers.firstName)],
    }).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <DraftOrderBuilder 
        products={allProducts as any} 
        customers={allCustomers as any} 
      />
    </div>
  );
}
