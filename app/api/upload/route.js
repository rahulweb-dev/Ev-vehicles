import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "/ev-news";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToImageKit(buffer, file.name, folder);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Upload]", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
