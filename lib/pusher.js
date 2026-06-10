import Pusher from "pusher";

let server = null;
export function getPusherServer() {
  if (!server) {
    server = new Pusher({
      appId:   process.env.PUSHER_APP_ID,
      key:     process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret:  process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
      useTLS:  true,
    });
  }
  return server;
}
