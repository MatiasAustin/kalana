import { getPageContent } from "@/lib/cms-api";

export default async function AboutPage() {
  const page = await getPageContent("about");

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180">
        {page.eyebrow || "05 / About"}
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <h1 
            className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none"
            dangerouslySetInnerHTML={{ __html: page.title || "About<br/>Kalana." }}
          />
          <p 
            className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 text-right"
            dangerouslySetInnerHTML={{ __html: page.subtitle || "Brand Story<br/>Est. 2026" }}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-32">
            
            {(Array.isArray(page.chapters) ? page.chapters : []).map((ch: any, idx: number) => (
              <section key={idx} className="relative">
                <span className="absolute -top-6 text-[10px] tracking-[0.2em] text-kalana-black/40 uppercase">
                  {ch.tag || `Chapter 0${idx + 1}`}
                </span>
                <h2 className="text-3xl font-semibold uppercase tracking-tight mb-8">
                  {ch.title}
                </h2>
                <p className="text-lg md:text-xl font-light leading-relaxed text-kalana-black/80 max-w-2xl border-l border-kalana-black/20 pl-6">
                  {ch.content}
                </p>
              </section>
            ))}

          </div>

          <div className="lg:col-span-4 lg:border-l border-kalana-black/20 lg:pl-12 pt-12 lg:pt-0">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-12">Architecture</h2>
            
            <div className="space-y-12">
              {(Array.isArray(page.architecture) ? page.architecture : []).map((arch: any, idx: number) => (
                <div key={idx} className="border-b border-kalana-black/10 pb-8">
                  <h3 className="text-xl font-semibold uppercase tracking-wide mb-4">{arch.title}</h3>
                  <p className="text-xs font-light text-kalana-black/70 leading-relaxed">{arch.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
