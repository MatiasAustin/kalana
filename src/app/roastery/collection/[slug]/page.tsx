import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const isDailySeries = slug === "daily-series";
  
  if (!isDailySeries) {
    return <div className="pt-40 text-center pb-40 text-[10px] tracking-[0.2em] uppercase">Collection not found.</div>;
  }

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
        02 / Daily Series
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <div>
            <div className="flex items-center text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-6">
              <Link href="/roastery" className="hover:text-kalana-black transition-colors">Roastery</Link>
              <span className="mx-2">/</span>
              <Link href="/roastery/collection" className="hover:text-kalana-black transition-colors">Collection</Link>
            </div>
            <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter uppercase leading-none">Daily<br/>Series.</h1>
          </div>
          <p className="text-sm font-light text-kalana-black/70 max-w-sm border-l border-kalana-black/20 pl-6 hidden md:block">
            Everyday blends designed for consistency, versatility, and easy drinking. Built to perform across espresso, americano, and milk-based coffee.
          </p>
        </div>

        {/* Editorial Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          
          {/* Product 1 */}
          <div className="group flex flex-col relative">
            <span className="absolute -top-8 text-[10px] tracking-[0.2em] text-kalana-black/40">Product / 001</span>
            <Link href="/product/daily-house" className="block w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 mb-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-kalana-black/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <Link href="/product/daily-house">
                  <h4 className="text-2xl font-semibold uppercase tracking-wide group-hover:opacity-50 transition-opacity">Daily House</h4>
                </Link>
                <p className="text-sm font-medium">IDR 95.000</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60 border-y border-kalana-black/10 py-4 mb-6">
                <span>70% Robusta / 30% Arabica</span>
                <span>Medium-Dark</span>
                <span className="col-span-2 mt-2">Dark Chocolate, Peanut, Brown Sugar</span>
              </div>
              
              <div className="flex gap-4 mt-auto">
                <button className="flex-1 py-3 border border-kalana-black text-kalana-black text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/5 transition-colors">
                  Quick Add
                </button>
                <Link href="/product/daily-house" className="flex-1 py-3 bg-kalana-black border border-kalana-black text-kalana-offwhite text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors">
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Product 2 */}
          <div className="group flex flex-col relative lg:mt-32">
            <span className="absolute -top-8 text-[10px] tracking-[0.2em] text-kalana-black/40">Product / 002</span>
            <Link href="/product/daily-crema" className="block w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 mb-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-kalana-black/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <Link href="/product/daily-crema">
                  <h4 className="text-2xl font-semibold uppercase tracking-wide group-hover:opacity-50 transition-opacity">Daily Crema</h4>
                </Link>
                <p className="text-sm font-medium">IDR 110.000</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60 border-y border-kalana-black/10 py-4 mb-6">
                <span>50% Arabica / 50% Robusta</span>
                <span>Medium</span>
                <span className="col-span-2 mt-2">Milk Chocolate, Caramel, Roasted Nuts</span>
              </div>
              
              <div className="flex gap-4 mt-auto">
                <button className="flex-1 py-3 border border-kalana-black text-kalana-black text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/5 transition-colors">
                  Quick Add
                </button>
                <Link href="/product/daily-crema" className="flex-1 py-3 bg-kalana-black border border-kalana-black text-kalana-offwhite text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors">
                  View
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
