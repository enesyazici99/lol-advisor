import type { Role } from "@/lib/riot/constants";
import type { DDragonChampion } from "@/lib/riot/ddragon";
import type { ChampSelectSession, ChampSelectPlayer } from "./tauri";

/**
 * LCU assigned positions → our Role type
 */
export const LCU_POSITION_TO_ROLE: Record<string, Role> = {
  top: "TOP",
  jungle: "JGL",
  middle: "MID",
  bottom: "ADC",
  utility: "SUP",
};

/**
 * Build a reverse map: numeric champion key → champion id (string key like "Aatrox").
 * DDragon champions have id="Aatrox", key="266".
 */
export function buildChampionKeyToId(
  champions: Record<string, DDragonChampion>
): Map<number, string> {
  const map = new Map<number, string>();
  for (const champ of Object.values(champions)) {
    map.set(Number(champ.key), champ.id);
  }
  return map;
}

/**
 * Convert a numeric champion ID (from LCU) to the DDragon string key.
 */
export function championIdToKey(
  championId: number,
  keyMap: Map<number, string>
): string | null {
  return keyMap.get(championId) ?? null;
}

/**
 * Extract meaningful data from a ChampSelectSession for the UI.
 */
export interface ExtractedChampSelect {
  myTeam: Array<{
    championKey: string | null;
    role: Role | null;
    isLocalPlayer: boolean;
  }>;
  enemyTeam: Array<{
    championKey: string | null;
    role: Role | null;
  }>;
  myChampionKey: string | null;
  myRole: Role | null;
  bans: {
    myTeam: string[];
    enemy: string[];
  };
  phase: string;
}

export function extractChampSelectData(
  session: ChampSelectSession,
  keyMap: Map<number, string>
): ExtractedChampSelect {
  const mapPlayer = (p: ChampSelectPlayer, isLocal: boolean) => ({
    championKey: p.championId > 0 ? championIdToKey(p.championId, keyMap) : null,
    role: LCU_POSITION_TO_ROLE[p.assignedPosition.toLowerCase()] ?? null,
    isLocalPlayer: isLocal,
  });

  const myTeam = session.myTeam.map((p) =>
    mapPlayer(p, p.cellId === session.localPlayerCellId)
  );

  const enemyTeam = session.theirTeam.map((p) => ({
    championKey: p.championId > 0 ? championIdToKey(p.championId, keyMap) : null,
    role: LCU_POSITION_TO_ROLE[p.assignedPosition.toLowerCase()] ?? null,
  }));

  const localPlayer = myTeam.find((p) => p.isLocalPlayer);

  return {
    myTeam,
    enemyTeam,
    myChampionKey: localPlayer?.championKey ?? null,
    myRole: localPlayer?.role ?? null,
    bans: {
      myTeam: session.bans.myTeamBans
        .filter((id) => id > 0)
        .map((id) => championIdToKey(id, keyMap))
        .filter((k): k is string => k !== null),
      enemy: session.bans.theirTeamBans
        .filter((id) => id > 0)
        .map((id) => championIdToKey(id, keyMap))
        .filter((k): k is string => k !== null),
    },
    phase: session.timer.phase,
  };
}
