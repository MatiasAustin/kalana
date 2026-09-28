"use client";

import { useState } from "react";
import { GripVertical, Eye, Settings, Plus, Loader2, Trash2 } from "lucide-react";
import { updateHomepageSections } from "@/lib/actions/homepage";
import { useRouter } from "next/navigation";

export function HomepageEditor({ initialSections }: { initialSections: any[] }) {
  const router = useRouter();
  const [sections, setSections] = useState<any[]>(initialSections.length > 0 ? initialSections : [
    { id: "new-hero", type: "HERO", isEnabled: true, data: { eyebrow: "KALANA SPACE & ROASTERY", headline: "SPACE. COFFEE. FURTHER DAYS.", description: "KALANA is a space...", ctaText: "EXPLORE", ctaUrl: "/roastery" } }
  ]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleUpdateActiveSection = (key: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id === activeSectionId) {
        return { ...s, data: { ...s.data, [key]: value } };
      }
      return s;
    }));
  };

  const handleToggleVisibility = (id: string) => {
    setSections(sections.map(s => {
      if (s.id === id) return { ...s, isEnabled: !s.isEnabled };
      return s;
    }));
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
    setSections(sections.filter(s => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateHomepageSections(sections);
      router.refresh();
      alert("Homepage saved!");
    } catch (err) {
      alert("Failed to save homepage");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the sections on your store's homepage</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-900">Sections</h2>
              <div className="relative group">
                <button className="text-sm text-blue-600 flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-10">
                  <button onClick={() => handleAddSection("HERO")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Hero Banner</button>
                  <button onClick={() => handleAddSection("FEATURED_COLLECTION")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Featured Collection</button>
                  <button onClick={() => handleAddSection("BRAND_STORY")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Brand Story</button>
                  <button onClick={() => handleAddSection("SPACE")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Space</button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {sections.map((sec, idx) => (
                <div 
                  key={sec.id} 
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${activeSectionId === sec.id ? 'bg-gray-100 border-l-2 border-black' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
                  onClick={() => setActiveSectionId(sec.id)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sec.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(sec.id); }}
                      className={`text-xs px-2 py-1 rounded ${sec.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {sec.isEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeSection ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Edit {activeSection.type}
              </h3>
              
              <div className="space-y-4">
                {/* Dynamically render fields based on type */}
                {activeSection.type === 'HERO' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
                      <input type="text" value={activeSection.data.eyebrow || ''} onChange={e => handleUpdateActiveSection('eyebrow', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                      <input type="text" value={activeSection.data.headline || ''} onChange={e => handleUpdateActiveSection('headline', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea rows={3} value={activeSection.data.description || ''} onChange={e => handleUpdateActiveSection('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                        <input type="text" value={activeSection.data.ctaText || ''} onChange={e => handleUpdateActiveSection('ctaText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
                        <input type="text" value={activeSection.data.ctaUrl || ''} onChange={e => handleUpdateActiveSection('ctaUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                      </div>
                    </div>
                  </>
                )}

                {activeSection.type === 'FEATURED_COLLECTION' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                      <input type="text" value={activeSection.data.title || ''} onChange={e => handleUpdateActiveSection('title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
                      <input type="text" value={activeSection.data.subtext || ''} onChange={e => handleUpdateActiveSection('subtext', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </>
                )}

                {activeSection.type === 'BRAND_STORY' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Story Content</label>
                      <textarea rows={6} value={activeSection.data.content || ''} onChange={e => handleUpdateActiveSection('content', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
                    </div>
                  </>
                )}
                
                {activeSection.type === 'SPACE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input type="text" value={activeSection.data.title || ''} onChange={e => handleUpdateActiveSection('title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center text-gray-500">
              Select a section to edit its content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
