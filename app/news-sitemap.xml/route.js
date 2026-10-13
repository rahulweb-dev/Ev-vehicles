import { NextResponse } from "next/server";

// Old duplicate of /sitemap-news.xml that padded itself with stale articles (Google News
// only accepts the last 2 days). Kept as a permanent redirect so existing Search Console
// submissions follow to the real one.
export function GET(request) {
  return NextResponse.redirect(new URL("/sitemap-news.xml", request.url), 308);
}
