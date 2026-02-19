import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Get all champions that have pro matches
    const { data: champions } = await supabase
      .from("pro_matches")
      .select("*")
      .limit(1000);

    const uniqueChampions = Array.from(
      new Set((champions || []).map((c: { champion_key: string }) => c.champion_key))
    );
    let updated = 0;

    for (const championKey of uniqueChampions) {
      const { data: matches } = await supabase
        .from("pro_matches")
        .select("*")
        .eq("champion_key", championKey)
        .order("match_date", { ascending: false })
        .limit(100);

      if (!matches || matches.length === 0) continue;

      const total = matches.length;
      const wins = matches.filter((m) => m.win).length;
      const winRate = (wins / total) * 100;

      // Aggregate items
      const itemCounts = new Map<number, number>();
      const bootIds = new Set([3006, 3009, 3020, 3047, 3111, 3117, 3158]);
      const bootCounts = new Map<number, number>();

      for (const m of matches) {
        for (const item of m.items || []) {
          if (bootIds.has(item)) {
            bootCounts.set(item, (bootCounts.get(item) || 0) + 1);
          } else {
            itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
          }
        }
      }

      const popularItems = [...itemCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, count]) => ({ id, pct: Math.round((count / total) * 100) }));

      const popularBoots = [...bootCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => ({ id, pct: Math.round((count / total) * 100) }));

      // Aggregate runes
      const runeCounts = new Map<string, number>();
      for (const m of matches) {
        if (m.rune_primary_keystone) {
          const key = `${m.rune_primary_keystone}:${m.rune_secondary_tree || 0}`;
          runeCounts.set(key, (runeCounts.get(key) || 0) + 1);
        }
      }

      const popularRunes = [...runeCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, count]) => {
          const [keystone, secondary] = key.split(":").map(Number);
          return { keystone, secondary, pct: Math.round((count / total) * 100) };
        });

      // Aggregate spells
      const spellCounts = new Map<string, number>();
      for (const m of matches) {
        if (m.spell1 && m.spell2) {
          const key = `${m.spell1}:${m.spell2}`;
          spellCounts.set(key, (spellCounts.get(key) || 0) + 1);
        }
      }

      const popularSpells = [...spellCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, count]) => {
          const [s1, s2] = key.split(":").map(Number);
          return { spell1: s1, spell2: s2, pct: Math.round((count / total) * 100) };
        });

      await supabase.from("meta_builds").upsert(
        {
          champion_key: championKey,
          role: "ALL",
          win_rate: Math.round(winRate * 10) / 10,
          pick_rate: 0,
          match_count: total,
          popular_items: popularItems,
          popular_boots: popularBoots,
          popular_runes: popularRunes,
          popular_spells: popularSpells,
          skill_order: null,
        },
        { onConflict: "champion_key,role" }
      );

      updated++;
    }

    return NextResponse.json({ success: true, championsUpdated: updated });
  } catch (err) {
    console.error("Meta cron error:", err);
    return NextResponse.json({ error: "Meta aggregation failed" }, { status: 500 });
  }
}
