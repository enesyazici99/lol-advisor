import type { DDragonChampion } from "@/lib/riot/ddragon";

export type ChampionTagType =
  | "burst"
  | "sustain"
  | "cc"
  | "tank"
  | "poke"
  | "engage"
  | "splitpush"
  | "teamfight"
  | "assassin"
  | "utility"
  | "dps";

// Manual champion tag mapping — DDragon tags are too generic, this enriches them
export const CHAMPION_TAG_MAP: Record<string, ChampionTagType[]> = {
  // Assassins / Burst
  Zed: ["burst", "assassin", "splitpush"],
  Talon: ["burst", "assassin"],
  Katarina: ["burst", "assassin", "teamfight"],
  Akali: ["burst", "assassin", "splitpush"],
  Fizz: ["burst", "assassin"],
  Kassadin: ["burst", "assassin", "splitpush"],
  Qiyana: ["burst", "assassin", "cc", "teamfight"],
  Naafiri: ["burst", "assassin"],
  Khazix: ["burst", "assassin"],
  Evelynn: ["burst", "assassin"],
  Rengar: ["burst", "assassin"],
  Shaco: ["burst", "assassin", "splitpush"],
  LeBlanc: ["burst", "assassin", "cc"],
  Ekko: ["burst", "assassin"],

  // Mages / Poke / Burst
  Lux: ["burst", "poke", "cc", "utility"],
  Xerath: ["poke", "cc"],
  Velkoz: ["poke", "cc"],
  Ziggs: ["poke", "teamfight"],
  Syndra: ["burst", "cc"],
  Orianna: ["teamfight", "cc", "utility"],
  Viktor: ["burst", "poke", "teamfight"],
  Azir: ["dps", "teamfight", "poke"],
  Veigar: ["burst", "cc"],
  Annie: ["burst", "cc", "engage"],
  Brand: ["teamfight", "poke", "dps"],
  Zyra: ["poke", "cc", "teamfight"],
  Malzahar: ["cc", "dps"],
  Cassiopeia: ["dps", "cc", "sustain"],
  Ryze: ["dps", "burst"],
  AurelionSol: ["poke", "teamfight", "dps"],
  Ahri: ["burst", "assassin", "cc"],
  Anivia: ["cc", "teamfight", "poke"],

  // Fighters / Bruisers
  Darius: ["sustain", "splitpush", "teamfight"],
  Garen: ["sustain", "tank", "splitpush"],
  Mordekaiser: ["sustain", "dps"],
  Sett: ["cc", "engage", "teamfight"],
  Aatrox: ["sustain", "teamfight"],
  Riven: ["burst", "splitpush"],
  Fiora: ["splitpush", "dps", "sustain"],
  Camille: ["splitpush", "burst", "engage"],
  Irelia: ["dps", "sustain", "splitpush"],
  Jax: ["dps", "splitpush", "sustain"],
  Renekton: ["burst", "engage"],
  Gnar: ["cc", "teamfight", "tank"],
  Kled: ["engage", "burst"],
  Illaoi: ["sustain", "splitpush", "teamfight"],
  Yorick: ["splitpush", "sustain"],
  Nasus: ["splitpush", "sustain", "tank"],
  Tryndamere: ["splitpush", "dps"],
  Urgot: ["dps", "tank"],
  Olaf: ["sustain", "dps"],
  Volibear: ["engage", "tank", "sustain"],
  Ambessa: ["burst", "engage", "splitpush"],
  KSante: ["tank", "cc", "engage"],

  // Tanks / Engage
  Malphite: ["engage", "tank", "teamfight", "cc"],
  Ornn: ["tank", "cc", "engage", "teamfight"],
  Sion: ["tank", "cc", "teamfight"],
  Maokai: ["tank", "cc", "engage"],
  Sejuani: ["tank", "cc", "engage", "teamfight"],
  Zac: ["tank", "cc", "engage", "teamfight"],
  Amumu: ["tank", "cc", "engage", "teamfight"],
  Rammus: ["tank", "cc"],
  Leona: ["tank", "cc", "engage"],
  Nautilus: ["tank", "cc", "engage"],
  Alistar: ["tank", "cc", "engage"],
  Braum: ["tank", "cc", "utility"],
  Thresh: ["cc", "engage", "utility"],
  Rell: ["tank", "cc", "engage", "teamfight"],
  Taric: ["tank", "cc", "sustain", "utility"],
  Blitzcrank: ["cc", "engage"],
  Poppy: ["tank", "cc"],
  Singed: ["tank", "splitpush"],

  // ADCs / DPS
  Jinx: ["dps", "teamfight"],
  Kaisa: ["dps", "burst", "assassin"],
  Vayne: ["dps", "splitpush"],
  Caitlyn: ["poke", "dps"],
  Ezreal: ["poke", "dps"],
  Lucian: ["burst", "dps"],
  Tristana: ["dps", "burst"],
  MissFortune: ["teamfight", "poke", "dps"],
  Jhin: ["poke", "cc", "dps"],
  Draven: ["dps", "burst"],
  Aphelios: ["dps", "teamfight"],
  Xayah: ["dps", "teamfight"],
  Samira: ["burst", "dps", "teamfight"],
  Zeri: ["dps", "poke"],
  Varus: ["poke", "cc", "dps"],
  Ashe: ["cc", "poke", "utility", "dps"],
  KogMaw: ["dps", "poke"],
  Twitch: ["dps", "teamfight", "assassin"],
  Sivir: ["dps", "teamfight", "utility"],
  Kalista: ["dps", "utility"],
  Nilah: ["dps", "teamfight"],
  Smolder: ["dps", "poke"],

  // Supports / Enchanters
  Lulu: ["utility", "cc"],
  Janna: ["utility", "cc", "poke"],
  Nami: ["sustain", "cc", "utility"],
  Soraka: ["sustain", "utility"],
  Sona: ["sustain", "utility", "teamfight"],
  Yuumi: ["sustain", "utility"],
  Karma: ["utility", "poke"],
  Renata: ["utility", "cc", "teamfight"],
  Milio: ["utility", "sustain"],
  Senna: ["sustain", "poke", "utility"],
  Bard: ["utility", "cc"],
  Pyke: ["assassin", "cc", "engage"],
  Rakan: ["engage", "cc", "utility"],

  // Junglers
  LeeSin: ["burst", "engage"],
  Elise: ["burst", "cc", "engage"],
  Nidalee: ["burst", "poke"],
  Hecarim: ["engage", "teamfight"],
  Kayn: ["burst", "assassin", "sustain"],
  Viego: ["dps", "sustain", "assassin"],
  Lillia: ["dps", "cc", "teamfight"],
  Belveth: ["dps", "splitpush"],
  Briar: ["burst", "sustain", "assassin"],
  Ivern: ["utility", "cc"],
  Kindred: ["dps"],
  Graves: ["burst", "dps"],
  Nocturne: ["assassin", "engage"],
  Shyvana: ["dps", "teamfight"],
  Skarner: ["tank", "cc", "engage"],
  Udyr: ["tank", "sustain", "splitpush"],
  MasterYi: ["dps", "splitpush"],
  XinZhao: ["engage", "cc"],
  JarvanIV: ["engage", "cc", "teamfight"],
  Vi: ["engage", "burst", "cc"],
  Warwick: ["sustain", "cc", "engage"],
  Fiddlesticks: ["teamfight", "cc"],
  Diana: ["burst", "teamfight", "engage"],
  RekSai: ["engage", "burst"],
  Nunu: ["tank", "cc", "engage"],
  Wukong: ["engage", "teamfight", "cc"],

  // Mid-specific
  Yasuo: ["dps", "splitpush", "teamfight"],
  Yone: ["dps", "engage", "teamfight"],
  Sylas: ["burst", "sustain"],
  TwistedFate: ["cc", "utility"],
  Galio: ["tank", "cc", "engage", "teamfight"],
  Rumble: ["teamfight", "poke"],
  Kennen: ["engage", "teamfight", "cc"],
  Vladimir: ["sustain", "burst", "teamfight"],
  Swain: ["sustain", "teamfight", "cc"],
  Gangplank: ["poke", "teamfight", "splitpush"],
};

// Derive tags from DDragon tags when manual mapping is missing
const DDRAGON_TAG_MAPPING: Record<string, ChampionTagType[]> = {
  Fighter: ["dps", "sustain"],
  Tank: ["tank", "cc"],
  Mage: ["burst", "poke"],
  Assassin: ["burst", "assassin"],
  Marksman: ["dps"],
  Support: ["utility", "cc"],
};

export function computeChampionTags(
  champions: Record<string, DDragonChampion>
): Record<string, ChampionTagType[]> {
  const result: Record<string, ChampionTagType[]> = {};

  for (const [key, champ] of Object.entries(champions)) {
    if (CHAMPION_TAG_MAP[key]) {
      result[key] = CHAMPION_TAG_MAP[key];
    } else {
      // Derive from DDragon tags
      const tags = new Set<ChampionTagType>();
      for (const tag of champ.tags) {
        const mapped = DDRAGON_TAG_MAPPING[tag];
        if (mapped) mapped.forEach((t) => tags.add(t));
      }
      result[key] = tags.size > 0 ? [...tags] : ["dps"];
    }
  }

  return result;
}

export function getChampionsByTag(
  tag: ChampionTagType,
  allTags: Record<string, ChampionTagType[]>
): string[] {
  return Object.entries(allTags)
    .filter(([, tags]) => tags.includes(tag))
    .map(([key]) => key);
}
