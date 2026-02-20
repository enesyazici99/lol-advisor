"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useAppStore } from "@/stores/appStore";
import { ProPlayerBadge } from "./ProPlayerBadge";
import { ItemBuildDisplay } from "./ItemBuildDisplay";
import { RuneDisplay } from "./RuneDisplay";
import { SpellDisplay } from "./SpellDisplay";
import { championIconUrl } from "@/lib/riot/ddragon";
import { formatKDA, timeAgo } from "@/lib/utils/helpers";
import type { ProMatch } from "@/lib/supabase/types";

interface ProMatchRowProps {
  match: ProMatch;
}

export function ProMatchRow({ match }: ProMatchRowProps) {
  const version = useAppStore((s) => s.version);
  const expandedMatchId = useAppStore((s) => s.expandedMatchId);
  const setExpandedMatchId = useAppStore((s) => s.setExpandedMatchId);
  const isExpanded = expandedMatchId === match.id;

  const kdaRatio = (match.kills + match.assists) / Math.max(match.deaths, 1);

  return (
    <motion.div
      layout
      className={`border-b border-border transition-colors ${
        match.win ? "bg-win-bg" : "bg-loss-bg"
      } ${isExpanded ? "ring-1 ring-inset ring-accent/20" : ""}`}
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-accent-muted/50 transition-colors text-left"
        onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
        aria-expanded={isExpanded}
        aria-label={`${match.pro_player} ${match.win ? "win" : "loss"} ${formatKDA(match.kills, match.deaths, match.assists)}`}
      >
        {/* Win/Loss indicator bar */}
        <div className={`w-1 h-8 rounded-full flex-shrink-0 ${match.win ? "bg-win" : "bg-loss"}`} />

        {/* Time */}
        <span className="hidden sm:block font-mono text-xs text-fg-muted w-14 flex-shrink-0">
          {timeAgo(match.match_date)}
        </span>

        {/* Pro player */}
        <div className="w-24 sm:w-36 flex-shrink-0">
          <ProPlayerBadge
            name={match.pro_player}
            team={match.team}
            region={match.region}
          />
        </div>

        {/* VS champion */}
        <div className="hidden md:flex items-center gap-1.5 w-16 flex-shrink-0">
          <span className="text-xs text-fg-muted">vs</span>
          {match.vs_champion && version && (
            <div className="w-7 h-7 border border-border rounded-md overflow-hidden">
              <Image
                src={championIconUrl(version, match.vs_champion)}
                alt={match.vs_champion}
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* KDA */}
        <div className="w-20 sm:w-24 flex-shrink-0 text-center">
          <span className={`font-mono text-sm font-bold ${
            match.deaths === 0 ? "text-amber-500" :
            kdaRatio >= 3 ? "text-win" : "text-fg"
          }`}>
            {formatKDA(match.kills, match.deaths, match.assists)}
          </span>
        </div>

        {/* Runes */}
        <div className="hidden sm:block flex-shrink-0">
          <RuneDisplay keystoneId={match.rune_primary_keystone} />
        </div>

        {/* Spells */}
        <div className="hidden sm:block flex-shrink-0">
          {version && (
            <SpellDisplay spell1={match.spell1} spell2={match.spell2} version={version} />
          )}
        </div>

        {/* Items */}
        <div className="flex-1 min-w-0">
          {version && (
            <ItemBuildDisplay items={match.items} version={version} size={30} />
          )}
        </div>

        {/* Expand indicator */}
        <div className="w-6 flex-shrink-0 text-fg-muted text-xs text-center" aria-hidden="true">
          {isExpanded ? "−" : "+"}
        </div>
      </button>
    </motion.div>
  );
}
