"use client";

import { useState, useEffect, useRef } from "react";
import { FiHeart, FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import {
  FaXTwitter, FaWhatsapp, FaFacebookF,
  FaLinkedin, FaPinterest, FaInstagram, FaTelegram,
} from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export default function ShareLikeButtons({ slug, title, url: propUrl, image, compact = false, initialLikes = 0 }) {
  const storageKey = `ev-like-${slug}`;
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(initialLikes);
  const [showShare,  setShowShare]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [igCopied,   setIgCopied]   = useState(false);
  const dropdownRef                  = useRef(null);
  const pageUrl = propUrl || `${SITE_URL}/news/${slug}`;

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  /* close dropdown when clicking outside */
  useEffect(() => {
    if (!showShare) return;
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setShowShare(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShare]);

  const toggleLike = (e) => {
    e.preventDefault(); e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(n => Math.max(0, n + (next ? 1 : -1)));
    localStorage.setItem(storageKey, next ? "1" : "0");
    // persist to server (fire-and-forget)
    fetch(`/api/articles/${slug}/like`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: next ? "like" : "unlike" }),
    }).catch(() => {});
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) {
      try { await navigator.share({ title, url: pageUrl }); return; } catch {}
    }
    setShowShare(v => !v);
  };

  const copyLink = async (e) => {
    e?.preventDefault(); e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShare(false); }, 2000);
    } catch {}
  };

  const copyForInstagram = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await navigator.clipboard.writeText(pageUrl);
      setIgCopied(true);
      setTimeout(() => { setIgCopied(false); setShowShare(false); }, 2500);
    } catch {}
  };

  const enc = encodeURIComponent;

  const shareItems = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(title + "\n" + pageUrl)}`,
      icon: <FaWhatsapp size={14} />,
      bg:   "hover:bg-green-50",
      color:"hover:text-green-600",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(pageUrl)}`,
      icon: <FaFacebookF size={14} />,
      bg:   "hover:bg-blue-50",
      color:"hover:text-blue-600",
    },
    {
      label: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(pageUrl)}`,
      icon: <FaXTwitter size={14} />,
      bg:   "hover:bg-gray-100",
      color:"hover:text-black",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(pageUrl)}`,
      icon: <FaLinkedin size={14} />,
      bg:   "hover:bg-blue-50",
      color:"hover:text-blue-700",
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${enc(pageUrl)}&description=${enc(title)}${image ? `&media=${enc(image)}` : ""}`,
      icon: <FaPinterest size={14} />,
      bg:   "hover:bg-red-50",
      color:"hover:text-red-600",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(pageUrl)}&text=${enc(title)}`,
      icon: <FaTelegram size={14} />,
      bg:   "hover:bg-sky-50",
      color:"hover:text-sky-500",
    },
    {
      label: "Gmail",
      href: `https://mail.google.com/mail/?view=cm&su=${enc(title)}&body=${enc("Check this out: " + pageUrl)}`,
      icon: <SiGmail size={14} />,
      bg:   "hover:bg-red-50",
      color:"hover:text-red-500",
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
        <FiHeart size={sz}
          className={`transition-all duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
        />
        {!compact && <span>{liked ? "Liked" : "Like"}</span>}
        {!compact && likeCount > 0 && (
          <span className="ml-0.5 text-[11px] font-bold opacity-70">{likeCount}</span>
        )}
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
        <div
          ref={dropdownRef}
          className="absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <p className="border-b border-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Share via
          </p>

          {shareItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition ${item.bg} ${item.color}`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}

          {/* Instagram — copy link, then paste */}
          <button
            onClick={copyForInstagram}
            className="flex w-full items-center gap-3 border-t border-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
          >
            <FaInstagram size={14} />
            {igCopied ? "Copied! Paste on Instagram" : "Instagram"}
          </button>

          {/* Copy Link */}
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-3 border-t border-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-green-600"
          >
            {copied
              ? <FiCheck size={14} className="text-green-500" />
              : <FiCopy size={14} />
            }
            {copied ? "Link Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
