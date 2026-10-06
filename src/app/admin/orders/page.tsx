import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, ne } from "drizzle-orm";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function OrdersPage() {
  // Query all non-draft orders (draft orders have their own dedicated section)
  const allOrders = await db.query.orders.findMany({
    where: ne(orders.status, "DRAFT"),
    with: {
      customer: true,
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  }).catch((err) => {
    console.error("Failed to load orders:", err);
    return [];
  });

  return (
    <div className="max-w-7xl mx-auto">
      <OrdersTable initialOrders={allOrders as any} />
    </div>
  );
}
