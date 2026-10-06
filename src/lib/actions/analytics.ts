"use server";

import { db } from "@/lib/db";
import { orders, orderItems, customers, products, events, reviews, sitePages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export interface AnalyticsTimelinePoint {
  date: string;
  label: string;
  revenue: number;
  netRevenue: number;
  ordersCount: number;
  unitsSold: number;
}

export interface TopProductMetric {
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitsSold: number;
  totalRevenue: number;
  percentageShare: number;
}

export interface CustomerSegmentMetric {
  type: string;
  customerCount: number;
  ordersCount: number;
  totalRevenue: number;
  percentageShare: number;
}

export interface TopCustomerMetric {
  id: string;
  name: string;
  email: string;
  customerType: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface AnalyticsData {
  timeRange: string;
  periodLabel: string;
  comparisonLabel: string;
  
  // KPI Metrics
  kpis: {
    grossSales: number;
    prevGrossSales: number;
    grossSalesGrowth: number;
    
    netSales: number;
    prevNetSales: number;
    netSalesGrowth: number;

    totalOrders: number;
    prevTotalOrders: number;
    totalOrdersGrowth: number;

    averageOrderValue: number;
    prevAverageOrderValue: number;
    aovGrowth: number;

    unitsSold: number;
    prevUnitsSold: number;
    unitsSoldGrowth: number;

    totalCustomers: number;
    newCustomersInPeriod: number;
    repeatCustomerRate: number;

    totalDiscounts: number;
    totalShipping: number;
  };

  // Timeline / Charts
  timeline: AnalyticsTimelinePoint[];

  // Top Products & Variants
  topProducts: TopProductMetric[];

  // Sales by Blend / Product Family
  salesByBlend: {
    name: string;
    unitsSold: number;
    revenue: number;
    percentageShare: number;
  }[];

  // Order Pipeline Distribution
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];

  paymentStatusDistribution: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];

  fulfillmentStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];

  // Customer Analytics
  customerSegments: CustomerSegmentMetric[];
  topCustomers: TopCustomerMetric[];

  // Space & Workshops
  spaceMetrics: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalCapacity: number;
    estimatedRevenue: number;
  };

  // Marketing & Discounts
  marketingMetrics: {
    activeDiscountsCount: number;
    totalDiscountRedemptions: number;
    totalDiscountAmount: number;
  };
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function getTimestamp(val: any): number {
  if (!val) return 0;
  if (val instanceof Date) return val.getTime();
  if (typeof val === "number") {
    // If Unix timestamp in seconds, convert to ms
    return val < 10000000000 ? val * 1000 : val;
  }
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export async function getAnalyticsData(timeRange: string = "30d"): Promise<AnalyticsData> {
  const now = new Date();
  const nowMs = now.getTime();
  const dayMs = 86400000;

  let days = 30;
  let periodLabel = "Last 30 Days";
  let comparisonLabel = "vs Previous 30 Days";

  if (timeRange === "7d") {
    days = 7;
    periodLabel = "Last 7 Days";
    comparisonLabel = "vs Previous 7 Days";
  } else if (timeRange === "90d") {
    days = 90;
    periodLabel = "Last 90 Days";
    comparisonLabel = "vs Previous 90 Days";
  } else if (timeRange === "year") {
    days = 365;
    periodLabel = "This Year (365 Days)";
    comparisonLabel = "vs Previous Year";
  } else if (timeRange === "all") {
    days = 730; // 2 years window
    periodLabel = "All Time";
    comparisonLabel = "vs Prior Period";
  }

  const currentCutoffMs = nowMs - days * dayMs;
  const prevCutoffMs = currentCutoffMs - days * dayMs;

  // 1. Fetch Orders with Customer and Items
  const allOrders = await db.query.orders.findMany({
    with: {
      customer: true,
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  }).catch((err) => {
    console.error("Failed to query orders for analytics:", err);
    return [];
  });

  // 2. Fetch Customers
  const allCustomers = await db.query.customers.findMany({
    with: {
      orders: true,
    },
  }).catch((err) => {
    console.error("Failed to query customers for analytics:", err);
    return [];
  });

  // 3. Fetch Space Events
  const allEvents = await db.query.events.findMany().catch((err) => {
    console.error("Failed to query events for analytics:", err);
    return [];
  });

  // 4. Fetch Marketing Discounts
  let discountsList: any[] = [];
  try {
    const discountsRow = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, "marketing_discounts"),
    });
    if (discountsRow?.data) {
      discountsList = JSON.parse(discountsRow.data);
    }
  } catch (err) {
    console.error("Failed to query marketing discounts:", err);
  }

  // Segment Orders into Current Period and Previous Period
  const currentOrders: any[] = [];
  const prevOrders: any[] = [];

  for (const o of allOrders) {
    const oTime = getTimestamp(o.createdAt);
    if (timeRange === "all" || (oTime >= currentCutoffMs && oTime <= nowMs)) {
      currentOrders.push(o);
    } else if (oTime >= prevCutoffMs && oTime < currentCutoffMs) {
      prevOrders.push(o);
    }
  }

  // Calculate Current Period Financials
  let grossSales = 0;
  let netSales = 0;
  let totalDiscounts = 0;
  let totalShipping = 0;
  let unitsSold = 0;

  for (const o of currentOrders) {
    grossSales += o.total || 0;
    totalDiscounts += o.discount || 0;
    totalShipping += o.shippingCost || 0;

    if (o.status !== "CANCELLED" && o.paymentStatus !== "REFUNDED") {
      netSales += (o.subtotal || 0);
    }

    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        unitsSold += item.quantity || 0;
      }
    }
  }

  // Calculate Previous Period Financials
  let prevGrossSales = 0;
  let prevNetSales = 0;
  let prevUnitsSold = 0;

  for (const o of prevOrders) {
    prevGrossSales += o.total || 0;
    if (o.status !== "CANCELLED" && o.paymentStatus !== "REFUNDED") {
      prevNetSales += (o.subtotal || 0);
    }
    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        prevUnitsSold += item.quantity || 0;
      }
    }
  }

  const totalOrders = currentOrders.length;
  const prevTotalOrders = prevOrders.length;

  const averageOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;
  const prevAverageOrderValue = prevTotalOrders > 0 ? Math.round(prevGrossSales / prevTotalOrders) : 0;

  // Customer Metrics
  let newCustomersInPeriod = 0;
  for (const c of allCustomers) {
    const cTime = getTimestamp(c.createdAt);
    if (timeRange === "all" || (cTime >= currentCutoffMs && cTime <= nowMs)) {
      newCustomersInPeriod++;
    }
  }

  // Repeat customer rate
  const customersWithOrdersCount = allCustomers.filter((c) => (c.orders?.length || 0) > 0).length;
  const repeatCustomersCount = allCustomers.filter((c) => (c.orders?.length || 0) > 1).length;
  const repeatCustomerRate = customersWithOrdersCount > 0
    ? Math.round((repeatCustomersCount / customersWithOrdersCount) * 100)
    : 0;

  // Timeline points generator
  const timeline: AnalyticsTimelinePoint[] = [];
  const numBuckets = days <= 7 ? 7 : days <= 30 ? 15 : 12;
  const bucketDuration = (days * dayMs) / numBuckets;

  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = currentCutoffMs + i * bucketDuration;
    const bucketEnd = bucketStart + bucketDuration;
    const bucketDate = new Date(bucketStart);

    let bRevenue = 0;
    let bNetRevenue = 0;
    let bOrdersCount = 0;
    let bUnitsSold = 0;

    for (const o of currentOrders) {
      const oTime = getTimestamp(o.createdAt);
      if (oTime >= bucketStart && oTime < bucketEnd) {
        bRevenue += o.total || 0;
        if (o.status !== "CANCELLED" && o.paymentStatus !== "REFUNDED") {
          bNetRevenue += o.subtotal || 0;
        }
        bOrdersCount++;
        if (o.items) {
          for (const item of o.items) {
            bUnitsSold += item.quantity || 0;
          }
        }
      }
    }

    const label = days <= 7
      ? bucketDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
      : days <= 30
      ? bucketDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : bucketDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    timeline.push({
      date: bucketDate.toISOString().split("T")[0],
      label,
      revenue: bRevenue,
      netRevenue: bNetRevenue,
      ordersCount: bOrdersCount,
      unitsSold: bUnitsSold,
    });
  }

  // Top Products & Variants Aggregation
  const productMap: Record<string, {
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    unitsSold: number;
    totalRevenue: number;
  }> = {};

  for (const o of currentOrders) {
    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        const key = `${item.productId || "unknown"}_${item.skuSnapshot || item.variantNameSnapshot || "standard"}`;
        if (!productMap[key]) {
          productMap[key] = {
            productId: item.productId || "",
            productName: item.productNameSnapshot || "Product",
            variantName: item.variantNameSnapshot || "",
            sku: item.skuSnapshot || "-",
            unitsSold: 0,
            totalRevenue: 0,
          };
        }
        productMap[key].unitsSold += item.quantity || 0;
        productMap[key].totalRevenue += item.subtotal || 0;
      }
    }
  }

  const totalProductRevenue = Object.values(productMap).reduce((sum, p) => sum + p.totalRevenue, 0) || 1;
  const topProducts: TopProductMetric[] = Object.values(productMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((p) => ({
      ...p,
      percentageShare: Math.round((p.totalRevenue / totalProductRevenue) * 100),
    }));

  // Sales by Blend / Product Family
  const blendMap: Record<string, { unitsSold: number; revenue: number }> = {};
  for (const p of Object.values(productMap)) {
    const blendName = p.productName || "Other";
    if (!blendMap[blendName]) {
      blendMap[blendName] = { unitsSold: 0, revenue: 0 };
    }
    blendMap[blendName].unitsSold += p.unitsSold;
    blendMap[blendName].revenue += p.totalRevenue;
  }

  const salesByBlend = Object.entries(blendMap)
    .map(([name, data]) => ({
      name,
      unitsSold: data.unitsSold,
      revenue: data.revenue,
      percentageShare: Math.round((data.revenue / totalProductRevenue) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Order Status Distribution
  const statusCounts: Record<string, number> = {
    COMPLETED: 0,
    PROCESSING: 0,
    PENDING: 0,
    CANCELLED: 0,
  };
  for (const o of currentOrders) {
    const st = (o.status || "PENDING").toUpperCase();
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  }
  const orderStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }));

  // Payment Status Distribution
  const paymentCounts: Record<string, { count: number; amount: number }> = {
    PAID: { count: 0, amount: 0 },
    UNPAID: { count: 0, amount: 0 },
    REFUNDED: { count: 0, amount: 0 },
  };
  for (const o of currentOrders) {
    const pay = (o.paymentStatus || "UNPAID").toUpperCase();
    if (!paymentCounts[pay]) paymentCounts[pay] = { count: 0, amount: 0 };
    paymentCounts[pay].count += 1;
    paymentCounts[pay].amount += (o.total || 0);
  }
  const paymentStatusDistribution = Object.entries(paymentCounts).map(([status, data]) => ({
    status,
    count: data.count,
    amount: data.amount,
    percentage: totalOrders > 0 ? Math.round((data.count / totalOrders) * 100) : 0,
  }));

  // Fulfillment Status Distribution
  const fulfillmentCounts: Record<string, number> = {
    FULFILLED: 0,
    PARTIALLY_FULFILLED: 0,
    UNFULFILLED: 0,
  };
  for (const o of currentOrders) {
    const ful = (o.fulfillmentStatus || "UNFULFILLED").toUpperCase();
    fulfillmentCounts[ful] = (fulfillmentCounts[ful] || 0) + 1;
  }
  const fulfillmentStatusDistribution = Object.entries(fulfillmentCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }));

  // Customer Segments (Retail vs Wholesale vs Cafe)
  const segmentMap: Record<string, { count: number; orders: number; revenue: number }> = {
    RETAIL: { count: 0, orders: 0, revenue: 0 },
    WHOLESALE: { count: 0, orders: 0, revenue: 0 },
  };
  for (const c of allCustomers) {
    const seg = (c.customerType || "RETAIL").toUpperCase();
    if (!segmentMap[seg]) {
      segmentMap[seg] = { count: 0, orders: 0, revenue: 0 };
    }
    segmentMap[seg].count += 1;
  }
  for (const o of currentOrders) {
    const seg = (o.customer?.customerType || "RETAIL").toUpperCase();
    if (!segmentMap[seg]) {
      segmentMap[seg] = { count: 0, orders: 0, revenue: 0 };
    }
    segmentMap[seg].orders += 1;
    segmentMap[seg].revenue += (o.total || 0);
  }

  const customerSegments: CustomerSegmentMetric[] = Object.entries(segmentMap).map(([type, data]) => ({
    type,
    customerCount: data.count,
    ordersCount: data.orders,
    totalRevenue: data.revenue,
    percentageShare: grossSales > 0 ? Math.round((data.revenue / grossSales) * 100) : 0,
  }));

  // Top Customers
  const customerSpendMap: Record<string, {
    customer: any;
    ordersCount: number;
    totalSpent: number;
    lastOrderDate: Date;
  }> = {};

  for (const o of currentOrders) {
    if (o.customer) {
      const cid = o.customer.id;
      if (!customerSpendMap[cid]) {
        customerSpendMap[cid] = {
          customer: o.customer,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: o.createdAt ? new Date(getTimestamp(o.createdAt)) : new Date(),
        };
      }
      customerSpendMap[cid].ordersCount += 1;
      customerSpendMap[cid].totalSpent += (o.total || 0);
      const oDate = new Date(getTimestamp(o.createdAt));
      if (oDate > customerSpendMap[cid].lastOrderDate) {
        customerSpendMap[cid].lastOrderDate = oDate;
      }
    }
  }

  const topCustomers: TopCustomerMetric[] = Object.values(customerSpendMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((item) => ({
      id: item.customer.id,
      name: `${item.customer.firstName || ""} ${item.customer.lastName || ""}`.trim() || item.customer.businessName || "Customer",
      email: item.customer.email,
      customerType: item.customer.customerType || "RETAIL",
      ordersCount: item.ordersCount,
      totalSpent: item.totalSpent,
      lastOrderDate: item.lastOrderDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

  // Space & Workshops
  const upcomingEvents = allEvents.filter((e) => (e.status || "UPCOMING") === "UPCOMING").length;
  const completedEvents = allEvents.filter((e) => e.status === "COMPLETED").length;
  const totalCapacity = allEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const estimatedRevenue = allEvents.reduce((sum, e) => sum + (e.price || 0) * (e.capacity ? Math.floor(e.capacity * 0.8) : 5), 0);

  // Marketing & Discounts
  const activeDiscountsCount = discountsList.filter((d: any) => d.isActive).length;
  const totalDiscountRedemptions = discountsList.reduce((sum: number, d: any) => sum + (d.usedCount || 0), 0);
  const totalDiscountAmount = totalDiscounts;

  return {
    timeRange,
    periodLabel,
    comparisonLabel,
    kpis: {
      grossSales,
      prevGrossSales,
      grossSalesGrowth: calculateGrowth(grossSales, prevGrossSales),
      
      netSales,
      prevNetSales,
      netSalesGrowth: calculateGrowth(netSales, prevNetSales),

      totalOrders,
      prevTotalOrders,
      totalOrdersGrowth: calculateGrowth(totalOrders, prevTotalOrders),

      averageOrderValue,
      prevAverageOrderValue,
      aovGrowth: calculateGrowth(averageOrderValue, prevAverageOrderValue),

      unitsSold,
      prevUnitsSold,
      unitsSoldGrowth: calculateGrowth(unitsSold, prevUnitsSold),

      totalCustomers: allCustomers.length,
      newCustomersInPeriod,
      repeatCustomerRate,

      totalDiscounts,
      totalShipping,
    },
    timeline,
    topProducts,
    salesByBlend,
    orderStatusDistribution,
    paymentStatusDistribution,
    fulfillmentStatusDistribution,
    customerSegments,
    topCustomers,
    spaceMetrics: {
      totalEvents: allEvents.length,
      upcomingEvents,
      completedEvents,
      totalCapacity,
      estimatedRevenue,
    },
    marketingMetrics: {
      activeDiscountsCount,
      totalDiscountRedemptions,
      totalDiscountAmount,
    },
  };
}

export async function exportAnalyticsCSV(timeRange: string = "30d"): Promise<string> {
  const data = await getAnalyticsData(timeRange);

  const headers = [
    "Date",
    "Label",
    "Revenue (IDR)",
    "Net Revenue (IDR)",
    "Orders Count",
    "Units Sold",
  ];

  const rows = data.timeline.map((point) => [
    `"${point.date}"`,
    `"${point.label}"`,
    point.revenue,
    point.netRevenue,
    point.ordersCount,
    point.unitsSold,
  ]);

  const summary = [
    "",
    "--- SUMMARY METRICS ---",
    `"Time Range","${data.periodLabel}"`,
    `"Gross Sales",${data.kpis.grossSales}`,
    `"Net Sales",${data.kpis.netSales}`,
    `"Total Orders",${data.kpis.totalOrders}`,
    `"Average Order Value",${data.kpis.averageOrderValue}`,
    `"Total Units Sold",${data.kpis.unitsSold}`,
    `"Total Discounts Given",${data.kpis.totalDiscounts}`,
    `"Total Shipping Collected",${data.kpis.totalShipping}`,
    `"Repeat Customer Rate","${data.kpis.repeatCustomerRate}%"`,
  ];

  return [headers.join(","), ...rows.map((r) => r.join(",")), ...summary].join("\n");
}
