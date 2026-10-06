import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Protect this endpoint! Set SEED_SECRET in Vercel.
    const expectedSecret = process.env.SEED_SECRET;
    
    if (!expectedSecret || secret !== expectedSecret) {
      return new NextResponse('Unauthorized. Missing or invalid secret parameter.', { status: 401 });
    }

    console.log('Seeding database from API...');

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

    // Events & Workshops
    await db.insert(schema.events).values([
      {
        id: "ev-1",
        title: "Manual Brew Basics",
        slug: "manual-brew-basics",
        type: "WORKSHOP",
        category: "Coffee Education",
        description: "Learn the fundamentals of pour-over coffee, from grind size calibration and water mineral chemistry to extraction yield.",
        date: new Date("2026-10-12T10:00:00Z"),
        startTime: "10:00",
        endTime: "12:30",
        price: 150000,
        capacity: 8,
        registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Manual%20Brew%20Basics",
        coverImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
        status: "UPCOMING",
        isFeatured: true,
      },
      {
        id: "ev-2",
        title: "Espresso Calibration",
        slug: "espresso-calibration",
        type: "WORKSHOP",
        category: "Coffee Education",
        description: "A deep dive into dialling in commercial espresso, understanding flow rate, brew ratios, temperature stability, and pulling clean balanced shots.",
        date: new Date("2026-10-26T14:00:00Z"),
        startTime: "14:00",
        endTime: "17:00",
        price: 200000,
        capacity: 6,
        registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Espresso%20Calibration",
        coverImageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=1200&auto=format&fit=crop",
        status: "UPCOMING",
        isFeatured: true,
      },
      {
        id: "ev-3",
        title: "Analog Photo Walk",
        slug: "analog-photo-walk",
        type: "EVENT",
        category: "Creative Workshops",
        description: "A morning walk around Cikampek with fellow 35mm film enthusiasts. Gathering, street photo route, and post-walk manual brew tasting at KALANA Space.",
        date: new Date("2026-11-05T07:30:00Z"),
        startTime: "07:30",
        endTime: "10:30",
        price: 0,
        capacity: 15,
        registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20join%20the%20Analog%20Photo%20Walk",
        coverImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
        status: "UPCOMING",
        isFeatured: false,
      },
      {
        id: "ev-4",
        title: "Sensory Cupping & Origins",
        slug: "sensory-cupping-origins",
        type: "WORKSHOP",
        category: "Coffee Education",
        description: "Calibrate your sensory palate using SCA cupping protocols across Indonesian single origins: Sumatra Gayo, Java Preanger, and Flores Bajawa.",
        date: new Date("2026-11-15T13:00:00Z"),
        startTime: "13:00",
        endTime: "15:30",
        price: 175000,
        capacity: 10,
        registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Sensory%20Cupping",
        coverImageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
        status: "UPCOMING",
        isFeatured: false,
      },
      {
        id: "ev-5",
        title: "Acoustic Sanctuary Night",
        slug: "acoustic-sanctuary-night",
        type: "EVENT",
        category: "Community",
        description: "An intimate evening of minimalist ambient guitar sets, quiet conversations, and late-night filter coffee at our open courtyard.",
        date: new Date("2026-11-20T19:00:00Z"),
        startTime: "19:00",
        endTime: "21:30",
        price: 0,
        capacity: 30,
        registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20RSVP%20for%20Acoustic%20Sanctuary%20Night",
        coverImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
        status: "UPCOMING",
        isFeatured: false,
      },
    ]).onConflictDoNothing();

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });

  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
