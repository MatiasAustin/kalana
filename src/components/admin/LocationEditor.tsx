"use client";

import { useState } from "react";
import { Loader2, MapPin, Clock, Phone, Mail, Globe, ExternalLink, Eye, CheckCircle2 } from "lucide-react";
import { updatePrimaryLocation } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";
import Link from "next/link";

interface LocationEditorProps {
  initialLocation: any;
}

export function LocationEditor({ initialLocation }: LocationEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: initialLocation?.name || "KALANA Space & Roastery",
    address: initialLocation?.address || "Jl. Raya Cikampek No. 45",
    city: initialLocation?.city || "Cikampek",
    province: initialLocation?.province || "West Java",
    country: initialLocation?.country || "Indonesia",
    openingHours: initialLocation?.openingHours || "Daily 08:00 — 22:00 WIB",
    phone: initialLocation?.phone || "+62 811 1234 567",
    whatsapp: initialLocation?.whatsapp || "+62 811 1234 567",
    email: initialLocation?.email || "space@kalana.com",
    googleMapsUrl: initialLocation?.googleMapsUrl || "https://maps.google.com/?q=Kalana+Coffee+Cikampek",
    coverImageUrl: initialLocation?.coverImageUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await updatePrimaryLocation(formData);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Space location details updated and published successfully!" });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update location." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update location." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-neutral-900 text-white rounded">
              <MapPin className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-mono">
              SPACE LOCATION & HOURS
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Configure your physical sanctuary roastery address, operating schedule, and map coordinates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/space"
            target="_blank"
            className="text-xs border border-gray-300 text-gray-700 px-3 py-2 rounded font-mono hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> View Space
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-black text-white px-5 py-2 rounded text-xs font-mono font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Publish"
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {statusMessage.text}
        </div>
      )}

      {/* Live Storefront Preview */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-gray-400" />
          Storefront Location Card Preview
        </span>

        <div className="bg-kalana-black text-kalana-offwhite p-6 sm:p-8 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-neutral-800">
          <div className="md:col-span-6 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
              Sanctuary Anchor
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              {formData.name || "KALANA Space"}
            </h2>
            <div className="space-y-2 text-xs font-mono text-white/80">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-white/50 mt-0.5" />
                <span>
                  {formData.address}, {formData.city}, {formData.province}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-white/50" />
                <span>{formData.openingHours}</span>
              </p>
            </div>
            {formData.googleMapsUrl && (
              <a
                href={formData.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-white underline underline-offset-4 hover:text-white/70"
              >
                Get Directions →
              </a>
            )}
          </div>

          <div className="md:col-span-6 aspect-video bg-neutral-900 rounded overflow-hidden relative flex items-center justify-center border border-white/10">
            {formData.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.coverImageUrl}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center font-mono text-xs text-white/40 p-4">
                <span>Space Photograph / Facade</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Space Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Opening Hours *</label>
            <input
              type="text"
              required
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="Daily 08:00 — 22:00 WIB"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 uppercase mb-1">Street Address *</label>
          <textarea
            rows={2}
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Jl. Raya Cikampek No. 45"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Province / State</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">WhatsApp Reservation</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 uppercase mb-1">Email Inquiries</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 uppercase mb-1">Google Maps Directions URL</label>
          <input
            type="url"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            placeholder="https://maps.google.com/?q=..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        <ImageUploadField
          label="Space Photograph / Exterior Facade (Optional)"
          value={formData.coverImageUrl}
          onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
          helperText="Upload space exterior or atmosphere photograph displayed on /space and maps card"
        />

        <div className="pt-3 border-t flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-black text-white rounded font-mono font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Location Details
          </button>
        </div>
      </form>
    </div>
  );
}
