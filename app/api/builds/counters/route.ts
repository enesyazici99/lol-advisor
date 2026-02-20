import { NextRequest, NextResponse } from "next/server";
import { getCounterPicks, getWeakPicks } from "@/lib/engine/scoring";
import { MemoryCache } from "@/lib/utils/cache";

const cache = new MemoryCache();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");

  if (!champion || !role) {
    return NextResponse.json(
      { error: "champion and role parameters required" },
      { status: 400 }
    );
  }

  const cacheKey = `counters:${champion}:${role}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [bestPicks, worstPicks] = await Promise.all([
      getCounterPicks(champion, role, 10),
      getWeakPicks(champion, role, 10),
    ]);

    const result = { bestPicks, worstPicks };
    cache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Counters API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch counters" },
      { status: 500 }
    );
  }
}
