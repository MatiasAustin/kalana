"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Package, 
  CreditCard,
  FileSpreadsheet
} from "lucide-react";

interface OrderItem {
  id: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  subtotal: number;
  shippingCost: number | null;
  discount: number | null;
  total: number;
  createdAt: Date | string | null;
  notes: string | null;
  customer?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  } | null;
  items?: OrderItem[];
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "UNFULFILLED" | "UNPAID" | "COMPLETED" | "CANCELLED">("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Filter orders based on tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "UNFULFILLED" && order.fulfillmentStatus === "FULFILLED") return false;
      if (activeTab === "UNPAID" && order.paymentStatus === "PAID") return false;
      if (activeTab === "COMPLETED" && order.status !== "COMPLETED") return false;
      if (activeTab === "CANCELLED" && order.status !== "CANCELLED") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const orderNum = (order.orderNumber || "").toLowerCase();
        const customerName = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.toLowerCase();
        const email = (order.customer?.email || "").toLowerCase();
        return orderNum.includes(query) || customerName.includes(query) || email.includes(query);
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert("No orders to export.");

    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Payment Status",
      "Fulfillment Status",
      "Order Status",
      "Subtotal",
      "Shipping",
      "Discount",
      "Total (IDR)",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt ? new Date(o.createdAt).toLocaleString("id-ID") : "-"}"`,
      `"${o.customer ? `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() : "Guest"}"`,
      `"${o.customer?.email || "-"}"`,
      `"${o.paymentStatus || "UNPAID"}"`,
      `"${o.fulfillmentStatus || "UNFULFILLED"}"`,
      `"${o.status || "PENDING"}"`,
      o.subtotal,
      o.shippingCost || 0,
      o.discount || 0,
      o.total,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kalana-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">ORDERS</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Manage and fulfill your customer orders</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 border border-gray-300 rounded-md text-xs font-mono font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>

          <Link
            href="/admin/orders/draft/new"
            className="px-4 py-2 bg-black text-white rounded-md text-xs font-mono font-medium hover:bg-gray-800 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            CREATE ORDER
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "ALL" 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("UNFULFILLED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "UNFULFILLED" 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Unfulfilled ({orders.filter(o => o.fulfillmentStatus !== "FULFILLED").length})
            </button>
            <button
              onClick={() => setActiveTab("UNPAID")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "UNPAID" 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Unpaid ({orders.filter(o => o.paymentStatus !== "PAID").length})
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "COMPLETED" 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Completed ({orders.filter(o => o.status === "COMPLETED").length})
            </button>
            <button
              onClick={() => setActiveTab("CANCELLED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "CANCELLED" 
                  ? "bg-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Cancelled ({orders.filter(o => o.status === "CANCELLED").length})
            </button>
          </div>

          {/* Search Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number, customer name, email..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono uppercase">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black" 
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Fulfillment</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-900">No orders found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter tab.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const isPaid = order.paymentStatus === "PAID";
                  const isFulfilled = order.fulfillmentStatus === "FULFILLED";

                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50/80 transition-colors group ${
                        isSelected ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-gray-300 text-black focus:ring-black" 
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-gray-900 hover:underline flex items-center gap-1.5"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "-"}
                      </td>

                      <td className="px-4 py-3.5 text-gray-900">
                        {order.customer ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {`${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() || "Customer"}
                            </div>
                            <div className="text-[11px] text-gray-400 font-sans">{order.customer.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Guest Customer</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                          isPaid 
                            ? "bg-green-100 text-green-800" 
                            : order.paymentStatus === "REFUNDED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.paymentStatus || "UNPAID"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                          isFulfilled 
                            ? "bg-blue-100 text-blue-800" 
                            : order.fulfillmentStatus === "PARTIALLY_FULFILLED"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {order.fulfillmentStatus || "UNFULFILLED"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-gray-900 whitespace-nowrap">
                        IDR {order.total.toLocaleString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          {selectedOrders.length > 0 && (
            <span className="text-black font-semibold">{selectedOrders.length} orders selected</span>
          )}
        </div>

      </div>
    </div>
  );
}
