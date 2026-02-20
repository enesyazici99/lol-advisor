"use client";

import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { isTauri } from "@/lib/desktop/tauri";
import { LCUStatus } from "@/components/desktop/LCUStatus";

export function Header() {
  const version = useAppStore((s) => s.version);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <header className="flex items-center justify-between py-4 sm:py-5 mb-6 sm:mb-8 border-b border-border">
      <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
        LOL<span className="text-accent">.ADV</span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
        <Link
          href="/advisor"
          className="text-xs sm:text-sm font-medium text-fg-secondary hover:text-accent transition-colors px-2 sm:px-3 py-1.5"
        >
          Advisor
        </Link>
        <Link
          href="/live"
          className="text-xs sm:text-sm font-medium text-fg-secondary hover:text-accent transition-colors px-2 sm:px-3 py-1.5"
        >
          Live
        </Link>

        {isTauri() && <LCUStatus />}

        {version && (
          <span className="hidden sm:inline font-mono text-xs text-fg-muted bg-surface-tertiary px-3 py-1.5 rounded-lg">
            Patch {version}
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-tertiary border border-border hover:border-accent transition-colors text-fg-secondary hover:text-accent"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </nav>
    </header>
  );
}
