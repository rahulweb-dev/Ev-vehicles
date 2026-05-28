"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, Send, Upload, X, Plus, Tag, AlertCircle,
  CheckCircle2, Loader2, Image as ImageIcon, Eye, EyeOff,
} from "lucide-react";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArticleEditor({ initialData = null }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
    imageAlt: initialData?.imageAlt || "",
    category: initialData?.category || "cars",
    author: initialData?.author || "EV News India Team",
    tags: initialData?.tags || [],
    readTime: initialData?.readTime || "5 min",
    featured: initialData?.featured || false,
    status: initialData?.status || "draft",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function handleTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: isEdit ? f.slug : slugify(value),
      metaTitle: f.metaTitle || value,
    }));
  }

  function addTag(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (tag && !form.tags.includes(tag)) {
        setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      }
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be under 10MB", "error");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "/ev-news");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({
        ...f,
        image: data.url,
        imageAlt: f.imageAlt || f.title,
      }));
      showToast("Image uploaded to ImageKit ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(publishStatus) {
    if (!form.title || !form.slug || !form.excerpt || !form.content || !form.image) {
      showToast("Please fill all required fields (title, slug, excerpt, content, image)", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, status: publishStatus };
      const url = isEdit ? `/api/articles/${initialData._id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (publishStatus === "published") {
        showToast("Article published & Google notified via IndexNow ⚡");
      } else {
        showToast("Draft saved ✓");
      }

      setTimeout(() => router.push("/admin/articles"), 1500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  // HTML formatting helpers for the content textarea
  function insertHTML(before, after = "") {
    const ta = document.getElementById("content-editor");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    const newContent =
      form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    setForm((f) => ({ ...f, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    }, 0);
  }

  const toolbarButtons = [
    { label: "H2", action: () => insertHTML("<h2>", "</h2>") },
    { label: "H3", action: () => insertHTML("<h3>", "</h3>") },
    { label: "B", action: () => insertHTML("<strong>", "</strong>"), class: "font-bold" },
    { label: "I", action: () => insertHTML("<em>", "</em>"), class: "italic" },
    { label: "P", action: () => insertHTML("<p>", "</p>") },
    { label: "UL", action: () => insertHTML("<ul>\n<li>", "</li>\n</ul>") },
    { label: "LI", action: () => insertHTML("<li>", "</li>") },
    { label: "Link", action: () => insertHTML('<a href="URL">', "</a>") },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* Top Action Bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white transition">
            ← Back
          </button>
          <span className="text-gray-700">|</span>
          <h1 className="text-sm font-bold text-white">{isEdit ? "Edit Article" : "New Article"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gray-600 hover:text-white transition"
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? "Editor" : "Preview"}
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gray-600 hover:text-white transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-500 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-0 min-h-[calc(100vh-56px)]">
        {/* Main Editor */}
        <div className="border-r border-gray-800 p-6">
          {!preview ? (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Article Title..."
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-white placeholder-gray-700 outline-none"
                />
              </div>

              {/* Slug */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2">
                <span className="text-xs text-gray-500">/news/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  className="flex-1 bg-transparent text-sm text-green-400 outline-none"
                  placeholder="article-slug"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                  Excerpt * (shown in Google search results — 150 chars max)
                </label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value.slice(0, 300) }))}
                  placeholder="Brief summary of the article..."
                  className="w-full resize-none rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500"
                />
                <p className="mt-1 text-right text-xs text-gray-600">{form.excerpt.length}/300</p>
              </div>

              {/* Content Editor */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase text-gray-500">Content * (HTML)</label>
                  <div className="flex gap-1">
                    {toolbarButtons.map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={btn.action}
                        className={`rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-400 hover:border-green-500 hover:text-green-400 transition ${btn.class || ""}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="content-editor"
                  rows={22}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="<p>Write your article content here using HTML tags...</p>&#10;&#10;<h2>Section Heading</h2>&#10;<p>Section content...</p>"
                  className="w-full resize-y rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-green-500"
                />
              </div>
            </div>
          ) : (
            /* Preview Panel */
            <div className="prose prose-invert max-w-none">
              <h1>{form.title || "Untitled Article"}</h1>
              {form.image && (
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img src={form.image} alt={form.imageAlt} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="lead text-gray-400">{form.excerpt}</p>
              <div dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          )}
        </div>

        {/* Right Sidebar — Settings */}
        <div className="bg-gray-900 p-5 space-y-6 overflow-y-auto">
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
              Featured Image * (ImageKit CDN)
            </label>
            {form.image ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={form.image} alt={form.imageAlt} className="w-full h-40 object-cover rounded-xl" />
                <button
                  onClick={() => setForm((f) => ({ ...f, image: "" }))}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-700 py-8 text-gray-500 hover:border-green-500 hover:text-green-400 transition"
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
                <span className="text-xs">{uploading ? "Uploading to ImageKit..." : "Click to upload image"}</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {!form.image && (
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="Or paste image URL"
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-green-500"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
            >
              <option value="cars">Electric Cars</option>
              <option value="bikes">Electric Bikes</option>
              <option value="commercial">Commercial EVs</option>
              <option value="charging">EV Charging</option>
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Author</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-green-500"
            />
          </div>

          {/* Read Time */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Read Time</label>
            <input
              type="text"
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
              placeholder="5 min"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-green-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
              Tags (press Enter to add)
            </label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-400">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag, press Enter"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center justify-between rounded-xl border border-gray-700 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Featured Article</p>
              <p className="text-xs text-gray-500">Show on homepage hero</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              className={`relative h-6 w-11 rounded-full transition ${form.featured ? "bg-green-600" : "bg-gray-700"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.featured ? "left-5.5" : "left-0.5"}`}
              />
            </button>
          </div>

          {/* SEO */}
          <div className="space-y-3 rounded-xl border border-gray-800 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">SEO Settings</p>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Meta Title (50–60 chars)</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                placeholder={form.title}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white outline-none focus:border-green-500"
              />
              <p className="mt-0.5 text-right text-[10px] text-gray-600">{form.metaTitle.length}/60</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Meta Description (150–160 chars)</label>
              <textarea
                rows={3}
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                placeholder={form.excerpt}
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white outline-none focus:border-green-500"
              />
              <p className="mt-0.5 text-right text-[10px] text-gray-600">{form.metaDescription.length}/160</p>
            </div>
          </div>

          {/* IndexNow Notice */}
          <div className="rounded-xl bg-green-900/20 border border-green-800/40 p-3 text-xs text-green-400">
            ⚡ Publishing will instantly ping Google, Bing & Yandex via <strong>IndexNow</strong> to get indexed within minutes.
          </div>
        </div>
      </div>
    </div>
  );
}
