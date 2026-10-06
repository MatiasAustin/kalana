import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPageContent } from "@/lib/cms-api";

export default async function RoasteryPage() {
  const [allProducts, page] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.status, 'ACTIVE'),
      with: {
        variants: true,
        media: {
          with: {
            media: true
          }
        }
      },
      orderBy: [desc(products.createdAt)],
    }).catch(() => []),
    getPageContent("roastery")
  ]);

  return (
    <div className="w-full bg-kalana-offwhite pt-32 text-kalana-black min-h-screen">
      
      {/* Editorial Hero Section */}
      <section className="relative w-full px-6 lg:px-12 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-kalana-black/20 pb-24">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8">
              {page.eyebrow || "02 / Roastery"}
            </p>
            <h1 
              className="text-[10vw] lg:text-[140px] font-semibold tracking-tighter uppercase leading-[0.85] mb-12 max-w-4xl"
              dangerouslySetInnerHTML={{ __html: page.headline || "Coffee<br/>For Everyday<br/>Rituals." }}
            />
          </div>
          
          <div className="lg:col-span-4 flex items-end">
            <div className="border-l border-kalana-black/20 pl-6 mb-4">
              <p className="text-sm font-light text-kalana-black/80 leading-relaxed mb-6">
                {page.description || "Produced in small batches. Designed for consistency, clarity, and daily enjoyment."}
              </p>
              <Link href="/roastery/collection" className="text-[10px] tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                All Collections →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection: Daily Series */}
      <section className="py-24 px-6 lg:px-12 border-b border-kalana-black/20 relative">
        <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180">
          Featured Collection
        </div>

        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">
                {page.collectionBadge || "Collection / 01"}
              </p>
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tight uppercase leading-none">
                {page.collectionTitle || "Daily Series."}
              </h2>
            </div>
            <p className="text-sm tracking-wide max-w-sm text-kalana-black/70">
              {page.collectionDesc || "Everyday blends designed for consistency, versatility, and easy drinking. Built to perform across espresso, americano, and milk-based coffee."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 border-t border-kalana-black/20 pt-16">
            
            {allProducts.map((product, idx) => {
              const primaryMedia = product.media.find(m => m.isPrimary)?.media || product.media[0]?.media;
              const firstVariant = product.variants[0];
              const price = firstVariant ? firstVariant.price : 0;
              const isEven = idx % 2 !== 0; // Stagger every second item

              return (
                <div key={product.id} className={`group flex flex-col relative ${isEven ? 'lg:mt-32' : ''}`}>
                  <span className="absolute -top-8 text-[10px] tracking-[0.2em] text-kalana-black/40">Product / {(idx + 1).toString().padStart(3, '0')}</span>
                  <Link href={`/product/${product.slug}`} className="block w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 mb-8 overflow-hidden relative">
                    {primaryMedia ? (
                      <img src={primaryMedia.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-kalana-black/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                  </Link>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <Link href={`/product/${product.slug}`}>
                        <h4 className="text-2xl font-semibold uppercase tracking-wide group-hover:opacity-50 transition-opacity">{product.name}</h4>
                      </Link>
                      <p className="text-sm font-medium">IDR {price.toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60 border-y border-kalana-black/10 py-4 mb-6">
                      <span>{product.blend || '-'}</span>
                      <span>{product.roast || '-'}</span>
                      <span className="col-span-2 mt-2">{product.tastingNotes || '-'}</span>
                    </div>
                    
                    <div className="flex gap-4 mt-auto">
                      <Link href={`/product/${product.slug}`} className="w-full py-3 bg-kalana-black border border-kalana-black text-kalana-offwhite text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors">
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>
      </section>

      {/* Future Collections */}
      <section className="py-32 px-6 lg:px-12 bg-kalana-black text-kalana-offwhite">
        <div className="container mx-auto">
          <div className="flex justify-between items-end border-b border-kalana-offwhite/20 pb-8 mb-16">
             <h2 className="text-xs tracking-[0.2em] uppercase text-kalana-offwhite/50">
               {page.futureSeriesTag || "In Development"}
             </h2>
             <span className="text-[10px] tracking-widest uppercase">
               {page.futureSeriesTitle || "Future Series"}
             </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="border border-kalana-offwhite/20 py-24 px-8 flex flex-col items-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-offwhite/30 mb-8">Series / 02</span>
              <h3 className="text-2xl font-medium tracking-tight uppercase mb-4 text-kalana-offwhite/80">
                {page.series2Title || "Signature"}
              </h3>
              <p className="text-xs text-kalana-offwhite/40 tracking-wide font-light max-w-[200px]">
                {page.series2Desc || "Complex single origins."}
              </p>
            </div>
            <div className="border border-kalana-offwhite/20 py-24 px-8 flex flex-col items-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-offwhite/30 mb-8">Series / 03</span>
              <h3 className="text-2xl font-medium tracking-tight uppercase mb-4 text-kalana-offwhite/80">
                {page.series3Title || "Specialty"}
              </h3>
              <p className="text-xs text-kalana-offwhite/40 tracking-wide font-light max-w-[200px]">
                {page.series3Desc || "Microlots & experimentals."}
              </p>
            </div>
            <div className="border border-kalana-offwhite/20 py-24 px-8 flex flex-col items-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-offwhite/30 mb-8">Series / 04</span>
              <h3 className="text-2xl font-medium tracking-tight uppercase mb-4 text-kalana-offwhite/80">
                {page.series4Title || "Limited"}
              </h3>
              <p className="text-xs text-kalana-offwhite/40 tracking-wide font-light max-w-[200px]">
                {page.series4Desc || "Seasonal drops."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
