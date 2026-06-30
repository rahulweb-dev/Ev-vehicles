"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [active, setActive]     = useState("");
  const [open, setOpen]         = useState(true);

  useEffect(() => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(content, "text/html");
    const els    = Array.from(doc.querySelectorAll("h2, h3"));
    const items  = els.map((el, i) => ({
      id:    `toc-heading-${i}`,
      text:  el.textContent.trim(),
      level: parseInt(el.tagName[1]),
    }));
    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const domHeadings = document.querySelectorAll("[data-toc-id]");
    if (!domHeadings.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.dataset.tocId);
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    domHeadings.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <aside className="my-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm font-black text-gray-900">
          <List size={16} className="text-green-600" />
          Table of Contents
        </div>
        <span className="text-xs text-gray-400">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <nav className="mt-3">
          <ol className="space-y-1">
            {headings.map(h => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={e => {
                    e.preventDefault();
                    const el = document.querySelector(`[data-toc-id="${h.id}"]`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`block truncate rounded-lg px-3 py-1.5 text-sm transition ${
                    h.level === 3 ? "ml-4" : ""
                  } ${
                    active === h.id
                      ? "bg-green-100 font-semibold text-green-700"
                      : "text-gray-600 hover:bg-white hover:text-green-600"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  );
}
