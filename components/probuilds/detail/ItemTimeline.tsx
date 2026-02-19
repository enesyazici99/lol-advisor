"use client";

import Image from "next/image";
import { itemIconUrl } from "@/lib/riot/ddragon";
import { useAppStore } from "@/stores/appStore";

interface ItemTimelineProps {
  timeline: Record<string, number[]> | null;
}

export function ItemTimeline({ timeline }: ItemTimelineProps) {
  const version = useAppStore((s) => s.version);

  if (!timeline || Object.keys(timeline).length === 0) {
    return (
      <div>
        <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
          Item Timeline
        </h4>
        <p className="text-sm text-fg-muted">Timeline data unavailable</p>
      </div>
    );
  }

  const sortedEntries = Object.entries(timeline).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0])
  );

  return (
    <div>
      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-3">
        Item Timeline
      </h4>
      <div className="flex items-end gap-3 overflow-x-auto pb-2">
        {sortedEntries.map(([minute, items]) => (
          <div key={minute} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="flex gap-0.5">
              {items.map((itemId, idx) => (
                <div
                  key={`${itemId}-${idx}`}
                  className="w-6 h-6 border border-border rounded overflow-hidden"
                >
                  {version && (
                    <Image
                      src={itemIconUrl(version, itemId)}
                      alt={`Item ${itemId}`}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="font-mono text-[10px] text-accent">{minute}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
