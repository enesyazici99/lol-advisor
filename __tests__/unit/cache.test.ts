import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryCache } from "@/lib/utils/cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  it("should set and get a value", () => {
    cache.set("key1", "value1", 60000);
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return null for missing keys", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("should expire entries after TTL", () => {
    vi.useFakeTimers();
    cache.set("key1", "value1", 1000);

    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(1500);
    expect(cache.get("key1")).toBeNull();

    vi.useRealTimers();
  });

  it("should delete a specific key", () => {
    cache.set("key1", "value1", 60000);
    cache.set("key2", "value2", 60000);

    cache.delete("key1");

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBe("value2");
  });

  it("should clear all entries", () => {
    cache.set("key1", "value1", 60000);
    cache.set("key2", "value2", 60000);

    cache.clear();

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
  });

  it("should check if key exists with has()", () => {
    cache.set("key1", "value1", 60000);

    expect(cache.has("key1")).toBe(true);
    expect(cache.has("nonexistent")).toBe(false);
  });

  it("should handle different data types", () => {
    cache.set("number", 42, 60000);
    cache.set("object", { a: 1, b: 2 }, 60000);
    cache.set("array", [1, 2, 3], 60000);
    cache.set("boolean", true, 60000);

    expect(cache.get("number")).toBe(42);
    expect(cache.get("object")).toEqual({ a: 1, b: 2 });
    expect(cache.get("array")).toEqual([1, 2, 3]);
    expect(cache.get("boolean")).toBe(true);
  });

  it("should overwrite existing values", () => {
    cache.set("key1", "old", 60000);
    cache.set("key1", "new", 60000);

    expect(cache.get("key1")).toBe("new");
  });
});
