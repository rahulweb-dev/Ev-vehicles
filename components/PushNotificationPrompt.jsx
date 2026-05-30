"use client";
import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotificationPrompt() {
  const [status, setStatus] = useState("idle"); // idle | asking | subscribed | denied | unsupported

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    const saved = localStorage.getItem("ev_push_status");
    if (saved === "subscribed") setStatus("subscribed");
    else if (saved === "denied") setStatus("denied");
    else {
      // Show the prompt after 8 seconds so it doesn't compete with cookie banner
      const timer = setTimeout(() => setStatus("asking"), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        localStorage.setItem("ev_push_status", "denied");
        setStatus("denied");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      localStorage.setItem("ev_push_status", "subscribed");
      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscription failed:", err);
      setStatus("denied");
    }
  };

  const dismiss = () => {
    localStorage.setItem("ev_push_status", "denied");
    setStatus("denied");
  };

  if (status !== "asking") return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="text-3xl select-none">🔔</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Stay updated on EV News!</p>
          <p className="text-gray-500 text-xs mt-1">
            Get instant Chrome notifications when we publish new EV launches, prices, and reviews — even when this tab is closed.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={subscribe}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              Allow Notifications
            </button>
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 text-xs py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
