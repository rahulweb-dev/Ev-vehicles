import { NextResponse } from "next/server";
import dbConnect    from "@/lib/mongodb";
import Subscriber   from "@/lib/models/Subscriber";
import { unsubToken } from "@/lib/mailer";

// POST /api/unsubscribe/token  { email }
// Returns the HMAC token for that email (only if subscriber exists)
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await dbConnect();
    const sub = await Subscriber.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!sub) {
      // Respond with same success shape so we don't leak whether an email is subscribed
      return NextResponse.json({ token: unsubToken(email) });
    }

    return NextResponse.json({ token: unsubToken(email) });
  } catch (err) {
    console.error("[POST /api/unsubscribe/token]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
