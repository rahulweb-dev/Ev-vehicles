import Image from "next/image";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";

const categoryColors = {
  cars: "bg-blue-100 text-blue-700",
  bikes: "bg-orange-100 text-orange-700",
  commercial: "bg-purple-100 text-purple-700",
  charging: "bg-green-100 text-green-700",
};

export default function NewsCard({ article, variant = "default" }) {
  if (variant === "featured") {
    return <FeaturedNewsCard article={article} />;
  }

  if (variant === "horizontal") {
    return <HorizontalNewsCard article={article} />;
  }

  return <DefaultNewsCard article={article} />;
}

function DefaultNewsCard({ article }) {
  const colorClass = categoryColors[article.category] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute left-3 top-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${colorClass}`}>
              {article.category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition group-hover:text-green-600">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{article.excerpt}</p>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock3 size={13} />
              <span>{article.readTime} read</span>
            </div>
            <span>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedNewsCard({ article }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-3xl">
        <div className="relative h-[400px] md:h-[500px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute left-5 top-5 flex gap-2">
            <span className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white">
              FEATURED
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold capitalize text-white backdrop-blur-xl">
              {article.category}
            </span>
          </div>

          <div className="absolute bottom-0 p-6 md:p-8">
            <h2 className="text-2xl font-black leading-tight text-white md:text-4xl">
              {article.title}
            </h2>
            <p className="mt-3 line-clamp-2 text-gray-300 md:text-base">{article.excerpt}</p>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>{article.author}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock3 size={14} />
                {article.readTime}
              </div>
              <span>·</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-400 transition group-hover:gap-4">
              Read Full Story <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function HorizontalNewsCard({ article }) {
  const colorClass = categoryColors[article.category] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md">
        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="128px"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${colorClass}`}>
            {article.category}
          </span>
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900 transition group-hover:text-green-600">
            {article.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
            <Clock3 size={11} />
            <span>{article.readTime}</span>
            <span>·</span>
            <span>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
