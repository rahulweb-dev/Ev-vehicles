import { NextResponse } from "next/server";
import { requireAuth }  from "@/lib/auth";
import dbConnect        from "@/lib/mongodb";
import Campaign         from "@/lib/models/Campaign";

export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  await dbConnect();
  const campaign = await Campaign.findByIdAndUpdate(id, body, { new: true });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, campaign });
}

export async function DELETE(_, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  await dbConnect();
  await Campaign.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
