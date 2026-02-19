import { KEYSTONES, RUNE_TREES } from "@/lib/riot/constants";

interface RuneDisplayProps {
  keystoneId: number | null;
  secondaryTreeId?: number | null;
  size?: "sm" | "md";
}

export function RuneDisplay({ keystoneId, secondaryTreeId, size = "sm" }: RuneDisplayProps) {
  const keystone = keystoneId ? KEYSTONES[keystoneId] : null;
  const primaryTree = keystone ? RUNE_TREES[keystone.tree] : null;
  const secondaryTree = secondaryTreeId ? RUNE_TREES[secondaryTreeId] : null;

  const sizeClasses = size === "sm" ? "w-7 h-7 text-sm" : "w-10 h-10 text-lg";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses} rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-fg-secondary`}
        title={keystone?.name || "Unknown"}
      >
        <span>&#9876;</span>
      </div>
      {size === "md" && keystone && (
        <div>
          <p className="text-sm font-semibold text-fg">{keystone.name}</p>
          <p className="text-xs text-fg-muted">
            {primaryTree?.name || ""}
            {secondaryTree ? ` / ${secondaryTree.name}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
