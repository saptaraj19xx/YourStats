import { NextRequest, NextResponse } from "next/server";
import { findPubgPlayer } from "@/lib/pubg";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name) return NextResponse.json({ error: "Enter a PUBG player name." }, { status: 400 });
  if (name.length > 32) return NextResponse.json({ error: "Player names must be 32 characters or fewer." }, { status: 400 });

  try {
    return NextResponse.json({ player: await findPubgPlayer(name) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PUBG_API_ERROR";
    const messages: Record<string, string> = {
      PUBG_API_KEY_MISSING: "PUBG API key is missing. Add it to .env.local and restart Next.js.",
      PLAYER_NOT_FOUND: "Player not found on PUBG PC (Steam). Check the exact in-game name.",
      PUBG_NOT_FOUND: "PUBG returned 404 for this player request.",
      PUBG_RATE_LIMIT: "PUBG API rate limit reached. Wait before trying again.",
      PUBG_API_ERROR: "PUBG API is temporarily unavailable."
    };
    const status = code === "PLAYER_NOT_FOUND" || code === "PUBG_NOT_FOUND" ? 404 : code === "PUBG_API_KEY_MISSING" ? 503 : code === "PUBG_RATE_LIMIT" ? 429 : 502;
    return NextResponse.json({ error: messages[code] ?? `PUBG request failed (${code}).` }, { status });
  }
}
