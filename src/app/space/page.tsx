import Link from "next/link";
import Image from "next/image";
import { getPageContent, getLocation } from "@/lib/cms-api";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Space & Sanctuary | KALANA",
  description: "A sanctuary from the noise. Discover our physical space, coffee bar, and upcoming workshops in Cikampek.",
};

export default async function SpacePage() {
  const [page, location, upcomingEvents] = await Promise.all([
    getPageContent("space"),
    getLocation(),
    db.query.events.findMany({
      where: eq(events.status, "UPCOMING"),
      orderBy: [desc(events.date)],
      limit: 3,
    }).catch(() => []),
  ]);

  return (
    <div className="w-full bg-kalana-offwhite pt-32 text-kalana-black min-h-screen">
      {/* Editorial Hero Section */}
      <section className="relative w-full px-6 lg:px-12 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-kalana-black/20 pb-24">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8 font-mono">
                {page.eyebrow || "03 / Space"}
              </p>
              <h1
                className="text-6xl md:text-8xl font-semibold tracking-tighter uppercase leading-[0.85] mb-12"
                dangerouslySetInnerHTML={{ __html: page.headline || "Come<br/>Wander<br/>In." }}
              />
            </div>

            <div className="border-l border-kalana-black/20 pl-6 max-w-sm">
              <p className="text-sm font-light text-kalana-black/80 leading-relaxed mb-6">
                {page.description}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 font-mono">
                {page.locationTag || `${location.address || "Cikampek"}, ${location.province || "West Java"}`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="w-full aspect-[4/3] bg-kalana-black/5 border border-kalana-black/10 relative overflow-hidden">
              {page.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.heroImage} alt={page.headline || "Space Hero"} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-kalana-black mix-blend-multiply opacity-5"></div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Atmosphere Section */}
      <section className="py-24 px-6 lg:px-12 border-b border-kalana-black/20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-4 border-t border-kalana-black/20 pt-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4 font-mono">Atmosphere</h2>
            <h3
              className="text-3xl font-semibold tracking-tight uppercase"
              dangerouslySetInnerHTML={{ __html: page.atmosphereTitle || "Sanctuary<br/>From the Noise." }}
            />
          </div>

          <div className="md:col-span-8 flex flex-col gap-16">
            <p className="text-lg md:text-xl font-light text-kalana-black/80 leading-relaxed max-w-2xl">
              {page.atmosphereDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10 overflow-hidden relative">
                {page.atmosphereImage1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.atmosphereImage1} alt="Atmosphere" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10 sm:mt-16 overflow-hidden relative">
                {page.atmosphereImage2 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.atmosphereImage2} alt="Atmosphere detail" className="w-full h-full object-cover" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Bar */}
      <section className="py-32 px-6 lg:px-12 border-b border-kalana-black/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block z-10 rotate-180">
          {page.coffeeBarTitle || "The Coffee Bar"}
        </div>

        <div className="container mx-auto">
          <div className="w-full aspect-[21/9] bg-kalana-black/5 border border-kalana-black/10 mb-16 relative overflow-hidden">
            {page.coffeeBarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.coffeeBarImage} alt="Coffee Bar" className="w-full h-full object-cover" />
            ) : null}
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-light text-kalana-black/80 leading-relaxed">
              {page.coffeeBarDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Activities / Workshops Section (Live from DB) */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 px-6 lg:px-12 border-b border-kalana-black/20">
          <div className="container mx-auto max-w-5xl">
            <div className="flex justify-between items-end border-b border-kalana-black pb-8 mb-12">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 font-mono mb-2">
                  Calendar
                </p>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase">
                  Upcoming at The Space.
                </h2>
              </div>
              <Link
                href="/space/workshops"
                className="text-xs font-mono uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1.5"
              >
                All Workshops <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((ev, idx) => {
                const dateStr = ev.date
                  ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Upcoming";
                return (
                  <div
                    key={ev.id}
                    className="p-6 bg-white border border-kalana-black/10 hover:border-kalana-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-kalana-black/50">
                        <span>{ev.category || ev.type}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:underline underline-offset-4">
                        {ev.title}
                      </h3>
                      {ev.description && (
                        <p className="text-xs text-kalana-black/70 font-light max-w-xl line-clamp-1">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <span className="text-xs font-mono font-bold">
                        {ev.price === 0 || !ev.price ? "Free" : `IDR ${Number(ev.price).toLocaleString("id-ID")}`}
                      </span>
                      <Link
                        href={ev.registrationUrl || "/space/workshops"}
                        className="px-4 py-2 bg-kalana-black text-white text-[10px] font-mono tracking-widest uppercase hover:bg-kalana-black/80 transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Location & Info */}
      <section className="py-32 px-6 lg:px-12 bg-kalana-black text-kalana-offwhite">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5 order-2 md:order-1">
            <h2 className="text-4xl md:text-6xl font-semibold uppercase tracking-tighter mb-16 border-b border-kalana-offwhite/20 pb-8">
              Visit Us.
            </h2>

            <div className="space-y-16">
              <div>
                <h3 className="text-[10px] tracking-[0.2em] text-kalana-offwhite/50 uppercase mb-4 font-mono">
                  Location
                </h3>
                <p className="text-sm tracking-wide leading-relaxed font-light">
                  {location.address}
                  <br />
                  {location.city || ""} {location.province || ""}
                </p>
              </div>

              <div>
                <h3 className="text-[10px] tracking-[0.2em] text-kalana-offwhite/50 uppercase mb-4 font-mono">
                  Hours
                </h3>
                <div className="space-y-2 text-sm tracking-wide font-light">
                  <div className="flex justify-between max-w-xs border-b border-kalana-offwhite/10 pb-2">
                    <span>Opening Hours</span>
                    <span>{location.openingHours || "08:00 — 22:00"}</span>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href={location.googleMapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] tracking-[0.2em] uppercase border-b border-kalana-offwhite pb-1 hover:opacity-50 transition-opacity font-mono"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 order-1 md:order-2 h-full min-h-[450px]">
            {location.coverImageUrl ? (
              <div className="w-full h-full min-h-[450px] relative rounded overflow-hidden border border-kalana-offwhite/20">
                <Image
                  src={location.coverImageUrl}
                  alt={location.name || "KALANA Space"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-kalana-offwhite/10 border border-kalana-offwhite/20 flex items-center justify-center p-8 text-center min-h-[450px]">
                <div>
                  <span className="text-sm font-semibold tracking-widest uppercase block mb-2 font-mono">
                    {location.name || "KALANA SPACE"}
                  </span>
                  <span className="text-[10px] text-kalana-offwhite/50 tracking-[0.2em] uppercase block font-mono">
                    {location.address}, {location.province}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
