"use client";

import Image from "next/image";
import { championIconUrl, getChampionDisplayName } from "@/lib/riot/ddragon";
import { SUMMONER_SPELLS } from "@/lib/riot/constants";
import { CyberCard } from "@/components/ui/CyberCard";
import type { LiveParticipantData } from "@/lib/riot/types";

interface TeamCardProps {
  teamId: number;
  participants: LiveParticipantData[];
  version: string;
  targetPuuid?: string | null;
  onChampionClick?: (championName: string, position: number) => void;
}

const POSITION_LABELS = ["TOP", "JGL", "MID", "ADC", "SUP"];

export function TeamCard({
  teamId,
  participants,
  version,
  targetPuuid,
  onChampionClick,
}: TeamCardProps) {
  const isBlue = teamId === 100;
  const teamLabel = isBlue ? "Blue Team" : "Red Team";
  const borderColor = isBlue ? "border-blue-500/30" : "border-red-500/30";
  const headerBg = isBlue ? "bg-blue-500/10" : "bg-red-500/10";
  const headerText = isBlue ? "text-blue-400" : "text-red-400";

  return (
    <CyberCard className={`${borderColor} overflow-hidden`}>
      <div className={`${headerBg} px-4 py-2`}>
        <h3 className={`font-bold text-sm ${headerText}`}>{teamLabel}</h3>
      </div>
      <div className="divide-y divide-border">
        {participants.map((p, idx) => {
          const isTarget = targetPuuid && p.puuid === targetPuuid;
          const s1 = SUMMONER_SPELLS[p.spell1Id];
          const s2 = SUMMONER_SPELLS[p.spell2Id];

          return (
            <button
              key={p.puuid || idx}
              onClick={() => onChampionClick?.(p.championName, idx)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-tertiary transition-colors text-left ${
                isTarget ? "bg-accent/10 border-l-2 border-accent" : ""
              }`}
            >
              {/* Position label */}
              <span className="text-xs font-mono text-fg-muted w-6">
                {POSITION_LABELS[idx] || "?"}
              </span>

              {/* Champion icon */}
              {version && (
                <Image
                  src={championIconUrl(version, p.championName)}
                  alt={p.championName}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              )}

              {/* Name + Champion */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isTarget ? "text-accent" : "text-fg"}`}>
                  {p.summonerName}
                </p>
                <p className="text-xs text-fg-muted">
                  {getChampionDisplayName(p.championName)}
                </p>
              </div>

              {/* Spells */}
              <div className="flex gap-0.5">
                {s1 && (
                  <span className="text-[10px] text-fg-muted bg-surface-tertiary px-1 py-0.5 rounded">
                    {s1.name}
                  </span>
                )}
                {s2 && (
                  <span className="text-[10px] text-fg-muted bg-surface-tertiary px-1 py-0.5 rounded">
                    {s2.name}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </CyberCard>
  );
}
