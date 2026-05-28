"use client";

export default function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thank you for subscribing! You'll get daily EV news in your inbox.");
      }}
    >
      <input
        type="email"
        placeholder="Enter your email"
        required
        className="flex-1 rounded-xl bg-white/20 px-4 py-3 text-sm text-white placeholder-green-100 outline-none ring-2 ring-transparent focus:ring-white/50"
      />
      <button
        type="submit"
        className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50"
      >
        Subscribe
      </button>
    </form>
  );
}
