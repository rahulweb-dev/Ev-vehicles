"use client";

export default function ContactForm() {
  function handleSubmit(e) {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you within 24-48 hours.");
    e.target.reset();
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name *</label>
          <input
            type="text"
            placeholder="Your full name"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-green-400 focus:ring-green-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address *</label>
          <input
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
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400"
        >
          <option value="">Select a subject</option>
          <option value="press">Press Release / Story Tip</option>
          <option value="advertising">Advertising Partnership</option>
          <option value="correction">Article Correction</option>
          <option value="general">General Query</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message *</label>
        <textarea
          rows={5}
          placeholder="Write your message here..."
          required
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-green-400 focus:ring-green-100"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 active:scale-95"
      >
        Send Message
      </button>
    </form>
  );
}
