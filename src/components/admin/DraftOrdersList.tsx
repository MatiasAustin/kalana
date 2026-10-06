"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FileEdit, Trash2, ChevronRight, Package } from "lucide-react";
import { deleteOrder } from "@/lib/actions/orders";

interface DraftOrder {
  id: string;
  orderNumber: string;
  subtotal: number;
  total: number;
  createdAt: Date | string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  items?: any[];
}

export function DraftOrdersList({ initialOrders }: { initialOrders: DraftOrder[] }) {
  const [orders, setOrders] = useState<DraftOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const query = search.toLowerCase();
    const orderNum = (o.orderNumber || "").toLowerCase();
    const cust = `${o.customer?.firstName || ""} ${o.customer?.lastName || ""} ${o.customer?.email || ""}`.toLowerCase();
    return orderNum.includes(query) || cust.includes(query);
  });

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Delete draft order ${num}?`)) return;
    setDeletingId(id);
    try {
      const res = await deleteOrder(id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert(res.error || "Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">DRAFT ORDERS</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Manage custom, phone, and wholesale orders before confirmation</p>
        </div>

        <Link
          href="/admin/orders/draft/new"
          className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          CREATE DRAFT ORDER
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search draft orders..."
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
                <th className="px-5 py-3 font-semibold">Draft Order</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-800">No draft orders found</p>
                    <p className="text-[11px] mt-1 text-gray-400">
                      Create manual orders when taking requests via phone, chat, or wholesale.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((draft) => (
                  <tr key={draft.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      <Link href={`/admin/orders/${draft.id}`} className="hover:underline flex items-center gap-1.5">
                        <FileEdit className="w-3.5 h-3.5 text-gray-400" />
                        {draft.orderNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-3.5 text-gray-500">
                      {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "-"}
                    </td>

                    <td className="px-5 py-3.5 text-gray-900">
                      {draft.customer ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {`${draft.customer.firstName || ""} ${draft.customer.lastName || ""}`.trim() || "Customer"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-sans">{draft.customer.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Guest</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-gray-600">
                      {draft.items?.length || 0} items
                    </td>

                    <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                      IDR {(draft.total || 0).toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${draft.id}`}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded text-[11px] transition-colors"
                        >
                          View / Confirm
                        </Link>
                        <button
                          onClick={() => handleDelete(draft.id, draft.orderNumber)}
                          disabled={deletingId === draft.id}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
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
          Showing {filtered.length} of {orders.length} draft orders
        </div>

      </div>

    </div>
  );
}
