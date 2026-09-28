import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { siteSettings, products, locations, socialLinks, homepageSections } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// Abstraction for CMS Data Fetching
// This reads from the local JSON file, simulating a database or headless CMS API.

export async function getCmsData() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'cms-data.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function getSiteSettings() {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 'global')
  });
  
  if (!settings) {
    // fallback to JSON for migration
    const data = await getCmsData();
    return data.siteSettings;
  }
  return settings;
}

export async function getNavigation() {
  const data = await getCmsData();
  return data.navigation;
}

export async function getHomepage() {
  const sections = await db.query.homepageSections.findMany({
    orderBy: [asc(homepageSections.sortOrder)]
  });

  if (!sections || sections.length === 0) {
    const data = await getCmsData();
    return data.homepage;
  }

  // Transform dynamic DB sections into the legacy structure expected by page.tsx
  const formatted: any = {
    hero: {},
    featuredCollection: {},
    brandStory: {},
    space: {}
  };

  sections.forEach(sec => {
    const data = typeof sec.data === 'string' ? JSON.parse(sec.data) : sec.data;
    if (sec.type === 'HERO') {
      formatted.hero = {
        eyebrow: data.eyebrow || "KALANA SPACE & ROASTERY",
        established: "Est. 2026",
        headline: data.headline?.replace(/\./g, '.<br/>') || "Space.<br/>Coffee.<br/>Further<br/>Days.",
        primaryCtaLabel: data.ctaText || "Explore",
        primaryCtaUrl: data.ctaUrl || "/roastery",
        secondaryCtaLabel: "Visit Us",
        secondaryCtaUrl: "/space"
      };
    } else if (sec.type === 'FEATURED_COLLECTION') {
      formatted.featuredCollection = {
        eyebrow: "Featured",
        title: data.title || "Daily Series.",
        description: data.subtext || "Our everyday blends.",
        collectionHandle: "daily-series",
        ctaLabel: "Shop Roastery",
        ctaUrl: "/roastery"
      };
    } else if (sec.type === 'BRAND_STORY') {
      formatted.brandStory = {
        headline: "Made<br/>For the<br/>Daily<br/>Ritual.",
        description: data.content || "KALANA is built around the little rituals."
      };
    } else if (sec.type === 'SPACE') {
      formatted.space = {
        eyebrow: "Location",
        title: data.title || "The Space.",
        description: "Where coffee and conversations happen.",
        features: ["Espresso Bar", "Roastery", "Events"],
        ctaLabel: "Learn More",
        ctaUrl: "/space"
      };
    }
  });

  return formatted;
}

export async function getProducts() {
  const data = await getCmsData();
  return data.products;
}

export async function getProductByHandle(handle: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, handle),
    with: {
      variants: true,
      media: {
        with: {
          media: true
        }
      }
    }
  });

  if (product && product.variants) {
    // Sort variants by price or weight if needed, here just keeping them as is
    // Actually we sort media by sortOrder
    if (product.media) {
      product.media.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  return product;
}

export async function getSocialLinks() {
  const links = await db.query.socialLinks.findMany({
    where: eq(socialLinks.isActive, true),
    orderBy: (socials, { asc }) => [asc(socials.sortOrder)]
  });

  if (!links || links.length === 0) {
    const data = await getCmsData();
    return data.socialLinks.filter((link: any) => link.active);
  }
  return links;
}

export async function getLocation() {
  const location = await db.query.locations.findFirst({
    where: eq(locations.isPrimary, true)
  });

  if (!location) {
    const data = await getCmsData();
    return data.location;
  }
  return location;
}
