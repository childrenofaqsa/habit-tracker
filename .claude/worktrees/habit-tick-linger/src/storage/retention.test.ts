import { describe, it, expect } from "vitest";
import { purgeOldHistory } from "@/storage/retention";
import { emptyAppData } from "@/lib/schema";
import { todayKey } from "@/lib/date";

describe("purgeOldHistory", () => {
  it("drops entries older than retention window but keeps recent", () => {
    const data = emptyAppData();
    const today = todayKey();
    data.history[today] = { habitStatus: { h1: "done" }, habitStatusTimes: {}, valueEntries: {} };
    data.history["2000-01-01"] = { habitStatus: { h1: "missed" }, habitStatusTimes: {}, valueEntries: {} };

    const purged = purgeOldHistory(data);
    expect(purged.history[today]).toBeDefined();
    expect(purged.history["2000-01-01"]).toBeUndefined();
  });

  it("returns same reference when nothing to purge", () => {
    const data = emptyAppData();
    data.history[todayKey()] = { habitStatus: {}, habitStatusTimes: {}, valueEntries: {} };
    expect(purgeOldHistory(data)).toBe(data);
  });
});
