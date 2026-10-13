import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";

export async function POST(request) {
  try {
    const subscription = await request.json();
    // Strings only — an object like {"$ne": null} would turn the lookup into a query operator
    if (typeof subscription?.endpoint !== "string" || typeof subscription?.keys?.p256dh !== "string" || typeof subscription?.keys?.auth !== "string") {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    await dbConnect();
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      { endpoint: subscription.endpoint, keys: subscription.keys },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/push/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { endpoint } = await request.json();
    if (typeof endpoint !== "string" || !endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

    await dbConnect();
    await PushSubscription.deleteOne({ endpoint });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/push/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
