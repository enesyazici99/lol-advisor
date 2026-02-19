import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { scrapeChampion } from "@/lib/scraper/probuildstats";
import { SUMMONER_SPELLS, inferRole } from "@/lib/riot/constants";
import { parseTimeAgo, matchFingerprint } from "@/lib/utils/helpers";

// Vercel Hobby plan has 60s timeout. Scrape a batch of champions per invocation.
const BATCH_SIZE = 30;

interface ChampInfo { id: string; tags: string[] }

async function getAllChampions(): Promise<Map<string, ChampInfo>> {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions: string[] = await res.json();
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`
  );
  const champData = await champRes.json();
  const map = new Map<string, ChampInfo>();
  for (const [key, val] of Object.entries(champData.data as Record<string, { id: string; tags: string[] }>)) {
    map.set(key, { id: val.id, tags: val.tags || [] });
  }
  return map;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // batch param: which batch of champions to scrape (0-based)
  const batchParam = parseInt(req.nextUrl.searchParams.get("batch") || "0");

  try {
    const champMap = await getAllChampions();
    const allChampionKeys = [...champMap.keys()];
    const start = batchParam * BATCH_SIZE;
    const batch = allChampionKeys.slice(start, start + BATCH_SIZE);

    if (batch.length === 0) {
      return NextResponse.json({ success: true, message: "No champions in this batch", batch: batchParam });
    }

    const supabase = createServerClient();
    let totalNew = 0;
    let totalSkipped = 0;

    for (const champion of batch) {
      try {
        const result = await scrapeChampion(champion);

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

        const matchInserts = result.matches
          .map((m) => {
            let spell1Id: number | null = null;
            let spell2Id: number | null = null;
            for (const [id, spell] of Object.entries(SUMMONER_SPELLS)) {
              if (spell.key === m.spell1Key) spell1Id = parseInt(id);
              if (spell.key === m.spell2Key) spell2Id = parseInt(id);
            }

            const champInfo = champMap.get(champion);
            const role = inferRole(champion, champInfo?.tags || [], spell1Id, spell2Id);

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

        totalSkipped += result.matches.length - matchInserts.length;

        if (matchInserts.length > 0) {
          const { error } = await supabase.from("pro_matches").insert(matchInserts);
          if (error) console.error(`Insert error for ${champion}:`, error.message);
          else totalNew += matchInserts.length;
        }
      } catch (err) {
        console.error(`Scrape error for ${champion}:`, err);
      }

      // Rate limit between champions
      await new Promise((r) => setTimeout(r, 800));
    }

    const hasMore = start + BATCH_SIZE < allChampionKeys.length;

    return NextResponse.json({
      success: true,
      batch: batchParam,
      championsProcessed: batch.length,
      totalNew,
      totalSkipped,
      hasMore,
      nextBatch: hasMore ? batchParam + 1 : null,
    });
  } catch (err) {
    console.error("Cron scrape error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
