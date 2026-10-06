"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2, Calendar, Clock, DollarSign, ExternalLink } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events";
import { useRouter } from "next/navigation";

export function EventsManager({ initialEvents = [], defaultType = "WORKSHOP" }: { initialEvents: any[]; defaultType?: string }) {
  const router = useRouter();
  const [eventsList, setEventsList] = useState<any[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    type: defaultType,
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
    price: 0,
    registrationUrl: "",
    status: "UPCOMING"
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      type: defaultType,
      date: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "12:00",
      price: 0,
      registrationUrl: "",
      status: "UPCOMING"
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: any) => {
    setEditingId(ev.id);
    const dateStr = ev.date ? new Date(ev.date).toISOString().split("T")[0] : "";
    setFormData({
      title: ev.title || "",
      slug: ev.slug || "",
      description: ev.description || "",
      type: ev.type || defaultType,
      date: dateStr,
      startTime: ev.startTime || "10:00",
      endTime: ev.endTime || "12:00",
      price: ev.price || 0,
      registrationUrl: ev.registrationUrl || "",
      status: ev.status || "UPCOMING"
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        const res = await updateEvent(editingId, formData);
        if (!res.success) throw new Error(res.error || "Failed to update");
      } else {
        const res = await createEvent({
          ...formData,
          slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        });
        if (!res.success) throw new Error(res.error || "Failed to create");
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEventsList(eventsList.filter((e) => e.id !== id));
      router.refresh();
    } catch (err: any) {
      alert("Failed to delete event: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workshops & Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your roastery masterclasses, espresso calibrations, and community gatherings.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/space/workshops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1.5 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Live Page
          </a>
          <button
            onClick={handleOpenCreate}
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Event / Workshop
          </button>
        </div>
      </div>

      {eventsList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-3">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900">No events found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't scheduled any workshops or events yet. Create your first workshop to display it on the store!
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 text-xs bg-black text-white px-4 py-2 rounded font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Event
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {eventsList.map((ev) => {
              const formattedDate = ev.date
                ? new Date(ev.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "-";

              return (
                <div key={ev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {ev.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                          ev.status === "UPCOMING"
                            ? "bg-green-100 text-green-700"
                            : ev.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{ev.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{ev.description || "No description provided."}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                      </span>
                      {ev.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {ev.startTime} - {ev.endTime || "End"}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <DollarSign className="w-3.5 h-3.5" />{" "}
                        {ev.price === 0 ? "Free" : `IDR ${Number(ev.price).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="p-2 border border-gray-200 rounded text-gray-600 hover:text-black hover:bg-white text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-2 border border-gray-200 rounded text-red-500 hover:bg-red-50 text-xs"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
              {editingId ? "Edit Workshop / Event" : "Create Workshop / Event"}
            </h3>

            {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Manual Brew Basics"
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="EVENT">Event</option>
                    <option value="COMMUNITY">Community Gathering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price (IDR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0 for Free"
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what will be taught or experienced..."
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Registration URL (optional)</label>
                <input
                  type="url"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="e.g. WhatsApp registration link or Google Form"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none font-mono"
                />
              </div>

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
                  {editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
