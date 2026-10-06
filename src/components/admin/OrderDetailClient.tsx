"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  Calendar, 
  Package, 
  Loader2,
  Trash2,
  ExternalLink,
  MessageSquare,
  FileText
} from "lucide-react";
import { 
  updateOrderStatus, 
  updatePaymentStatus, 
  updateFulfillmentStatus, 
  updateOrderNotes,
  deleteOrder 
} from "@/lib/actions/orders";

interface OrderDetailProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notes, setNotes] = useState(order.notes || "");
  const [notesSaved, setNotesSaved] = useState(false);

  // Fulfillment Modal State
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [courier, setCourier] = useState("JNE");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleUpdateStatus = async (newStatus: string) => {
    setLoadingAction("status");
    try {
      const res = await updateOrderStatus(order.id, newStatus);
      if (res.success) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdatePayment = async (newPaymentStatus: string) => {
    setLoadingAction("payment");
    try {
      const res = await updatePaymentStatus(order.id, newPaymentStatus);
      if (res.success) {
        setOrder((prev: any) => ({ 
          ...prev, 
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === "PAID" && prev.status === "PENDING" ? "PROCESSING" : prev.status
        }));
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFulfill = async () => {
    setLoadingAction("fulfillment");
    try {
      const res = await updateFulfillmentStatus(order.id, "FULFILLED", courier, trackingNumber);
      if (res.success) {
        setOrder((prev: any) => ({
          ...prev,
          fulfillmentStatus: "FULFILLED",
          notes: trackingNumber ? `${prev.notes || ""}\n[SHIPMENT] Courier: ${courier} | Tracking: ${trackingNumber}`.trim() : prev.notes
        }));
        setShowFulfillModal(false);
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnfulfill = async () => {
    setLoadingAction("unfulfill");
    try {
      const res = await updateFulfillmentStatus(order.id, "UNFULFILLED");
      if (res.success) {
        setOrder((prev: any) => ({ ...prev, fulfillmentStatus: "UNFULFILLED" }));
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveNotes = async () => {
    setLoadingAction("notes");
    try {
      const res = await updateOrderNotes(order.id, notes);
      if (res.success) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 3000);
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete order ${order.orderNumber}? This action cannot be undone.`)) {
      return;
    }
    setLoadingAction("delete");
    try {
      const res = await deleteOrder(order.id);
      if (res.success) {
        router.push("/admin/orders");
      } else {
        alert(res.error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const customerName = order.customer 
    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() || "Customer"
    : "Guest Customer";

  const shippingAddr = order.shippingAddress;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Non-print Top Controls */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/orders"
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">
                {order.orderNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                order.paymentStatus === "PAID" 
                  ? "bg-green-100 text-green-800" 
                  : order.paymentStatus === "REFUNDED"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {order.paymentStatus || "UNPAID"}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                order.fulfillmentStatus === "FULFILLED" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-700"
              }`}>
                {order.fulfillmentStatus || "UNFULFILLED"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short"
              }) : "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-md text-xs font-mono font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            PRINT INVOICE
          </button>

          <select
            value={order.status || "PENDING"}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            disabled={loadingAction === "status"}
            className="border border-gray-300 rounded-md text-xs font-mono py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black font-medium"
          >
            <option value="PENDING">Status: PENDING</option>
            <option value="PROCESSING">Status: PROCESSING</option>
            <option value="COMPLETED">Status: COMPLETED</option>
            <option value="CANCELLED">Status: CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Items & Financials) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Items ({order.items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.productNameSnapshot}</p>
                      <div className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-2">
                        <span>Variant: {item.variantNameSnapshot || "Default"}</span>
                        {item.skuSnapshot && <span>• SKU: {item.skuSnapshot}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        IDR {(item.unitPrice || 0).toLocaleString("id-ID")} × {item.quantity}
                      </p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">
                        IDR {(item.subtotal || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 font-mono text-xs">
                  No line items in this order.
                </div>
              )}
            </div>

            {/* Financials Summary */}
            <div className="p-4 bg-gray-50/70 border-t border-gray-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>IDR {(order.subtotal || 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>IDR {(order.shippingCost || 0).toLocaleString("id-ID")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>- IDR {(order.discount || 0).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold text-sm pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>IDR {(order.total || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                Fulfillment Status
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                order.fulfillmentStatus === "FULFILLED" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
              }`}>
                {order.fulfillmentStatus || "UNFULFILLED"}
              </span>
            </div>

            {order.fulfillmentStatus === "FULFILLED" ? (
              <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Order has been fulfilled and dispatched.
                </div>
                <div className="print:hidden flex justify-end">
                  <button
                    onClick={handleUnfulfill}
                    disabled={loadingAction === "unfulfill"}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Mark as Unfulfilled
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500">
                  All items are ready to pack and dispatch to the customer.
                </p>
                <div className="print:hidden">
                  <button
                    onClick={() => setShowFulfillModal(true)}
                    className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    FULFILL ORDER
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                Payment Information
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                order.paymentStatus === "PAID" 
                  ? "bg-green-100 text-green-800" 
                  : order.paymentStatus === "REFUNDED"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {order.paymentStatus || "UNPAID"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-gray-600 border-t border-gray-100 pt-3">
              <div>
                <span className="text-gray-400 text-[10px] block">PAYMENT GATEWAY</span>
                <span className="font-semibold text-gray-900 uppercase">{order.paymentProvider || "MANUAL"}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">PAYMENT TOKEN / REF</span>
                <span className="font-mono text-gray-900">{order.paymentToken || "-"}</span>
              </div>
            </div>

            {order.paymentUrl && (
              <div className="pt-2">
                <a 
                  href={order.paymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Payment Gateway Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="print:hidden flex items-center gap-2 pt-2 border-t border-gray-100">
              {order.paymentStatus !== "PAID" ? (
                <button
                  onClick={() => handleUpdatePayment("PAID")}
                  disabled={loadingAction === "payment"}
                  className="px-3 py-1.5 bg-green-700 text-white rounded hover:bg-green-800 transition-colors flex items-center gap-1.5"
                >
                  {loadingAction === "payment" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  MARK AS PAID
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleUpdatePayment("UNPAID")}
                    disabled={loadingAction === "payment"}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Mark as Unpaid
                  </button>
                  <button
                    onClick={() => handleUpdatePayment("REFUNDED")}
                    disabled={loadingAction === "payment"}
                    className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded hover:bg-purple-50 transition-colors"
                  >
                    Refund Order
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Customer, Shipping Address & Notes) */}
        <div className="space-y-6 font-mono text-xs">
          
          {/* Customer Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              Customer
            </h2>

            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-sm">{customerName}</p>
              {order.customer?.email && (
                <p className="text-gray-500 font-sans">{order.customer.email}</p>
              )}
              {order.customer?.phone && (
                <p className="text-gray-500">{order.customer.phone}</p>
              )}
            </div>

            {order.customer?.id && (
              <div className="pt-2 border-t border-gray-100 print:hidden">
                <Link 
                  href={`/admin/customers`}
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  View Customer History <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Shipping Address
            </h2>

            {shippingAddr ? (
              <div className="space-y-1 text-gray-700">
                <p className="font-semibold text-gray-900">
                  {shippingAddr.firstName} {shippingAddr.lastName}
                </p>
                <p>{shippingAddr.address1}</p>
                {shippingAddr.address2 && <p>{shippingAddr.address2}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.province} {shippingAddr.zip}
                </p>
                <p>{shippingAddr.country}</p>
                {shippingAddr.phone && <p className="pt-1 text-gray-500">Phone: {shippingAddr.phone}</p>}
              </div>
            ) : (
              <p className="text-gray-400">No shipping address provided (pickup/digital).</p>
            )}
          </div>

          {/* Notes Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4 print:hidden">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              Internal Notes
            </h2>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              className="w-full p-2.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
            />

            <div className="flex items-center justify-between">
              {notesSaved ? (
                <span className="text-green-600 font-semibold text-[11px]">Saved!</span>
              ) : <span />}

              <button
                onClick={handleSaveNotes}
                disabled={loadingAction === "notes"}
                className="px-3 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                {loadingAction === "notes" ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 border border-red-200 rounded-lg p-5 space-y-3 print:hidden">
            <h3 className="font-bold text-red-900 text-xs uppercase tracking-wider">Danger Zone</h3>
            <p className="text-red-700 text-[11px]">
              Permanently remove this order and all associated line items.
            </p>
            <button
              onClick={handleDelete}
              disabled={loadingAction === "delete"}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-1.5 text-xs"
            >
              {loadingAction === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Order
            </button>
          </div>

        </div>

      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-5 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">FULFILL ORDER {order.orderNumber}</h3>
              <button 
                onClick={() => setShowFulfillModal(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Courier / Ekspedisi</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="JNE">JNE Express</option>
                  <option value="J&T">J&T Express</option>
                  <option value="SiCepat">SiCepat Ekspres</option>
                  <option value="GoSend">GoSend Instant/Sameday</option>
                  <option value="GrabExpress">GrabExpress</option>
                  <option value="Anteraja">Anteraja</option>
                  <option value="POS Indonesia">POS Indonesia</option>
                  <option value="Paxel">Paxel</option>
                  <option value="Other">Other Courier / Self-Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Nomor Resi / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Contoh: JNE0192837465"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowFulfillModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfill}
                disabled={loadingAction === "fulfillment"}
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2"
              >
                {loadingAction === "fulfillment" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Fulfillment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Sheet (Only visible during print) */}
      <div className="hidden print:block font-mono text-black p-8 bg-white max-w-3xl mx-auto">
        <div className="flex justify-between items-start border-b-2 border-black pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-widest uppercase">KALANA</h1>
            <p className="text-xs text-gray-600 mt-1">Specialty Coffee & Roastery</p>
            <p className="text-xs text-gray-600">hello@kalana.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">INVOICE</h2>
            <p className="text-sm font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-gray-600">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-"}
            </p>
            <p className="text-xs mt-1 font-bold">STATUS: {order.paymentStatus}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 my-6 text-xs">
          <div>
            <p className="font-bold uppercase text-gray-500 mb-1">BILLED TO:</p>
            <p className="font-bold text-sm">{customerName}</p>
            <p>{order.customer?.email}</p>
            <p>{order.customer?.phone}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-gray-500 mb-1">SHIPPED TO:</p>
            {shippingAddr ? (
              <div>
                <p className="font-bold">{shippingAddr.firstName} {shippingAddr.lastName}</p>
                <p>{shippingAddr.address1}</p>
                <p>{shippingAddr.city}, {shippingAddr.province} {shippingAddr.zip}</p>
                <p>{shippingAddr.country}</p>
              </div>
            ) : (
              <p>Direct Pickup</p>
            )}
          </div>
        </div>

        <table className="w-full text-xs text-left border-t border-b border-black my-6">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 font-bold uppercase">Item</th>
              <th className="py-2 text-center font-bold uppercase">Qty</th>
              <th className="py-2 text-right font-bold uppercase">Price</th>
              <th className="py-2 text-right font-bold uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-2">
                  <span className="font-bold">{item.productNameSnapshot}</span>
                  <span className="text-gray-500 block text-[10px]">Variant: {item.variantNameSnapshot}</span>
                </td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">IDR {(item.unitPrice || 0).toLocaleString("id-ID")}</td>
                <td className="py-2 text-right font-bold">IDR {(item.subtotal || 0).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end text-xs">
          <div className="w-64 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>IDR {(order.subtotal || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>IDR {(order.shippingCost || 0).toLocaleString("id-ID")}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- IDR {(order.discount || 0).toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-black">
              <span>TOTAL:</span>
              <span>IDR {(order.total || 0).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-[10px] text-gray-500">
          <p>Thank you for shopping with KALANA. Crafted with passion.</p>
        </div>
      </div>

    </div>
  );
}
