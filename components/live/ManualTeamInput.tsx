"use client";

import { useState, useEffect } from "react";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { ChampionSelect } from "@/components/advisor/ChampionSelect";
import { RolePicker } from "@/components/advisor/RolePicker";
import { MatchupBuild } from "@/components/advisor/MatchupBuild";
import { CounterList } from "@/components/advisor/CounterList";
import { useCounters, useRecommendation } from "@/hooks/useAdvisor";
import type { DDragonChampion } from "@/lib/riot/ddragon";
import type { Role } from "@/lib/riot/constants";

interface ManualTeamInputProps {
  champions: Record<string, DDragonChampion>;
  version: string;
  initialMyChampion?: string | null;
  initialMyRole?: Role | null;
  initialEnemyChampions?: (string | null)[];
}

export function ManualTeamInput({
  champions,
  version,
  initialMyChampion,
  initialMyRole,
  initialEnemyChampions,
}: ManualTeamInputProps) {
  const [myChampion, setMyChampion] = useState<string | null>(initialMyChampion ?? null);
  const [myRole, setMyRole] = useState<Role | null>(initialMyRole ?? null);
  const [enemyChampions, setEnemyChampions] = useState<(string | null)[]>(
    initialEnemyChampions ?? [null, null, null, null, null]
  );
  const [showAdvice, setShowAdvice] = useState(false);

  // Sync from external initial values (e.g., LCU auto-fill)
  useEffect(() => {
    if (initialMyChampion !== undefined) setMyChampion(initialMyChampion);
  }, [initialMyChampion]);

  useEffect(() => {
    if (initialMyRole !== undefined) setMyRole(initialMyRole);
  }, [initialMyRole]);

  useEffect(() => {
    if (initialEnemyChampions) setEnemyChampions(initialEnemyChampions);
  }, [initialEnemyChampions]);

  const ROLES: Role[] = ["TOP", "JGL", "MID", "ADC", "SUP"];

  // Get lane opponent based on role
  const laneOpponent =
    myRole && enemyChampions[ROLES.indexOf(myRole)]
      ? enemyChampions[ROLES.indexOf(myRole)]
      : null;

  const { bestPicks, worstPicks } = useCounters(
    laneOpponent,
    myRole
  );

  const { matchupBuild, isLoading: buildLoading } = useRecommendation(
    myChampion,
    laneOpponent,
    myRole
  );

  const handleEnemySelect = (index: number, championKey: string) => {
    const updated = [...enemyChampions];
    updated[index] = championKey || null;
    setEnemyChampions(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* My Champion + Role */}
      <CyberCard className="p-5 flex flex-col gap-5">
        <h3 className="text-sm font-bold text-fg">Your Pick</h3>
        <RolePicker selectedRole={myRole} onSelect={setMyRole} />
        <ChampionSelect
          champions={champions}
          version={version}
          selectedChampion={myChampion}
          onSelect={(key) => setMyChampion(key || null)}
          label="Your Champion"
          placeholder="Search your champion..."
        />
      </CyberCard>

      {/* Enemy Team */}
      <CyberCard className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-fg">Enemy Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ROLES.map((role, idx) => (
            <div key={role} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-fg-muted text-center">
                {role}
              </span>
              <ChampionSelect
                champions={champions}
                version={version}
                selectedChampion={enemyChampions[idx]}
                onSelect={(key) => handleEnemySelect(idx, key)}
                label=""
                placeholder={role}
              />
            </div>
          ))}
        </div>

        {myRole && laneOpponent && (
          <CyberButton
            variant="primary"
            onClick={() => setShowAdvice(true)}
            className="mt-2"
          >
            Get Matchup Advice
          </CyberButton>
        )}
      </CyberCard>

      {/* Results */}
      {showAdvice && myRole && laneOpponent && (
        <>
          {/* Lane matchup build */}
          {myChampion && (
            <MatchupBuild
              build={matchupBuild}
              isLoading={buildLoading}
              championKey={myChampion}
              vsChampionKey={laneOpponent}
              version={version}
            />
          )}

          {/* Counter picks */}
          <CyberCard className="p-5">
            <h3 className="text-sm font-bold text-fg mb-3">
              Counter Picks vs {laneOpponent}
            </h3>
            <CounterList
              bestPicks={bestPicks}
              worstPicks={worstPicks}
              version={version}
              onChampionClick={(key) => {
                setMyChampion(key);
              }}
            />
          </CyberCard>
        </>
      )}
    </div>
  );
}
