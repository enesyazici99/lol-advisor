"use client";

import useSWR from "swr";
import type { ScoredMatchup } from "@/lib/engine/scoring";
import type { MatchupBuildRecommendation } from "@/lib/engine/recommendation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CountersResponse {
  bestPicks: ScoredMatchup[];
  worstPicks: ScoredMatchup[];
}

interface RecommendationResponse {
  matchupBuild: MatchupBuildRecommendation | null;
  counterPicks: ScoredMatchup[];
}

export function useCounters(vsChampion: string | null, role: string | null) {
  const params = new URLSearchParams();
  if (vsChampion) params.set("champion", vsChampion);
  if (role) params.set("role", role);

  const key =
    vsChampion && role ? `/api/builds/counters?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<CountersResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    bestPicks: data?.bestPicks || [],
    worstPicks: data?.worstPicks || [],
    isLoading,
    error,
  };
}

export function useRecommendation(
  champion: string | null,
  vsChampion: string | null,
  role: string | null
) {
  const params = new URLSearchParams();
  if (champion) params.set("champion", champion);
  if (role) params.set("role", role);
  if (vsChampion) params.set("vs", vsChampion);

  const key =
    champion && vsChampion && role
      ? `/api/builds/recommend?${params.toString()}`
      : null;

  const { data, error, isLoading } = useSWR<RecommendationResponse>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    matchupBuild: data?.matchupBuild || null,
    counterPicks: data?.counterPicks || [],
    isLoading,
    error,
  };
}
