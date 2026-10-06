"use client";

import { useState } from "react";
import { GripVertical, Plus, Loader2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { updateHomepageSections } from "@/lib/actions/homepage";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";

const SECTION_LABELS: Record<string, string> = {
  HERO: "Hero Banner",
  FEATURED_COLLECTION: "Featured Collection",
  BRAND_STORY: "Brand Story",
  SOCIAL_PROOF: "Reviews & Community",
  SPACE: "The Space Showcase",
  WORKSHOPS: "Workshops & Events",
  NEWSLETTER: "Newsletter Signup"
};

export function HomepageEditor({ initialSections }: { initialSections: any[] }) {
  const router = useRouter();
  const [sections, setSections] = useState<any[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const handleUpdateActiveSection = (key: string, value: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === activeSectionId) {
          return { ...s, data: { ...s.data, [key]: value } };
        }
        return s;
      })
    );
  };

  const handleToggleVisibility = (id: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === id) return { ...s, isEnabled: !s.isEnabled };
        return s;
      })
    );
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);
  };

  const handleAddSection = (type: string) => {
    const newSec = {
      id: `new-${Date.now()}`,
      type,
      isEnabled: true,
      data: {}
    };
    setSections([...sections, newSec]);
    setActiveSectionId(newSec.id);
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm("Are you sure you want to remove this section?")) return;
    setSections(sections.filter((s) => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await updateHomepageSections(sections);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Homepage updated successfully! Live page has been revalidated." });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save homepage." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to save homepage." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize texts, photos, buttons, and sections on your store homepage.
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-black text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sections List Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                Sections ({sections.length})
              </h2>
              <div className="relative group">
                <button type="button" className="text-xs text-black font-semibold flex items-center hover:opacity-70">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-md hidden group-hover:block z-20 py-1">
                  {Object.entries(SECTION_LABELS).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddSection(type)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    activeSectionId === sec.id
                      ? "bg-gray-100 border-l-4 border-black"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                  onClick={() => setActiveSectionId(sec.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {SECTION_LABELS[sec.type] || sec.type}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{sec.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, "up");
                      }}
                      className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, "down");
                      }}
                      className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(sec.id);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sec.isEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {sec.isEnabled ? "ON" : "OFF"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(sec.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Detail Form */}
        <div className="lg:col-span-8">
          {activeSection ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit {SECTION_LABELS[activeSection.type] || activeSection.type}
                  </h3>
                  <p className="text-xs text-gray-500">Configure text, images, and buttons for this section</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded font-medium ${
                    activeSection.isEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Status: {activeSection.isEnabled ? "Visible on Site" : "Hidden"}
                </span>
              </div>

              {/* 1. HERO BANNER */}
              {activeSection.type === "HERO" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow Tag</label>
                      <input
                        type="text"
                        value={activeSection.data.eyebrow || ""}
                        onChange={(e) => handleUpdateActiveSection("eyebrow", e.target.value)}
                        placeholder="e.g. KALANA Space & Roastery"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Established Tag</label>
                      <input
                        type="text"
                        value={activeSection.data.established || ""}
                        onChange={(e) => handleUpdateActiveSection("established", e.target.value)}
                        placeholder="e.g. Est. 2026"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Main Headline (HTML/breaks supported)
                    </label>
                    <input
                      type="text"
                      value={activeSection.data.headline || ""}
                      onChange={(e) => handleUpdateActiveSection("headline", e.target.value)}
                      placeholder="e.g. Space.<br/>Coffee.<br/>Further<br/>Days."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Tip: Use &lt;br/&gt; to create line breaks in the large typography.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Primary CTA Button</label>
                      <input
                        type="text"
                        value={activeSection.data.primaryCtaLabel || activeSection.data.ctaText || ""}
                        onChange={(e) => handleUpdateActiveSection("primaryCtaLabel", e.target.value)}
                        placeholder="e.g. Explore KALANA"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none mb-2"
                      />
                      <input
                        type="text"
                        value={activeSection.data.primaryCtaUrl || activeSection.data.ctaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("primaryCtaUrl", e.target.value)}
                        placeholder="URL: e.g. /roastery"
                        className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Secondary CTA Button</label>
                      <input
                        type="text"
                        value={activeSection.data.secondaryCtaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("secondaryCtaLabel", e.target.value)}
                        placeholder="e.g. Visit Us"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none mb-2"
                      />
                      <input
                        type="text"
                        value={activeSection.data.secondaryCtaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("secondaryCtaUrl", e.target.value)}
                        placeholder="URL: e.g. /space"
                        className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <ImageUploadField
                      label="Hero Feature Image"
                      description="Featured image shown next to the large title on the homepage hero."
                      value={activeSection.data.imageUrl || ""}
                      onChange={(url) => handleUpdateActiveSection("imageUrl", url)}
                      folder="homepage"
                      aspectRatio="portrait"
                    />
                  </div>
                </div>
              )}

              {/* 2. FEATURED COLLECTION */}
              {activeSection.type === "FEATURED_COLLECTION" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                      <input
                        type="text"
                        value={activeSection.data.eyebrow || ""}
                        onChange={(e) => handleUpdateActiveSection("eyebrow", e.target.value)}
                        placeholder="e.g. Featured"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={activeSection.data.title || ""}
                        onChange={(e) => handleUpdateActiveSection("title", e.target.value)}
                        placeholder="e.g. Daily Series."
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description / Subtext</label>
                    <textarea
                      rows={3}
                      value={activeSection.data.description || activeSection.data.subtext || ""}
                      onChange={(e) => handleUpdateActiveSection("description", e.target.value)}
                      placeholder="e.g. Two everyday blends made for the way coffee is actually enjoyed."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">CTA Button Label</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaLabel", e.target.value)}
                        placeholder="e.g. Shop Roastery →"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">CTA URL</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaUrl", e.target.value)}
                        placeholder="e.g. /roastery"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BRAND STORY */}
              {activeSection.type === "BRAND_STORY" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Headline</label>
                    <input
                      type="text"
                      value={activeSection.data.headline || ""}
                      onChange={(e) => handleUpdateActiveSection("headline", e.target.value)}
                      placeholder="e.g. Made<br/>For the<br/>Daily<br/>Ritual."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Use &lt;br/&gt; for line breaks.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Story Description</label>
                    <textarea
                      rows={4}
                      value={activeSection.data.description || activeSection.data.content || ""}
                      onChange={(e) => handleUpdateActiveSection("description", e.target.value)}
                      placeholder="From the first cup of the morning..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Watermark Word</label>
                      <input
                        type="text"
                        value={activeSection.data.watermark || "RITUAL"}
                        onChange={(e) => handleUpdateActiveSection("watermark", e.target.value)}
                        placeholder="e.g. RITUAL"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaLabel", e.target.value)}
                        placeholder="e.g. Our Story →"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button URL</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaUrl", e.target.value)}
                        placeholder="e.g. /about"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SOCIAL PROOF / REVIEWS */}
              {activeSection.type === "SOCIAL_PROOF" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                      <input
                        type="text"
                        value={activeSection.data.eyebrow || ""}
                        onChange={(e) => handleUpdateActiveSection("eyebrow", e.target.value)}
                        placeholder="e.g. Community"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Rating Badge</label>
                      <input
                        type="text"
                        value={activeSection.data.rating || ""}
                        onChange={(e) => handleUpdateActiveSection("rating", e.target.value)}
                        placeholder="e.g. 4.9/5 Rating"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-semibold text-gray-700 uppercase">Customer Reviews</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(activeSection.data.reviews) ? activeSection.data.reviews : [];
                          handleUpdateActiveSection("reviews", [...current, { text: "", author: "" }]);
                        }}
                        className="text-xs text-black font-semibold flex items-center hover:opacity-70"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Review
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(Array.isArray(activeSection.data.reviews) ? activeSection.data.reviews : []).map(
                        (rev: any, rIdx: number) => (
                          <div key={rIdx} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-400">Review #{rIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...activeSection.data.reviews];
                                  current.splice(rIdx, 1);
                                  handleUpdateActiveSection("reviews", current);
                                }}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={rev.text || ""}
                              onChange={(e) => {
                                const current = [...activeSection.data.reviews];
                                current[rIdx] = { ...current[rIdx], text: e.target.value };
                                handleUpdateActiveSection("reviews", current);
                              }}
                              placeholder="Review text..."
                              className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                            />
                            <input
                              type="text"
                              value={rev.author || ""}
                              onChange={(e) => {
                                const current = [...activeSection.data.reviews];
                                current[rIdx] = { ...current[rIdx], author: e.target.value };
                                handleUpdateActiveSection("reviews", current);
                              }}
                              placeholder="Customer Name (e.g. Arif R.)"
                              className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SPACE SHOWCASE */}
              {activeSection.type === "SPACE" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                      <input
                        type="text"
                        value={activeSection.data.eyebrow || ""}
                        onChange={(e) => handleUpdateActiveSection("eyebrow", e.target.value)}
                        placeholder="e.g. Kalana Space"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={activeSection.data.title || ""}
                        onChange={(e) => handleUpdateActiveSection("title", e.target.value)}
                        placeholder="e.g. Come<br/>Wander<br/>In."
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={activeSection.data.description || ""}
                      onChange={(e) => handleUpdateActiveSection("description", e.target.value)}
                      placeholder="e.g. A place to slow down, meet people..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaLabel", e.target.value)}
                        placeholder="e.g. Visit Space →"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button URL</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaUrl", e.target.value)}
                        placeholder="e.g. /space"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <ImageUploadField
                      label="Space Showcase Photo"
                      description="Photo of the space interior or architecture displayed on the homepage."
                      value={activeSection.data.imageUrl || ""}
                      onChange={(url) => handleUpdateActiveSection("imageUrl", url)}
                      folder="space"
                      aspectRatio="video"
                    />
                  </div>
                </div>
              )}

              {/* 6. WORKSHOPS */}
              {activeSection.type === "WORKSHOPS" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={activeSection.data.title || ""}
                        onChange={(e) => handleUpdateActiveSection("title", e.target.value)}
                        placeholder="e.g. Workshops."
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaLabel", e.target.value)}
                        placeholder="e.g. See All →"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button URL</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaUrl || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaUrl", e.target.value)}
                        placeholder="e.g. /space/workshops"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-semibold text-gray-700 uppercase">Featured Events</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(activeSection.data.events) ? activeSection.data.events : [];
                          handleUpdateActiveSection("events", [
                            ...current,
                            { date: "Oct 12", year: "2026", title: "New Workshop", category: "Education" }
                          ]);
                        }}
                        className="text-xs text-black font-semibold flex items-center hover:opacity-70"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(Array.isArray(activeSection.data.events) ? activeSection.data.events : []).map(
                        (ev: any, evIdx: number) => (
                          <div key={evIdx} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-400">Event #{evIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...activeSection.data.events];
                                  current.splice(evIdx, 1);
                                  handleUpdateActiveSection("events", current);
                                }}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <input
                                type="text"
                                value={ev.date || ""}
                                onChange={(e) => {
                                  const current = [...activeSection.data.events];
                                  current[evIdx] = { ...current[evIdx], date: e.target.value };
                                  handleUpdateActiveSection("events", current);
                                }}
                                placeholder="Date (e.g. Oct 12)"
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                              />
                              <input
                                type="text"
                                value={ev.year || ""}
                                onChange={(e) => {
                                  const current = [...activeSection.data.events];
                                  current[evIdx] = { ...current[evIdx], year: e.target.value };
                                  handleUpdateActiveSection("events", current);
                                }}
                                placeholder="Year (e.g. 2026)"
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                              />
                              <input
                                type="text"
                                value={ev.title || ""}
                                onChange={(e) => {
                                  const current = [...activeSection.data.events];
                                  current[evIdx] = { ...current[evIdx], title: e.target.value };
                                  handleUpdateActiveSection("events", current);
                                }}
                                placeholder="Workshop Title"
                                className="col-span-2 text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                              />
                            </div>
                            <input
                              type="text"
                              value={ev.category || ""}
                              onChange={(e) => {
                                const current = [...activeSection.data.events];
                                current[evIdx] = { ...current[evIdx], category: e.target.value };
                                handleUpdateActiveSection("events", current);
                              }}
                              placeholder="Category (e.g. Education, Creative)"
                              className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. NEWSLETTER */}
              {activeSection.type === "NEWSLETTER" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                      <input
                        type="text"
                        value={activeSection.data.eyebrow || ""}
                        onChange={(e) => handleUpdateActiveSection("eyebrow", e.target.value)}
                        placeholder="e.g. Newsletter"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={activeSection.data.title || ""}
                        onChange={(e) => handleUpdateActiveSection("title", e.target.value)}
                        placeholder="e.g. Stay in the loop."
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={activeSection.data.description || ""}
                      onChange={(e) => handleUpdateActiveSection("description", e.target.value)}
                      placeholder="e.g. New beans, workshops, events..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Input Placeholder</label>
                      <input
                        type="text"
                        value={activeSection.data.placeholder || ""}
                        onChange={(e) => handleUpdateActiveSection("placeholder", e.target.value)}
                        placeholder="e.g. EMAIL ADDRESS"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSection.data.ctaLabel || ""}
                        onChange={(e) => handleUpdateActiveSection("ctaLabel", e.target.value)}
                        placeholder="e.g. Join →"
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center text-gray-500">
              Select a section on the left to edit its content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
