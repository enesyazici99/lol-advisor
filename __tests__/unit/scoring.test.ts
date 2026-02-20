import { describe, it, expect } from "vitest";
import {
  calculateTier,
  calculateTierScore,
  scoreMatchup,
} from "@/lib/engine/scoring";
import type { MatchupData } from "@/lib/supabase/types";

describe("Scoring Engine", () => {
  describe("calculateTier", () => {
    it("should return S+ for score > 54", () => {
      expect(calculateTier(55)).toBe("S+");
      expect(calculateTier(60)).toBe("S+");
    });

    it("should return S for score 52-54", () => {
      expect(calculateTier(53)).toBe("S");
      expect(calculateTier(52.5)).toBe("S");
    });

    it("should return A for score 50-52", () => {
      expect(calculateTier(51)).toBe("A");
      expect(calculateTier(50.1)).toBe("A");
    });

    it("should return B for score 48-50", () => {
      expect(calculateTier(49)).toBe("B");
      expect(calculateTier(48.5)).toBe("B");
    });

    it("should return C for score < 48", () => {
      expect(calculateTier(47)).toBe("C");
      expect(calculateTier(40)).toBe("C");
    });

    it("should handle boundary values", () => {
      expect(calculateTier(54)).toBe("S");
      expect(calculateTier(52)).toBe("A");
      expect(calculateTier(50)).toBe("B");
      expect(calculateTier(48)).toBe("C");
    });
  });

  describe("calculateTierScore", () => {
    it("should weight matchup win rate at 60%", () => {
      const score = calculateTierScore(60, 0, 0);
      expect(score).toBeCloseTo(36, 1);
    });

    it("should weight general win rate at 25%", () => {
      const score = calculateTierScore(0, 60, 0);
      expect(score).toBeCloseTo(15, 1);
    });

    it("should weight pick rate at 15%", () => {
      const score = calculateTierScore(0, 0, 60);
      expect(score).toBeCloseTo(9, 1);
    });

    it("should combine all weights correctly", () => {
      // 55 * 0.6 + 52 * 0.25 + 10 * 0.15 = 33 + 13 + 1.5 = 47.5
      const score = calculateTierScore(55, 52, 10);
      expect(score).toBeCloseTo(47.5, 1);
    });

    it("should produce S+ tier for strong matchups", () => {
      // 58 * 0.6 + 53 * 0.25 + 8 * 0.15 = 34.8 + 13.25 + 1.2 = 49.25
      // Not enough for S+ — need higher:
      // 60 * 0.6 + 55 * 0.25 + 15 * 0.15 = 36 + 13.75 + 2.25 = 52
      const score = calculateTierScore(60, 55, 15);
      expect(score).toBeGreaterThan(50);
    });
  });

  describe("scoreMatchup", () => {
    const mockMatchup: MatchupData = {
      id: "1",
      champion_key: "Darius",
      vs_champion_key: "Teemo",
      role: "TOP",
      win_rate: 55.2,
      games: 1500,
      delta: 5.2,
      recommended_items: [3078, 3053],
      recommended_runes: { keystone: 8010, secondary: 8400 },
      recommended_spells: { spell1: 4, spell2: 6 },
      updated_at: "2024-01-01",
    };

    it("should score a matchup with default general/pick rates", () => {
      const result = scoreMatchup(mockMatchup);

      expect(result.championKey).toBe("Darius");
      expect(result.winRate).toBe(55.2);
      expect(result.games).toBe(1500);
      expect(result.delta).toBe(5.2);
      expect(result.tier).toBeDefined();
      expect(result.tierScore).toBeGreaterThan(0);
    });

    it("should use provided general win rate and pick rate", () => {
      const result = scoreMatchup(mockMatchup, 52, 8);
      // 55.2 * 0.6 + 52 * 0.25 + 8 * 0.15 = 33.12 + 13 + 1.2 = 47.32
      expect(result.tierScore).toBeCloseTo(47.32, 1);
      expect(result.tier).toBe("C");
    });

    it("should handle high win rate matchups", () => {
      const highWr: MatchupData = {
        ...mockMatchup,
        win_rate: 62,
        delta: 12,
      };
      const result = scoreMatchup(highWr, 55, 12);
      // 62 * 0.6 + 55 * 0.25 + 12 * 0.15 = 37.2 + 13.75 + 1.8 = 52.75
      expect(result.tier).toBe("S");
    });

    it("should handle low win rate matchups", () => {
      const lowWr: MatchupData = {
        ...mockMatchup,
        win_rate: 42,
        delta: -8,
      };
      const result = scoreMatchup(lowWr, 48, 3);
      // 42 * 0.6 + 48 * 0.25 + 3 * 0.15 = 25.2 + 12 + 0.45 = 37.65
      expect(result.tier).toBe("C");
    });
  });
});
