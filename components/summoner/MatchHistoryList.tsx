"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMatchHistory } from "@/hooks/useSummoner";
import { MatchHistoryRow } from "./MatchHistoryRow";
import { MatchHistoryDetail } from "./MatchHistoryDetail";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CyberButton } from "@/components/ui/CyberButton";
import { useAppStore } from "@/stores/appStore";

interface MatchHistoryListProps {
  puuid: string;
  region: string;
}

export function MatchHistoryList({ puuid, region }: MatchHistoryListProps) {
  const [start, setStart] = useState(0);
  const { matches, hasMore, isLoading } = useMatchHistory(puuid, region, start);
  const expandedId = useAppStore((s) => s.summonerExpandedMatchId);

  if (isLoading && matches.length === 0) return <LoadingSpinner />;

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-fg-muted text-base">No matches found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-secondary">
        <div className="w-1 flex-shrink-0" />
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-14">Time</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-28">Champion</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-20 text-center">KDA</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-16 text-center hidden md:block">CS</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-14 text-center hidden lg:block">Gold</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-14 text-center hidden lg:block">Dmg</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-shrink-0">Runes</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-shrink-0 ml-2">Spells</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-1 ml-2 hidden sm:block">Items</span>
        <div className="w-6 flex-shrink-0" />
      </div>

      {/* Match rows */}
      <AnimatePresence>
        {matches.map((match) => (
          <div key={match.matchId}>
            <MatchHistoryRow match={match} />
            {expandedId === match.matchId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <MatchHistoryDetail match={match} puuid={puuid} region={region} />
              </motion.div>
            )}
          </div>
        ))}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <CyberButton
            variant="secondary"
            onClick={() => setStart((s) => s + 20)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </CyberButton>
        </div>
      )}
    </div>
  );
}
