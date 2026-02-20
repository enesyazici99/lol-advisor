import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { scrapeCounters, scrapeBuild } from "@/lib/scraper/lolalytics";
import { ROLES } from "@/lib/riot/constants";

const BATCH_SIZE = 30;

interface ChampInfo {
  id: string;
  tags: string[];
}

async function getAllChampions(): Promise<Map<string, ChampInfo>> {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions: string[] = await res.json();
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`
  );
  const champData = await champRes.json();
  const map = new Map<string, ChampInfo>();
  for (const [key, val] of Object.entries(
    champData.data as Record<string, { id: string; tags: string[] }>
  )) {
    map.set(key, { id: val.id, tags: val.tags || [] });
  }
  return map;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    cronSecret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batchParam = parseInt(req.nextUrl.searchParams.get("batch") || "0");
  // Optionally limit to a single role for faster batches
  const roleParam = req.nextUrl.searchParams.get("role") || null;
  const roles = roleParam ? [roleParam] : [...ROLES];

  try {
    const champMap = await getAllChampions();
    const allChampionKeys = [...champMap.keys()];
    const start = batchParam * BATCH_SIZE;
    const batch = allChampionKeys.slice(start, start + BATCH_SIZE);

    if (batch.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No champions in this batch",
        batch: batchParam,
      });
    }

    const supabase = createServerClient();
    let totalUpserted = 0;

    for (const champion of batch) {
      for (const role of roles) {
        try {
          const counters = await scrapeCounters(champion, role);

          if (counters.length === 0) continue;

          // Try to get build data for top 3 matchups
          const topCounters = counters.slice(0, 3);

          for (const counter of counters) {
            const isTopCounter = topCounters.some(
              (tc) => tc.vsChampionKey === counter.vsChampionKey
            );

            let recommendedItems: number[] = [];
            let recommendedRunes: { keystone: number; secondary: number } | null = null;
            let recommendedSpells: { spell1: number; spell2: number } | null = null;

            // Only scrape build for top matchups to save time
            if (isTopCounter) {
              try {
                const build = await scrapeBuild(champion, role, counter.vsChampionKey);
                recommendedItems = build.items;
                if (build.runeKeystoneId && build.runeSecondaryTreeId) {
                  recommendedRunes = {
                    keystone: build.runeKeystoneId,
                    secondary: build.runeSecondaryTreeId,
                  };
                }
                if (build.spell1Id && build.spell2Id) {
                  recommendedSpells = {
                    spell1: build.spell1Id,
                    spell2: build.spell2Id,
                  };
                }
                // Rate limit between build scrapes
                await new Promise((r) => setTimeout(r, 500));
              } catch {
                // Build scrape failed, continue with counter data only
              }
            }

            const row = {
              champion_key: champion,
              vs_champion_key: counter.vsChampionKey,
              role,
              win_rate: counter.winRate,
              games: counter.games,
              delta: counter.delta,
              recommended_items: recommendedItems,
              recommended_runes: recommendedRunes,
              recommended_spells: recommendedSpells,
            };

            const { error } = await supabase
              .from("matchup_data")
              .upsert(row, {
                onConflict: "champion_key,vs_champion_key,role",
              });

            if (error) {
              console.error(
                `Upsert error for ${champion} vs ${counter.vsChampionKey}:`,
                error.message
              );
            } else {
              totalUpserted++;
            }
          }

          // Rate limit between role pages
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          console.error(`Scrape error for ${champion}/${role}:`, err);
        }
      }

      // Rate limit between champions
      await new Promise((r) => setTimeout(r, 800));
    }

    const hasMore = start + BATCH_SIZE < allChampionKeys.length;

    return NextResponse.json({
      success: true,
      batch: batchParam,
      championsProcessed: batch.length,
      totalUpserted,
      hasMore,
      nextBatch: hasMore ? batchParam + 1 : null,
    });
  } catch (err) {
    console.error("Cron scrape-matchups error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
