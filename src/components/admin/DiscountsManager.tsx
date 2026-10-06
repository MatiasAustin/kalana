"use client";

import { useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  Percent,
  Truck,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Discount, upsertDiscount, deleteDiscount } from "@/lib/actions/marketing";
import { useRouter } from "next/navigation";

interface DiscountsManagerProps {
  initialDiscounts: Discount[];
}

const PRESETS = [
  {
    label: "10% Welcome Promo",
    code: "WELCOME10",
    description: "10% off for first-time coffee orders",
    type: "PERCENTAGE" as const,
    value: 10,
    minOrderValue: 150000,
    maxDiscount: 40000,
    maxUses: 200,
  },
  {
    label: "Free Shipping Java",
    code: "FREESHIP",
    description: "Complimentary delivery on orders above IDR 300,000",
    type: "FREE_SHIPPING" as const,
    value: 25000,
    minOrderValue: 300000,
    maxUses: 500,
  },
  {
    label: "Flat IDR 25K Voucher",
    code: "SAVE25K",
    description: "Flat IDR 25,000 off on whole bean purchases",
    type: "FIXED_AMOUNT" as const,
    value: 25000,
    minOrderValue: 200000,
    maxUses: 100,
  },
  {
    label: "Harvest Flash 20%",
    code: "HARVEST20",
    description: "Limited harvest season discount",
    type: "PERCENTAGE" as const,
    value: 20,
    minOrderValue: 250000,
    maxDiscount: 75000,
    maxUses: 50,
  },
];

export function DiscountsManager({ initialDiscounts }: DiscountsManagerProps) {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Discount>>({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: 10,
    minOrderValue: 150000,
    maxDiscount: 50000,
    maxUses: 100,
    usedCount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "ACTIVE",
  });

  const filteredDiscounts = discounts.filter((d) => {
    const matchesSearch =
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsed = discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0);
  const activeCount = discounts.filter((d) => d.status === "ACTIVE").length;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      id: `disc-${Date.now()}`,
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 150000,
      maxDiscount: 50000,
      maxUses: 100,
      usedCount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "ACTIVE",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (disc: Discount) => {
    setEditingId(disc.id);
    setFormData({ ...disc });
    setError(null);
    setIsModalOpen(true);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      code: preset.code,
      description: preset.description,
      type: preset.type,
      value: preset.value,
      minOrderValue: preset.minOrderValue,
      maxDiscount: preset.maxDiscount || 0,
      maxUses: preset.maxUses,
    }));
  };

  const handleToggleStatus = async (disc: Discount) => {
    const newStatus: "ACTIVE" | "DISABLED" = disc.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const updated = { ...disc, status: newStatus };

    setDiscounts((prev) => prev.map((d) => (d.id === disc.id ? updated : d)));

    try {
      const res = await upsertDiscount(updated);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Coupon code "${disc.code}" is now ${newStatus}.`,
        });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update discount." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update discount." });
    }
  };

  const handleDelete = async (disc: Discount) => {
    if (!confirm(`Are you sure you want to delete coupon code "${disc.code}"?`)) return;

    try {
      const res = await deleteDiscount(disc.id);
      if (res.success) {
        setDiscounts((prev) => prev.filter((d) => d.id !== disc.id));
        setStatusMessage({ type: "success", text: `Deleted "${disc.code}".` });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to delete discount." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete discount." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      setError("Coupon code is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Discount = {
      id: formData.id || `disc-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      description: formData.description || "",
      type: formData.type || "PERCENTAGE",
      value: Number(formData.value || 0),
      minOrderValue: Number(formData.minOrderValue || 0),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      usedCount: Number(formData.usedCount || 0),
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      endDate: formData.endDate || "",
      status: formData.status || "ACTIVE",
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      const res = await upsertDiscount(payload);
      if (res.success) {
        setDiscounts((prev) => {
          const exists = prev.some((d) => d.id === payload.id);
          if (exists) {
            return prev.map((d) => (d.id === payload.id ? payload : d));
          }
          return [payload, ...prev];
        });
        setIsModalOpen(false);
        setStatusMessage({
          type: "success",
          text: `Coupon "${payload.code}" saved and published successfully!`,
        });
        router.refresh();
      } else {
        setError(res.error || "Failed to save discount.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save discount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-neutral-900 text-white rounded">
              <Tag className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-mono">
              DISCOUNTS & COUPON CODES
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Create promotional voucher codes, free delivery waivers, and minimum spend rules
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Discount Code
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {statusMessage.text}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Codes</span>
          <span className="text-2xl font-bold text-gray-900">{discounts.length}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-emerald-600 block">Active Promotions</span>
          <span className="text-2xl font-bold text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-500 block">Total Redemptions</span>
          <span className="text-2xl font-bold text-gray-900">{totalUsed}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "DISABLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                statusFilter === status
                  ? "bg-black text-white font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-100">
        {filteredDiscounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            No discount codes found. Click "Create Discount Code" to launch your first promotional voucher.
          </div>
        ) : (
          filteredDiscounts.map((disc) => {
            const usagePercent = disc.maxUses ? Math.min(100, Math.round((disc.usedCount / disc.maxUses) * 100)) : null;

            return (
              <div
                key={disc.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2.5 py-1 rounded tracking-wider flex items-center gap-1.5">
                      {disc.code}
                      <button
                        type="button"
                        onClick={() => handleCopy(disc.code)}
                        className="text-gray-400 hover:text-white"
                        title="Copy code"
                      >
                        {copiedCode === disc.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold uppercase">
                      {disc.type === "PERCENTAGE"
                        ? `${disc.value}% OFF`
                        : disc.type === "FREE_SHIPPING"
                        ? "FREE SHIPPING"
                        : `IDR ${disc.value.toLocaleString("id-ID")} OFF`}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(disc)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        disc.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Click to toggle"
                    >
                      {disc.status}
                    </button>
                  </div>

                  <p className="text-xs text-gray-700 font-medium">{disc.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-400">
                    {disc.minOrderValue > 0 && (
                      <span>Min Order: IDR {disc.minOrderValue.toLocaleString("id-ID")}</span>
                    )}
                    {disc.maxDiscount && disc.type === "PERCENTAGE" && (
                      <span>Max Cap: IDR {disc.maxDiscount.toLocaleString("id-ID")}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Valid: {disc.startDate} → {disc.endDate || "Ongoing"}
                    </span>
                    <span>
                      Redeemed: <strong className="text-gray-800">{disc.usedCount}</strong>
                      {disc.maxUses ? ` / ${disc.maxUses}` : " uses"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(disc)}
                    className="p-2 text-gray-600 hover:text-black rounded hover:bg-gray-100 transition-colors"
                    title="Edit Code"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(disc)}
                    className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                    title="Delete Code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm font-mono">
                {editingId ? "EDIT DISCOUNT CODE" : "CREATE NEW DISCOUNT CODE"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            {/* Presets Bar */}
            {!editingId && (
              <div className="space-y-1.5 pb-2">
                <span className="text-[10px] font-mono uppercase text-gray-400 block font-semibold">
                  Quick Coupon Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs font-mono text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KALANA2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded uppercase font-bold tracking-wider outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (IDR)</option>
                    <option value="FREE_SHIPPING">Free Shipping Waiver</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Description / Internal Note</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off for first order"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    {formData.type === "PERCENTAGE" ? "Percentage (%) *" : "Discount Value (IDR) *"}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Min Order Value (IDR)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Max Cap (IDR, Optional)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ""}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Max Uses Limit</label>
                  <input
                    type="number"
                    value={formData.maxUses || ""}
                    onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Available for checkout)</option>
                  <option value="DISABLED">DISABLED (Hidden / Inactive)</option>
                </select>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? "Update Code" : "Publish Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
