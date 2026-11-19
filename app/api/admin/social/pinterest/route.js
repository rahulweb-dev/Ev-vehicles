import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPinterestConfig, listBoards, createBoard, setBoard, refreshPinterestIfDue, PIN_OAUTH_REDIRECT } from "@/lib/social/pinterestApi";

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

// GET — connection status + boards to choose from
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let cfg = await getPinterestConfig();
  let boards = [], boardsError = "";
  if (cfg.account?.mode === "oauth" && cfg.accessToken) {
    try { boards = await listBoards(cfg.accessToken); }
    catch (e) {
      // Expired access token? Try one refresh, then retry
      try { await refreshPinterestIfDue(true); cfg = await getPinterestConfig(); boards = await listBoards(cfg.accessToken); }
      catch { boardsError = e.message; }
    }
  }
  const a = cfg.account || {};
  return NextResponse.json({
    appConfigured: !!(cfg.appId && cfg.appSecret),
    loggedIn: a.mode === "oauth" && !!cfg.accessToken,
    connected: cfg.connected ? { username: a.username, boardId: a.boardId, boardName: a.boardName, tokenExpiresAt: a.tokenExpiresAt, refreshExpiresAt: a.refreshExpiresAt, lastError: a.lastError || "" } : null,
    account: a.mode === "oauth" ? { username: a.username, lastError: a.lastError || "" } : null,
    boards, boardsError,
    setup: { redirectUri: PIN_OAUTH_REDIRECT },
  });
}

// POST { boardId, boardName } | { createBoard: "Name" } — choose (or create) the board pins go to
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  const cfg = await getPinterestConfig();
  if (!cfg.accessToken) return NextResponse.json({ error: "Connect Pinterest first" }, { status: 400 });
  try {
    if (b.createBoard) {
      const board = await createBoard(cfg.accessToken, String(b.createBoard).trim() || "EV News India");
      await setBoard(board.id, board.name);
      return NextResponse.json({ success: true, board });
    }
    if (!/^\d+$/.test(String(b.boardId || ""))) return NextResponse.json({ error: "Choose a board" }, { status: 400 });
    await setBoard(b.boardId, String(b.boardName || "").slice(0, 180));
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

// DELETE — disconnect Pinterest
export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await SocialSettings.updateOne({ platform: "pinterest" }, { $set: { enabled: false, account: null, "credentials.accessToken": "", "credentials.refreshToken": "", "credentials.boardId": "" } });
  return NextResponse.json({ success: true });
}
