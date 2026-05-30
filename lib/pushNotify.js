import webpush from "web-push";
import dbConnect from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushToAll(payload) {
  await dbConnect();
  const subscriptions = await PushSubscription.find({}).lean();

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
      )
    )
  );

  // Remove expired/invalid subscriptions
  const expired = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const status = result.reason?.statusCode;
      if (status === 404 || status === 410) {
        expired.push(subscriptions[i].endpoint);
      }
    }
  });

  if (expired.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: expired } });
  }
}
