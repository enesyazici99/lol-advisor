import Image from "next/image";
import { SUMMONER_SPELLS } from "@/lib/riot/constants";
import { spellIconUrl } from "@/lib/riot/ddragon";

interface SpellDisplayProps {
  spell1: number | null;
  spell2: number | null;
  version: string;
  size?: number;
}

export function SpellDisplay({ spell1, spell2, version, size = 28 }: SpellDisplayProps) {
  const s1 = spell1 ? SUMMONER_SPELLS[spell1] : null;
  const s2 = spell2 ? SUMMONER_SPELLS[spell2] : null;

  return (
    <div className="flex gap-1">
      {s1 && (
        <div
          className="border border-border rounded-md overflow-hidden"
          style={{ width: size, height: size }}
        >
          <Image
            src={spellIconUrl(version, s1.key)}
            alt={s1.name}
            width={size}
            height={size}
            className="object-cover"
          />
        </div>
      )}
      {s2 && (
        <div
          className="border border-border rounded-md overflow-hidden"
          style={{ width: size, height: size }}
        >
          <Image
            src={spellIconUrl(version, s2.key)}
            alt={s2.name}
            width={size}
            height={size}
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
