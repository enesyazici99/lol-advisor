"use client";

import Image from "next/image";
import { CyberCard } from "@/components/ui/CyberCard";
import { formatWinRate } from "@/lib/utils/helpers";
import type { SummonerProfile as SummonerProfileType } from "@/lib/riot/types";

interface SummonerProfileProps {
  profile: SummonerProfileType;
  version: string;
}

function RankBadge({
  label,
  data,
}: {
  label: string;
  data: { tier: string; rank: string; lp: number; wins: number; losses: number } | null;
}) {
  if (!data) {
    return (
      <div className="bg-surface-tertiary px-3 py-2.5 rounded-lg border border-border">
        <p className="text-xs text-fg-muted">{label}</p>
        <p className="text-sm text-fg-muted">Unranked</p>
      </div>
    );
  }

  const total = data.wins + data.losses;
  const tierDisplay = `${data.tier.charAt(0)}${data.tier.slice(1).toLowerCase()} ${data.rank}`;

  return (
    <div className="bg-surface-tertiary px-3 py-2.5 rounded-lg border border-border">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="text-sm font-bold text-accent">{tierDisplay}</p>
      <p className="text-xs text-fg-muted">
        {data.lp} LP &middot; {data.wins}W {data.losses}L &middot;{" "}
        {formatWinRate(data.wins, total)}
      </p>
    </div>
  );
}

export function SummonerProfile({ profile, version }: SummonerProfileProps) {
  const iconUrl = version
    ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profile.profileIconId}.png`
    : "";

  // Responsive: stack on tiny screens

  return (
    <CyberCard className="p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Profile icon */}
        <div className="relative flex-shrink-0">
          {iconUrl && (
            <div className="w-20 h-20 rounded-xl border-2 border-accent overflow-hidden">
              <Image
                src={iconUrl}
                alt="Profile Icon"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          )}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-accent text-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
            {profile.summonerLevel}
          </div>
        </div>

        {/* Name + rank */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-fg truncate">
            {profile.gameName}
            <span className="text-fg-muted font-normal">#{profile.tagLine}</span>
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <RankBadge label="Ranked Solo" data={profile.rankedSolo} />
            <RankBadge label="Ranked Flex" data={profile.rankedFlex} />
          </div>
        </div>
      </div>
    </CyberCard>
  );
}
