import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { getAuthUser } from "@/lib/auth";
import { formLimiter, getIp } from "@/lib/rateLimit";

const SITE_URL = "https://www.evradar.in";

async function sendLeadNotification(lead) {
  const apiKey   = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@evradar.in";
  const toEmail   = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  if (!apiKey || !toEmail) return;

  const intentLabels = { test_drive: "Test Drive", price: "Best Price", loan: "Loan/Finance", general: "General Enquiry" };
  const intentLabel  = intentLabels[lead.intent] || lead.intent;

  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.07)">
  <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:24px 28px">
    <h2 style="color:#fff;margin:0;font-size:20px">🔔 New Lead — ${lead.vehicleName}</h2>
    <p style="color:#d1fae5;margin:4px 0 0;font-size:13px">Intent: <strong style="color:#fff">${intentLabel}</strong></p>
  </div>
  <div style="padding:28px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${[
        ["Name",    lead.name],
        ["Phone",   lead.phone],
        ["Email",   lead.email || "—"],
        ["City",    lead.city  || "—"],
        ["Vehicle", lead.vehicleName],
        ["Type",    lead.vehicleType],
        ["Intent",  intentLabel],
      ].map(([k, v]) => `<tr><td style="padding:8px 0;color:#6b7280;width:90px">${k}</td><td style="padding:8px 0;font-weight:600;color:#111">${v}</td></tr>`).join("")}
    </table>
    <a href="${SITE_URL}/admin/leads" style="display:inline-block;margin-top:16px;background:#16a34a;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:13px">
      View in Admin →
    </a>
  </div>
</div>
</body></html>`;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method:  "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from:    { email: fromEmail, name: "EV News India Leads" },
      subject: `🔔 New ${intentLabel} Lead — ${lead.vehicleName} (${lead.phone})`,
      content: [{ type: "text/html", value: html }],
    }),
  });
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request) {
  const rl = formLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  try {
    const body = await request.json();
    const { name, phone, email, city, state, vehicleName, vehicleSlug, vehicleType, intent } = body;

    if (!name || !phone || !vehicleName || !vehicleSlug) {
      return NextResponse.json({ error: "Name, phone, and vehicle are required" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    await dbConnect();
    const lead = await Lead.create({
      name,
      phone: phone.replace(/\s/g, ""),
      email,
      city,
      state,
      vehicleName,
      vehicleSlug,
      vehicleType: vehicleType || "car",
      intent: intent || "general",
    });

    // Fire-and-forget: notify admin via email
    sendLeadNotification(lead).catch(console.error);

    return NextResponse.json({ success: true, id: lead._id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getAuthUser();

    const { searchParams } = new URL(request.url);
    const vehicleSlug  = searchParams.get("vehicleSlug");
    const status       = searchParams.get("status");
    const vehicleType  = searchParams.get("vehicleType");
    const cityFilter   = searchParams.get("city");
    const stateFilter  = searchParams.get("state");
    const limit        = parseInt(searchParams.get("limit") || "200");

    const filter = {};

    // Dealers are auto-scoped to their city/state — they can't override this
    if (user && user.role === "dealer") {
      if (user.city)  filter.city  = { $regex: new RegExp(`^${escapeRegExp(user.city)}$`, "i") };
      if (user.state) filter.state = { $regex: new RegExp(`^${escapeRegExp(user.state)}$`, "i") };
    } else {
      // Admin can filter by city/state optionally
      if (cityFilter)  filter.city  = { $regex: new RegExp(escapeRegExp(cityFilter), "i") };
      if (stateFilter) filter.state = { $regex: new RegExp(escapeRegExp(stateFilter), "i") };
    }

    if (vehicleSlug)  filter.vehicleSlug  = vehicleSlug;
    if (status)       filter.status       = status;
    if (vehicleType)  filter.vehicleType  = vehicleType;

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const total = await Lead.countDocuments(filter);
    return NextResponse.json({ leads, total });
  } catch (err) {
    console.error("[GET /api/leads]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
