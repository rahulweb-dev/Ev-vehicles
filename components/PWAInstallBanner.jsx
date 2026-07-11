"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

export default function PWAInstallBanner() {
  const [prompt,    setPrompt]    = useState(null);
  const [visible,   setVisible]   = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios,       setIos]       = useState(false);
  const [iosBanner, setIosBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed within last 7 days
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios/i.test(navigator.userAgent);
    if (isIos) {
      setIos(true);
      // Show iOS banner after 5 seconds
      setTimeout(() => setIosBanner(true), 5000);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Show banner after 8 seconds on page
      setTimeout(() => setVisible(true), 8000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setInstalled(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    setIosBanner(false);
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
  }

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setVisible(false);
  }

  // iOS instructions banner
  if (ios && iosBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[300] sm:left-auto sm:right-4 sm:w-80">
        <div className="relative rounded-2xl bg-gray-900 text-white p-4 shadow-2xl">
          <button onClick={dismiss} className="absolute right-3 top-3 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="font-black text-sm">Add to Home Screen</p>
              <p className="text-[11px] text-gray-400">Get the EV News India app</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Tap <strong className="text-white">Share</strong> <span className="inline-block bg-gray-700 rounded px-1.5 py-0.5">⬆</span> then <strong className="text-white">"Add to Home Screen"</strong> to install the app.
          </p>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-8 h-0 w-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900" />
        </div>
      </div>
    );
  }

  if (!visible || !prompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] safe-area-pb">
      <div className="border-t border-gray-100 bg-white shadow-2xl">
        <div className="mx-auto flex max-w-lg items-center gap-4 px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-2xl shadow">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-sm">Install EV News India</p>
            <p className="text-xs text-gray-500 truncate">Get instant EV news, alerts &amp; tools — works offline</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={dismiss} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
              <X size={16} />
            </button>
            <button onClick={install}
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-green-700 transition active:scale-95">
              <Download size={13} /> Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
