"use client";

import Link from "next/link";

export default function OfflineClient() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">📡</div>
      <h1 className="mb-3 text-3xl font-black text-gray-900">You&apos;re offline</h1>
      <p className="mb-8 max-w-md text-gray-500">
        No internet connection detected. Check your network and try again — previously visited pages may still be available.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
