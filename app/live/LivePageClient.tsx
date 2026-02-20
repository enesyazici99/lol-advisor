"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSummonerAccount } from "@/hooks/useSummoner";
import { useLiveGame } from "@/hooks/useLiveGame";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LiveGameDashboard } from "@/components/live/LiveGameDashboard";
import { ManualTeamInput } from "@/components/live/ManualTeamInput";
import { SEARCH_REGIONS } from "@/lib/riot/types";
import type { DDragonChampion } from "@/lib/riot/ddragon";

interface LivePageClientProps {
  champions: Record<string, DDragonChampion>;
  version: string;
}

export function LivePageClient({ champions, version }: LivePageClientProps) {
  const searchParams = useSearchParams();

  // URL params for auto-connect
  const summonerParam = searchParams.get("summoner");
  const regionParam = searchParams.get("region") || "tr1";

  // Manual search state
  const [searchName, setSearchName] = useState(
    summonerParam?.split("-")[0] || ""
  );
  const [searchTag, setSearchTag] = useState(
    summonerParam?.split("-")[1] || ""
  );
  const [searchRegion, setSearchRegion] = useState(regionParam);
  const [activeSearch, setActiveSearch] = useState<{
    gameName: string;
    tagLine: string;
    region: string;
  } | null>(
    summonerParam
      ? {
          gameName: summonerParam.split("-")[0],
          tagLine: summonerParam.split("-")[1] || "",
          region: regionParam,
        }
      : null
  );

  const [mode, setMode] = useState<"live" | "manual">(
    activeSearch ? "live" : "manual"
  );

  // Fetch summoner
  const { profile, isLoading: profileLoading } = useSummonerAccount(
    activeSearch?.gameName || null,
    activeSearch?.tagLine || null,
    activeSearch?.region || "tr1"
  );

  // Fetch live game
  const {
    inGame,
    game,
    isLoading: gameLoading,
    refresh,
  } = useLiveGame(
    profile?.puuid || null,
    activeSearch?.region || "tr1",
    mode === "live"
  );

  const handleSearch = () => {
    if (searchName && searchTag) {
      setActiveSearch({
        gameName: searchName,
        tagLine: searchTag,
        region: searchRegion,
      });
      setMode("live");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-fg">
          Live <span className="text-accent">Game</span>
        </h1>
        <p className="text-fg-muted text-sm mt-1">
          Track active games or manually input team compositions for analysis
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <CyberButton
          variant="tab"
          active={mode === "live"}
          onClick={() => setMode("live")}
        >
          Live Detect
        </CyberButton>
        <CyberButton
          variant="tab"
          active={mode === "manual"}
          onClick={() => setMode("manual")}
        >
          Manual Input
        </CyberButton>
      </div>

      {mode === "live" ? (
        <>
          {/* Summoner Search */}
          <CyberCard className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Game Name"
                className="flex-1 px-3 py-2 rounded-lg bg-surface-tertiary border border-border text-fg text-sm focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <input
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="Tag"
                className="w-24 px-3 py-2 rounded-lg bg-surface-tertiary border border-border text-fg text-sm focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <select
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface-tertiary border border-border text-fg text-sm focus:outline-none focus:border-accent"
              >
                {SEARCH_REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <CyberButton variant="primary" onClick={handleSearch}>
                Check
              </CyberButton>
            </div>
          </CyberCard>

          {/* Loading / Results */}
          {(profileLoading || gameLoading) && activeSearch && (
            <LoadingSpinner />
          )}

          {profile && !gameLoading && (
            <>
              {inGame && game ? (
                <LiveGameDashboard
                  game={game}
                  targetPuuid={profile.puuid}
                  version={version}
                />
              ) : (
                <CyberCard className="p-8">
                  <div className="text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-fg-muted text-xl">
                      ?
                    </div>
                    <p className="text-fg font-semibold">
                      {profile.gameName}#{profile.tagLine} is not in a game
                    </p>
                    <p className="text-fg-muted text-sm">
                      Auto-checking every 30 seconds. You can also use Manual Input mode.
                    </p>
                    <CyberButton
                      variant="secondary"
                      onClick={() => refresh()}
                      className="mt-2"
                    >
                      Check Again
                    </CyberButton>
                  </div>
                </CyberCard>
              )}
            </>
          )}

          {!activeSearch && (
            <CyberCard className="p-12 text-center">
              <p className="text-fg-muted">
                Enter a summoner name to check for active games
              </p>
            </CyberCard>
          )}
        </>
      ) : (
        <ManualTeamInput champions={champions} version={version} />
      )}
    </div>
  );
}
