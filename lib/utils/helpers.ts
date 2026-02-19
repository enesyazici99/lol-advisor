export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return past.toLocaleDateString();
}

export function formatKDA(kills: number, deaths: number, assists: number): string {
  return `${kills}/${deaths}/${assists}`;
}

export function calculateKDARatio(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return "0%";
  return `${((wins / total) * 100).toFixed(1)}%`;
}

export function parseTimeAgo(text: string): Date {
  const now = new Date();
  const match = text.match(/(\d+)\s*(s|m|h|d|min|hour|day|second|minute)/i);
  if (!match) return now;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("s")) return new Date(now.getTime() - value * 1000);
  if (unit.startsWith("min") || unit === "m") return new Date(now.getTime() - value * 60000);
  if (unit.startsWith("h")) return new Date(now.getTime() - value * 3600000);
  if (unit.startsWith("d")) return new Date(now.getTime() - value * 86400000);

  return now;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Generate a fingerprint string for match dedup */
export function matchFingerprint(
  championKey: string,
  proPlayer: string,
  kills: number,
  deaths: number,
  assists: number,
  items: number[],
  win: boolean
): string {
  return `${championKey}|${proPlayer}|${kills}/${deaths}/${assists}|${[...items].sort().join(",")}|${win}`;
}
