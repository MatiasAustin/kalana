"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Users,
  Search,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";
import Link from "next/link";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  type?: string | null;
  category?: string | null;
  date?: string | Date | null;
  startTime?: string | null;
  endTime?: string | null;
  price?: number | null;
  capacity?: number | null;
  registrationUrl?: string | null;
  coverImageUrl?: string | null;
  status?: string | null;
  isFeatured?: boolean | null;
}

interface EventsManagerProps {
  initialEvents: EventItem[];
  defaultType?: "WORKSHOP" | "EVENT" | string;
}

const CATEGORY_PRESETS = [
  "Coffee Education",
  "Sensory & Cupping",
  "Barista Class",
  "Creative Workshops",
  "Community",
];

export function EventsManager({ initialEvents = [], defaultType = "ALL" }: EventsManagerProps) {
  const router = useRouter();
  const [eventsList, setEventsList] = useState<EventItem[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<string>(defaultType); // "ALL", "WORKSHOP", "EVENT"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    type: defaultType === "EVENT" ? "EVENT" : "WORKSHOP",
    category: "Coffee Education",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:30",
    price: 0,
    capacity: 8,
    registrationUrl: "",
    coverImageUrl: "",
    status: "UPCOMING",
    isFeatured: false,
  });

  const filteredEvents = eventsList.filter((ev) => {
    const matchesTab =
      activeTab === "ALL" || (ev.type && ev.type.toUpperCase() === activeTab.toUpperCase());
    const matchesStatus =
      selectedStatus === "ALL" || (ev.status && ev.status.toUpperCase() === selectedStatus.toUpperCase());
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesStatus && matchesSearch;
  });

  const workshopCount = eventsList.filter((e) => e.type?.toUpperCase() === "WORKSHOP").length;
  const eventCount = eventsList.filter((e) => e.type?.toUpperCase() === "EVENT").length;

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      type: activeTab === "EVENT" ? "EVENT" : "WORKSHOP",
      category: activeTab === "EVENT" ? "Creative Workshops" : "Coffee Education",
      date: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "12:30",
      price: 0,
      capacity: 8,
      registrationUrl: "",
      coverImageUrl: "",
      status: "UPCOMING",
      isFeatured: false,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    let dateStr = "";
    if (ev.date) {
      const d = typeof ev.date === "string" || typeof ev.date === "number" ? new Date(ev.date) : ev.date;
      dateStr = d.toISOString().split("T")[0];
    }

    setFormData({
      title: ev.title || "",
      slug: ev.slug || "",
      description: ev.description || "",
      type: ev.type || "WORKSHOP",
      category: ev.category || "Coffee Education",
      date: dateStr || new Date().toISOString().split("T")[0],
      startTime: ev.startTime || "10:00",
      endTime: ev.endTime || "12:30",
      price: ev.price || 0,
      capacity: ev.capacity || 8,
      registrationUrl: ev.registrationUrl || "",
      coverImageUrl: ev.coverImageUrl || "",
      status: ev.status || "UPCOMING",
      isFeatured: Boolean(ev.isFeatured),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    try {
      if (editingId) {
        const res = await updateEvent(editingId, payload);
        if (!res.success) throw new Error(res.error || "Failed to update");
        setEventsList((prev) =>
          prev.map((ev) => (ev.id === editingId ? { ...ev, ...payload, id: editingId } : ev))
        );
        setStatusMessage({ type: "success", text: `"${payload.title}" updated successfully.` });
      } else {
        const res = await createEvent(payload);
        if (!res.success) throw new Error(res.error || "Failed to create");
        const newEv: EventItem = {
          ...payload,
          id: res.id || `ev-${Date.now()}`,
        };
        setEventsList([newEv, ...eventsList]);
        setStatusMessage({ type: "success", text: `"${payload.title}" created successfully.` });
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteEvent(id);
      setEventsList(eventsList.filter((e) => e.id !== id));
      setStatusMessage({ type: "success", text: `Deleted "${title}".` });
      router.refresh();
    } catch (err: any) {
      alert("Failed to delete event: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase font-mono">
            {defaultType === "EVENT"
              ? "SPACE EVENTS & GATHERINGS"
              : defaultType === "WORKSHOP"
              ? "ROASTERY WORKSHOPS & MASTERCLASSES"
              : "SPACE ACTIVITIES (EVENTS & WORKSHOPS)"}
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Manage your roastery masterclasses, espresso calibrations, and community gatherings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/space/workshops"
            target="_blank"
            className="text-xs border border-gray-300 text-gray-700 px-3 py-2 rounded font-mono hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Live Storefront
          </Link>
          <button
            onClick={handleOpenCreate}
            className="bg-black text-white px-4 py-2 rounded text-xs font-mono font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add{" "}
            {activeTab === "EVENT" ? "Event" : activeTab === "WORKSHOP" ? "Workshop" : "Item"}
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
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Activities</span>
          <span className="text-2xl font-bold text-gray-900">{eventsList.length}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-500 block">Workshops / Classes</span>
          <span className="text-2xl font-bold text-gray-900">{workshopCount}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-500 block">Events & Gatherings</span>
          <span className="text-2xl font-bold text-gray-900">{eventCount}</span>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="bg-white p-4 rounded border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tabs: All / Workshops / Events */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {[
            { id: "ALL", label: "All Items" },
            { id: "WORKSHOP", label: "Workshops" },
            { id: "EVENT", label: "Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, desc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none bg-white focus:ring-1 focus:ring-black"
          >
            <option value="ALL">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-3">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 font-mono">No events or workshops found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto font-mono">
            There are no items matching your current filters. Add a new activity to publish it on the storefront!
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 text-xs bg-black text-white px-4 py-2 rounded font-mono font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Item
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredEvents.map((ev) => {
            const formattedDate = ev.date
              ? new Date(ev.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "-";

            return (
              <div
                key={ev.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {ev.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.coverImageUrl}
                      alt={ev.title}
                      className="w-20 h-20 object-cover rounded bg-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center text-gray-400 shrink-0 font-mono text-[10px] text-center p-1">
                      {ev.type}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {ev.type}
                      </span>
                      {ev.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          {ev.category}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                          ev.status === "UPCOMING"
                            ? "bg-emerald-100 text-emerald-800"
                            : ev.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                      {ev.isFeatured && (
                        <span className="text-[10px] font-mono text-amber-600 flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{ev.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">
                      {ev.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                      </span>
                      {ev.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {ev.startTime} - {ev.endTime || "End"}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-semibold text-gray-800">
                        <DollarSign className="w-3.5 h-3.5" />{" "}
                        {ev.price === 0 || !ev.price
                          ? "Free"
                          : `IDR ${Number(ev.price).toLocaleString("id-ID")}`}
                      </span>
                      {ev.capacity && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Max {ev.capacity} seats
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {ev.registrationUrl && (
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-gray-200 rounded text-gray-500 hover:text-black hover:bg-white text-xs"
                      title="View Registration Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-2 border border-gray-200 rounded text-gray-600 hover:text-black hover:bg-white text-xs flex items-center gap-1 font-mono"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id, ev.title)}
                    className="p-2 border border-gray-200 rounded text-red-500 hover:bg-red-50 text-xs"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm font-mono">
                {editingId ? "EDIT WORKSHOP / EVENT" : "CREATE NEW WORKSHOP / EVENT"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="text-xs font-mono text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug:
                        editingId && prev.slug
                          ? prev.slug
                          : title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  placeholder="e.g. Manual Brew Basics"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="manual-brew-basics"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none bg-white"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Category / Tag</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Coffee Education"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_PRESETS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Price, Capacity, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Price (IDR)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0 for Free"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    placeholder="e.g. 8"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none bg-white"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUploadField
                label="Cover Image / Flyer (Optional)"
                value={formData.coverImageUrl || ""}
                onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
                helperText="Upload event photo to Cloudflare R2 or enter direct image URL"
              />

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Description / Curriculum</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of what participants will learn, what is included, etc..."
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none leading-relaxed"
                />
              </div>

              {/* Registration URL */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Registration URL / WhatsApp Link
                </label>
                <input
                  type="text"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="https://wa.me/628111234567?text=Register..."
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-gray-700 cursor-pointer font-semibold">
                  Feature this on Homepage & Store Highlights
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
