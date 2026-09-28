import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  try {
    // Site Settings
    await db.insert(schema.siteSettings).values({
      id: 'global',
      brandName: 'KALANA',
      tagline: 'SPACE. COFFEE. FURTHER DAYS.',
      primaryEmail: 'hello@kalana.com',
      phone: '+62 811 1234 567',
      whatsapp: '+62 811 1234 567',
      country: 'Indonesia',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    }).onConflictDoNothing();

    // Location
    const spaceLocationId = uuidv4();
    await db.insert(schema.locations).values({
      id: spaceLocationId,
      name: 'Kalana Space',
      address: 'Cikampek',
      province: 'West Java',
      isPrimary: true
    }).onConflictDoNothing();

    // Products
    const dhProductId = uuidv4();
    await db.insert(schema.products).values({
      id: dhProductId,
      slug: 'daily-house',
      name: 'Daily House',
      description: 'Built as KALANA\'s everyday house blend. Bold, balanced, and designed to perform across espresso, americano, and milk-based coffee.',
      blend: '70% Robusta / 30% Arabica',
      roast: 'Medium-Dark',
      tastingNotes: 'Dark Chocolate, Peanut, Brown Sugar',
      body: 'Full',
      acidity: 'Low',
      brewingGuide: JSON.stringify(["Espresso", "Americano", "Kopi Susu"]),
      status: 'ACTIVE'
    }).onConflictDoNothing();

    // Variants for Daily House
    await db.insert(schema.productVariants).values([
      { id: uuidv4(), productId: dhProductId, name: '500g', sku: 'DH-500', price: 95000, weight: 500 },
      { id: uuidv4(), productId: dhProductId, name: '1000g', sku: 'DH-1000', price: 180000, weight: 1000 }
    ]).onConflictDoNothing();

    const dcProductId = uuidv4();
    await db.insert(schema.products).values({
      id: dcProductId,
      slug: 'daily-crema',
      name: 'Daily Crema',
      description: 'A smooth and versatile blend tailored for those who enjoy a balanced, chocolatey cup.',
      blend: '50% Arabica / 50% Robusta',
      roast: 'Medium',
      tastingNotes: 'Milk Chocolate, Caramel, Roasted Nuts',
      body: 'Medium-Full',
      acidity: 'Low-Medium',
      status: 'ACTIVE'
    }).onConflictDoNothing();

    // Variants for Daily Crema
    await db.insert(schema.productVariants).values([
      { id: uuidv4(), productId: dcProductId, name: '500g', sku: 'DC-500', price: 110000, weight: 500 },
      { id: uuidv4(), productId: dcProductId, name: '1000g', sku: 'DC-1000', price: 210000, weight: 1000 }
    ]).onConflictDoNothing();

    // Collections
    const collectionId = uuidv4();
    await db.insert(schema.collections).values({
      id: collectionId,
      slug: 'daily-series',
      name: 'Daily Series',
      description: 'Two everyday blends made for the way coffee is actually enjoyed.',
    }).onConflictDoNothing();

    await db.insert(schema.collectionProducts).values([
      { id: uuidv4(), collectionId: collectionId, productId: dhProductId, sortOrder: 1 },
      { id: uuidv4(), collectionId: collectionId, productId: dcProductId, sortOrder: 2 }
    ]).onConflictDoNothing();

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
