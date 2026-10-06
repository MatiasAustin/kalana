import Link from "next/link";
import { getPageContent } from "@/lib/cms-api";

export default async function GoodsPage() {
  const page = await getPageContent("goods");

  const categories = Array.isArray(page.categories)
    ? page.categories
    : ["Apparel", "Coffee Tools", "Bags", "Accessories", "Objects"];

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-24 min-h-screen flex flex-col relative overflow-hidden">
      
      <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180 z-20">
        {page.eyebrow || "04 / Goods"}
      </div>

      <section className="flex-grow w-full flex items-center justify-center p-6 lg:p-12 border-b border-kalana-black/20">
        <div className="w-full h-full bg-kalana-black/5 border border-kalana-black/10 flex flex-col items-center justify-center p-6 relative">
          
          <div 
            className="absolute top-6 right-6 text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 text-right"
            dangerouslySetInnerHTML={{ __html: page.tagline || "In Development<br/>Est. 2026" }}
          />
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-[12vw] lg:text-[160px] font-semibold tracking-tighter uppercase leading-[0.85] mb-12">
              {page.title || "Goods."}
            </h1>
            <p className="text-sm tracking-wide font-light max-w-md mx-auto mb-16 border-l border-kalana-black/20 pl-6 text-left">
              {page.description}
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] text-kalana-black/40 uppercase mb-24 max-w-lg mx-auto">
              {categories.map((cat: string, idx: number) => (
                <span key={idx} className="flex items-center gap-4">
                  <span>{cat}</span>
                  {idx < categories.length - 1 && <span className="opacity-30">/</span>}
                </span>
              ))}
            </div>

            <Link href="/" className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
              Return Home →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
