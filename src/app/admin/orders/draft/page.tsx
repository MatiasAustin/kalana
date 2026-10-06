import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { DraftOrdersList } from "@/components/admin/DraftOrdersList";

export default async function DraftOrdersPage() {
  const draftOrders = await db.query.orders.findMany({
    where: eq(orders.status, "DRAFT"),
    with: {
      customer: true,
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  }).catch((err) => {
    console.error("Failed to load draft orders:", err);
    return [];
  });

  return (
    <div className="max-w-7xl mx-auto">
      <DraftOrdersList initialOrders={draftOrders as any} />
    </div>
  );
}
