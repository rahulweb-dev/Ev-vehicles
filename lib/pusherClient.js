import PusherClient from "pusher-js";

let client = null;
export function getPusherClient() {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (!key) return null; // skip — no infinite retry on missing key
  if (!client) {
    client = new PusherClient(key, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
    });
  }
  return client;
}
