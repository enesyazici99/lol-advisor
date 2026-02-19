"use client";

import useSWR from "swr";
import type { ProMatch, MetaBuild } from "@/lib/supabase/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ProMatchesResponse {
  matches: ProMatch[];
  page: number;
  hasMore: boolean;
}

interface MetaResponse {
  builds: MetaBuild[];
}

export function useProMatches(
  champion: string | null,
  role?: string | null,
  region?: string | null,
  page = 1
) {
  const params = new URLSearchParams();
  if (champion) params.set("champion", champion);
  if (role) params.set("role", role);
  if (region) params.set("region", region);
  params.set("page", String(page));

  const key = champion ? `/api/builds/pro-matches?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<ProMatchesResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    matches: data?.matches || [],
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    mutate,
  };
}

export function useMetaBuild(champion: string | null, role?: string | null) {
  const params = new URLSearchParams();
  if (champion) params.set("champion", champion);
  if (role) params.set("role", role);

  const key = champion ? `/api/builds/meta?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<MetaResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    builds: data?.builds || [],
    isLoading,
    error,
  };
}
