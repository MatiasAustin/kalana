import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getPageContent } from "@/lib/cms-api";
import { WorkshopsListClient } from "@/components/WorkshopsListClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roastery Workshops & Events | KALANA",
  description: "Join coffee education masterclasses, espresso calibrations, and community gatherings at KALANA Space.",
};

export default async function WorkshopsPage() {
  const [dbEvents, page] = await Promise.all([
    db.query.events.findMany({
      orderBy: [desc(events.date)],
    }).catch(() => []),
    getPageContent("workshops"),
  ]);

  const formattedEvents = dbEvents.map((ev) => {
    let dateStr = "Upcoming";
    if (ev.date) {
      const d = typeof ev.date === "string" || typeof ev.date === "number" ? new Date(ev.date) : ev.date;
      dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    let timeStr = "";
    if (ev.startTime) {
      timeStr = `${ev.startTime} - ${ev.endTime || "End"}`;
    }

    let priceStr = "Free";
    if (ev.price && Number(ev.price) > 0) {
      priceStr = `IDR ${Number(ev.price).toLocaleString("id-ID")}`;
    }

    return {
      id: ev.id,
      dateStr,
      timeStr,
      title: ev.title,
      type: ev.type || "Workshop",
      category: ev.category || ev.type || "Coffee Education",
      price: priceStr,
      desc: ev.description || "",
      registrationUrl: ev.registrationUrl || "",
      coverImageUrl: ev.coverImageUrl || "",
      capacity: ev.capacity || undefined,
      status: ev.status || "UPCOMING",
    };
  });

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="absolute top-1/2 right-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block">
        {page.eyebrow || "03 / Workshops"}
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        {/* Back Link */}
        <Link
          href="/space"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Space
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-kalana-black/20 pb-8 mb-16 gap-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-3 font-mono">
              {page.eyebrow || "03 / Workshops"}
            </p>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none">
              {page.title || "Workshops."}
            </h1>
          </div>
          <p className="text-sm font-light text-kalana-black/70 max-w-sm leading-relaxed">
            {page.description || "Gatherings designed around coffee, creativity, and community."}
          </p>
        </div>

        {/* Interactive Filterable Workshops List (100% Database Driven) */}
        <WorkshopsListClient events={formattedEvents} />
      </div>
    </div>
  );
}
