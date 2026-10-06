"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ShoppingCart, 
  MessageCircle, 
  Copy, 
  Check, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { updatePaymentStatus, deleteOrder } from "@/lib/actions/orders";

interface AbandonedCheckout {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  paymentUrl: string | null;
  createdAt: Date | string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  } | null;
  items?: any[];
}

export function AbandonedCheckoutsClient({ 
  initialCheckouts 
}: { 
  initialCheckouts: AbandonedCheckout[] 
}) {
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>(initialCheckouts);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = checkouts.filter((c) => {
    const query = search.toLowerCase();
    const num = (c.orderNumber || "").toLowerCase();
    const cust = `${c.customer?.firstName || ""} ${c.customer?.lastName || ""} ${c.customer?.email || ""}`.toLowerCase();
    return num.includes(query) || cust.includes(query);
  });

  const totalLostRevenue = checkouts.reduce((sum, c) => sum + (c.total || 0), 0);

  const handleCopyLink = (order: AbandonedCheckout) => {
    const url = order.paymentUrl || `${window.location.origin}/checkout?order=${order.orderNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (order: AbandonedCheckout) => {
    const phone = order.customer?.phone?.replace(/[^0-9]/g, "") || "";
    const cleanPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const customerName = order.customer?.firstName || "Kak";
    const checkoutLink = order.paymentUrl || `${window.location.origin}/checkout?order=${order.orderNumber}`;
    
    const message = encodeURIComponent(
      `Halo ${customerName}! Terima kasih sudah memilih KALANA Specialty Coffee. ` +
      `Pesanan Anda (${order.orderNumber}) senilai IDR ${order.total.toLocaleString("id-ID")} saat ini menunggu penyelesaian pembayaran. ` +
      `Anda dapat melanjutkan pesanan Anda melalui tautan berikut:\n${checkoutLink}\n\n` +
      `Jika ada pertanyaan mengenai pesanan Anda, silakan balas pesan ini ya. Salam hangat, KALANA.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleMarkRecovered = async (id: string) => {
    if (!confirm("Tandai pesanan ini sebagai LUNAS / TERPULIHKAN?")) return;
    setActionLoading(id);
    try {
      const res = await updatePaymentStatus(id, "PAID");
      if (res.success) {
        setCheckouts((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(res.error || "Gagal memperbarui status");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data abandoned checkout ini?")) return;
    setActionLoading(id);
    try {
      const res = await deleteOrder(id);
      if (res.success) {
        setCheckouts((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(res.error || "Gagal menghapus");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">ABANDONED CHECKOUTS</h1>
        <p className="text-gray-500 text-[11px] mt-0.5">
          Customers who added items to cart and entered information but didn&apos;t complete payment
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Abandoned Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{checkouts.length}</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Uncompleted checkout sessions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Potential Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                IDR {totalLostRevenue.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded text-red-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Revenue waiting to be recovered</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Recovery Strategy</p>
              <h3 className="text-base font-bold text-green-700 mt-1">WhatsApp & Link</h3>
            </div>
            <div className="p-2 bg-green-50 rounded text-green-600">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Follow-up within 24h increases sales up to 30%</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by checkout #, customer name, email..."
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
                <th className="px-5 py-3 font-semibold">Checkout</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-800">No abandoned checkouts</p>
                    <p className="text-[11px] mt-1 text-gray-400">
                      Great job! All customer checkouts have been completed.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      <Link href={`/admin/orders/${item.id}`} className="hover:underline">
                        {item.orderNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "-"}
                    </td>

                    <td className="px-5 py-3.5 text-gray-900">
                      {item.customer ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {`${item.customer.firstName || ""} ${item.customer.lastName || ""}`.trim() || "Customer"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-sans">{item.customer.email}</div>
                          {item.customer.phone && (
                            <div className="text-[10px] text-gray-500">{item.customer.phone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Guest</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-gray-600">
                      {item.items?.length || 0} items
                    </td>

                    <td className="px-5 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap">
                      IDR {(item.total || 0).toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.customer?.phone && (
                          <button
                            onClick={() => handleSendWhatsApp(item)}
                            title="Kirim Pengingat WhatsApp"
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </button>
                        )}

                        <button
                          onClick={() => handleCopyLink(item)}
                          title="Copy Link Pembayaran"
                          className="px-2.5 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-[11px] flex items-center gap-1 transition-colors"
                        >
                          {copiedId === item.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          {copiedId === item.id ? "Copied" : "Link"}
                        </button>

                        <button
                          onClick={() => handleMarkRecovered(item.id)}
                          disabled={actionLoading === item.id}
                          title="Tandai Sudah Bayar / Terpulihkan"
                          className="px-2.5 py-1 bg-black hover:bg-gray-800 text-white rounded text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Mark Paid
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionLoading === item.id}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Hapus"
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
          Showing {filtered.length} of {checkouts.length} abandoned checkouts
        </div>

      </div>

    </div>
  );
}
