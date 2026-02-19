"use client";

import { ReactNode, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

export function Providers({ children }: { children: ReactNode }) {
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem("lol-advisor-theme") as "light" | "dark" | null;
    const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
  }, [setTheme]);

  return <>{children}</>;
}
