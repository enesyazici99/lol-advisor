import { formatKDA, calculateKDARatio } from "@/lib/utils/helpers";
import type { ProMatch } from "@/lib/supabase/types";

interface MatchStatsProps {
  match: ProMatch;
}

export function MatchStats({ match }: MatchStatsProps) {
  const stats = [
    { label: "KDA", value: formatKDA(match.kills, match.deaths, match.assists) },
    { label: "KDA Ratio", value: calculateKDARatio(match.kills, match.deaths, match.assists) },
    ...(match.cs != null ? [{ label: "CS", value: String(match.cs) }] : []),
    ...(match.gold != null ? [{ label: "Gold", value: `${(match.gold / 1000).toFixed(1)}k` }] : []),
    ...(match.damage != null ? [{ label: "Damage", value: `${(match.damage / 1000).toFixed(1)}k` }] : []),
    ...(match.duration_minutes != null ? [{ label: "Duration", value: `${Math.round(match.duration_minutes)}m` }] : []),
  ];

  const colClass = stats.length <= 2 ? "grid-cols-2" : stats.length <= 3 ? "grid-cols-3" : "grid-cols-3 md:grid-cols-6";

  return (
    <div>
      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
        Match Stats
      </h4>
      <div className={`grid ${colClass} gap-3`}>
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
