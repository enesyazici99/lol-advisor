import { createServerClient } from "@/lib/supabase/server";
import type { MetaBuild } from "@/lib/supabase/types";

export interface MatchupBuildRecommendation {
  items: number[];
  runeKeystoneId: number | null;
  runeSecondaryTreeId: number | null;
  spell1: number | null;
  spell2: number | null;
  winRate: number;
  games: number;
  isMatchupSpecific: boolean;
}

export async function getMatchupBuild(
  champion: string,
  vsChampion: string,
  role: string
): Promise<MatchupBuildRecommendation | null> {
  const supabase = createServerClient();

  // Try matchup-specific build first
  const { data: matchup } = await supabase
    .from("matchup_data")
    .select("*")
    .eq("champion_key", champion)
    .eq("vs_champion_key", vsChampion)
    .eq("role", role)
    .single();

  if (matchup && matchup.recommended_items && matchup.recommended_items.length > 0) {
    return {
      items: matchup.recommended_items,
      runeKeystoneId: matchup.recommended_runes?.keystone ?? null,
      runeSecondaryTreeId: matchup.recommended_runes?.secondary ?? null,
      spell1: matchup.recommended_spells?.spell1 ?? null,
      spell2: matchup.recommended_spells?.spell2 ?? null,
      winRate: matchup.win_rate,
      games: matchup.games,
      isMatchupSpecific: true,
    };
  }

  // Fallback: general meta build
  return getMetaFallback(champion, role);
}

async function getMetaFallback(
  champion: string,
  role: string
): Promise<MatchupBuildRecommendation | null> {
  const supabase = createServerClient();

  const { data: builds } = await supabase
    .from("meta_builds")
    .select("*")
    .eq("champion_key", champion);

  if (!builds || builds.length === 0) return null;

  // Prefer role-specific, fallback to ALL
  const build: MetaBuild =
    builds.find((b: MetaBuild) => b.role === role) ||
    builds.find((b: MetaBuild) => b.role === "ALL") ||
    builds[0];

  const items = [
    ...build.popular_boots.slice(0, 1).map((b) => b.id),
    ...build.popular_items.slice(0, 5).map((i) => i.id),
  ];

  const topRune = build.popular_runes[0] ?? null;
  const topSpell = build.popular_spells[0] ?? null;

  return {
    items,
    runeKeystoneId: topRune?.keystone ?? null,
    runeSecondaryTreeId: topRune?.secondary ?? null,
    spell1: topSpell?.spell1 ?? null,
    spell2: topSpell?.spell2 ?? null,
    winRate: build.win_rate,
    games: build.match_count,
    isMatchupSpecific: false,
  };
}
