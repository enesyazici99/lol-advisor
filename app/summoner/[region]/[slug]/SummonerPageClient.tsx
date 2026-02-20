"use client";

import Link from "next/link";
import { useSummonerAccount } from "@/hooks/useSummoner";
import { SummonerProfile } from "@/components/summoner/SummonerProfile";
import { MatchHistoryList } from "@/components/summoner/MatchHistoryList";
import { CyberCard } from "@/components/ui/CyberCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SummonerPageClientProps {
  gameName: string;
  tagLine: string;
  region: string;
  version: string;
}

export function SummonerPageClient({
  gameName,
  tagLine,
  region,
  version,
}: SummonerPageClientProps) {
  const { profile, isLoading, error } = useSummonerAccount(gameName, tagLine, region);

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent transition-colors"
      >
        <span>&larr;</span>
        <span>Back to Home</span>
      </Link>

      {/* Loading state */}
      {isLoading && <LoadingSpinner />}

      {/* Error / not found */}
      {error && !isLoading && (
        <CyberCard className="p-8 text-center">
          <p className="text-lg font-bold text-loss mb-2">Summoner not found</p>
          <p className="text-sm text-fg-muted">
            Could not find &quot;{gameName}#{tagLine}&quot; on {region.toUpperCase()}.
            Please check the name and region.
          </p>
        </CyberCard>
      )}

      {/* Profile */}
      {profile && <SummonerProfile profile={profile} version={version} />}

      {/* Match History */}
      {profile && (
        <CyberCard className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold text-fg uppercase tracking-wide">
              Match History
            </h2>
          </div>
          <MatchHistoryList puuid={profile.puuid} region={region} />
        </CyberCard>
      )}
    </div>
  );
}
