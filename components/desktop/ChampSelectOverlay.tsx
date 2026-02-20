"use client";

import Image from "next/image";
import { CyberCard } from "@/components/ui/CyberCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { championIconUrl } from "@/lib/riot/ddragon";
import type { ExtractedChampSelect } from "@/lib/desktop/lcu-utils";
import type { Role } from "@/lib/riot/constants";

const ROLE_LABELS: Record<string, string> = {
  TOP: "Top",
  JGL: "Jungle",
  MID: "Mid",
  ADC: "ADC",
  SUP: "Support",
};

interface ChampSelectOverlayProps {
  data: ExtractedChampSelect;
  version: string;
  onGetAdvice: (myChampion: string | null, myRole: Role | null, enemies: (string | null)[]) => void;
}

function ChampIcon({
  championKey,
  version,
  size = 40,
}: {
  championKey: string | null;
  version: string;
  size?: number;
}) {
  if (!championKey) {
    return (
      <div
        className="rounded-lg bg-surface-tertiary border border-border flex items-center justify-center text-fg-muted text-xs"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <Image
      src={championIconUrl(version, championKey)}
      alt={championKey}
      width={size}
      height={size}
      className="rounded-lg border border-border"
    />
  );
}

function TeamColumn({
  title,
  players,
  version,
  color,
}: {
  title: string;
  players: Array<{ championKey: string | null; role: Role | null; isLocalPlayer?: boolean }>;
  version: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className={`text-xs font-bold ${color}`}>{title}</h4>
      {players.map((p, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 p-1.5 rounded-lg ${
            p.isLocalPlayer ? "bg-accent/10 border border-accent/30" : ""
          }`}
        >
          <ChampIcon championKey={p.championKey} version={version} size={32} />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-fg">
              {p.championKey || "Picking..."}
            </span>
            <span className="text-[10px] text-fg-muted">
              {p.role ? ROLE_LABELS[p.role] : "—"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChampSelectOverlay({
  data,
  version,
  onGetAdvice,
}: ChampSelectOverlayProps) {
  const ROLES: Role[] = ["TOP", "JGL", "MID", "ADC", "SUP"];

  // Build enemy champion array ordered by role for ManualTeamInput compatibility
  const enemyByRole = ROLES.map((role) => {
    const enemy = data.enemyTeam.find((p) => p.role === role);
    return enemy?.championKey ?? null;
  });

  const handleGetAdvice = () => {
    onGetAdvice(data.myChampionKey, data.myRole, enemyByRole);
  };

  return (
    <CyberCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-fg">
          Champion Select — <span className="text-accent">{data.phase}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <TeamColumn
          title="Your Team"
          players={data.myTeam}
          version={version}
          color="text-blue-400"
        />
        <TeamColumn
          title="Enemy Team"
          players={data.enemyTeam}
          version={version}
          color="text-red-400"
        />
      </div>

      {/* Bans */}
      {(data.bans.myTeam.length > 0 || data.bans.enemy.length > 0) && (
        <div className="flex gap-4 mb-4 pt-3 border-t border-border">
          <div className="flex-1">
            <span className="text-[10px] font-medium text-fg-muted block mb-1">
              Your Bans
            </span>
            <div className="flex gap-1 flex-wrap">
              {data.bans.myTeam.map((key) => (
                <ChampIcon key={key} championKey={key} version={version} size={24} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-medium text-fg-muted block mb-1">
              Enemy Bans
            </span>
            <div className="flex gap-1 flex-wrap">
              {data.bans.enemy.map((key) => (
                <ChampIcon key={key} championKey={key} version={version} size={24} />
              ))}
            </div>
          </div>
        </div>
      )}

      <CyberButton
        variant="primary"
        onClick={handleGetAdvice}
        className="w-full"
      >
        Get Build Advice
      </CyberButton>
    </CyberCard>
  );
}
