import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CollectionsPage() {
  const collections = [
    {
      name: "Daily Series",
      status: "Available",
      description: "Everyday blends designed for consistency, versatility, and easy drinking.",
      slug: "daily-series",
      count: 2
    },
    {
      name: "Signature Series",
      status: "Coming Soon",
      description: "Complex, carefully profiled single origins focusing on distinct regional characteristics.",
      slug: "signature-series",
      count: 0
    },
    {
      name: "Specialty Series",
      status: "Coming Soon",
      description: "High-scoring microlots, experimentals, and competition-grade coffees.",
      slug: "specialty-series",
      count: 0
    },
    {
      name: "Limited Release",
      status: "Coming Soon",
      description: "Seasonal drops, rare finds, and unique collaborations.",
      slug: "limited-release",
      count: 0
    }
  ];

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
        02 / Collections
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Roastery</p>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none">Collections.</h1>
          </div>
          <p className="text-sm font-light text-kalana-black/70 max-w-xs text-right">
            Our approach to coffee is structured. Each series serves a specific purpose in the daily ritual.
          </p>
        </div>

        <div className="space-y-16">
          {collections.map((collection, idx) => (
            <div key={idx} className="group flex flex-col md:flex-row justify-between md:items-start gap-8 border-b border-kalana-black/10 pb-16 relative">
              <span className="absolute -top-8 text-[10px] tracking-[0.2em] text-kalana-black/30">C / 0{idx+1}</span>
              
              <div className="md:w-1/3">
                <h2 className="text-3xl font-semibold uppercase tracking-tight mb-4 group-hover:pl-4 transition-all">{collection.name}</h2>
                <div className="flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase">
                  <span className={collection.status === "Available" ? "text-kalana-black" : "text-kalana-black/40"}>{collection.status}</span>
                  {collection.count > 0 && (
                    <>
                      <span className="w-4 h-[1px] bg-kalana-black/20"></span>
                      <span className="text-kalana-black/50">{collection.count} Products</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/2 flex flex-col justify-between items-start md:items-end md:text-right h-full">
                <p className="text-sm font-light text-kalana-black/80 max-w-sm leading-relaxed mb-8">{collection.description}</p>
                
                {collection.status === "Available" ? (
                  <Link 
                    href={`/roastery/collection/${collection.slug}`}
                    className="inline-flex items-center text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity"
                  >
                    View Collection →
                  </Link>
                ) : (
                  <span className="inline-flex items-center text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 border-b border-transparent pb-1">
                    In Development
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
