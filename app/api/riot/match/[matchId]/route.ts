import { NextRequest, NextResponse } from "next/server";
import { getMatch, getMatchTimeline } from "@/lib/riot/api";
import { transformMatchDetail } from "@/lib/riot/transforms";
import { MemoryCache } from "@/lib/utils/cache";
import type { MatchDetail } from "@/lib/riot/types";

const cache = new MemoryCache();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (match data is immutable)

interface RouteParams {
  params: { matchId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { matchId } = params;
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get("puuid");
  const platform = searchParams.get("region") || undefined;

  if (!puuid) {
    return NextResponse.json({ error: "puuid is required" }, { status: 400 });
  }

  const cacheKey = `matchDetail:${matchId}:${puuid}`;
  const cached = cache.get<MatchDetail>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch match and timeline in parallel
    const [matchData, timelineData] = await Promise.all([
      getMatch(matchId, platform),
      getMatchTimeline(matchId, platform).catch(() => null),
    ]);

    const detail = transformMatchDetail(matchData, timelineData, puuid);
    cache.set(cacheKey, detail, CACHE_TTL);

    return NextResponse.json(detail);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
