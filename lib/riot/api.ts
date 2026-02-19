import { rateLimiter } from "./rateLimiter";
import { PLATFORM_TO_REGION } from "./types";
import type {
  RiotAccountResponse,
  RiotSummonerResponse,
  RiotLeagueEntry,
  RiotMatchResponse,
  RiotTimelineResponse,
} from "./types";

const RIOT_API_KEY = process.env.RIOT_API_KEY || "";
const DEFAULT_PLATFORM = process.env.RIOT_PLATFORM || "tr1";
const DEFAULT_REGION = process.env.RIOT_REGION || "europe";

function platformUrl(platform?: string): string {
  return `https://${platform || DEFAULT_PLATFORM}.api.riotgames.com`;
}

function regionUrl(platform?: string): string {
  const region = platform
    ? PLATFORM_TO_REGION[platform] || DEFAULT_REGION
    : DEFAULT_REGION;
  return `https://${region}.api.riotgames.com`;
}

async function riotFetch<T>(url: string): Promise<T> {
  await rateLimiter.acquire();

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Riot API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/** Account V1 — get account by Riot ID (regional routing) */
export async function getSummonerByRiotId(
  gameName: string,
  tagLine: string,
  platform?: string
): Promise<RiotAccountResponse> {
  return riotFetch<RiotAccountResponse>(
    `${regionUrl(platform)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

/** Summoner V4 — get summoner by PUUID (platform routing) */
export async function getSummonerByPuuid(
  puuid: string,
  platform?: string
): Promise<RiotSummonerResponse> {
  return riotFetch<RiotSummonerResponse>(
    `${platformUrl(platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );
}

/** League V4 — get ranked entries for a summoner (platform routing) */
export async function getLeagueEntries(
  summonerId: string,
  platform?: string
): Promise<RiotLeagueEntry[]> {
  return riotFetch<RiotLeagueEntry[]>(
    `${platformUrl(platform)}/lol/league/v4/entries/by-summoner/${summonerId}`
  );
}

/** Match V5 — get match IDs by PUUID (regional routing) */
export async function getMatchIds(
  puuid: string,
  count = 20,
  start = 0,
  platform?: string
): Promise<string[]> {
  return riotFetch<string[]>(
    `${regionUrl(platform)}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`
  );
}

/** Match V5 — get full match data (regional routing) */
export async function getMatch(
  matchId: string,
  platform?: string
): Promise<RiotMatchResponse> {
  return riotFetch<RiotMatchResponse>(
    `${regionUrl(platform)}/lol/match/v5/matches/${matchId}`
  );
}

/** Match V5 — get match timeline (regional routing) */
export async function getMatchTimeline(
  matchId: string,
  platform?: string
): Promise<RiotTimelineResponse> {
  return riotFetch<RiotTimelineResponse>(
    `${regionUrl(platform)}/lol/match/v5/matches/${matchId}/timeline`
  );
}
