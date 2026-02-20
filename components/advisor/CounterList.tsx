"use client";

import { useState } from "react";
import Image from "next/image";
import { championIconUrl, getChampionDisplayName } from "@/lib/riot/ddragon";
import { CyberButton } from "@/components/ui/CyberButton";
import type { ScoredMatchup } from "@/lib/engine/scoring";

interface CounterListProps {
  bestPicks: ScoredMatchup[];
  worstPicks: ScoredMatchup[];
  version: string;
  onChampionClick?: (championKey: string) => void;
}

const TIER_COLORS: Record<string, string> = {
  "S+": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  S: "bg-green-500/20 text-green-400 border-green-500/30",
  A: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  B: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  C: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function CounterList({
  bestPicks,
  worstPicks,
  version,
  onChampionClick,
}: CounterListProps) {
  const [tab, setTab] = useState<"best" | "worst">("best");
  const picks = tab === "best" ? bestPicks : worstPicks;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <CyberButton
          variant="tab"
          active={tab === "best"}
          onClick={() => setTab("best")}
        >
          Strong Against
        </CyberButton>
        <CyberButton
          variant="tab"
          active={tab === "worst"}
          onClick={() => setTab("worst")}
        >
          Weak Against
        </CyberButton>
      </div>

      {picks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-fg-muted text-sm">No matchup data yet</p>
          <p className="text-fg-muted text-xs mt-1">
            Data will be available after the next cron sync
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {picks.map((pick, idx) => (
            <button
              key={pick.championKey}
              onClick={() => onChampionClick?.(pick.championKey)}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-tertiary border border-border hover:border-accent transition-colors text-left"
            >
              <span className="text-fg-muted text-sm w-5 text-right font-mono">
                {idx + 1}
              </span>
              {version && (
                <Image
                  src={championIconUrl(version, pick.championKey)}
                  alt={pick.championKey}
                  width={36}
                  height={36}
                  className="rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fg text-sm truncate">
                  {getChampionDisplayName(pick.championKey)}
                </p>
                <p className="text-xs text-fg-muted">
                  {pick.games.toLocaleString()} games
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    tab === "best" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pick.winRate.toFixed(1)}%
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                    TIER_COLORS[pick.tier] || TIER_COLORS.B
                  }`}
                >
                  {pick.tier}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
