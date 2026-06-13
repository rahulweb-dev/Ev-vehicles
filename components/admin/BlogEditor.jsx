"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, ArrowLeft, Upload, BookOpen,
  Tag, Clock, User, Image as ImageIcon, Loader2,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <Loader2 size={20} className="animate-spin text-green-600" />
    </div>
  ),
});

const CATEGORIES = ["tips", "guides", "reviews", "news", "comparison", "other"];

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY = {
  title: "", slug: "", excerpt: "", content: "",
  image: "", imageAlt: "", category: "guides",
  author: "EVRadar Team", tags: "", readTime: "5 min",
  featured: false, status: "draft",
  metaTitle: "", metaDescription: "",
};

export default function BlogEditor({ mode = "new", blogId }) {
  const router = useRouter();
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(mode === "edit");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("content");
  const [slugLocked, setSlugLocked] = useState(mode === "edit");

  /* load existing blog for edit mode */
  useEffect(() => {
    if (mode !== "edit" || !blogId) return;
    fetch(`/api/blogs/${blogId}`)
      .then(r => r.json())
      .then(d => {
        if (d.blog) {
          setForm({ ...EMPTY, ...d.blog, tags: (d.blog.tags || []).join(", ") });
        }
      })
      .catch(() => setError("Failed to load blog post"))
      .finally(() => setLoading(false));
  }, [blogId, mode]);

  const set = useCallback((field, value) => {
    setForm(p => {
      const next = { ...p, [field]: value };
      if (field === "title" && !slugLocked) {
        next.slug = slugify(value);
      }
      return next;
    });
  }, [slugLocked]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) set("image", data.url);
      else setError("Image upload failed");
    } catch { setError("Image upload failed"); }
    setUploading(false);
  }

  async function handleSave(publishNow = false) {
    setError(""); setSuccess("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.slug.trim())  { setError("Slug is required");  return; }

    setSaving(true);
    const payload = {
      ...form,
      tags:   form.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: publishNow ? "published" : form.status,
    };

    try {
      const url    = mode === "edit" ? `/api/blogs/${blogId}` : "/api/blogs";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Save failed"); return; }

      setSuccess(publishNow ? "Blog published!" : "Saved successfully!");
      if (mode === "new") {
        setTimeout(() => router.push(`/admin/blogs/${data.blog._id}/edit`), 800);
      } else {
        setForm(p => ({ ...p, status: data.blog.status }));
      }
    } catch { setError("Network error. Please try again."); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-green-600" />
      </div>
    );
  }

  const tabs = ["content", "seo", "settings"];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={15} /> Blogs
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <BookOpen size={18} className="text-green-600" />
            {mode === "new" ? "New Blog Post" : "Edit Blog Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {form.status === "published" && form.slug && (
            <Link href={`/blog/${form.slug}`} target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              <Eye size={14} /> Preview
            </Link>
          )}
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            {form.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error   && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <input
              type="text"
              placeholder="Blog post title…"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none"
            />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Slug:</span>
              <input
                type="text"
                value={form.slug}
                onFocus={() => setSlugLocked(true)}
                onChange={e => set("slug", slugify(e.target.value))}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex border-b border-gray-100">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-5 py-3 text-sm font-semibold capitalize transition ${
                    activeTab === t
                      ? "border-b-2 border-green-600 text-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Excerpt</label>
                    <textarea
                      rows={2}
                      placeholder="Short description shown in blog listing…"
                      value={form.excerpt}
                      onChange={e => set("excerpt", e.target.value)}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Content</label>
                    <TipTapEditor
                      content={form.content}
                      onChange={html => set("content", html)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Meta Title</label>
                    <input type="text" value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)}
                      placeholder="SEO title (50–60 chars)"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                    <p className="mt-1 text-xs text-gray-400">{form.metaTitle.length}/60</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Meta Description</label>
                    <textarea rows={3} value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)}
                      placeholder="SEO description (150–160 chars)"
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-400 focus:outline-none" />
                    <p className="mt-1 text-xs text-gray-400">{form.metaDescription.length}/160</p>
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-600">
                      <Tag size={11} /> Tags (comma separated)
                    </label>
                    <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)}
                      placeholder="electric car, tata nexon, ev tips"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <User size={11} /> Author
                      </label>
                      <input type="text" value={form.author} onChange={e => set("author", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <Clock size={11} /> Read Time
                      </label>
                      <input type="text" value={form.readTime} onChange={e => set("readTime", e.target.value)}
                        placeholder="5 min"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Featured Post</p>
                      <p className="text-xs text-gray-500">Show on homepage featured section</p>
                    </div>
                    <button onClick={() => set("featured", !form.featured)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.featured ? "bg-green-600" : "bg-gray-300"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.featured ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Publish status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800">Publish</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block h-2 w-2 rounded-full ${form.status === "published" ? "bg-green-500" : "bg-yellow-400"}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">{form.status}</span>
            </div>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:outline-none">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800">Category</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => set("category", cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    form.category === cat
                      ? "bg-green-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured image */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <ImageIcon size={14} /> Featured Image
            </h3>
            {form.image ? (
              <div className="relative">
                <img src={form.image} alt={form.imageAlt || "Blog image"}
                  className="w-full h-40 object-cover rounded-xl" />
                <button onClick={() => set("image", "")}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                  <span className="text-xs font-bold px-0.5">✕</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-green-600" />
                ) : (
                  <>
                    <Upload size={20} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Click to upload image</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
            {form.image && (
              <input type="text" value={form.imageAlt} onChange={e => set("imageAlt", e.target.value)}
                placeholder="Alt text for image"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-green-400 focus:outline-none" />
            )}
            <div className="mt-2">
              <input type="text" value={form.image} onChange={e => set("image", e.target.value)}
                placeholder="Or paste image URL"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-green-400 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
