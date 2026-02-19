"use client";

import Image from "next/image";
import { championIconUrl } from "@/lib/riot/ddragon";
import { formatKDA } from "@/lib/utils/helpers";
import { ItemBuildDisplay } from "@/components/probuilds/ItemBuildDisplay";
import { useAppStore } from "@/stores/appStore";
import type { FullParticipant } from "@/lib/riot/types";

interface ParticipantTableProps {
  participants: FullParticipant[];
  currentPuuid: string;
}

function TeamTable({
  team,
  teamName,
  won,
  version,
  currentPuuid,
}: {
  team: FullParticipant[];
  teamName: string;
  won: boolean;
  version: string;
  currentPuuid: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-bold uppercase ${
            won ? "text-win" : "text-loss"
          }`}
        >
          {teamName}
        </span>
        <span className="text-xs text-fg-muted">{won ? "Victory" : "Defeat"}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-fg-muted border-b border-border">
              <th className="text-left py-1.5 px-2 font-semibold">Champion</th>
              <th className="text-left py-1.5 px-2 font-semibold">Player</th>
              <th className="text-center py-1.5 px-1 font-semibold">KDA</th>
              <th className="text-center py-1.5 px-1 font-semibold hidden sm:table-cell">CS</th>
              <th className="text-center py-1.5 px-1 font-semibold hidden md:table-cell">Gold</th>
              <th className="text-center py-1.5 px-1 font-semibold hidden md:table-cell">Dmg</th>
              <th className="text-left py-1.5 px-2 font-semibold hidden lg:table-cell">Items</th>
            </tr>
          </thead>
          <tbody>
            {team.map((p) => {
              const isCurrentPlayer = p.puuid === currentPuuid;
              return (
                <tr
                  key={p.puuid}
                  className={`border-b border-border/50 ${
                    isCurrentPlayer ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1.5">
                      {version && (
                        <div className="w-6 h-6 rounded overflow-hidden border border-border flex-shrink-0">
                          <Image
                            src={championIconUrl(version, p.championName)}
                            alt={p.championName}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-fg truncate max-w-[80px]">
                        {p.championName}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2">
                    <span
                      className={`truncate max-w-[100px] block ${
                        isCurrentPlayer ? "text-accent font-bold" : "text-fg-muted"
                      }`}
                    >
                      {p.summonerName}
                    </span>
                  </td>
                  <td className="text-center py-1.5 px-1 font-mono">
                    {formatKDA(p.kills, p.deaths, p.assists)}
                  </td>
                  <td className="text-center py-1.5 px-1 font-mono hidden sm:table-cell">
                    {p.cs}
                  </td>
                  <td className="text-center py-1.5 px-1 font-mono hidden md:table-cell">
                    {(p.gold / 1000).toFixed(1)}k
                  </td>
                  <td className="text-center py-1.5 px-1 font-mono hidden md:table-cell">
                    {(p.damage / 1000).toFixed(1)}k
                  </td>
                  <td className="py-1.5 px-2 hidden lg:table-cell">
                    {version && (
                      <ItemBuildDisplay items={p.items} version={version} size={20} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ParticipantTable({ participants, currentPuuid }: ParticipantTableProps) {
  const version = useAppStore((s) => s.version);

  const blueTeam = participants.filter((p) => p.teamId === 100);
  const redTeam = participants.filter((p) => p.teamId === 200);
  const blueWon = blueTeam[0]?.win ?? false;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
        Scoreboard
      </h4>
      <TeamTable
        team={blueTeam}
        teamName="Blue Team"
        won={blueWon}
        version={version}
        currentPuuid={currentPuuid}
      />
      <TeamTable
        team={redTeam}
        teamName="Red Team"
        won={!blueWon}
        version={version}
        currentPuuid={currentPuuid}
      />
    </div>
  );
}
