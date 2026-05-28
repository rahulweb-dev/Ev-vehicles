import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken, createAuthCookie } from "@/lib/auth";

export async function POST(request) {
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

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken({
      id:         user._id.toString(),
      email:      user.email,
      name:       user.name,
      role:       user.role,
      city:       user.city || "",
      state:      user.state || "",
      dealerCode: user.dealerCode || "",
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
