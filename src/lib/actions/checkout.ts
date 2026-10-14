"use server";

import { db } from "@/lib/db";
import { products, productVariants, orders, orderItems, customers, addresses, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { ensureDbSchema } from "@/lib/db/migrate-helper";

export async function processCheckout(
  formData: any,
  cartItems: any[],
  appliedDiscount?: { code: string; amount: number } | null,
  selectedCourier?: {
    courierName: string;
    serviceName: string;
    price: number;
    etd?: string;
  } | null
) {
  try {
    await ensureDbSchema();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Keranjang belanja kosong.");
    }

    const { userId } = await auth();

    // 1. Fetch & resolve variants securely (supports both variantId & legacy product+variant snapshots)
    let subtotal = 0;
    const finalItems = [];

    for (const item of cartItems) {
      let resolvedVariant: any = null;

      // Strategy A: By item.variantId if valid string
      if (item.variantId && typeof item.variantId === "string") {
        resolvedVariant = await db.query.productVariants.findFirst({
          where: eq(productVariants.id, item.variantId),
          with: { product: true },
        }).catch(() => null);
      }

      // Strategy B: If item.id matches a variant ID directly
      if (!resolvedVariant && item.id) {
        resolvedVariant = await db.query.productVariants.findFirst({
          where: eq(productVariants.id, item.id),
          with: { product: true },
        }).catch(() => null);
      }

      // Strategy C: If item.id is productId, find by (productId + variant name)
      if (!resolvedVariant && item.id) {
        if (item.variant) {
          resolvedVariant = await db.query.productVariants.findFirst({
            where: and(
              eq(productVariants.productId, item.id),
              eq(productVariants.name, item.variant)
            ),
            with: { product: true },
          }).catch(() => null);
        }

        // Strategy D: Fallback to first available variant of that product
        if (!resolvedVariant) {
          resolvedVariant = await db.query.productVariants.findFirst({
            where: eq(productVariants.productId, item.id),
            with: { product: true },
          }).catch(() => null);
        }
      }

      // Fallback unit price from database if available, else from cart snapshot
      const unitPrice = typeof resolvedVariant?.price === "number" ? resolvedVariant.price : (Number(item.price) || 0);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      finalItems.push({
        productId: resolvedVariant?.productId || item.id || "unknown_product",
        variantId: resolvedVariant?.id || item.variantId || item.id || "default_variant",
        quantity: qty,
        unitPrice,
        subtotal: itemSubtotal,
        productNameSnapshot: resolvedVariant?.product?.name || item.name || "Specialty Coffee",
        variantNameSnapshot: resolvedVariant?.name || item.variant || "Standard",
        skuSnapshot: resolvedVariant?.sku || null,
      });
    }

    // Shipping & discount calculation
    let baseShippingCost = 25000;
    if (selectedCourier && typeof selectedCourier.price === "number" && selectedCourier.price >= 0) {
      baseShippingCost = selectedCourier.price;
    }
    const shippingCost = appliedDiscount && appliedDiscount.code === "FREESHIP" ? 0 : baseShippingCost;
    const discountValue = appliedDiscount ? Number(appliedDiscount.amount || 0) : 0;
    const total = Math.max(0, subtotal + shippingCost - (appliedDiscount?.code === "FREESHIP" ? 0 : discountValue));

    // 3. Find or Create Customer
    let customerId = null;
    
    const dbCustomer = await db.query.customers.findFirst({
      where: eq(customers.email, formData.email)
    });

    if (dbCustomer) {
      customerId = dbCustomer.id;
      // Optionally link Clerk userId if this was a guest email but now they are logged in
      if (userId && !dbCustomer.userId) {
        // find user internal id
        const internalUser = await db.query.users.findFirst({
          where: eq(users.clerkUserId, userId)
        });
        if (internalUser) {
          await db.update(customers).set({ userId: internalUser.id }).where(eq(customers.id, customerId));
        }
      }
    } else {
      customerId = uuidv4();
      
      // If logged in, get internal user ID
      let internalUserId = null;
      if (userId) {
        const internalUser = await db.query.users.findFirst({
          where: eq(users.clerkUserId, userId)
        });
        if (internalUser) internalUserId = internalUser.id;
      }

      await db.insert(customers).values({
        id: customerId,
        userId: internalUserId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    }

    // 4. Create Shipping Address
    const addressId = uuidv4();
    await db.insert(addresses).values({
      id: addressId,
      customerId,
      type: 'SHIPPING',
      firstName: formData.firstName,
      lastName: formData.lastName,
      address1: formData.address1,
      address2: formData.address2 || "",
      city: formData.city,
      province: formData.province,
      zip: formData.zip,
      country: formData.country || 'Indonesia',
    });

    // 5. Create Order
    const orderId = uuidv4();
    const orderNumber = `KAL-${Date.now().toString().slice(-6)}`;
    
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerId,
      status: 'PENDING',
      paymentStatus: 'UNPAID', // In real life, redirect to Midtrans
      fulfillmentStatus: 'UNFULFILLED',
      subtotal,
      shippingCost,
      discount: discountValue,
      total,
      currency: 'IDR',
      shippingAddressId: addressId,
      billingAddressId: addressId,
      courier: selectedCourier?.courierName || 'JNE',
      courierService: selectedCourier?.serviceName || 'Reguler',
      shippingStatus: 'PENDING',
      currentLocation: 'Roastery Cikampek',
    });

    // 6. Create Order Items
    const itemsToInsert = finalItems.map(item => ({
      id: uuidv4(),
      orderId,
      ...item
    }));
    await db.insert(orderItems).values(itemsToInsert);

    // 7. Process Payment Gateway
    const paymentGateway = await import('@/lib/payments').then(m => m.getPaymentGateway());
    
    if (paymentGateway) {
      const paymentResult = await paymentGateway.createTransaction({
        orderId: orderId,
        orderNumber: orderNumber,
        amount: total,
        customerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        items: finalItems.map(item => ({
          id: item.variantId || item.productId || 'item',
          name: `${item.productNameSnapshot} - ${item.variantNameSnapshot}`,
          price: item.unitPrice,
          quantity: item.quantity
        }))
      });

      if (paymentResult.success && paymentResult.paymentToken) {
        // Update order with payment tokens
        await db.update(orders)
          .set({
            paymentProvider: paymentResult.provider,
            paymentToken: paymentResult.paymentToken,
            paymentUrl: paymentResult.paymentUrl,
          })
          .where(eq(orders.id, orderId));
      }

      return { 
        success: true, 
        orderId, 
        orderNumber, 
        paymentUrl: paymentResult.paymentUrl || `/checkout/success?order=${orderNumber}` 
      };
    } else {
      return { 
        success: true, 
        orderId, 
        orderNumber,
        paymentUrl: `/checkout/success?order=${orderNumber}`
      };
    }

  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    const msg = error?.message || "";
    const isTechnical = msg.includes("Failed query") || msg.includes("select") || msg.includes("insert") || msg.includes("SQL") || msg.includes("syntax") || msg.includes("table");
    const friendlyError = isTechnical
      ? "Mohon maaf, sistem sedang memperbarui data transaksi. Silakan coba klik Place Order kembali."
      : (msg || "Gagal memproses pesanan. Silakan coba kembali.");

    return { success: false, error: friendlyError };
  }
}
