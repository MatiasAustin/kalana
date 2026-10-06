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

    if (!links || links.length === 0) {
      const data = await getCmsData();
      return data.socialLinks.filter((link: any) => link.active);
    }
    return links;
  } catch {
    const data = await getCmsData();
    return data.socialLinks.filter((link: any) => link.active);
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
      heroImage: "",
      atmosphereTitle: "Sanctuary<br/>From the Noise.",
      atmosphereDesc: "Designed as a sanctuary from the noise. Our space uses natural light, warm materials, and generous spacing to create an environment where you can focus, connect, or simply do nothing at all.",
      atmosphereImage1: "",
      atmosphereImage2: "",
      coffeeBarTitle: "The Coffee Bar",
      coffeeBarDesc: "Our bar is calibrated daily. Featuring our seasonal blends, single-origin offerings, and manual brewing station.",
      coffeeBarImage: ""
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
    // If table doesn't exist yet, gracefully use default
    console.warn(`[GET_PAGE_CONTENT_FALLBACK] ${slug}`);
  }

  return getDefaultPageContent(slug);
}
