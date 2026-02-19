import { NextRequest, NextResponse } from "next/server";
import { getSummonerByRiotId, getSummonerByPuuid, getLeagueEntries } from "@/lib/riot/api";
import { MemoryCache } from "@/lib/utils/cache";
import type { SummonerProfile, RiotLeagueEntry } from "@/lib/riot/types";

const cache = new MemoryCache();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function extractRanked(entries: RiotLeagueEntry[], queueType: string) {
  const entry = entries.find((e) => e.queueType === queueType);
  if (!entry) return null;
  return {
    tier: entry.tier,
    rank: entry.rank,
    lp: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");
  const platform = searchParams.get("region") || undefined;

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "gameName and tagLine are required" },
      { status: 400 }
    );
  }

  const cacheKey = `summoner:${platform || "default"}:${gameName}#${tagLine}`;
  const cached = cache.get<SummonerProfile>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Account V1 → get puuid
    const account = await getSummonerByRiotId(gameName, tagLine, platform);

    // Summoner V4 → get summoner info (platform routing)
    const summoner = await getSummonerByPuuid(account.puuid, platform);

    // League V4 → get ranked entries
    const leagues = await getLeagueEntries(summoner.id, platform);

    const profile: SummonerProfile = {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      rankedSolo: extractRanked(leagues, "RANKED_SOLO_5x5"),
      rankedFlex: extractRanked(leagues, "RANKED_FLEX_SR"),
    };

    cache.set(cacheKey, profile, CACHE_TTL);
    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("404") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
