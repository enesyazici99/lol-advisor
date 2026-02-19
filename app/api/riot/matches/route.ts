import { NextRequest, NextResponse } from "next/server";
import { getMatchIds, getMatch } from "@/lib/riot/api";
import { transformMatch } from "@/lib/riot/transforms";
import { MemoryCache } from "@/lib/utils/cache";
import type { MatchSummary } from "@/lib/riot/types";

const cache = new MemoryCache();
const MATCH_CACHE_TTL = 60 * 60 * 1000; // 1 hour per match
const IDS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for match ID list

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get("puuid");
  const platform = searchParams.get("region") || undefined;
  const start = parseInt(searchParams.get("start") || "0", 10);
  const count = parseInt(searchParams.get("count") || "20", 10);

  if (!puuid) {
    return NextResponse.json({ error: "puuid is required" }, { status: 400 });
  }

  try {
    // Get match IDs (with short cache)
    const idsCacheKey = `matchIds:${platform || "default"}:${puuid}:${start}:${count}`;
    let matchIds = cache.get<string[]>(idsCacheKey);
    if (!matchIds) {
      matchIds = await getMatchIds(puuid, count, start, platform);
      cache.set(idsCacheKey, matchIds, IDS_CACHE_TTL);
    }

    // Fetch match details in parallel (with per-match cache)
    const matches: MatchSummary[] = [];
    const fetchPromises = matchIds.map(async (matchId) => {
      const matchCacheKey = `match:${matchId}`;
      let summary = cache.get<MatchSummary>(matchCacheKey);
      if (!summary) {
        const matchData = await getMatch(matchId, platform);
        summary = transformMatch(matchData, puuid);
        cache.set(matchCacheKey, summary, MATCH_CACHE_TTL);
      }
      return summary;
    });

    const results = await Promise.allSettled(fetchPromises);
    for (const result of results) {
      if (result.status === "fulfilled") {
        matches.push(result.value);
      }
    }

    // Sort by game creation descending
    matches.sort((a, b) => b.gameCreation - a.gameCreation);

    return NextResponse.json({
      matches,
      start,
      count,
      hasMore: matchIds.length === count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
