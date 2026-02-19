import { describe, it, expect, vi, beforeEach } from "vitest";
import { championIconUrl, itemIconUrl, spellIconUrl, championSplashUrl, getChampionDisplayName, getChampionDDragonId } from "@/lib/riot/ddragon";

describe("DDragon URL builders", () => {
  const version = "14.24.1";

  describe("championIconUrl", () => {
    it("should build champion icon URL", () => {
      const url = championIconUrl(version, "Ezreal");
      expect(url).toBe("https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ezreal.png");
    });

    it("should handle Wukong -> MonkeyKing mapping", () => {
      const url = championIconUrl(version, "Wukong");
      expect(url).toBe("https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/MonkeyKing.png");
    });
  });

  describe("itemIconUrl", () => {
    it("should build item icon URL", () => {
      const url = itemIconUrl(version, 3078);
      expect(url).toBe("https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3078.png");
    });
  });

  describe("spellIconUrl", () => {
    it("should build spell icon URL", () => {
      const url = spellIconUrl(version, "SummonerFlash");
      expect(url).toBe("https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerFlash.png");
    });
  });

  describe("championSplashUrl", () => {
    it("should build splash URL", () => {
      const url = championSplashUrl("Ezreal");
      expect(url).toContain("Ezreal_0.jpg");
    });

    it("should handle skin numbers", () => {
      const url = championSplashUrl("Ezreal", 3);
      expect(url).toContain("Ezreal_3.jpg");
    });
  });

  describe("getChampionDisplayName", () => {
    it("should return display name for special champions", () => {
      expect(getChampionDisplayName("MonkeyKing")).toBe("Wukong");
    });

    it("should return the id for normal champions", () => {
      expect(getChampionDisplayName("Ezreal")).toBe("Ezreal");
    });
  });

  describe("getChampionDDragonId", () => {
    it("should return DDragon id for special champions", () => {
      expect(getChampionDDragonId("Wukong")).toBe("MonkeyKing");
    });

    it("should return name as-is for normal champions", () => {
      expect(getChampionDDragonId("Ezreal")).toBe("Ezreal");
    });
  });
});
