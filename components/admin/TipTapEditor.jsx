"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TipTapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline as UIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Code2,
  Minus, Link2, Image as ImageLucide, Table as TableIcon, Video,
  Highlighter, Palette, Undo2, Redo2,
  X, Loader2, Upload, Trash2, MoveHorizontal,
} from "lucide-react";

/* ─────────────────────────── Image NodeView ─────────────────────────── */

function ImageNodeView({ node, updateAttributes, selected, deleteNode }) {
  const { src, alt, align = "center", width, caption } = node.attrs;
  const [captionOpen, setCaptionOpen] = useState(!!caption);
  const [captionText, setCaptionText] = useState(caption || "");
  const imgWrapRef = useRef(null);
  const startDragRef = useRef(null);

  /* Resize by dragging bottom-right corner */
  function onResizeStart(e) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = imgWrapRef.current?.offsetWidth || 400;
    startDragRef.current = { startX, startW };

    function onMove(ev) {
      const dx = ev.clientX - startDragRef.current.startX;
      const newW = Math.max(80, startDragRef.current.startW + dx);
      updateAttributes({ width: newW + "px" });
    }
    function onUp() {
      startDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  /* Caption save */
  function saveCaption(text) {
    setCaptionText(text);
    updateAttributes({ caption: text });
  }

  /* Alignment wrapper */
  const wrapperClass = {
    left:   "flex justify-start",
    center: "flex justify-center",
    right:  "flex justify-end",
  }[align] || "flex justify-center";

  return (
    <NodeViewWrapper className={`relative my-5 w-full ${wrapperClass}`} contentEditable={false}>
      <div
        ref={imgWrapRef}
        className="relative group inline-block"
        style={{ width: width || "auto", maxWidth: "100%" }}
      >
        {/* ── Floating toolbar — appears on select ── */}
        {selected && (
          <div
            className="absolute top-2 left-1/2 z-50 flex items-center gap-0.5 rounded-xl bg-gray-900/95 px-2 py-1.5 shadow-2xl backdrop-blur-sm"
            style={{ transform: "translateX(-50%)", whiteSpace: "nowrap" }}
          >
            {/* Alignment */}
            {[
              { key: "left",   icon: <AlignLeft size={13} /> },
              { key: "center", icon: <AlignCenter size={13} /> },
              { key: "right",  icon: <AlignRight size={13} /> },
            ].map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: key }); }}
                title={`Align ${key}`}
                className={`rounded p-1.5 transition ${align === key ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
              >
                {icon}
              </button>
            ))}

            <div className="mx-1 h-4 w-px bg-white/20" />

            {/* Width presets */}
            {[["25%", "¼"], ["50%", "½"], ["75%", "¾"], [null, "Full"]].map(([w, label]) => {
              const isActive = w === null ? !width : width === w;
              return (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: w }); }}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${isActive ? "bg-green-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {label}
                </button>
              );
            })}

            <div className="mx-1 h-4 w-px bg-white/20" />

            {/* Caption toggle */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (!captionOpen) setCaptionOpen(true);
                else { setCaptionOpen(false); saveCaption(""); }
              }}
              className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${captionOpen ? "bg-green-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
            >
              Caption
            </button>

            <div className="mx-1 h-4 w-px bg-white/20" />

            {/* Resize hint */}
            <span className="text-[10px] text-gray-500 select-none px-1" title="Drag bottom-right corner to resize">
              <MoveHorizontal size={12} />
            </span>

            {/* Delete */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
              title="Delete image"
              className="rounded p-1.5 text-red-400 transition hover:bg-white/10 hover:text-red-300"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* ── Image ── */}
        <img
          src={src}
          alt={alt || ""}
          draggable={false}
          className={`block h-auto rounded-lg transition-shadow ${selected ? "ring-2 ring-green-500 ring-offset-1" : ""}`}
          style={{ width: "100%", maxWidth: "100%" }}
        />

        {/* ── Resize handle (bottom-right) ── */}
        {selected && (
          <div
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 z-50 h-5 w-5 cursor-se-resize rounded-tl-md bg-green-600 flex items-center justify-center opacity-90 hover:opacity-100"
            title="Drag to resize"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <line x1="1" y1="8" x2="8" y2="1" stroke="white" strokeWidth="1.5" />
              <line x1="4" y1="8" x2="8" y2="4" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Caption ── */}
      {captionOpen && (
        <div className="w-full px-4">
          <input
            type="text"
            value={captionText}
            onChange={(e) => saveCaption(e.target.value)}
            placeholder="Add a caption…"
            className="mt-2 w-full border-b border-gray-200 bg-transparent pb-1 text-center text-xs italic text-gray-500 outline-none placeholder-gray-400 focus:border-green-400"
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}

/* ─────────────────── Custom Image Extension ─────────────────────────── */
const ImageExtension = TipTapImage.extend({
  draggable: false, // prevents click-to-jump caused by ProseMirror drag detection

  addAttributes() {
    return {
      src:     { default: null },
      alt:     { default: null },
      title:   { default: null },
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align || "center" }),
      },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width") || null,
        renderHTML: (attrs) => attrs.width ? { "data-width": attrs.width } : {},
      },
      caption: {
        default: "",
        parseHTML: () => "",
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { align = "center", width, caption, ...attrs } = HTMLAttributes;
    const styleList = [
      align === "left"   ? "margin-right:auto;margin-left:0;display:block" :
      align === "right"  ? "margin-left:auto;margin-right:0;display:block" :
      "margin:0 auto;display:block",
      width ? `width:${width};max-width:100%` : "max-width:100%",
    ];
    return ["img", mergeAttributes(this.options.HTMLAttributes, attrs, {
      "data-align": align,
      style: styleList.join(";"),
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

/* ─────────────────────── Small toolbar helpers ──────────────────────── */
function Sep() {
  return <span className="mx-0.5 inline-block h-5 w-px shrink-0 bg-gray-200 align-middle" />;
}

function TBtn({ onPress, active, title, disabled, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onPress?.(); }}
      disabled={disabled}
      title={title}
      className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded px-1 text-xs transition
        ${active ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}
        disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Popover({ title, onClose, children, width = "w-72" }) {
  return (
    <div className={`absolute left-0 top-[calc(100%+6px)] z-100 ${width} rounded-xl border border-gray-200 bg-white p-4 shadow-2xl ring-1 ring-black/5`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-800">{title}</p>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); onClose(); }}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700 transition">
          <X size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────── Main Editor ────────────────────────────── */
export default function TipTapEditor({ content = "", onChange }) {
  const [openPopover, setOpenPopover] = useState(null);
  const [linkHref, setLinkHref]       = useState("");
  const [ytUrl, setYtUrl]             = useState("");
  const [imgUrl, setImgUrl]           = useState("");
  const [uploading, setUploading]     = useState(false);
  const [isDragOver, setIsDragOver]   = useState(false);
  const fileRef   = useRef(null);
  const editorRef = useRef(null);

  /* Upload a file to ImageKit and insert image node */
  const uploadFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "/ev-news");
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      editorRef.current
        ?.chain().focus()
        .setImage({ src: data.url, alt: file.name, align: "center" })
        .run();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      ImageExtension.configure({ allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-green-700 underline cursor-pointer" },
      }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      TextStyle, Color,
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap-doc prose prose-base max-w-none focus:outline-none px-8 py-6 min-h-96 text-gray-900",
      },
      /* Drop image files onto editor */
      handleDrop(_view, event, _slice, moved) {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files || []).filter(f => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(uploadFile);
        return true;
      },
      /* Paste image files */
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files || []).filter(f => f.type.startsWith("image/"));
        if (!files.length) return false;
        files.forEach(uploadFile);
        return true;
      },
    },
    onUpdate({ editor: e }) {
      onChange?.(e.getHTML());
    },
  });

  editorRef.current = editor;

  if (!editor) return null;

  const inTable      = editor.isActive("table");
  const headingLevel = [1, 2, 3].find(n => editor.isActive("heading", { level: n })) || 0;

  function closePopover() { setOpenPopover(null); }
  function togglePopover(name) { setOpenPopover(v => v === name ? null : name); }

  function insertLink() {
    if (!linkHref) return;
    const href = /^https?:\/\//.test(linkHref) ? linkHref : `https://${linkHref}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkHref(""); closePopover();
  }
  function insertYoutube() {
    if (!ytUrl) return;
    editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run();
    setYtUrl(""); closePopover();
  }
  function insertImgUrl() {
    if (!imgUrl) return;
    editor.chain().focus().setImage({ src: imgUrl, alt: "", align: "center" }).run();
    setImgUrl(""); closePopover();
  }

  /* Drag-over indicator */
  function onWrapDragOver(e) {
    const hasImg = Array.from(e.dataTransfer.items || []).some(i => i.kind === "file" && i.type.startsWith("image/"));
    if (hasImg) { e.preventDefault(); setIsDragOver(true); }
  }
  function onWrapDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  }

  return (
    <div
      className={`relative flex flex-col overflow-visible rounded-xl border transition-all ${isDragOver ? "border-green-400 ring-2 ring-green-300/40" : "border-gray-200 shadow-sm"}`}
      onDragOver={onWrapDragOver}
      onDragLeave={onWrapDragLeave}
      onDrop={() => setIsDragOver(false)}
    >

      {/* ── Drop overlay ── */}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 rounded-xl bg-green-50/90 backdrop-blur-sm">
          <Upload size={40} className="text-green-600" />
          <p className="text-sm font-bold text-green-700">Drop to upload &amp; insert</p>
        </div>
      )}

      {/* ── Upload spinner ── */}
      {uploading && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm">
          <Loader2 size={28} className="animate-spin text-green-600" />
          <p className="text-xs font-semibold text-gray-600">Uploading to ImageKit…</p>
        </div>
      )}

      {/* ══════════ Toolbar ══════════ */}
      <div className="sticky top-0 z-30 flex items-center gap-0.5 flex-wrap border-b border-gray-100 bg-white/95 px-2 py-1.5 backdrop-blur-sm shadow-sm rounded-t-xl">

        {/* Undo / Redo */}
        <TBtn onPress={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><Undo2 size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo2 size={14} /></TBtn>
        <Sep />

        {/* Block type */}
        <select
          value={headingLevel}
          onChange={(e) => {
            const v = Number(e.target.value);
            v === 0
              ? editor.chain().focus().setParagraph().run()
              : editor.chain().focus().toggleHeading({ level: v }).run();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 shrink-0 rounded border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value={0}>Paragraph</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
        <Sep />

        {/* Text format */}
        <TBtn onPress={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      title="Bold (Ctrl+B)"><Bold size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    title="Italic (Ctrl+I)"><Italic size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><UIcon size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive("strike")}    title="Strikethrough"><Strikethrough size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive("code")}      title="Inline Code"><Code size={14} /></TBtn>
        <Sep />

        {/* Alignment */}
        <TBtn onPress={() => editor.chain().focus().setTextAlign("left").run()}    active={editor.isActive({ textAlign: "left" })}    title="Align Left"><AlignLeft size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().setTextAlign("center").run()}  active={editor.isActive({ textAlign: "center" })}  title="Center"><AlignCenter size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().setTextAlign("right").run()}   active={editor.isActive({ textAlign: "right" })}   title="Align Right"><AlignRight size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify size={14} /></TBtn>
        <Sep />

        {/* Lists */}
        <TBtn onPress={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  title="Bullet List"><List size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered size={14} /></TBtn>
        <Sep />

        {/* Blocks */}
        <TBtn onPress={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().toggleCodeBlock().run()}  active={editor.isActive("codeBlock")}  title="Code Block"><Code2 size={14} /></TBtn>
        <TBtn onPress={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14} /></TBtn>
        <Sep />

        {/* Text color */}
        <div className="relative shrink-0" title="Text Color">
          <TBtn onPress={() => {}} title="Text Color"><Palette size={14} /></TBtn>
          <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </div>

        {/* Highlight */}
        <div className="relative shrink-0" title="Highlight">
          <TBtn onPress={() => {}} active={editor.isActive("highlight")} title="Highlight"><Highlighter size={14} /></TBtn>
          <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            defaultValue="#fef08a"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
        </div>
        <Sep />

        {/* Link */}
        <div className="relative shrink-0">
          <TBtn onPress={() => togglePopover("link")} active={editor.isActive("link") || openPopover === "link"} title="Link"><Link2 size={14} /></TBtn>
          {openPopover === "link" && (
            <Popover title="Insert Link" onClose={closePopover}>
              <input autoFocus type="url" placeholder="https://example.com" value={linkHref}
                onChange={(e) => setLinkHref(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertLink()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500" />
              <div className="mt-2 flex gap-2">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
                  className="flex-1 rounded-lg bg-green-600 py-1.5 text-xs font-bold text-white hover:bg-green-500">Insert</button>
                {editor.isActive("link") && (
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetLink().run(); closePopover(); }}
                    className="flex-1 rounded-lg bg-red-50 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">Remove</button>
                )}
              </div>
            </Popover>
          )}
        </div>

        {/* Image */}
        <div className="relative shrink-0">
          <TBtn onPress={() => togglePopover("img")} active={openPopover === "img"} title="Insert Image"><ImageLucide size={14} /></TBtn>
          {openPopover === "img" && (
            <Popover title="Insert Image" onClose={closePopover} width="w-80">
              {/* Upload zone */}
              <button type="button"
                onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-4 text-xs text-gray-500 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition disabled:opacity-50">
                {uploading
                  ? <><Loader2 size={14} className="animate-spin text-green-600" /> Uploading to ImageKit…</>
                  : <><Upload size={14} /> <span><span className="font-semibold text-gray-700">Click to upload</span> or drag &amp; drop</span></>}
              </button>

              {/* Divider */}
              <div className="my-3 flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 shrink-0">or paste image URL</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* URL input */}
              <input autoFocus type="url" placeholder="https://example.com/image.jpg" value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertImgUrl()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200" />

              {/* Live preview */}
              {imgUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={imgUrl} alt="preview" className="max-h-32 w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
              )}

              {/* Insert button */}
              {imgUrl && (
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertImgUrl(); }}
                  className="mt-2 w-full rounded-lg bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-500 transition">
                  Insert Image
                </button>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { uploadFile(e.target.files?.[0]); closePopover(); }} />
            </Popover>
          )}
        </div>

        {/* YouTube */}
        <div className="relative shrink-0">
          <TBtn onPress={() => togglePopover("yt")} active={openPopover === "yt"} title="Embed YouTube"><Video size={14} /></TBtn>
          {openPopover === "yt" && (
            <Popover title="Embed YouTube / Video" onClose={closePopover} width="w-80">
              <p className="mb-2 text-[10px] text-gray-400">Paste a YouTube, Vimeo, or direct video URL</p>
              <input autoFocus type="url" placeholder="https://youtube.com/watch?v=…" value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertYoutube()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertYoutube(); }}
                disabled={!ytUrl}
                className="mt-2 w-full rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-40 disabled:pointer-events-none">
                Embed Video
              </button>
            </Popover>
          )}
        </div>

        {/* Table */}
        <div className="relative shrink-0">
          <TBtn onPress={() => togglePopover("table")} active={inTable || openPopover === "table"} title="Table"><TableIcon size={14} /></TBtn>
          {openPopover === "table" && (
            <Popover title={inTable ? "Edit Table" : "Insert Table"} onClose={closePopover}>
              {!inTable ? (
                <div className="grid grid-cols-2 gap-2">
                  {[[3,3],[3,4],[4,4],[4,5]].map(([r,c]) => (
                    <button key={`${r}x${c}`} type="button"
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run(); closePopover(); }}
                      className="rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition">
                      {r} × {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase text-gray-400">Rows</p>
                    <div className="flex gap-1.5">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200">+ Before</button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}  className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200">+ After</button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}    className="flex-1 rounded bg-red-50 py-1.5 text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase text-gray-400">Columns</p>
                    <div className="flex gap-1.5">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200">+ Before</button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}  className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200">+ After</button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}    className="flex-1 rounded bg-red-50 py-1.5 text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); closePopover(); }}
                    className="w-full rounded bg-red-600 py-1.5 font-bold text-white hover:bg-red-500">Delete Table</button>
                </div>
              )}
            </Popover>
          )}
        </div>

      </div>
      {/* ══════════ End Toolbar ══════════ */}

      {/* ── Editor content area (white document) ── */}
      <div className="bg-white rounded-b-xl overflow-visible">
        <EditorContent editor={editor} />
      </div>

      {/* ── Hint bar ── */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-1.5 rounded-b-xl">
        <p className="text-[10px] text-gray-400">
          💡 Drop or paste an image anywhere · Click image to align, resize, caption
        </p>
        <p className="text-[10px] text-gray-400">
          {editor.storage?.characterCount?.characters?.() ?? 0} chars
        </p>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        .tiptap-doc .ProseMirror { outline: none; }

        /* Typography */
        .tiptap-doc h1 { font-size: 2rem; font-weight: 800; line-height: 1.2; margin: 1.5rem 0 .75rem; color: #111827; }
        .tiptap-doc h2 { font-size: 1.5rem; font-weight: 700; border-left: 3px solid #16a34a; padding-left: .75rem; margin: 1.5rem 0 .5rem; color: #1f2937; }
        .tiptap-doc h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 .5rem; color: #374151; }
        .tiptap-doc p  { margin: .75rem 0; line-height: 1.75; color: #374151; }
        .tiptap-doc p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: #9ca3af;
          pointer-events: none; float: left; height: 0;
        }

        /* Links */
        .tiptap-doc a { color: #15803d; text-decoration: underline; }

        /* Lists */
        .tiptap-doc ul { list-style: disc; padding-left: 1.5rem; margin: .75rem 0; }
        .tiptap-doc ol { list-style: decimal; padding-left: 1.5rem; margin: .75rem 0; }
        .tiptap-doc li { margin: .25rem 0; line-height: 1.7; }

        /* Blockquote */
        .tiptap-doc blockquote {
          border-left: 3px solid #16a34a; padding: .5rem 1rem;
          margin: 1rem 0; color: #6b7280; background: #f9fafb; border-radius: 0 .375rem .375rem 0;
        }

        /* Code */
        .tiptap-doc pre { background: #1e293b; color: #e2e8f0; border-radius: .5rem; padding: 1rem 1.25rem; overflow-x: auto; margin: 1rem 0; font-size: .875rem; }
        .tiptap-doc code:not(pre code) { background: #f3f4f6; color: #dc2626; padding: .15em .4em; border-radius: .25rem; font-size: .875em; }

        /* HR */
        .tiptap-doc hr { border: none; border-top: 2px solid #f3f4f6; margin: 2rem 0; }

        /* Tables */
        .tiptap-doc table { border-collapse: collapse; width: 100%; margin: 1rem 0; table-layout: fixed; }
        .tiptap-doc td, .tiptap-doc th { border: 1px solid #e5e7eb; padding: .5rem .75rem; vertical-align: top; position: relative; min-width: 60px; }
        .tiptap-doc th { background: #f9fafb; font-weight: 700; text-align: left; color: #374151; }
        .tiptap-doc tr:nth-child(even) td { background: #fafafa; }
        .tiptap-doc .selectedCell:after { content: ""; position: absolute; inset: 0; background: rgba(22,163,74,.12); pointer-events: none; z-index: 2; }
        .tiptap-doc .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #16a34a; cursor: col-resize; z-index: 20; }

        /* YouTube */
        .tiptap-doc iframe { width: 100%; aspect-ratio: 16/9; border-radius: .5rem; margin: 1rem 0; }

        /* Image selection — reset default ProseMirror outline (we use ring) */
        .tiptap-doc .ProseMirror-selectednode { outline: none !important; }
      `}</style>
    </div>
  );
}
