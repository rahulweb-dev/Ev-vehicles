import { NextResponse }   from "next/server";
import dbConnect          from "@/lib/mongodb";
import Article            from "@/lib/models/Article";
import SocialSettings     from "@/lib/models/SocialSettings";
import { requireAuth }    from "@/lib/auth";
import { decrypt }        from "@/lib/encrypt";

// POST /api/admin/test-social
// Posts your most recent published article to Facebook as a live test
export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // ── 1. Check ENCRYPTION_KEY ──────────────────────────────────
    const encKey = process.env.ENCRYPTION_KEY?.trim() ?? "";
    if (encKey.length !== 64) {
      return NextResponse.json({
        error: `ENCRYPTION_KEY is missing or wrong length (got ${encKey.length} chars, need 64). Add it to .env.local and restart the server.`,
      }, { status: 500 });
    }

    await dbConnect();

    // ── 2. Load Facebook settings ────────────────────────────────
    const setting = await SocialSettings.findOne({ platform: "facebook" }).lean();

    if (!setting) {
      return NextResponse.json({
        error: "No Facebook settings found. Go to Admin → Social Settings, fill in your credentials and click Save.",
      }, { status: 400 });
    }

    if (!setting.enabled) {
      return NextResponse.json({
        error: "Facebook is disabled. Go to Admin → Social Settings and toggle Facebook ON, then Save.",
      }, { status: 400 });
    }

    const raw = setting.credentials ?? {};
    const accessToken = decrypt(raw.accessToken || "");
    const pageId      = decrypt(raw.pageId      || "");

    if (!accessToken) {
      return NextResponse.json({
        error: "Facebook Page Access Token is empty. Re-enter it in Admin → Social Settings and Save.",
      }, { status: 400 });
    }
    if (!pageId) {
      return NextResponse.json({
        error: "Facebook Page ID is empty. Re-enter it in Admin → Social Settings and Save.",
      }, { status: 400 });
    }

    // ── 3. Pick the most recent published article ────────────────
    const article = await Article.findOne({ status: "published" })
      .sort({ publishedAt: -1 })
      .select("title excerpt slug image category")
      .lean();

    if (!article) {
      return NextResponse.json({
        error: "No published articles found. Publish at least one article first.",
      }, { status: 400 });
    }

    const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
    const articleUrl = `${siteUrl}/news/${article.slug}`;

    const message = [
      `⚡ ${article.title}`,
      "",
      article.excerpt,
      "",
      `🔗 Read more: ${articleUrl}`,
      "",
      "#EVNews #ElectricVehicles #India #EV #EVRadar",
    ].join("\n");

    // ── 4. Post to Facebook ──────────────────────────────────────
    const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        link:         articleUrl,
        access_token: accessToken,
      }),
    });

    const fbData = await fbRes.json();

    if (fbData.error) {
      return NextResponse.json({
        error:   `Facebook API error: ${fbData.error.message}`,
        code:    fbData.error.code,
        subcode: fbData.error.error_subcode,
      }, { status: 400 });
    }

    if (!fbRes.ok) {
      return NextResponse.json({
        error: `Facebook API returned HTTP ${fbRes.status}`,
      }, { status: 400 });
    }

    return NextResponse.json({
      success:  true,
      postId:   fbData.id,
      article:  article.title,
      message:  `✅ Posted to your Facebook Page!`,
      viewPost: `https://www.facebook.com/${fbData.id.replace("_", "/posts/")}`,
    });

  } catch (err) {
    console.error("[test-social]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
