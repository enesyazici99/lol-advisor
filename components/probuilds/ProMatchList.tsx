"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProMatches } from "@/hooks/useProBuilds";
import { ProMatchRow } from "./ProMatchRow";
import { ExpandedMatchDetail } from "./detail/ExpandedMatchDetail";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CyberButton } from "@/components/ui/CyberButton";
import { useAppStore } from "@/stores/appStore";

interface ProMatchListProps {
  championKey: string;
  role?: string | null;
  region?: string | null;
}

export function ProMatchList({ championKey, role, region }: ProMatchListProps) {
  const [page, setPage] = useState(1);
  const { matches, hasMore, isLoading } = useProMatches(championKey, role, region, page);
  const expandedMatchId = useAppStore((s) => s.expandedMatchId);

  if (isLoading && matches.length === 0) return <LoadingSpinner />;

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-fg-muted text-base">
          No pro matches found yet. Data is being collected.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-secondary">
        <div className="w-1 flex-shrink-0" />
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-14">Time</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-36">Player</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-16">VS</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide w-24 text-center">KDA</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-shrink-0">Runes</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-shrink-0 ml-3">Spells</span>
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide flex-1 ml-2">Items</span>
        <div className="w-6 flex-shrink-0" />
      </div>

      {/* Match rows */}
      <AnimatePresence>
        {matches.map((match) => (
          <div key={match.id}>
            <ProMatchRow match={match} />
            {expandedMatchId === match.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <ExpandedMatchDetail match={match} />
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
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </CyberButton>
        </div>
      )}
    </div>
  );
}
