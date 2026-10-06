import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export default async function ProductsPage() {
  const allProducts = await db.query.products.findMany({
    with: {
      variants: true,
      media: {
        with: {
          media: true
        }
      }
    },
    orderBy: [desc(products.createdAt)],
  }).catch((err) => {
    console.error('Failed to load products:', err);
    return [];
  });

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
                <th className="px-6 py-3 font-medium">Variants</th>
                <th className="px-6 py-3 font-medium text-right">Price</th>
                <th className="px-6 py-3 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {allProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                allProducts.map(product => {
                  const primaryMedia = product.media.find(m => m.isPrimary)?.media || product.media[0]?.media;
                  const firstVariant = product.variants[0];
                  
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                            {primaryMedia ? (
                              <img src={primaryMedia.url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-300"></div>
                            )}
                          </div>
                          <Link href={`/admin/products/edit/${product.id}`} className="font-medium text-black hover:underline">
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {/* We don't have aggregated inventory yet, just show variants count */}
                        {product.variants.length} variant(s)
                      </td>
                      <td className="px-6 py-4 text-gray-600 flex flex-wrap gap-1">
                        {product.variants.map(v => (
                          <span key={v.id} className="bg-gray-100 px-2 py-1 rounded-md text-[10px] uppercase">{v.name}</span>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {firstVariant ? `IDR ${firstVariant.price.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {allProducts.length} products</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
