import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { db } from "@/lib/db";
import { homepageSections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { getCmsData } from "@/lib/cms-api";

export default async function HomepageEditorPage() {
  const sections = await db.query.homepageSections.findMany({
    orderBy: [asc(homepageSections.sortOrder)]
  }).catch(() => []);

  if (sections && sections.length > 0) {
    const parsedSections = sections.map((s) => ({
      ...s,
      data: typeof s.data === "string" ? JSON.parse(s.data) : s.data
    }));
    return <HomepageEditor initialSections={parsedSections} />;
  }

  // Fallback default sections
  const cmsData = await getCmsData();
  const hp = cmsData.homepage || {};

  const defaultSections = [
    {
      id: "hero",
      type: "HERO",
      isEnabled: true,
      data: {
        eyebrow: hp.hero?.eyebrow || "KALANA Space & Roastery",
        established: hp.hero?.established || "Est. 2026",
        headline: hp.hero?.headline || "Space.<br/>Coffee.<br/>Further<br/>Days.",
        primaryCtaLabel: hp.hero?.primaryCtaLabel || "Explore KALANA",
        primaryCtaUrl: hp.hero?.primaryCtaUrl || "/roastery",
        secondaryCtaLabel: hp.hero?.secondaryCtaLabel || "Visit Us",
        secondaryCtaUrl: hp.hero?.secondaryCtaUrl || "/space",
        imageUrl: ""
      }
    },
    {
      id: "featured-collection",
      type: "FEATURED_COLLECTION",
      isEnabled: true,
      data: {
        eyebrow: hp.featuredCollection?.eyebrow || "Featured",
        title: hp.featuredCollection?.title || "Daily Series.",
        description: hp.featuredCollection?.description || "Two everyday blends made for the way coffee is actually enjoyed.",
        ctaLabel: hp.featuredCollection?.ctaLabel || "Shop Roastery →",
        ctaUrl: hp.featuredCollection?.ctaUrl || "/roastery"
      }
    },
    {
      id: "brand-story",
      type: "BRAND_STORY",
      isEnabled: true,
      data: {
        headline: hp.brandStory?.headline || "Made<br/>For the<br/>Daily<br/>Ritual.",
        description: hp.brandStory?.description || "From the first cup of the morning...",
        watermark: "RITUAL",
        ctaLabel: hp.brandStory?.ctaLabel || "Our Story →",
        ctaUrl: hp.brandStory?.ctaUrl || "/about"
      }
    },
    {
      id: "social-proof",
      type: "SOCIAL_PROOF",
      isEnabled: true,
      data: {
        eyebrow: hp.socialProof?.eyebrow || "Community",
        rating: hp.socialProof?.rating || "4.9/5 Rating",
        reviews: hp.socialProof?.reviews || []
      }
    },
    {
      id: "space",
      type: "SPACE",
      isEnabled: true,
      data: {
        eyebrow: hp.space?.eyebrow || "Kalana Space",
        title: hp.space?.title || "Come<br/>Wander<br/>In.",
        description: hp.space?.description || "A place to slow down, meet people, work for a while, or simply have another cup.",
        imageUrl: "",
        ctaLabel: hp.space?.ctaLabel || "Visit Space →",
        ctaUrl: hp.space?.ctaUrl || "/space"
      }
    },
    {
      id: "workshops",
      type: "WORKSHOPS",
      isEnabled: true,
      data: {
        title: hp.workshops?.title || "Workshops.",
        ctaLabel: hp.workshops?.ctaLabel || "See All →",
        ctaUrl: hp.workshops?.ctaUrl || "/space/workshops",
        events: hp.workshops?.events || []
      }
    },
    {
      id: "newsletter",
      type: "NEWSLETTER",
      isEnabled: true,
      data: {
        eyebrow: hp.newsletter?.eyebrow || "Newsletter",
        title: hp.newsletter?.title || "Stay in the loop.",
        description: hp.newsletter?.description || "New beans, workshops, events, and things we're working on.",
        placeholder: hp.newsletter?.placeholder || "EMAIL ADDRESS",
        ctaLabel: hp.newsletter?.ctaLabel || "Join →"
      }
    }
  ];

  return <HomepageEditor initialSections={defaultSections} />;
}
