"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { ChampionSelect } from "@/components/advisor/ChampionSelect";
import { RolePicker } from "@/components/advisor/RolePicker";
import { MatchupBuild } from "@/components/advisor/MatchupBuild";
import { CounterList } from "@/components/advisor/CounterList";
import { useCounters, useRecommendation } from "@/hooks/useAdvisor";
import { championIconUrl } from "@/lib/riot/ddragon";
import type { DDragonChampion } from "@/lib/riot/ddragon";
import type { Role } from "@/lib/riot/constants";

interface ManualTeamInputProps {
  champions: Record<string, DDragonChampion>;
  version: string;
  initialMyChampion?: string | null;
  initialMyRole?: Role | null;
  initialEnemyChampions?: (string | null)[];
}

const ROLES: Role[] = ["TOP", "JGL", "MID", "ADC", "SUP"];

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
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
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

    // Auto-advance to next empty slot
    if (championKey) {
      const nextEmpty = updated.findIndex((c, i) => i > index && !c);
      if (nextEmpty !== -1) {
        setActiveSlot(nextEmpty);
      } else {
        setActiveSlot(null);
      }
    }
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

        {/* Role slot buttons */}
        <div className="grid grid-cols-5 gap-2">
          {ROLES.map((role, idx) => {
            const champKey = enemyChampions[idx];
            const champ = champKey ? champions[champKey] : null;
            const isActive = activeSlot === idx;

            return (
              <button
                key={role}
                onClick={() => setActiveSlot(isActive ? null : idx)}
                className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                  isActive
                    ? "border-accent bg-accent/10"
                    : champ
                    ? "border-border bg-surface-tertiary hover:border-fg-muted"
                    : "border-border border-dashed bg-surface-secondary hover:border-fg-muted"
                }`}
              >
                {champ && version ? (
                  <div className="relative">
                    <Image
                      src={championIconUrl(version, champ.id)}
                      alt={champ.name}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    {/* Clear button on filled slots */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnemySelect(idx, "");
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-full flex items-center justify-center transition-colors"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-fg-muted text-lg font-bold">
                    ?
                  </div>
                )}
                <span className={`text-xs font-semibold ${isActive ? "text-accent" : "text-fg-muted"}`}>
                  {role}
                </span>
                {champ && (
                  <span className="text-[10px] text-fg-muted truncate w-full text-center">
                    {champ.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Full-width ChampionSelect for active slot */}
        {activeSlot !== null && (
          <div className="mt-2">
            <ChampionSelect
              champions={champions}
              version={version}
              selectedChampion={enemyChampions[activeSlot]}
              onSelect={(key) => handleEnemySelect(activeSlot, key)}
              label=""
              placeholder={`Search ${ROLES[activeSlot]} champion...`}
              filterRole={ROLES[activeSlot]}
              defaultOpen
            />
          </div>
        )}

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
