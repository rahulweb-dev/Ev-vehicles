"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed! You'll get daily EV news.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/20 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl">✓</span>
          <p className="text-sm font-semibold text-white">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading"}
          className="
            w-full flex-1
            rounded-xl
            bg-white/20
            px-4 py-3
            text-sm text-white
            placeholder-green-100
            outline-none
            ring-2 ring-transparent
            focus:ring-white/50
            disabled:opacity-60
          "
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="
            w-full sm:w-auto
            rounded-xl
            bg-white
            px-6 py-3
            text-sm font-bold
            text-green-700
            transition
            hover:bg-green-50
            disabled:opacity-60
          "
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-2 text-xs text-red-300">
          {message}
        </p>
      )}
    </div>
  );
}