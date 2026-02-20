"use client";

import useSWR from "swr";
import type { LiveGameData } from "@/lib/riot/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

interface SpectatorResponse {
  inGame: boolean;
  game: LiveGameData | null;
  error?: string;
}

export function useLiveGame(
  puuid: string | null,
  region: string,
  enabled = true
) {
  const params = new URLSearchParams();
  if (puuid) params.set("puuid", puuid);
  params.set("region", region);

  const key =
    puuid && enabled ? `/api/riot/spectator?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<SpectatorResponse>(
    key,
    fetcher,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    inGame: data?.inGame || false,
    game: data?.game || null,
    isLoading,
    error: error || (data?.error ? new Error(data.error) : null),
    refresh: mutate,
  };
}
