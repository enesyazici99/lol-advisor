import * as cheerio from "cheerio";

const BASE_URL = "https://lolalytics.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

// ─── Scraped Types ──────────────────────────────────────────

export interface ScrapedCounter {
  vsChampionKey: string;
  winRate: number;
  games: number;
  delta: number;
}

export interface ScrapedBuild {
  items: number[];
  runeKeystoneId: number | null;
  runeSecondaryTreeId: number | null;
  spell1Id: number | null;
  spell2Id: number | null;
}

// ─── Lane Mapping ───────────────────────────────────────────

const LANE_MAP: Record<string, string> = {
  TOP: "top",
  JGL: "jungle",
  MID: "middle",
  ADC: "bottom",
  SUP: "support",
};

// ─── Counter Scraper ────────────────────────────────────────

export async function scrapeCounters(
  championKey: string,
  lane: string
): Promise<ScrapedCounter[]> {
  const lolLane = LANE_MAP[lane] || lane.toLowerCase();
  const champSlug = championKey.toLowerCase();
  const url = `${BASE_URL}/lol/${champSlug}/counters/?lane=${lolLane}&tier=emerald_plus`;

  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const counters: ScrapedCounter[] = [];
  const bodyText = $("body").text();

  // Lolalytics uses Qwik SSR — data is embedded in text content
  // Parse table rows: champion name, win rate %, games count
  // Try structured table parsing first
  $("table tbody tr, [class*='Counter'] tr, [class*='counter'] tr").each((_, el) => {
    const $row = $(el);
    const cells = $row.find("td");
    if (cells.length < 3) return;

    const nameCell = cells.eq(0).text().trim();
    const wrCell = cells.eq(1).text().trim();
    const gamesCell = cells.eq(2).text().trim();

    const winRate = parseFloat(wrCell.replace("%", ""));
    const games = parseInt(gamesCell.replace(/[,.\s]/g, ""));

    if (nameCell && !isNaN(winRate) && !isNaN(games) && games > 0) {
      const champKey = normalizeChampionName(nameCell);
      counters.push({
        vsChampionKey: champKey,
        winRate,
        games,
        delta: winRate - 50,
      });
    }
  });

  // Fallback: regex-based text extraction
  if (counters.length === 0) {
    const counterPattern =
      /([A-Z][a-zA-Z'\s]+?)\s+(\d+\.?\d*)\s*%?\s+(\d[\d,]*)\s/g;
    let match;
    while ((match = counterPattern.exec(bodyText)) !== null) {
      const name = match[1].trim();
      const winRate = parseFloat(match[2]);
      const games = parseInt(match[3].replace(/,/g, ""));
      if (name.length > 2 && name.length < 20 && !isNaN(winRate) && games > 10) {
        counters.push({
          vsChampionKey: normalizeChampionName(name),
          winRate,
          games,
          delta: winRate - 50,
        });
      }
    }
  }

  return counters;
}

// ─── Build Scraper ──────────────────────────────────────────

export async function scrapeBuild(
  championKey: string,
  lane: string,
  vsChampion?: string
): Promise<ScrapedBuild> {
  const lolLane = LANE_MAP[lane] || lane.toLowerCase();
  const champSlug = championKey.toLowerCase();
  let url = `${BASE_URL}/lol/${champSlug}/build/?lane=${lolLane}&tier=emerald_plus`;
  if (vsChampion) {
    url += `&vs=${vsChampion.toLowerCase()}`;
  }

  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const bodyText = $("body").text();

  const items: number[] = [];
  const runeKeystoneId = extractRuneKeystone($, bodyText);
  const runeSecondaryTreeId = extractRuneSecondary($, bodyText);
  const { spell1Id, spell2Id } = extractSpells($, bodyText);

  // Extract items from img src or data attributes
  $('img[src*="/item/"]').each((_, el) => {
    const src = $(el).attr("src") || "";
    const itemMatch = src.match(/\/item\/(\d+)\./);
    if (itemMatch) {
      const id = parseInt(itemMatch[1]);
      if (id > 0 && !items.includes(id)) {
        items.push(id);
      }
    }
  });

  // Fallback: extract item IDs from text/data
  if (items.length === 0) {
    const itemPattern = /item\/(\d{4})/g;
    let match;
    while ((match = itemPattern.exec(html)) !== null) {
      const id = parseInt(match[1]);
      if (id > 1000 && !items.includes(id)) {
        items.push(id);
      }
    }
  }

  return {
    items: items.slice(0, 6),
    runeKeystoneId,
    runeSecondaryTreeId,
    spell1Id,
    spell2Id,
  };
}

// ─── Helpers ────────────────────────────────────────────────

function extractRuneKeystone($: cheerio.CheerioAPI, bodyText: string): number | null {
  // Try img-based extraction
  let keystoneId: number | null = null;
  $('img[src*="perk-images"], img[src*="Styles"]').each((_, el) => {
    if (keystoneId) return;
    const src = $(el).attr("src") || "";
    const match = src.match(/(\d{4})\.png/);
    if (match) {
      const id = parseInt(match[1]);
      if (id >= 8000 && id <= 9999) keystoneId = id;
    }
  });

  // Fallback: text pattern
  if (!keystoneId) {
    const match = bodyText.match(/keystone[:\s]*(\d{4})/i);
    if (match) keystoneId = parseInt(match[1]);
  }

  return keystoneId;
}

function extractRuneSecondary($: cheerio.CheerioAPI, bodyText: string): number | null {
  let secondaryId: number | null = null;
  const treeIds = [8000, 8100, 8200, 8300, 8400];

  $('img[src*="perk-images"], img[src*="Styles"]').each((_, el) => {
    const src = $(el).attr("src") || "";
    const match = src.match(/(\d{4})\.png/);
    if (match) {
      const id = parseInt(match[1]);
      if (treeIds.includes(id) && !secondaryId) secondaryId = id;
    }
  });

  if (!secondaryId) {
    const match = bodyText.match(/secondary[:\s]*(\d{4})/i);
    if (match) {
      const id = parseInt(match[1]);
      if (treeIds.includes(id)) secondaryId = id;
    }
  }

  return secondaryId;
}

function extractSpells(
  $: cheerio.CheerioAPI,
  bodyText: string
): { spell1Id: number | null; spell2Id: number | null } {
  const SPELL_MAP: Record<string, number> = {
    flash: 4, ignite: 14, teleport: 12, heal: 7,
    exhaust: 3, barrier: 21, cleanse: 1, ghost: 6, smite: 11,
  };

  let spell1Id: number | null = null;
  let spell2Id: number | null = null;

  $('img[src*="/spell/"]').each((_, el) => {
    const src = $(el).attr("src") || "";
    const match = src.match(/Summoner(\w+)/i);
    if (match) {
      const spellName = match[1].toLowerCase();
      const id = SPELL_MAP[spellName] || null;
      if (id) {
        if (!spell1Id) spell1Id = id;
        else if (!spell2Id && id !== spell1Id) spell2Id = id;
      }
    }
  });

  // Fallback: text-based
  if (!spell1Id) {
    const lowerText = bodyText.toLowerCase();
    for (const [name, id] of Object.entries(SPELL_MAP)) {
      if (lowerText.includes(name)) {
        if (!spell1Id) spell1Id = id;
        else if (!spell2Id && id !== spell1Id) { spell2Id = id; break; }
      }
    }
  }

  return { spell1Id, spell2Id };
}

const CHAMPION_NAME_MAP: Record<string, string> = {
  "wukong": "MonkeyKing",
  "kai'sa": "Kaisa",
  "kha'zix": "Khazix",
  "cho'gath": "Chogath",
  "vel'koz": "Velkoz",
  "kog'maw": "KogMaw",
  "rek'sai": "RekSai",
  "bel'veth": "Belveth",
  "k'sante": "KSante",
  "leblanc": "Leblanc",
  "nunu & willump": "Nunu",
  "renata glasc": "Renata",
  "dr. mundo": "DrMundo",
  "master yi": "MasterYi",
  "miss fortune": "MissFortune",
  "twisted fate": "TwistedFate",
  "jarvan iv": "JarvanIV",
  "lee sin": "LeeSin",
  "xin zhao": "XinZhao",
  "tahm kench": "TahmKench",
  "aurelion sol": "AurelionSol",
};

function normalizeChampionName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (CHAMPION_NAME_MAP[lower]) return CHAMPION_NAME_MAP[lower];
  // Remove spaces and special characters for DDragon format
  return name.replace(/[\s']/g, "").replace(/\./g, "");
}

// ─── Batch Scraping ─────────────────────────────────────────

export async function scrapeChampionCounters(
  championKey: string,
  lanes: string[]
): Promise<Map<string, ScrapedCounter[]>> {
  const results = new Map<string, ScrapedCounter[]>();

  for (const lane of lanes) {
    try {
      const counters = await scrapeCounters(championKey, lane);
      results.set(lane, counters);
      await delay(1000);
    } catch (err) {
      console.error(`Failed to scrape counters for ${championKey}/${lane}:`, err);
      results.set(lane, []);
    }
  }

  return results;
}
