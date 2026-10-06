import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const DEFAULT_EVENTS = [
  { date: "Oct 12, 2026", title: "Manual Brew Basics", type: "Coffee Education", price: "IDR 150.000", desc: "Learn the fundamentals of pour-over coffee, from grind size to extraction.", registrationUrl: "" },
  { date: "Oct 26, 2026", title: "Espresso Calibration", type: "Coffee Education", price: "IDR 200.000", desc: "A deep dive into dialling in espresso, understanding yield, and pulling the perfect shot.", registrationUrl: "" },
  { date: "Nov 05, 2026", title: "Analog Photo Walk", type: "Creative Workshops", price: "Free", desc: "A morning walk around Cikampek with fellow film enthusiasts. Meet at KALANA Space.", registrationUrl: "" },
];

export default async function WorkshopsPage() {
  const dbEvents = await db.query.events.findMany({
    orderBy: [desc(events.date)]
  }).catch(() => []);

  const displayEvents = dbEvents.length > 0 
    ? dbEvents.map((ev) => ({
        date: ev.date ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Upcoming",
        title: ev.title,
        type: ev.type || "Workshop",
        price: ev.price === 0 ? "Free" : `IDR ${Number(ev.price).toLocaleString("id-ID")}`,
        desc: ev.description || "",
        registrationUrl: ev.registrationUrl || "#"
      }))
    : DEFAULT_EVENTS;

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
        03 / Workshops
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Space</p>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none">Workshops.</h1>
          </div>
          <p className="text-sm font-light text-kalana-black/70 max-w-xs text-right">
            Gatherings designed around coffee, creativity, and community.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-24 pb-8 border-b border-kalana-black/10">
          <button className="px-6 py-2 border-kalana-black bg-kalana-black text-kalana-offwhite text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors">All Events</button>
          <button className="px-6 py-2 border border-kalana-black/20 bg-transparent text-kalana-black hover:border-kalana-black text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors">Coffee Education</button>
          <button className="px-6 py-2 border border-kalana-black/20 bg-transparent text-kalana-black hover:border-kalana-black text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors">Creative Workshops</button>
          <button className="px-6 py-2 border border-kalana-black/20 bg-transparent text-kalana-black hover:border-kalana-black text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors">Community</button>
        </div>

        {/* Events Layout (Editorial List) */}
        <div className="space-y-0 border-b border-kalana-black/20">
          {displayEvents.map((event, i) => (
            <div key={i} className="group flex flex-col lg:flex-row justify-between lg:items-center gap-8 border-t border-kalana-black/20 py-12 hover:bg-kalana-black/5 transition-colors px-4 -mx-4 cursor-pointer">
              
              <div className="lg:w-1/4 flex flex-col gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/40">0{i+1}</span>
                <p className="text-xs tracking-[0.2em] uppercase font-semibold">{event.date}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/60">{event.type}</p>
              </div>

              <div className="lg:w-2/4">
                <h3 className="text-3xl md:text-4xl font-semibold tracking-tight uppercase group-hover:pl-4 transition-all">{event.title}</h3>
                {event.desc && <p className="text-xs text-kalana-black/60 mt-2 font-light">{event.desc}</p>}
              </div>
              
              <div className="lg:w-1/4 flex flex-col lg:items-end justify-between h-full gap-4">
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold">{event.price}</p>
                <Link 
                  href={event.registrationUrl || "#"} 
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity flex items-center"
                >
                  Register <ArrowRight className="w-3 h-3 ml-2" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
