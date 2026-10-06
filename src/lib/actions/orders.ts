"use server";

import { db } from "@/lib/db";
import { orders, orderItems, customers, addresses, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAdminApi } from "@/lib/auth";

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await requireAdminApi();

    await db.update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders/draft");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    await requireAdminApi();

    const updatePayload: any = {
      paymentStatus,
      updatedAt: new Date(),
    };

    // If marked as PAID and order is still PENDING or DRAFT, advance to PROCESSING
    if (paymentStatus === "PAID") {
      const current = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });
      if (current && (current.status === "PENDING" || current.status === "DRAFT")) {
        updatePayload.status = "PROCESSING";
      }
    }

    await db.update(orders)
      .set(updatePayload)
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders/draft");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_PAYMENT_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to update payment status" };
  }
}

export async function updateFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: string,
  trackingCourier?: string,
  trackingNumber?: string
) {
  try {
    await requireAdminApi();

    const current = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    let newNotes = current?.notes || "";
    if (trackingCourier || trackingNumber) {
      const trackingTag = `[SHIPMENT] Courier: ${trackingCourier || "-"} | Tracking/Resi: ${trackingNumber || "-"}`;
      if (newNotes.includes("[SHIPMENT]")) {
        newNotes = newNotes.replace(/\[SHIPMENT\][^\n]*/g, trackingTag);
      } else {
        newNotes = newNotes ? `${newNotes}\n${trackingTag}` : trackingTag;
      }
    }

    const updatePayload: any = {
      fulfillmentStatus,
      notes: newNotes,
      updatedAt: new Date(),
    };

    if (fulfillmentStatus === "FULFILLED" && current?.paymentStatus === "PAID") {
      updatePayload.status = "COMPLETED";
    }

    await db.update(orders)
      .set(updatePayload)
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_FULFILLMENT_STATUS_ERROR]", error);
    return { success: false, error: error.message || "Failed to update fulfillment status" };
  }
}

export async function updateOrderNotes(orderId: string, notes: string) {
  try {
    await requireAdminApi();

    await db.update(orders)
      .set({
        notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_ORDER_NOTES_ERROR]", error);
    return { success: false, error: error.message || "Failed to update notes" };
  }
}

export interface CreateDraftOrderInput {
  customerId?: string;
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  items: Array<{
    productId?: string;
    variantId?: string;
    productNameSnapshot: string;
    variantNameSnapshot: string;
    skuSnapshot?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingCost?: number;
  discount?: number;
  notes?: string;
  status?: "DRAFT" | "PENDING" | "PROCESSING";
  paymentStatus?: "UNPAID" | "PAID";
}

export async function createDraftOrder(input: CreateDraftOrderInput) {
  try {
    await requireAdminApi();

    if (!input.items || input.items.length === 0) {
      throw new Error("Order must contain at least 1 item");
    }

    let customerId = input.customerId || null;
    let addressId: string | null = null;

    // Handle Customer Creation or Lookup
    if (!customerId && input.customerData?.email) {
      const existingCustomer = await db.query.customers.findFirst({
        where: eq(customers.email, input.customerData.email.trim().toLowerCase()),
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        customerId = uuidv4();
        await db.insert(customers).values({
          id: customerId,
          email: input.customerData.email.trim().toLowerCase(),
          firstName: input.customerData.firstName || "",
          lastName: input.customerData.lastName || "",
          phone: input.customerData.phone || "",
          customerType: "RETAIL",
        });
      }
    }

    // Create shipping address if customer and address provided
    if (customerId && input.customerData?.address1) {
      addressId = uuidv4();
      await db.insert(addresses).values({
        id: addressId,
        customerId,
        type: "SHIPPING",
        firstName: input.customerData.firstName || "",
        lastName: input.customerData.lastName || "",
        address1: input.customerData.address1,
        city: input.customerData.city || "Jakarta",
        province: input.customerData.province || "DKI Jakarta",
        zip: input.customerData.zip || "10110",
        country: input.customerData.country || "Indonesia",
        phone: input.customerData.phone || "",
      });
    }

    // Calculate financials
    const subtotal = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const shippingCost = Number(input.shippingCost) || 0;
    const discount = Number(input.discount) || 0;
    const total = Math.max(0, subtotal + shippingCost - discount);

    const orderId = uuidv4();
    const orderNumber = `KAL-${Date.now().toString().slice(-6)}`;
    const orderStatus = input.status || "DRAFT";
    const orderPaymentStatus = input.paymentStatus || "UNPAID";

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerId,
      status: orderStatus,
      paymentStatus: orderPaymentStatus,
      fulfillmentStatus: "UNFULFILLED",
      subtotal,
      shippingCost,
      discount,
      total,
      currency: "IDR",
      shippingAddressId: addressId,
      billingAddressId: addressId,
      notes: input.notes || "",
      paymentProvider: "MANUAL",
    });

    const itemsToInsert = input.items.map(item => ({
      id: uuidv4(),
      orderId,
      productId: item.productId || null,
      variantId: item.variantId || null,
      productNameSnapshot: item.productNameSnapshot,
      variantNameSnapshot: item.variantNameSnapshot || "Default",
      skuSnapshot: item.skuSnapshot || "",
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      subtotal: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    }));

    await db.insert(orderItems).values(itemsToInsert);

    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/draft");
    revalidatePath("/admin");

    return {
      success: true,
      orderId,
      orderNumber,
    };
  } catch (error: any) {
    console.error("[CREATE_DRAFT_ORDER_ERROR]", error);
    return { success: false, error: error.message || "Failed to create draft order" };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await requireAdminApi();

    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/draft");
    revalidatePath("/admin/orders/abandoned");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_ORDER_ERROR]", error);
    return { success: false, error: error.message || "Failed to delete order" };
  }
}
