import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken, createAuthCookie } from "@/lib/auth";

// In-memory rate limiter: 5 attempts per 15 minutes per IP
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) return true;

  record.count++;
  return false;
}

function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request) {
  const ip = getClientIp(request);

  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Your account has been disabled. Contact the administrator." }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Clear rate limit on successful login
    loginAttempts.delete(ip);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken({
      id:           user._id.toString(),
      email:        user.email,
      name:         user.name,
      role:         user.role,
      city:         user.city || "",
      state:        user.state || "",
      dealerCode:   user.dealerCode || "",
      tokenVersion: user.tokenVersion ?? 0,
    });
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({
      success: true,
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
        city:  user.city || "",
        state: user.state || "",
      },
    });

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("[Login]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
