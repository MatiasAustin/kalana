import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { db } from "@/lib/db";
import { users, customers, orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function CustomerOrdersPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }

  // Find the customer internal ID
  const internalUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  });

  let customerOrders: any[] = [];

  if (internalUser) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, internalUser.id)
    });

    if (customer) {
      customerOrders = await db.query.orders.findMany({
        where: eq(orders.customerId, customer.id),
        with: {
          items: true,
        },
        orderBy: [desc(orders.createdAt)]
      });
    }
  }

  return (
    <div className="container mx-auto px-6 py-32 min-h-screen">
      <Link href="/account" className="inline-flex items-center text-[10px] tracking-widest uppercase text-kalana-black/60 hover:text-kalana-black mb-12">
        <ArrowLeft className="w-3 h-3 mr-2" />
        Back to Account
      </Link>

      <h1 className="text-4xl font-semibold tracking-tighter uppercase mb-2">Order History</h1>
      <p className="text-sm text-kalana-black/60 mb-12">View and track your past orders.</p>

      {customerOrders.length === 0 ? (
        <div className="border border-kalana-black/10 py-24 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-kalana-black/20 mb-4" />
          <h2 className="text-lg font-medium tracking-wide uppercase mb-2">No orders yet</h2>
          <p className="text-sm text-kalana-black/50 max-w-md mb-8">You haven't placed any orders. Discover our roastery collection.</p>
          <Link href="/roastery" className="px-8 py-3 bg-kalana-black text-kalana-offwhite text-[10px] tracking-widest uppercase hover:bg-black/80">
            Shop Roastery
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {customerOrders.map(order => (
            <div key={order.id} className="border border-kalana-black/20 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-kalana-black/10 pb-6 mb-6 gap-6">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-kalana-black/50 mb-1">Order Number</p>
                  <p className="font-medium tracking-wide">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-kalana-black/50 mb-1">Date</p>
                  <p className="font-medium tracking-wide">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-kalana-black/50 mb-1">Total</p>
                  <p className="font-medium tracking-wide">IDR {order.total.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-4">
                  <span className={`px-3 py-1 text-[10px] tracking-widest uppercase rounded-full ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-kalana-black/10 text-kalana-black'
                  }`}>
                    {order.paymentStatus}
                  </span>
                  <span className={`px-3 py-1 text-[10px] tracking-widest uppercase rounded-full ${
                    order.fulfillmentStatus === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-kalana-black/60">{item.quantity}x</span>
                      <div>
                        <p className="font-medium">{item.productNameSnapshot}</p>
                        <p className="text-[10px] tracking-widest uppercase text-kalana-black/50">{item.variantNameSnapshot}</p>
                      </div>
                    </div>
                    <p className="font-medium">IDR {item.subtotal.toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
