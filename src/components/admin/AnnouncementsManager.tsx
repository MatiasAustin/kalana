"use client";

import { useState } from "react";
import { savePageContent } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone, CheckCircle2, Eye, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AnnouncementData {
  isEnabled: boolean;
  text: string;
  linkText: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
}

interface AnnouncementsManagerProps {
  initialData: AnnouncementData;
}

const COLOR_PRESETS = [
  { name: "Obsidian Black", bg: "#0A0A0A", text: "#FFFFFF" },
  { name: "Warm Espresso", bg: "#2E1A11", text: "#F7EFE6" },
  { name: "Raw Umber", bg: "#4A3525", text: "#FFFDF9" },
  { name: "Forest Slate", bg: "#1F2B27", text: "#E5EBE8" },
  { name: "Minimal Sand", bg: "#F4F0EA", text: "#1A1A1A" },
];

const MESSAGE_PRESETS = [
  {
    label: "Free Shipping Promotion",
    text: "Complimentary shipping across Java on orders over IDR 300,000 | Code: KALANA2026",
    linkText: "Shop Coffee",
    linkUrl: "/roastery",
    bg: "#0A0A0A",
    textCol: "#FFFFFF",
  },
  {
    label: "New Harvest / Micro-lot Drop",
    text: "Limited Release: Gayo Natural Anaerobic 72h now roasting in small batches.",
    linkText: "Explore Release",
    linkUrl: "/roastery",
    bg: "#2E1A11",
    textCol: "#F7EFE6",
  },
  {
    label: "Barista Workshop Seat Opening",
    text: "Weekend Cupping & Sensory Session: 4 seats remaining for this Saturday.",
    linkText: "Book Class",
    linkUrl: "/space/workshops",
    bg: "#4A3525",
    textCol: "#FFFDF9",
  },
  {
    label: "Sanctuary Space Hours Notice",
    text: "Cikampek Roastery & Bar open daily 08:00 - 22:00 WIB. Slow coffee & quiet sanctuary.",
    linkText: "Find Us",
    linkUrl: "/contact",
    bg: "#1F2B27",
    textCol: "#E5EBE8",
  },
];

export function AnnouncementsManager({ initialData }: AnnouncementsManagerProps) {
  const router = useRouter();
  const [data, setData] = useState<AnnouncementData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await savePageContent("announcement", "Announcement Bar", data);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Announcement bar settings saved and published!" });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update announcement." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to save announcement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (preset: typeof MESSAGE_PRESETS[0]) => {
    setData((prev) => ({
      ...prev,
      text: preset.text,
      linkText: preset.linkText,
      linkUrl: preset.linkUrl,
      bgColor: preset.bg,
      textColor: preset.textCol,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-neutral-900 text-white rounded">
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">ANNOUNCEMENT BAR</h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Manage the top global banner shown to all storefront visitors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Storefront
          </Link>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 shadow-sm"
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
          className={`p-4 rounded-md text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {statusMessage.text}
        </div>
      )}

      {/* Live Storefront Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            Live Preview
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            {data.isEnabled ? "Status: ACTIVE on site" : "Status: HIDDEN on site"}
          </span>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-neutral-100">
          {/* Mock Browser Header Bar */}
          <div className="bg-neutral-200/80 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] font-mono text-gray-500 mx-auto">kalana.coffee</span>
          </div>

          {/* Rendered Announcement */}
          {data.isEnabled ? (
            <div
              style={{ backgroundColor: data.bgColor || "#0A0A0A", color: data.textColor || "#FFFFFF" }}
              className="py-2.5 px-6 text-center text-xs font-mono tracking-wider flex items-center justify-center gap-3 transition-colors duration-200"
            >
              <span>{data.text || "Your announcement message will appear here..."}</span>
              {data.linkText && (
                <span className="underline underline-offset-2 font-bold cursor-pointer hover:opacity-80">
                  {data.linkText} →
                </span>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-xs font-mono text-gray-400 italic bg-gray-50">
              Announcement bar is currently disabled. It will not render on the storefront.
            </div>
          )}

          {/* Mock KALANA Navigation */}
          <div className="bg-[#FAF9F5] px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-[0.2em]">KALANA</span>
              <span className="text-[9px] text-gray-400 tracking-widest">/ EST. 2026</span>
            </div>
            <div className="hidden sm:flex gap-6 text-[10px] font-mono tracking-widest text-gray-500">
              <span>ROASTERY</span>
              <span>SPACE</span>
              <span>WORKSHOPS</span>
              <span>ABOUT</span>
            </div>
            <div className="text-[10px] font-mono text-gray-400">CART (00)</div>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {/* Active Switch */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-200">
            <div>
              <label htmlFor="toggle-enabled" className="text-sm font-bold text-gray-900 cursor-pointer block">
                Enable Announcement Bar
              </label>
              <p className="text-xs text-gray-500">
                Display this banner at the top of every page on the storefront
              </p>
            </div>
            <input
              id="toggle-enabled"
              type="checkbox"
              checked={data.isEnabled}
              onChange={(e) => setData({ ...data, isEnabled: e.target.checked })}
              className="w-5 h-5 accent-black cursor-pointer rounded"
            />
          </div>

          {/* Announcement Message */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-semibold mb-1">
              Banner Text Message *
            </label>
            <textarea
              rows={3}
              value={data.text}
              onChange={(e) => setData({ ...data, text: e.target.value })}
              placeholder="E.g., Complimentary shipping across Java on orders over IDR 300,000 | Code: KALANA2026"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none font-mono"
            />
            <span className="text-[10px] font-mono text-gray-400 mt-1 block">
              Keep concise (under 100 characters recommended for mobile devices).
            </span>
          </div>

          {/* Link Call To Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-semibold mb-1">
                Link Button Label (Optional)
              </label>
              <input
                type="text"
                value={data.linkText}
                onChange={(e) => setData({ ...data, linkText: e.target.value })}
                placeholder="E.g., Shop Coffee"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-semibold mb-1">
                Link URL Destination
              </label>
              <input
                type="text"
                value={data.linkUrl}
                onChange={(e) => setData({ ...data, linkUrl: e.target.value })}
                placeholder="E.g., /roastery or https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none font-mono"
              />
            </div>
          </div>

          {/* Color Customization */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-semibold mb-4">
              Bar Styling & Colors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Background Color */}
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.bgColor}
                    onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                    className="w-9 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={data.bgColor}
                    onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">
                  Text & Link Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.textColor}
                    onChange={(e) => setData({ ...data, textColor: e.target.value })}
                    className="w-9 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={data.textColor}
                    onChange={(e) => setData({ ...data, textColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Quick Color Palette Presets */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase text-gray-400 block mb-2">
                Brand Palette Themes:
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setData({ ...data, bgColor: p.bg, textColor: p.text })}
                    className="px-2.5 py-1 rounded border border-gray-300 text-[10px] font-mono flex items-center gap-1.5 hover:border-gray-500 bg-white"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: p.bg }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Message Presets */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold text-gray-900 border-b pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant Message Presets</span>
            </div>
            <p className="text-xs text-gray-500">
              Click any template to quickly populate message and styling:
            </p>

            <div className="space-y-2.5">
              {MESSAGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left p-3 rounded border border-gray-200 hover:border-black bg-gray-50/50 hover:bg-white transition-all group"
                >
                  <span className="block text-xs font-semibold text-gray-900 group-hover:text-black mb-1">
                    {preset.label}
                  </span>
                  <span className="block text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    "{preset.text}"
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
