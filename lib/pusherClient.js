import PusherClient from "pusher-js";

let client = null;
export function getPusherClient() {
  if (typeof window === "undefined") return null;
  if (!client) {
    client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
    });
  }
  return client;
}
