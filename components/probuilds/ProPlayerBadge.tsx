interface ProPlayerBadgeProps {
  name: string;
  team?: string | null;
  region?: string | null;
}

export function ProPlayerBadge({ name, team, region }: ProPlayerBadgeProps) {
  return (
    <div className="flex flex-col">
      <span className="font-bold text-sm text-accent">{name}</span>
      <div className="flex items-center gap-1.5">
        {team && (
          <span className="text-xs text-fg">
            {team}
          </span>
        )}
        {region && (
          <span className="text-xs text-fg-muted">
            {region}
          </span>
        )}
      </div>
    </div>
  );
}
