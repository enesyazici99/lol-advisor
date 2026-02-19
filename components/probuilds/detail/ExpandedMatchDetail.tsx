"use client";

import type { ProMatch } from "@/lib/supabase/types";
import { useMetaBuild } from "@/hooks/useProBuilds";
import { MatchStats } from "./MatchStats";
import { ItemTimeline } from "./ItemTimeline";
import { SkillTimeline } from "./SkillTimeline";

interface ExpandedMatchDetailProps {
  match: ProMatch;
}

export function ExpandedMatchDetail({ match }: ExpandedMatchDetailProps) {
  const hasTimeline = match.item_timeline && Object.keys(match.item_timeline).length > 0;
  const hasMatchSkillOrder = !!match.skill_order;

  // Fetch meta skill_order as fallback when match doesn't have one
  const { builds } = useMetaBuild(
    !hasMatchSkillOrder ? match.champion_key : null,
    match.role
  );
  const metaSkillOrder = builds[0]?.skill_order || null;
  const skillOrder = match.skill_order || metaSkillOrder;
  const isMetaFallback = !hasMatchSkillOrder && !!metaSkillOrder;

  return (
    <div className="px-6 py-5 bg-surface-secondary border-t border-border space-y-5">
      <MatchStats match={match} />
      {(hasTimeline || skillOrder) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hasTimeline && <ItemTimeline timeline={match.item_timeline} />}
          {skillOrder && (
            <div>
              <SkillTimeline skillOrder={skillOrder} />
              {isMetaFallback && (
                <p className="text-[10px] text-fg-muted mt-1 italic">
                  Based on champion average
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
