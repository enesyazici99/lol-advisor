"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  isTauri,
  detectClient,
  getChampSelect,
  getCurrentSummoner,
  startLcuWatcher,
  tauriListen,
} from "@/lib/desktop/tauri";
import type { ChampSelectSession, LcuEvent } from "@/lib/desktop/tauri";

export type LcuPhase = "disconnected" | "connected" | "champ-select";

export interface UseLCUResult {
  phase: LcuPhase;
  summonerName: string | null;
  champSelectSession: ChampSelectSession | null;
  /** Re-fetch champion select session on demand */
  refreshSession: () => Promise<void>;
}

const POLL_INTERVAL = 5000; // 5 seconds

export function useLCU(): UseLCUResult {
  const [phase, setPhase] = useState<LcuPhase>("disconnected");
  const [summonerName, setSummonerName] = useState<string | null>(null);
  const [session, setSession] = useState<ChampSelectSession | null>(null);
  const watcherStarted = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const s = await getChampSelect();
      setSession(s);
      setPhase("champ-select");
    } catch {
      setSession(null);
      // If getChampSelect fails, it means we're not in champ select but might be connected
      if (phase !== "disconnected") {
        setPhase("connected");
      }
    }
  }, [phase]);

  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      try {
        const found = await detectClient();
        if (!found) {
          setPhase("disconnected");
          setSummonerName(null);
          setSession(null);
          watcherStarted.current = false;
          return;
        }

        // Client detected
        if (phase === "disconnected") {
          setPhase("connected");
        }

        // Fetch summoner name if not known
        if (!summonerName) {
          try {
            const summoner = await getCurrentSummoner();
            setSummonerName(summoner.displayName);
          } catch {
            // Summoner fetch can fail during login
          }
        }

        // Start WebSocket watcher if not already started
        if (!watcherStarted.current) {
          watcherStarted.current = true;
          startLcuWatcher().catch(() => {
            watcherStarted.current = false;
          });
        }

        // Try to get champ select session
        try {
          const s = await getChampSelect();
          setSession(s);
          setPhase("champ-select");
        } catch {
          setSession(null);
          setPhase("connected");
        }
      } catch {
        setPhase("disconnected");
        setSummonerName(null);
        setSession(null);
        watcherStarted.current = false;
      }
    };

    // Initial poll
    poll();

    // Set up polling interval
    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // Only re-run when isTauri changes (effectively once)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    if (!isTauri()) return;

    let unlistenChampSelect: (() => void) | null = null;
    let unlistenConnected: (() => void) | null = null;
    let unlistenDisconnected: (() => void) | null = null;

    const setup = async () => {
      unlistenChampSelect = await tauriListen<LcuEvent>(
        "lcu-champ-select",
        async () => {
          // On any champ-select event, re-fetch the full session for consistency
          try {
            const s = await getChampSelect();
            setSession(s);
            setPhase("champ-select");
          } catch {
            // Session ended
            setSession(null);
            setPhase("connected");
          }
        }
      );

      unlistenConnected = await tauriListen<void>("lcu-connected", () => {
        if (phase === "disconnected") setPhase("connected");
      });

      unlistenDisconnected = await tauriListen<void>("lcu-disconnected", () => {
        watcherStarted.current = false;
        // Don't immediately set to disconnected — let the poll confirm
      });
    };

    setup();

    return () => {
      unlistenChampSelect?.();
      unlistenConnected?.();
      unlistenDisconnected?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { phase, summonerName, champSelectSession: session, refreshSession };
}
