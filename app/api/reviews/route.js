import { requireAuth } from "@/lib/auth";
import dbConnect     from "@/lib/mongodb";
import VehicleReview from "@/lib/models/VehicleReview";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug   = searchParams.get("slug");
  const status = searchParams.get("status");
  const page   = parseInt(searchParams.get("page")  || "1");
  const limit  = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  await dbConnect();
  const skip = (page - 1) * limit;

  // Admin mode: no slug, filter by status — requires auth
  if (!slug && status) {
    const auth = await requireAuth();
    if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });
    const validStatuses = ["pending", "approved", "rejected"];
    const query = { status: validStatuses.includes(status) ? status : "pending" };
    const [reviews, total] = await Promise.all([
      VehicleReview.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      VehicleReview.countDocuments(query),
    ]);
    return Response.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  }

  if (!slug) return Response.json({ error: "slug required" }, { status: 400 });

  const query = { vehicleSlug: slug, status: "approved" };

  const [reviews, total, stats] = await Promise.all([
    VehicleReview.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    VehicleReview.countDocuments(query),
    VehicleReview.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        avgRating:    { $avg: "$rating" },
        avgRange:     { $avg: "$ratingRange" },
        avgComfort:   { $avg: "$ratingComfort" },
        avgCharging:  { $avg: "$ratingCharging" },
        avgValue:     { $avg: "$ratingValue" },
        count1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        count2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        count3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        count4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        count5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      }},
    ]),
  ]);

  return Response.json({ reviews, total, page, pages: Math.ceil(total / limit), stats: stats[0] || null });
}

export async function POST(request) {
  const body = await request.json();
  const { vehicleSlug, vehicleName, vehicleType, name, rating, body: reviewBody } = body;

  if (!vehicleSlug || !name?.trim() || !rating || !reviewBody?.trim())
    return Response.json({ error: "vehicleSlug, name, rating, and body are required" }, { status: 400 });

  if (rating < 1 || rating > 5)
    return Response.json({ error: "Rating must be 1–5" }, { status: 400 });

  await dbConnect();
  const review = await VehicleReview.create({
    vehicleSlug,
    vehicleName: vehicleName || vehicleSlug,
    vehicleType: vehicleType || "car",
    name:           name.trim().slice(0, 60),
    city:           body.city?.trim().slice(0, 40),
    email:          body.email?.trim().toLowerCase(),
    rating,
    ratingRange:    body.ratingRange    || null,
    ratingComfort:  body.ratingComfort  || null,
    ratingCharging: body.ratingCharging || null,
    ratingValue:    body.ratingValue    || null,
    title:          body.title?.trim().slice(0, 120),
    body:           reviewBody.trim().slice(0, 1000),
    pros:           body.pros?.trim().slice(0, 200),
    cons:           body.cons?.trim().slice(0, 200),
    ownedMonths:    body.ownedMonths || null,
    status:         "pending",
  });

  return Response.json({ success: true, id: review._id }, { status: 201 });
}
