"use client";

import { useState } from "react";
import {
  Mail,
  Plus,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  Loader2,
  Users,
  Send,
  Eye,
} from "lucide-react";
import {
  Subscriber,
  addSubscriber,
  deleteSubscriber,
  toggleSubscriberStatus,
} from "@/lib/actions/marketing";
import { useRouter } from "next/navigation";

interface EmailCaptureManagerProps {
  initialSubscribers: Subscriber[];
}

export function EmailCaptureManager({ initialSubscribers }: EmailCaptureManagerProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Subscriber Modal Form
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("Admin Manual");
  const [newTags, setNewTags] = useState("Newsletter, VIP");

  // Broadcast Preview Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("New Harvest Release: Gayo Anaerobic Batch 01");
  const [broadcastBody, setBroadcastBody] = useState(
    "Good morning,\n\nWe have just completed our first seasonal cupping of the year. Our Gayo Anaerobic Natural beans are resting and now available in 250g and 1kg bags.\n\nWarm regards,\nKALANA Roastery"
  );

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch =
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === "SUBSCRIBED").length;
  const unsubscribedCount = subscribers.length - activeCount;

  const handleExportCSV = () => {
    const headers = ["Email", "Source", "Status", "SubscribedAt", "Tags"];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.source}"`,
      `"${s.status}"`,
      `"${s.subscribedAt}"`,
      `"${(s.tags || []).join("; ")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kalana-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED";
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus as any } : s))
    );

    try {
      await toggleSubscriberStatus(sub.id);
      setStatusMessage({
        type: "success",
        text: `Subscriber ${sub.email} status set to ${newStatus}.`,
      });
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to toggle status." });
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!confirm(`Are you sure you want to delete ${sub.email}?`)) return;

    try {
      await deleteSubscriber(sub.id);
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
      setStatusMessage({ type: "success", text: `Deleted ${sub.email}.` });
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete subscriber." });
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await addSubscriber({
        email: newEmail,
        source: newSource,
        tags: tagsArray,
      });

      if (res.success) {
        const newSubObj: Subscriber = {
          id: `sub-${Date.now()}`,
          email: newEmail.trim().toLowerCase(),
          source: newSource,
          status: "SUBSCRIBED",
          subscribedAt: new Date().toISOString().split("T")[0],
          tags: tagsArray,
        };
        setSubscribers([newSubObj, ...subscribers]);
        setIsModalOpen(false);
        setNewEmail("");
        setStatusMessage({
          type: "success",
          text: `Added ${newSubObj.email} to subscriber list.`,
        });
        router.refresh();
      } else {
        setError(res.error || "Failed to add subscriber.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add subscriber.");
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
              <Mail className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 font-mono">
              EMAIL CAPTURE & NEWSLETTER
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Manage your audience collected from storefront newsletter forms, pop-ups, and checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-gray-500" />
            Draft Broadcast
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subscriber
          </button>
        </div>
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
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Audience</span>
          <span className="text-2xl font-bold text-gray-900">{subscribers.length}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-emerald-600 block">Active Subscribers</span>
          <span className="text-2xl font-bold text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-amber-600 block">Unsubscribed</span>
          <span className="text-2xl font-bold text-amber-700">{unsubscribedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "SUBSCRIBED", "UNSUBSCRIBED"].map((status) => (
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

      {/* Subscribers Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-100">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            No subscribers found. New signups from the homepage newsletter form will automatically appear here.
          </div>
        ) : (
          filteredSubscribers.map((sub) => (
            <div
              key={sub.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-gray-900">{sub.email}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                    {sub.source}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(sub)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      sub.status === "SUBSCRIBED"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Click to toggle status"
                  >
                    {sub.status}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined: {sub.subscribedAt}
                  </span>
                  {sub.tags && sub.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {sub.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDelete(sub)}
                  className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                  title="Delete Subscriber"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm font-mono">ADD SUBSCRIBER MANUALLY</h3>
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

            <form onSubmit={handleAddSubscriber} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="subscriber@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Source / Acquisition Channel</label>
                <input
                  type="text"
                  placeholder="e.g. In-Store Barista, Private Cupping"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Newsletter, VIP Customer"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
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
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Preview Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm font-mono flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                BROADCAST NEWSLETTER PREVIEW
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-gray-500 font-mono">
              Recipients: <strong>{activeCount} active subscribers</strong>. Connect an email service provider (Resend, Brevo, Mailchimp) or copy formatted markdown.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Message Body</label>
                <textarea
                  rows={6}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-mono text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${broadcastSubject}\n\n${broadcastBody}`);
                  alert("Copied broadcast email template to clipboard!");
                  setShowBroadcastModal(false);
                }}
                className="px-5 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800"
              >
                Copy Email Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
