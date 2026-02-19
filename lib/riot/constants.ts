export const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
export const DDRAGON_CDN = `${DDRAGON_BASE}/cdn`;

export const CHAMPION_NAME_FIXES: Record<string, string> = {
  "Wukong": "MonkeyKing",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Cho'Gath": "Chogath",
  "Vel'Koz": "Velkoz",
  "Kog'Maw": "KogMaw",
  "Rek'Sai": "RekSai",
  "Bel'Veth": "Belveth",
  "K'Sante": "KSante",
  "LeBlanc": "Leblanc",
  "Nunu & Willump": "Nunu",
  "Renata Glasc": "Renata",
};

export const CHAMPION_ID_TO_NAME: Record<string, string> = {
  "MonkeyKing": "Wukong",
  "Kaisa": "Kai'Sa",
  "Khazix": "Kha'Zix",
  "Chogath": "Cho'Gath",
  "Velkoz": "Vel'Koz",
  "KogMaw": "Kog'Maw",
  "RekSai": "Rek'Sai",
  "Belveth": "Bel'Veth",
  "KSante": "K'Sante",
  "Leblanc": "LeBlanc",
  "Nunu": "Nunu & Willump",
  "Renata": "Renata Glasc",
};

export const SUMMONER_SPELLS: Record<number, { key: string; name: string }> = {
  1: { key: "SummonerBoost", name: "Cleanse" },
  3: { key: "SummonerExhaust", name: "Exhaust" },
  4: { key: "SummonerFlash", name: "Flash" },
  6: { key: "SummonerHaste", name: "Ghost" },
  7: { key: "SummonerHeal", name: "Heal" },
  11: { key: "SummonerSmite", name: "Smite" },
  12: { key: "SummonerTeleport", name: "Teleport" },
  14: { key: "SummonerDot", name: "Ignite" },
  21: { key: "SummonerBarrier", name: "Barrier" },
  32: { key: "SummonerSnowball", name: "Mark" },
};

export const RUNE_TREES: Record<number, { name: string; icon: string }> = {
  8000: { name: "Precision", icon: "7201_Precision" },
  8100: { name: "Domination", icon: "7200_Domination" },
  8200: { name: "Sorcery", icon: "7202_Sorcery" },
  8300: { name: "Inspiration", icon: "7203_Whimsy" },
  8400: { name: "Resolve", icon: "7204_Resolve" },
};

export const KEYSTONES: Record<number, { name: string; tree: number }> = {
  8005: { name: "Press the Attack", tree: 8000 },
  8008: { name: "Lethal Tempo", tree: 8000 },
  8021: { name: "Fleet Footwork", tree: 8000 },
  8010: { name: "Conqueror", tree: 8000 },
  8112: { name: "Electrocute", tree: 8100 },
  8124: { name: "Predator", tree: 8100 },
  8128: { name: "Dark Harvest", tree: 8100 },
  9923: { name: "Hail of Blades", tree: 8100 },
  8214: { name: "Summon Aery", tree: 8200 },
  8229: { name: "Arcane Comet", tree: 8200 },
  8230: { name: "Phase Rush", tree: 8200 },
  8351: { name: "Glacial Augment", tree: 8300 },
  8360: { name: "Unsealed Spellbook", tree: 8300 },
  8369: { name: "First Strike", tree: 8300 },
  8437: { name: "Grasp of the Undying", tree: 8400 },
  8439: { name: "Aftershock", tree: 8400 },
  8465: { name: "Guardian", tree: 8400 },
};

export const ROLES = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  TOP: "Top",
  JGL: "Jungle",
  MID: "Mid",
  ADC: "ADC",
  SUP: "Support",
};

export const REGIONS = ["KR", "EUW", "NA", "CN", "LCK", "LEC", "LCS", "LPL"] as const;
export type Region = (typeof REGIONS)[number];

/** Infer primary role from DDragon champion tags + spell (Smite = JGL) */
export const TAG_TO_PRIMARY_ROLE: Record<string, Role> = {
  Marksman: "ADC",
  Support: "SUP",
};

/** Multi-role champions: first tag determines primary. Override specific champions here. */
export const CHAMPION_ROLE_OVERRIDE: Record<string, Role> = {
  // Junglers that have Fighter/Assassin tags but are primarily JGL
  LeeSin: "JGL", Elise: "JGL", Nidalee: "JGL", Hecarim: "JGL",
  Khazix: "JGL", RekSai: "JGL", Kayn: "JGL", Viego: "JGL",
  Lillia: "JGL", Belveth: "JGL", Briar: "JGL", Ivern: "JGL",
  Kindred: "JGL", Graves: "JGL", Nocturne: "JGL", Shyvana: "JGL",
  Rammus: "JGL", Amumu: "JGL", Sejuani: "JGL", Zac: "JGL",
  Nunu: "JGL", Skarner: "JGL", Volibear: "JGL", Udyr: "JGL",
  MasterYi: "JGL", XinZhao: "JGL", JarvanIV: "JGL", Vi: "JGL",
  Warwick: "JGL", Fiddlesticks: "JGL", Evelynn: "JGL",
  Diana: "JGL", Ekko: "JGL",
  // Top laners
  Darius: "TOP", Garen: "TOP", Mordekaiser: "TOP", Sett: "TOP",
  Renekton: "TOP", Fiora: "TOP", Camille: "TOP", Irelia: "TOP",
  Jax: "TOP", Riven: "TOP", Aatrox: "TOP", Ornn: "TOP",
  Sion: "TOP", Malphite: "TOP", Gnar: "TOP", Kennen: "TOP",
  Gangplank: "TOP", Illaoi: "TOP", Kled: "TOP", Yorick: "TOP",
  Nasus: "TOP", Tryndamere: "TOP", Urgot: "TOP", Rumble: "TOP",
  Singed: "TOP", Olaf: "TOP", Poppy: "TOP", KSante: "TOP",
  Ambessa: "TOP",
  // Mids
  Yasuo: "MID", Yone: "MID", Sylas: "MID", Akali: "MID",
  Katarina: "MID", Talon: "MID", Zed: "MID", Qiyana: "MID",
  Fizz: "MID", Kassadin: "MID", Naafiri: "MID",
  // Supports that are tanks
  Thresh: "SUP", Nautilus: "SUP", Leona: "SUP", Braum: "SUP",
  Alistar: "SUP", TahmKench: "SUP", Rell: "SUP", Taric: "SUP",
  Blitzcrank: "SUP", Maokai: "SUP",
};

export function inferRole(championKey: string, tags: string[], spell1?: number | null, spell2?: number | null): Role {
  // Smite = jungler
  if (spell1 === 11 || spell2 === 11) return "JGL";

  // Explicit override
  if (CHAMPION_ROLE_OVERRIDE[championKey]) return CHAMPION_ROLE_OVERRIDE[championKey];

  // Tag-based
  for (const tag of tags) {
    if (TAG_TO_PRIMARY_ROLE[tag]) return TAG_TO_PRIMARY_ROLE[tag];
  }

  // Default by first tag
  const firstTag = tags[0];
  if (firstTag === "Fighter") return "TOP";
  if (firstTag === "Tank") return "TOP";
  if (firstTag === "Mage") return "MID";
  if (firstTag === "Assassin") return "MID";

  return "MID";
}
