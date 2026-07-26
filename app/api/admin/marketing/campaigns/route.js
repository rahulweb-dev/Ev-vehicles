import { NextResponse } from "next/server";
import { requireAuth }  from "@/lib/auth";
import dbConnect        from "@/lib/mongodb";
import Campaign         from "@/lib/models/Campaign";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await dbConnect();
  const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ campaigns });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { name, subject, previewText, html, template, channel } = body;

  if (!name || !subject || !html) {
    return NextResponse.json({ error: "name, subject and html are required" }, { status: 400 });
  }

  await dbConnect();
  const campaign = await Campaign.create({ name, subject, previewText, html, template: template || "custom", channel: channel || "email" });
  return NextResponse.json({ success: true, campaign }, { status: 201 });
}
