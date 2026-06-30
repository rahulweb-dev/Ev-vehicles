import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  await dbConnect();
  const authors = await Author.find().sort({ name: 1 }).lean();
  return Response.json({ authors });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  await dbConnect();
  const body = await request.json();
  const slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const author = await Author.findOneAndUpdate(
      { slug },
      { ...body, slug },
      { upsert: true, new: true, runValidators: true }
    );
    return Response.json({ author });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await dbConnect();
  await Author.findByIdAndDelete(id);
  return Response.json({ ok: true });
}
