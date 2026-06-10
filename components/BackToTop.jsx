"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{ position: "fixed", bottom: "170px", right: "16px", zIndex: 9998 }}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 hover:scale-110"
    >
      <ArrowUp size={18} />
    </button>
  );
}
