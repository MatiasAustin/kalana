"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Plus, 
  Loader2, 
  MessageSquare,
  Award
} from "lucide-react";
import { 
  updateReviewStatus, 
  toggleReviewFeatured, 
  deleteReview, 
  createReview 
} from "@/lib/actions/reviews";

interface Product {
  id: string;
  name: string;
}

interface Review {
  id: string;
  productId: string;
  authorName: string | null;
  rating: number;
  title: string | null;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  isFeatured: boolean | null;
  createdAt: Date | string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ReviewsManagerProps {
  initialReviews: Review[];
  allProducts: Product[];
}

export function ReviewsManager({ initialReviews, allProducts }: ReviewsManagerProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: allProducts[0]?.id || "",
    authorName: "",
    rating: 5,
    title: "",
    content: "",
    status: "APPROVED" as "APPROVED" | "PENDING",
    isFeatured: false,
  });

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    setActionLoading(`stat-${id}`);
    try {
      const res = await updateReviewStatus(id, newStatus);
      if (res.success) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } else {
        alert(res.error || "Failed to update review status");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (r: Review) => {
    const nextFeatured = !r.isFeatured;
    setActionLoading(`feat-${r.id}`);
    try {
      const res = await toggleReviewFeatured(r.id, nextFeatured);
      if (res.success) {
        setReviews(prev => prev.map(item => item.id === r.id ? { ...item, isFeatured: nextFeatured } : item));
      } else {
        alert(res.error || "Failed to update featured state");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(`del-${id}`);
    try {
      const res = await deleteReview(id);
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert(res.error || "Failed to delete review");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName) return alert("Author name is required");
    if (!formData.content) return alert("Review content is required");

    setActionLoading("create");
    try {
      const res = await createReview(formData);
      if (res.success && res.id) {
        const prod = allProducts.find(p => p.id === formData.productId);
        const newReview: Review = {
          id: res.id,
          ...formData,
          createdAt: new Date(),
          product: prod ? { id: prod.id, name: prod.name, slug: "" } : null,
        };
        setReviews(prev => [newReview, ...prev]);
        setIsModalOpen(false);
        setFormData({
          productId: allProducts[0]?.id || "",
          authorName: "",
          rating: 5,
          title: "",
          content: "",
          status: "APPROVED",
          isFeatured: false,
        });
      } else {
        alert(res.error || "Failed to create review");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (activeTab !== "ALL" && r.status !== activeTab) return false;

    if (search.trim()) {
      const query = search.toLowerCase();
      const author = (r.authorName || "").toLowerCase();
      const content = (r.content || "").toLowerCase();
      const pName = (r.product?.name || "").toLowerCase();
      return author.includes(query) || content.includes(query) || pName.includes(query);
    }

    return true;
  });

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter(r => r.status === "PENDING").length;
  const approvedCount = reviews.filter(r => r.status === "APPROVED").length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">PRODUCT REVIEWS</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Moderate customer feedback and showcase verified reviews</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD REVIEW MANUALLY
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-gray-500 uppercase">Total Reviews</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalReviews}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-amber-700 uppercase">Average Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl font-bold text-gray-900">{avgRating}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-amber-700 uppercase">Pending Moderation</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] text-green-700 uppercase">Approved Reviews</p>
          <p className="text-xl font-bold text-green-700 mt-1">{approvedCount}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Search & Tabs */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "ALL" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({totalReviews})
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "PENDING" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("APPROVED")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "APPROVED" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab("REJECTED")}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "REJECTED" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rejected ({reviews.filter(r => r.status === "REJECTED").length})
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviewer name, review text, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-800">No reviews found</p>
              <p className="text-[11px] mt-1 text-gray-400">
                Customer reviews submitted on product pages will appear here for moderation.
              </p>
            </div>
          ) : (
            filtered.map((r) => {
              const stars = Array.from({ length: 5 }, (_, i) => i < r.rating);

              return (
                <div key={r.id} className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {stars.map((filled, idx) => (
                          <Star 
                            key={idx} 
                            className={`w-3.5 h-3.5 ${filled ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>

                      <span className="font-bold text-gray-900">{r.authorName || "Anonymous"}</span>

                      <span className="text-gray-400 text-[10px]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        }) : "-"}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        r.status === "APPROVED" 
                          ? "bg-green-100 text-green-800" 
                          : r.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {r.status || "PENDING"}
                      </span>

                      {r.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold uppercase flex items-center gap-1">
                          <Award className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="text-gray-900 font-sans text-xs">
                      {r.title && <p className="font-bold text-gray-900 mb-0.5 font-mono">{r.title}</p>}
                      <p className="text-gray-700 leading-relaxed">{r.content}</p>
                    </div>

                    <div className="text-[11px] text-gray-500 pt-1 flex items-center gap-1">
                      <span>Product:</span>
                      <span className="font-semibold text-gray-800">{r.product?.name || "KALANA Product"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => handleToggleFeatured(r)}
                      disabled={actionLoading === `feat-${r.id}`}
                      title={r.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                      className={`p-1.5 rounded border transition-colors ${
                        r.isFeatured 
                          ? "bg-purple-50 border-purple-300 text-purple-700" 
                          : "border-gray-200 text-gray-400 hover:text-black"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                    </button>

                    {r.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                        disabled={actionLoading === `stat-${r.id}`}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                    )}

                    {r.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                        disabled={actionLoading === `stat-${r.id}`}
                        className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-[11px] font-medium flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={actionLoading === `del-${r.id}`}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-200 text-gray-500 text-[11px]">
          Showing {filtered.length} of {reviews.length} reviews
        </div>

      </div>

      {/* Manual Review Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">ADD CUSTOMER REVIEW</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Select Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Customer / Reviewer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Budi Santoso"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Star Rating (1 - 5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Review Title</label>
                <input
                  type="text"
                  placeholder="E.g., Rasa kopinya sangat nikmat!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Review Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tulis ulasan pembeli..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="feat-checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="feat-checkbox" className="text-gray-700 cursor-pointer">
                  Featured Review (Tampilkan di Beranda/Sorotan)
                </label>
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
                  disabled={actionLoading === "create"}
                  className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 flex items-center gap-2"
                >
                  {actionLoading === "create" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
