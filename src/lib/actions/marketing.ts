"use server";

import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { savePageContent } from "./pages";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// ==========================================
// 1. DISCOUNTS & COUPONS
// ==========================================

export interface Discount {
  id: string;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number; // e.g. 10 (%) or 25000 (IDR)
  minOrderValue: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "DISABLED" | "EXPIRED";
  createdAt: string;
}

const DEFAULT_DISCOUNTS: Discount[] = [
  {
    id: "disc-1",
    code: "KALANA2026",
    description: "10% off on all bean orders over IDR 150,000",
    type: "PERCENTAGE",
    value: 10,
    minOrderValue: 150000,
    maxDiscount: 50000,
    maxUses: 100,
    usedCount: 14,
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    createdAt: "2026-10-01",
  },
  {
    id: "disc-2",
    code: "FREESHIP",
    description: "Free shipping across Java on orders over IDR 300,000",
    type: "FREE_SHIPPING",
    value: 25000,
    minOrderValue: 300000,
    maxUses: 500,
    usedCount: 42,
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    status: "ACTIVE",
    createdAt: "2026-10-01",
  },
  {
    id: "disc-3",
    code: "DAILYRITUAL",
    description: "IDR 20,000 off on Daily Blend purchases",
    type: "FIXED_AMOUNT",
    value: 20000,
    minOrderValue: 100000,
    maxUses: 200,
    usedCount: 28,
    startDate: "2026-09-15",
    endDate: "2026-10-31",
    status: "ACTIVE",
    createdAt: "2026-09-15",
  },
  {
    id: "disc-4",
    code: "WELCOME50",
    description: "IDR 50,000 discount voucher on orders above IDR 400,000",
    type: "FIXED_AMOUNT",
    value: 50000,
    minOrderValue: 400000,
    maxUses: 50,
    usedCount: 19,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
];

export async function getDiscounts(): Promise<Discount[]> {
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, "marketing_discounts"),
    });

    if (page && page.data) {
      const parsed = typeof page.data === "string" ? JSON.parse(page.data) : page.data;
      if (Array.isArray(parsed.discounts)) {
        return parsed.discounts;
      }
    }
  } catch (err) {
    console.warn("[GET_DISCOUNTS_FALLBACK]", err);
  }

  return DEFAULT_DISCOUNTS;
}

export async function upsertDiscount(discount: Discount) {
  try {
    await requireAdminApi();
    const discounts = await getDiscounts();

    let updatedDiscounts: Discount[];
    const exists = discounts.some((d) => d.id === discount.id || d.code.toUpperCase() === discount.code.toUpperCase());

    const cleanDiscount: Discount = {
      ...discount,
      code: discount.code.trim().toUpperCase(),
      id: discount.id || `disc-${Date.now()}`,
      createdAt: discount.createdAt || new Date().toISOString().split("T")[0],
      usedCount: Number(discount.usedCount || 0),
    };

    if (exists) {
      updatedDiscounts = discounts.map((d) =>
        d.id === cleanDiscount.id || d.code.toUpperCase() === cleanDiscount.code.toUpperCase() ? cleanDiscount : d
      );
    } else {
      updatedDiscounts = [cleanDiscount, ...discounts];
    }

    const res = await savePageContent("marketing_discounts", "Marketing Discounts", { discounts: updatedDiscounts });
    revalidatePath("/admin/marketing/discounts");
    return res;
  } catch (error: any) {
    console.error("[UPSERT_DISCOUNT_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDiscount(id: string) {
  try {
    await requireAdminApi();
    const discounts = await getDiscounts();
    const filtered = discounts.filter((d) => d.id !== id);

    const res = await savePageContent("marketing_discounts", "Marketing Discounts", { discounts: filtered });
    revalidatePath("/admin/marketing/discounts");
    return res;
  } catch (error: any) {
    console.error("[DELETE_DISCOUNT_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function validateDiscountCode(
  rawCode: string,
  subtotal: number
): Promise<{ valid: boolean; discount?: Discount; discountAmount?: number; error?: string }> {
  try {
    if (!rawCode || !rawCode.trim()) {
      return { valid: false, error: "Please enter a discount code" };
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const discounts = await getDiscounts();
    const found = discounts.find((d) => d.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, error: "Invalid discount code" };
    }

    if (found.status !== "ACTIVE") {
      return { valid: false, error: `Discount code is ${found.status.toLowerCase()}` };
    }

    if (found.endDate && new Date(found.endDate) < new Date(new Date().toISOString().split("T")[0])) {
      return { valid: false, error: "Discount code has expired" };
    }

    if (found.minOrderValue && subtotal < found.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value of IDR ${Number(found.minOrderValue).toLocaleString("id-ID")} required`,
      };
    }

    if (found.maxUses && found.usedCount >= found.maxUses) {
      return { valid: false, error: "Discount code usage limit reached" };
    }

    let discountAmount = 0;
    if (found.type === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * found.value) / 100);
      if (found.maxDiscount && discountAmount > found.maxDiscount) {
        discountAmount = found.maxDiscount;
      }
    } else if (found.type === "FIXED_AMOUNT") {
      discountAmount = Math.min(found.value, subtotal);
    } else if (found.type === "FREE_SHIPPING") {
      discountAmount = 25000; // Standard shipping cost in KALANA
    }

    return {
      valid: true,
      discount: found,
      discountAmount,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || "Failed to validate code" };
  }
}

// ==========================================
// 2. MARKETING CAMPAIGNS
// ==========================================

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  goal: string; // "Seasonal Sales", "Acquisition", "Event Promotion", "Brand Awareness"
  status: "ACTIVE" | "SCHEDULED" | "ENDED" | "DRAFT";
  startDate: string;
  endDate: string;
  budget: number;
  revenue: number;
  channels: string[]; // ["Instagram", "TikTok", "Newsletter", "WhatsApp"]
  targetUrl: string; // e.g. "/roastery"
  utmSource: string; // e.g. "instagram"
  utmMedium: string; // e.g. "bio-link"
  utmCampaign: string; // e.g. "harvest_2026"
  notes?: string;
  createdAt: string;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "Harvest Drop 2026",
    slug: "harvest-drop-2026",
    goal: "Seasonal Sales",
    status: "ACTIVE",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    budget: 3500000,
    revenue: 14250000,
    channels: ["Instagram", "TikTok", "Newsletter"],
    targetUrl: "/roastery",
    utmSource: "instagram",
    utmMedium: "bio-link",
    utmCampaign: "harvest_drop_2026",
    notes: "New natural anaerobic microlot release campaign featured in roastery stories.",
    createdAt: "2026-10-01",
  },
  {
    id: "camp-2",
    name: "Weekend Cupping Class Promo",
    slug: "weekend-cupping-promo",
    goal: "Event Promotion",
    status: "ACTIVE",
    startDate: "2026-10-05",
    endDate: "2026-10-26",
    budget: 1000000,
    revenue: 4800000,
    channels: ["WhatsApp", "Instagram"],
    targetUrl: "/space/workshops",
    utmSource: "whatsapp",
    utmMedium: "broadcast",
    utmCampaign: "cupping_oct2026",
    notes: "Direct WhatsApp community blast to invite members to barista cupping workshop.",
    createdAt: "2026-10-05",
  },
  {
    id: "camp-3",
    name: "Free Shipping Java Promo",
    slug: "free-shipping-java",
    goal: "Acquisition",
    status: "ACTIVE",
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    budget: 2000000,
    revenue: 9600000,
    channels: ["Announcement Bar", "Newsletter"],
    targetUrl: "/roastery",
    utmSource: "storefront",
    utmMedium: "announcement-bar",
    utmCampaign: "free_shipping_java",
    notes: "Top notification bar promotion code KALANA2026 for free shipping over IDR 300K.",
    createdAt: "2026-10-01",
  },
];

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, "marketing_campaigns"),
    });

    if (page && page.data) {
      const parsed = typeof page.data === "string" ? JSON.parse(page.data) : page.data;
      if (Array.isArray(parsed.campaigns)) {
        return parsed.campaigns;
      }
    }
  } catch (err) {
    console.warn("[GET_CAMPAIGNS_FALLBACK]", err);
  }

  return DEFAULT_CAMPAIGNS;
}

export async function upsertCampaign(campaign: Campaign) {
  try {
    await requireAdminApi();
    const campaigns = await getCampaigns();

    const cleanCampaign: Campaign = {
      ...campaign,
      slug: campaign.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      id: campaign.id || `camp-${Date.now()}`,
      createdAt: campaign.createdAt || new Date().toISOString().split("T")[0],
      budget: Number(campaign.budget || 0),
      revenue: Number(campaign.revenue || 0),
    };

    let updatedCampaigns: Campaign[];
    const exists = campaigns.some((c) => c.id === cleanCampaign.id || c.slug === cleanCampaign.slug);

    if (exists) {
      updatedCampaigns = campaigns.map((c) =>
        c.id === cleanCampaign.id || c.slug === cleanCampaign.slug ? cleanCampaign : c
      );
    } else {
      updatedCampaigns = [cleanCampaign, ...campaigns];
    }

    const res = await savePageContent("marketing_campaigns", "Marketing Campaigns", { campaigns: updatedCampaigns });
    revalidatePath("/admin/marketing/campaigns");
    return res;
  } catch (error: any) {
    console.error("[UPSERT_CAMPAIGN_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await requireAdminApi();
    const campaigns = await getCampaigns();
    const filtered = campaigns.filter((c) => c.id !== id);

    const res = await savePageContent("marketing_campaigns", "Marketing Campaigns", { campaigns: filtered });
    revalidatePath("/admin/marketing/campaigns");
    return res;
  } catch (error: any) {
    console.error("[DELETE_CAMPAIGN_ERROR]", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. EMAIL SUBSCRIBERS & NEWSLETTER
// ==========================================

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED";
  subscribedAt: string;
  tags: string[];
}

const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  {
    id: "sub-1",
    email: "dimas.pratama@gmail.com",
    source: "Homepage Footer",
    status: "SUBSCRIBED",
    subscribedAt: "2026-10-02",
    tags: ["Newsletter", "Roastery Drops"],
  },
  {
    id: "sub-2",
    email: "nadia.karina@yahoo.com",
    source: "Space Pop-up",
    status: "SUBSCRIBED",
    subscribedAt: "2026-10-03",
    tags: ["Newsletter", "Workshop Club"],
  },
  {
    id: "sub-3",
    email: "bima.setiawan@outlook.com",
    source: "Checkout",
    status: "SUBSCRIBED",
    subscribedAt: "2026-10-04",
    tags: ["Customer", "Newsletter"],
  },
  {
    id: "sub-4",
    email: "clara.tan@gmail.com",
    source: "Homepage Footer",
    status: "SUBSCRIBED",
    subscribedAt: "2026-10-05",
    tags: ["Newsletter"],
  },
  {
    id: "sub-5",
    email: "arif.roastery@gmail.com",
    source: "Checkout",
    status: "SUBSCRIBED",
    subscribedAt: "2026-10-06",
    tags: ["Wholesale Lead", "VIP"],
  },
];

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, "marketing_subscribers"),
    });

    if (page && page.data) {
      const parsed = typeof page.data === "string" ? JSON.parse(page.data) : page.data;
      if (Array.isArray(parsed.subscribers)) {
        return parsed.subscribers;
      }
    }
  } catch (err) {
    console.warn("[GET_SUBSCRIBERS_FALLBACK]", err);
  }

  return DEFAULT_SUBSCRIBERS;
}

export async function subscribeNewsletter(
  email: string,
  source: string = "Homepage Newsletter"
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please provide a valid email address." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const subscribers = await getSubscribers();

    const exists = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (exists) {
      if (exists.status === "UNSUBSCRIBED") {
        // Reactivate
        const updated = subscribers.map((s) =>
          s.id === exists.id ? { ...s, status: "SUBSCRIBED" as const, subscribedAt: new Date().toISOString().split("T")[0] } : s
        );
        await savePageContent("marketing_subscribers", "Marketing Subscribers", { subscribers: updated });
      }
      return { success: true, message: "You are already subscribed to the KALANA journal!" };
    }

    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      source: source || "Storefront",
      status: "SUBSCRIBED",
      subscribedAt: new Date().toISOString().split("T")[0],
      tags: ["Newsletter", "Storefront"],
    };

    const updatedSubscribers = [newSubscriber, ...subscribers];
    await savePageContent("marketing_subscribers", "Marketing Subscribers", { subscribers: updatedSubscribers });
    revalidatePath("/admin/marketing/email");

    return { success: true, message: "Welcome to the KALANA community ritual." };
  } catch (err: any) {
    console.error("[SUBSCRIBE_ERROR]", err);
    return { success: false, message: err.message || "Failed to subscribe." };
  }
}

export async function addSubscriber(data: { email: string; source?: string; tags?: string[] }) {
  try {
    await requireAdminApi();
    const cleanEmail = data.email.trim().toLowerCase();
    const subscribers = await getSubscribers();

    if (subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "A subscriber with this email already exists." };
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      source: data.source || "Admin Manual",
      status: "SUBSCRIBED",
      subscribedAt: new Date().toISOString().split("T")[0],
      tags: data.tags && data.tags.length > 0 ? data.tags : ["Newsletter"],
    };

    const updated = [newSub, ...subscribers];
    await savePageContent("marketing_subscribers", "Marketing Subscribers", { subscribers: updated });
    revalidatePath("/admin/marketing/email");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await requireAdminApi();
    const subscribers = await getSubscribers();
    const filtered = subscribers.filter((s) => s.id !== id);

    await savePageContent("marketing_subscribers", "Marketing Subscribers", { subscribers: filtered });
    revalidatePath("/admin/marketing/email");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleSubscriberStatus(id: string) {
  try {
    await requireAdminApi();
    const subscribers = await getSubscribers();
    const updated = subscribers.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === "SUBSCRIBED" ? ("UNSUBSCRIBED" as const) : ("SUBSCRIBED" as const),
        };
      }
      return s;
    });

    await savePageContent("marketing_subscribers", "Marketing Subscribers", { subscribers: updated });
    revalidatePath("/admin/marketing/email");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
