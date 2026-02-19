import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { scrapeMultipleChampions } from "@/lib/scraper/probuildstats";
import { SUMMONER_SPELLS } from "@/lib/riot/constants";
import { parseTimeAgo } from "@/lib/utils/helpers";

const TOP_CHAMPIONS = [
  "Ezreal", "Jinx", "Kaisa", "Yasuo", "Yone",
  "Lux", "Ahri", "Zed", "LeeSin", "Thresh",
  "Vayne", "Jhin", "Caitlyn", "Ashe", "Lucian",
  "Darius", "Garen", "Syndra", "Viego", "Nautilus",
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await scrapeMultipleChampions(TOP_CHAMPIONS);
    const supabase = createServerClient();
    let totalMatches = 0;

    for (const [champion, result] of results) {
      const matchInserts = result.matches.map((m) => {
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
        if (error) console.error(`Insert error for ${champion}:`, error);
        else totalMatches += matchInserts.length;
      }
    }

    return NextResponse.json({ success: true, totalMatches, championsProcessed: results.size });
  } catch (err) {
    console.error("Cron scrape error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
