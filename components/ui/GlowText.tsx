import { ReactNode } from "react";

interface GlowTextProps {
  color?: "accent" | "win" | "loss" | "cyan" | "magenta" | "yellow" | "green" | "red";
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  children: ReactNode;
}

export function GlowText({ color = "accent", as: Tag = "span", className = "", children }: GlowTextProps) {
  const colorClasses: Record<string, string> = {
    accent: "text-accent",
    win: "text-win",
    loss: "text-loss",
    cyan: "text-accent",
    magenta: "text-accent",
    yellow: "text-amber-500",
    green: "text-win",
    red: "text-loss",
  };

  return <Tag className={`${colorClasses[color]} ${className}`}>{children}</Tag>;
}
