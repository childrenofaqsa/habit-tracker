import { describe, it, expect } from "vitest";
import {
  toDateKey,
  todayKey,
  parseDateKey,
  reverseChronologicalKeys,
  isDateKeyBeforeToday,
  isDateKeyToday,
  formatHumanDate,
  formatShortDate,
  formatMatrixDate,
  backupTimestamp,
} from "@/lib/date";

describe("toDateKey / parseDateKey", () => {
  it("formats and parses a date roundtrip", () => {
    const date = new Date(2024, 5, 15);
    const key = toDateKey(date);
    expect(key).toBe("2024-06-15");
    const parsed = parseDateKey(key);
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(15);
  });

  it("pads single-digit months and days", () => {
    const date = new Date(2024, 0, 5);
    expect(toDateKey(date)).toBe("2024-01-05");
  });
});

describe("todayKey", () => {
  it("returns current date in yyyy-MM-dd format", () => {
    const key = todayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    expect(key).toBe(toDateKey(now));
  });
});

describe("reverseChronologicalKeys", () => {
  it("returns correct number of days", () => {
    const keys = reverseChronologicalKeys(7);
    expect(keys).toHaveLength(7);
  });

  it("starts with today", () => {
    const keys = reverseChronologicalKeys(3);
    expect(keys[0]).toBe(todayKey());
  });

  it("is in reverse chronological order", () => {
    const keys = reverseChronologicalKeys(5);
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]! < keys[i - 1]!).toBe(true);
    }
  });

  it("returns empty array for 0 days", () => {
    expect(reverseChronologicalKeys(0)).toHaveLength(0);
  });
});

describe("isDateKeyBeforeToday", () => {
  it("returns true for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDateKeyBeforeToday(toDateKey(yesterday))).toBe(true);
  });

  it("returns false for today", () => {
    expect(isDateKeyBeforeToday(todayKey())).toBe(false);
  });

  it("returns false for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDateKeyBeforeToday(toDateKey(tomorrow))).toBe(false);
  });
});

describe("isDateKeyToday", () => {
  it("returns true for today", () => {
    expect(isDateKeyToday(todayKey())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDateKeyToday(toDateKey(yesterday))).toBe(false);
  });
});

describe("formatHumanDate", () => {
  it("formats as weekday, month day", () => {
    const result = formatHumanDate("2024-01-15");
    expect(result).toBe("Mon, Jan 15");
  });
});

describe("formatShortDate", () => {
  it("formats as month day", () => {
    expect(formatShortDate("2024-03-05")).toBe("Mar 5");
  });
});

describe("formatMatrixDate", () => {
  it("formats as month/day numeric", () => {
    expect(formatMatrixDate("2024-12-25")).toBe("12/25");
  });
});

describe("backupTimestamp", () => {
  it("returns timestamp in expected format", () => {
    const ts = backupTimestamp();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}_\d{4}$/);
  });
});
