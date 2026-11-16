import { NextRequest, NextResponse } from "next/server";
import { getPlayerRecentMatches } from "@/lib/pubg";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("playerId")?.trim();
  const rawIds = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = rawIds.split(",").map(id => id.trim()).filter(Boolean).slice(0, 6);

  if (!playerId || !ids.length) {
    return NextResponse.json({ error: "A player ID and match IDs are required." }, { status: 400 });
  }
  if (ids.some(id => !/^[a-zA-Z0-9-]{8,80}$/.test(id))) {
    return NextResponse.json({ error: "Invalid match ID." }, { status: 400 });
  }

  try {
    const matches = await getPlayerRecentMatches(ids, playerId);
    return NextResponse.json({ matches, requested: ids.length });
  } catch (error) {
    console.error("Match details error:", error);
    return NextResponse.json({ error: "Unable to load match details from PUBG." }, { status: 502 });
  }
}
