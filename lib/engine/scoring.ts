import { createServerClient } from "@/lib/supabase/server";
import type { MatchupData } from "@/lib/supabase/types";

export interface ScoredMatchup {
  championKey: string;
  winRate: number;
  games: number;
  delta: number;
  tier: string;
  tierScore: number;
}

// ─── Tier Calculation ───────────────────────────────────────

export function calculateTier(tierScore: number): string {
  if (tierScore > 54) return "S+";
  if (tierScore > 52) return "S";
  if (tierScore > 50) return "A";
  if (tierScore > 48) return "B";
  return "C";
}

export function calculateTierScore(
  matchupWinRate: number,
  generalWinRate: number,
  pickRate: number
): number {
  return matchupWinRate * 0.6 + generalWinRate * 0.25 + pickRate * 0.15;
}

// ─── Score a Single Matchup ─────────────────────────────────

export function scoreMatchup(matchup: MatchupData, generalWinRate = 50, pickRate = 5): ScoredMatchup {
  const tierScore = calculateTierScore(matchup.win_rate, generalWinRate, pickRate);
  return {
    championKey: matchup.champion_key,
    winRate: matchup.win_rate,
    games: matchup.games,
    delta: matchup.delta,
    tier: calculateTier(tierScore),
    tierScore,
  };
}

// ─── Get Counter Picks (best champions vs target) ───────────

export async function getCounterPicks(
  vsChampion: string,
  role: string,
  limit = 10
): Promise<ScoredMatchup[]> {
  const supabase = createServerClient();

  const { data: matchups, error } = await supabase
    .from("matchup_data")
    .select("*")
    .eq("vs_champion_key", vsChampion)
    .eq("role", role)
    .gte("games", 50)
    .order("win_rate", { ascending: false })
    .limit(limit);

  if (error || !matchups) return [];

  // Get precomputed scores for general win rate / pick rate
  const championKeys = matchups.map((m: MatchupData) => m.champion_key);
  const { data: scores } = await supabase
    .from("precomputed_scores")
    .select("*")
    .in("champion_key", championKeys)
    .eq("role", role);

  const scoreMap = new Map<string, { generalWinRate: number; pickRate: number }>();
  if (scores) {
    for (const s of scores) {
      scoreMap.set(s.champion_key, {
        generalWinRate: s.general_win_rate,
        pickRate: s.pick_rate,
      });
    }
  }

  return matchups.map((m: MatchupData) => {
    const score = scoreMap.get(m.champion_key);
    return scoreMatchup(m, score?.generalWinRate ?? 50, score?.pickRate ?? 5);
  });
}

// ─── Get Weak Picks (worst champions vs target) ─────────────

export async function getWeakPicks(
  vsChampion: string,
  role: string,
  limit = 10
): Promise<ScoredMatchup[]> {
  const supabase = createServerClient();

  const { data: matchups, error } = await supabase
    .from("matchup_data")
    .select("*")
    .eq("vs_champion_key", vsChampion)
    .eq("role", role)
    .gte("games", 50)
    .order("win_rate", { ascending: true })
    .limit(limit);

  if (error || !matchups) return [];

  const championKeys = matchups.map((m: MatchupData) => m.champion_key);
  const { data: scores } = await supabase
    .from("precomputed_scores")
    .select("*")
    .in("champion_key", championKeys)
    .eq("role", role);

  const scoreMap = new Map<string, { generalWinRate: number; pickRate: number }>();
  if (scores) {
    for (const s of scores) {
      scoreMap.set(s.champion_key, {
        generalWinRate: s.general_win_rate,
        pickRate: s.pick_rate,
      });
    }
  }

  return matchups.map((m: MatchupData) => {
    const score = scoreMap.get(m.champion_key);
    return scoreMatchup(m, score?.generalWinRate ?? 50, score?.pickRate ?? 5);
  });
}
