export interface Champion {
  id: string;
  riot_key: string;
  riot_id: string;
  name: string;
  title: string;
  tags: string[];
  roles: string[];
  created_at: string;
}

export interface ProMatch {
  id: string;
  champion_key: string;
  pro_player: string;
  team: string | null;
  region: string | null;
  role: string | null;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  items: number[];
  rune_primary_keystone: number | null;
  rune_primary_tree: number | null;
  rune_secondary_tree: number | null;
  spell1: number | null;
  spell2: number | null;
  skill_order: string | null;
  item_timeline: Record<string, number[]> | null;
  vs_champion: string | null;
  cs: number | null;
  gold: number | null;
  damage: number | null;
  duration_minutes: number | null;
  match_date: string;
  source_url: string | null;
  created_at: string;
}

export interface MetaBuild {
  id: string;
  champion_key: string;
  role: string;
  win_rate: number;
  pick_rate: number;
  match_count: number;
  popular_items: { id: number; pct: number }[];
  popular_boots: { id: number; pct: number }[];
  popular_runes: { keystone: number; secondary: number; pct: number }[];
  popular_spells: { spell1: number; spell2: number; pct: number }[];
  skill_order: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      champions: {
        Row: Champion;
        Insert: Omit<Champion, "id" | "created_at">;
        Update: Partial<Omit<Champion, "id" | "created_at">>;
      };
      pro_matches: {
        Row: ProMatch;
        Insert: Omit<ProMatch, "id" | "created_at">;
        Update: Partial<Omit<ProMatch, "id" | "created_at">>;
      };
      meta_builds: {
        Row: MetaBuild;
        Insert: Omit<MetaBuild, "id" | "updated_at">;
        Update: Partial<Omit<MetaBuild, "id" | "updated_at">>;
      };
    };
  };
}
