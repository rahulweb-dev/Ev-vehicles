import { NextResponse }  from "next/server";
import dbConnect         from "@/lib/mongodb";
import SocialSettings    from "@/lib/models/SocialSettings";
import { requireAuth }   from "@/lib/auth";
import { encrypt, decrypt, isEncrypted } from "@/lib/encrypt";

const PLATFORMS = ["facebook", "linkedin", "pinterest", "telegram"];

// Credential fields per platform (used for masking returned to UI)
const CRED_FIELDS = {
  facebook:  ["appId", "appSecret", "accessToken", "pageId"],
  linkedin:  ["clientId", "clientSecret", "accessToken", "companyUrn"],
  pinterest: ["accessToken", "boardId"],
  telegram:  ["botToken", "channelId"],
};

/** Replace credential values with mask so secrets never leave the server */
function maskCreds(platform, rawCreds = {}) {
  const masked = {};
  for (const field of CRED_FIELDS[platform] || []) {
    const val = rawCreds[field] || "";
    masked[field] = val ? "••••••••" : "";
  }
  return masked;
}

// GET /api/admin/social-settings — return all 4 platforms (masked credentials)
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const docs = await SocialSettings.find({}).lean();

    const result = PLATFORMS.map((platform) => {
      const doc = docs.find((d) => d.platform === platform);
      return {
        platform,
        enabled:     doc?.enabled ?? false,
        credentials: maskCreds(platform, doc?.credentials ?? {}),
        updatedAt:   doc?.updatedAt ?? null,
      };
    });

    return NextResponse.json({ settings: result });
  } catch (err) {
    console.error("[GET social-settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/social-settings — upsert one platform's settings
// Body: { platform, enabled, credentials: { field: value, ... } }
// Empty-string fields are NOT overwritten (keeps existing encrypted value)
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { platform, enabled, credentials = {} } = await request.json();

    if (!PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    await dbConnect();

    // Fetch current doc to keep existing encrypted values for blank fields
    const existing = await SocialSettings.findOne({ platform }).lean();
    const existingCreds = existing?.credentials ?? {};

    const updatedCreds = {};
    for (const field of CRED_FIELDS[platform] || []) {
      const incoming = credentials[field] ?? "";
      if (incoming === "" || incoming === "••••••••") {
        // Keep whatever was already stored (encrypted blob or empty string)
        updatedCreds[field] = existingCreds[field] ?? "";
      } else {
        // Encrypt and store the new value
        updatedCreds[field] = encrypt(incoming);
      }
    }

    const doc = await SocialSettings.findOneAndUpdate(
      { platform },
      { $set: { enabled: !!enabled, credentials: updatedCreds } },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success:  true,
      platform: doc.platform,
      enabled:  doc.enabled,
    });
  } catch (err) {
    console.error("[POST social-settings]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
