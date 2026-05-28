"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AdminBlogsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 pt-20 lg:pt-8">
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 mb-4">
          <BookOpen size={28} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-black text-white">Blog Management</h1>
        <p className="mt-2 text-gray-400 text-sm">
          Blog management is handled through the Articles section. Create articles with long-form guides and tips —
          they automatically appear in the /blogs section based on category.
        </p>
        <Link
          href="/admin/articles/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition"
        >
          Create New Article
        </Link>
      </div>
    </div>
  );
}
