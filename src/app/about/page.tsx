export default function AboutPage() {
  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180">
        05 / About
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none">About<br/>Kalana.</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 text-right">
            Brand Story<br/>Est. 2026
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-32">
            
            <section className="relative">
              <span className="absolute -top-6 text-[10px] tracking-[0.2em] text-kalana-black/40 uppercase">Chapter 01</span>
              <h2 className="text-3xl font-semibold uppercase tracking-tight mb-8">The Journey.</h2>
              <p className="text-lg md:text-xl font-light leading-relaxed text-kalana-black/80 max-w-2xl border-l border-kalana-black/20 pl-6">
                KALANA exists at the intersection of coffee, space, and the daily rituals that define our lives. We believe that coffee is more than just a beverage; it's a marker of time, a catalyst for conversation, and a companion for the quiet moments in between.
              </p>
            </section>

            <section className="relative">
              <span className="absolute -top-6 text-[10px] tracking-[0.2em] text-kalana-black/40 uppercase">Chapter 02</span>
              <h2 className="text-3xl font-semibold uppercase tracking-tight mb-8">The Raven.</h2>
              <p className="text-lg md:text-xl font-light leading-relaxed text-kalana-black/80 max-w-2xl border-l border-kalana-black/20 pl-6">
                Our mascot, the raven, represents curiosity, perspective, and the wanderer's spirit. It is a subtle nod to our philosophy of constant exploration, whether that means refining our roast profiles, designing physical spaces, or creating objects for everyday use.
              </p>
            </section>

          </div>

          <div className="lg:col-span-4 lg:border-l border-kalana-black/20 lg:pl-12 pt-12 lg:pt-0">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-12">Architecture</h2>
            
            <div className="space-y-12">
              <div className="border-b border-kalana-black/10 pb-8">
                <h3 className="text-xl font-semibold uppercase tracking-wide mb-4">Space</h3>
                <p className="text-xs font-light text-kalana-black/70 leading-relaxed">A physical anchor for our community. A place designed for slowing down.</p>
              </div>
              <div className="border-b border-kalana-black/10 pb-8">
                <h3 className="text-xl font-semibold uppercase tracking-wide mb-4">Roastery</h3>
                <p className="text-xs font-light text-kalana-black/70 leading-relaxed">The core of our craft. Producing consistent, approachable blends and single origins.</p>
              </div>
              <div className="border-b border-kalana-black/10 pb-8">
                <h3 className="text-xl font-semibold uppercase tracking-wide mb-4">Goods</h3>
                <p className="text-xs font-light text-kalana-black/70 leading-relaxed">Future artifacts. Objects and tools that carry the KALANA ethos beyond our walls.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
