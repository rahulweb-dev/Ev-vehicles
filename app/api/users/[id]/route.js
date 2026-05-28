import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

// PATCH /api/users/[id] — update dealer
export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, city, state, phone, dealerCode, isActive } = body;

    const update = {};
    if (name       !== undefined) update.name       = name;
    if (email      !== undefined) update.email      = email.toLowerCase();
    if (city       !== undefined) update.city       = city;
    if (state      !== undefined) update.state      = state;
    if (phone      !== undefined) update.phone      = phone;
    if (dealerCode !== undefined) update.dealerCode = dealerCode;
    if (isActive   !== undefined) update.isActive   = isActive;
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });
      update.password = await bcrypt.hash(password, 12);
    }

    const updated = await User.findByIdAndUpdate(id, update, { returnDocument: "after" }).select("-password").lean();
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("[PATCH /api/users/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — remove dealer
export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/users/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
