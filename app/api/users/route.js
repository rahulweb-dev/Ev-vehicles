import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

// GET /api/users — admin only, list all dealers
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find({ role: "dealer" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/users — admin only, create a dealer
export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, city, state, phone, dealerCode } = body;

    if (!name || !email || !password || !city || !state) {
      return NextResponse.json({ error: "Name, email, password, city and state are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "dealer",
      city,
      state,
      phone: phone || "",
      dealerCode: dealerCode || "",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id:         newUser._id,
        name:       newUser.name,
        email:      newUser.email,
        city:       newUser.city,
        state:      newUser.state,
        dealerCode: newUser.dealerCode,
        isActive:   newUser.isActive,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
