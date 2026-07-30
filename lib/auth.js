import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET  = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";
const COOKIE_NAME = "admin-token";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function createAuthCookie(token) {
  return {
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,
    path:     "/",
  };
}

export function clearAuthCookie() {
  return {
    name:     COOKIE_NAME,
    value:    "",
    httpOnly: true,
    maxAge:   0,
    path:     "/",
  };
}

/**
 * Require a valid, non-revoked admin/dealer session.
 * Checks JWT signature + tokenVersion against the DB so revoked sessions
 * (logout, password change) are rejected immediately even within the 7-day TTL.
 */
export async function requireAuth() {
  const payload = await getAuthUser();
  if (!payload) return { error: "Unauthorized", status: 401 };

  // Verify token version against DB — catches revoked sessions
  // Only run this check if the token carries a version (old tokens without it still pass
  // until they expire naturally, then they'll re-login and get a versioned token)
  if (typeof payload.tokenVersion === "number" && payload.id) {
    try {
      const { default: dbConnect } = await import("./mongodb.js");
      const { default: User }      = await import("./models/User.js");
      await dbConnect();
      const user = await User.findById(payload.id).select("tokenVersion isActive").lean();
      if (!user || !user.isActive) return { error: "Unauthorized", status: 401 };
      if ((user.tokenVersion ?? 0) !== payload.tokenVersion) {
        return { error: "Session expired. Please log in again.", status: 401 };
      }
    } catch {
      // DB check failed — fail open in dev, fail closed in production
      if (process.env.NODE_ENV === "production") return { error: "Unauthorized", status: 401 };
    }
  }

  return { user: payload };
}

/**
 * Invalidate all existing sessions for a user by bumping their tokenVersion.
 * Call this on password change or explicit "log out all devices".
 */
export async function revokeAllSessions(userId) {
  const { default: dbConnect } = await import("./mongodb.js");
  const { default: User }      = await import("./models/User.js");
  await dbConnect();
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}
