interface SkillOrderDisplayProps {
  skillOrder: string | null;
}

export function SkillOrderDisplay({ skillOrder }: SkillOrderDisplayProps) {
  if (!skillOrder) return null;

  const skills = skillOrder.split(">").map((s) => s.trim());
  const colors: Record<string, string> = {
    Q: "text-blue-500",
    W: "text-emerald-500",
    E: "text-purple-500",
    R: "text-amber-500",
  };

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {skills.map((skill, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <span className="text-fg-muted">{">"}</span>}
          <span className={`font-bold ${colors[skill] || "text-fg"}`}>{skill}</span>
        </span>
      ))}
    </div>
  );
}
