import { describe, it, expect } from "vitest";
import { newId } from "@/lib/id";

describe("newId", () => {
  it("returns a string", () => {
    expect(typeof newId()).toBe("string");
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });

  it("is non-empty", () => {
    expect(newId().length).toBeGreaterThan(0);
  });
});
