// ─── Region / Platform Mapping ────────────────────────────────

/** Platform (e.g. tr1) → Regional routing (e.g. europe) */
export const PLATFORM_TO_REGION: Record<string, string> = {
  tr1: "europe",
  euw1: "europe",
  eun1: "europe",
  ru: "europe",
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

/** Platforms available in the search region selector */
export const SEARCH_REGIONS = [
  { value: "tr1", label: "TR" },
  { value: "euw1", label: "EUW" },
  { value: "eun1", label: "EUNE" },
  { value: "na1", label: "NA" },
  { value: "kr", label: "KR" },
  { value: "jp1", label: "JP" },
  { value: "br1", label: "BR" },
  { value: "oc1", label: "OCE" },
  { value: "ru", label: "RU" },
] as const;

export type SearchPlatform = (typeof SEARCH_REGIONS)[number]["value"];

// ─── Riot API Response Types ──────────────────────────────────

/** Account V1 response */
export interface RiotAccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

/** Summoner V4 response */
export interface RiotSummonerResponse {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

/** League V4 entry */
export interface RiotLeagueEntry {
  leagueId: string;
  summonerId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

/** Match V5 participant */
export interface RiotParticipant {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  championId: number;
  championName: string;
  champLevel: number;
  teamId: number;
  teamPosition: string;
  individualPosition: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  win: boolean;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: {
    statPerks: { defense: number; flex: number; offense: number };
    styles: Array<{
      description: string;
      selections: Array<{ perk: number; var1: number; var2: number; var3: number }>;
      style: number;
    }>;
  };
}

/** Match V5 info */
export interface RiotMatchInfo {
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameType: string;
  mapId: number;
  participants: RiotParticipant[];
  platformId: string;
  queueId: number;
  teams: Array<{
    teamId: number;
    win: boolean;
    bans: Array<{ championId: number; pickTurn: number }>;
    objectives: Record<string, { first: boolean; kills: number }>;
  }>;
}

/** Match V5 full response */
export interface RiotMatchResponse {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: RiotMatchInfo;
}

/** Timeline V5 frame event */
export interface RiotTimelineEvent {
  type: string;
  timestamp: number;
  participantId?: number;
  itemId?: number;
  skillSlot?: number;
  levelUpType?: string;
}

/** Timeline V5 frame */
export interface RiotTimelineFrame {
  events: RiotTimelineEvent[];
  participantFrames: Record<
    string,
    {
      participantId: number;
      totalGold: number;
      level: number;
      xp: number;
      minionsKilled: number;
      jungleMinionsKilled: number;
    }
  >;
  timestamp: number;
}

/** Timeline V5 response */
export interface RiotTimelineResponse {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    frameInterval: number;
    frames: RiotTimelineFrame[];
    participants: Array<{
      participantId: number;
      puuid: string;
    }>;
  };
}

// ─── Spectator V5 Types ──────────────────────────────────────

/** Spectator V5 banned champion */
export interface SpectatorBannedChampion {
  pickTurn: number;
  championId: number;
  teamId: number;
}

/** Spectator V5 participant perks */
export interface SpectatorPerks {
  perkIds: number[];
  perkStyle: number;
  perkSubStyle: number;
}

/** Spectator V5 participant */
export interface SpectatorParticipant {
  championId: number;
  perks?: SpectatorPerks;
  profileIconId: number;
  bot: boolean;
  teamId: number;
  puuid?: string | null;
  summonerId: string;
  spell1Id: number;
  spell2Id: number;
  riotId?: string;
  gameCustomizationObjects?: Array<{ category: string; content: string }>;
}

/** Spectator V5 current game response */
export interface SpectatorCurrentGame {
  gameId: number;
  gameType: string;
  gameStartTime: number;
  mapId: number;
  gameLength: number;
  platformId: string;
  gameMode: string;
  gameQueueConfigId?: number;
  bannedChampions: SpectatorBannedChampion[];
  observers: { encryptionKey: string };
  participants: SpectatorParticipant[];
}

/** Transformed live game data for display */
export interface LiveGameData {
  gameId: number;
  gameMode: string;
  gameLength: number;
  gameStartTime: number;
  mapId: number;
  blueTeam: LiveTeamData;
  redTeam: LiveTeamData;
  bannedChampions: SpectatorBannedChampion[];
}

export interface LiveTeamData {
  teamId: number;
  participants: LiveParticipantData[];
}

export interface LiveParticipantData {
  puuid: string | null;
  summonerName: string;
  championId: number;
  championName: string;
  spell1Id: number;
  spell2Id: number;
  keystoneId: number | null;
  secondaryTreeId: number | null;
  teamId: number;
  isBot: boolean;
}

// ─── Display / Transformed Types ──────────────────────────────

/** Summoner profile for display */
export interface SummonerProfile {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  rankedSolo: {
    tier: string;
    rank: string;
    lp: number;
    wins: number;
    losses: number;
  } | null;
  rankedFlex: {
    tier: string;
    rank: string;
    lp: number;
    wins: number;
    losses: number;
  } | null;
}

/** Single participant summary (used in MatchSummary mini-view) */
export interface ParticipantSummary {
  puuid: string;
  championName: string;
  teamId: number;
  summonerName: string;
}

/** Match summary for the match history list */
export interface MatchSummary {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  win: boolean;
  championName: string;
  champLevel: number;
  position: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  damage: number;
  visionScore: number;
  items: number[];
  spell1: number;
  spell2: number;
  keystoneId: number | null;
  secondaryTreeId: number | null;
  participants: ParticipantSummary[];
}

/** Full participant data for the scoreboard */
export interface FullParticipant {
  puuid: string;
  summonerName: string;
  championName: string;
  champLevel: number;
  teamId: number;
  position: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  damage: number;
  visionScore: number;
  items: number[];
  spell1: number;
  spell2: number;
  keystoneId: number | null;
  secondaryTreeId: number | null;
  win: boolean;
}

/** Full match detail (lazy loaded) */
export interface MatchDetail {
  matchId: string;
  gameDuration: number;
  gameCreation: number;
  participants: FullParticipant[];
  itemTimeline: Record<string, number[]> | null;
  skillOrder: string | null;
}
