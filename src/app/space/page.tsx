import Image from "next/image";
import Link from "next/link";

export default function SpacePage() {
  return (
    <div className="w-full bg-kalana-offwhite pt-32 text-kalana-black min-h-screen">
      
      {/* Editorial Hero Section */}
      <section className="relative w-full px-6 lg:px-12 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-kalana-black/20 pb-24">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8">03 / Space</p>
              <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter uppercase leading-[0.85] mb-12">
                Come<br/>Wander<br/>In.
              </h1>
            </div>
            
            <div className="border-l border-kalana-black/20 pl-6 max-w-sm">
               <p className="text-sm font-light text-kalana-black/80 leading-relaxed mb-6">
                 Coffee, conversations, workshops, and somewhere to stay awhile.
               </p>
               <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">Cikampek, West Java</p>
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div className="w-full aspect-[4/3] bg-kalana-black/5 border border-kalana-black/10 relative">
               {/* Hero Image */}
            </div>
          </div>
        </div>
      </section>

      {/* Atmosphere Section */}
      <section className="py-24 px-6 lg:px-12 border-b border-kalana-black/20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-4 border-t border-kalana-black/20 pt-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Atmosphere</h2>
            <h3 className="text-3xl font-semibold tracking-tight uppercase">Sanctuary<br/>From the Noise.</h3>
          </div>
          
          <div className="md:col-span-8 flex flex-col gap-16">
            <p className="text-lg md:text-xl font-light text-kalana-black/80 leading-relaxed max-w-2xl">
              Designed as a sanctuary from the noise. Our space uses natural light, warm materials, and generous spacing to create an environment where you can focus, connect, or simply do nothing at all.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10"></div>
               <div className="aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10 sm:mt-16"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Bar */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block z-10 rotate-180">
          The Coffee Bar
        </div>
        
        <div className="container mx-auto">
          <div className="w-full aspect-[21/9] bg-kalana-black/5 border border-kalana-black/10 mb-16 relative"></div>
          
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-light text-kalana-black/80 leading-relaxed">
              The heart of KALANA. This is where our Roastery comes to life. We serve our Daily Series alongside a rotating selection of manual brews and specialty creations.
            </p>
          </div>
        </div>
      </section>

      {/* Location & Info */}
      <section className="py-32 px-6 lg:px-12 bg-kalana-black text-kalana-offwhite">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          <div className="md:col-span-5 order-2 md:order-1">
            <h2 className="text-4xl md:text-6xl font-semibold uppercase tracking-tighter mb-16 border-b border-kalana-offwhite/20 pb-8">Visit Us.</h2>
            
            <div className="space-y-16">
              <div>
                <h3 className="text-[10px] tracking-[0.2em] text-kalana-offwhite/50 uppercase mb-4">Location</h3>
                <p className="text-sm tracking-wide leading-relaxed">
                  Jl. Ahmad Yani No. 45<br />
                  Cikampek, Karawang<br />
                  West Java 41373
                </p>
              </div>
              
              <div>
                <h3 className="text-[10px] tracking-[0.2em] text-kalana-offwhite/50 uppercase mb-4">Hours</h3>
                <div className="space-y-2 text-sm tracking-wide">
                  <div className="flex justify-between max-w-xs border-b border-kalana-offwhite/10 pb-2">
                    <span>Mon — Thu</span> 
                    <span>08:00 — 22:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs border-b border-kalana-offwhite/10 pb-2">
                    <span>Fri — Sun</span> 
                    <span>07:00 — 23:00</span>
                  </div>
                </div>
              </div>

              <div>
                <Link href="#" className="inline-block text-[10px] tracking-[0.2em] uppercase border-b border-kalana-offwhite pb-1 hover:opacity-50 transition-opacity">
                  Get Directions →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-7 order-1 md:order-2 h-full min-h-[500px]">
             <div className="w-full h-full bg-kalana-offwhite/10 border border-kalana-offwhite/20 flex items-center justify-center">
               <span className="text-[10px] text-kalana-offwhite/30 tracking-[0.2em] uppercase">Map View</span>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
}
