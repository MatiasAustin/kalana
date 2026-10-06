import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, and, eq, ne } from "drizzle-orm";
import { AbandonedCheckoutsClient } from "@/components/admin/AbandonedCheckoutsClient";

export default async function AbandonedCheckoutsPage() {
  // Query orders that were initiated with status PENDING and UNPAID (abandoned before payment)
  const abandonedOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.status, "PENDING"),
      eq(orders.paymentStatus, "UNPAID")
    ),
    with: {
      customer: true,
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  }).catch((err) => {
    console.error("Failed to load abandoned checkouts:", err);
    return [];
  });

  return (
    <div className="max-w-7xl mx-auto">
      <AbandonedCheckoutsClient initialCheckouts={abandonedOrders as any} />
    </div>
  );
}
