import { NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser, revokeAllSessions } from "@/lib/auth";

export async function POST() {
  // Bump tokenVersion so this session's JWT is rejected on any future request
  const user = await getAuthUser();
  if (user?.id) revokeAllSessions(user.id).catch(() => {});

  const response = NextResponse.json({ success: true });
  response.cookies.set(clearAuthCookie());
  return response;
}
