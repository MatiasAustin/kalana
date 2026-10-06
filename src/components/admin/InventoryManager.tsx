"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Loader2,
  RefreshCw,
  Plus,
  Minus
} from "lucide-react";
import { updateInventoryStock, bulkUpdateInventoryStock } from "@/lib/actions/inventory";

interface VariantWithInventory {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  product?: {
    id: string;
    name: string;
  } | null;
  inventory?: {
    id: string;
    available: number | null;
    reserved: number | null;
    committed: number | null;
    incoming: number | null;
  } | null;
}

export function InventoryManager({ initialVariants }: { initialVariants: VariantWithInventory[] }) {
  const router = useRouter();
  const [variants, setVariants] = useState(initialVariants);
  const [stockChanges, setStockChanges] = useState<{ [variantId: string]: number }>({});
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const getCurrentStock = (v: VariantWithInventory) => {
    if (stockChanges[v.id] !== undefined) {
      return stockChanges[v.id];
    }
    return v.inventory?.available ?? 10; // Default 10 if not explicitly tracked
  };

  const handleStockChange = (variantId: string, val: number) => {
    setStockChanges(prev => ({
      ...prev,
      [variantId]: Math.max(0, val)
    }));
  };

  const handleSaveSingle = async (v: VariantWithInventory) => {
    const newQty = getCurrentStock(v);
    setSavingId(v.id);
    try {
      const res = await updateInventoryStock(v.id, newQty);
      if (res.success) {
        setVariants(prev => prev.map(item => item.id === v.id ? {
          ...item,
          inventory: {
            id: item.inventory?.id || "temp",
            available: newQty,
            reserved: item.inventory?.reserved || 0,
            committed: item.inventory?.committed || 0,
            incoming: item.inventory?.incoming || 0,
          }
        } : item));
        setStockChanges(prev => {
          const updated = { ...prev };
          delete updated[v.id];
          return updated;
        });
      } else {
        alert(res.error || "Failed to update stock");
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkSave = async () => {
    const keys = Object.keys(stockChanges);
    if (keys.length === 0) return alert("No stock changes to save.");

    setIsBulkSaving(true);
    try {
      const payload = keys.map(k => ({ variantId: k, available: stockChanges[k] }));
      const res = await bulkUpdateInventoryStock(payload);
      if (res.success) {
        setVariants(prev => prev.map(item => {
          if (stockChanges[item.id] !== undefined) {
            return {
              ...item,
              inventory: {
                id: item.inventory?.id || "temp",
                available: stockChanges[item.id],
                reserved: item.inventory?.reserved || 0,
                committed: item.inventory?.committed || 0,
                incoming: item.inventory?.incoming || 0,
              }
            };
          }
          return item;
        }));
        setStockChanges({});
      } else {
        alert(res.error || "Failed to bulk update stock");
      }
    } finally {
      setIsBulkSaving(false);
    }
  };

  const filtered = variants.filter((v) => {
    const qty = getCurrentStock(v);

    if (filterStock === "OUT_OF_STOCK" && qty > 0) return false;
    if (filterStock === "LOW_STOCK" && (qty <= 0 || qty > 5)) return false;
    if (filterStock === "IN_STOCK" && qty === 0) return false;

    if (search.trim()) {
      const query = search.toLowerCase();
      const pName = (v.product?.name || "").toLowerCase();
      const vName = (v.name || "").toLowerCase();
      const sku = (v.sku || "").toLowerCase();
      return pName.includes(query) || vName.includes(query) || sku.includes(query);
    }

    return true;
  });

  const totalVariants = variants.length;
  const outOfStockCount = variants.filter(v => getCurrentStock(v) === 0).length;
  const lowStockCount = variants.filter(v => {
    const s = getCurrentStock(v);
    return s > 0 && s <= 5;
  }).length;
  const inStockCount = variants.filter(v => getCurrentStock(v) > 5).length;
  const hasPendingChanges = Object.keys(stockChanges).length > 0;

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">INVENTORY</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Track and update stock levels for all product variants</p>
        </div>

        {hasPendingChanges && (
          <button
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2 shadow-sm self-start transition-colors"
          >
            {isBulkSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            SAVE ALL CHANGES ({Object.keys(stockChanges).length})
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-gray-500 uppercase">Tracked Variants</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalVariants}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-green-700 uppercase">In Stock (&gt; 5)</p>
          <p className="text-xl font-bold text-green-700 mt-1">{inStockCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-amber-700 uppercase">Low Stock (1-5)</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{lowStockCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-red-700 uppercase">Out of Stock (0)</p>
          <p className="text-xl font-bold text-red-700 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Search & Tabs */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterStock("ALL")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStock === "ALL" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Variants ({totalVariants})
            </button>
            <button
              onClick={() => setFilterStock("IN_STOCK")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStock === "IN_STOCK" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setFilterStock("LOW_STOCK")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStock === "LOW_STOCK" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterStock("OUT_OF_STOCK")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStock === "OUT_OF_STOCK" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or SKU..."
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
                <th className="px-5 py-3 font-semibold">Product Variant</th>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Stock Status</th>
                <th className="px-5 py-3 font-semibold text-center">Available Stock</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-800">No inventory items found</p>
                    <p className="text-[11px] mt-1 text-gray-400">
                      Add products and variants to track their inventory.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const qty = getCurrentStock(v);
                  const isModified = stockChanges[v.id] !== undefined;
                  const isOutOfStock = qty === 0;
                  const isLowStock = qty > 0 && qty <= 5;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-900 block">{v.product?.name || "Product"}</span>
                        <span className="text-[11px] text-gray-500">Variant: {v.name}</span>
                      </td>

                      <td className="px-5 py-3.5 text-gray-500">
                        {v.sku || "-"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                          isOutOfStock 
                            ? "bg-red-100 text-red-800" 
                            : isLowStock 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 border border-gray-300 rounded p-1 bg-white">
                          <button
                            type="button"
                            onClick={() => handleStockChange(v.id, qty - 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => handleStockChange(v.id, Number(e.target.value) || 0)}
                            className="w-16 text-center font-bold text-gray-900 focus:outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(v.id, qty + 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {isModified ? (
                          <button
                            onClick={() => handleSaveSingle(v)}
                            disabled={savingId === v.id}
                            className="px-3 py-1 bg-black text-white rounded text-[11px] font-medium hover:bg-gray-800 inline-flex items-center gap-1"
                          >
                            {savingId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Synced</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 text-gray-500 text-[11px] flex justify-between items-center">
          <span>Showing {filtered.length} of {variants.length} variants</span>
          {hasPendingChanges && (
            <span className="font-semibold text-amber-700">
              {Object.keys(stockChanges).length} unsaved stock changes
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
