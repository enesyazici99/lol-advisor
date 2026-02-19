"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tab" | "gradient";
  active?: boolean;
  children: ReactNode;
}

export function CyberButton({
  variant = "primary",
  active = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base = "cursor-pointer font-medium transition-all duration-150 rounded-lg disabled:opacity-50";

  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white text-sm px-5 py-2.5 hover:bg-accent-hover shadow-sm",
    gradient:
      "bg-accent text-white text-sm px-5 py-2.5 hover:bg-accent-hover shadow-sm",
    secondary:
      "bg-transparent border border-border text-fg-secondary text-sm px-4 py-2 hover:border-accent hover:text-accent",
    tab: `text-sm px-4 py-2 ${
      active
        ? "bg-accent text-white shadow-sm"
        : "bg-surface-tertiary text-fg-secondary hover:bg-surface-secondary hover:text-fg"
    }`,
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
