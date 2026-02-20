"use client";

import { CyberCard } from "@/components/ui/CyberCard";
import { ItemBuildDisplay } from "@/components/probuilds/ItemBuildDisplay";
import { RuneDisplay } from "@/components/probuilds/RuneDisplay";
import { SpellDisplay } from "@/components/probuilds/SpellDisplay";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { MatchupBuildRecommendation } from "@/lib/engine/recommendation";

interface MatchupBuildProps {
  build: MatchupBuildRecommendation | null;
  isLoading: boolean;
  championKey: string;
  vsChampionKey: string;
  version: string;
}

export function MatchupBuild({
  build,
  isLoading,
  championKey,
  vsChampionKey,
  version,
}: MatchupBuildProps) {
  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!build) {
    return (
      <CyberCard className="p-6">
        <p className="text-fg-muted text-sm text-center">
          No build data available for {championKey} vs {vsChampionKey}
        </p>
      </CyberCard>
    );
  }

  return (
    <CyberCard className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-fg">
          {championKey} vs {vsChampionKey}
        </h3>
        {!build.isMatchupSpecific && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            General build (no matchup data)
          </span>
        )}
      </div>

      {/* Win Rate */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-fg-muted">Win Rate</p>
          <p className="text-2xl font-bold text-accent">
            {build.winRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-fg-muted">Games</p>
          <p className="text-lg font-semibold text-fg">
            {build.games.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Items */}
      {build.items.length > 0 && (
        <div>
          <p className="text-sm font-medium text-fg-secondary mb-2">
            Recommended Items
          </p>
          <ItemBuildDisplay items={build.items} version={version} size={40} />
        </div>
      )}

      {/* Runes */}
      {build.runeKeystoneId && (
        <div>
          <p className="text-sm font-medium text-fg-secondary mb-2">Runes</p>
          <RuneDisplay
            keystoneId={build.runeKeystoneId}
            secondaryTreeId={build.runeSecondaryTreeId}
            size="md"
          />
        </div>
      )}

      {/* Spells */}
      {build.spell1 && (
        <div>
          <p className="text-sm font-medium text-fg-secondary mb-2">
            Summoner Spells
          </p>
          <SpellDisplay
            spell1={build.spell1}
            spell2={build.spell2}
            version={version}
            size={36}
          />
        </div>
      )}
    </CyberCard>
  );
}
