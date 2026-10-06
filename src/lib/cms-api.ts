import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { siteSettings, products, locations, socialLinks, homepageSections, sitePages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getCmsData() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'cms-data.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function getSiteSettings() {
  try {
    const settings = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 'global')
    });
    
    if (!settings) {
      const data = await getCmsData();
      return data.siteSettings;
    }
    return settings;
  } catch (err) {
    console.error("[GET_SITE_SETTINGS_ERROR]", err);
    const data = await getCmsData();
    return data.siteSettings;
  }
}

export async function getNavigation() {
  const data = await getCmsData();
  const defaultNav = data.navigation;
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, "navigation")
    });
    if (page && page.data) {
      const parsed = typeof page.data === "string" ? JSON.parse(page.data) : page.data;
      return {
        header: Array.isArray(parsed.header) ? parsed.header : defaultNav.header,
        footer: Array.isArray(parsed.footer) ? parsed.footer : defaultNav.footer,
        legal: Array.isArray(parsed.legal) ? parsed.legal : defaultNav.legal,
      };
    }
  } catch {}
  return defaultNav;
}

export async function getHomepage() {
  const cmsData = await getCmsData();
  const defaultHomepage = cmsData.homepage || {};

  try {
    const sections = await db.query.homepageSections.findMany({
      orderBy: [asc(homepageSections.sortOrder)]
    });

    if (!sections || sections.length === 0) {
      return defaultHomepage;
    }

    // Initialize with full defaults so no field is missing
    const formatted: any = {
      hero: { ...defaultHomepage.hero, imageUrl: "" },
      featuredCollection: { ...defaultHomepage.featuredCollection },
      brandStory: { ...defaultHomepage.brandStory, watermark: "RITUAL" },
      socialProof: { ...defaultHomepage.socialProof },
      space: { ...defaultHomepage.space, imageUrl: "" },
      workshops: { ...defaultHomepage.workshops },
      newsletter: { ...defaultHomepage.newsletter }
    };

    sections.forEach((sec) => {
      if (!sec.isEnabled) return;
      const data = typeof sec.data === 'string' ? JSON.parse(sec.data) : sec.data;
      if (!data) return;

      if (sec.type === 'HERO') {
        formatted.hero = {
          ...formatted.hero,
          eyebrow: data.eyebrow || formatted.hero.eyebrow,
          established: data.established || formatted.hero.established,
          headline: data.headline?.replace(/\./g, '.<br/>') || formatted.hero.headline,
          primaryCtaLabel: data.primaryCtaLabel || data.ctaText || formatted.hero.primaryCtaLabel,
          primaryCtaUrl: data.primaryCtaUrl || data.ctaUrl || formatted.hero.primaryCtaUrl,
          secondaryCtaLabel: data.secondaryCtaLabel || formatted.hero.secondaryCtaLabel,
          secondaryCtaUrl: data.secondaryCtaUrl || formatted.hero.secondaryCtaUrl,
          imageUrl: data.imageUrl || formatted.hero.imageUrl || ""
        };
      } else if (sec.type === 'FEATURED_COLLECTION') {
        formatted.featuredCollection = {
          ...formatted.featuredCollection,
          eyebrow: data.eyebrow || formatted.featuredCollection.eyebrow,
          title: data.title || formatted.featuredCollection.title,
          description: data.description || data.subtext || formatted.featuredCollection.description,
          ctaLabel: data.ctaLabel || formatted.featuredCollection.ctaLabel,
          ctaUrl: data.ctaUrl || formatted.featuredCollection.ctaUrl,
        };
      } else if (sec.type === 'BRAND_STORY') {
        formatted.brandStory = {
          ...formatted.brandStory,
          headline: data.headline || formatted.brandStory.headline,
          description: data.description || data.content || formatted.brandStory.description,
          ctaLabel: data.ctaLabel || formatted.brandStory.ctaLabel,
          ctaUrl: data.ctaUrl || formatted.brandStory.ctaUrl,
          watermark: data.watermark || formatted.brandStory.watermark || "RITUAL"
        };
      } else if (sec.type === 'SOCIAL_PROOF') {
        formatted.socialProof = {
          ...formatted.socialProof,
          eyebrow: data.eyebrow || formatted.socialProof.eyebrow,
          rating: data.rating || formatted.socialProof.rating,
          reviews: Array.isArray(data.reviews) && data.reviews.length > 0 ? data.reviews : formatted.socialProof.reviews
        };
      } else if (sec.type === 'SPACE') {
        formatted.space = {
          ...formatted.space,
          eyebrow: data.eyebrow || formatted.space.eyebrow,
          title: data.title || formatted.space.title,
          description: data.description || formatted.space.description,
          ctaLabel: data.ctaLabel || formatted.space.ctaLabel,
          ctaUrl: data.ctaUrl || formatted.space.ctaUrl,
          imageUrl: data.imageUrl || formatted.space.imageUrl || ""
        };
      } else if (sec.type === 'WORKSHOPS') {
        formatted.workshops = {
          ...formatted.workshops,
          title: data.title || formatted.workshops.title,
          ctaLabel: data.ctaLabel || formatted.workshops.ctaLabel,
          ctaUrl: data.ctaUrl || formatted.workshops.ctaUrl,
          events: Array.isArray(data.events) && data.events.length > 0 ? data.events : formatted.workshops.events
        };
      } else if (sec.type === 'NEWSLETTER') {
        formatted.newsletter = {
          ...formatted.newsletter,
          eyebrow: data.eyebrow || formatted.newsletter.eyebrow,
          title: data.title || formatted.newsletter.title,
          description: data.description || formatted.newsletter.description,
          placeholder: data.placeholder || formatted.newsletter.placeholder,
          ctaLabel: data.ctaLabel || formatted.newsletter.ctaLabel
        };
      }
    });

    return formatted;
  } catch (err) {
    console.error("[GET_HOMEPAGE_ERROR]", err);
    return defaultHomepage;
  }
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
    if (product.media) {
      product.media.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  }

  return product;
}

export async function getSocialLinks() {
  try {
    const links = await db.query.socialLinks.findMany({
      where: eq(socialLinks.isActive, true),
      orderBy: (socials, { asc }) => [asc(socials.sortOrder)]
    });

    if (Array.isArray(links)) {
      return links;
    }
  } catch (err) {
    console.error("[GET_SOCIAL_LINKS_ERROR]", err);
  }

  try {
    const data = await getCmsData();
    return Array.isArray(data.socialLinks) ? data.socialLinks.filter((link: any) => link.active) : [];
  } catch {
    return [];
  }
}

export async function getLocation() {
  try {
    const location = await db.query.locations.findFirst({
      where: eq(locations.isPrimary, true)
    });

    if (!location) {
      const data = await getCmsData();
      return data.location;
    }
    return location;
  } catch {
    const data = await getCmsData();
    return data.location;
  }
}

// --- Dynamic Site Pages (About, Space, Goods, Legal) ---

export function getDefaultPageContent(slug: string): any {
  if (slug === 'about') {
    return {
      eyebrow: "05 / About",
      title: "About<br/>Kalana.",
      subtitle: "Brand Story<br/>Est. 2026",
      chapters: [
        {
          tag: "Chapter 01",
          title: "The Journey.",
          content: "KALANA exists at the intersection of coffee, space, and the daily rituals that define our lives. We believe that coffee is more than just a beverage; it's a marker of time, a catalyst for conversation, and a companion for the quiet moments in between."
        },
        {
          tag: "Chapter 02",
          title: "The Raven.",
          content: "Our mascot, the raven, represents curiosity, perspective, and the wanderer's spirit. It is a subtle nod to our philosophy of constant exploration, whether that means refining our roast profiles, designing physical spaces, or creating objects for everyday use."
        }
      ],
      architecture: [
        { title: "Space", description: "A physical anchor for our community. A place designed for slowing down." },
        { title: "Roastery", description: "The core of our craft. Producing consistent, approachable blends and single origins." },
        { title: "Goods", description: "Future artifacts. Objects and tools that carry the KALANA ethos beyond our walls." }
      ]
    };
  }

  if (slug === 'space') {
    return {
      eyebrow: "03 / Space",
      headline: "Come<br/>Wander<br/>In.",
      description: "Coffee, conversations, workshops, and somewhere to stay awhile.",
      locationTag: "Cikampek, West Java",
      heroImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1600&auto=format&fit=crop",
      atmosphereTitle: "Sanctuary<br/>From the Noise.",
      atmosphereDesc: "Designed as a sanctuary from the noise. Our space uses natural light, warm materials, and generous spacing to create an environment where you can focus, connect, or simply do nothing at all.",
      atmosphereImage1: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      atmosphereImage2: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
      coffeeBarTitle: "The Coffee Bar",
      coffeeBarDesc: "Our bar is calibrated daily. Featuring our seasonal blends, single-origin offerings, and manual brewing station.",
      coffeeBarImage: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1600&auto=format&fit=crop"
    };
  }

  if (slug === 'goods') {
    return {
      eyebrow: "04 / Goods",
      tagline: "In Development<br/>Est. 2026",
      title: "Goods.",
      description: "Objects for the journey. A future collection of apparel, coffee tools, bags, and lifestyle accessories.",
      categories: ["Apparel", "Coffee Tools", "Bags", "Accessories", "Objects"]
    };
  }

  if (slug === 'terms') {
    return {
      title: "Terms & Conditions",
      subtitle: "Last updated: 2026",
      content: "Welcome to KALANA. By accessing our space, ordering through our roastery, or using our website, you agree to comply with and be bound by the following terms and conditions of use."
    };
  }

  if (slug === 'privacy') {
    return {
      title: "Privacy Policy",
      subtitle: "Last updated: 2026",
      content: "At KALANA, we value your privacy. We collect only necessary details to process your coffee orders, communicate important roastery updates, and deliver goods safely."
    };
  }

  if (slug === 'shipping') {
    return {
      title: "Shipping & Returns",
      subtitle: "Delivery information",
      content: "All coffee beans are roasted fresh to order. We deliver across Indonesia via trusted logistics partners. For issues with delivery or freshness, reach out to our team."
    };
  }

  if (slug === 'roastery') {
    return {
      eyebrow: "02 / Roastery",
      headline: "Coffee<br/>For Everyday<br/>Rituals.",
      description: "Produced in small batches. Designed for consistency, clarity, and daily enjoyment.",
      heroImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1600&auto=format&fit=crop",
      collectionBadge: "Collection / 01",
      collectionTitle: "Daily Series.",
      collectionDesc: "Everyday blends designed for consistency, versatility, and easy drinking. Built to perform across espresso, americano, and milk-based coffee.",
      // Roasting Craft & Workshop Documentation
      roastingDocBadge: "Archive / 02",
      roastingDocTitle: "The Roasting Craft & Workshop Archive.",
      roastingDocDesc: "Documenting our small-batch roasting profiles, drum calibrations, and hands-on roasting masterclasses held at the Cikampek roastery.",
      roastDoc1Image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
      roastDoc1Tag: "Stage 01 / Green Grading",
      roastDoc1Title: "Green Bean Selection & Moisture Check",
      roastDoc1Desc: "Inspecting density and sorting specialty green lots before thermal charging.",
      roastDoc2Image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      roastDoc2Tag: "Stage 02 / The Drum",
      roastDoc2Title: "Thermal Transfer & First Crack",
      roastDoc2Desc: "Logging the roast curve, modulating airflow, and checking aroma with the trier.",
      roastDoc3Image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
      roastDoc3Tag: "Stage 03 / Cooling Tray",
      roastDoc3Title: "Cooling Agitation & Degassing",
      roastDoc3Desc: "Rapid cooling stops residual thermal inertia and locks in vibrant aromatic compounds.",
      roastDoc4Image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
      roastDoc4Tag: "Stage 04 / Cupping Table",
      roastDoc4Title: "Sensory Cupping & Workshop Session",
      roastDoc4Desc: "Baristas and workshop attendees dialing in acidity, body, and sweetness notes together.",
      futureSeriesTag: "In Development",
      futureSeriesTitle: "Future Series",
      series2Title: "Signature",
      series2Desc: "Complex single origins.",
      series3Title: "Specialty",
      series3Desc: "Microlots & experimentals.",
      series4Title: "Limited",
      series4Desc: "Seasonal drops."
    };
  }

  if (slug === 'workshops') {
    return {
      eyebrow: "03 / Workshops",
      title: "Workshops.",
      description: "Gatherings designed around coffee, creativity, and community.",
      introNote: "Explore our regular calendar of barista training, cupping, and brewing classes held directly at our Cikampek roastery bar."
    };
  }

  if (slug === 'contact') {
    return {
      eyebrow: "06 / Contact",
      title: "Get in Touch.",
      subtitle: "Conversations & Inquiries",
      description: "Whether you are interested in wholesale coffee beans, space reservations, or just saying hello, we would love to hear from you.",
      email: "hello@kalana.com",
      whatsapp: "+62 812-3456-7890",
      hours: "Daily 08:00 - 22:00 WIB",
      address: "Jl. Raya Cikampek No. 45, Karawang, Jawa Barat"
    };
  }

  if (slug === 'announcement') {
    return {
      isEnabled: true,
      text: "Complimentary shipping across Java on orders over IDR 300,000 | Code: KALANA2026",
      linkText: "Shop Coffee",
      linkUrl: "/roastery",
      bgColor: "#0A0A0A",
      textColor: "#FFFFFF",
    };
  }

  return { title: slug.toUpperCase(), content: "" };
}

export async function getPageContent(slug: string) {
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, slug)
    });

    if (page && page.data) {
      const parsed = typeof page.data === 'string' ? JSON.parse(page.data) : page.data;
      return { ...getDefaultPageContent(slug), ...parsed, pageTitle: page.title };
    }
  } catch (err) {
    console.warn(`[GET_PAGE_CONTENT_FALLBACK] ${slug}`);
  }

  return getDefaultPageContent(slug);
}

export async function getAnnouncement() {
  return getPageContent('announcement');
}

export async function getBlogArticles(): Promise<any[]> {
  const page = await getPageContent('blog_articles');
  if (page && Array.isArray(page.articles)) {
    return page.articles;
  }
  return [
    {
      id: "art-1",
      slug: "art-of-slow-roasting",
      title: "The Art of Slow Roasting",
      excerpt: "Why gentle thermal transfer creates richer body, distinct sweetness, and enduring cup clarity.",
      content: "At KALANA, roasting is not about aggressive development or chasing carbonized profiles. It is a contemplative study of moisture loss, airflow, and heat balance. By extending the Maillard phase and maintaining gentle conduction, we allow the innate sweetness of Indonesian origins to caramelize cleanly.",
      category: "Roastery Craft",
      coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      author: "Matias Austin",
      readTime: "4 min read",
      status: "PUBLISHED",
      createdAt: "2026-10-01"
    },
    {
      id: "art-2",
      slug: "brewing-water-chemistry",
      title: "Water Chemistry for Pour-Over Clarity",
      excerpt: "Understanding the balance between magnesium, calcium, and bicarbonate for optimum extraction.",
      content: "Coffee is 98.5% water. When your cup tastes flat or excessively bitter despite dialing in your grind, the culprit is often total dissolved solids (TDS) and buffer capacity. We calibrate our roastery brew bar to 60 ppm general hardness and 25 ppm alkalinity for pristine clarity.",
      category: "Brewing Guide",
      coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
      author: "KALANA Bar Team",
      readTime: "5 min read",
      status: "PUBLISHED",
      createdAt: "2026-09-24"
    },
    {
      id: "art-3",
      slug: "architecture-of-stillness",
      title: "Architecture of Stillness: Designing the Space",
      excerpt: "How natural timber, brutalist concrete, and acoustic buffering cultivate space for daily pause.",
      content: "Our space was conceived as an intentional retreat from sensory overload. By utilizing raw volcanic stone, warm teak benches, and oversized panoramic apertures, we invite visitors to slow their pace and reconnect with simple physical rituals.",
      category: "The Space",
      coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop",
      author: "Design Studio",
      readTime: "3 min read",
      status: "PUBLISHED",
      createdAt: "2026-09-15"
    }
  ];
}
