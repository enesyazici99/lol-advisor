import { describe, it, expect } from "vitest";

// Test the extraction helper patterns used by the scraper
describe("Scraper parse patterns", () => {
  describe("Item ID extraction from URL", () => {
    it("should extract item ID from DDragon URL", () => {
      const url = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3078.png";
      const match = url.match(/\/item\/(\d+)\.png/);
      expect(match).not.toBeNull();
      expect(parseInt(match![1])).toBe(3078);
    });

    it("should return null for non-item URLs", () => {
      const url = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ezreal.png";
      const match = url.match(/\/item\/(\d+)\.png/);
      expect(match).toBeNull();
    });
  });

  describe("Champion extraction from URL", () => {
    it("should extract champion name from URL", () => {
      const url = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ezreal.png";
      const match = url.match(/\/champion\/([^/.]+)\.png/);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("Ezreal");
    });
  });

  describe("KDA parsing with concatenated ratio", () => {
    function parseKDA(kdaText: string) {
      let kills = 0, deaths = 0, assists = 0;
      const m = kdaText.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+(?:\.\d+)?)\s*KDA/i);
      if (m) {
        kills = parseInt(m[1]);
        deaths = parseInt(m[2]);
        const combined = m[3];
        const dotIdx = combined.indexOf(".");
        if (dotIdx > 0) {
          let bestAssists = 0;
          let bestError = Infinity;
          for (let s = 1; s <= dotIdx; s++) {
            const a = parseInt(combined.substring(0, s));
            const r = parseFloat(combined.substring(s));
            if (isNaN(r)) continue;
            const expected = deaths > 0 ? (kills + a) / deaths : kills + a;
            const err = Math.abs(r - expected);
            if (err < bestError) { bestError = err; bestAssists = a; }
          }
          assists = bestAssists;
        } else {
          assists = parseInt(combined);
        }
      }
      return { kills, deaths, assists };
    }

    it("should parse standard KDA with single-digit ratio", () => {
      expect(parseKDA("9 / 7 / 41.86 KDA")).toEqual({ kills: 9, deaths: 7, assists: 4 });
    });

    it("should parse KDA with double-digit ratio", () => {
      expect(parseKDA("4 / 1 / 711.00 KDA")).toEqual({ kills: 4, deaths: 1, assists: 7 });
    });

    it("should parse KDA with zero assists", () => {
      expect(parseKDA("1 / 5 / 00.20 KDA")).toEqual({ kills: 1, deaths: 5, assists: 0 });
    });

    it("should parse KDA with double-digit assists", () => {
      expect(parseKDA("5 / 6 / 133.00 KDA")).toEqual({ kills: 5, deaths: 6, assists: 13 });
    });
  });

  describe("Rune ID extraction", () => {
    it("should extract rune ID from perk URL", () => {
      const url = "https://example.com/perk/8010.png";
      const match = url.match(/perk\/(\d+)\.png/) || url.match(/(\d{4})\.png/);
      expect(match).not.toBeNull();
      expect(parseInt(match![1])).toBe(8010);
    });
  });

  describe("Time ago pattern", () => {
    it("should match time ago in text", () => {
      const text = "3 hours ago - Pro Player";
      const match = text.match(/(\d+\s*(?:min|hour|day|h|m|d|s)\w*\s*ago)/i);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("3 hours ago");
    });
  });
});
