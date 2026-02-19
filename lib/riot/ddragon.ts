import { MemoryCache } from "@/lib/utils/cache";
import { DDRAGON_BASE, DDRAGON_CDN, CHAMPION_NAME_FIXES, CHAMPION_ID_TO_NAME } from "./constants";

const cache = new MemoryCache();
const VERSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DATA_TTL = 60 * 60 * 1000; // 1 hour

export async function getLatestVersion(): Promise<string> {
  const cached = cache.get<string>("ddragon-version");
  if (cached) return cached;

  const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
  const versions: string[] = await res.json();
  const latest = versions[0];
  cache.set("ddragon-version", latest, VERSION_TTL);
  return latest;
}

export interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: { full: string };
}

export async function getChampions(): Promise<Record<string, DDragonChampion>> {
  const cached = cache.get<Record<string, DDragonChampion>>("ddragon-champions");
  if (cached) return cached;

  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_CDN}/${version}/data/en_US/champion.json`);
  const data = await res.json();
  cache.set("ddragon-champions", data.data, DATA_TTL);
  return data.data;
}

export interface DDragonItem {
  name: string;
  description: string;
  image: { full: string };
  gold: { total: number };
  tags: string[];
}

export async function getItems(): Promise<Record<string, DDragonItem>> {
  const cached = cache.get<Record<string, DDragonItem>>("ddragon-items");
  if (cached) return cached;

  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_CDN}/${version}/data/en_US/item.json`);
  const data = await res.json();
  cache.set("ddragon-items", data.data, DATA_TTL);
  return data.data;
}

export async function getRunes(): Promise<unknown[]> {
  const cached = cache.get<unknown[]>("ddragon-runes");
  if (cached) return cached;

  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_CDN}/${version}/data/en_US/runesReforged.json`);
  const data = await res.json();
  cache.set("ddragon-runes", data, DATA_TTL);
  return data;
}

export async function getSpells(): Promise<Record<string, unknown>> {
  const cached = cache.get<Record<string, unknown>>("ddragon-spells");
  if (cached) return cached;

  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_CDN}/${version}/data/en_US/summoner.json`);
  const data = await res.json();
  cache.set("ddragon-spells", data.data, DATA_TTL);
  return data.data;
}

// URL Builders
export function championIconUrl(version: string, championId: string): string {
  const id = CHAMPION_NAME_FIXES[championId] || championId;
  return `${DDRAGON_CDN}/${version}/img/champion/${id}.png`;
}

export function championSplashUrl(championId: string, skinNum = 0): string {
  const id = CHAMPION_NAME_FIXES[championId] || championId;
  return `${DDRAGON_CDN}/img/champion/splash/${id}_${skinNum}.jpg`;
}

export function itemIconUrl(version: string, itemId: string | number): string {
  return `${DDRAGON_CDN}/${version}/img/item/${itemId}.png`;
}

export function runeIconUrl(path: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/${path}`;
}

export function spellIconUrl(version: string, spellKey: string): string {
  return `${DDRAGON_CDN}/${version}/img/spell/${spellKey}.png`;
}

export function getChampionDisplayName(id: string): string {
  return CHAMPION_ID_TO_NAME[id] || id;
}

export function getChampionDDragonId(name: string): string {
  return CHAMPION_NAME_FIXES[name] || name;
}
