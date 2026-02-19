"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { SEARCH_REGIONS } from "@/lib/riot/types";

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const router = useRouter();

  const [selectedRegion, setSelectedRegion] = useState("tr1");

  const isSummonerSearch = searchQuery.includes("#");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !isSummonerSearch) return;

    const parts = searchQuery.split("#");
    const gameName = parts[0].trim();
    const tagLine = parts[1]?.trim();

    if (!gameName || !tagLine) return;

    const slug = `${gameName}-${tagLine}`;
    router.push(`/summoner/${selectedRegion}/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="mb-8">
      <div className="flex gap-2">
        {isSummonerSearch && (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-3.5 bg-surface-secondary border border-border rounded-xl text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          >
            {SEARCH_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Search champions... or Name#TAG for summoner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-5 py-3.5 bg-surface-secondary border border-border rounded-xl text-base text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </div>
      {isSummonerSearch && (
        <p className="text-xs text-accent mt-2 ml-1">
          Press Enter to search summoner
        </p>
      )}
    </div>
  );
}
