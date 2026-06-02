"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Send, X, AlertCircle, CheckCircle2,
  Loader2, Eye, EyeOff, Upload, ChevronRight,
  Star, Clock, Hash, Search,
} from "lucide-react";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("./TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={24} className="animate-spin text-green-600" />
        <span className="text-sm">Loading editor…</span>
      </div>
    </div>
  ),
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* strip HTML tags for word count */
function wordCount(html) {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

/* ── Sidebar section wrapper ── */
function SideSection({ title, children }) {
  return (
    <div className="border-b border-gray-100 px-5 py-4 last:border-0">
      {title && (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
      )}
      {children}
    </div>
  );
}

/* ── Sidebar input ── */
function SideInput({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/10";
const SELECT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500";

/* ─────────────────────── Main Editor ─────────────────────────── */
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
    metaKeywords: initialData?.metaKeywords || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(false);

  const words = useMemo(() => wordCount(form.content), [form.content]);
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
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
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !form.tags.includes(tag)) setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast("Image must be under 10 MB", "error"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "/ev-news");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, image: data.url, imageAlt: f.imageAlt || f.title }));
      showToast("Featured image uploaded ✓");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(publishStatus) {
    if (!form.title || !form.slug || !form.excerpt || !form.content || !form.image) {
      showToast("Title, slug, excerpt, content and image are required", "error");
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
      showToast(publishStatus === "published"
        ? "Published! Search engines notified ⚡"
        : "Draft saved ✓"
      );
      setTimeout(() => router.push("/admin/articles"), 1500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  /* ── Preview HTML rendering ── */
  const previewBody = (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {form.image && (
        <img src={form.image} alt={form.imageAlt} className="mb-8 w-full rounded-2xl object-cover" style={{ maxHeight: 420 }} />
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 capitalize">{form.category}</span>
        <span>·</span>
        <span>{form.author}</span>
        <span>·</span>
        <span>{readMinutes} min read</span>
        {form.featured && <span className="flex items-center gap-1 text-amber-500"><Star size={11} fill="currentColor" /> Featured</span>}
      </div>
      <h1 className="mb-4 text-3xl font-black text-gray-900 leading-tight">{form.title || "Untitled"}</h1>
      {form.excerpt && <p className="mb-8 text-lg text-gray-500 leading-relaxed border-l-4 border-green-500 pl-4">{form.excerpt}</p>}
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: form.content }} />
    </article>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed right-4 top-4 z-100 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
          }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* ══════════ Top Bar ══════════ */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <button onClick={() => router.back()} className="hover:text-gray-900 transition font-medium">Articles</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="max-w-48 truncate font-semibold text-gray-800">{form.title || (isEdit ? "Edit Article" : "New Article")}</span>
          {form.status === "published" && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Live</span>
          )}
          {form.status === "draft" && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Draft</span>
          )}
        </div>

        {/* Stats + Actions */}
        <div className="flex items-center gap-3">
          {/* Word count */}
          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Hash size={11} /> {words} words · {readMinutes} min
          </span>

          {/* Preview toggle */}
          <button
            onClick={() => setPreview(!preview)}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${preview
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
          >
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? "Edit" : "Preview"}
          </button>

          {/* Save draft */}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Publish */}
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-600 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {isEdit && form.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </header>
      {/* ══════════ End Top Bar ══════════ */}

      {/* ══════════ Body ══════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main editor column ── */}
        <main className="flex-1 overflow-y-auto">
          {preview ? (
            <div className="bg-white min-h-full border-r border-gray-200">
              {previewBody}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">

              {/* Title */}
              <div className="mb-1">
                <textarea
                  rows={2}
                  placeholder="Article title…"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full resize-none bg-transparent text-3xl font-black text-gray-900 placeholder-gray-300 outline-none leading-snug"
                />
              </div>

              {/* Slug */}
              <div className="mb-6 flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                <span className="shrink-0 text-xs text-gray-400">/news/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  placeholder="article-slug"
                  className="flex-1 bg-transparent text-xs font-mono text-green-700 outline-none"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Excerpt *</span>
                  <span className="text-[10px] text-gray-400">{form.excerpt.length}/300 · shown in Google results</span>
                </label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value.slice(0, 300))}
                  placeholder="A compelling summary that appears in search results and article cards…"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder-gray-300 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                />
              </div>

              {/* Rich text editor */}
              <div className="mb-6">
                <label className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Content *</span>
                  <span className="text-[10px] text-gray-400">{words} words · ~{readMinutes} min read</span>
                </label>
                <TipTapEditor
                  content={initialData?.content || ""}
                  onChange={(html) => set("content", html)}
                />
              </div>

              {/* Mobile-only preview button */}
              <button
                onClick={() => setPreview(true)}
                className="sm:hidden w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <Eye size={14} className="inline mr-1.5" /> Preview Article
              </button>
            </div>
          )}
        </main>

        {/* ══════════ Right Sidebar ══════════ */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">

          {/* ── Featured image ── */}
          <SideSection title="Featured Image">
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl">
                <img src={form.image} alt={form.imageAlt} className="h-40 w-full object-cover" />
                <div className="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/60 via-transparent to-transparent p-2">
                  <button
                    onClick={() => set("image", "")}
                    className="flex items-center gap-1 rounded-lg bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-500 transition"
                  >
                    <X size={10} /> Remove
                  </button>
                  <label className="flex items-center gap-1 cursor-pointer rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-white transition">
                    <Upload size={10} /> Replace
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-7 transition hover:border-green-400 hover:bg-green-50">
                {uploading
                  ? <Loader2 size={22} className="animate-spin text-green-600" />
                  : <Upload size={22} className="text-gray-400" />
                }
                <span className="text-xs text-gray-400">{uploading ? "Uploading…" : "Click to upload"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}

            {!form.image && (
              <input
                type="url"
                placeholder="Or paste image URL"
                onChange={(e) => set("image", e.target.value)}
                className={`mt-2 ${INPUT}`}
              />
            )}
            {form.image && (
              <input
                type="text"
                value={form.imageAlt}
                onChange={(e) => set("imageAlt", e.target.value)}
                placeholder="Alt text for accessibility"
                className={`mt-2 ${INPUT}`}
              />
            )}
          </SideSection>

          {/* ── Publish settings ── */}
          <SideSection title="Publish">
            <SideInput label="Category">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={SELECT}>
                <option value="cars">⚡ Electric Cars</option>
                <option value="bikes">🏍️ Electric Bikes</option>
                <option value="commercial">🚛 Commercial EVs</option>
                <option value="charging">🔌 EV Charging</option>
              </select>
            </SideInput>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <SideInput label="Author">
                <input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className={INPUT} />
              </SideInput>
              <SideInput label="Read Time">
                <input type="text" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="5 min" className={INPUT} />
              </SideInput>
            </div>

            {/* Auto read-time hint */}
            {readMinutes > 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={10} /> Auto-computed: ~{readMinutes} min
              </p>
            )}

            {/* Featured toggle */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold text-gray-800">Featured</p>
                <p className="text-[10px] text-gray-400">Show on homepage hero</p>
              </div>
              <button
                onClick={() => set("featured", !form.featured)}
                className={`relative h-5 w-9 rounded-full transition-colors ${form.featured ? "bg-green-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${form.featured ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
          </SideSection>

          {/* ── Tags ── */}
          <SideSection title="Tags">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                  {tag}
                  <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}
                    className="text-gray-400 hover:text-red-500 transition">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Type tag, press Enter"
                className={`${INPUT} pl-8`}
              />
            </div>
          </SideSection>

          {/* ── SEO ── */}
          <SideSection title="SEO">
            <div className="space-y-3">
              <SideInput label={`Meta Title · ${form.metaTitle.length}/60`}>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                  placeholder={form.title || "SEO title…"}
                  className={INPUT}
                />
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-1 rounded-full transition-all ${form.metaTitle.length > 60 ? "bg-red-500" : form.metaTitle.length > 50 ? "bg-green-500" : "bg-gray-300"}`}
                    style={{ width: `${Math.min(100, (form.metaTitle.length / 60) * 100)}%` }}
                  />
                </div>
              </SideInput>

              <SideInput label={`Meta Description · ${form.metaDescription.length}/160`}>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => set("metaDescription", e.target.value)}
                  placeholder={form.excerpt || "SEO description…"}
                  className={`${INPUT} resize-none`}
                />
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-1 rounded-full transition-all ${form.metaDescription.length > 160 ? "bg-red-500" : form.metaDescription.length > 140 ? "bg-green-500" : "bg-gray-300"}`}
                    style={{ width: `${Math.min(100, (form.metaDescription.length / 160) * 100)}%` }}
                  />
                </div>
              </SideInput>

              <SideInput label="Meta Keywords">
                <input
                  type="text"
                  value={form.metaKeywords}
                  onChange={(e) => set("metaKeywords", e.target.value)}
                  placeholder="EV, electric car, India…"
                  className={INPUT}
                />
              </SideInput>
            </div>

            {/* Google preview */}
            {(form.metaTitle || form.title) && (
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">Google Preview</p>
                <p className="text-sm font-medium text-blue-700 leading-tight line-clamp-1">
                  {form.metaTitle || form.title}
                </p>
                <p className="text-[10px] text-green-700">evradar.in › news › {form.slug || "article-slug"}</p>
                <p className="mt-0.5 text-[11px] text-gray-600 line-clamp-2">
                  {form.metaDescription || form.excerpt || "No meta description."}
                </p>
              </div>
            )}
          </SideSection>

          {/* ── IndexNow ── */}
          <SideSection>
            <div className="rounded-lg border border-green-100 bg-green-50 p-3">
              <p className="text-[11px] font-semibold text-green-800">⚡ IndexNow enabled</p>
              <p className="mt-0.5 text-[10px] text-green-600">
                Publishing instantly pings Google, Bing &amp; Yandex for fast indexing.
              </p>
            </div>
          </SideSection>

        </aside>
        {/* ══════════ End Sidebar ══════════ */}
      </div>
    </div>
  );
}
