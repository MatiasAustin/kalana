"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  User, 
  Package, 
  CreditCard, 
  Loader2, 
  Check, 
  Search 
} from "lucide-react";
import { createDraftOrder } from "@/lib/actions/orders";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string | null;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
}

interface LineItem {
  id: string;
  productId?: string;
  variantId?: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot?: string;
  quantity: number;
  unitPrice: number;
}

interface DraftOrderBuilderProps {
  products: Product[];
  customers: Customer[];
}

export function DraftOrderBuilder({ products, customers }: DraftOrderBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);
  
  // Product Selector Modal
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Customer Selection
  const [customerMode, setCustomerMode] = useState<"EXISTING" | "NEW">("EXISTING");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    city: "Jakarta",
    province: "DKI Jakarta",
    zip: "10110",
    country: "Indonesia",
  });

  // Financials & Notes
  const [shippingCost, setShippingCost] = useState(25000);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const total = Math.max(0, subtotal + Number(shippingCost || 0) - Number(discount || 0));

  // Add product variant
  const handleAddVariant = (product: Product, variant: ProductVariant) => {
    const newItem: LineItem = {
      id: `${product.id}-${variant.id}-${Date.now()}`,
      productId: product.id,
      variantId: variant.id,
      productNameSnapshot: product.name,
      variantNameSnapshot: variant.name,
      skuSnapshot: variant.sku || "",
      quantity: 1,
      unitPrice: variant.price || 0,
    };
    setItems((prev) => [...prev, newItem]);
    setShowProductPicker(false);
  };

  // Add custom line item
  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      productNameSnapshot: "Custom Item",
      variantNameSnapshot: "Standard",
      quantity: 1,
      unitPrice: 50000,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: "quantity" | "unitPrice" | "productNameSnapshot", val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "productNameSnapshot" ? val : Number(val) || 0,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (saveAs: "DRAFT" | "PAID") => {
    if (items.length === 0) {
      alert("Please add at least 1 item to the order.");
      return;
    }

    if (customerMode === "NEW" && !newCustomer.email) {
      alert("Customer email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        items,
        shippingCost: Number(shippingCost) || 0,
        discount: Number(discount) || 0,
        notes,
        status: saveAs === "PAID" ? "PROCESSING" : "DRAFT",
        paymentStatus: saveAs === "PAID" ? "PAID" : "UNPAID",
      };

      if (customerMode === "EXISTING" && selectedCustomerId) {
        payload.customerId = selectedCustomerId;
      } else if (customerMode === "NEW") {
        payload.customerData = newCustomer;
      }

      const res = await createDraftOrder(payload);
      if (res.success) {
        if (saveAs === "PAID") {
          router.push(`/admin/orders/${res.orderId}`);
        } else {
          router.push(`/admin/orders/draft`);
        }
      } else {
        alert(res.error || "Failed to create order");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    `${c.firstName || ""} ${c.lastName || ""} ${c.email}`.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders/draft"
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">CREATE DRAFT ORDER</h1>
            <p className="text-gray-500 text-[11px] mt-0.5">Create manual or wholesale customer orders</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit("PAID")}
            disabled={isSubmitting}
            className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create & Mark as Paid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Products & Financials */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Products Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Line Items ({items.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  + Add Custom Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="px-3 py-1 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Product
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p>No products added yet.</p>
                <p className="text-[11px] text-gray-400 mt-1">Select products from your catalog or add custom items.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.productNameSnapshot}
                        onChange={(e) => handleUpdateItem(item.id, "productNameSnapshot", e.target.value)}
                        className="w-full font-bold text-gray-900 p-1 border border-transparent hover:border-gray-300 rounded focus:border-black focus:outline-none"
                      />
                      <p className="text-gray-400 text-[10px] px-1">Variant: {item.variantNameSnapshot}</p>
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-gray-400">PRICE</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, "unitPrice", e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="w-16">
                      <label className="block text-[10px] text-gray-400">QTY</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="w-28 text-right font-bold text-gray-900 pt-3">
                      IDR {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded pt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Adjustments */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-3">
              Payment & Adjustments
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Shipping Fee (IDR)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Discount (IDR)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="pt-3 border-t space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>IDR {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>IDR {shippingCost.toLocaleString("id-ID")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>- IDR {discount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t">
                <span>Total Amount:</span>
                <span>IDR {total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Customer & Notes */}
        <div className="space-y-6">
          
          {/* Customer Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2 border-b pb-3">
              <User className="w-4 h-4 text-gray-500" />
              Customer
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode("EXISTING")}
                className={`flex-1 py-1.5 rounded font-medium ${
                  customerMode === "EXISTING" ? "bg-black text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("NEW")}
                className={`flex-1 py-1.5 rounded font-medium ${
                  customerMode === "NEW" ? "bg-black text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                New Customer
              </button>
            </div>

            {customerMode === "EXISTING" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Filter customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />

                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="">Select a Customer</option>
                  {filteredCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={newCustomer.address1}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address1: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newCustomer.zip}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-3">
              Internal Notes
            </h2>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., wholesale order via WhatsApp, payment via direct BCA transfer..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

        </div>

      </div>

      {/* Product Selector Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">SELECT PRODUCT</h3>
              <button 
                onClick={() => setShowProductPicker(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ×
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <p className="py-6 text-center text-gray-400">No products found matching query.</p>
              ) : (
                filteredProducts.map((prod) => (
                  <div key={prod.id} className="py-3">
                    <p className="font-bold text-gray-900 mb-1.5">{prod.name}</p>
                    <div className="space-y-1 pl-2">
                      {prod.variants && prod.variants.length > 0 ? (
                        prod.variants.map((v) => (
                          <div 
                            key={v.id} 
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-gray-100"
                          >
                            <div>
                              <span className="font-medium text-gray-800">{v.name}</span>
                              {v.sku && <span className="text-gray-400 text-[10px] ml-2">SKU: {v.sku}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">
                                IDR {(v.price || 0).toLocaleString("id-ID")}
                              </span>
                              <button
                                onClick={() => handleAddVariant(prod, v)}
                                className="px-2.5 py-1 bg-black text-white rounded text-[11px] hover:bg-gray-800"
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-[11px]">No variants available.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowProductPicker(false)}
                className="px-4 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
