import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect    from "@/lib/mongodb";
import Lead         from "@/lib/models/Lead";
import Subscriber   from "@/lib/models/Subscriber";
import Campaign     from "@/lib/models/Campaign";
import Article      from "@/lib/models/Article";

export const revalidate = 0;

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await dbConnect();

  const now      = new Date();
  const since24h = new Date(now - 24 * 60 * 60 * 1000);
  const soon     = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [leads, newSubs, campaigns, scheduledArticles] = await Promise.all([
    Lead.find({ createdAt: { $gte: since24h } })
      .sort({ createdAt: -1 }).limit(10)
      .select("name vehicleName intent city createdAt").lean(),

    Subscriber.countDocuments({ createdAt: { $gte: since24h }, status: "active" }),

    Campaign.find({ sentAt: { $gte: since24h } })
      .sort({ sentAt: -1 }).limit(5)
      .select("name subject sentCount openCount clickCount sentAt").lean(),

    Article.find({ scheduledAt: { $gte: now, $lte: soon }, status: "draft" })
      .sort({ scheduledAt: 1 }).limit(5)
      .select("title scheduledAt").lean(),
  ]);

  return NextResponse.json({ leads, newSubs, campaigns, scheduledArticles, fetchedAt: now });
}
