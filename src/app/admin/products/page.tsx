import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">All</span>
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Active</span>
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Draft</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Inventory</th>
                <th className="px-6 py-3 font-medium">Collection</th>
                <th className="px-6 py-3 font-medium text-right">Price</th>
                <th className="px-6 py-3 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy Data */}
              <ProductRow 
                name="DAILY HOUSE" 
                image="/api/placeholder/40/40" 
                status="Active" 
                inventory="12 in stock for 2 variants" 
                collection="DAILY SERIES" 
                price="Rp 85,000" 
              />
              <ProductRow 
                name="DAILY CREMA" 
                image="/api/placeholder/40/40" 
                status="Active" 
                inventory="8 in stock for 2 variants" 
                collection="DAILY SERIES" 
                price="Rp 95,000" 
              />
              <ProductRow 
                name="ETHIOPIA YIRGACHEFFE" 
                image="/api/placeholder/40/40" 
                status="Draft" 
                inventory="0 in stock" 
                collection="SPECIALTY SERIES" 
                price="Rp 120,000" 
              />
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 3 of 3 products</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ name, image, status, inventory, collection, price }: any) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 group">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded border border-gray-200 overflow-hidden">
            {/* img placeholder */}
            <div className="w-full h-full bg-gray-300"></div>
          </div>
          <Link href={`/admin/products/edit`} className="font-medium text-black hover:underline">
            {name}
          </Link>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-600">
        {inventory}
      </td>
      <td className="px-6 py-4 text-gray-600">
        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{collection}</span>
      </td>
      <td className="px-6 py-4 text-right text-gray-900">
        {price}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
