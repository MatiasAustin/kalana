import { db } from "@/lib/db";
import {
  users,
  customers,
  addresses,
  productVariants,
  inventory,
  orders,
  orderItems,
  reviews,
  products
} from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function seedAnalyticsData() {
  console.log("Starting seed for Analytics demonstration data...");

  // 1. Fetch available products and variants
  const allProducts = await db.query.products.findMany({
    with: { variants: true }
  });

  if (allProducts.length === 0) {
    console.error("No products found! Please ensure products exist first.");
    return;
  }

  const dhProduct = allProducts.find(p => p.slug === "daily-house") || allProducts[0];
  const dcProduct = allProducts.find(p => p.slug === "daily-crema") || allProducts[1] || allProducts[0];

  const variants = await db.query.productVariants.findMany();
  console.log(`Found ${allProducts.length} products and ${variants.length} variants.`);

  // 2. Initialize inventory if empty
  for (const variant of variants) {
    const existingInv = await db.query.inventory.findFirst({
      where: eq(inventory.variantId, variant.id)
    });
    if (!existingInv) {
      await db.insert(inventory).values({
        id: uuidv4(),
        variantId: variant.id,
        available: variant.sku?.includes("1000") ? 35 : 60,
        reserved: 2,
        committed: 5,
        incoming: 20,
        updatedAt: new Date(),
      });
      console.log(`Initialized inventory for variant ${variant.sku}`);
    }
  }

  // 3. Seed Customers
  const customerList = [
    {
      firstName: "Aditya",
      lastName: "Pratama",
      email: "aditya.pratama@gmail.com",
      phone: "+6281234567890",
      customerType: "RETAIL",
      city: "Jakarta Selatan",
      country: "Indonesia",
    },
    {
      firstName: "Siti",
      lastName: "Rahmawati",
      email: "siti.rahma@yahoo.com",
      phone: "+6281398765432",
      customerType: "RETAIL",
      city: "Bandung",
      country: "Indonesia",
    },
    {
      firstName: "Dimas",
      lastName: "Setiawan",
      email: "dimas.coffee@kopi-senja.id",
      phone: "+6281122334455",
      customerType: "WHOLESALE",
      businessName: "Kopi Senja Collective",
      businessType: "CAFE",
      monthlyCoffeeRequirement: "25kg",
      city: "Karawang",
      country: "Indonesia",
    },
    {
      firstName: "Maya",
      lastName: "Indrawati",
      email: "maya.indrawati@outlook.com",
      phone: "+6285612345678",
      customerType: "RETAIL",
      city: "Cikampek",
      country: "Indonesia",
    },
    {
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi.santoso@artisanroast.com",
      phone: "+6281789012345",
      customerType: "WHOLESALE",
      businessName: "Ruang Seduh Harian",
      businessType: "CAFE",
      monthlyCoffeeRequirement: "40kg",
      city: "Bekasi",
      country: "Indonesia",
    },
    {
      firstName: "Clarissa",
      lastName: "Wijaya",
      email: "clarissa.wijaya@gmail.com",
      phone: "+6281987654321",
      customerType: "RETAIL",
      city: "Surabaya",
      country: "Indonesia",
    },
    {
      firstName: "Rian",
      lastName: "Hidayat",
      email: "rian.hidayat@morningritual.co",
      phone: "+6282134567812",
      customerType: "RETAIL",
      city: "Jakarta Barat",
      country: "Indonesia",
    },
    {
      firstName: "Nadia",
      lastName: "Kusuma",
      email: "nadia.kusuma@gmail.com",
      phone: "+6287890123456",
      customerType: "RETAIL",
      city: "Tangerang",
      country: "Indonesia",
    }
  ];

  const createdCustomers: any[] = [];
  for (const c of customerList) {
    let existing = await db.query.customers.findFirst({
      where: eq(customers.email, c.email)
    });
    if (!existing) {
      const custId = uuidv4();
      await db.insert(customers).values({
        id: custId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        customerType: c.customerType,
        businessName: c.businessName || null,
        businessType: c.businessType || null,
        monthlyCoffeeRequirement: c.monthlyCoffeeRequirement || null,
        city: c.city,
        country: c.country,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 45) * 86400000),
        updatedAt: new Date(),
      });
      existing = await db.query.customers.findFirst({ where: eq(customers.id, custId) });
    }
    if (existing) {
      createdCustomers.push(existing);
    }
  }
  console.log(`Ready with ${createdCustomers.length} customers.`);

  // 4. Seed Orders across past 30 days
  const now = Date.now();
  const dayMs = 86400000;

  // Let's create around 24 realistic orders distributed over the last 30 days
  const orderConfigs = [
    { daysAgo: 29, custIdx: 0, items: [{ vIdx: 0, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 27, custIdx: 1, items: [{ vIdx: 2, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 26, custIdx: 2, items: [{ vIdx: 1, qty: 3 }, { vIdx: 3, qty: 2 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 50000 },
    { daysAgo: 24, custIdx: 3, items: [{ vIdx: 0, qty: 2 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 25000 },
    { daysAgo: 22, custIdx: 4, items: [{ vIdx: 1, qty: 4 }, { vIdx: 3, qty: 3 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 20, custIdx: 5, items: [{ vIdx: 2, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 18, custIdx: 6, items: [{ vIdx: 0, qty: 1 }, { vIdx: 2, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 20000 },
    { daysAgo: 16, custIdx: 0, items: [{ vIdx: 1, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 15, custIdx: 7, items: [{ vIdx: 2, qty: 2 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 13, custIdx: 1, items: [{ vIdx: 3, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 25000 },
    { daysAgo: 12, custIdx: 2, items: [{ vIdx: 1, qty: 5 }, { vIdx: 3, qty: 4 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 100000 },
    { daysAgo: 10, custIdx: 3, items: [{ vIdx: 0, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 9, custIdx: 5, items: [{ vIdx: 2, qty: 2 }, { vIdx: 0, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 30000 },
    { daysAgo: 8, custIdx: 6, items: [{ vIdx: 1, qty: 2 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 7, custIdx: 4, items: [{ vIdx: 1, qty: 4 }, { vIdx: 3, qty: 4 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 50000 },
    { daysAgo: 6, custIdx: 7, items: [{ vIdx: 0, qty: 2 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 0 },
    { daysAgo: 5, custIdx: 0, items: [{ vIdx: 3, qty: 1 }], status: "COMPLETED", payment: "PAID", fulfillment: "FULFILLED", discount: 25000 },
    { daysAgo: 4, custIdx: 1, items: [{ vIdx: 2, qty: 1 }], status: "PROCESSING", payment: "PAID", fulfillment: "UNFULFILLED", discount: 0 },
    { daysAgo: 3, custIdx: 3, items: [{ vIdx: 0, qty: 3 }], status: "PROCESSING", payment: "PAID", fulfillment: "UNFULFILLED", discount: 0 },
    { daysAgo: 2, custIdx: 2, items: [{ vIdx: 1, qty: 3 }, { vIdx: 3, qty: 2 }], status: "PROCESSING", payment: "PAID", fulfillment: "UNFULFILLED", discount: 50000 },
    { daysAgo: 2, custIdx: 6, items: [{ vIdx: 2, qty: 1 }], status: "CANCELLED", payment: "REFUNDED", fulfillment: "UNFULFILLED", discount: 0 },
    { daysAgo: 1, custIdx: 5, items: [{ vIdx: 1, qty: 1 }], status: "PENDING", payment: "UNPAID", fulfillment: "UNFULFILLED", discount: 0 },
    { daysAgo: 0, custIdx: 7, items: [{ vIdx: 0, qty: 2 }, { vIdx: 2, qty: 1 }], status: "PROCESSING", payment: "PAID", fulfillment: "UNFULFILLED", discount: 20000 },
    { daysAgo: 0, custIdx: 4, items: [{ vIdx: 1, qty: 2 }], status: "PENDING", payment: "UNPAID", fulfillment: "UNFULFILLED", discount: 0 },
  ];

  const existingOrders = await db.query.orders.findMany({ limit: 1 });
  if (existingOrders.length === 0) {
    console.log("Seeding historical orders...");
    let orderNumSeq = 1001;

    for (const cfg of orderConfigs) {
      const cust = createdCustomers[cfg.custIdx % createdCustomers.length];
      const orderDate = new Date(now - cfg.daysAgo * dayMs - Math.floor(Math.random() * 3600000 * 8));
      const orderId = uuidv4();
      const orderNumber = `KLN-${orderNumSeq++}`;

      let subtotal = 0;
      const orderItemsToInsert: any[] = [];

      for (const it of cfg.items) {
        const variant = variants[it.vIdx % variants.length];
        const product = variant.productId === dhProduct.id ? dhProduct : dcProduct;
        const lineSubtotal = variant.price * it.qty;
        subtotal += lineSubtotal;

        orderItemsToInsert.push({
          id: uuidv4(),
          orderId,
          productId: product.id,
          variantId: variant.id,
          productNameSnapshot: product.name,
          variantNameSnapshot: variant.name,
          skuSnapshot: variant.sku,
          quantity: it.qty,
          unitPrice: variant.price,
          subtotal: lineSubtotal,
        });
      }

      const shippingCost = cfg.discount === 25000 ? 0 : 25000; // if free ship code, 0, else 25k
      const total = Math.max(0, subtotal + shippingCost - cfg.discount);

      await db.insert(orders).values({
        id: orderId,
        orderNumber,
        customerId: cust.id,
        status: cfg.status,
        paymentStatus: cfg.payment,
        fulfillmentStatus: cfg.fulfillment,
        subtotal,
        shippingCost,
        discount: cfg.discount,
        total,
        currency: "IDR",
        notes: "Automated test order with realistic telemetry",
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      for (const oi of orderItemsToInsert) {
        await db.insert(orderItems).values(oi);
      }
    }

    console.log(`Seeded ${orderConfigs.length} orders and order items successfully!`);
  } else {
    console.log(`Orders already exist (${existingOrders.length} found). Skipping order seed.`);
  }

  // 5. Seed Reviews if empty
  const existingReviews = await db.query.reviews.findMany({ limit: 1 });
  if (existingReviews.length === 0) {
    await db.insert(reviews).values([
      {
        id: uuidv4(),
        productId: dhProduct.id,
        authorName: "Rian Hidayat",
        rating: 5,
        title: "Kopi harian terbaik untuk espresso!",
        content: "Blend Daily House sangat seimbang, crema tebal dan aroma coklat kacangnya pas banget buat piccolo & latte.",
        status: "APPROVED",
        isFeatured: true,
        createdAt: new Date(now - 14 * dayMs),
      },
      {
        id: uuidv4(),
        productId: dcProduct.id,
        authorName: "Maya Indrawati",
        rating: 5,
        title: "Smooth, clean, and delicious",
        content: "Daily Crema punya acidity yang pas dan manis karamelnya keluar banget saat diseduh manual brew maupun cold brew.",
        status: "APPROVED",
        isFeatured: true,
        createdAt: new Date(now - 7 * dayMs),
      },
      {
        id: uuidv4(),
        productId: dhProduct.id,
        authorName: "Dimas (Kopi Senja)",
        rating: 5,
        title: "Sangat konsisten untuk operasional cafe",
        content: "Sudah restock berkali-kali untuk house blend cafe kami. Roasting profile sangat stabil.",
        status: "APPROVED",
        isFeatured: false,
        createdAt: new Date(now - 3 * dayMs),
      }
    ]);
    console.log("Seeded customer reviews successfully!");
  }

  console.log("Analytics data seeding complete!");
}

seedAnalyticsData().catch(console.error);
