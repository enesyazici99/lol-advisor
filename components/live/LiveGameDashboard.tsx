"use client";

import { useState, useMemo } from "react";
import { CyberCard } from "@/components/ui/CyberCard";
import { TeamCard } from "./TeamCard";
import { MatchupBuild } from "@/components/advisor/MatchupBuild";
import { useRecommendation } from "@/hooks/useAdvisor";
import type { LiveGameData } from "@/lib/riot/types";
import type { Role } from "@/lib/riot/constants";

interface LiveGameDashboardProps {
  game: LiveGameData;
  targetPuuid: string;
  version: string;
}

const INDEX_TO_ROLE: Role[] = ["TOP", "JGL", "MID", "ADC", "SUP"];

export function LiveGameDashboard({
  game,
  targetPuuid,
  version,
}: LiveGameDashboardProps) {
  const [selectedLane, setSelectedLane] = useState<number | null>(null);

  // Find which team the target is on
  const isBlueTeam = game.blueTeam.participants.some(
    (p) => p.puuid === targetPuuid
  );
  const myTeam = isBlueTeam ? game.blueTeam : game.redTeam;
  const enemyTeam = isBlueTeam ? game.redTeam : game.blueTeam;

  // Find target player's position
  const myIndex = myTeam.participants.findIndex(
    (p) => p.puuid === targetPuuid
  );
  const myChampion = myTeam.participants[myIndex]?.championName || null;

  // Determine lane opponent
  const laneIndex = selectedLane ?? myIndex;
  const laneOpponent = enemyTeam.participants[laneIndex]?.championName || null;
  const laneRole = INDEX_TO_ROLE[laneIndex] || null;

  // Get recommendation for my champion vs lane opponent
  const { matchupBuild, isLoading: buildLoading } = useRecommendation(
    myChampion,
    laneOpponent,
    laneRole
  );

  // Game duration display
  const gameDuration = useMemo(() => {
    const mins = Math.floor(game.gameLength / 60);
    const secs = game.gameLength % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [game.gameLength]);

  return (
    <div className="flex flex-col gap-6">
      {/* Game Info Header */}
      <CyberCard className="p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-fg">Live Game</h2>
          <p className="text-sm text-fg-muted">
            {game.gameMode} &middot; {gameDuration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">In Game</span>
        </div>
      </CyberCard>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeamCard
          teamId={game.blueTeam.teamId}
          participants={game.blueTeam.participants}
          version={version}
          targetPuuid={targetPuuid}
          onChampionClick={(_, idx) => setSelectedLane(idx)}
        />
        <TeamCard
          teamId={game.redTeam.teamId}
          participants={game.redTeam.participants}
          version={version}
          targetPuuid={targetPuuid}
          onChampionClick={(_, idx) => setSelectedLane(idx)}
        />
      </div>

      {/* Lane Matchup Build Advice */}
      {myChampion && laneOpponent && (
        <div>
          <h3 className="text-sm font-medium text-fg-secondary mb-3">
            Lane Matchup: {myChampion} vs {laneOpponent}
            {laneRole && <span className="text-fg-muted"> ({laneRole})</span>}
          </h3>
          <MatchupBuild
            build={matchupBuild}
            isLoading={buildLoading}
            championKey={myChampion}
            vsChampionKey={laneOpponent}
            version={version}
          />
        </div>
      )}

      {/* Bans */}
      {game.bannedChampions.length > 0 && (
        <CyberCard className="p-4">
          <h3 className="text-sm font-medium text-fg-secondary mb-2">Bans</h3>
          <div className="flex gap-4">
            <div>
              <span className="text-xs text-blue-400">Blue</span>
              <div className="flex gap-1 mt-1">
                {game.bannedChampions
                  .filter((b) => b.teamId === 100)
                  .map((b, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-surface-tertiary px-2 py-1 rounded text-fg-muted"
                    >
                      {b.championId > 0 ? `#${b.championId}` : "None"}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-red-400">Red</span>
              <div className="flex gap-1 mt-1">
                {game.bannedChampions
                  .filter((b) => b.teamId === 200)
                  .map((b, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-surface-tertiary px-2 py-1 rounded text-fg-muted"
                    >
                      {b.championId > 0 ? `#${b.championId}` : "None"}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </CyberCard>
      )}
    </div>
  );
}
