import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ExternalLink, CreditCard, Truck, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { users, customers, orders, siteSettings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";

export default async function CustomerOrdersPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }

  // Find the customer internal ID & settings
  const [internalUser, settings] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.clerkUserId, userId)
    }),
    db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global")
    }).catch(() => null)
  ]);

  const mayarPaymeUrl = settings?.mayarPaymeUrl || "https://mayar.to/kalanaspaceroastery";
  const customerPortalUrl = settings?.mayarCustomerPortalUrl || "https://kalanaspaceroastery.myr.id/portal";

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
    <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-24 min-h-screen">
      <Link href="/account" className="inline-flex items-center text-[10px] tracking-widest uppercase text-kalana-black/60 hover:text-kalana-black mb-8 sm:mb-12">
        <ArrowLeft className="w-3 h-3 mr-2" />
        Back to Account
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter uppercase mb-2">Order History</h1>
          <p className="text-sm text-kalana-black/60">View and track your past orders.</p>
        </div>

        {/* Mayar Customer Portal Button */}
        <a
          href={customerPortalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-kalana-black text-black hover:bg-black hover:text-white rounded-sm text-xs font-semibold tracking-widest uppercase transition-all shadow-sm self-start sm:self-auto"
        >
          Portal Pelanggan Mayar <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

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
          {customerOrders.map(order => {
            const isUnpaid = order.paymentStatus === 'UNPAID';
            const payUrl = order.paymentUrl || mayarPaymeUrl;

            return (
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] tracking-widest uppercase rounded-full ${
                      order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`px-3 py-1 text-[10px] tracking-widest uppercase rounded-full ${
                      order.fulfillmentStatus === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.fulfillmentStatus}
                    </span>

                    {/* Live Tracking Map Button */}
                    <Link
                      href={`/tracking/${order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-sm text-[10px] font-semibold tracking-widest uppercase transition-colors"
                    >
                      <Truck className="w-3 h-3 text-amber-400" />
                      Lacak Peta Live
                    </Link>

                    {/* Pay Button for Unpaid Orders */}
                    {isUnpaid && order.status !== 'CANCELLED' && (
                      <a
                        href={payUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-gray-800 rounded-sm text-[10px] font-semibold tracking-widest uppercase transition-colors"
                      >
                        <CreditCard className="w-3 h-3" />
                        Bayar via Mayar ↗
                      </a>
                    )}

                    {/* Cancel Order Button */}
                    {order.status === 'CANCELLED' ? (
                      <span className="px-3 py-1 text-[10px] tracking-widest uppercase rounded-full bg-red-100 text-red-800 font-semibold">
                        Dibatalkan
                      </span>
                    ) : (
                      order.fulfillmentStatus !== 'FULFILLED' && (
                        <CancelOrderButton orderNumber={order.orderNumber} variant="outline" />
                      )
                    )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

