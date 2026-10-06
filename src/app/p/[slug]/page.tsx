import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await db.query.sitePages.findFirst({
      where: eq(sitePages.slug, slug),
    });
    if (page) {
      return {
        title: `${page.title} | KALANA`,
      };
    }
  } catch {}
  return {
    title: "Page | KALANA",
  };
}

export default async function CustomDynamicPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await db.query.sitePages.findFirst({
    where: eq(sitePages.slug, slug),
  });

  if (!page) {
    notFound();
  }

  let data: any = {};
  try {
    data = typeof page.data === "string" ? JSON.parse(page.data) : page.data || {};
  } catch {
    data = {};
  }

  const title = page.title || data.title || slug.toUpperCase();
  const eyebrow = data.eyebrow || "KALANA / STORY";
  const headline = data.headline || "";
  const content = data.content || "";
  const imageUrl = data.imageUrl || "";

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        {/* Header */}
        <div className="border-b border-kalana-black/20 pb-8 mb-10">
          <p className="text-xs tracking-widest uppercase text-kalana-black/50 font-mono mb-2">
            {eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-4 leading-[1.05]">
            {title}
          </h1>
          {headline && (
            <p className="text-lg md:text-xl text-kalana-black/70 font-light leading-relaxed max-w-2xl">
              {headline}
            </p>
          )}
        </div>

        {/* Featured Banner Image */}
        {imageUrl && (
          <div className="relative aspect-[16/9] w-full mb-12 rounded overflow-hidden bg-neutral-200">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Body Content */}
        <div className="prose prose-neutral max-w-none text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-kalana-black/85">
          {content}
        </div>
      </div>
    </div>
  );
}
