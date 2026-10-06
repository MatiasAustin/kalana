"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updatePrimaryLocation } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";

export function LocationEditor({ initialLocation }: { initialLocation: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: initialLocation?.name || "KALANA Space",
    address: initialLocation?.address || "Jl. Ahmad Yani No. 45",
    city: initialLocation?.city || "Cikampek",
    province: initialLocation?.province || "West Java",
    country: initialLocation?.country || "Indonesia",
    openingHours: initialLocation?.openingHours || "08:00 — 22:00",
    phone: initialLocation?.phone || "+62 811 1234 567",
    email: initialLocation?.email || "space@kalana.com",
    googleMapsUrl: initialLocation?.googleMapsUrl || "https://maps.google.com"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await updatePrimaryLocation(formData);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Location details updated successfully!" });
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
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Space Location & Hours</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your physical space address, opening hours, and map directions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {statusMessage && (
            <span
              className={`text-xs px-3 py-1.5 rounded font-medium ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.text}
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-black text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Location
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Space Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Opening Hours</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="e.g. 08:00 — 22:00"
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Street Address</label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Province / State</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Google Maps Directions URL</label>
          <input
            type="url"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono text-xs"
          />
        </div>
      </form>
    </div>
  );
}
