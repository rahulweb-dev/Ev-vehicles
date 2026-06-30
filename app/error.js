"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 border-2 border-red-100">
          <span className="text-4xl">⚠️</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-gray-500 leading-relaxed">
          We hit an unexpected error. Try refreshing — it usually fixes itself.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <Home size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
