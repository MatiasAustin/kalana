import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { siteSettings, products, locations, socialLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
  const data = await getCmsData();
  return data.homepage;
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
