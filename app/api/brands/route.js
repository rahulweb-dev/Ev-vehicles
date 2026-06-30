import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";

export const dynamic = "force-dynamic";

/* GET /api/brands?slug=tata  — fetch a single brand's logo/info */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  await dbConnect();

  const query = slug ? { slug } : {};
  const brands = await Brand.find(query).select("name slug logo website description category").lean();

  return NextResponse.json({ brands });
}
