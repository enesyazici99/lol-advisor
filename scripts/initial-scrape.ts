import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { scrapeChampion } from "../lib/scraper/probuildstats";
import { SUMMONER_SPELLS } from "../lib/riot/constants";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAllChampionIds(): Promise<string[]> {
  const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions: string[] = await versionsRes.json();
  const version = versions[0];
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const champData = await champRes.json();
  return Object.keys(champData.data); // ["Aatrox", "Ahri", ...]
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

async function main() {
  console.log("=== LOL Advisor — Full Scrape ===\n");

  // Get only specific champions if passed as args, otherwise ALL
  const args = process.argv.slice(2);
  let champions: string[];
  if (args.length > 0) {
    champions = args;
    console.log(`Scraping ${champions.length} specified champions.\n`);
  } else {
    console.log("Fetching all champion IDs from DDragon...");
    champions = await getAllChampionIds();
    console.log(`Found ${champions.length} champions.\n`);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let totalMatches = 0;
  let successCount = 0;
  let failCount = 0;

  for (const champion of champions) {
    process.stdout.write(`[${champions.indexOf(champion) + 1}/${champions.length}] Scraping ${champion}...`);

    try {
      const result = await scrapeChampion(champion);

      // Insert matches
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

      totalMatches += matchInserts.length;
      successCount++;
      console.log(` ✓ ${matchInserts.length} matches, WR: ${result.meta.winRate}%`);
    } catch (err: any) {
      failCount++;
      console.log(` ✗ ${err.message || err}`);
    }

    // Rate limit: 1 sec between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== Scrape Complete ===`);
  console.log(`Champions: ${successCount} success, ${failCount} failed`);
  console.log(`Total matches inserted: ${totalMatches}`);
}

main().catch(console.error);
