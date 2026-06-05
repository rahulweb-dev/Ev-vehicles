import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { requireAuth } from "@/lib/auth";

// POST /api/subscribe — public
export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        await existing.save();
        return NextResponse.json({ success: true, message: "Welcome back! You're re-subscribed." });
      }
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    await Subscriber.create({ email });
    return NextResponse.json(
      { success: true, message: "Subscribed! You'll get daily EV news." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/subscribe — admin only
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit  = parseInt(searchParams.get("limit")  || "100");
    const page   = parseInt(searchParams.get("page")   || "1");
    const status = searchParams.get("status") || "active";
    const skip   = (page - 1) * limit;

    const [subscribers, total, totalAll] = await Promise.all([
      Subscriber.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments({ status }),
      Subscriber.countDocuments({}),
    ]);

    return NextResponse.json({ subscribers, total, totalAll, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
