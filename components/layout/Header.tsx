"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { isTauri } from "@/lib/desktop/tauri";
import { LCUStatus } from "@/components/desktop/LCUStatus";
import { SEARCH_REGIONS } from "@/lib/riot/types";

export function Header() {
  const version = useAppStore((s) => s.version);
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/90 border-b border-border/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-fg flex-shrink-0"
        >
          LOL<span className="text-accent">.ADV</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 flex-shrink-0" aria-label="Main navigation">
          <Link
            href="/"
            className="text-sm font-medium text-fg-secondary hover:text-fg transition-colors px-3 py-1.5 rounded-md hover:bg-surface-secondary"
          >
            Champions
          </Link>
          <Link
            href="/advisor"
            className="text-sm font-medium text-fg-secondary hover:text-fg transition-colors px-3 py-1.5 rounded-md hover:bg-surface-secondary"
          >
            Advisor
          </Link>
          <Link
            href="/live"
            className="text-sm font-medium text-fg-secondary hover:text-fg transition-colors px-3 py-1.5 rounded-md hover:bg-surface-secondary"
          >
            Live
          </Link>
        </nav>

        <div className="hidden sm:block w-px h-5 bg-border flex-shrink-0" />

        {/* Search */}
        <div className="flex flex-1 gap-2 min-w-0">
          {isSummonerSearch && (
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 bg-surface-secondary border border-border rounded-lg text-sm text-fg outline-none focus:border-accent transition-all flex-shrink-0"
              aria-label="Select region"
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
            placeholder="Search champion or summoner (Name#TAG)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search champions or summoners"
            className="flex-1 min-w-0 px-4 py-1.5 bg-surface-secondary border border-border rounded-lg text-sm text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="hidden sm:block w-px h-5 bg-border flex-shrink-0" />

        {/* Right side */}
        {isTauri() && <LCUStatus />}
        {version && (
          <span className="hidden sm:inline flex-shrink-0 font-mono text-xs text-fg-muted bg-surface-secondary border border-border px-3 py-1.5 rounded-lg">
            Patch {version}
          </span>
        )}
      </div>

      {isSummonerSearch && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-2">
          <p className="text-xs text-accent">Press Enter to search summoner</p>
        </div>
      )}
    </header>
  );
}
