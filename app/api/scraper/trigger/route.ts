import { NextRequest, NextResponse } from "next/server";
import { scrapeChampion } from "@/lib/scraper/probuildstats";
import { createServerClient } from "@/lib/supabase/server";
import { SUMMONER_SPELLS } from "@/lib/riot/constants";
import { parseTimeAgo } from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { champion } = body;

  if (!champion) {
    return NextResponse.json({ error: "champion required" }, { status: 400 });
  }

  try {
    const result = await scrapeChampion(champion);
    const supabase = createServerClient();

    // Insert matches
    const matchInserts = result.matches.map((m) => {
      // Resolve spell keys to IDs
      let spell1Id: number | null = null;
      let spell2Id: number | null = null;
      for (const [id, spell] of Object.entries(SUMMONER_SPELLS)) {
        if (spell.key === m.spell1Key) spell1Id = parseInt(id);
        if (spell.key === m.spell2Key) spell2Id = parseInt(id);
      }

      return {
        champion_key: champion,
        pro_player: m.proPlayer,
        team: m.team,
        region: m.region,
        role: m.role,
        kills: m.kills,
        deaths: m.deaths,
        assists: m.assists,
        win: m.win,
        items: m.items,
        rune_primary_keystone: m.runeKeystoneId,
        rune_primary_tree: null as number | null,
        rune_secondary_tree: m.runeSecondaryTreeId,
        spell1: spell1Id,
        spell2: spell2Id,
        skill_order: null as string | null,
        item_timeline: null as Record<string, number[]> | null,
        vs_champion: m.vsChampion,
        cs: null as number | null,
        gold: null as number | null,
        damage: null as number | null,
        duration_minutes: null as number | null,
        match_date: m.timeAgo ? parseTimeAgo(m.timeAgo).toISOString() : new Date().toISOString(),
        source_url: `https://www.probuildstats.com/champion/${champion}`,
      };
    });

    if (matchInserts.length > 0) {
      const { error } = await supabase.from("pro_matches").insert(matchInserts);
      if (error) console.error("Insert error:", error);
    }

    // Update meta
    if (result.meta.winRate > 0) {
      const metaInsert = {
        champion_key: champion,
        role: "ALL",
        win_rate: result.meta.winRate,
        pick_rate: 0,
        match_count: result.meta.matchCount,
        popular_items: result.meta.popularItems.map((i) => ({ id: i.itemId, pct: i.pct })),
        popular_boots: result.meta.popularBoots.map((b) => ({ id: b.itemId, pct: b.pct })),
        popular_runes: result.meta.popularRunes.map((r) => ({
          keystone: r.keystoneId,
          secondary: r.secondaryTreeId,
          pct: r.pct,
        })),
        popular_spells: result.meta.popularSpells.map((s) => ({
          spell1: 0,
          spell2: 0,
          pct: s.pct,
        })),
        skill_order: result.meta.skillOrder,
      };

      await supabase
        .from("meta_builds")
        .upsert(metaInsert, { onConflict: "champion_key,role" });
    }

    return NextResponse.json({
      success: true,
      matchesScraped: result.matches.length,
      meta: result.meta,
    });
  } catch (err) {
    console.error("Scraper trigger error:", err);
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}
