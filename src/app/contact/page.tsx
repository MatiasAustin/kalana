import { getPageContent, getLocation, getSocialLinks } from "@/lib/cms-api";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Inquiries | KALANA",
  description: "Connect with KALANA Roastery and Sanctuary for wholesale inquiries, bookings, and collaborations.",
};

export default async function ContactPage() {
  const [page, location, socialLinks] = await Promise.all([
    getPageContent("contact"),
    getLocation(),
    getSocialLinks(),
  ]);

  const email = page.email || "hello@kalana.com";
  const whatsapp = page.whatsapp || "+62 812-3456-7890";
  const hours = page.hours || location?.hours || "Daily 08:00 - 22:00 WIB";
  const address = page.address || location?.address || "Jl. Raya Cikampek No. 45, Karawang, Jawa Barat";
  const cleanPhone = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        {/* Page Header */}
        <div className="border-b border-kalana-black/20 pb-8 mb-12">
          <p className="text-xs tracking-widest uppercase text-kalana-black/50 font-mono mb-2">
            {page.eyebrow || "06 / Contact"}
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-4 leading-tight">
            {page.title || "Get in Touch."}
          </h1>
          <p className="text-lg text-kalana-black/70 font-light max-w-2xl leading-relaxed">
            {page.description ||
              "Whether you are interested in wholesale coffee beans, space reservations, or just saying hello, we would love to hear from you."}
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Direct Channels */}
          <div className="space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-kalana-black/40 border-b border-kalana-black/10 pb-2">
              Channels
            </h2>

            {/* Email */}
            <div className="group">
              <span className="text-xs uppercase font-mono tracking-wider text-kalana-black/50 block mb-1">
                Direct Email
              </span>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-xl font-medium tracking-tight hover:opacity-70 transition-opacity"
              >
                <Mail className="w-5 h-5 text-kalana-black/60" />
                <span>{email}</span>
                <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* WhatsApp */}
            <div className="group">
              <span className="text-xs uppercase font-mono tracking-wider text-kalana-black/50 block mb-1">
                WhatsApp & Reservations
              </span>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xl font-medium tracking-tight hover:opacity-70 transition-opacity"
              >
                <Phone className="w-5 h-5 text-kalana-black/60" />
                <span>{whatsapp}</span>
                <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Operating Hours */}
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-kalana-black/50 block mb-1">
                Operating Hours
              </span>
              <div className="flex items-center gap-2 text-base font-light text-kalana-black/80">
                <Clock className="w-4 h-4 text-kalana-black/60" />
                <span>{hours}</span>
              </div>
            </div>

            {/* Physical Location */}
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-kalana-black/50 block mb-1">
                Physical Space
              </span>
              <div className="flex items-start gap-2 text-base font-light text-kalana-black/80">
                <MapPin className="w-4 h-4 text-kalana-black/60 mt-1 flex-shrink-0" />
                <span>{address}</span>
              </div>
              {location?.mapsUrl && (
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono tracking-wider uppercase text-kalana-black/60 hover:text-kalana-black mt-2 underline underline-offset-4"
                >
                  Open in Google Maps <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-4 border-t border-kalana-black/10">
                <span className="text-xs uppercase font-mono tracking-wider text-kalana-black/50 block mb-3">
                  Connect & Socials
                </span>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider font-mono px-3 py-1.5 border border-kalana-black/20 hover:border-kalana-black transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Inquiry Note / Visit Banner */}
          <div className="bg-white/60 border border-kalana-black/10 p-8 rounded-sm flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-kalana-black/40 block mb-3">
                Roastery & Sanctuary
              </span>
              <h3 className="text-2xl font-semibold tracking-tight uppercase mb-4">
                Visit Us in Person.
              </h3>
              <p className="text-sm font-light leading-relaxed text-kalana-black/70 mb-4">
                Our space is designed for calm focus, quiet conversations, and unhurried coffee rituals. We welcome both individuals seeking a sanctuary to work or read, as well as partners interested in tasting our seasonal wholesale roast batches.
              </p>
              <p className="text-xs font-mono text-kalana-black/50">
                No reservation needed for standard bar seating. For group cuppings or workshop inquiries, contact us via WhatsApp.
              </p>
            </div>

            <div className="border-t border-kalana-black/10 pt-6 flex flex-col gap-3">
              <a
                href={`https://wa.me/${cleanPhone}?text=Hello%20KALANA,%20I%20would%20like%20to%20inquire%20about...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3.5 bg-kalana-black text-white text-xs font-mono tracking-widest uppercase hover:bg-kalana-black/90 transition-colors"
              >
                Send Message via WhatsApp
              </a>
              <Link
                href="/space"
                className="w-full text-center py-3.5 border border-kalana-black/20 text-kalana-black text-xs font-mono tracking-widest uppercase hover:border-kalana-black transition-colors"
              >
                Explore The Space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
