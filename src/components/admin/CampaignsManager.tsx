"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  Calendar,
  DollarSign,
  TrendingUp,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  CheckCircle2,
  BarChart3,
  Share2,
} from "lucide-react";
import { Campaign, upsertCampaign, deleteCampaign } from "@/lib/actions/marketing";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CampaignsManagerProps {
  initialCampaigns: Campaign[];
}

const CHANNEL_OPTIONS = [
  "Instagram",
  "TikTok",
  "Newsletter",
  "WhatsApp",
  "Announcement Bar",
  "Google Ads",
  "In-Store QR",
];

const GOAL_OPTIONS = [
  "Seasonal Sales",
  "Acquisition",
  "Event Promotion",
  "Brand Awareness",
  "Product Launch",
  "Retention",
];

export function CampaignsManager({ initialCampaigns }: CampaignsManagerProps) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: "",
    slug: "",
    goal: "Seasonal Sales",
    status: "ACTIVE",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    budget: 2000000,
    revenue: 0,
    channels: ["Instagram", "Newsletter"],
    targetUrl: "/roastery",
    utmSource: "instagram",
    utmMedium: "bio-link",
    utmCampaign: "",
    notes: "",
  });

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.goal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const overallROI = totalBudget > 0 ? (totalRevenue / totalBudget).toFixed(1) : "0.0";

  const buildTrackingUrl = (target: string, src: string, med: string, camp: string) => {
    const base = "https://kalana.coffee" + (target.startsWith("/") ? target : "/" + target);
    const params = new URLSearchParams();
    if (src) params.set("utm_source", src);
    if (med) params.set("utm_medium", med);
    if (camp) params.set("utm_campaign", camp);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      id: `camp-${Date.now()}`,
      name: "",
      slug: "",
      goal: "Seasonal Sales",
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      budget: 2000000,
      revenue: 0,
      channels: ["Instagram", "Newsletter"],
      targetUrl: "/roastery",
      utmSource: "instagram",
      utmMedium: "bio-link",
      utmCampaign: "",
      notes: "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camp: Campaign) => {
    setEditingId(camp.id);
    setFormData({ ...camp });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (camp: Campaign) => {
    if (!confirm(`Are you sure you want to delete campaign "${camp.name}"?`)) return;

    try {
      const res = await deleteCampaign(camp.id);
      if (res.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
        setStatusMessage({ type: "success", text: `Deleted "${camp.name}".` });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to delete campaign." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete campaign." });
    }
  };

  const toggleChannel = (channel: string) => {
    const current = formData.channels || [];
    if (current.includes(channel)) {
      setFormData({ ...formData, channels: current.filter((c) => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...current, channel] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Campaign name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const slug = (formData.slug || formData.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const utmCampaign = formData.utmCampaign || slug.replace(/-/g, "_");

    const payload: Campaign = {
      id: formData.id || `camp-${Date.now()}`,
      name: formData.name.trim(),
      slug,
      goal: formData.goal || "Seasonal Sales",
      status: formData.status || "ACTIVE",
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      endDate: formData.endDate || "",
      budget: Number(formData.budget || 0),
      revenue: Number(formData.revenue || 0),
      channels: formData.channels || ["Instagram"],
      targetUrl: formData.targetUrl || "/roastery",
      utmSource: formData.utmSource || "instagram",
      utmMedium: formData.utmMedium || "bio-link",
      utmCampaign,
      notes: formData.notes || "",
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      const res = await upsertCampaign(payload);
      if (res.success) {
        setCampaigns((prev) => {
          const exists = prev.some((c) => c.id === payload.id);
          if (exists) {
            return prev.map((c) => (c.id === payload.id ? payload : c));
          }
          return [payload, ...prev];
        });
        setIsModalOpen(false);
        setStatusMessage({
          type: "success",
          text: `Campaign "${payload.name}" saved successfully!`,
        });
        router.refresh();
      } else {
        setError(res.error || "Failed to save campaign.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save campaign.");
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
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-mono">
              MARKETING CAMPAIGNS & UTM TRACKING
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Plan multi-channel promotions, generate UTM attribution links, and track performance
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Campaign
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Campaigns</span>
          <span className="text-2xl font-bold text-gray-900">{campaigns.length}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-500 block">Total Allocated Budget</span>
          <span className="text-lg font-bold text-gray-900">IDR {totalBudget.toLocaleString("id-ID")}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-emerald-600 block">Tracked Revenue</span>
          <span className="text-lg font-bold text-emerald-700">IDR {totalRevenue.toLocaleString("id-ID")}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-amber-600 block">Average Return (ROI)</span>
          <span className="text-2xl font-bold text-amber-700">{overallROI}x</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by name, goal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "SCHEDULED", "ENDED", "DRAFT"].map((status) => (
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

      {/* Campaigns List */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-100">
        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            No marketing campaigns found. Click "Create New Campaign" to launch your first promotional sprint.
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const trackingUrl = buildTrackingUrl(
              camp.targetUrl || "/roastery",
              camp.utmSource || "instagram",
              camp.utmMedium || "bio-link",
              camp.utmCampaign || camp.slug
            );
            const roi = camp.budget > 0 ? (camp.revenue / camp.budget).toFixed(1) : "0.0";

            return (
              <div
                key={camp.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">{camp.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-semibold uppercase">
                      {camp.goal}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                        camp.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : camp.status === "SCHEDULED"
                          ? "bg-blue-100 text-blue-800"
                          : camp.status === "ENDED"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  {camp.notes && <p className="text-xs text-gray-500 line-clamp-1">{camp.notes}</p>}

                  {/* Tracking URL Bar with Copy Button */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded max-w-xl">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono text-[11px] text-gray-600 truncate flex-1">{trackingUrl}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(trackingUrl, camp.id)}
                      className="text-xs text-black font-mono font-semibold flex items-center gap-1 hover:opacity-70 shrink-0 pl-2 border-l border-gray-200"
                    >
                      {copiedLink === camp.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metrics and Channels */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {camp.startDate} → {camp.endDate}
                    </span>
                    <span>Budget: IDR {Number(camp.budget).toLocaleString("id-ID")}</span>
                    <span className="text-emerald-700 font-medium">
                      Revenue: IDR {Number(camp.revenue).toLocaleString("id-ID")}
                    </span>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                      {roi}x ROI
                    </span>
                    <div className="flex items-center gap-1">
                      {camp.channels?.map((ch) => (
                        <span key={ch} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(camp)}
                    className="p-2 text-gray-600 hover:text-black rounded hover:bg-gray-100 transition-colors"
                    title="Edit Campaign"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(camp)}
                    className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                    title="Delete Campaign"
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
                {editingId ? "EDIT MARKETING CAMPAIGN" : "CREATE NEW CAMPAIGN"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs font-mono text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harvest Drop 2026"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug:
                        editingId && prev.slug
                          ? prev.slug
                          : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      utmCampaign:
                        editingId && prev.utmCampaign
                          ? prev.utmCampaign
                          : name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-bold outline-none focus:ring-1 focus:ring-black text-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Objective / Goal</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black bg-white"
                  >
                    {GOAL_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="ENDED">ENDED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Channels Selector */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1.5">
                  Marketing Channels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CHANNEL_OPTIONS.map((ch) => {
                    const isSelected = formData.channels?.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Landing Page and UTM attribution builder */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  UTM Attribution Link Builder:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-600 mb-1">Landing Destination</label>
                    <input
                      type="text"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      placeholder="/roastery"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-gray-600 mb-1">UTM Source</label>
                    <input
                      type="text"
                      value={formData.utmSource}
                      onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                      placeholder="instagram"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-600 mb-1">UTM Medium</label>
                    <input
                      type="text"
                      value={formData.utmMedium}
                      onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                      placeholder="bio-link"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-gray-600 mb-1">UTM Campaign Tag</label>
                    <input
                      type="text"
                      value={formData.utmCampaign}
                      onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                      placeholder="harvest_drop_2026"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Live Tracking Link Preview */}
                <div className="text-[10px] text-gray-500 pt-1">
                  Preview:{" "}
                  <code className="text-black break-all">
                    {buildTrackingUrl(
                      formData.targetUrl || "/roastery",
                      formData.utmSource || "instagram",
                      formData.utmMedium || "bio-link",
                      formData.utmCampaign || "campaign"
                    )}
                  </code>
                </div>
              </div>

              {/* Financials & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Budget (IDR)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    placeholder="2000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Attributed Revenue (IDR)</label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-gray-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Notes / Campaign Brief</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Creative direction, influencer list, or roastery drop details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                />
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
                  {editingId ? "Update Campaign" : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
