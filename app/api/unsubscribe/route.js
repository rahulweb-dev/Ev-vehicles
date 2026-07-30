import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import dbConnect    from "@/lib/mongodb";
import Subscriber   from "@/lib/models/Subscriber";

function verifyToken(token, email) {
  const expected = createHmac("sha256", process.env.JWT_SECRET || "ev-radar-secret")
    .update(email.toLowerCase().trim())
    .digest("base64url");
  return token === expected;
}

// POST /api/unsubscribe  { token, email }
export async function POST(request) {
  try {
    const { token, email } = await request.json();
    if (!token || !email) {
      return NextResponse.json({ error: "Missing token or email" }, { status: 400 });
    }
    if (!verifyToken(token, email)) {
      return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 403 });
    }

    await dbConnect();
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { status: "unsubscribed" }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/unsubscribe]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/unsubscribe?t=TOKEN&e=EMAIL_B64  (one-click from email clients that support it)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");
  const emailB64 = searchParams.get("e");
  if (!token || !emailB64) {
    return NextResponse.redirect(new URL("/unsubscribe", request.url));
  }
  try {
    const email = Buffer.from(emailB64, "base64url").toString();
    if (!verifyToken(token, email)) {
      return NextResponse.redirect(new URL("/unsubscribe?error=1", request.url));
    }
    await dbConnect();
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { status: "unsubscribed" }
    );
    return NextResponse.redirect(new URL("/unsubscribe?done=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/unsubscribe?error=1", request.url));
  }
}
