"use client";

import { useAppStore } from "@/stores/appStore";

const STATUS_CONFIG = {
  disconnected: {
    color: "bg-red-500",
    label: "LoL Client Not Found",
  },
  connected: {
    color: "bg-green-500",
    label: "LoL Client Connected",
  },
  "champ-select": {
    color: "bg-yellow-500",
    label: "Champion Select",
  },
} as const;

export function LCUStatus() {
  const phase = useAppStore((s) => s.lcuPhase);
  const summonerName = useAppStore((s) => s.lcuSummonerName);
  const config = STATUS_CONFIG[phase];

  return (
    <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-surface-tertiary border border-border text-xs">
      <span
        className={`w-2 h-2 rounded-full ${config.color} ${
          phase === "champ-select" ? "animate-pulse" : ""
        }`}
      />
      <span className="text-fg-secondary">
        {config.label}
        {summonerName && phase !== "disconnected" && (
          <span className="text-fg ml-1 font-medium">{summonerName}</span>
        )}
      </span>
    </div>
  );
}
