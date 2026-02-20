import { create } from "zustand";
import type { Role } from "@/lib/riot/constants";
import type { LcuPhase } from "@/hooks/useLCU";

type Theme = "light" | "dark";

interface AppState {
  selectedRole: Role | null;
  searchQuery: string;
  version: string;
  expandedMatchId: string | null;
  summonerExpandedMatchId: string | null;
  theme: Theme;
  advisorRole: Role | null;
  advisorVsChampion: string | null;
  lcuPhase: LcuPhase;
  lcuSummonerName: string | null;
  setSelectedRole: (role: Role | null) => void;
  setSearchQuery: (query: string) => void;
  setVersion: (version: string) => void;
  setExpandedMatchId: (id: string | null) => void;
  setSummonerExpandedMatchId: (id: string | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setAdvisorRole: (role: Role | null) => void;
  setAdvisorVsChampion: (champion: string | null) => void;
  setLcuPhase: (phase: LcuPhase) => void;
  setLcuSummonerName: (name: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRole: null,
  searchQuery: "",
  version: "",
  expandedMatchId: null,
  summonerExpandedMatchId: null,
  theme: "dark",
  advisorRole: null,
  advisorVsChampion: null,
  lcuPhase: "disconnected",
  lcuSummonerName: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setVersion: (version) => set({ version }),
  setExpandedMatchId: (id) => set({ expandedMatchId: id }),
  setSummonerExpandedMatchId: (id) => set({ summonerExpandedMatchId: id }),
  setAdvisorRole: (role) => set({ advisorRole: role }),
  setAdvisorVsChampion: (champion) => set({ advisorVsChampion: champion }),
  setLcuPhase: (phase) => set({ lcuPhase: phase }),
  setLcuSummonerName: (name) => set({ lcuSummonerName: name }),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("lol-advisor-theme", next);
      }
      return { theme: next };
    }),
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("lol-advisor-theme", theme);
    }
    set({ theme });
  },
}));
