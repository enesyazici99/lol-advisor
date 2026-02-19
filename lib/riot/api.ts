const RIOT_API_KEY = process.env.RIOT_API_KEY || "";
const RIOT_PLATFORM = process.env.RIOT_PLATFORM || "tr1";
const RIOT_REGION = process.env.RIOT_REGION || "europe";

const PLATFORM_URL = `https://${RIOT_PLATFORM}.api.riotgames.com`;
const REGION_URL = `https://${RIOT_REGION}.api.riotgames.com`;

async function riotFetch(url: string) {
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

export async function getSummonerByRiotId(gameName: string, tagLine: string) {
  return riotFetch(
    `${REGION_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

export async function getSummonerByPuuid(puuid: string) {
  return riotFetch(
    `${PLATFORM_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );
}

export async function getMatchIds(puuid: string, count = 20) {
  return riotFetch(
    `${REGION_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
  );
}

export async function getMatch(matchId: string) {
  return riotFetch(
    `${REGION_URL}/lol/match/v5/matches/${matchId}`
  );
}

export async function getMatchTimeline(matchId: string) {
  return riotFetch(
    `${REGION_URL}/lol/match/v5/matches/${matchId}/timeline`
  );
}
