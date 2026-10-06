import { getBlogArticles } from "@/lib/cms-api";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getBlogArticles();
  const article = articles.find((a) => a.slug === slug);

  if (article) {
    return {
      title: `${article.title} | KALANA Journal`,
      description: article.excerpt,
    };
  }

  return {
    title: "Article | KALANA Journal",
  };
}

export default async function JournalArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const articles = await getBlogArticles();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const otherArticles = articles
    .filter((a) => a.slug !== slug && a.status === "PUBLISHED")
    .slice(0, 2);

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Articles
        </Link>

        {/* Article Header */}
        <div className="border-b border-kalana-black/20 pb-8 mb-8 space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono uppercase text-kalana-black/60">
            <span className="px-2 py-0.5 bg-neutral-200/80 rounded text-[10px] font-semibold text-kalana-black">
              {article.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.createdAt}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight uppercase leading-[1.1] text-kalana-black">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base md:text-lg text-kalana-black/75 font-light leading-relaxed max-w-2xl">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 text-xs font-mono text-kalana-black/60">
            <User className="w-3.5 h-3.5" />
            <span>Words by <strong className="text-kalana-black">{article.author || "KALANA Roastery"}</strong></span>
          </div>
        </div>

        {/* Cover Photo */}
        {article.coverImage && (
          <div className="relative aspect-[16/9] w-full mb-12 rounded overflow-hidden bg-neutral-200">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-neutral max-w-none text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-kalana-black/85 space-y-4 mb-16">
          {article.content}
        </div>

        {/* Roastery / Brand Footer Card */}
        <div className="border-t border-b border-kalana-black/20 py-8 mb-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-kalana-black/40">
              Roasted Fresh in Cikampek
            </span>
            <h4 className="text-lg font-semibold tracking-tight uppercase">
              Explore Our Seasonal Roasts
            </h4>
            <p className="text-xs font-light text-kalana-black/60 max-w-md">
              Each batch is calibrated for high extraction yield, clean cup clarity, and daily ritual enjoyment.
            </p>
          </div>
          <Link
            href="/roastery"
            className="px-6 py-3 bg-kalana-black text-white text-xs font-mono uppercase tracking-widest hover:bg-kalana-black/90 transition-colors whitespace-nowrap"
          >
            Shop Beans
          </Link>
        </div>

        {/* Read More Stories */}
        {otherArticles.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-kalana-black/40">
              More Stories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherArticles.map((other) => (
                <Link
                  key={other.id}
                  href={`/journal/${other.slug}`}
                  className="p-5 border border-kalana-black/10 hover:border-kalana-black rounded group bg-white/50 space-y-2 block transition-all"
                >
                  <span className="text-[10px] font-mono text-kalana-black/50 uppercase block">
                    {other.category}
                  </span>
                  <h5 className="font-semibold text-sm group-hover:underline underline-offset-2 text-kalana-black line-clamp-1">
                    {other.title}
                  </h5>
                  <p className="text-xs font-light text-kalana-black/60 line-clamp-2">
                    {other.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
