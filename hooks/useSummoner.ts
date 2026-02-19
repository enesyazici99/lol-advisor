"use client";

import useSWR from "swr";
import type { SummonerProfile, MatchSummary, MatchDetail } from "@/lib/riot/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function useSummonerAccount(
  gameName: string | null,
  tagLine: string | null,
  region: string
) {
  const params = new URLSearchParams();
  if (gameName) params.set("gameName", gameName);
  if (tagLine) params.set("tagLine", tagLine);
  params.set("region", region);

  const key =
    gameName && tagLine ? `/api/riot/account?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<SummonerProfile>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return { profile: data || null, isLoading, error };
}

interface MatchHistoryResponse {
  matches: MatchSummary[];
  start: number;
  count: number;
  hasMore: boolean;
}

export function useMatchHistory(
  puuid: string | null,
  region: string,
  start = 0
) {
  const params = new URLSearchParams();
  if (puuid) params.set("puuid", puuid);
  params.set("region", region);
  params.set("start", String(start));

  const key = puuid ? `/api/riot/matches?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<MatchHistoryResponse>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    matches: data?.matches || [],
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    mutate,
  };
}

export function useMatchDetail(
  matchId: string | null,
  puuid: string | null,
  region: string
) {
  const params = new URLSearchParams();
  if (puuid) params.set("puuid", puuid);
  params.set("region", region);

  const key =
    matchId && puuid
      ? `/api/riot/match/${matchId}?${params.toString()}`
      : null;

  const { data, error, isLoading } = useSWR<MatchDetail>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return { detail: data || null, isLoading, error };
}
