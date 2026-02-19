"use client";

import { useMatchDetail } from "@/hooks/useSummoner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ItemTimeline } from "@/components/probuilds/detail/ItemTimeline";
import { SkillTimeline } from "@/components/probuilds/detail/SkillTimeline";
import { ParticipantTable } from "./ParticipantTable";
import { formatKDA, calculateKDARatio } from "@/lib/utils/helpers";
import type { MatchSummary } from "@/lib/riot/types";

interface MatchHistoryDetailProps {
  match: MatchSummary;
  puuid: string;
  region: string;
}

export function MatchHistoryDetail({ match, puuid, region }: MatchHistoryDetailProps) {
  const { detail, isLoading } = useMatchDetail(match.matchId, puuid, region);

  if (isLoading) return <LoadingSpinner size="sm" />;

  const durationMin = Math.round(match.gameDuration / 60);

  const stats = [
    { label: "KDA", value: formatKDA(match.kills, match.deaths, match.assists) },
    { label: "KDA Ratio", value: calculateKDARatio(match.kills, match.deaths, match.assists) },
    { label: "CS", value: String(match.cs) },
    { label: "Gold", value: `${(match.gold / 1000).toFixed(1)}k` },
    { label: "Damage", value: `${(match.damage / 1000).toFixed(1)}k` },
    { label: "Vision", value: String(match.visionScore) },
    { label: "Duration", value: `${durationMin}m` },
  ];

  return (
    <div className="px-6 py-5 bg-surface-secondary border-t border-border space-y-5">
      {/* Stats grid */}
      <div>
        <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
          Match Stats
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-tertiary px-3 py-2.5 rounded-lg border border-border">
              <p className="text-xs text-fg-muted">{stat.label}</p>
              <p className="font-mono text-sm text-accent font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline data from detail fetch */}
      {detail && (detail.itemTimeline || detail.skillOrder) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {detail.itemTimeline && <ItemTimeline timeline={detail.itemTimeline} />}
          {detail.skillOrder && <SkillTimeline skillOrder={detail.skillOrder} />}
        </div>
      )}

      {/* Scoreboard */}
      {detail && (
        <ParticipantTable participants={detail.participants} currentPuuid={puuid} />
      )}
    </div>
  );
}
