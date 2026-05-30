"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ev_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("ev_cookie_consent", "true");
    document.cookie = "ev_cookie_consent=true; max-age=31536000; path=/; SameSite=Lax";
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("ev_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 text-white shadow-2xl border-t-2 border-green-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300">
          <p>
            We use cookies to enhance your experience, serve personalised ads, and analyse traffic.
            By clicking <strong className="text-white">Accept All</strong>, you consent to our use of cookies.{" "}
            <Link href="/privacy-policy" className="text-green-400 underline hover:text-green-300">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm border border-gray-500 text-gray-300 rounded-lg hover:border-gray-300 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
