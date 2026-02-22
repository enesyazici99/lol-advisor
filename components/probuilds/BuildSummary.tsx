"use client";

import Image from "next/image";
import { useMetaBuild } from "@/hooks/useProBuilds";
import { useAppStore } from "@/stores/appStore";
import { itemIconUrl, spellIconUrl } from "@/lib/riot/ddragon";
import { KEYSTONES, RUNE_TREES, SUMMONER_SPELLS } from "@/lib/riot/constants";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkillOrderDisplay } from "./SkillOrderDisplay";

interface BuildSummaryProps {
  championKey: string;
  championName?: string;
  role?: string | null;
}

export function BuildSummary({ championKey, role }: BuildSummaryProps) {
  const version = useAppStore((s) => s.version);
  const { builds, isLoading } = useMetaBuild(championKey, role);
  const build = builds[0];

  if (isLoading) return <LoadingSpinner />;
  if (!build) {
    return (
      <div className="bg-surface-secondary border border-border rounded-xl p-6">
        <p className="text-fg-muted text-sm text-center">
          No build data available for this champion yet.
        </p>
      </div>
    );
  }

  const topItems = (build.popular_items as { id: number; pct: number }[] | null)?.slice(0, 3) ?? [];
  const topBoot = (build.popular_boots as { id: number; pct: number }[] | null)?.[0] ?? null;
  const topRune = (build.popular_runes as { keystone: number; secondary: number; pct: number }[] | null)?.[0] ?? null;
  const topSpell = (build.popular_spells as { spell1: number; spell2: number; pct: number }[] | null)?.[0] ?? null;

  const keystone = topRune ? KEYSTONES[topRune.keystone] : null;
  const secondaryTree = topRune?.secondary ? RUNE_TREES[topRune.secondary] : null;
  const s1 = topSpell ? SUMMONER_SPELLS[topSpell.spell1] : null;
  const s2 = topSpell ? SUMMONER_SPELLS[topSpell.spell2] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Horizontal stats bar */}
      <div className="flex items-stretch divide-x divide-border bg-surface-secondary border border-border rounded-xl overflow-hidden">
        {/* Win Rate */}
        <div className="flex flex-col items-center justify-center px-5 py-4 gap-1 min-w-[100px]">
          <span className="text-3xl font-bold text-win leading-none">{build.win_rate}%</span>
          <span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Win Rate</span>
          <span className="text-xs text-fg-muted">{build.match_count} matches</span>
        </div>

        {/* Popular Items */}
        <div className="flex flex-col items-center justify-center px-5 py-4 gap-2 flex-1">
          <div className="flex items-center gap-1.5">
            {topItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-fg-muted text-[10px]">&#9654;</span>}
                <div className="w-10 h-10 bg-surface-tertiary border border-border rounded-lg overflow-hidden">
                  {version && (
                    <Image
                      src={itemIconUrl(version, item.id)}
                      alt={`Item ${item.id}`}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Popular Items</span>
        </div>

        {/* Boots */}
        {topBoot && (
          <div className="flex flex-col items-center justify-center px-5 py-4 gap-2">
            <div className="w-10 h-10 bg-surface-tertiary border border-border rounded-lg overflow-hidden">
              {version && (
                <Image
                  src={itemIconUrl(version, topBoot.id)}
                  alt={`Boot ${topBoot.id}`}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              )}
            </div>
            <span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Boots</span>
          </div>
        )}

        {/* Rune Build */}
        {topRune && (
          <div className="flex flex-col items-center justify-center px-5 py-4 gap-2">
            <div className="text-center">
              <p className="text-sm font-semibold text-fg leading-tight">
                {keystone?.name || `Keystone ${topRune.keystone}`}
              </p>
              {secondaryTree && (
                <p className="text-xs text-fg-muted">{secondaryTree.name}</p>
              )}
            </div>
            <span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Rune Build</span>
          </div>
        )}

        {/* Summoner Spells */}
        {topSpell && (s1 || s2) && (
          <div className="flex flex-col items-center justify-center px-5 py-4 gap-2">
            <div className="flex items-center gap-1.5">
              {s1 && version && (
                <div className="w-9 h-9 overflow-hidden border border-border rounded-lg">
                  <Image
                    src={spellIconUrl(version, s1.key)}
                    alt={s1.name}
                    width={36}
                    height={36}
                  />
                </div>
              )}
              {s2 && version && (
                <div className="w-9 h-9 overflow-hidden border border-border rounded-lg">
                  <Image
                    src={spellIconUrl(version, s2.key)}
                    alt={s2.name}
                    width={36}
                    height={36}
                  />
                </div>
              )}
            </div>
            <span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Summoners</span>
          </div>
        )}
      </div>

      {/* Skill Order (below the bar) */}
      {build.skill_order && (
        <div className="bg-surface-secondary border border-border rounded-xl px-5 py-4">
          <h3 className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider mb-3">
            Skill Order
          </h3>
          <SkillOrderDisplay skillOrder={build.skill_order} />
        </div>
      )}
    </div>
  );
}
