import { requireAuth }    from "@/lib/requireAuth";
import dbConnect          from "@/lib/mongodb";
import PushSubscription   from "@/lib/models/PushSubscription";
import webpush            from "web-push";

export const maxDuration = 60;

function setupWebPush() {
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mail = process.env.VAPID_EMAIL || "mailto:admin@evradar.in";
  if (!pub || !priv) throw new Error("VAPID keys not configured");
  webpush.setVapidDetails(mail, pub, priv);
}

export async function POST(request) {
  const authErr = await requireAuth(request);
  if (authErr) return authErr;

  const { title, body, url, icon, image, badge } = await request.json();
  if (!title || !body) return Response.json({ error: "title and body required" }, { status: 400 });

  try {
    setupWebPush();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  await dbConnect();
  const subs = await PushSubscription.find({}).lean();
  if (!subs.length) return Response.json({ success: true, sent: 0, message: "No subscribers" });

  const payload = JSON.stringify({
    title,
    body,
    url:   url   || "/",
    icon:  icon  || "/images/logo.png",
    image: image || undefined,
    badge: badge || "/images/logo.png",
  });

  let sent = 0, failed = 0;
  const stale = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          stale.push(sub.endpoint);
        }
        failed++;
      }
    })
  );

  /* clean up expired subscriptions */
  if (stale.length) {
    await PushSubscription.deleteMany({ endpoint: { $in: stale } });
  }

  return Response.json({ success: true, sent, failed, removed: stale.length, total: subs.length });
}
