import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { OrderDetailClient } from "@/components/admin/OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      customer: true,
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  }).catch((err) => {
    console.error("Failed to load order:", err);
    return null;
  });

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4 font-mono">
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <h1 className="text-xl font-bold text-gray-900">Order Not Found</h1>
        <p className="text-xs text-gray-500">The order you requested does not exist or has been deleted.</p>
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-xs hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetailClient order={order} />;
}
