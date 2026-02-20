import { NextRequest, NextResponse } from "next/server";
import { getCounterPicks } from "@/lib/engine/scoring";
import { getMatchupBuild } from "@/lib/engine/recommendation";
import { MemoryCache } from "@/lib/utils/cache";

const cache = new MemoryCache();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");
  const vs = searchParams.get("vs");

  if (!champion || !role || !vs) {
    return NextResponse.json(
      { error: "champion, role, and vs parameters required" },
      { status: 400 }
    );
  }

  const cacheKey = `recommend:${champion}:${role}:${vs}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [matchupBuild, counterPicks] = await Promise.all([
      getMatchupBuild(champion, vs, role),
      getCounterPicks(vs, role, 5),
    ]);

    const result = { matchupBuild, counterPicks };
    cache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Recommend API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch recommendation" },
      { status: 500 }
    );
  }
}
