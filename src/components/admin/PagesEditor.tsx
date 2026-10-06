"use client";

import { useState } from "react";
import { Loader2, ExternalLink, Plus, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { savePageContent, deletePage } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";

interface PagesEditorProps {
  initialPagesData: Record<string, any>;
  customPages?: Array<{ slug: string; title: string }>;
}

const STANDARD_PAGE_TABS = [
  { slug: "about", title: "About Kalana", path: "/about", icon: "📖" },
  { slug: "roastery", title: "Roastery Story", path: "/roastery", icon: "☕" },
  { slug: "space", title: "The Space", path: "/space", icon: "🏛️" },
  { slug: "workshops", title: "Workshops", path: "/space/workshops", icon: "🎓" },
  { slug: "contact", title: "Contact & Location", path: "/contact", icon: "📍" },
  { slug: "goods", title: "Goods Page", path: "/goods", icon: "🎒" },
  { slug: "terms", title: "Terms & Conditions", path: "/terms", icon: "📜" },
  { slug: "privacy", title: "Privacy Policy", path: "/privacy", icon: "🔒" },
  { slug: "shipping", title: "Shipping & Returns", path: "/shipping", icon: "🚚" },
];

export function PagesEditor({ initialPagesData, customPages: initialCustom = [] }: PagesEditorProps) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string>("about");
  const [pagesState, setPagesState] = useState<Record<string, any>>(initialPagesData);
  const [customPagesList, setCustomPagesList] = useState<Array<{ slug: string; title: string }>>(initialCustom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Custom Page Modal
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  const currentPage = pagesState[activeSlug] || {};
  const isCustomPage = !STANDARD_PAGE_TABS.some(t => t.slug === activeSlug);

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

  const handleCreateCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return alert("Title and Slug are required.");

    const cleanSlug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    // Check collision
    if (pagesState[cleanSlug] || STANDARD_PAGE_TABS.some(t => t.slug === cleanSlug)) {
      return alert("A page with this slug already exists.");
    }

    const newPageObj = {
      title: newPageTitle.trim(),
      eyebrow: "Page",
      headline: newPageTitle.trim(),
      content: "Write your page content here...",
      imageUrl: "",
    };

    setPagesState(prev => ({ ...prev, [cleanSlug]: newPageObj }));
    setCustomPagesList(prev => [...prev, { slug: cleanSlug, title: newPageTitle.trim() }]);
    setActiveSlug(cleanSlug);
    setShowNewPageModal(false);
    setNewPageTitle("");
    setNewPageSlug("");
  };

  const handleDeleteCustomPage = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete custom page "${slug}"?`)) return;
    try {
      await deletePage(slug);
      setCustomPagesList(prev => prev.filter(p => p.slug !== slug));
      const newState = { ...pagesState };
      delete newState[slug];
      setPagesState(newState);
      setActiveSlug("about");
      router.refresh();
    } catch (err) {
      alert("Failed to delete page.");
    }
  };

  const activeTabMeta = STANDARD_PAGE_TABS.find((t) => t.slug === activeSlug) || {
    slug: activeSlug,
    title: currentPage.title || activeSlug,
    path: `/p/${activeSlug}`,
    icon: "📄"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-mono text-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">PAGE CONTENT EDITOR</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Edit text, headlines, imagery, and policies across all pages of your KALANA storefront
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={activeTabMeta.path}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-1.5 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Page
          </a>

          {statusMessage && (
            <span
              className={`px-3 py-1.5 rounded font-medium ${
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
            className="bg-black text-white px-5 py-2 rounded font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Page
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Storefront Pages</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {STANDARD_PAGE_TABS.map((tab) => (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => {
                    setActiveSlug(tab.slug);
                    setStatusMessage(null);
                  }}
                  className={`w-full text-left p-3 flex items-center justify-between transition-colors ${
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

            {/* Custom Pages Group */}
            <div className="p-3 bg-gray-50 border-t border-b border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom Pages</span>
              <button
                type="button"
                onClick={() => setShowNewPageModal(true)}
                className="text-[10px] bg-black text-white px-2 py-0.5 rounded hover:bg-gray-800 flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" /> New Page
              </button>
            </div>

            {customPagesList.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {customPagesList.map((cp) => (
                  <div
                    key={cp.slug}
                    className={`flex items-center justify-between p-3 transition-colors ${
                      activeSlug === cp.slug
                        ? "bg-gray-100 text-black border-l-4 border-black font-semibold"
                        : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSlug(cp.slug);
                        setStatusMessage(null);
                      }}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span>{cp.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomPage(cp.slug)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete custom page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-400 text-[10px]">
                No custom pages created yet.
              </div>
            )}
          </div>
        </div>

        {/* Content Form */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
            
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-gray-900">{activeTabMeta?.title}</h2>
                <p className="text-[11px] text-gray-400 font-mono">{activeTabMeta?.path}</p>
              </div>
            </div>

            {/* --- ABOUT PAGE --- */}
            {activeSlug === "about" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow Tag</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="05 / About"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Subtitle / Est.</label>
                    <input
                      type="text"
                      value={currentPage.subtitle || ""}
                      onChange={(e) => handleUpdateField("subtitle", e.target.value)}
                      placeholder="Brand Story<br/>Est. 2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="About<br/>Kalana."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Use &lt;br/&gt; for line breaks.</p>
                </div>

                {/* Chapters */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block font-semibold text-gray-700 uppercase">Story Chapters</label>
                    <button
                      type="button"
                      onClick={() => {
                        const chapters = Array.isArray(currentPage.chapters) ? [...currentPage.chapters] : [];
                        chapters.push({ tag: `Chapter 0${chapters.length + 1}`, title: "New Chapter", content: "" });
                        handleUpdateField("chapters", chapters);
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Chapter
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(Array.isArray(currentPage.chapters) ? currentPage.chapters : []).map((ch: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-md bg-gray-50/50 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const chapters = [...currentPage.chapters];
                            chapters.splice(idx, 1);
                            handleUpdateField("chapters", chapters);
                          }}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1">Tag</label>
                            <input
                              type="text"
                              value={ch.tag || ""}
                              onChange={(e) => {
                                const chapters = [...currentPage.chapters];
                                chapters[idx].tag = e.target.value;
                                handleUpdateField("chapters", chapters);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1">Chapter Title</label>
                            <input
                              type="text"
                              value={ch.title || ""}
                              onChange={(e) => {
                                const chapters = [...currentPage.chapters];
                                chapters[idx].title = e.target.value;
                                handleUpdateField("chapters", chapters);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Chapter Narrative</label>
                          <textarea
                            rows={3}
                            value={ch.content || ""}
                            onChange={(e) => {
                              const chapters = [...currentPage.chapters];
                              chapters[idx].content = e.target.value;
                              handleUpdateField("chapters", chapters);
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs font-sans"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- ROASTERY PAGE --- */}
            {activeSlug === "roastery" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Hero Eyebrow</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="02 / Roastery"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Collection Badge</label>
                    <input
                      type="text"
                      value={currentPage.collectionBadge || ""}
                      onChange={(e) => handleUpdateField("collectionBadge", e.target.value)}
                      placeholder="Collection / 01"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Main Editorial Headline</label>
                  <input
                    type="text"
                    value={currentPage.headline || ""}
                    onChange={(e) => handleUpdateField("headline", e.target.value)}
                    placeholder="Coffee<br/>For Everyday<br/>Rituals."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Use &lt;br/&gt; for line breaks.</p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Lead Description</label>
                  <textarea
                    rows={2}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Produced in small batches. Designed for consistency, clarity, and daily enjoyment."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase">Featured Collection Info</h3>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Collection Title</label>
                    <input
                      type="text"
                      value={currentPage.collectionTitle || ""}
                      onChange={(e) => handleUpdateField("collectionTitle", e.target.value)}
                      placeholder="Daily Series."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Collection Description</label>
                    <textarea
                      rows={2}
                      value={currentPage.collectionDesc || ""}
                      onChange={(e) => handleUpdateField("collectionDesc", e.target.value)}
                      placeholder="Everyday blends designed for consistency, versatility, and easy drinking..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase">Roasting Craft & Workshop Documentation</h3>
                  <p className="text-gray-500 text-[11px]">
                    Photo archive documenting your coffee beans roasting stages, drum profiles, and community roasting workshops.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Section Badge</label>
                      <input
                        type="text"
                        value={currentPage.roastingDocBadge || ""}
                        onChange={(e) => handleUpdateField("roastingDocBadge", e.target.value)}
                        placeholder="Archive / 02"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Section Title</label>
                      <input
                        type="text"
                        value={currentPage.roastingDocTitle || ""}
                        onChange={(e) => handleUpdateField("roastingDocTitle", e.target.value)}
                        placeholder="The Roasting Craft & Workshop Archive."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Section Description</label>
                    <textarea
                      rows={2}
                      value={currentPage.roastingDocDesc || ""}
                      onChange={(e) => handleUpdateField("roastingDocDesc", e.target.value)}
                      placeholder="Documenting our small-batch roasting profiles, drum calibrations, and hands-on roasting masterclasses held at the Cikampek roastery."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                    />
                  </div>

                  {/* 4 Documentation Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Card 1 */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
                      <span className="font-semibold text-gray-800 uppercase text-[10px]">Photo Documentation 01</span>
                      <ImageUploadField
                        label="Stage 01 Photo"
                        value={currentPage.roastDoc1Image || ""}
                        onChange={(url) => handleUpdateField("roastDoc1Image", url)}
                        aspectRatio="portrait"
                        helperText="Green coffee grading & sorting (4:5 ratio)"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc1Tag || ""}
                        onChange={(e) => handleUpdateField("roastDoc1Tag", e.target.value)}
                        placeholder="Stage 01 / Green Grading"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc1Title || ""}
                        onChange={(e) => handleUpdateField("roastDoc1Title", e.target.value)}
                        placeholder="Green Bean Selection & Moisture Check"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={currentPage.roastDoc1Desc || ""}
                        onChange={(e) => handleUpdateField("roastDoc1Desc", e.target.value)}
                        placeholder="Inspecting density and sorting specialty green lots..."
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                      />
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
                      <span className="font-semibold text-gray-800 uppercase text-[10px]">Photo Documentation 02</span>
                      <ImageUploadField
                        label="Stage 02 Photo"
                        value={currentPage.roastDoc2Image || ""}
                        onChange={(url) => handleUpdateField("roastDoc2Image", url)}
                        aspectRatio="portrait"
                        helperText="Roasting drum & first crack (4:5 ratio)"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc2Tag || ""}
                        onChange={(e) => handleUpdateField("roastDoc2Tag", e.target.value)}
                        placeholder="Stage 02 / The Drum"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc2Title || ""}
                        onChange={(e) => handleUpdateField("roastDoc2Title", e.target.value)}
                        placeholder="Thermal Transfer & First Crack"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={currentPage.roastDoc2Desc || ""}
                        onChange={(e) => handleUpdateField("roastDoc2Desc", e.target.value)}
                        placeholder="Logging the roast curve, modulating airflow, and checking aroma..."
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                      />
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
                      <span className="font-semibold text-gray-800 uppercase text-[10px]">Photo Documentation 03</span>
                      <ImageUploadField
                        label="Stage 03 Photo"
                        value={currentPage.roastDoc3Image || ""}
                        onChange={(url) => handleUpdateField("roastDoc3Image", url)}
                        aspectRatio="portrait"
                        helperText="Cooling tray & degassing (4:5 ratio)"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc3Tag || ""}
                        onChange={(e) => handleUpdateField("roastDoc3Tag", e.target.value)}
                        placeholder="Stage 03 / Cooling Tray"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc3Title || ""}
                        onChange={(e) => handleUpdateField("roastDoc3Title", e.target.value)}
                        placeholder="Cooling Agitation & Degassing"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={currentPage.roastDoc3Desc || ""}
                        onChange={(e) => handleUpdateField("roastDoc3Desc", e.target.value)}
                        placeholder="Rapid cooling stops residual thermal inertia..."
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                      />
                    </div>

                    {/* Card 4 */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
                      <span className="font-semibold text-gray-800 uppercase text-[10px]">Photo Documentation 04</span>
                      <ImageUploadField
                        label="Stage 04 Photo"
                        value={currentPage.roastDoc4Image || ""}
                        onChange={(url) => handleUpdateField("roastDoc4Image", url)}
                        aspectRatio="portrait"
                        helperText="Cupping table & workshop masterclass (4:5 ratio)"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc4Tag || ""}
                        onChange={(e) => handleUpdateField("roastDoc4Tag", e.target.value)}
                        placeholder="Stage 04 / Cupping Table"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={currentPage.roastDoc4Title || ""}
                        onChange={(e) => handleUpdateField("roastDoc4Title", e.target.value)}
                        placeholder="Sensory Cupping & Workshop Session"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={currentPage.roastDoc4Desc || ""}
                        onChange={(e) => handleUpdateField("roastDoc4Desc", e.target.value)}
                        placeholder="Baristas and workshop attendees dialing in acidity..."
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase">Future Series (In Development)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 border rounded bg-gray-50/50">
                      <p className="font-semibold text-gray-500 text-[10px] uppercase mb-1">Series 02</p>
                      <input
                        type="text"
                        value={currentPage.series2Title || ""}
                        onChange={(e) => handleUpdateField("series2Title", e.target.value)}
                        placeholder="Signature"
                        className="w-full p-1.5 border rounded mb-2 bg-white"
                      />
                      <input
                        type="text"
                        value={currentPage.series2Desc || ""}
                        onChange={(e) => handleUpdateField("series2Desc", e.target.value)}
                        placeholder="Complex single origins."
                        className="w-full p-1.5 border rounded bg-white text-[11px]"
                      />
                    </div>
                    <div className="p-3 border rounded bg-gray-50/50">
                      <p className="font-semibold text-gray-500 text-[10px] uppercase mb-1">Series 03</p>
                      <input
                        type="text"
                        value={currentPage.series3Title || ""}
                        onChange={(e) => handleUpdateField("series3Title", e.target.value)}
                        placeholder="Specialty"
                        className="w-full p-1.5 border rounded mb-2 bg-white"
                      />
                      <input
                        type="text"
                        value={currentPage.series3Desc || ""}
                        onChange={(e) => handleUpdateField("series3Desc", e.target.value)}
                        placeholder="Microlots & experimentals."
                        className="w-full p-1.5 border rounded bg-white text-[11px]"
                      />
                    </div>
                    <div className="p-3 border rounded bg-gray-50/50">
                      <p className="font-semibold text-gray-500 text-[10px] uppercase mb-1">Series 04</p>
                      <input
                        type="text"
                        value={currentPage.series4Title || ""}
                        onChange={(e) => handleUpdateField("series4Title", e.target.value)}
                        placeholder="Limited"
                        className="w-full p-1.5 border rounded mb-2 bg-white"
                      />
                      <input
                        type="text"
                        value={currentPage.series4Desc || ""}
                        onChange={(e) => handleUpdateField("series4Desc", e.target.value)}
                        placeholder="Seasonal drops."
                        className="w-full p-1.5 border rounded bg-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SPACE PAGE --- */}
            {activeSlug === "space" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="03 / Space"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Location Tag</label>
                    <input
                      type="text"
                      value={currentPage.locationTag || ""}
                      onChange={(e) => handleUpdateField("locationTag", e.target.value)}
                      placeholder="Cikampek, West Java"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Headline</label>
                  <input
                    type="text"
                    value={currentPage.headline || ""}
                    onChange={(e) => handleUpdateField("headline", e.target.value)}
                    placeholder="Come<br/>Wander<br/>In."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Coffee, conversations, workshops, and somewhere to stay awhile."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                  />
                </div>

                <ImageUploadField
                  label="Space Hero Photography"
                  value={currentPage.heroImage || ""}
                  onChange={(url) => handleUpdateField("heroImage", url)}
                  helperText="Primary architectural photo for the space page header"
                />

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase">Atmosphere Section</h3>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Atmosphere Headline</label>
                    <input
                      type="text"
                      value={currentPage.atmosphereTitle || ""}
                      onChange={(e) => handleUpdateField("atmosphereTitle", e.target.value)}
                      placeholder="Sanctuary<br/>From the Noise."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Atmosphere Story</label>
                    <textarea
                      rows={3}
                      value={currentPage.atmosphereDesc || ""}
                      onChange={(e) => handleUpdateField("atmosphereDesc", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <ImageUploadField
                      label="Atmosphere Photo 1 (Left / Vertical)"
                      value={currentPage.atmosphereImage1 || ""}
                      onChange={(url) => handleUpdateField("atmosphereImage1", url)}
                      aspectRatio="portrait"
                      helperText="Vertical architectural photo (3:4 ratio)"
                    />
                    <ImageUploadField
                      label="Atmosphere Photo 2 (Right / Offset)"
                      value={currentPage.atmosphereImage2 || ""}
                      onChange={(url) => handleUpdateField("atmosphereImage2", url)}
                      aspectRatio="portrait"
                      helperText="Vertical sanctuary detail photo (3:4 ratio)"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase">Coffee Bar Section</h3>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Coffee Bar Headline</label>
                    <input
                      type="text"
                      value={currentPage.coffeeBarTitle || ""}
                      onChange={(e) => handleUpdateField("coffeeBarTitle", e.target.value)}
                      placeholder="The Coffee Bar"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>

                  <ImageUploadField
                    label="Coffee Bar Panorama Photography"
                    value={currentPage.coffeeBarImage || ""}
                    onChange={(url) => handleUpdateField("coffeeBarImage", url)}
                    aspectRatio="video"
                    helperText="Wide cinematic panoramic photo of the brew bar & espresso machine (21:9 or 16:9 ratio)"
                  />

                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Coffee Bar Philosophy & Description</label>
                    <textarea
                      rows={3}
                      value={currentPage.coffeeBarDesc || ""}
                      onChange={(e) => handleUpdateField("coffeeBarDesc", e.target.value)}
                      placeholder="Our bar is calibrated daily. Featuring our seasonal blends, single-origin offerings, and manual brewing station."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-800">Visit Us & Location Section</span>
                      <p className="text-gray-500 mt-0.5">Address, opening hours, and physical space cover photo are synced with primary location.</p>
                    </div>
                    <a
                      href="/admin/space/location"
                      target="_blank"
                      className="font-medium text-black underline hover:text-gray-700 ml-4 shrink-0"
                    >
                      Edit Location →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* --- WORKSHOPS PAGE --- */}
            {activeSlug === "workshops" && (
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={currentPage.eyebrow || ""}
                    onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                    placeholder="03 / Workshops"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="Workshops."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Gatherings designed around coffee, creativity, and community."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                  />
                </div>
              </div>
            )}

            {/* --- CONTACT PAGE --- */}
            {activeSlug === "contact" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="06 / Contact"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={currentPage.title || ""}
                      onChange={(e) => handleUpdateField("title", e.target.value)}
                      placeholder="Get in Touch."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Lead Narrative</label>
                  <textarea
                    rows={2}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Email Inquiries</label>
                    <input
                      type="email"
                      value={currentPage.email || ""}
                      onChange={(e) => handleUpdateField("email", e.target.value)}
                      placeholder="hello@kalana.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">WhatsApp Reservation</label>
                    <input
                      type="text"
                      value={currentPage.whatsapp || ""}
                      onChange={(e) => handleUpdateField("whatsapp", e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={currentPage.hours || ""}
                      onChange={(e) => handleUpdateField("hours", e.target.value)}
                      placeholder="Daily 08:00 - 22:00 WIB"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Physical Address</label>
                    <input
                      type="text"
                      value={currentPage.address || ""}
                      onChange={(e) => handleUpdateField("address", e.target.value)}
                      placeholder="Jl. Raya Cikampek No. 45, Karawang, Jawa Barat"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- GOODS PAGE --- */}
            {activeSlug === "goods" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="04 / Goods"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Tagline</label>
                    <input
                      type="text"
                      value={currentPage.tagline || ""}
                      onChange={(e) => handleUpdateField("tagline", e.target.value)}
                      placeholder="In Development<br/>Est. 2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    placeholder="Goods."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={currentPage.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    placeholder="Objects for the journey. A future collection of apparel, coffee tools, bags, and lifestyle accessories."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Categories (Comma Separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(currentPage.categories) ? currentPage.categories.join(", ") : (currentPage.categories || "")}
                    onChange={(e) => handleUpdateField("categories", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="Apparel, Coffee Tools, Bags, Accessories, Objects"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* --- LEGAL PAGES (TERMS / PRIVACY / SHIPPING) --- */}
            {["terms", "privacy", "shipping"].includes(activeSlug) && (
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Document Title</label>
                  <input
                    type="text"
                    value={currentPage.title || ""}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Subtitle / Notice</label>
                  <input
                    type="text"
                    value={currentPage.subtitle || ""}
                    onChange={(e) => handleUpdateField("subtitle", e.target.value)}
                    placeholder="Last updated: 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Policy Content (Markdown / Text)</label>
                  <textarea
                    rows={12}
                    value={currentPage.content || ""}
                    onChange={(e) => handleUpdateField("content", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* --- CUSTOM DYNAMIC PAGE EDITOR --- */}
            {isCustomPage && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Page Title</label>
                    <input
                      type="text"
                      value={currentPage.title || ""}
                      onChange={(e) => handleUpdateField("title", e.target.value)}
                      placeholder="Title of Page"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Eyebrow / Header Tag</label>
                    <input
                      type="text"
                      value={currentPage.eyebrow || ""}
                      onChange={(e) => handleUpdateField("eyebrow", e.target.value)}
                      placeholder="KALANA / Custom"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Subtitle / Headline</label>
                  <input
                    type="text"
                    value={currentPage.headline || ""}
                    onChange={(e) => handleUpdateField("headline", e.target.value)}
                    placeholder="Sub-headline or key intro message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <ImageUploadField
                  label="Featured Image (Optional)"
                  value={currentPage.imageUrl || ""}
                  onChange={(url) => handleUpdateField("imageUrl", url)}
                  helperText="Header photo or banner image for this custom page"
                />

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Page Content (Markdown / Text)</label>
                  <textarea
                    rows={12}
                    value={currentPage.content || ""}
                    onChange={(e) => handleUpdateField("content", e.target.value)}
                    placeholder="Write the full narrative or body text for this page..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* New Custom Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">CREATE NEW CUSTOM PAGE</h3>
              <button 
                onClick={() => setShowNewPageModal(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCustomPage} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Page Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Sustainability & Sourcing"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">URL Slug *</label>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-gray-500 font-mono text-[11px]">/p/</span>
                  <input
                    type="text"
                    required
                    placeholder="sustainability"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full p-2 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
