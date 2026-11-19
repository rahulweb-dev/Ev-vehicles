import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";
import SocialAccount from "@/lib/models/SocialAccount";
import SocialEvent from "@/lib/models/SocialEvent";
import "@/lib/models/User"; // registers the model for populate
import { publicAccount } from "@/lib/social/accounts";
import { GRAPH } from "@/lib/social/meta";
import { getAppCreds } from "@/lib/social/metaAuth";
import { getIgAppCreds } from "@/lib/social/instagramAuth";

// GET — the logged-in user's connected accounts (+ recent alerts). Admin: ?all=1 lists every user's accounts.
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await dbConnect();
  const me = auth.user;
  const all = new URL(request.url).searchParams.get("all") === "1" && me.role === "admin";
  const [accounts, events, fb, ig] = await Promise.all([
    all ? SocialAccount.find({}).sort({ platform: 1, createdAt: 1 }).populate({ path: "owner", select: "name email role" }).lean()
      : SocialAccount.find({ owner: me.id }).sort({ platform: 1, createdAt: 1 }).lean(),
    all ? [] : SocialEvent.find({ owner: me.id }).sort({ createdAt: -1 }).limit(20).lean(),
    getAppCreds(), getIgAppCreds(),
  ]);
  if (events.some((e) => !e.read)) await SocialEvent.updateMany({ owner: me.id, read: false }, { $set: { read: true } });
  return NextResponse.json({
    accounts: accounts.map((a) => publicAccount(a, all ? a.owner : null)),
    events: events.map((e) => ({ platform: e.platform, kind: e.kind, text: e.text, sender: e.senderName || "", at: e.at, read: e.read })),
    available: { facebook: !!(fb.appId && fb.appSecret), instagram: !!(ig.igAppId && ig.igAppSecret) },
  });
}

// DELETE ?id= — disconnect one of your accounts (admin can disconnect anyone's)
export async function DELETE(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const id = new URL(request.url).searchParams.get("id");
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await dbConnect();
  const a = await SocialAccount.findOne({ _id: id, ...(auth.user.role === "admin" ? {} : { owner: auth.user.id }) });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Stop webhooks for a Facebook Page if no other connection of it remains
  if (a.platform === "facebook" && !(await SocialAccount.exists({ _id: { $ne: a._id }, externalId: a.externalId }))) {
    await fetch(`${GRAPH}/${a.externalId}/subscribed_apps?access_token=${encodeURIComponent(decrypt(a.token))}`, { method: "DELETE", signal: AbortSignal.timeout(10000) }).catch(() => {});
  }
  await a.deleteOne();
  await SocialEvent.updateMany({ owner: a.owner, accountExternalId: a.externalId }, { $set: { read: true } });
  return NextResponse.json({ success: true });
}
