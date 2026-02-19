"use client";

import type { ProMatch } from "@/lib/supabase/types";
import { MatchStats } from "./MatchStats";
import { ItemTimeline } from "./ItemTimeline";
import { SkillTimeline } from "./SkillTimeline";

interface ExpandedMatchDetailProps {
  match: ProMatch;
}

export function ExpandedMatchDetail({ match }: ExpandedMatchDetailProps) {
  const hasTimeline = match.item_timeline && Object.keys(match.item_timeline).length > 0;
  const hasSkillOrder = !!match.skill_order;

  return (
    <div className="px-6 py-5 bg-surface-secondary border-t border-border space-y-5">
      <MatchStats match={match} />
      {(hasTimeline || hasSkillOrder) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hasTimeline && <ItemTimeline timeline={match.item_timeline} />}
          {hasSkillOrder && <SkillTimeline skillOrder={match.skill_order} />}
        </div>
      )}
    </div>
  );
}
