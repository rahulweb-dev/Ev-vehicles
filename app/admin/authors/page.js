"use client";

import { useState, useEffect } from "react";
import { UserCircle, Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";

const BLANK = {
  name: "", title: "EV Journalist", photo: "", bio: "",
  expertise: "", credentials: "", yearsExp: 0,
  twitter: "", linkedin: "", email: "",
};

function AuthorForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      expertise:   form.expertise.split(",").map(s => s.trim()).filter(Boolean),
      credentials: form.credentials.split(",").map(s => s.trim()).filter(Boolean),
      yearsExp: Number(form.yearsExp) || 0,
    };
    await fetch("/api/admin/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-black text-gray-900">{initial.name ? `Edit ${initial.name}` : "Add Author"}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 space-y-1">
              <span className="text-xs font-semibold text-gray-600">Full Name *</span>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600">Title</span>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600">Years Experience</span>
              <input type="number" min={0} value={form.yearsExp} onChange={e => set("yearsExp", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-xs font-semibold text-gray-600">Photo URL</span>
              <input value={form.photo} onChange={e => set("photo", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-xs font-semibold text-gray-600">Bio</span>
              <textarea rows={3} value={form.bio} onChange={e => set("bio", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none resize-none" />
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-xs font-semibold text-gray-600">Expertise (comma-separated)</span>
              <input value={form.expertise} onChange={e => set("expertise", e.target.value)}
                placeholder="Electric Cars, EV Policy, Charging Tech"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="col-span-2 space-y-1">
              <span className="text-xs font-semibold text-gray-600">Credentials (comma-separated)</span>
              <input value={form.credentials} onChange={e => set("credentials", e.target.value)}
                placeholder="B.Tech Automotive, 5+ years EV journalism"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><FaXTwitter size={11} /> Twitter / X handle</span>
              <input value={form.twitter} onChange={e => set("twitter", e.target.value)}
                placeholder="@evradar"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><FaLinkedin size={11} /> LinkedIn URL</span>
              <input value={form.linkedin} onChange={e => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
            </label>
          </div>
        </div>
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Author
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthorsAdminPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/authors");
    const data = await res.json();
    setAuthors(data.authors || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this author profile?")) return;
    await fetch(`/api/admin/authors?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Author Profiles</h1>
          <p className="text-sm text-gray-500">E-E-A-T: bio, credentials, and expertise for each author</p>
        </div>
        <button onClick={() => setModal({ ...BLANK })}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 shadow-sm transition">
          <Plus size={15} /> Add Author
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      ) : authors.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 rounded-2xl border border-dashed border-gray-200 bg-white">
          <UserCircle size={36} className="text-gray-300" />
          <p className="font-bold text-gray-500">No author profiles yet</p>
          <p className="text-sm text-gray-400">Add profiles to boost E-E-A-T and Google trust.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {authors.map(a => (
            <div key={a._id} className="flex items-center gap-4 rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm">
              {a.photo ? (
                <img src={a.photo} alt={a.name} className="h-12 w-12 rounded-full object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-xl font-black text-white shrink-0">
                  {a.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{a.name}</p>
                <p className="text-xs text-gray-500">{a.title}{a.yearsExp ? ` · ${a.yearsExp}+ yrs` : ""}</p>
                {a.expertise?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.expertise.slice(0, 4).map((e, i) => (
                      <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{e}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setModal({
                  ...a,
                  expertise:   (a.expertise || []).join(", "),
                  credentials: (a.credentials || []).join(", "),
                })}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(a._id)}
                  className="rounded-xl border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AuthorForm
          initial={modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
