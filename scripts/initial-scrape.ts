import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { scrapeChampion } from "../lib/scraper/probuildstats";
import { SUMMONER_SPELLS, inferRole } from "../lib/riot/constants";
import { matchFingerprint } from "../lib/utils/helpers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ChampionInfo {
  id: string;
  tags: string[];
}

async function getAllChampions(): Promise<Map<string, ChampionInfo>> {
  const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions: string[] = await versionsRes.json();
  const version = versions[0];
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const champData = await champRes.json();
  const map = new Map<string, ChampionInfo>();
  for (const [key, val] of Object.entries(champData.data as Record<string, any>)) {
    map.set(key, { id: val.id, tags: val.tags || [] });
  }
  return map;
}

function parseTimeAgo(text: string): Date {
  const now = new Date();
  const match = text.match(/(\d+)\s*(s|m|h|d|min|hour|day|second|minute)/i);
  if (!match) return now;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("s")) return new Date(now.getTime() - value * 1000);
  if (unit.startsWith("min") || unit === "m") return new Date(now.getTime() - value * 60000);
  if (unit.startsWith("h")) return new Date(now.getTime() - value * 3600000);
  if (unit.startsWith("d")) return new Date(now.getTime() - value * 86400000);
  return now;
}

interface MatchRow {
  champion_key: string;
  pro_player: string;
  kills: number;
  deaths: number;
  assists: number;
  items: number[] | null;
  win: boolean;
}

async function getExistingFingerprints(
  supabase: ReturnType<typeof createClient<Record<string, never>>>,
  championKey: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("pro_matches")
    .select("champion_key, pro_player, kills, deaths, assists, items, win")
    .eq("champion_key", championKey)
    .order("match_date", { ascending: false })
    .limit(100);

  const fps = new Set<string>();
  if (data) {
    for (const m of data as unknown as MatchRow[]) {
      fps.add(matchFingerprint(m.champion_key, m.pro_player, m.kills, m.deaths, m.assists, m.items || [], m.win));
    }
  }
  return fps;
}

async function main() {
  console.log("=== LOL Advisor — Full Scrape ===\n");

  const args = process.argv.slice(2);
  console.log("Fetching all champion data from DDragon...");
  const champMap = await getAllChampions();

  let champions: string[];
  if (args.length > 0) {
    champions = args;
    console.log(`Scraping ${champions.length} specified champions.\n`);
  } else {
    champions = [...champMap.keys()];
    console.log(`Found ${champions.length} champions.\n`);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let totalNew = 0;
  let totalSkipped = 0;
  let successCount = 0;
  let failCount = 0;

  for (const champion of champions) {
    const idx = champions.indexOf(champion) + 1;
    process.stdout.write(`[${idx}/${champions.length}] Scraping ${champion}...`);

    try {
      const result = await scrapeChampion(champion);

      // Get existing fingerprints for dedup
      const existing = await getExistingFingerprints(supabase, champion);

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

      const skipped = result.matches.length - matchInserts.length;
      totalSkipped += skipped;

      if (matchInserts.length > 0) {
        const { error } = await supabase.from("pro_matches").insert(matchInserts);
        if (error) {
          console.log(` ✗ DB insert error: ${error.message}`);
          failCount++;
          continue;
        }
      }

      // Upsert meta data
      if (result.meta.winRate > 0 || result.meta.popularItems.length > 0) {
        await supabase.from("meta_builds").upsert(
          {
            champion_key: champion,
            role: "ALL",
            win_rate: result.meta.winRate,
            pick_rate: 0,
            match_count: result.meta.matchCount || result.matches.length,
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

      totalNew += matchInserts.length;
      successCount++;
      console.log(` ✓ ${matchInserts.length} new, ${skipped} skipped, WR: ${result.meta.winRate}%`);
    } catch (err: any) {
      failCount++;
      console.log(` ✗ ${err.message || err}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== Scrape Complete ===`);
  console.log(`Champions: ${successCount} success, ${failCount} failed`);
  console.log(`New matches: ${totalNew}, Duplicates skipped: ${totalSkipped}`);
}

main().catch(console.error);
