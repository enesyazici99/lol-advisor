import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { MemoryCache } from "@/lib/utils/cache";

const cache = new MemoryCache();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");
  const region = searchParams.get("region");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!champion) {
    return NextResponse.json({ error: "champion parameter required" }, { status: 400 });
  }

  const cacheKey = `pro-matches:${champion}:${role}:${region}:${page}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const supabase = createServerClient();
    let query = supabase
      .from("pro_matches")
      .select("*")
      .eq("champion_key", champion)
      .order("match_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) query = query.eq("role", role);
    if (region) query = query.eq("region", region);

    const { data, error } = await query;
    if (error) throw error;

    const result = { matches: data || [], page, hasMore: (data?.length || 0) === limit };
    cache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Pro matches API error:", err);
    return NextResponse.json({ error: "Failed to fetch pro matches" }, { status: 500 });
  }
}
