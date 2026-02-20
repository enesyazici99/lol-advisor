"use client";

import { ReactNode, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { isTauri } from "@/lib/desktop/tauri";
import { useLCU } from "@/hooks/useLCU";

function DesktopInit() {
  const { phase, summonerName } = useLCU();
  const setLcuPhase = useAppStore((s) => s.setLcuPhase);
  const setLcuSummonerName = useAppStore((s) => s.setLcuSummonerName);

  useEffect(() => {
    setLcuPhase(phase);
  }, [phase, setLcuPhase]);

  useEffect(() => {
    setLcuSummonerName(summonerName);
  }, [summonerName, setLcuSummonerName]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem("lol-advisor-theme") as "light" | "dark" | null;
    const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
  }, [setTheme]);

  return (
    <>
      {isTauri() && <DesktopInit />}
      {children}
    </>
  );
}
