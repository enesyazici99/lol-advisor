"use client";

import { useAppStore } from "@/stores/appStore";

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Search champions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-5 py-3.5 bg-surface-secondary border border-border rounded-xl text-base text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
      />
    </div>
  );
}
