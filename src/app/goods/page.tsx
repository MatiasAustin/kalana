import Link from "next/link";

export default function GoodsPage() {
  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-24 min-h-screen flex flex-col relative overflow-hidden">
      
      <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180 z-20">
        04 / Goods
      </div>

      <section className="flex-grow w-full flex items-center justify-center p-6 lg:p-12 border-b border-kalana-black/20">
        <div className="w-full h-full bg-kalana-black/5 border border-kalana-black/10 flex flex-col items-center justify-center p-6 relative">
          
          <div className="absolute top-6 right-6 text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 text-right">
            In Development<br/>Est. 2026
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-[12vw] lg:text-[160px] font-semibold tracking-tighter uppercase leading-[0.85] mb-12">
              Goods.
            </h1>
            <p className="text-sm tracking-wide font-light max-w-md mx-auto mb-16 border-l border-kalana-black/20 pl-6 text-left">
              Objects for the journey. A future collection of apparel, coffee tools, bags, and lifestyle accessories.
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] text-kalana-black/40 uppercase mb-24 max-w-lg mx-auto">
              <span>Apparel</span>
              <span>/</span>
              <span>Coffee Tools</span>
              <span>/</span>
              <span>Bags</span>
              <span>/</span>
              <span>Accessories</span>
              <span>/</span>
              <span>Objects</span>
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
