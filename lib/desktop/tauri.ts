/**
 * Tauri API wrapper — dynamically imports @tauri-apps/api so it's
 * tree-shaken out of the normal web build.
 */

// ---------- Environment detection ----------

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window
  );
}

// ---------- LCU types (mirrors Rust structs) ----------

export interface ChampSelectPlayer {
  cellId: number;
  championId: number;
  summonerId: number | null;
  assignedPosition: string;
  spell1Id: number | null;
  spell2Id: number | null;
  playerType: string;
}

export interface ChampSelectAction {
  id: number;
  actorCellId: number;
  championId: number;
  completed: boolean;
  type: string;
  isAllyAction: boolean;
}

export interface ChampSelectBans {
  myTeamBans: number[];
  theirTeamBans: number[];
  numBans: number;
}

export interface ChampSelectTimer {
  phase: string;
  adjustedTimeLeftInPhase: number;
  totalTimeInPhase: number;
}

export interface ChampSelectSession {
  myTeam: ChampSelectPlayer[];
  theirTeam: ChampSelectPlayer[];
  actions: ChampSelectAction[][];
  bans: ChampSelectBans;
  timer: ChampSelectTimer;
  localPlayerCellId: number;
}

export interface CurrentSummoner {
  displayName: string;
  summonerId: number;
  puuid: string;
  accountId: number;
  profileIconId: number;
  summonerLevel: number;
}

export interface LcuEvent {
  uri: string;
  eventType: string;
  data: unknown;
}

// ---------- Tauri IPC wrappers ----------

type UnlistenFn = () => void;

export async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

export async function tauriListen<T>(
  event: string,
  handler: (payload: T) => void
): Promise<UnlistenFn> {
  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, (e) => handler(e.payload));
}

// ---------- Command helpers ----------

export async function detectClient(): Promise<boolean> {
  return tauriInvoke<boolean>("detect_client");
}

export async function getChampSelect(): Promise<ChampSelectSession> {
  return tauriInvoke<ChampSelectSession>("get_champ_select");
}

export async function getCurrentSummoner(): Promise<CurrentSummoner> {
  return tauriInvoke<CurrentSummoner>("get_current_summoner");
}

export async function startLcuWatcher(): Promise<void> {
  return tauriInvoke<void>("start_lcu_watcher");
}
