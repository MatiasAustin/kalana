import { getBlogArticles } from "@/lib/cms-api";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coffee Journal & Notes | KALANA",
  description: "Editorial notes on slow roasting craft, water chemistry, brewing rituals, and sanctuary architecture.",
};

export default async function JournalIndexPage() {
  const articles = await getBlogArticles();
  const publishedArticles = articles.filter((a) => a.status === "PUBLISHED");

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        {/* Page Header */}
        <div className="border-b border-kalana-black/20 pb-8 mb-12">
          <p className="text-xs tracking-widest uppercase text-kalana-black/50 font-mono mb-2">
            07 / Editorial & Craft
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-4 leading-tight">
            Coffee Journal.
          </h1>
          <p className="text-lg text-kalana-black/70 font-light max-w-2xl leading-relaxed">
            Reflections from our roastery drum, water mineral studies, and the philosophy behind slow, intentional coffee rituals.
          </p>
        </div>

        {/* Articles Grid */}
        {publishedArticles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-mono text-kalana-black/50 uppercase tracking-widest">
              No journal stories published yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedArticles.map((article) => (
              <Link
                key={article.id}
                href={`/journal/${article.slug}`}
                className="group flex flex-col bg-white border border-kalana-black/10 hover:border-kalana-black/40 transition-all overflow-hidden rounded-sm"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full bg-neutral-200 overflow-hidden">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kalana-black/30">
                      KALANA JOURNAL
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-kalana-black/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.createdAt}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold tracking-tight text-kalana-black group-hover:underline underline-offset-4 line-clamp-2">
                      {article.title}
                    </h2>

                    <p className="text-xs font-light text-kalana-black/70 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-kalana-black/10 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-kalana-black/60 group-hover:text-kalana-black">
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
