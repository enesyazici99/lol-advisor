"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useAppStore } from "@/stores/appStore";
import { ItemBuildDisplay } from "@/components/probuilds/ItemBuildDisplay";
import { RuneDisplay } from "@/components/probuilds/RuneDisplay";
import { SpellDisplay } from "@/components/probuilds/SpellDisplay";
import { championIconUrl } from "@/lib/riot/ddragon";
import { formatKDA, timeAgo } from "@/lib/utils/helpers";
import type { MatchSummary } from "@/lib/riot/types";

interface MatchHistoryRowProps {
  match: MatchSummary;
}

export function MatchHistoryRow({ match }: MatchHistoryRowProps) {
  const version = useAppStore((s) => s.version);
  const expandedId = useAppStore((s) => s.summonerExpandedMatchId);
  const setExpandedId = useAppStore((s) => s.setSummonerExpandedMatchId);
  const isExpanded = expandedId === match.matchId;

  const kdaRatio = (match.kills + match.assists) / Math.max(match.deaths, 1);
  const csPerMin = match.gameDuration > 0
    ? (match.cs / (match.gameDuration / 60)).toFixed(1)
    : "0";

  // Split participants into two teams
  const blueTeam = match.participants.filter((p) => p.teamId === 100);
  const redTeam = match.participants.filter((p) => p.teamId === 200);

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
        onClick={() => setExpandedId(isExpanded ? null : match.matchId)}
        aria-expanded={isExpanded}
        aria-label={`${match.championName} ${match.win ? "win" : "loss"} ${formatKDA(match.kills, match.deaths, match.assists)}`}
      >
        {/* Win/Loss bar */}
        <div className={`w-1 h-8 rounded-full flex-shrink-0 ${match.win ? "bg-win" : "bg-loss"}`} />

        {/* Time */}
        <span className="hidden sm:block font-mono text-xs text-fg-muted w-14 flex-shrink-0">
          {timeAgo(new Date(match.gameCreation))}
        </span>

        {/* Champion + Level */}
        <div className="flex items-center gap-2 w-20 sm:w-28 flex-shrink-0">
          {version && (
            <div className="relative">
              <div className="w-9 h-9 border border-border rounded-lg overflow-hidden">
                <Image
                  src={championIconUrl(version, match.championName)}
                  alt={match.championName}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-surface-secondary text-fg text-[9px] font-bold px-1 rounded border border-border">
                {match.champLevel}
              </span>
            </div>
          )}
          <span className="text-xs text-fg-muted uppercase">{match.position}</span>
        </div>

        {/* KDA */}
        <div className="w-20 flex-shrink-0 text-center">
          <span
            className={`font-mono text-sm font-bold ${
              match.deaths === 0
                ? "text-amber-500"
                : kdaRatio >= 3
                  ? "text-win"
                  : "text-fg"
            }`}
          >
            {formatKDA(match.kills, match.deaths, match.assists)}
          </span>
        </div>

        {/* CS */}
        <div className="w-16 flex-shrink-0 text-center hidden md:block">
          <span className="font-mono text-xs text-fg">{match.cs}</span>
          <span className="text-[10px] text-fg-muted ml-0.5">({csPerMin})</span>
        </div>

        {/* Gold */}
        <div className="w-14 flex-shrink-0 text-center hidden lg:block">
          <span className="font-mono text-xs text-fg">
            {(match.gold / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Damage */}
        <div className="w-14 flex-shrink-0 text-center hidden lg:block">
          <span className="font-mono text-xs text-fg">
            {(match.damage / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Runes */}
        <div className="hidden sm:block flex-shrink-0">
          <RuneDisplay keystoneId={match.keystoneId} />
        </div>

        {/* Spells */}
        <div className="hidden sm:block flex-shrink-0">
          {version && (
            <SpellDisplay spell1={match.spell1} spell2={match.spell2} version={version} />
          )}
        </div>

        {/* Items */}
        <div className="flex-1 min-w-0 hidden sm:block">
          {version && (
            <ItemBuildDisplay items={match.items} version={version} size={26} />
          )}
        </div>

        {/* Mini team icons (5v5) */}
        <div className="hidden xl:flex gap-1.5 flex-shrink-0">
          <div className="flex gap-0.5">
            {blueTeam.slice(0, 5).map((p) => (
              <div
                key={p.puuid}
                className="w-4 h-4 rounded-sm overflow-hidden border border-border"
              >
                {version && (
                  <Image
                    src={championIconUrl(version, p.championName)}
                    alt={p.championName}
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-fg-muted">vs</span>
          <div className="flex gap-0.5">
            {redTeam.slice(0, 5).map((p) => (
              <div
                key={p.puuid}
                className="w-4 h-4 rounded-sm overflow-hidden border border-border"
              >
                {version && (
                  <Image
                    src={championIconUrl(version, p.championName)}
                    alt={p.championName}
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expand indicator */}
        <div className="w-6 flex-shrink-0 text-fg-muted text-xs text-center" aria-hidden="true">
          {isExpanded ? "−" : "+"}
        </div>
      </button>
    </motion.div>
  );
}
