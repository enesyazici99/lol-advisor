import Image from "next/image";
import { itemIconUrl } from "@/lib/riot/ddragon";

interface ItemBuildDisplayProps {
  items: number[];
  version: string;
  size?: number;
}

export function ItemBuildDisplay({ items, version, size = 32 }: ItemBuildDisplayProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex gap-1 items-center">
      {items.slice(0, 7).map((itemId, idx) => (
        <div
          key={`${itemId}-${idx}`}
          className="border border-border rounded-md overflow-hidden hover:border-accent transition-colors"
          style={{ width: size, height: size }}
        >
          <Image
            src={itemIconUrl(version, itemId)}
            alt={`Item ${itemId}`}
            width={size}
            height={size}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
