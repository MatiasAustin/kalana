import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("[MAYAR_WEBHOOK_RECEIVED]", JSON.stringify(rawBody, null, 2));

    const event = rawBody.event;
    const data = rawBody.data || rawBody;

    // Check if event is payment.received or transactionStatus SUCCESS / paid
    const isPaymentSuccess =
      event === "payment.received" ||
      data.status === "paid" ||
      data.status === "PAID" ||
      data.transactionStatus === "SUCCESS" ||
      data.transactionStatus === "SETTLED";

    if (!isPaymentSuccess) {
      return NextResponse.json({
        received: true,
        message: `Ignored event: ${event || data.status}`,
      });
    }

    // 1. Try matching order by orderNumber extracted from description or name
    let matchedOrder: any = null;
    const descText = `${data.description || ""} ${data.name || ""} ${data.item || ""}`;
    const orderNumberMatch = descText.match(/KAL-[0-9A-Za-z_-]+/);

    if (orderNumberMatch) {
      const orderNumber = orderNumberMatch[0];
      matchedOrder = await db.query.orders.findFirst({
        where: eq(orders.orderNumber, orderNumber),
      });
    }

    // 2. Try matching by paymentToken (transactionId or payment link id)
    if (!matchedOrder && (data.transactionId || data.id)) {
      const token = data.transactionId || data.id;
      matchedOrder = await db.query.orders.findFirst({
        where: or(
          eq(orders.paymentToken, token),
          eq(orders.id, token)
        ),
      });
    }

    // 3. Fallback: match latest pending/unpaid order with matching customer email
    if (!matchedOrder && (data.customerEmail || data.email)) {
      const email = data.customerEmail || data.email;
      const amount = Number(data.amount) || Number(data.totalAmount);

      const candidates = await db.query.orders.findMany({
        where: eq(orders.paymentStatus, "UNPAID"),
        orderBy: [desc(orders.createdAt)],
        limit: 5,
        with: { customer: true },
      });

      matchedOrder = candidates.find((o) => {
        const emailMatch = o.customer?.email?.toLowerCase() === email.toLowerCase();
        const amountMatch = amount ? Math.abs(o.total - amount) < 1000 : true;
        return emailMatch && amountMatch;
      });
    }

    if (matchedOrder) {
      await db
        .update(orders)
        .set({
          paymentStatus: "PAID",
          status: matchedOrder.status === "PENDING" ? "PROCESSING" : matchedOrder.status,
          paymentProvider: "MAYAR",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, matchedOrder.id));

      console.log(`[MAYAR_WEBHOOK_PROCESSED] Order ${matchedOrder.orderNumber} updated to PAID.`);

      return NextResponse.json({
        success: true,
        orderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        status: "PAID",
      });
    }

    console.warn("[MAYAR_WEBHOOK_ORDER_NOT_FOUND] No matching order found for payload:", data);
    return NextResponse.json({
      received: true,
      matched: false,
      message: "Payment received notification recorded but order not found",
    });
  } catch (error: any) {
    console.error("[MAYAR_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow GET to verify webhook endpoint availability
export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "MAYAR",
    service: "KALANA Space & Roastery Webhook Endpoint",
    timestamp: new Date().toISOString(),
  });
}
