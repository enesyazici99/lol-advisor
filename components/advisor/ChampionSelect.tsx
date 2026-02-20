"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { championIconUrl } from "@/lib/riot/ddragon";
import type { DDragonChampion } from "@/lib/riot/ddragon";

interface ChampionSelectProps {
  champions: Record<string, DDragonChampion>;
  version: string;
  selectedChampion: string | null;
  onSelect: (championKey: string) => void;
  label?: string;
  placeholder?: string;
}

export function ChampionSelect({
  champions,
  version,
  selectedChampion,
  onSelect,
  label = "Select Champion",
  placeholder = "Search champion...",
}: ChampionSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredChampions = useMemo(() => {
    const list = Object.values(champions).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(lower));
  }, [champions, search]);

  const selected = selectedChampion ? champions[selectedChampion] : null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-fg-secondary">{label}</label>

      {/* Selected champion display */}
      {selected && (
        <div className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg border border-border">
          {version && (
            <Image
              src={championIconUrl(version, selected.id)}
              alt={selected.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
          )}
          <div>
            <p className="font-semibold text-fg">{selected.name}</p>
            <p className="text-xs text-fg-muted">{selected.tags.join(", ")}</p>
          </div>
          <button
            onClick={() => {
              onSelect("");
              setIsOpen(true);
            }}
            className="ml-auto text-fg-muted hover:text-accent text-sm"
          >
            Change
          </button>
        </div>
      )}

      {/* Search + Grid */}
      {(!selected || isOpen) && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg bg-surface-tertiary border border-border text-fg text-sm focus:outline-none focus:border-accent transition-colors"
            onFocus={() => setIsOpen(true)}
          />

          {isOpen && (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-64 overflow-y-auto p-2 bg-surface rounded-lg border border-border">
              {filteredChampions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() => {
                    onSelect(champ.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center gap-0.5 p-1 rounded-lg hover:bg-surface-tertiary transition-colors group"
                  title={champ.name}
                >
                  {version && (
                    <Image
                      src={championIconUrl(version, champ.id)}
                      alt={champ.name}
                      width={36}
                      height={36}
                      className="rounded-md group-hover:ring-2 ring-accent transition-all"
                    />
                  )}
                  <span className="text-[10px] text-fg-muted truncate w-full text-center">
                    {champ.name}
                  </span>
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
