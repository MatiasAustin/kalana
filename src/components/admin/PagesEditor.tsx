"use client";

import { useState } from "react";
import { Loader2, ExternalLink, Plus, Trash2 } from "lucide-react";
import { savePageContent } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";

interface PagesEditorProps {
  initialPagesData: Record<string, any>;
}

const PAGE_TABS = [
  { slug: "about", title: "About Kalana", path: "/about", icon: "📖" },
  { slug: "space", title: "The Space", path: "/space", icon: "🏛️" },
  { slug: "goods", title: "Goods Page", path: "/goods", icon: "🎒" },
  { slug: "terms", title: "Terms & Conditions", path: "/terms", icon: "📜" },
  { slug: "privacy", title: "Privacy Policy", path: "/privacy", icon: "🔒" },
  { slug: "shipping", title: "Shipping & Returns", path: "/shipping", icon: "🚚" },
];

export function PagesEditor({ initialPagesData }: PagesEditorProps) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string>("about");
  const [pagesState, setPagesState] = useState<Record<string, any>>(initialPagesData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentPage = pagesState[activeSlug] || {};

  const handleUpdateField = (key: string, value: any) => {
    setPagesState({
      ...pagesState,
      [activeSlug]: {
        ...pagesState[activeSlug],
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const title = currentPage.pageTitle || currentPage.title || activeSlug.toUpperCase();

    try {
      const res = await savePageContent(activeSlug, title, currentPage);
      if (res.success) {
        setStatusMessage({ type: "success", text: `Page "${title}" saved successfully!` });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save page." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to save page." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = PAGE_TABS.find((t) => t.slug === activeSlug);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Content Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit text, chapters, policies, and photos across your storefront pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTabMeta && (
            <a
              href={activeTabMeta.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1.5 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Page
            </a>
          )}
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
            className="bg-black text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Page
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pages</span>
            </div>
            <div className="divide-y divide-gray-100">
              {PAGE_TABS.map((tab) => (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => {
                    setActiveSlug(tab.slug);
                    setStatusMessage(null);
                  }}
                  className={`w-full text-left p-3.5 text-xs font-medium flex items-center justify-between transition-colors ${
                    activeSlug === tab.slug
                      ? "bg-gray-100 text-black border-l-4 border-black font-semibold"
                      : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.title}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{tab.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeTabMeta?.title}</h2>
                <p className="text-xs text-gray-400 font-mono">{activeTabMeta?.path}</p>
              </div>
            </div>

            {/* --- ABOUT PAGE --- */}
            {activeSlug === "about" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="05 / About"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Subtitle / Est.</label>
                    <input
                      type="text"
                      value={currentPage.subtitle || ""}
                      onChange={(e) => handleUpdateField("subtitle", e.target.value)}
                      placeholder="Brand Story<br/>Est. 2026"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="About<br/>Kalana."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Use &lt;br/&gt; for title line break.</p>
                </div>

                {/* Chapters */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Story Chapters</label>
                    <button
                      type="button"
                      onClick={() => {
                        const chapters = Array.isArray(currentPage.chapters) ? [...currentPage.chapters] : [];
                        chapters.push({ tag: `Chapter 0${chapters.length + 1}`, title: "New Chapter", content: "" });
                        handleUpdateField("chapters", chapters);
                      }}
                      className="text-xs text-black font-semibold flex items-center hover:opacity-70"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Chapter
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(Array.isArray(currentPage.chapters) ? currentPage.chapters : []).map((ch: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={ch.tag || ""}
                            onChange={(e) => {
                              const chapters = [...currentPage.chapters];
                              chapters[idx] = { ...chapters[idx], tag: e.target.value };
                              handleUpdateField("chapters", chapters);
                            }}
                            placeholder="Chapter 01"
                            className="text-xs font-bold text-gray-500 uppercase px-2 py-1 border border-gray-200 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const chapters = [...currentPage.chapters];
                              chapters.splice(idx, 1);
                              handleUpdateField("chapters", chapters);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={ch.title || ""}
                          onChange={(e) => {
                            const chapters = [...currentPage.chapters];
                            chapters[idx] = { ...chapters[idx], title: e.target.value };
                            handleUpdateField("chapters", chapters);
                          }}
                          placeholder="Chapter Title (e.g. The Journey.)"
                          className="w-full text-sm font-semibold px-3 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                        />
                        <textarea
                          rows={4}
                          value={ch.content || ""}
                          onChange={(e) => {
                            const chapters = [...currentPage.chapters];
                            chapters[idx] = { ...chapters[idx], content: e.target.value };
                            handleUpdateField("chapters", chapters);
                          }}
                          placeholder="Chapter story content..."
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture Sidebar Items */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-3">Architecture Sidebar Items</label>
                  <div className="space-y-3">
                    {(Array.isArray(currentPage.architecture) ? currentPage.architecture : []).map((arch: any, idx: number) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
                        <input
                          type="text"
                          value={arch.title || ""}
                          onChange={(e) => {
                            const archs = [...currentPage.architecture];
                            archs[idx] = { ...archs[idx], title: e.target.value };
                            handleUpdateField("architecture", archs);
                          }}
                          placeholder="Section Title (e.g. Space)"
                          className="w-full text-xs font-semibold px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                        />
                        <textarea
                          rows={2}
                          value={arch.description || ""}
                          onChange={(e) => {
                            const archs = [...currentPage.architecture];
                            archs[idx] = { ...archs[idx], description: e.target.value };
                            handleUpdateField("architecture", archs);
                          }}
                          placeholder="Description..."
                          className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- SPACE PAGE --- */}
            {activeSlug === "space" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="03 / Space"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Location Tag</label>
                    <input
                      type="text"
                      value={currentPage.locationTag || ""}
                      onChange={(e) => handleUpdateField("locationTag", e.target.value)}
                      placeholder="Cikampek, West Java"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={currentPage.headline || ""}
                    onChange={(e) => handleUpdateField("headline", e.target.value)}
                    placeholder="Come<br/>Wander<br/>In."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Coffee, conversations, workshops, and somewhere to stay awhile."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Space Hero Image"
                    description="Main photo displayed on the top of the /space page."
                    value={currentPage.heroImage || ""}
                    onChange={(url) => handleUpdateField("heroImage", url)}
                    folder="space"
                    aspectRatio="video"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Atmosphere Section</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Atmosphere Title</label>
                    <input
                      type="text"
                      value={currentPage.atmosphereTitle || ""}
                      onChange={(e) => handleUpdateField("atmosphereTitle", e.target.value)}
                      placeholder="Sanctuary<br/>From the Noise."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Atmosphere Description</label>
                    <textarea
                      rows={3}
                      value={currentPage.atmosphereDesc || ""}
                      onChange={(e) => handleUpdateField("atmosphereDesc", e.target.value)}
                      placeholder="Designed as a sanctuary from the noise..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="Atmosphere Photo 1"
                      value={currentPage.atmosphereImage1 || ""}
                      onChange={(url) => handleUpdateField("atmosphereImage1", url)}
                      folder="space"
                      aspectRatio="portrait"
                    />
                    <ImageUploadField
                      label="Atmosphere Photo 2"
                      value={currentPage.atmosphereImage2 || ""}
                      onChange={(url) => handleUpdateField("atmosphereImage2", url)}
                      folder="space"
                      aspectRatio="portrait"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Coffee Bar Section</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Coffee Bar Title</label>
                    <input
                      type="text"
                      value={currentPage.coffeeBarTitle || ""}
                      onChange={(e) => handleUpdateField("coffeeBarTitle", e.target.value)}
                      placeholder="The Coffee Bar"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Coffee Bar Description</label>
                    <textarea
                      rows={3}
                      value={currentPage.coffeeBarDesc || ""}
                      onChange={(e) => handleUpdateField("coffeeBarDesc", e.target.value)}
                      placeholder="Our bar is calibrated daily..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <ImageUploadField
                    label="Coffee Bar Photo"
                    value={currentPage.coffeeBarImage || ""}
                    onChange={(url) => handleUpdateField("coffeeBarImage", url)}
                    folder="space"
                    aspectRatio="video"
                  />
                </div>
              </div>
            )}

            {/* --- GOODS PAGE --- */}
            {activeSlug === "goods" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="04 / Goods"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status / Tagline</label>
                    <input
                      type="text"
                      value={currentPage.tagline || ""}
                      onChange={(e) => handleUpdateField("tagline", e.target.value)}
                      placeholder="In Development<br/>Est. 2026"
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Headline</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="Goods."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Objects for the journey..."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Categories (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(currentPage.categories) ? currentPage.categories.join(", ") : (currentPage.categories || "")}
                    onChange={(e) => handleUpdateField("categories", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="Apparel, Coffee Tools, Bags, Accessories, Objects"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Separate category badges with commas.</p>
                </div>
              </div>
            )}

            {/* --- LEGAL PAGES (TERMS, PRIVACY, SHIPPING) --- */}
            {["terms", "privacy", "shipping"].includes(activeSlug) && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="e.g. Terms of Service"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Subtitle / Note</label>
                  <input
                    type="text"
                    value={currentPage.subtitle || ""}
                    onChange={(e) => handleUpdateField("subtitle", e.target.value)}
                    placeholder="Last updated: 2026"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Policy Content</label>
                  <textarea
                    rows={12}
                    value={currentPage.content || ""}
                    onChange={(e) => handleUpdateField("content", e.target.value)}
                    placeholder="Enter policy terms or details here..."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
