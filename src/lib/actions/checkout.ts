"use server";

import { db } from "@/lib/db";
import { products, productVariants, orders, orderItems, customers, addresses, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

export async function processCheckout(
  formData: any,
  cartItems: any[],
  appliedDiscount?: { code: string; amount: number } | null
) {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const { userId } = await auth();

    // 1. Fetch secure prices from DB
    const variantIds = cartItems.map(item => item.variantId);
    
    // We need to find variants and their parent products
    const dbVariants = await db.query.productVariants.findMany({
      where: inArray(productVariants.id, variantIds),
      with: {
        product: true
      }
    });

    if (dbVariants.length !== variantIds.length) {
      throw new Error("Some items in the cart are no longer available.");
    }

    // 2. Calculate subtotal securely
    let subtotal = 0;
    const finalItems = cartItems.map(item => {
      const dbVariant = dbVariants.find(v => v.id === item.variantId);
      if (!dbVariant) throw new Error("Variant not found");
      
      const itemSubtotal = dbVariant.price * item.quantity;
      subtotal += itemSubtotal;
      
      return {
        productId: dbVariant.productId,
        variantId: dbVariant.id,
        quantity: item.quantity,
        unitPrice: dbVariant.price,
        subtotal: itemSubtotal,
        productNameSnapshot: dbVariant.product?.name || "Unknown Product",
        variantNameSnapshot: dbVariant.name,
        skuSnapshot: dbVariant.sku,
      };
    });

    // Shipping & discount calculation
    const shippingCost = appliedDiscount && appliedDiscount.code === "FREESHIP" ? 0 : 25000;
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
      return { success: true, orderId, orderNumber };
    }

  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    return { success: false, error: error.message || "Failed to process checkout" };
  }
}
