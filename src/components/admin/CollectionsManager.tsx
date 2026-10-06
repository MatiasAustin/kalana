"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Package, 
  Check, 
  Loader2,
  Layers
} from "lucide-react";
import { 
  createCollection, 
  updateCollection, 
  deleteCollection, 
  toggleCollectionStatus 
} from "@/lib/actions/collections";

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface CollectionProductRelation {
  productId: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "ACTIVE" | "DRAFT" | null;
  products?: CollectionProductRelation[];
}

interface CollectionsManagerProps {
  initialCollections: Collection[];
  allProducts: Product[];
}

export function CollectionsManager({ initialCollections, allProducts }: CollectionsManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "DRAFT",
    productIds: [] as string[],
  });

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "ACTIVE",
      productIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingId(col.id);
    setFormData({
      name: col.name,
      slug: col.slug,
      description: col.description || "",
      status: (col.status as any) || "ACTIVE",
      productIds: col.products?.map(p => p.productId) || [],
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: editingId ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    }));
  };

  const toggleProductSelect = (prodId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(prodId)
        ? prev.productIds.filter(id => id !== prodId)
        : [...prev.productIds, prodId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Collection Name is required");
    if (!formData.slug) return alert("Slug is required");

    setActionLoading("save");
    try {
      if (editingId) {
        const res = await updateCollection(editingId, formData);
        if (res.success) {
          setCollections(prev => prev.map(c => c.id === editingId ? {
            ...c,
            ...formData,
            products: formData.productIds.map(productId => ({ productId }))
          } : c));
          setIsModalOpen(false);
        } else {
          alert(res.error || "Failed to update collection");
        }
      } else {
        const res = await createCollection(formData);
        if (res.success && res.id) {
          const newCol: Collection = {
            id: res.id,
            ...formData,
            products: formData.productIds.map(productId => ({ productId }))
          };
          setCollections(prev => [newCol, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(res.error || "Failed to create collection");
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (col: Collection) => {
    setActionLoading(`stat-${col.id}`);
    try {
      const res = await toggleCollectionStatus(col.id, col.status || "ACTIVE");
      if (res.success) {
        const newStatus = col.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
        setCollections(prev => prev.map(c => c.id === col.id ? { ...c, status: newStatus } : c));
      } else {
        alert(res.error || "Failed to update status");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"? Products inside will not be deleted.`)) return;
    setActionLoading(`del-${id}`);
    try {
      const res = await deleteCollection(id);
      if (res.success) {
        setCollections(prev => prev.filter(c => c.id !== id));
      } else {
        alert(res.error || "Failed to delete collection");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">COLLECTIONS</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Group your products into collections (e.g. Single Origin, House Blends)</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          CREATE COLLECTION
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
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
                <th className="px-5 py-3 font-semibold">Collection</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 font-semibold">Products</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Layers className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-800">No collections found</p>
                    <p className="text-[11px] mt-1 text-gray-400">
                      Create collections to organize your coffees and merchandise.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900">{col.name}</div>
                      {col.description && (
                        <div className="text-[10px] text-gray-400 font-sans line-clamp-1">{col.description}</div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-gray-500">
                      <span className="text-gray-400 font-mono">/roastery/collection/</span>{col.slug}
                    </td>

                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {col.products?.length || 0} products
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(col)}
                        disabled={actionLoading === `stat-${col.id}`}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                          col.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {col.status || "ACTIVE"}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                          title="Edit Collection"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(col.id, col.name)}
                          disabled={actionLoading === `del-${col.id}`}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 text-gray-500 text-[11px]">
          Showing {filtered.length} of {collections.length} collections
        </div>

      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? "EDIT COLLECTION" : "NEW COLLECTION"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Single Origin Series"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">URL Handle (Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="single-origin-series"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional collection description or story..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black font-sans"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              {/* Products Checklist */}
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">
                  Include Products ({formData.productIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100 p-1">
                  {allProducts.length === 0 ? (
                    <p className="p-3 text-center text-gray-400">No products available.</p>
                  ) : (
                    allProducts.map((p) => {
                      const isChecked = formData.productIds.includes(p.id);
                      return (
                        <label 
                          key={p.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductSelect(p.id)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "save"}
                  className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2"
                >
                  {actionLoading === "save" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? "Update Collection" : "Save Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
