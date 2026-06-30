"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);

  const encoded  = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Share</span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-black hover:text-white"
      >
        <FaXTwitter size={14} />
      </a>

      <a
        href={`https://wa.me/?text=${encTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-green-500 hover:text-white"
      >
        <FaWhatsapp size={15} />
      </a>

      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-blue-100 hover:text-blue-700"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
      </button>
    </div>
  );
}
