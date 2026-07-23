"use client";
import Link from "next/link";

export default function BikePageError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Page Unavailable</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        This electric bike page couldn&apos;t be loaded. It may have been updated or temporarily unavailable.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition text-sm"
        >
          Try Again
        </button>
        <Link
          href="/bikes"
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
        >
          Browse Electric Bikes
        </Link>
      </div>
    </div>
  );
}
