"use server";

import { db } from "@/lib/db";
import { orders, orderItems, customers, addresses, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAdminApi } from "@/lib/auth";
import { ensureDbSchema } from "@/lib/db/migrate-helper";
import { fetchBiteshipRealtimeTracking, normalizeCourierCode, generateIntelligentTrackingHistory } from "@/lib/shipping/biteship";

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

export interface UpdateShipmentInput {
  orderId: string;
  courier: string;
  courierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingStatus: string;
  currentLocation?: string;
  estimatedDeliveryDate?: string;
  newHistoryNote?: string;
}

export async function updateShipmentDetails(input: UpdateShipmentInput) {
  try {
    await requireAdminApi();
    await ensureDbSchema();

    const current = await db.query.orders.findFirst({
      where: eq(orders.id, input.orderId),
      with: { shippingAddress: true },
    });

    if (!current) {
      return { success: false, error: "Order not found" };
    }

    // Parse existing tracking history
    let history: any[] = [];
    if (current.trackingHistory) {
      try {
        history = JSON.parse(current.trackingHistory);
      } catch {}
    }

    // Auto-generate official tracking link if none provided
    let trackingUrl = input.trackingUrl;
    if (!trackingUrl && input.trackingNumber && input.courier) {
      const c = input.courier.toLowerCase();
      const num = encodeURIComponent(input.trackingNumber.trim());
      if (c.includes("jne")) {
        trackingUrl = `https://www.jne.co.id/tracking`;
      } else if (c.includes("j&t") || c.includes("jet")) {
        trackingUrl = `https://www.jet.co.id/track`;
      } else if (c.includes("sicepat")) {
        trackingUrl = `https://www.sicepat.com/checkAwb`;
      } else if (c.includes("anteraja")) {
        trackingUrl = `https://anteraja.id/tracking`;
      } else if (c.includes("lion")) {
        trackingUrl = `https://lionparcel.com/track`;
      } else if (c.includes("pos")) {
        trackingUrl = `https://www.posindonesia.co.id`;
      } else if (c.includes("id express")) {
        trackingUrl = `https://idexpress.com`;
      }
    }

    const statusTitles: Record<string, string> = {
      PENDING: "Pesanan Masuk (Menunggu Pengemasan)",
      PROCESSED: "Pesanan Selesai Dikemas di Roastery",
      PICKED_UP: `Paket Telah Diserahkan ke ${input.courier || "Kurir"}`,
      IN_TRANSIT: "Paket Sedang Dalam Perjalanan Antarkota",
      OUT_FOR_DELIVERY: "Paket Dibawa Kurir Menuju Alamat Penerima",
      DELIVERED: "Paket Berhasil Diterima oleh Pelanggan",
    };

    const isStatusChanged = current.shippingStatus !== input.shippingStatus;
    const isLocationChanged = input.currentLocation && input.currentLocation !== current.currentLocation;

    if (isStatusChanged || isLocationChanged || input.newHistoryNote || history.length === 0) {
      const defaultLoc = input.shippingStatus === "DELIVERED"
        ? (current.shippingAddress?.city || "Alamat Tujuan")
        : (input.currentLocation || "KALANA Roastery (Cikampek)");

      history.unshift({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        status: input.shippingStatus,
        title: statusTitles[input.shippingStatus] || input.shippingStatus,
        location: input.currentLocation || defaultLoc,
        note: input.newHistoryNote || (
          input.shippingStatus === "PICKED_UP"
            ? `Nomor Resi: ${input.trackingNumber || "-"}`
            : input.shippingStatus === "DELIVERED"
            ? "Paket telah diterima dengan baik. Terima kasih telah berbelanja di KALANA."
            : undefined
        )
      });
    }

    // Determine fulfillmentStatus
    let fulfillmentStatus = current.fulfillmentStatus;
    if (input.shippingStatus === "DELIVERED") {
      fulfillmentStatus = "FULFILLED";
    } else if (["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(input.shippingStatus)) {
      fulfillmentStatus = "FULFILLED";
    }

    let orderStatus = current.status;
    if (input.shippingStatus === "DELIVERED" && current.paymentStatus === "PAID") {
      orderStatus = "COMPLETED";
    } else if (input.shippingStatus !== "PENDING" && orderStatus === "PENDING") {
      orderStatus = "PROCESSING";
    }

    await db.update(orders)
      .set({
        courier: input.courier,
        courierService: input.courierService || null,
        trackingNumber: input.trackingNumber || null,
        trackingUrl: trackingUrl || null,
        shippingStatus: input.shippingStatus,
        currentLocation: input.currentLocation || null,
        estimatedDeliveryDate: input.estimatedDeliveryDate || null,
        trackingHistory: JSON.stringify(history),
        fulfillmentStatus,
        status: orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, input.orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.orderId}`);
    revalidatePath("/account/orders");
    revalidatePath(`/tracking/${current.orderNumber}`);

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SHIPMENT_ERROR]", error);
    return { success: false, error: error.message || "Gagal memperbarui pengiriman" };
  }
}

export async function getShipmentTracking(orderNumber: string) {
  try {
    await ensureDbSchema();

    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        shippingAddress: true,
        items: true,
        customer: true,
      },
    });

    if (!order) return null;

    let history: any[] = [];
    if (order.trackingHistory) {
      try {
        history = JSON.parse(order.trackingHistory);
      } catch {}
    }

    let shippingStatus = order.shippingStatus || "PENDING";
    let currentLocation = order.currentLocation;
    let courier = order.courier || "J&T Express";
    let courierService = order.courierService || "Reguler";
    let trackingNumber = order.trackingNumber;
    let isRealtimeBiteship = false;
    let biteshipDriver: any = null;
    let biteshipNotice: string | null = null;
    let biteshipErrorMsg: string | null = null;

    const courierCode = normalizeCourierCode(courier);
    let trackingUrl = order.trackingUrl;
    if (!trackingUrl && trackingNumber) {
      trackingUrl = `https://track.biteship.com/?waybill=${encodeURIComponent(trackingNumber)}&courier=${courierCode}`;
    }

    // Attempt Biteship Realtime Tracking if waybill (trackingNumber) is available
    if (trackingNumber && trackingNumber.trim().length > 3) {
      try {
        const biteshipData = await fetchBiteshipRealtimeTracking(trackingNumber, courier);
        if (biteshipData.success) {
          isRealtimeBiteship = true;
          if (biteshipData.status) {
            shippingStatus = biteshipData.status;
          }
          if (biteshipData.currentLocation) {
            currentLocation = biteshipData.currentLocation;
          }
          if (biteshipData.courierName) {
            courier = biteshipData.courierName;
          }
          if (biteshipData.trackingUrl) {
            trackingUrl = biteshipData.trackingUrl;
          }
          if (biteshipData.driver) {
            biteshipDriver = biteshipData.driver;
          }
          if (biteshipData.history && biteshipData.history.length > 0) {
            history = biteshipData.history;
          }
        } else {
          if (biteshipData.isInsufficientBalance) {
            biteshipNotice = "INSUFFICIENT_BALANCE";
            biteshipErrorMsg = "Biteship Live API memerlukan saldo deposit aktif di dashboard.biteship.com untuk menyinkronkan data resi ekspedisi secara instan.";
          } else if (biteshipData.error) {
            biteshipErrorMsg = biteshipData.error;
          }
          if (biteshipData.trackingUrl) {
            trackingUrl = biteshipData.trackingUrl;
          }
        }
      } catch (err) {
        console.warn("[BITESHIP_TRACKING_QUERY_WARNING]", err);
      }
    }

    // If live biteship data is not available yet, or history only has 1 old/mismatched static checkpoint:
    // Generate intelligent tailored history so that tracking is NEVER a broken static line!
    const destinationCity = order.shippingAddress?.city || "Alamat Penerima";
    const hasMismatchedStaticHistory =
      history.length <= 1 ||
      history.some((h) => h.title?.includes("JNE") && courier.includes("J&T"));

    if (!isRealtimeBiteship && hasMismatchedStaticHistory) {
      history = generateIntelligentTrackingHistory({
        orderNumber: order.orderNumber,
        trackingNumber,
        courierName: courier,
        courierService,
        originCity: "Cikampek",
        destinationCity,
        shippingStatus,
        createdAt: order.createdAt,
      });

      if (!currentLocation || currentLocation.includes("JNE")) {
        currentLocation = history[0]?.location || `KALANA Roastery (Cikampek)`;
      }
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      shippingStatus,
      courier,
      courierService,
      trackingNumber,
      trackingUrl,
      currentLocation,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      history,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      items: order.items,
      customer: order.customer,
      isRealtimeBiteship,
      biteshipDriver,
      biteshipNotice,
      biteshipErrorMsg,
      biteshipTrackingPortalUrl: trackingNumber
        ? `https://track.biteship.com/?waybill=${encodeURIComponent(trackingNumber)}&courier=${courierCode}`
        : "https://track.biteship.com",
    };
  } catch (error) {
    console.error("[GET_SHIPMENT_TRACKING_ERROR]", error);
    return null;
  }
}

export async function refreshShipmentTracking(orderNumber: string) {
  try {
    revalidatePath(`/tracking/${orderNumber}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui pelacakan" };
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

export async function cancelOrderCustomer(orderNumber: string) {
  try {
    await ensureDbSchema();

    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "Pesanan ini sudah dibatalkan sebelumnya." };
    }

    if (
      order.fulfillmentStatus === "FULFILLED" ||
      ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.shippingStatus || "")
    ) {
      return {
        success: false,
        error: "Pesanan sudah dalam proses pengiriman bersama kurir dan tidak dapat dibatalkan otomatis. Silakan hubungi customer support KALANA.",
      };
    }

    let history: any[] = [];
    if (order.trackingHistory) {
      try {
        history = JSON.parse(order.trackingHistory);
      } catch {}
    }

    history.unshift({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: "CANCELLED",
      title: "Pesanan Dibatalkan",
      location: "KALANA Roastery (Cikampek)",
      note: "Pesanan telah dibatalkan atas permintaan pelanggan.",
    });

    await db.update(orders)
      .set({
        status: "CANCELLED",
        shippingStatus: "CANCELLED",
        trackingHistory: JSON.stringify(history),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    revalidatePath(`/tracking/${orderNumber}`);
    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/checkout/success");

    return { success: true };
  } catch (error: any) {
    console.error("[CANCEL_ORDER_CUSTOMER_ERROR]", error);
    return { success: false, error: error.message || "Gagal membatalkan pesanan" };
  }
}
