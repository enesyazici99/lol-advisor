"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { ChampionCard } from "./ChampionCard";
import { championIconUrl } from "@/lib/riot/ddragon";
import type { DDragonChampion } from "@/lib/riot/ddragon";

interface ChampionGridProps {
  champions: Record<string, DDragonChampion>;
  version: string;
}

const ROLE_TAG_MAP: Record<string, string[]> = {
  TOP: ["Fighter", "Tank"],
  JGL: ["Fighter", "Assassin"],
  MID: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  SUP: ["Support", "Tank"],
};

export function ChampionGrid({ champions, version }: ChampionGridProps) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const selectedRole = useAppStore((s) => s.selectedRole);

  const championList = Object.values(champions);

  const filtered = championList.filter((champ) => {
    const matchesSearch =
      !searchQuery ||
      champ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      champ.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      !selectedRole ||
      champ.tags.some((tag) => ROLE_TAG_MAP[selectedRole]?.includes(tag));

    return matchesSearch && matchesRole;
  });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-fg-muted text-base">
          No champions found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.015 } },
      }}
    >
      {filtered.map((champ) => (
        <motion.div
          key={champ.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <ChampionCard
            id={champ.id}
            name={champ.name}
            iconUrl={championIconUrl(version, champ.id)}
            roles={champ.tags}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
