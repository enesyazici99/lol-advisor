"use client";

import Image from "next/image";
import { useMetaBuild } from "@/hooks/useProBuilds";
import { useAppStore } from "@/stores/appStore";
import { itemIconUrl, championIconUrl, spellIconUrl } from "@/lib/riot/ddragon";
import { KEYSTONES, RUNE_TREES, SUMMONER_SPELLS } from "@/lib/riot/constants";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CyberCard } from "@/components/ui/CyberCard";
import { SkillOrderDisplay } from "./SkillOrderDisplay";

interface BuildSummaryProps {
  championKey: string;
  championName: string;
  role?: string | null;
}

export function BuildSummary({ championKey, championName, role }: BuildSummaryProps) {
  const version = useAppStore((s) => s.version);
  const { builds, isLoading } = useMetaBuild(championKey, role);
  const build = builds[0];

  if (isLoading) return <LoadingSpinner />;
  if (!build) {
    return (
      <CyberCard className="p-6">
        <p className="text-fg-muted text-sm text-center">
          No build data available for this champion yet.
        </p>
      </CyberCard>
    );
  }

  return (
    <CyberCard className="overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3.5 px-5 py-4 border-b border-border bg-surface-secondary">
        {version && (
          <div className="w-10 h-10 border border-border rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={championIconUrl(version, championKey)}
              alt={championName}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        )}
        <h2 className="text-base font-bold uppercase tracking-wide">
          {championName} BUILD
        </h2>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-semibold text-win">
            {build.win_rate}% WR
          </span>
          <span className="text-sm text-fg-muted">
            {build.match_count} matches
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Popular Items */}
        {build.popular_items && build.popular_items.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
              Popular Items
            </h3>
            <div className="flex gap-2 items-center flex-wrap">
              {(build.popular_items as { id: number; pct: number }[]).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-fg-muted text-xs">&#9654;</span>}
                  <div className="relative">
                    <div className="w-12 h-12 bg-surface-tertiary border border-border rounded-lg overflow-hidden hover:border-accent transition-colors cursor-pointer">
                      {version && (
                        <Image
                          src={itemIconUrl(version, item.id)}
                          alt={`Item ${item.id}`}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      )}
                    </div>
                    {item.pct > 0 && (
                      <span className="absolute -bottom-1 -right-1 bg-accent text-white text-[10px] font-bold px-1 rounded">
                        {item.pct}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runes and Spells Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Runes */}
          {build.popular_runes && build.popular_runes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
                Rune Config
              </h3>
              {(build.popular_runes as { keystone: number; secondary: number; pct: number }[]).slice(0, 2).map((rune, idx) => {
                const keystone = KEYSTONES[rune.keystone];
                const primaryTree = keystone ? RUNE_TREES[keystone.tree] : null;
                const secondaryTree = rune.secondary ? RUNE_TREES[rune.secondary] : null;
                return (
                  <div key={idx} className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-lg text-fg-secondary">
                      &#9876;
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-fg">
                        {keystone?.name || `Keystone ${rune.keystone}`}
                      </p>
                      <p className="text-xs text-fg-muted">
                        {primaryTree?.name || ""}{secondaryTree ? ` / ${secondaryTree.name}` : ""}
                      </p>
                    </div>
                    {rune.pct > 0 && (
                      <span className="ml-auto text-xs font-semibold text-accent">{rune.pct}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Spells */}
          {build.popular_spells && build.popular_spells.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
                Summoner Spells
              </h3>
              {(build.popular_spells as { spell1: number; spell2: number; pct: number }[]).slice(0, 2).map((sp, idx) => {
                const s1 = SUMMONER_SPELLS[sp.spell1];
                const s2 = SUMMONER_SPELLS[sp.spell2];
                return (
                  <div key={idx} className="flex items-center gap-2.5 mb-3">
                    {s1 && version && (
                      <div className="w-10 h-10 overflow-hidden border border-border rounded-lg">
                        <Image
                          src={spellIconUrl(version, s1.key)}
                          alt={s1.name}
                          width={40}
                          height={40}
                        />
                      </div>
                    )}
                    {s2 && version && (
                      <div className="w-10 h-10 overflow-hidden border border-border rounded-lg">
                        <Image
                          src={spellIconUrl(version, s2.key)}
                          alt={s2.name}
                          width={40}
                          height={40}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-fg">
                        {s1?.name || "?"} + {s2?.name || "?"}
                      </p>
                    </div>
                    {sp.pct > 0 && (
                      <span className="ml-auto text-xs font-semibold text-accent">{sp.pct}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Order */}
        {build.skill_order && (
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
              Skill Order
            </h3>
            <SkillOrderDisplay skillOrder={build.skill_order} />
          </div>
        )}

        {/* Boots */}
        {build.popular_boots && build.popular_boots.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
              Boots
            </h3>
            <div className="flex gap-2">
              {(build.popular_boots as { id: number; pct: number }[]).map((boot) => (
                <div key={boot.id} className="relative">
                  <div className="w-10 h-10 bg-surface-tertiary border border-border rounded-lg overflow-hidden">
                    {version && (
                      <Image
                        src={itemIconUrl(version, boot.id)}
                        alt={`Boot ${boot.id}`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    )}
                  </div>
                  {boot.pct > 0 && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-semibold text-accent">
                      {boot.pct}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CyberCard>
  );
}
