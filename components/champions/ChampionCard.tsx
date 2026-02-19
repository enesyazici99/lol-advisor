"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const ROLE_SHORT: Record<string, string> = {
  Marksman: "ADC",
  Fighter: "Fighter",
  Mage: "Mage",
  Assassin: "Assassin",
  Tank: "Tank",
  Support: "Sup",
};

interface ChampionCardProps {
  id: string;
  name: string;
  iconUrl: string;
  roles?: string[];
}

export function ChampionCard({ id, name, iconUrl, roles = [] }: ChampionCardProps) {
  return (
    <Link href={`/champion/${id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md hover:border-accent/40 group"
      >
        <div className="relative aspect-square">
          <Image
            src={iconUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 20vw, 100px"
            className="object-cover"
          />
        </div>
        <div className="px-1.5 py-2 text-center">
          <p className="text-xs font-semibold text-fg truncate">{name}</p>
          {roles.length > 0 && (
            <p className="text-[10px] text-fg-muted leading-tight mt-0.5 truncate">
              {roles.map((r) => ROLE_SHORT[r] || r).join(" · ")}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
