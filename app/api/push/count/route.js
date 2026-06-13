import dbConnect        from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";

export async function GET() {
  try {
    await dbConnect();
    const count = await PushSubscription.countDocuments();
    return Response.json({ count });
  } catch {
    return Response.json({ count: 0 });
  }
}
