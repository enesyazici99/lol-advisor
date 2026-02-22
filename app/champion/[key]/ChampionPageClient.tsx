"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { championIconUrl, championSplashUrl } from "@/lib/riot/ddragon";
import { ROLES, REGIONS, type Role, type Region } from "@/lib/riot/constants";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberCard } from "@/components/ui/CyberCard";
import { BuildSummary } from "@/components/probuilds/BuildSummary";
import { ProMatchList } from "@/components/probuilds/ProMatchList";

interface ChampionPageClientProps {
  championKey: string;
  championName: string;
  championTitle?: string;
}

export function ChampionPageClient({ championKey, championName, championTitle }: ChampionPageClientProps) {
  const version = useAppStore((s) => s.version);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <>
      {/*
        Full-page splash art background.
        Sibling of motion.div so CSS transforms on content don't affect fixed positioning.
        Covers viewport while champion page is mounted.
      */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src={championSplashUrl(championKey)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top opacity-25"
          priority
        />
        {/* Left → right: darken left so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface from-[30%] via-surface/75 to-surface/10" />
        {/* Top → bottom: fade top (behind header) and bottom of page */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80" />
      </div>

      {/* Page content — above the fixed background */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-4 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          <span>&#8592;</span>
          <span>Champions</span>
        </Link>

        {/* Champion hero info (no card — background is the whole page) */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
          {version && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gold rounded-xl overflow-hidden flex-shrink-0 shadow-[0_0_24px_rgba(200,155,60,0.3)]">
              <Image
                src={championIconUrl(version, championKey)}
                alt={championName}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-fg-muted">
                Pro Builds
              </span>
              {version && (
                <span className="text-[10px] text-fg-muted font-mono">· Patch {version}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight uppercase text-fg leading-none">
              {championName}
            </h1>
            {championTitle && (
              <p className="text-sm sm:text-base text-fg-secondary mt-1 capitalize">
                {championTitle}
              </p>
            )}
          </div>
        </div>

        {/* Build Summary */}
        <div className="mb-6 sm:mb-8">
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
    </>
  );
}
