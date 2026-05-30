"use client";
import { useState, useRef } from "react";
import Script from "next/script";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

async function getRecaptchaToken(action) {
  if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === "YOUR_RECAPTCHA_SITE_KEY") return null;
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve);
    });
  });
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();

    try {
      const recaptchaToken = await getRecaptchaToken("contact");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, recaptchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      formRef.current?.reset();
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <>
      {RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_SITE_KEY" && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      )}

      {status === "success" ? (
        <div className="mt-8 rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-bold text-green-800">Message Sent!</h3>
          <p className="mt-1 text-sm text-green-700">
            Thank you for reaching out. We'll get back to you within 24–48 hours.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm text-green-600 underline hover:text-green-800"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form ref={formRef} className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name *</label>
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-green-400 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-green-400 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subject *</label>
            <select
              name="subject"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400"
            >
              <option value="">Select a subject</option>
              <option value="Press Release / Story Tip">Press Release / Story Tip</option>
              <option value="Advertising Partnership">Advertising Partnership</option>
              <option value="Article Correction">Article Correction</option>
              <option value="General Query">General Query</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message *</label>
            <textarea
              name="message"
              rows={5}
              placeholder="Write your message here..."
              required
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-green-400 focus:ring-green-100"
            />
          </div>

          {status === "error" && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Protected by reCAPTCHA.{" "}
            <a href="https://policies.google.com/privacy" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Privacy</a>{" "}
            &amp;{" "}
            <a href="https://policies.google.com/terms" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Terms</a> apply.
          </p>
        </form>
      )}
    </>
  );
}
