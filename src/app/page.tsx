import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100vh] w-full pt-32 pb-24 px-6 lg:px-12 flex flex-col justify-between border-b border-kalana-black/20">
        
        {/* Floating Metadata */}
        <div className="absolute top-32 right-12 text-[10px] tracking-[0.2em] uppercase text-kalana-black/60 text-right hidden lg:block">
          KALANA Space &amp; Roastery<br/>
          Est. 2026<br/>
          West Java
        </div>

        <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
          01 / Intro
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 lg:mt-24 flex-grow">
          <div className="lg:col-span-7 flex flex-col justify-center relative z-20">
            <h1 className="text-[12vw] lg:text-[140px] font-semibold tracking-tighter leading-[0.85] uppercase mb-12">
              Space.<br/>
              Coffee.<br/>
              Further<br/>
              Days.
            </h1>
            <div className="flex flex-col sm:flex-row gap-8 sm:items-center">
              <Link href="/roastery" className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity flex items-center w-max">
                Explore KALANA <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1} />
              </Link>
              <span className="text-[10px] tracking-widest uppercase text-kalana-black/40">Or</span>
              <Link href="/space" className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity flex items-center w-max">
                Visit Us <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1} />
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative flex items-end">
            <div className="w-full aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10 relative overflow-hidden">
               {/* Hero Image */}
               <div className="absolute inset-0 bg-kalana-black mix-blend-multiply opacity-10"></div>
            </div>
            <div className="absolute -bottom-8 -left-16 w-48 aspect-square bg-kalana-black/10 border border-kalana-black/20 hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTION (EDITORIAL) */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20 relative">
        <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
          02 / Roastery
        </div>
        
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Featured</p>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight uppercase leading-none">Daily Series.</h2>
            </div>
            <p className="text-sm tracking-wide max-w-sm text-kalana-black/70">
              Two everyday blends made for the way coffee is actually enjoyed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            
            {/* Editorial Product 1 */}
            <div className="flex flex-col">
              <div className="flex gap-4 items-start mb-8 border-t border-kalana-black/20 pt-4">
                <span className="text-[10px] tracking-widest text-kalana-black/30">01</span>
                <div>
                  <h3 className="text-2xl font-semibold uppercase tracking-wide mb-4">Daily House</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60">
                    <span>70% Robusta / 30% Arabica</span>
                    <span>Medium-Dark</span>
                    <span className="col-span-2 mt-2">Dark Chocolate, Peanut, Brown Sugar</span>
                  </div>
                </div>
              </div>
              <div className="w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 relative mb-8"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">IDR 95.000</span>
                <Link href="/product/daily-house" className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                  View Product →
                </Link>
              </div>
            </div>

            {/* Editorial Product 2 */}
            <div className="flex flex-col lg:mt-32">
              <div className="flex gap-4 items-start mb-8 border-t border-kalana-black/20 pt-4">
                <span className="text-[10px] tracking-widest text-kalana-black/30">02</span>
                <div>
                  <h3 className="text-2xl font-semibold uppercase tracking-wide mb-4">Daily Crema</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60">
                    <span>50% Arabica / 50% Robusta</span>
                    <span>Medium</span>
                    <span className="col-span-2 mt-2">Milk Chocolate, Caramel, Roasted Nuts</span>
                  </div>
                </div>
              </div>
              <div className="w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 relative mb-8"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">IDR 110.000</span>
                <Link href="/product/daily-crema" className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                  View Product →
                </Link>
              </div>
            </div>

          </div>
          
          <div className="mt-24 text-center">
             <Link href="/roastery" className="text-xs font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                Shop Roastery →
             </Link>
          </div>
        </div>
      </section>

      {/* 3. KALANA STORY */}
      <section className="py-40 px-6 lg:px-12 border-b border-kalana-black/20 bg-kalana-black text-kalana-offwhite relative overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 lg:col-start-2 z-10">
            <h2 className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter leading-none mb-12">
              Made<br/>For the<br/>Daily<br/>Ritual.
            </h2>
            <Link href="/about" className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-offwhite pb-1 hover:opacity-50 transition-opacity">
              Our Story →
            </Link>
          </div>
          <div className="lg:col-span-5 relative">
            <p className="text-lg md:text-xl font-light leading-relaxed text-kalana-offwhite/80 mb-8 border-l border-kalana-offwhite/20 pl-8">
              From the first cup of the morning to the last conversation of the day, KALANA is built around the little rituals that make the journey worth remembering.
            </p>
            <div className="absolute -top-32 -right-32 text-[20vw] opacity-5 text-kalana-offwhite font-bold tracking-tighter pointer-events-none hidden lg:block">
              RITUAL
            </div>
          </div>
        </div>
      </section>

      {/* 4 & 5. SOCIAL PROOF & REVIEWS */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20 relative">
        <div className="container mx-auto">
          <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-16">
             <h2 className="text-xs tracking-[0.2em] uppercase text-kalana-black/50">Community</h2>
             <span className="text-[10px] tracking-widest uppercase">4.9/5 Rating</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { text: "Not just another coffee shop. The space feels intentional, and the Daily House blend is perfectly balanced.", author: "Arif R." },
              { text: "My go-to place in Cikampek for deep work. The atmosphere is calm and the manual brew is always on point.", author: "Nadia K." },
              { text: "Took home the Daily Crema beans. It makes my morning routine something I actually look forward to.", author: "Bima S." }
            ].map((review, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-4xl text-kalana-black/20 mb-6">"</span>
                <p className="text-xl md:text-2xl font-medium tracking-tight leading-snug uppercase mb-12">
                  {review.text}
                </p>
                <div className="mt-auto border-t border-kalana-black/10 pt-4 flex justify-between">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">{review.author}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/30">0{idx+1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. KALANA SPACE SECTION */}
      <section className="py-40 px-6 lg:px-12 border-b border-kalana-black/20 relative">
        <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
          03 / Space
        </div>
        
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7">
              <div className="w-full aspect-video bg-kalana-black/5 border border-kalana-black/10"></div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 pt-12">
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-6">Kalana Space</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter uppercase mb-8 leading-none">Come<br/>Wander<br/>In.</h2>
              <p className="text-sm font-light text-kalana-black/70 mb-12">
                A place to slow down, meet people, work for a while, or simply have another cup.
              </p>
              
              <div className="space-y-2 mb-12 text-[10px] tracking-[0.2em] uppercase border-l border-kalana-black/20 pl-4">
                <p>Cikampek</p>
                <p>West Java</p>
              </div>

              <Link href="/space" className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                Visit Space →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WORKSHOPS / EVENTS */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-end border-b border-kalana-black pb-8 mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase">Workshops.</h2>
            <Link href="/space/workshops" className="text-[10px] font-semibold tracking-[0.2em] uppercase hover:opacity-50 transition-opacity hidden sm:block">
              See All →
            </Link>
          </div>

          <div className="space-y-8">
            {[
              { date: "Oct 12", year: "2026", title: "Manual Brew Basics", category: "Education" },
              { date: "Oct 26", year: "2026", title: "Espresso Calibration", category: "Education" },
              { date: "Nov 05", year: "2026", title: "Analog Photo Walk", category: "Creative" }
            ].map((event, i) => (
              <div key={i} className="group border-b border-kalana-black/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:border-kalana-black transition-colors">
                <div className="flex items-center gap-8 md:w-1/3">
                   <span className="text-xs tracking-widest text-kalana-black/30">0{i+1}</span>
                   <div>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-kalana-black/60">{event.date}</p>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-kalana-black/40">{event.year}</p>
                   </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium uppercase tracking-tight md:w-1/3 group-hover:pl-4 transition-all">{event.title}</h3>
                <div className="md:w-1/3 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase">
                  <span className="text-kalana-black/50">{event.category}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">Register →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER */}
      <section className="py-40 px-6 lg:px-12 flex flex-col items-center text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8">Newsletter</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase mb-6">Stay in the loop.</h2>
        <p className="text-xs tracking-wide text-kalana-black/60 mb-12 max-w-sm">New beans, workshops, events, and things we're working on.</p>
        
        <form className="flex w-full max-w-md border-b border-kalana-black pb-2">
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            className="flex-1 bg-transparent text-xs tracking-widest text-kalana-black placeholder:text-kalana-black/30 focus:outline-none uppercase"
            required
          />
          <button type="submit" className="text-[10px] font-semibold tracking-[0.2em] uppercase hover:opacity-50 transition-opacity pl-4">
            Join →
          </button>
        </form>
      </section>
    </div>
  );
}
