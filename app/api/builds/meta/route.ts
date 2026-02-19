import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { MemoryCache } from "@/lib/utils/cache";

const cache = new MemoryCache();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");

  if (!champion) {
    return NextResponse.json({ error: "champion parameter required" }, { status: 400 });
  }

  const cacheKey = `meta:${champion}:${role}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const supabase = createServerClient();
    let query = supabase
      .from("meta_builds")
      .select("*")
      .eq("champion_key", champion);

    if (role) query = query.eq("role", role);

    const { data, error } = await query;
    if (error) throw error;

    const result = { builds: data || [] };
    cache.set(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Meta API error:", err);
    return NextResponse.json({ error: "Failed to fetch meta builds" }, { status: 500 });
  }
}
