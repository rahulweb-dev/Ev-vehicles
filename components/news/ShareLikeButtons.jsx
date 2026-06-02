"use client";

import { useState, useEffect } from "react";
import { FiHeart, FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { FaXTwitter, FaWhatsapp, FaFacebookF } from "react-icons/fa6";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export default function ShareLikeButtons({ slug, title, url: propUrl, compact = false }) {
  const storageKey = `ev-like-${slug}`;
  const [liked, setLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const pageUrl = propUrl || `${SITE_URL}/news/${slug}`;

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl });
        return;
      } catch {}
    }
    setShowShare((v) => !v);
  };

  const copyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShare(false); }, 2000);
    } catch {}
  };

  const shareItems = [
    {
      label: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`,
      icon: <FaXTwitter size={14} />,
      color: "hover:text-black",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + pageUrl)}`,
      icon: <FaWhatsapp size={14} />,
      color: "hover:text-green-500",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      icon: <FaFacebookF size={14} />,
      color: "hover:text-blue-600",
    },
  ];

  const sz = compact ? 13 : 15;

  return (
    <div
      className="relative flex items-center gap-2"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Like button */}
      <button
        onClick={toggleLike}
        aria-label={liked ? "Unlike" : "Like this article"}
        className={`flex items-center gap-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
          compact ? "px-2 py-1" : "px-3 py-1.5"
        } ${
          liked
            ? "bg-red-50 text-red-500"
            : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400"
        }`}
      >
        <FiHeart
          size={sz}
          className={`transition-all duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
        />
        {!compact && <span>{liked ? "Liked" : "Like"}</span>}
      </button>

      {/* Share button */}
      <button
        onClick={handleShare}
        aria-label="Share this article"
        className={`flex items-center gap-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-500 transition hover:bg-green-50 hover:text-green-600 ${
          compact ? "px-2 py-1" : "px-3 py-1.5"
        }`}
      >
        <FiShare2 size={sz} />
        {!compact && <span>Share</span>}
      </button>

      {/* Share dropdown */}
      {showShare && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare(false); }}
          />
          <div className="absolute bottom-full right-0 z-50 mb-2 min-w-47 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            {shareItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${item.color}`}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-green-600 border-t border-gray-50"
            >
              {copied
                ? <FiCheck size={14} className="text-green-500" />
                : <FiCopy size={14} />
              }
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
