"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { savePageContent } from "@/lib/actions/pages";
import { updateSocialLinks } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";

export function NavigationEditor({ initialNav, initialSocials = [] }: { initialNav: any; initialSocials?: any[] }) {
  const router = useRouter();
  const [nav, setNav] = useState({
    header: Array.isArray(initialNav?.header) ? initialNav.header : [],
    footer: Array.isArray(initialNav?.footer) ? initialNav.footer : [],
    legal: Array.isArray(initialNav?.legal) ? initialNav.legal : [],
  });
  const [socials, setSocials] = useState<any[]>(
    Array.isArray(initialSocials) && initialSocials.length > 0
      ? initialSocials
      : [{ platform: "Instagram", url: "https://www.instagram.com/kalanaspace_", isActive: true }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAddLink = (menu: "header" | "footer" | "legal") => {
    setNav({
      ...nav,
      [menu]: [...nav[menu], { label: "NEW LINK", url: "/" }]
    });
  };

  const handleUpdateLink = (menu: "header" | "footer" | "legal", index: number, field: string, val: string) => {
    const updated = [...nav[menu]];
    updated[index] = { ...updated[index], [field]: val };
    setNav({ ...nav, [menu]: updated });
  };

  const handleRemoveLink = (menu: "header" | "footer" | "legal", index: number) => {
    const updated = [...nav[menu]];
    updated.splice(index, 1);
    setNav({ ...nav, [menu]: updated });
  };

  const handleAddSocial = () => {
    setSocials([...socials, { platform: "", url: "", isActive: true }]);
  };

  const handleUpdateSocial = (index: number, field: string, val: any) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: val };
    setSocials(updated);
  };

  const handleRemoveSocial = (index: number) => {
    const updated = [...socials];
    updated.splice(index, 1);
    setSocials(updated);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const [navRes, socialRes] = await Promise.all([
        savePageContent("navigation", "Navigation Menus", nav),
        updateSocialLinks(socials)
      ]);
      if (navRes.success && socialRes.success) {
        setStatusMessage({ type: "success", text: "Navigation menus & social links saved successfully!" });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: navRes.error || socialRes.error || "Failed to save." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation Menus</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage links appearing in the top Header bar, Footer explore list, and Legal links.
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
            Save Menus
          </button>
        </div>
      </div>

      {/* Header Menu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Header Menu</h2>
            <p className="text-xs text-gray-400">Main links displayed in the top desktop and mobile navigation.</p>
          </div>
          <button
            type="button"
            onClick={() => handleAddLink("header")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {nav.header.map((link: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={link.label || ""}
                onChange={(e) => handleUpdateLink("header", idx, "label", e.target.value)}
                placeholder="Label (e.g. ROASTERY)"
                className="w-1/3 text-xs uppercase font-semibold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <input
                type="text"
                value={link.url || ""}
                onChange={(e) => handleUpdateLink("header", idx, "url", e.target.value)}
                placeholder="Path (e.g. /roastery)"
                className="flex-1 text-xs font-mono px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveLink("header", idx)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Menu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Footer Shop Menu</h2>
            <p className="text-xs text-gray-400">Links shown in the "Shop" column in the footer.</p>
          </div>
          <button
            type="button"
            onClick={() => handleAddLink("footer")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {nav.footer.map((link: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={link.label || ""}
                onChange={(e) => handleUpdateLink("footer", idx, "label", e.target.value)}
                placeholder="Label"
                className="w-1/3 text-xs uppercase font-semibold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <input
                type="text"
                value={link.url || ""}
                onChange={(e) => handleUpdateLink("footer", idx, "url", e.target.value)}
                placeholder="Path"
                className="flex-1 text-xs font-mono px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveLink("footer", idx)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Menu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Footer Legal Links</h2>
            <p className="text-xs text-gray-400">Links shown at the bottom of the footer (e.g. Terms, Privacy).</p>
          </div>
          <button
            type="button"
            onClick={() => handleAddLink("legal")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {nav.legal.map((link: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={link.label || ""}
                onChange={(e) => handleUpdateLink("legal", idx, "label", e.target.value)}
                placeholder="Label"
                className="w-1/3 text-xs uppercase font-semibold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <input
                type="text"
                value={link.url || ""}
                onChange={(e) => handleUpdateLink("legal", idx, "url", e.target.value)}
                placeholder="Path"
                className="flex-1 text-xs font-mono px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveLink("legal", idx)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Social Media Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Footer Social Media Links</h2>
            <p className="text-xs text-gray-400">Links shown in the &quot;Socials&quot; column in the footer (e.g. Instagram, TikTok, WhatsApp).</p>
          </div>
          <button
            type="button"
            onClick={handleAddSocial}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Social Link
          </button>
        </div>

        <div className="space-y-3">
          {socials.map((social: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={social.platform || ""}
                onChange={(e) => handleUpdateSocial(idx, "platform", e.target.value)}
                placeholder="Platform (e.g. Instagram)"
                className="w-1/3 text-xs uppercase font-semibold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <input
                type="url"
                value={social.url || ""}
                onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs font-mono px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveSocial(idx)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {socials.length === 0 && (
            <p className="text-xs text-gray-400 italic">No social links configured. Click &quot;Add Social Link&quot; to add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
