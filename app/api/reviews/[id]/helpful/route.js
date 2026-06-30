import dbConnect     from "@/lib/mongodb";
import VehicleReview from "@/lib/models/VehicleReview";

export async function POST(request, { params }) {
  const { id } = await params;
  await dbConnect();
  await VehicleReview.findByIdAndUpdate(id, { $inc: { helpful: 1 } });
  return Response.json({ success: true });
}
