"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertBlogArticle, deleteBlogArticle } from "@/lib/actions/blog";
import { ImageUploadField } from "./ImageUploadField";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  Tag,
} from "lucide-react";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  author: string;
  readTime: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

interface BlogManagerProps {
  initialArticles: Article[];
}

const CATEGORY_OPTIONS = [
  "Roastery Craft",
  "Brewing Guide",
  "The Space",
  "Stories",
  "Sensory & Origin",
];

export function BlogManager({ initialArticles }: BlogManagerProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Roastery Craft",
    coverImage: "",
    author: "KALANA Roastery",
    readTime: "4 min read",
    status: "PUBLISHED",
  });

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.length - publishedCount;

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      id: `art-${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "Roastery Craft",
      coverImage: "",
      author: "KALANA Roastery",
      readTime: "4 min read",
      status: "PUBLISHED",
      createdAt: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({ ...article });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (article: Article) => {
    const newStatus: "PUBLISHED" | "DRAFT" = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = { ...article, status: newStatus };

    setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));

    try {
      const res = await upsertBlogArticle(updated);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Article "${article.title}" marked as ${newStatus}.`,
        });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update article." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to update article." });
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    try {
      const res = await deleteBlogArticle(article.id);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
        setStatusMessage({ type: "success", text: `Deleted "${article.title}".` });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to delete article." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to delete article." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      alert("Title and URL Slug are required.");
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const articleToSave: Article = {
      id: formData.id || `art-${Date.now()}`,
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: formData.excerpt || "",
      content: formData.content || "",
      category: formData.category || "Stories",
      coverImage: formData.coverImage || "",
      author: formData.author || "KALANA Roastery",
      readTime: formData.readTime || "4 min read",
      status: formData.status || "PUBLISHED",
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      const res = await upsertBlogArticle(articleToSave);
      if (res.success) {
        setArticles((prev) => {
          const exists = prev.some((a) => a.id === articleToSave.id);
          if (exists) {
            return prev.map((a) => (a.id === articleToSave.id ? articleToSave : a));
          }
          return [articleToSave, ...prev];
        });
        setIsModalOpen(false);
        setStatusMessage({
          type: "success",
          text: `Article "${articleToSave.title}" saved successfully!`,
        });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save article." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to save article." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-neutral-900 text-white rounded">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">COFFEE JOURNAL & ARTICLES</h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Manage long-form editorial stories, roast profiles, and brewing guides
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/journal"
            target="_blank"
            className="px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Journal Page
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Article
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-md text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Articles</span>
          <span className="text-2xl font-bold text-gray-900">{articles.length}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-emerald-600 block">Published Stories</span>
          <span className="text-2xl font-bold text-emerald-700">{publishedCount}</span>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <span className="text-[10px] font-mono uppercase text-amber-600 block">Drafts</span>
          <span className="text-2xl font-bold text-amber-700">{draftCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", ...CATEGORY_OPTIONS].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            No articles found. Click "New Article" to publish your first story.
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-start gap-4">
                {art.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-20 h-20 object-cover rounded bg-neutral-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center text-gray-300 flex-shrink-0 font-mono text-xs">
                    No Img
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold uppercase">
                      {art.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(art)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        art.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                      title="Click to toggle status"
                    >
                      {art.status}
                    </button>
                    <span className="text-[10px] font-mono text-gray-400">/journal/{art.slug}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm">{art.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">{art.excerpt}</p>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {art.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/journal/${art.slug}`}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
                  title="View Article"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(art)}
                  className="p-2 text-gray-600 hover:text-black rounded hover:bg-gray-100 transition-colors"
                  title="Edit Article"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(art)}
                  className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm font-mono">
                {editingArticle ? "EDIT JOURNAL ARTICLE" : "CREATE NEW ARTICLE"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., The Craft of Slow Roasting"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug:
                        editingArticle && prev.slug
                          ? prev.slug
                          : title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black font-mono"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <span className="bg-gray-100 px-2.5 py-2 text-gray-500 font-mono text-xs">/journal/</span>
                  <input
                    type="text"
                    required
                    placeholder="craft-of-slow-roasting"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              {/* Category, Author, Read Time, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black bg-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "PUBLISHED" | "DRAFT" })
                    }
                    className="w-full p-2 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live on site)</option>
                    <option value="DRAFT">DRAFT (Internal only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                    Author Credit
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="KALANA Roastery"
                    className="w-full p-2 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="4 min read"
                    className="w-full p-2 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <ImageUploadField
                label="Cover Photograph"
                value={formData.coverImage || ""}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                helperText="Main editorial cover image displayed on journal cards and article reader"
              />

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                  Short Excerpt / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="One or two sentences summarizing this article for readers..."
                  className="w-full p-2 border border-gray-300 rounded text-xs font-sans outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-gray-700 mb-1">
                  Article Body Content
                </label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full narrative or brewing guide here. Paragraph breaks will be formatted cleanly on the reader..."
                  className="w-full p-2 border border-gray-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-xs font-mono text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-black text-white rounded text-xs font-mono font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : editingArticle ? (
                    "Update Article"
                  ) : (
                    "Publish Article"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
