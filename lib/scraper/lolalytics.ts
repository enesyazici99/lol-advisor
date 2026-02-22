const BASE_URL = "https://lolalytics.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const RUNE_TREE_IDS = [8000, 8100, 8200, 8300, 8400];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

// ─── Champion ID ↔ Key Mapping ──────────────────────────────

let championIdToKey: Record<number, string> | null = null;

async function getChampionIdToKey(): Promise<Record<number, string>> {
  if (championIdToKey) return championIdToKey;

  const versionsRes = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  const versions: string[] = await versionsRes.json();
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`
  );
  const champData = await champRes.json();

  championIdToKey = {};
  for (const [, val] of Object.entries(
    champData.data as Record<string, { id: string; key: string }>
  )) {
    championIdToKey[parseInt(val.key)] = val.id;
  }
  return championIdToKey;
}

// ─── Qwik JSON Parser ──────────────────────────────────────

interface QwikData {
  objs: unknown[];
}

function parseQwikJson(html: string): QwikData | null {
  const match = html.match(/<script type="qwik\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as QwikData;
  } catch {
    return null;
  }
}

function resolveRef(objs: unknown[], ref: unknown, depth = 0): unknown {
  if (depth > 4) return ref;
  if (typeof ref === "string") {
    const idx = parseInt(ref, 36);
    if (!isNaN(idx) && idx >= 0 && idx < objs.length) {
      const val = objs[idx];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const resolved: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
          resolved[k] = resolveRef(objs, v, depth + 1);
        }
        return resolved;
      }
      if (Array.isArray(val)) {
        return val.map((v) => resolveRef(objs, v, depth + 1));
      }
      return val;
    }
  }
  return ref;
}

// ─── Page Fetcher ───────────────────────────────────────────

async function fetchPage(url: string, retries = 3): Promise<string> {
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

// ─── Counter Scraper ────────────────────────────────────────

export async function scrapeCounters(
  championKey: string,
  lane: string
): Promise<ScrapedCounter[]> {
  const lolLane = LANE_MAP[lane] || lane.toLowerCase();
  const champSlug = championKey.toLowerCase();
  const url = `${BASE_URL}/lol/${champSlug}/counters/?lane=${lolLane}&tier=emerald_plus`;

  const html = await fetchPage(url);
  const qwik = parseQwikJson(html);
  if (!qwik) return [];

  const idToKey = await getChampionIdToKey();
  const { objs } = qwik;
  const counters: ScrapedCounter[] = [];

  for (const obj of objs) {
    if (
      obj &&
      typeof obj === "object" &&
      !Array.isArray(obj) &&
      "vsWr" in obj &&
      "n" in obj &&
      "cid" in obj &&
      "d1" in obj
    ) {
      const entry = obj as Record<string, unknown>;
      const cid = resolveRef(objs, entry.cid) as number;
      const vsWr = resolveRef(objs, entry.vsWr) as number;
      const n = resolveRef(objs, entry.n) as number;
      const d1 = resolveRef(objs, entry.d1) as number;

      if (typeof cid !== "number" || typeof vsWr !== "number") continue;

      const champKey = idToKey[cid];
      if (!champKey) continue;

      counters.push({
        vsChampionKey: champKey,
        winRate: vsWr,
        games: n,
        delta: d1,
      });
    }
  }

  return counters;
}

// ─── Build Scraper ──────────────────────────────────────────

export async function scrapeBuild(
  championKey: string,
  lane: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vsChampion?: string
): Promise<ScrapedBuild> {
  const lolLane = LANE_MAP[lane] || lane.toLowerCase();
  const champSlug = championKey.toLowerCase();
  // Note: vs parameter causes 404 on Lolalytics, use general build page
  const url = `${BASE_URL}/lol/${champSlug}/build/?lane=${lolLane}&tier=emerald_plus`;

  const html = await fetchPage(url);
  const qwik = parseQwikJson(html);

  if (!qwik) {
    return { items: [], runeKeystoneId: null, runeSecondaryTreeId: null, spell1Id: null, spell2Id: null };
  }

  const { objs } = qwik;
  let items: number[] = [];
  let runeKeystoneId: number | null = null;
  let runeSecondaryTreeId: number | null = null;
  let spell1Id: number | null = null;
  let spell2Id: number | null = null;

  // Find the best build summary object
  // It has keys: skillpriority, sums, skillorder, items, runes
  for (const obj of objs) {
    if (
      obj &&
      typeof obj === "object" &&
      !Array.isArray(obj) &&
      "runes" in obj &&
      "sums" in obj &&
      "items" in obj &&
      "skillorder" in obj
    ) {
      const entry = obj as Record<string, unknown>;

      // Resolve runes
      const runes = resolveRef(objs, entry.runes) as Record<string, unknown> | null;
      if (runes && typeof runes === "object") {
        const runeSet = runes.set as Record<string, unknown> | undefined;
        if (runeSet) {
          const pri = runeSet.pri;
          if (Array.isArray(pri) && pri.length > 0) {
            runeKeystoneId = typeof pri[0] === "number" ? pri[0] : null;
          }
        }
        const page = runes.page as Record<string, unknown> | undefined;
        if (page && typeof page.sec === "number") {
          runeSecondaryTreeId = RUNE_TREE_IDS[page.sec] ?? null;
        }
      }

      // Resolve spells
      const sums = resolveRef(objs, entry.sums) as Record<string, unknown> | null;
      if (sums && typeof sums === "object") {
        const ids = sums.ids;
        if (Array.isArray(ids) && ids.length >= 2) {
          spell1Id = typeof ids[0] === "number" ? ids[0] : null;
          spell2Id = typeof ids[1] === "number" ? ids[1] : null;
        }
      }

      // Resolve items (core set)
      const itemsData = resolveRef(objs, entry.items) as Record<string, unknown> | null;
      if (itemsData && typeof itemsData === "object") {
        const core = itemsData.core as Record<string, unknown> | undefined;
        if (core && Array.isArray(core.set)) {
          items = core.set.filter((id): id is number => typeof id === "number");
        }

        // Add item4 and item5 (most popular)
        for (const slot of ["item4", "item5"]) {
          const slotData = itemsData[slot];
          if (Array.isArray(slotData) && slotData.length > 0) {
            const best = slotData[0] as Record<string, unknown> | undefined;
            if (best && typeof best.id === "number") {
              items.push(best.id);
            }
          }
        }
      }

      break; // Use first matching build summary
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
