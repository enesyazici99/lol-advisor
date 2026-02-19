interface SkillTimelineProps {
  skillOrder: string | null;
}

export function SkillTimeline({ skillOrder }: SkillTimelineProps) {
  if (!skillOrder) {
    return (
      <div>
        <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
          Skill Order
        </h4>
        <p className="text-sm text-fg-muted">Skill data unavailable</p>
      </div>
    );
  }

  const maxOrder = skillOrder.split(">").map((s) => s.trim());

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Q: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
    W: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
    E: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
    R: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
        Skill Priority
      </h4>
      <div className="flex items-center gap-2">
        {maxOrder.map((skill, idx) => {
          const style = colors[skill] || { bg: "bg-surface-tertiary", text: "text-fg", border: "border-border" };
          return (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-fg-muted text-sm">{">"}</span>}
              <div
                className={`w-10 h-10 ${style.bg} border ${style.border} rounded-lg flex items-center justify-center font-bold text-lg ${style.text}`}
              >
                {skill}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-fg-muted mt-2">
        Max order: {maxOrder.join(" > ")}
      </p>
    </div>
  );
}
