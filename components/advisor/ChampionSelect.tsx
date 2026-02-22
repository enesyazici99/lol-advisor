"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { championIconUrl } from "@/lib/riot/ddragon";
import { ROLE_TAG_MAP } from "@/lib/riot/constants";
import type { DDragonChampion } from "@/lib/riot/ddragon";

interface ChampionSelectProps {
  champions: Record<string, DDragonChampion>;
  version: string;
  selectedChampion: string | null;
  onSelect: (championKey: string) => void;
  label?: string;
  placeholder?: string;
  filterRole?: string;
  defaultOpen?: boolean;
}

export function ChampionSelect({
  champions,
  version,
  selectedChampion,
  onSelect,
  label = "Select Champion",
  placeholder = "Search champion...",
  filterRole,
  defaultOpen = false,
}: ChampionSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // When defaultOpen changes (e.g. slot switch), sync state
  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen, filterRole]);

  const filteredChampions = useMemo(() => {
    let list = Object.values(champions).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (filterRole && ROLE_TAG_MAP[filterRole]) {
      const allowedTags = ROLE_TAG_MAP[filterRole];
      list = list.filter((c) => c.tags.some((tag) => allowedTags.includes(tag)));
    }

    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(lower));
  }, [champions, search, filterRole]);

  const selected = selectedChampion ? champions[selectedChampion] : null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-fg-secondary">{label}</label>
      )}

      {/* Selected champion display */}
      {selected && !isOpen && (
        <div className="flex items-center gap-3 p-2.5 bg-surface-tertiary rounded-lg border border-border">
          {version && (
            <Image
              src={championIconUrl(version, selected.id)}
              alt={selected.name}
              width={36}
              height={36}
              className="rounded-lg"
            />
          )}
          <div>
            <p className="font-semibold text-fg text-sm">{selected.name}</p>
            <p className="text-xs text-fg-muted">{selected.tags.join(", ")}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                onSelect("");
                setIsOpen(true);
              }}
              className="text-fg-muted hover:text-accent text-sm"
            >
              Change
            </button>
            <button
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
              className="text-fg-muted hover:text-red-400 text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-400/10 transition-colors"
              title="Clear selection"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Search + Grid */}
      {(!selected || isOpen) && (
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg bg-surface-tertiary border border-border text-fg text-sm focus:outline-none focus:border-accent transition-colors"
            onFocus={() => setIsOpen(true)}
            autoFocus={defaultOpen}
          />

          {isOpen && (
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5 max-h-60 overflow-y-auto p-1.5 bg-surface rounded-lg border border-border">
              {filteredChampions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() => {
                    onSelect(champ.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center p-0.5 rounded hover:bg-surface-tertiary transition-colors group"
                  title={champ.name}
                >
                  {version && (
                    <Image
                      src={championIconUrl(version, champ.id)}
                      alt={champ.name}
                      width={32}
                      height={32}
                      className="rounded group-hover:ring-2 ring-accent transition-all"
                    />
                  )}
                </button>
              ))}
              {filteredChampions.length === 0 && (
                <p className="col-span-full text-center text-fg-muted text-sm py-4">
                  No champions found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
