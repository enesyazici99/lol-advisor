import { NextRequest, NextResponse } from "next/server";
import { scrapeChampion } from "@/lib/scraper/probuildstats";
import { createServerClient } from "@/lib/supabase/server";
import { SUMMONER_SPELLS, inferRole } from "@/lib/riot/constants";
import { parseTimeAgo, matchFingerprint } from "@/lib/utils/helpers";

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

    // Get existing fingerprints for dedup
    const { data: existingRows } = await supabase
      .from("pro_matches")
      .select("pro_player, kills, deaths, assists, items, win")
      .eq("champion_key", champion)
      .order("match_date", { ascending: false })
      .limit(50);

    const existing = new Set<string>();
    if (existingRows) {
      for (const m of existingRows) {
        existing.add(matchFingerprint(champion, m.pro_player, m.kills, m.deaths, m.assists, m.items || [], m.win));
      }
    }

    // Get champion tags for role inference
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions: string[] = await versionsRes.json();
    const champDetailRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`
    );
    const champDetailData = await champDetailRes.json();
    const champTags: string[] = champDetailData.data[champion]?.tags || [];

    const matchInserts = result.matches
      .map((m) => {
        let spell1Id: number | null = null;
        let spell2Id: number | null = null;
        for (const [id, spell] of Object.entries(SUMMONER_SPELLS)) {
          if (spell.key === m.spell1Key) spell1Id = parseInt(id);
          if (spell.key === m.spell2Key) spell2Id = parseInt(id);
        }

        const role = inferRole(champion, champTags, spell1Id, spell2Id);

        return {
          champion_key: champion,
          pro_player: m.proPlayer,
          team: m.team,
          region: m.region,
          role,
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
      })
      .filter((m) => {
        const fp = matchFingerprint(m.champion_key, m.pro_player, m.kills, m.deaths, m.assists, m.items, m.win);
        return !existing.has(fp);
      });

    const skipped = result.matches.length - matchInserts.length;

    if (matchInserts.length > 0) {
      const { error } = await supabase.from("pro_matches").insert(matchInserts);
      if (error) console.error("Insert error:", error);
    }

    // Update meta
    if (result.meta.winRate > 0) {
      await supabase
        .from("meta_builds")
        .upsert(
          {
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
            popular_spells: [] as { spell1: number; spell2: number; pct: number }[],
            skill_order: result.meta.skillOrder,
          },
          { onConflict: "champion_key,role" }
        );
    }

    return NextResponse.json({
      success: true,
      newMatches: matchInserts.length,
      skippedDuplicates: skipped,
      meta: result.meta,
    });
  } catch (err) {
    console.error("Scraper trigger error:", err);
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}
