import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomepage, getProducts, getLocation } from "@/lib/cms-api";

export default async function Home() {
  const homepage = await getHomepage();
  const products = await getProducts();
  const location = await getLocation();

  // Get only featured products for the collection
  const featuredProducts = products.filter((p: any) => p.collection === homepage.featuredCollection.collectionHandle);

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100vh] w-full pt-32 pb-24 px-6 lg:px-12 flex flex-col justify-between border-b border-kalana-black/20">
        
        {/* Floating Metadata */}
        <div className="absolute top-32 right-12 text-[10px] tracking-[0.2em] uppercase text-kalana-black/60 text-right hidden lg:block">
          {homepage.hero.eyebrow}<br/>
          {homepage.hero.established}<br/>
          {location.province}
        </div>

        <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
          01 / Intro
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 lg:mt-24 flex-grow">
          <div className="lg:col-span-7 flex flex-col justify-center relative z-20">
            <h1 
              className="text-[12vw] lg:text-[140px] font-semibold tracking-tighter leading-[0.85] uppercase mb-12"
              dangerouslySetInnerHTML={{ __html: homepage.hero.headline }}
            />
            <div className="flex flex-col sm:flex-row gap-8 sm:items-center">
              <Link href={homepage.hero.primaryCtaUrl} className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity flex items-center w-max">
                {homepage.hero.primaryCtaLabel} <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1} />
              </Link>
              <span className="text-[10px] tracking-widest uppercase text-kalana-black/40">Or</span>
              <Link href={homepage.hero.secondaryCtaUrl} className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity flex items-center w-max">
                {homepage.hero.secondaryCtaLabel} <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1} />
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
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">{homepage.featuredCollection.eyebrow}</p>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight uppercase leading-none">{homepage.featuredCollection.title}</h2>
            </div>
            <p className="text-sm tracking-wide max-w-sm text-kalana-black/70">
              {homepage.featuredCollection.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            
            {featuredProducts.map((product: any, index: number) => (
              <div key={product.id} className={`flex flex-col ${index % 2 !== 0 ? 'lg:mt-32' : ''}`}>
                <div className="flex gap-4 items-start mb-8 border-t border-kalana-black/20 pt-4">
                  <span className="text-[10px] tracking-widest text-kalana-black/30">0{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-semibold uppercase tracking-wide mb-4">{product.name}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] tracking-widest uppercase text-kalana-black/60">
                      <span>{product.blend}</span>
                      <span>{product.roast}</span>
                      <span className="col-span-2 mt-2">{product.tastingNotes}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full aspect-[4/5] bg-kalana-black/5 border border-kalana-black/10 relative mb-8"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{product.price}</span>
                  <Link href={`/product/${product.handle}`} className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                    View Product →
                  </Link>
                </div>
              </div>
            ))}

          </div>
          
          <div className="mt-24 text-center">
             <Link href={homepage.featuredCollection.ctaUrl} className="text-xs font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                {homepage.featuredCollection.ctaLabel}
             </Link>
          </div>
        </div>
      </section>

      {/* 3. KALANA STORY */}
      <section className="py-40 px-6 lg:px-12 border-b border-kalana-black/20 bg-kalana-black text-kalana-offwhite relative overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 lg:col-start-2 z-10">
            <h2 
              className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter leading-none mb-12"
              dangerouslySetInnerHTML={{ __html: homepage.brandStory.headline }}
            />
            <Link href={homepage.brandStory.ctaUrl} className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-offwhite pb-1 hover:opacity-50 transition-opacity">
              {homepage.brandStory.ctaLabel}
            </Link>
          </div>
          <div className="lg:col-span-5 relative">
            <p className="text-lg md:text-xl font-light leading-relaxed text-kalana-offwhite/80 mb-8 border-l border-kalana-offwhite/20 pl-8">
              {homepage.brandStory.description}
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
             <h2 className="text-xs tracking-[0.2em] uppercase text-kalana-black/50">{homepage.socialProof.eyebrow}</h2>
             <span className="text-[10px] tracking-widest uppercase">{homepage.socialProof.rating}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {homepage.socialProof.reviews.map((review: any, idx: number) => (
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
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-6">{homepage.space.eyebrow}</p>
              <h2 
                className="text-4xl md:text-5xl font-semibold tracking-tighter uppercase mb-8 leading-none"
                dangerouslySetInnerHTML={{ __html: homepage.space.title }}
              />
              <p className="text-sm font-light text-kalana-black/70 mb-12">
                {homepage.space.description}
              </p>
              
              <div className="space-y-2 mb-12 text-[10px] tracking-[0.2em] uppercase border-l border-kalana-black/20 pl-4">
                <p>{location.address}</p>
                <p>{location.province}</p>
              </div>

              <Link href={homepage.space.ctaUrl} className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity">
                {homepage.space.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WORKSHOPS / EVENTS */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-end border-b border-kalana-black pb-8 mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase">{homepage.workshops.title}</h2>
            <Link href={homepage.workshops.ctaUrl} className="text-[10px] font-semibold tracking-[0.2em] uppercase hover:opacity-50 transition-opacity hidden sm:block">
              {homepage.workshops.ctaLabel}
            </Link>
          </div>

          <div className="space-y-8">
            {homepage.workshops.events.map((event: any, i: number) => (
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
        <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8">{homepage.newsletter.eyebrow}</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase mb-6">{homepage.newsletter.title}</h2>
        <p className="text-xs tracking-wide text-kalana-black/60 mb-12 max-w-sm">{homepage.newsletter.description}</p>
        
        <form className="flex w-full max-w-md border-b border-kalana-black pb-2">
          <input 
            type="email" 
            placeholder={homepage.newsletter.placeholder} 
            className="flex-1 bg-transparent text-xs tracking-widest text-kalana-black placeholder:text-kalana-black/30 focus:outline-none uppercase"
            required
          />
          <button type="submit" className="text-[10px] font-semibold tracking-[0.2em] uppercase hover:opacity-50 transition-opacity pl-4">
            {homepage.newsletter.ctaLabel}
          </button>
        </form>
      </section>
    </div>
  );
}
