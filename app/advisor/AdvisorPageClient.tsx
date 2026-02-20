"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { useCounters, useRecommendation } from "@/hooks/useAdvisor";
import { useSummonerAccount, useMatchHistory } from "@/hooks/useSummoner";
import { normalizePosition } from "@/lib/riot/transforms";
import { CyberCard } from "@/components/ui/CyberCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RolePicker } from "@/components/advisor/RolePicker";
import { ChampionSelect } from "@/components/advisor/ChampionSelect";
import { CounterList } from "@/components/advisor/CounterList";
import { MatchupBuild } from "@/components/advisor/MatchupBuild";
import type { DDragonChampion } from "@/lib/riot/ddragon";
import type { Role } from "@/lib/riot/constants";

interface AdvisorPageClientProps {
  champions: Record<string, DDragonChampion>;
  version: string;
}

export function AdvisorPageClient({ champions, version }: AdvisorPageClientProps) {
  const searchParams = useSearchParams();
  const advisorRole = useAppStore((s) => s.advisorRole);
  const setAdvisorRole = useAppStore((s) => s.setAdvisorRole);
  const advisorVsChampion = useAppStore((s) => s.advisorVsChampion);
  const setAdvisorVsChampion = useAppStore((s) => s.setAdvisorVsChampion);

  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);
  const [autoDetectedRole, setAutoDetectedRole] = useState<Role | null>(null);

  // Summoner auto-detect from URL params
  const summonerParam = searchParams.get("summoner");
  const regionParam = searchParams.get("region") || "tr1";

  const [gameName, tagLine] = summonerParam?.split("-") || [null, null];

  const { profile } = useSummonerAccount(gameName, tagLine, regionParam);
  const { matches } = useMatchHistory(profile?.puuid || null, regionParam);

  // Auto-detect role from match history
  useEffect(() => {
    if (matches.length === 0) return;

    const roleCounts: Record<string, number> = {};
    for (const match of matches.slice(0, 20)) {
      const pos = normalizePosition(match.position);
      if (pos) {
        roleCounts[pos] = (roleCounts[pos] || 0) + 1;
      }
    }

    const topRole = Object.entries(roleCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topRole) {
      const detected = topRole[0] as Role;
      setAutoDetectedRole(detected);
      if (!advisorRole) {
        setAdvisorRole(detected);
      }
    }
  }, [matches, advisorRole, setAdvisorRole]);

  // Counter data
  const { bestPicks, worstPicks, isLoading: countersLoading } = useCounters(
    advisorVsChampion,
    advisorRole
  );

  // Recommendation data (when a counter pick is clicked)
  const { matchupBuild, isLoading: buildLoading } = useRecommendation(
    selectedChampion,
    advisorVsChampion,
    advisorRole
  );

  const handleChampionClick = (championKey: string) => {
    setSelectedChampion(championKey);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-6 sm:pb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-fg">
          Matchup <span className="text-accent">Advisor</span>
        </h1>
        <p className="text-fg-muted text-xs sm:text-sm mt-1">
          Select your role and lane opponent to get counter picks and build recommendations
        </p>
        {profile && (
          <p className="text-xs text-accent mt-1">
            Playing as: {profile.gameName}#{profile.tagLine}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Selection */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <CyberCard className="p-5 flex flex-col gap-5">
            {/* Role Selection */}
            <RolePicker
              selectedRole={advisorRole}
              onSelect={setAdvisorRole}
              autoDetectedRole={autoDetectedRole}
            />

            {/* VS Champion Selection */}
            <ChampionSelect
              champions={champions}
              version={version}
              selectedChampion={advisorVsChampion}
              onSelect={(key) => {
                setAdvisorVsChampion(key || null);
                setSelectedChampion(null);
              }}
              label="Lane Opponent"
              placeholder="Search enemy champion..."
            />
          </CyberCard>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!advisorRole || !advisorVsChampion ? (
            <CyberCard className="p-12">
              <div className="text-center">
                <p className="text-fg-muted text-base">
                  {!advisorRole
                    ? "Select your role to get started"
                    : "Select the enemy lane champion"}
                </p>
              </div>
            </CyberCard>
          ) : countersLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Counter List */}
              <CyberCard className="p-5">
                <CounterList
                  bestPicks={bestPicks}
                  worstPicks={worstPicks}
                  version={version}
                  onChampionClick={handleChampionClick}
                />
              </CyberCard>

              {/* Matchup Build */}
              {selectedChampion && (
                <MatchupBuild
                  build={matchupBuild}
                  isLoading={buildLoading}
                  championKey={selectedChampion}
                  vsChampionKey={advisorVsChampion}
                  version={version}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
