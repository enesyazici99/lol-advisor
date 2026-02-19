import type {
  RiotMatchResponse,
  RiotParticipant,
  RiotTimelineResponse,
  MatchSummary,
  MatchDetail,
  FullParticipant,
  ParticipantSummary,
} from "./types";

// ─── Position Normalization ───────────────────────────────────

const POSITION_MAP: Record<string, string> = {
  TOP: "TOP",
  JUNGLE: "JGL",
  MIDDLE: "MID",
  BOTTOM: "ADC",
  UTILITY: "SUP",
  // fallbacks
  NONE: "",
  "": "",
};

export function normalizePosition(position: string): string {
  return POSITION_MAP[position?.toUpperCase()] ?? position;
}

// ─── Rune Extraction ──────────────────────────────────────────

function extractKeystoneId(participant: RiotParticipant): number | null {
  const primaryStyle = participant.perks?.styles?.find(
    (s) => s.description === "primaryStyle"
  );
  return primaryStyle?.selections?.[0]?.perk ?? null;
}

function extractSecondaryTreeId(participant: RiotParticipant): number | null {
  const secondaryStyle = participant.perks?.styles?.find(
    (s) => s.description === "subStyle"
  );
  return secondaryStyle?.style ?? null;
}

// ─── Item Extraction ──────────────────────────────────────────

function extractItems(p: RiotParticipant): number[] {
  return [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(
    (id) => id > 0
  );
}

// ─── Transform Match → MatchSummary ──────────────────────────

export function transformMatch(
  match: RiotMatchResponse,
  puuid: string
): MatchSummary {
  const participant = match.info.participants.find((p) => p.puuid === puuid);
  if (!participant) {
    throw new Error(`Participant ${puuid} not found in match ${match.metadata.matchId}`);
  }

  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;

  const participants: ParticipantSummary[] = match.info.participants.map((p) => ({
    puuid: p.puuid,
    championName: p.championName,
    teamId: p.teamId,
    summonerName: p.riotIdGameName || p.summonerName,
  }));

  return {
    matchId: match.metadata.matchId,
    gameCreation: match.info.gameCreation,
    gameDuration: match.info.gameDuration,
    queueId: match.info.queueId,
    win: participant.win,
    championName: participant.championName,
    champLevel: participant.champLevel,
    position: normalizePosition(participant.teamPosition || participant.individualPosition),
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    cs,
    gold: participant.goldEarned,
    damage: participant.totalDamageDealtToChampions,
    visionScore: participant.visionScore,
    items: extractItems(participant),
    spell1: participant.summoner1Id,
    spell2: participant.summoner2Id,
    keystoneId: extractKeystoneId(participant),
    secondaryTreeId: extractSecondaryTreeId(participant),
    participants,
  };
}

// ─── Transform Full Participants ─────────────────────────────

function transformFullParticipant(p: RiotParticipant): FullParticipant {
  return {
    puuid: p.puuid,
    summonerName: p.riotIdGameName || p.summonerName,
    championName: p.championName,
    champLevel: p.champLevel,
    teamId: p.teamId,
    position: normalizePosition(p.teamPosition || p.individualPosition),
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    gold: p.goldEarned,
    damage: p.totalDamageDealtToChampions,
    visionScore: p.visionScore,
    items: extractItems(p),
    spell1: p.summoner1Id,
    spell2: p.summoner2Id,
    keystoneId: extractKeystoneId(p),
    secondaryTreeId: extractSecondaryTreeId(p),
    win: p.win,
  };
}

// ─── Transform Timeline ──────────────────────────────────────

export function transformTimeline(
  timeline: RiotTimelineResponse,
  puuid: string
): { itemTimeline: Record<string, number[]> | null; skillOrder: string | null } {
  const participantMapping = timeline.info.participants.find(
    (p) => p.puuid === puuid
  );
  if (!participantMapping) {
    return { itemTimeline: null, skillOrder: null };
  }

  const participantId = participantMapping.participantId;

  // Item timeline: group by minute
  const itemTimeline: Record<string, number[]> = {};
  const skillLevels: number[] = [];

  // Items to exclude (consumables, trinkets, etc.)
  const EXCLUDED_ITEMS = new Set([
    2003, 2031, 2033, 2055, 2138, 2139, 2140, // potions & elixirs
    3340, 3363, 3364, // trinkets
  ]);

  for (const frame of timeline.info.frames) {
    for (const event of frame.events) {
      if (event.participantId !== participantId) continue;

      if (event.type === "ITEM_PURCHASED" && event.itemId) {
        if (EXCLUDED_ITEMS.has(event.itemId)) continue;
        const minute = String(Math.floor(event.timestamp / 60000));
        if (!itemTimeline[minute]) itemTimeline[minute] = [];
        itemTimeline[minute].push(event.itemId);
      }

      if (
        event.type === "SKILL_LEVEL_UP" &&
        event.levelUpType === "NORMAL" &&
        event.skillSlot
      ) {
        skillLevels.push(event.skillSlot);
      }
    }
  }

  // Convert skill slots to max order string (Q > W > E)
  let skillOrder: string | null = null;
  if (skillLevels.length >= 15) {
    const slotMap: Record<number, string> = { 1: "Q", 2: "W", 3: "E", 4: "R" };
    // Count occurrences of Q/W/E by level 15 (exclude R)
    const counts: Record<string, number> = { Q: 0, W: 0, E: 0 };
    for (const slot of skillLevels.slice(0, 15)) {
      const skill = slotMap[slot];
      if (skill && skill !== "R") {
        counts[skill]++;
      }
    }
    // Sort by count descending
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
    skillOrder = sorted.join(" > ");
  }

  return {
    itemTimeline: Object.keys(itemTimeline).length > 0 ? itemTimeline : null,
    skillOrder,
  };
}

// ─── Transform Match Detail (match + timeline combined) ──────

export function transformMatchDetail(
  match: RiotMatchResponse,
  timeline: RiotTimelineResponse | null,
  puuid: string
): MatchDetail {
  const participants = match.info.participants.map(transformFullParticipant);

  const timelineData = timeline
    ? transformTimeline(timeline, puuid)
    : { itemTimeline: null, skillOrder: null };

  return {
    matchId: match.metadata.matchId,
    gameDuration: match.info.gameDuration,
    gameCreation: match.info.gameCreation,
    participants,
    itemTimeline: timelineData.itemTimeline,
    skillOrder: timelineData.skillOrder,
  };
}
