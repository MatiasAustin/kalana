"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings, updatePrimaryLocation, updateSocialLinks } from "@/lib/actions/settings";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function StoreSettingsForm({ initialSettings, initialLocation, initialSocials }: any) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States
  const [settings, setSettings] = useState({
    brandName: initialSettings?.brandName || "KALANA",
    tagline: initialSettings?.tagline || "",
    primaryEmail: initialSettings?.primaryEmail || "",
    phone: initialSettings?.phone || "",
  });

  const [location, setLocation] = useState({
    name: initialLocation?.name || "HQ",
    address: initialLocation?.address || "",
    province: initialLocation?.province || "",
    city: initialLocation?.city || "",
  });

  const [socials, setSocials] = useState<any[]>(
    initialSocials?.length ? initialSocials : [{ platform: "Instagram", url: "", isActive: true }]
  );

  const handleAddSocial = () => {
    setSocials([...socials, { platform: "", url: "", isActive: true }]);
  };

  const handleSocialChange = (index: number, field: string, value: any) => {
    const newSocials = [...socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setSocials(newSocials);
  };

  const handleRemoveSocial = (index: number) => {
    const newSocials = [...socials];
    newSocials.splice(index, 1);
    setSocials(newSocials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateSiteSettings(settings);
      await updatePrimaryLocation(location);
      await updateSocialLinks(socials);
      
      router.refresh();
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      
      {/* Brand Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Brand Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input 
              type="text" 
              required
              value={settings.brandName}
              onChange={e => setSettings({...settings, brandName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input 
              type="text" 
              value={settings.tagline}
              onChange={e => setSettings({...settings, tagline: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
            <input 
              type="email" 
              value={settings.primaryEmail}
              onChange={e => setSettings({...settings, primaryEmail: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
            <input 
              type="text" 
              value={settings.phone}
              onChange={e => setSettings({...settings, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
        </div>
      </div>

      {/* Primary Location */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Primary Location</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              rows={3}
              value={location.address}
              onChange={e => setLocation({...location, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              type="text" 
              value={location.city}
              onChange={e => setLocation({...location, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province / State</label>
            <input 
              type="text" 
              value={location.province}
              onChange={e => setLocation({...location, province: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-medium text-gray-900">Social Links</h2>
          <button type="button" onClick={handleAddSocial} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add Link
          </button>
        </div>
        
        <div className="space-y-4">
          {socials.map((social, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Platform (e.g. Instagram)"
                value={social.platform}
                onChange={e => handleSocialChange(idx, 'platform', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
              />
              <input 
                type="url" 
                placeholder="URL"
                value={social.url}
                onChange={e => handleSocialChange(idx, 'url', e.target.value)}
                className="flex-[2] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
              />
              <button type="button" onClick={() => handleRemoveSocial(idx)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Settings
        </button>
      </div>
    </form>
  );
}
