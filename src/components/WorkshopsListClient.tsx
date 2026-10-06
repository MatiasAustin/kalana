"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Users, Calendar } from "lucide-react";

interface FormattedEvent {
  id: string;
  dateStr: string;
  timeStr: string;
  title: string;
  type: string;
  category: string;
  price: string;
  desc: string;
  registrationUrl: string;
  coverImageUrl?: string;
  capacity?: number;
  status: string;
}

interface WorkshopsListClientProps {
  events: FormattedEvent[];
}

export function WorkshopsListClient({ events }: WorkshopsListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Extract distinct categories from events
  const categories = ["ALL", ...Array.from(new Set(events.map((e) => e.category || e.type || "Workshop")))];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === "ALL") return true;
    return ev.category === selectedCategory || ev.type === selectedCategory;
  });

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-16 pb-6 border-b border-kalana-black/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all border ${
              selectedCategory === cat
                ? "bg-kalana-black text-kalana-offwhite border-kalana-black shadow-sm"
                : "bg-transparent text-kalana-black border-kalana-black/20 hover:border-kalana-black"
            }`}
          >
            {cat === "ALL" ? "All Activities" : cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="py-24 text-center border-t border-b border-kalana-black/10">
          <p className="text-xs font-mono uppercase tracking-widest text-kalana-black/50 mb-4">
            No upcoming workshops scheduled in this category.
          </p>
          <Link
            href="/contact"
            className="text-xs uppercase font-mono tracking-widest underline underline-offset-4 hover:opacity-70"
          >
            Inquire for Private Group Classes →
          </Link>
        </div>
      ) : (
        <div className="space-y-0 border-b border-kalana-black/20">
          {filteredEvents.map((event, i) => (
            <div
              key={event.id}
              className="group flex flex-col lg:flex-row justify-between lg:items-center gap-8 border-t border-kalana-black/20 py-12 hover:bg-kalana-black/5 transition-colors px-4 -mx-4"
            >
              {/* Left Column: Number, Date, Category */}
              <div className="lg:w-1/4 flex flex-col gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/40 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-xs tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-kalana-black/50" />
                  {event.dateStr}
                </p>
                {event.timeStr && (
                  <p className="text-[10px] font-mono tracking-wider text-kalana-black/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.timeStr}
                  </p>
                )}
                <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/60 font-mono">
                  {event.category || event.type}
                </span>
              </div>

              {/* Middle Column: Title & Description */}
              <div className="lg:w-2/4 flex items-start gap-6">
                {event.coverImageUrl && (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden shrink-0 bg-neutral-200 border border-kalana-black/10 hidden sm:block">
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="112px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight uppercase group-hover:pl-2 transition-all">
                    {event.title}
                  </h3>
                  {event.desc && (
                    <p className="text-xs text-kalana-black/70 mt-2 font-light leading-relaxed max-w-xl">
                      {event.desc}
                    </p>
                  )}
                  {event.capacity && (
                    <p className="text-[10px] font-mono text-kalana-black/50 mt-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Limited to {event.capacity} seats per class
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Price & Register Button */}
              <div className="lg:w-1/4 flex flex-col lg:items-end justify-between h-full gap-4">
                <span className="text-xs tracking-[0.2em] uppercase font-mono font-bold">
                  {event.price}
                </span>
                <Link
                  href={event.registrationUrl || "/contact"}
                  target={event.registrationUrl?.startsWith("http") ? "_blank" : undefined}
                  rel={event.registrationUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity inline-flex items-center group-hover:translate-x-1"
                >
                  Register <ArrowRight className="w-3 h-3 ml-2" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
