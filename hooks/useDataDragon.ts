"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { championIconUrl, itemIconUrl, spellIconUrl } from "@/lib/riot/ddragon";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useVersion() {
  const setVersion = useAppStore((s) => s.setVersion);
  const { data } = useSWR("/api/ddragon/version", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  });

  useEffect(() => {
    if (data?.version) setVersion(data.version);
  }, [data, setVersion]);

  return data?.version || "";
}

export function useChampionIcon(version: string, championId: string) {
  if (!version || !championId) return "";
  return championIconUrl(version, championId);
}

export function useItemIcon(version: string, itemId: number | string) {
  if (!version || !itemId) return "";
  return itemIconUrl(version, String(itemId));
}

export function useSpellIcon(version: string, spellKey: string) {
  if (!version || !spellKey) return "";
  return spellIconUrl(version, spellKey);
}
