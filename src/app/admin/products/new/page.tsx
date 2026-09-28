import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Plus } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" placeholder="e.g., DAILY HOUSE" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={6} placeholder="Product description..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Media</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Add files or drop files to upload</p>
              <p className="text-xs text-gray-500 mt-1">Accepts images and video</p>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Variants</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" id="has-variants" />
                <label htmlFor="has-variants" className="text-sm text-gray-700">This product has options, like size or color</label>
              </div>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3 hidden">
                {/* Variant Builder - Simplified for now */}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Status</h2>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>

          {/* Organization */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Organization</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                <option>Coffee Beans</option>
                <option>Apparel</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
              <input type="text" placeholder="Search collections..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input type="text" placeholder="Find or create tags" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 p-4 px-8 flex justify-end gap-3 z-10 hidden md:flex">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Discard</button>
        <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">Save</button>
      </div>
    </div>
  );
}
