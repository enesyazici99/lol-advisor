import { formatKDA, calculateKDARatio } from "@/lib/utils/helpers";
import type { ProMatch } from "@/lib/supabase/types";

interface MatchStatsProps {
  match: ProMatch;
}

export function MatchStats({ match }: MatchStatsProps) {
  const stats = [
    { label: "KDA", value: formatKDA(match.kills, match.deaths, match.assists) },
    { label: "KDA Ratio", value: calculateKDARatio(match.kills, match.deaths, match.assists) },
    { label: "CS", value: match.cs != null ? String(match.cs) : "N/A" },
    { label: "Gold", value: match.gold != null ? `${(match.gold / 1000).toFixed(1)}k` : "N/A" },
    { label: "Damage", value: match.damage != null ? `${(match.damage / 1000).toFixed(1)}k` : "N/A" },
    { label: "Duration", value: match.duration_minutes != null ? `${Math.round(match.duration_minutes)}m` : "N/A" },
  ];

  return (
    <div>
      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
        Match Stats
      </h4>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-tertiary px-3 py-2.5 rounded-lg border border-border">
            <p className="text-xs text-fg-muted">{stat.label}</p>
            <p className="font-mono text-sm text-accent font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
