import { describe, it, expect, vi } from "vitest";
import { timeAgo, formatKDA, calculateKDARatio, formatWinRate, parseTimeAgo, slugify } from "@/lib/utils/helpers";

describe("timeAgo", () => {
  it("should return seconds ago for recent dates", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 30000);
    expect(timeAgo(date)).toBe("30s ago");
  });

  it("should return minutes ago", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 5 * 60000);
    expect(timeAgo(date)).toBe("5m ago");
  });

  it("should return hours ago", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 3 * 3600000);
    expect(timeAgo(date)).toBe("3h ago");
  });

  it("should return days ago", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 7 * 86400000);
    expect(timeAgo(date)).toBe("7d ago");
  });

  it("should accept string dates", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 2 * 3600000);
    expect(timeAgo(date.toISOString())).toBe("2h ago");
  });
});

describe("formatKDA", () => {
  it("should format KDA correctly", () => {
    expect(formatKDA(5, 3, 7)).toBe("5/3/7");
  });

  it("should handle zero values", () => {
    expect(formatKDA(0, 0, 0)).toBe("0/0/0");
  });
});

describe("calculateKDARatio", () => {
  it("should calculate KDA ratio", () => {
    expect(calculateKDARatio(10, 2, 8)).toBe("9.00");
  });

  it("should return Perfect when no deaths", () => {
    expect(calculateKDARatio(5, 0, 3)).toBe("Perfect");
  });
});

describe("formatWinRate", () => {
  it("should format win rate", () => {
    expect(formatWinRate(55, 100)).toBe("55.0%");
  });

  it("should handle zero total", () => {
    expect(formatWinRate(0, 0)).toBe("0%");
  });
});

describe("parseTimeAgo", () => {
  it("should parse hours ago", () => {
    const result = parseTimeAgo("2 hours ago");
    const expected = Date.now() - 2 * 3600000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(100);
  });

  it("should parse minutes ago", () => {
    const result = parseTimeAgo("30 min ago");
    const expected = Date.now() - 30 * 60000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(100);
  });

  it("should parse days ago", () => {
    const result = parseTimeAgo("3 days ago");
    const expected = Date.now() - 3 * 86400000;
    expect(Math.abs(result.getTime() - expected)).toBeLessThan(100);
  });

  it("should return now for unparseable text", () => {
    const result = parseTimeAgo("unknown");
    expect(Math.abs(result.getTime() - Date.now())).toBeLessThan(100);
  });
});

describe("slugify", () => {
  it("should slugify text", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("Kai'Sa")).toBe("kai-sa");
  });
});
