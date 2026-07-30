import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// Domains that are always valid service endpoints — their root 404s but paths work
const SKIP_DOMAINS = new Set([
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "www.googletagmanager.com",
  "googletagmanager.com",
  "pagead2.googlesyndication.com",
  "googlesyndication.com",
  "www.google-analytics.com",
  "google-analytics.com",
  "ik.imagekit.io",
  "imagekit.io",
  "connect.facebook.net",
  "platform.twitter.com",
  "www.google.com",
  "accounts.google.com",
]);

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get("url");
  if (!pageUrl) return NextResponse.json({ error: "url param required" }, { status: 400 });

  // Fetch the page HTML
  let html;
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EVRadar-LinkChecker/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch page: ${e.message}` }, { status: 422 });
  }

  // Extract all href links
  const hrefRe = /href=["']([^"'#\s][^"'\s]*)["']/gi;
  const rawLinks = [];
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    rawLinks.push(m[1]);
  }

  // Extract link text for context
  const anchorRe = /<a[^>]+href=["']([^"'#\s][^"'\s]*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const textMap = {};
  while ((m = anchorRe.exec(html)) !== null) {
    const u = m[1];
    const t = m[2].replace(/<[^>]+>/g, "").trim().slice(0, 60);
    if (t) textMap[u] = t;
  }

  // Resolve relative URLs and deduplicate
  const base = new URL(pageUrl);
  const links = [...new Set(rawLinks
    .map(href => {
      try {
        const u = new URL(href, base);
        // Only check http/https
        if (!["http:", "https:"].includes(u.protocol)) return null;
        // Skip known service domains — their roots 404 but actual endpoints work
        if (SKIP_DOMAINS.has(u.hostname)) return null;
        return u.href;
      } catch { return null; }
    })
    .filter(Boolean)
  )].slice(0, 100); // cap at 100 links

  // Check each link
  const results = await Promise.allSettled(
    links.map(async url => {
      try {
        const r = await fetch(url, {
          method: "HEAD",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; EVRadar-LinkChecker/1.0)" },
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
        });
        return { url, status: r.status, text: textMap[url] || null };
      } catch {
        // Try GET if HEAD fails (some servers block HEAD)
        try {
          const r = await fetch(url, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; EVRadar-LinkChecker/1.0)" },
            redirect: "follow",
            signal: AbortSignal.timeout(8000),
          });
          return { url, status: r.status, text: textMap[url] || null };
        } catch {
          return { url, status: 0, text: textMap[url] || null };
        }
      }
    })
  );

  const checked = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { url: links[i], status: 0, text: textMap[links[i]] || null }
  );

  return NextResponse.json({ links: checked, scannedUrl: pageUrl });
}
