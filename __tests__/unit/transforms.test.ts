import { describe, it, expect } from "vitest";
import { transformMatch, transformTimeline, normalizePosition } from "@/lib/riot/transforms";
import type { RiotMatchResponse, RiotTimelineResponse } from "@/lib/riot/types";

const MOCK_PUUID = "test-puuid-123";

function makeMockMatch(overrides: Partial<any> = {}): RiotMatchResponse {
  return {
    metadata: {
      dataVersion: "2",
      matchId: "TR1_123456",
      participants: [MOCK_PUUID, "other-puuid"],
    },
    info: {
      gameCreation: 1700000000000,
      gameDuration: 1800,
      gameEndTimestamp: 1700001800000,
      gameId: 123456,
      gameMode: "CLASSIC",
      gameType: "MATCHED_GAME",
      mapId: 11,
      platformId: "TR1",
      queueId: 420,
      teams: [
        { teamId: 100, win: true, bans: [], objectives: {} },
        { teamId: 200, win: false, bans: [], objectives: {} },
      ],
      participants: [
        {
          puuid: MOCK_PUUID,
          summonerName: "TestPlayer",
          riotIdGameName: "TestPlayer",
          riotIdTagline: "TR1",
          championId: 81,
          championName: "Ezreal",
          champLevel: 18,
          teamId: 100,
          teamPosition: "BOTTOM",
          individualPosition: "BOTTOM",
          role: "DUO_CARRY",
          kills: 10,
          deaths: 3,
          assists: 7,
          totalMinionsKilled: 200,
          neutralMinionsKilled: 30,
          goldEarned: 15000,
          totalDamageDealtToChampions: 28000,
          visionScore: 25,
          wardsPlaced: 10,
          wardsKilled: 3,
          win: true,
          item0: 3078,
          item1: 3004,
          item2: 3158,
          item3: 3036,
          item4: 0,
          item5: 0,
          item6: 3340,
          summoner1Id: 4,
          summoner2Id: 7,
          perks: {
            statPerks: { defense: 5001, flex: 5008, offense: 5005 },
            styles: [
              {
                description: "primaryStyle",
                style: 8000,
                selections: [
                  { perk: 8010, var1: 0, var2: 0, var3: 0 },
                  { perk: 8009, var1: 0, var2: 0, var3: 0 },
                ],
              },
              {
                description: "subStyle",
                style: 8300,
                selections: [
                  { perk: 8345, var1: 0, var2: 0, var3: 0 },
                ],
              },
            ],
          },
          ...overrides,
        },
        {
          puuid: "other-puuid",
          summonerName: "Enemy",
          riotIdGameName: "Enemy",
          riotIdTagline: "TR1",
          championId: 103,
          championName: "Ahri",
          champLevel: 16,
          teamId: 200,
          teamPosition: "MIDDLE",
          individualPosition: "MIDDLE",
          role: "SOLO",
          kills: 5,
          deaths: 8,
          assists: 3,
          totalMinionsKilled: 180,
          neutralMinionsKilled: 0,
          goldEarned: 11000,
          totalDamageDealtToChampions: 18000,
          visionScore: 15,
          wardsPlaced: 8,
          wardsKilled: 1,
          win: false,
          item0: 3165,
          item1: 3020,
          item2: 0,
          item3: 0,
          item4: 0,
          item5: 0,
          item6: 3340,
          summoner1Id: 4,
          summoner2Id: 14,
          perks: {
            statPerks: { defense: 5001, flex: 5008, offense: 5005 },
            styles: [
              {
                description: "primaryStyle",
                style: 8100,
                selections: [{ perk: 8112, var1: 0, var2: 0, var3: 0 }],
              },
              {
                description: "subStyle",
                style: 8200,
                selections: [{ perk: 8226, var1: 0, var2: 0, var3: 0 }],
              },
            ],
          },
        },
      ],
    },
  };
}

function makeMockTimeline(): RiotTimelineResponse {
  const skillEvents = [
    // Levels 1-15: Q Q W Q W E Q W E R Q E Q E R (Q>W>E pattern - 5Q, 4W, 4E, 2R)
    ...[1, 1, 2, 1, 2, 3, 1, 2, 3, 4, 1, 3, 1, 3, 4].map((slot, i) => ({
      type: "SKILL_LEVEL_UP",
      timestamp: (i + 1) * 60000,
      participantId: 1,
      skillSlot: slot,
      levelUpType: "NORMAL",
    })),
  ];

  const itemEvents = [
    { type: "ITEM_PURCHASED", timestamp: 60000, participantId: 1, itemId: 1055 },
    { type: "ITEM_PURCHASED", timestamp: 120000, participantId: 1, itemId: 2003 }, // potion (excluded)
    { type: "ITEM_PURCHASED", timestamp: 600000, participantId: 1, itemId: 3078 },
    { type: "ITEM_PURCHASED", timestamp: 900000, participantId: 1, itemId: 3004 },
    { type: "ITEM_PURCHASED", timestamp: 900000, participantId: 2, itemId: 3165 }, // other player
  ];

  return {
    metadata: {
      dataVersion: "2",
      matchId: "TR1_123456",
      participants: [MOCK_PUUID, "other-puuid"],
    },
    info: {
      frameInterval: 60000,
      frames: [
        {
          events: [...skillEvents, ...itemEvents],
          participantFrames: {},
          timestamp: 0,
        },
      ],
      participants: [
        { participantId: 1, puuid: MOCK_PUUID },
        { participantId: 2, puuid: "other-puuid" },
      ],
    },
  };
}

describe("normalizePosition", () => {
  it("should normalize BOTTOM to ADC", () => {
    expect(normalizePosition("BOTTOM")).toBe("ADC");
  });

  it("should normalize UTILITY to SUP", () => {
    expect(normalizePosition("UTILITY")).toBe("SUP");
  });

  it("should normalize MIDDLE to MID", () => {
    expect(normalizePosition("MIDDLE")).toBe("MID");
  });

  it("should normalize JUNGLE to JGL", () => {
    expect(normalizePosition("JUNGLE")).toBe("JGL");
  });

  it("should keep TOP as TOP", () => {
    expect(normalizePosition("TOP")).toBe("TOP");
  });

  it("should handle empty string", () => {
    expect(normalizePosition("")).toBe("");
  });
});

describe("transformMatch", () => {
  it("should extract the correct participant", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.championName).toBe("Ezreal");
    expect(summary.win).toBe(true);
  });

  it("should calculate CS (minions + neutrals)", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.cs).toBe(230); // 200 + 30
  });

  it("should normalize position to short format", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.position).toBe("ADC"); // BOTTOM → ADC
  });

  it("should extract keystoneId from perks", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.keystoneId).toBe(8010); // Conqueror
  });

  it("should extract secondaryTreeId from perks", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.secondaryTreeId).toBe(8300); // Inspiration
  });

  it("should extract items (filtering out 0)", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.items).toEqual([3078, 3004, 3158, 3036, 3340]);
  });

  it("should include all 10 participants in summary", () => {
    const match = makeMockMatch();
    const summary = transformMatch(match, MOCK_PUUID);
    expect(summary.participants).toHaveLength(2);
    expect(summary.participants[0].championName).toBe("Ezreal");
    expect(summary.participants[1].championName).toBe("Ahri");
  });

  it("should throw for unknown puuid", () => {
    const match = makeMockMatch();
    expect(() => transformMatch(match, "unknown")).toThrow();
  });
});

describe("transformTimeline", () => {
  it("should group items by minute", () => {
    const timeline = makeMockTimeline();
    const result = transformTimeline(timeline, MOCK_PUUID);
    expect(result.itemTimeline).not.toBeNull();
    // Minute 1: item 1055 (potion excluded)
    expect(result.itemTimeline!["1"]).toEqual([1055]);
    // Minute 10: item 3078
    expect(result.itemTimeline!["10"]).toEqual([3078]);
    // Minute 15: item 3004
    expect(result.itemTimeline!["15"]).toEqual([3004]);
  });

  it("should exclude potions and trinkets from timeline", () => {
    const timeline = makeMockTimeline();
    const result = transformTimeline(timeline, MOCK_PUUID);
    // Potion 2003 at minute 2 should be excluded
    expect(result.itemTimeline!["2"]).toBeUndefined();
  });

  it("should not include other player items", () => {
    const timeline = makeMockTimeline();
    const result = transformTimeline(timeline, MOCK_PUUID);
    // Player 2's item at minute 15 should not appear
    const allItems = Object.values(result.itemTimeline!).flat();
    expect(allItems).not.toContain(3165);
  });

  it("should extract skill order as max priority string", () => {
    const timeline = makeMockTimeline();
    const result = transformTimeline(timeline, MOCK_PUUID);
    // By level 15 (excluding R): Q=5, W=4, E=4 (actually let me recount)
    // Skills: Q Q W Q W E Q W E R Q E Q E R
    // Non-R: Q Q W Q W E Q W E Q E Q E = Q:6, W:3, E:4 — wait let me recount
    // [1,1,2,1,2,3,1,2,3,4,1,3,1,3,4]
    // slot 1(Q): positions 0,1,3,6,10,12 = 6 times
    // slot 2(W): positions 2,4,7 = 3 times
    // slot 3(E): positions 5,8,11,13 = 4 times
    // slot 4(R): positions 9,14 = 2 times
    // Max order: Q(6) > E(4) > W(3)
    expect(result.skillOrder).toBe("Q > E > W");
  });

  it("should return null for unknown puuid", () => {
    const timeline = makeMockTimeline();
    const result = transformTimeline(timeline, "unknown-puuid");
    expect(result.itemTimeline).toBeNull();
    expect(result.skillOrder).toBeNull();
  });
});
