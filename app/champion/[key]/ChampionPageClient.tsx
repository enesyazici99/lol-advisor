"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { championIconUrl } from "@/lib/riot/ddragon";
import { ROLES, REGIONS, type Role, type Region } from "@/lib/riot/constants";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberCard } from "@/components/ui/CyberCard";
import { BuildSummary } from "@/components/probuilds/BuildSummary";
import { ProMatchList } from "@/components/probuilds/ProMatchList";

interface ChampionPageClientProps {
  championKey: string;
  championName: string;
}

export function ChampionPageClient({ championKey, championName }: ChampionPageClientProps) {
  const version = useAppStore((s) => s.version);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-6 text-sm text-fg-muted hover:text-accent transition-colors"
      >
        <span>&larr;</span>
        <span>Back to Champions</span>
      </Link>

      {/* Champion header */}
      <div className="flex items-center gap-4 mb-8">
        {version && (
          <div className="w-16 h-16 border-2 border-accent rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <Image
              src={championIconUrl(version, championKey)}
              alt={championName}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-fg">
            {championName}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Pro Builds &middot; Patch {version || "..."}
          </p>
        </div>
      </div>

      {/* Build Summary */}
      <div className="mb-8">
        <BuildSummary
          championKey={championKey}
          championName={championName}
          role={selectedRole}
        />
      </div>

      {/* Filters row: Role tabs + Region dropdown */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap flex-1">
          <CyberButton
            variant="tab"
            active={selectedRole === null}
            onClick={() => setSelectedRole(null)}
          >
            ALL
          </CyberButton>
          {ROLES.map((role) => (
            <CyberButton
              key={role}
              variant="tab"
              active={selectedRole === role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            >
              {role}
            </CyberButton>
          ))}
        </div>
        <select
          value={selectedRegion || ""}
          onChange={(e) => setSelectedRegion((e.target.value as Region) || null)}
          className="h-9 px-3 text-sm bg-surface-secondary border border-border rounded-lg text-fg focus:outline-none focus:border-accent transition-colors cursor-pointer"
          aria-label="Filter by region"
        >
          <option value="">All Regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Pro Match List */}
      <CyberCard className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-surface-secondary">
          <h3 className="text-sm font-bold uppercase tracking-wide text-accent">
            PRO MATCHES
          </h3>
        </div>
        <ProMatchList championKey={championKey} role={selectedRole} region={selectedRegion} />
      </CyberCard>
    </motion.div>
  );
}
