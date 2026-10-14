"use client";

import { useState } from "react";
import { Layers, CheckSquare, Globe, ExternalLink, Search, Check, X, Info } from "lucide-react";

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  products?: Array<{ productId: string }>;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  blend?: string | null;
  status?: string | null;
}

export interface ProductSectionFilterProps {
  title?: string;
  description?: string;
  collections?: CollectionItem[];
  allProducts?: ProductItem[];
  displayMode: "all" | "collection" | "custom";
  collectionId?: string;
  productIds?: string[];
  productLimit?: number;
  onChangeDisplayMode: (mode: "all" | "collection" | "custom") => void;
  onChangeCollectionId: (collectionId: string) => void;
  onChangeProductIds: (productIds: string[]) => void;
  onChangeProductLimit: (limit: number) => void;
}

export function ProductSectionFilter({
  title = "Pengaturan Tampilan Produk Section",
  description = "Pilih kategori atau tentukan produk spesifik yang tampil pada section ini agar tidak tercampur dengan series lain.",
  collections = [],
  allProducts = [],
  displayMode = "all",
  collectionId = "",
  productIds = [],
  productLimit = 2,
  onChangeDisplayMode,
  onChangeCollectionId,
  onChangeProductIds,
  onChangeProductLimit,
}: ProductSectionFilterProps) {
  const [productSearch, setProductSearch] = useState("");

  const toggleProductId = (id: string) => {
    const current = productIds || [];
    if (current.includes(id)) {
      onChangeProductIds(current.filter((item) => item !== id));
    } else {
      onChangeProductIds([...current, id]);
    }
  };

  const removeProductId = (id: string) => {
    const current = productIds || [];
    onChangeProductIds(current.filter((item) => item !== id));
  };

  const filteredProducts = allProducts.filter((p) => {
    const term = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term);
  });

  // Calculate current active preview count
  let previewText = "";
  if (displayMode === "custom") {
    const count = (productIds || []).length;
    const names = (productIds || [])
      .map((id) => allProducts.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    previewText = count > 0 
      ? `${count} produk dipilih manual (${names})` 
      : "Belum ada produk yang dipilih (akan menampilkan fallback)";
  } else if (displayMode === "collection") {
    const col = collections.find((c) => c.id === collectionId || c.slug === collectionId);
    previewText = col 
      ? `Menampilkan produk dari koleksi "${col.name}"` 
      : "Pilih salah satu koleksi di bawah";
  } else {
    previewText = "Menampilkan semua produk aktif tanpa filter koleksi";
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-kalana-black" />
            {title}
          </h4>
          <span className="text-[10px] text-gray-400 font-mono">Filter & Choice</span>
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChangeDisplayMode("collection")}
          className={`flex items-center gap-2 p-3 rounded-md border text-left transition-all ${
            displayMode === "collection"
              ? "bg-white border-black shadow-sm ring-1 ring-black text-gray-900"
              : "bg-white/60 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white"
          }`}
        >
          <Layers className="w-4 h-4 text-gray-700 shrink-0" />
          <div>
            <div className="text-xs font-semibold">Per Koleksi / Kategori</div>
            <div className="text-[10px] text-gray-400">Misal: Daily Series</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeDisplayMode("custom")}
          className={`flex items-center gap-2 p-3 rounded-md border text-left transition-all ${
            displayMode === "custom"
              ? "bg-white border-black shadow-sm ring-1 ring-black text-gray-900"
              : "bg-white/60 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white"
          }`}
        >
          <CheckSquare className="w-4 h-4 text-gray-700 shrink-0" />
          <div>
            <div className="text-xs font-semibold">Pilih Manual (Custom)</div>
            <div className="text-[10px] text-gray-400">Centang produk spesifik</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeDisplayMode("all")}
          className={`flex items-center gap-2 p-3 rounded-md border text-left transition-all ${
            displayMode === "all"
              ? "bg-white border-black shadow-sm ring-1 ring-black text-gray-900"
              : "bg-white/60 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white"
          }`}
        >
          <Globe className="w-4 h-4 text-gray-700 shrink-0" />
          <div>
            <div className="text-xs font-semibold">Semua Produk</div>
            <div className="text-[10px] text-gray-400">Tanpa filter kategori</div>
          </div>
        </button>
      </div>

      {/* MODE 1: BY COLLECTION */}
      {displayMode === "collection" && (
        <div className="bg-white p-3.5 rounded border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Pilih Koleksi / Kategori:
            </label>
            <a
              href="/admin/products/collections"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-gray-500 hover:text-black inline-flex items-center gap-1 font-medium"
            >
              Kelola Koleksi <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <select
            value={collectionId || ""}
            onChange={(e) => onChangeCollectionId(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none bg-white"
          >
            <option value="">-- Pilih Koleksi --</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name} {col.products?.length ? `(${col.products.length} produk)` : ""}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-gray-400">
            Hanya produk yang terdaftar di dalam koleksi ini yang akan tampil pada section. Produk di luar koleksi ini (seperti Terra Series) otomatis tersembunyi dari section ini.
          </p>
        </div>
      )}

      {/* MODE 2: CUSTOM BY CHOICE */}
      {displayMode === "custom" && (
        <div className="bg-white p-3.5 rounded border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Pilih Produk yang Ingin Ditampilkan:
            </label>
            <span className="text-[11px] font-mono text-gray-500">
              {(productIds || []).length} terpilih
            </span>
          </div>

          {/* Selected pills */}
          {(productIds || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded border border-gray-100">
              {(productIds || []).map((id) => {
                const prod = allProducts.find((p) => p.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 text-xs bg-black text-white px-2 py-0.5 rounded-full"
                  >
                    {prod ? prod.name : id}
                    <button
                      type="button"
                      onClick={() => removeProductId(id)}
                      className="hover:text-red-300 ml-0.5 font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Cari produk (misal: Daily House, Terra Dark)..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          {/* Scrollable Checkbox List */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-gray-100 rounded p-1.5">
            {filteredProducts.length === 0 ? (
              <div className="text-xs text-gray-400 py-3 text-center">Produk tidak ditemukan.</div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = (productIds || []).includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProductId(p.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? "bg-black/5 text-gray-900 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-black border-black text-white" : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{p.name}</span>
                    </div>
                    {p.blend && <span className="text-[10px] text-gray-400 font-mono">{p.blend}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Limit Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-gray-200/70">
        <label className="text-xs font-semibold text-gray-700 uppercase">
          Maksimal Produk Ditampilkan:
        </label>
        <div className="flex items-center gap-1.5">
          {[2, 4, 6, 0].map((limit) => (
            <button
              key={limit}
              type="button"
              onClick={() => onChangeProductLimit(limit)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                (productLimit ?? 2) === limit
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {limit === 0 ? "Semua" : `${limit} Produk`}
            </button>
          ))}
        </div>
      </div>

      {/* Live Status Info Banner */}
      <div className="flex items-start gap-2 bg-blue-50/70 border border-blue-200/60 rounded p-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Status Tampilan: </span>
          <span>{previewText}</span>
        </div>
      </div>
    </div>
  );
}
