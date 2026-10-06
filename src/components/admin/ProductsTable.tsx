"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  Download, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  Package, 
  CheckCircle2, 
  Clock, 
  Archive,
  Loader2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { 
  updateProductStatus, 
  bulkUpdateProductStatus, 
  bulkDeleteProducts, 
  duplicateProduct, 
  deleteProduct 
} from "@/lib/actions/products";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string | null;
  weight: number | null;
}

interface ProductMediaItem {
  id: string;
  isPrimary: boolean | null;
  media: {
    id: string;
    url: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
  createdAt: Date | string | null;
  variants: ProductVariant[];
  media: ProductMediaItem[];
}

export function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "DRAFT" | "ARCHIVED">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter products based on tab and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab !== "ALL" && p.status !== activeTab) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const name = (p.name || "").toLowerCase();
        const slug = (p.slug || "").toLowerCase();
        const skus = p.variants?.map(v => (v.sku || "").toLowerCase()).join(" ") || "";
        return name.includes(query) || slug.includes(query) || skus.includes(query);
      }

      return true;
    });
  }, [products, activeTab, search]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(`dup-${id}`);
    try {
      const res = await duplicateProduct(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to duplicate product");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActionLoading(`del-${id}`);
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        alert(res.error || "Failed to delete product");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setActionLoading(`stat-${product.id}`);
    try {
      const res = await updateProductStatus(product.id, newStatus);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      } else {
        alert(res.error || "Failed to change status");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkStatus = async (status: "ACTIVE" | "DRAFT" | "ARCHIVED") => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk-status");
    try {
      const res = await bulkUpdateProductStatus(selectedIds, status);
      if (res.success) {
        setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
        setSelectedIds([]);
      } else {
        alert(res.error || "Failed to update selected products");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected products?`)) return;
    setActionLoading("bulk-delete");
    try {
      const res = await bulkDeleteProducts(selectedIds);
      if (res.success) {
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else {
        alert(res.error || "Failed to delete selected products");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return alert("No products to export.");

    const headers = [
      "Product Name",
      "Slug",
      "Status",
      "Variants Count",
      "Min Price (IDR)",
      "Max Price (IDR)",
      "SKUs"
    ];

    const rows = filteredProducts.map((p) => {
      const prices = p.variants?.map(v => v.price) || [0];
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const skus = p.variants?.map(v => v.sku).filter(Boolean).join("; ") || "-";

      return [
        `"${p.name}"`,
        `"${p.slug}"`,
        `"${p.status || "DRAFT"}"`,
        p.variants?.length || 0,
        minPrice,
        maxPrice,
        `"${skus}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kalana-products-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">ALL PRODUCTS</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Manage your coffee beans, equipment, and merchandise catalog</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD PRODUCT
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Filter Tabs & Search */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 sm:pb-0 sm:border-0 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeTab === "ALL" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeTab === "ACTIVE" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Active ({products.filter(p => p.status === "ACTIVE").length})
              </button>
              <button
                onClick={() => setActiveTab("DRAFT")}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeTab === "DRAFT" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Draft ({products.filter(p => p.status === "DRAFT").length})
              </button>
              <button
                onClick={() => setActiveTab("ARCHIVED")}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeTab === "ARCHIVED" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Archived ({products.filter(p => p.status === "ARCHIVED").length})
              </button>
            </div>

            {/* Bulk actions banner */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded text-xs">
                <span className="font-semibold text-gray-900">{selectedIds.length} selected:</span>
                <button
                  onClick={() => handleBulkStatus("ACTIVE")}
                  className="px-2 py-1 bg-white hover:bg-black hover:text-white rounded border border-gray-300"
                >
                  Set Active
                </button>
                <button
                  onClick={() => handleBulkStatus("DRAFT")}
                  className="px-2 py-1 bg-white hover:bg-black hover:text-white rounded border border-gray-300"
                >
                  Set Draft
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name, slug, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px]">
              <tr>
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                </th>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Variants</th>
                <th className="px-5 py-3 font-semibold text-right">Price</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-800">No products found</p>
                    <p className="text-[11px] mt-1 text-gray-400">
                      Try adjusting your search query or add a new product.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const primaryMedia = product.media?.find(m => m.isPrimary)?.media || product.media?.[0]?.media;
                  const prices = product.variants?.map(v => v.price) || [0];
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const priceLabel = minPrice === maxPrice 
                    ? `IDR ${minPrice.toLocaleString("id-ID")}`
                    : `IDR ${minPrice.toLocaleString("id-ID")} - ${maxPrice.toLocaleString("id-ID")}`;

                  return (
                    <tr 
                      key={product.id}
                      className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-gray-50" : ""}`}
                    >
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {primaryMedia?.url ? (
                              <img src={primaryMedia.url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <Link 
                              href={`/admin/products/edit/${product.id}`}
                              className="font-bold text-gray-900 hover:underline flex items-center gap-1.5"
                            >
                              {product.name}
                            </Link>
                            <div className="text-[10px] text-gray-400 font-sans mt-0.5 flex items-center gap-2">
                              <span>/{product.slug}</span>
                              <a 
                                href={`/product/${product.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-black flex items-center gap-0.5"
                                title="View in Store"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          title="Click to toggle status"
                          disabled={actionLoading === `stat-${product.id}`}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : product.status === "ARCHIVED"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {product.status || "DRAFT"}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">
                        {product.variants?.length || 0} variants
                      </td>

                      <td className="px-5 py-3.5 text-right font-medium text-gray-900 whitespace-nowrap">
                        {priceLabel}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(product.id)}
                            disabled={actionLoading === `dup-${product.id}`}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                            title="Duplicate Product"
                          >
                            {actionLoading === `dup-${product.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={actionLoading === `del-${product.id}`}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 text-gray-500 text-[11px] flex justify-between items-center">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          {selectedIds.length > 0 && (
            <span className="font-semibold text-black">{selectedIds.length} products selected</span>
          )}
        </div>

      </div>

    </div>
  );
}
