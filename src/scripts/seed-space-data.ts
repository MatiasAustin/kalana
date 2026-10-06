import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";

const client = createClient({
  url: "file:./local.db",
});

async function seedSpace() {
  console.log("Seeding Space data (Location and Events/Workshops)...");

  // 1. Seed primary location
  const locId = uuidv4();
  try {
    const existing = await client.execute("SELECT id FROM locations WHERE is_primary = 1;");
    if (existing.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO locations (id, name, address, city, province, country, opening_hours, phone, whatsapp, email, google_maps_url, is_primary)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        args: [
          locId,
          "KALANA Space & Roastery",
          "Jl. Raya Cikampek No. 45",
          "Cikampek",
          "West Java",
          "Indonesia",
          "Daily 08:00 — 22:00 WIB",
          "+62 811 1234 567",
          "+62 811 1234 567",
          "space@kalana.com",
          "https://maps.google.com/?q=Kalana+Coffee+Cikampek",
        ],
      });
      console.log("Primary location inserted into DB!");
    } else {
      console.log("Primary location already exists in DB.");
    }
  } catch (err: any) {
    console.error("Location seed error:", err.message);
  }

  // 2. Seed Events and Workshops
  const dummyEvents = [
    {
      id: "ev-1",
      title: "Manual Brew Basics",
      slug: "manual-brew-basics",
      type: "WORKSHOP",
      category: "Coffee Education",
      description: "Learn the fundamentals of pour-over coffee, from grind size calibration and water mineral chemistry to extraction yield.",
      date: Math.floor(new Date("2026-10-12T10:00:00Z").getTime() / 1000),
      startTime: "10:00",
      endTime: "12:30",
      price: 150000,
      capacity: 8,
      registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Manual%20Brew%20Basics",
      coverImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
      status: "UPCOMING",
      isFeatured: 1,
    },
    {
      id: "ev-2",
      title: "Espresso Calibration",
      slug: "espresso-calibration",
      type: "WORKSHOP",
      category: "Coffee Education",
      description: "A deep dive into dialling in commercial espresso, understanding flow rate, brew ratios, temperature stability, and pulling clean balanced shots.",
      date: Math.floor(new Date("2026-10-26T14:00:00Z").getTime() / 1000),
      startTime: "14:00",
      endTime: "17:00",
      price: 200000,
      capacity: 6,
      registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Espresso%20Calibration",
      coverImageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=1200&auto=format&fit=crop",
      status: "UPCOMING",
      isFeatured: 1,
    },
    {
      id: "ev-3",
      title: "Analog Photo Walk",
      slug: "analog-photo-walk",
      type: "EVENT",
      category: "Creative Workshops",
      description: "A morning walk around Cikampek with fellow 35mm film enthusiasts. Gathering, street photo route, and post-walk manual brew tasting at KALANA Space.",
      date: Math.floor(new Date("2026-11-05T07:30:00Z").getTime() / 1000),
      startTime: "07:30",
      endTime: "10:30",
      price: 0,
      capacity: 15,
      registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20join%20the%20Analog%20Photo%20Walk",
      coverImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
      status: "UPCOMING",
      isFeatured: 0,
    },
    {
      id: "ev-4",
      title: "Sensory Cupping & Origins",
      slug: "sensory-cupping-origins",
      type: "WORKSHOP",
      category: "Coffee Education",
      description: "Calibrate your sensory palate using SCA cupping protocols across Indonesian single origins: Sumatra Gayo, Java Preanger, and Flores Bajawa.",
      date: Math.floor(new Date("2026-11-15T13:00:00Z").getTime() / 1000),
      startTime: "13:00",
      endTime: "15:30",
      price: 175000,
      capacity: 10,
      registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20register%20for%20Sensory%20Cupping",
      coverImageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
      status: "UPCOMING",
      isFeatured: 0,
    },
    {
      id: "ev-5",
      title: "Acoustic Sanctuary Night",
      slug: "acoustic-sanctuary-night",
      type: "EVENT",
      category: "Community",
      description: "An intimate evening of minimalist ambient guitar sets, quiet conversations, and late-night filter coffee at our open courtyard.",
      date: Math.floor(new Date("2026-11-20T19:00:00Z").getTime() / 1000),
      startTime: "19:00",
      endTime: "21:30",
      price: 0,
      capacity: 30,
      registrationUrl: "https://wa.me/628111234567?text=Hi%20KALANA,%20I%20would%20like%20to%20RSVP%20for%20Acoustic%20Sanctuary%20Night",
      coverImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
      status: "UPCOMING",
      isFeatured: 0,
    },
  ];

  for (const ev of dummyEvents) {
    try {
      const existing = await client.execute({
        sql: "SELECT id FROM events WHERE slug = ?;",
        args: [ev.slug],
      });

      if (existing.rows.length === 0) {
        await client.execute({
          sql: `INSERT INTO events (id, title, slug, type, category, description, date, start_time, end_time, price, capacity, registration_url, cover_image_url, status, is_featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ev.id,
            ev.title,
            ev.slug,
            ev.type,
            ev.category,
            ev.description,
            ev.date,
            ev.startTime,
            ev.endTime,
            ev.price,
            ev.capacity,
            ev.registrationUrl,
            ev.coverImageUrl,
            ev.status,
            ev.isFeatured,
          ],
        });
        console.log(`Inserted event: ${ev.title} (${ev.type})`);
      } else {
        console.log(`Event already exists: ${ev.title}`);
      }
    } catch (err: any) {
      console.error(`Error inserting event ${ev.title}:`, err.message);
    }
  }

  const allEvents = await client.execute("SELECT id, title, type, category, status FROM events;");
  console.log("Total events in DB:", allEvents.rows.length);
  allEvents.rows.forEach((r) => console.log(` - [${r.type}] ${r.title} (${r.status})`));
}

seedSpace();
