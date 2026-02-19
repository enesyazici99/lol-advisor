import * as cheerio from "cheerio";

const BASE_URL = "https://www.probuildstats.com";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(Math.pow(2, i) * 1000);
    }
  }
  throw new Error("Fetch failed after retries");
}

function extractItemIdFromUrl(url: string): number | null {
  const match = url.match(/\/item\/(\d+)\.png/);
  return match ? parseInt(match[1]) : null;
}

function extractChampionFromUrl(url: string): string | null {
  const match = url.match(/\/champion\/([^/.]+)\.png/);
  return match ? match[1] : null;
}

function extractSpellKeyFromUrl(url: string): string | null {
  const match = url.match(/\/spell\/([^/.]+)\.png/);
  return match ? match[1] : null;
}

export interface ScrapedMatch {
  proPlayer: string;
  team: string | null;
  region: string | null;
  vsChampion: string | null;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  items: number[];
  runeKeystoneId: number | null;
  runeSecondaryTreeId: number | null;
  spell1Key: string | null;
  spell2Key: string | null;
  timeAgo: string;
  role: string | null;
}

export interface ScrapedMeta {
  winRate: number;
  matchCount: number;
  roles: { role: string; pct: number }[];
  popularRunes: { keystoneId: number; secondaryTreeId: number; pct: number }[];
  popularBoots: { itemId: number; pct: number }[];
  popularItems: { itemId: number; pct: number }[];
  popularSpells: { spell1: string; spell2: string; pct: number }[];
  skillOrder: string | null;
}

export interface ScrapeResult {
  meta: ScrapedMeta;
  matches: ScrapedMatch[];
}

export async function scrapeChampion(championKey: string): Promise<ScrapeResult> {
  const url = `${BASE_URL}/champion/${championKey}`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const meta = parseMeta($);
  const matches = parseMatches($);

  return { meta, matches };
}

function parseMeta($: cheerio.CheerioAPI): ScrapedMeta {
  let winRate = 0;
  const popularRunes: { keystoneId: number; secondaryTreeId: number; pct: number }[] = [];
  const popularBoots: { itemId: number; pct: number }[] = [];
  const popularItems: { itemId: number; pct: number }[] = [];
  let skillOrder: string | null = null;

  // Items with pick rates: .item-image.completed-item > img, sibling .pick-rate
  $(".item-image.completed-item").each((_, el) => {
    const $el = $(el);
    const src = $el.find("img").first().attr("src") || "";
    const itemId = extractItemIdFromUrl(src);
    const pctEl = $el.siblings(".pick-rate").first().length
      ? $el.siblings(".pick-rate").first()
      : $el.parent().find(".pick-rate").first();
    const pct = parseInt(pctEl.text().replace(/[^0-9]/g, "")) || 0;

    if (itemId) {
      const bootIds = [3006, 3009, 3020, 3047, 3111, 3117, 3158];
      if (bootIds.includes(itemId)) {
        if (!popularBoots.find((b) => b.itemId === itemId)) {
          popularBoots.push({ itemId, pct });
        }
      } else {
        if (!popularItems.find((i) => i.itemId === itemId)) {
          popularItems.push({ itemId, pct });
        }
      }
    }
  });

  // Win rate from match cards
  const matchCount = $(".match-card").length;
  const winCount = $(".match-card.win").length;
  if (matchCount > 0) {
    winRate = Math.round((winCount / matchCount) * 1000) / 10;
  }

  // Try text-based win rate too
  const bodyText = $("body").text();
  const wrMatch = bodyText.match(/(\d+\.?\d*)%\s*(?:win\s*rate|wr)/i);
  if (wrMatch) {
    winRate = parseFloat(wrMatch[1]);
  }

  // Skill order
  const skillMatch = bodyText.match(/([QWE])\s*[>→►]\s*([QWE])\s*[>→►]\s*([QWE])/i);
  if (skillMatch) {
    skillOrder = `${skillMatch[1].toUpperCase()}>${skillMatch[2].toUpperCase()}>${skillMatch[3].toUpperCase()}`;
  }

  return {
    winRate,
    matchCount,
    roles: [],
    popularRunes,
    popularBoots,
    popularItems,
    popularSpells: [],
    skillOrder,
  };
}

function parseMatches($: cheerio.CheerioAPI): ScrapedMatch[] {
  const matches: ScrapedMatch[] = [];

  $(".match-card").each((_, el) => {
    const $card = $(el);
    const classes = $card.attr("class") || "";
    const win = classes.includes("win") && !classes.includes("loss");

    // Use the desktop layout for structured data
    const $desktop = $card.find('[class*="media-query_TABLET"]').first();
    if (!$desktop.length) return;

    // Time from .grid-item-time-stamp or .match-date
    const timeAgo = $desktop.find('[class*="grid-item-time-stamp"]').first().text().trim()
      || $card.find(".match-date").first().text().trim();

    // Player info from .grid-item-player-info
    const playerInfoText = $desktop.find('[class*="grid-item-player-info"]').first().text().trim();
    let proPlayer = "Unknown";
    let team: string | null = null;
    if (playerInfoText) {
      // First image alt in player-info is the player name
      const playerImg = $desktop.find('[class*="grid-item-player-info"] img').first();
      const playerAlt = playerImg.attr("alt") || "";
      // Second image alt is team name
      const teamImg = $desktop.find('[class*="grid-item-player-info"] img').eq(1);
      const teamAlt = teamImg.attr("alt") || "";

      proPlayer = playerAlt || playerInfoText.split(/\s{2,}/)[0] || "Unknown";
      team = teamAlt || null;
    }

    // KDA from .grid-item-kda: "9 / 7 / 41.86 KDA"
    // The format concatenates assists with KDA ratio: "K / D / A<ratio> KDA"
    // e.g., "4 / 1 / 711.00 KDA" means K=4, D=1, A=7, ratio=11.00
    const kdaText = $desktop.find('[class*="grid-item-kda"]').first().text().trim();
    let kills = 0, deaths = 0, assists = 0;
    const kdaWithRatio = kdaText.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+(?:\.\d+)?)\s*KDA/i);
    if (kdaWithRatio) {
      kills = parseInt(kdaWithRatio[1]);
      deaths = parseInt(kdaWithRatio[2]);
      const combined = kdaWithRatio[3]; // e.g., "711.00" or "41.86"
      const dotIdx = combined.indexOf(".");
      if (dotIdx > 0) {
        // Try all split points and pick the one where ratio matches (K+A)/D
        let bestAssists = 0;
        let bestError = Infinity;
        for (let s = 1; s <= dotIdx; s++) {
          const a = parseInt(combined.substring(0, s));
          const r = parseFloat(combined.substring(s));
          if (isNaN(r)) continue;
          const expected = deaths > 0 ? (kills + a) / deaths : kills + a;
          const err = Math.abs(r - expected);
          if (err < bestError) {
            bestError = err;
            bestAssists = a;
          }
        }
        assists = bestAssists;
      } else {
        assists = parseInt(combined);
      }
    } else {
      // Fallback: simple K/D/A pattern (no ratio text)
      const kdaSimple = kdaText.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
      if (kdaSimple) {
        kills = parseInt(kdaSimple[1]);
        deaths = parseInt(kdaSimple[2]);
        assists = parseInt(kdaSimple[3]);
      }
    }

    // VS champion from opponent image
    let vsChampion: string | null = null;
    const oppEl = $desktop.find('[class*="grid-item-champion-opp"] img[src*="/champion/"]').first();
    if (oppEl.length) {
      vsChampion = extractChampionFromUrl(oppEl.attr("src") || "");
    }

    // Items - only from desktop layout to avoid duplicates
    const items: number[] = [];
    const seenItems = new Set<number>();
    $desktop.find('img[src*="/item/"]').each((_, itemEl) => {
      const id = extractItemIdFromUrl($(itemEl).attr("src") || "");
      if (id && !seenItems.has(id)) {
        seenItems.add(id);
        items.push(id);
      }
    });

    // If no items in desktop, try the card level but dedupe
    if (items.length === 0) {
      $card.find('img[src*="/item/"]').each((_, itemEl) => {
        const id = extractItemIdFromUrl($(itemEl).attr("src") || "");
        if (id && !seenItems.has(id)) {
          seenItems.add(id);
          items.push(id);
        }
      });
    }

    // Spells from img alt text "Summoner Spell Flash" -> SummonerFlash
    let spell1Key: string | null = null;
    let spell2Key: string | null = null;
    $desktop.find('img[src*="/spell/"]').each((_, spellEl) => {
      const key = extractSpellKeyFromUrl($(spellEl).attr("src") || "");
      if (key) {
        if (!spell1Key) spell1Key = key;
        else if (!spell2Key) spell2Key = key;
      }
    });
    // Fallback: card level
    if (!spell1Key) {
      $card.find('img[src*="/spell/"]').each((_, spellEl) => {
        const key = extractSpellKeyFromUrl($(spellEl).attr("src") || "");
        if (key) {
          if (!spell1Key) spell1Key = key;
          else if (!spell2Key) spell2Key = key;
        }
      });
    }

    // Rune keystone from img alt "The Keystone Lethal Tempo"
    let runeKeystoneId: number | null = null;
    let runeSecondaryTreeId: number | null = null;
    $desktop.find("img").each((_, imgEl) => {
      const alt = $(imgEl).attr("alt") || "";
      const src = $(imgEl).attr("src") || "";
      if (alt.startsWith("The Keystone")) {
        // Extract rune ID from src: LethalTempoTemp.png or perk-images/.../8008.png
        const idMatch = src.match(/(\d{4})\.png/);
        if (idMatch && !runeKeystoneId) {
          runeKeystoneId = parseInt(idMatch[1]);
        }
      }
      if (alt.startsWith("The Rune Tree")) {
        const idMatch = src.match(/(\d{4})\.png/);
        if (idMatch && !runeSecondaryTreeId) {
          runeSecondaryTreeId = parseInt(idMatch[1]);
        }
      }
    });

    // Region from region icon (e.g., "LEC", "LCK", "LTAS")
    let region: string | null = null;
    $desktop.find('img[src*=".svg"]').each((_, svgEl) => {
      const alt = $(svgEl).attr("alt") || "";
      if (alt && alt.length <= 5 && /^[A-Z]+$/.test(alt)) {
        region = alt;
      }
    });

    if (proPlayer !== "Unknown") {
      matches.push({
        proPlayer,
        team,
        region,
        vsChampion,
        kills,
        deaths,
        assists,
        win,
        items,
        runeKeystoneId,
        runeSecondaryTreeId,
        spell1Key,
        spell2Key,
        timeAgo,
        role: null,
      });
    }
  });

  return matches;
}

export async function scrapeMultipleChampions(championKeys: string[]): Promise<Map<string, ScrapeResult>> {
  const results = new Map<string, ScrapeResult>();

  for (const key of championKeys) {
    try {
      const result = await scrapeChampion(key);
      results.set(key, result);
      await delay(1000);
    } catch (err) {
      console.error(`Failed to scrape ${key}:`, err);
    }
  }

  return results;
}
