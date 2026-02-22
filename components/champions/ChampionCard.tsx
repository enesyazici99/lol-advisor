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
        whileHover={{ y: -2 }}
        className="relative bg-transparent border border-border rounded-md overflow-hidden cursor-pointer transition-all hover:border-gold/60 hover:bg-surface-secondary group"
      >
        <div className="relative aspect-square">
          <Image
            src={iconUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 20vw, 100px"
            className="object-cover"
          />
          {/* Gradient overlay with name */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent pt-4 pb-1.5 px-1.5">
            <p className="text-xs font-semibold text-white truncate leading-tight">{name}</p>
            {roles.length > 0 && (
              <p className="text-[9px] text-white/60 leading-tight truncate mt-0.5">
                {roles.map((r) => ROLE_SHORT[r] || r).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
