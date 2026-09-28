import { GripVertical, Eye, Settings, Plus } from 'lucide-react';

export default function HomepageEditorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the sections on your store's homepage</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Publish
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-900">Sections</h2>
          <button className="text-sm text-blue-600 hover:underline">Add Section</button>
        </div>
        
        <div className="divide-y divide-gray-100">
          <SectionRow title="Hero Banner" type="hero" isVisible={true} />
          <SectionRow title="Featured Collection" type="collection" isVisible={true} />
          <SectionRow title="Brand Story" type="text" isVisible={true} />
          <SectionRow title="KALANA Space" type="image-with-text" isVisible={true} />
          <SectionRow title="Newsletter" type="newsletter" isVisible={false} />
        </div>
      </div>

      {/* Editor Panel Example */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Hero Banner Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
            <input type="text" defaultValue="KALANA SPACE & ROASTERY" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input type="text" defaultValue="SPACE. COFFEE. FURTHER DAYS." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} defaultValue='"KALANA is a space, a roastery, and a growing collection of things made for everyday journeys."' className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA Text</label>
              <input type="text" defaultValue="EXPLORE KALANA" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA URL</label>
              <input type="text" defaultValue="/collections/all" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
             <div className="border border-gray-200 rounded-md p-4 flex items-center justify-between bg-gray-50">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-gray-300 rounded overflow-hidden"></div>
                 <span className="text-sm font-medium">hero-background-1.jpg</span>
               </div>
               <button className="text-sm text-blue-600 hover:underline">Change</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionRow({ title, type, isVisible }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3">
        <div className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 uppercase">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className={`text-sm ${isVisible ? 'text-green-600' : 'text-gray-400'}`}>
          {isVisible ? 'Visible' : 'Hidden'}
        </button>
        <button className="text-gray-400 hover:text-black p-1 rounded-md hover:bg-gray-200">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
