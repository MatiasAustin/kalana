import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { siteSettings, products, locations } from '@/lib/db/schema';
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
  const data = await getCmsData();
  return data.products.find((p: any) => p.handle === handle);
}

export async function getSocialLinks() {
  const data = await getCmsData();
  return data.socialLinks.filter((link: any) => link.active);
}

export async function getLocation() {
  const data = await getCmsData();
  return data.location;
}
