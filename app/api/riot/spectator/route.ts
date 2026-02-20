import { NextRequest, NextResponse } from "next/server";
import { getActiveGame } from "@/lib/riot/api";
import { transformSpectatorGame } from "@/lib/riot/transforms";
import { getChampions } from "@/lib/riot/ddragon";
import { MemoryCache } from "@/lib/utils/cache";

const cache = new MemoryCache();
const CACHE_TTL = 15 * 1000; // 15 seconds (short for live data)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const puuid = searchParams.get("puuid");
  const region = searchParams.get("region") || "tr1";

  if (!puuid) {
    return NextResponse.json(
      { error: "puuid parameter required" },
      { status: 400 }
    );
  }

  const cacheKey = `spectator:${puuid}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const game = await getActiveGame(puuid, region);

    if (!game) {
      const result = { inGame: false, game: null };
      cache.set(cacheKey, result, CACHE_TTL);
      return NextResponse.json(result);
    }

    // Build champion ID → name map
    const champions = await getChampions();
    const championMap: Record<string, string> = {};
    for (const [, champ] of Object.entries(champions)) {
      championMap[champ.key] = champ.id;
    }

    const liveGame = transformSpectatorGame(game, championMap);

    const result = { inGame: true, game: liveGame };
    cache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Spectator API error:", err);
    return NextResponse.json(
      { inGame: false, game: null, error: "Spectator API unavailable" },
      { status: 200 }
    );
  }
}
