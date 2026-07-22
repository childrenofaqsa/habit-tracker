import { describe, expect, it } from "vitest";
import {
  aggregateValueEntries,
  mergeTextEntries,
  textEntryRows,
  DIRECT_KEY,
} from "@/lib/aggregate";

const names = { h1: "habit1", h2: "habit2" };

describe("aggregateValueEntries (numeric)", () => {
  it("sums per-habit contributions and direct adjustment", () => {
    expect(aggregateValueEntries({ h3: 2, h4: 4, [DIRECT_KEY]: 4 }, "numeric")).toBe(10);
  });

  it("returns undefined for empty entries", () => {
    expect(aggregateValueEntries({}, "numeric")).toBeUndefined();
    expect(aggregateValueEntries(undefined, "numeric")).toBeUndefined();
  });
});

describe("mergeTextEntries", () => {
  it("labels each habit entry and joins with newlines", () => {
    expect(mergeTextEntries({ h1: "entry1", h2: "entry2" }, names)).toBe(
      "habit1 : entry1\nhabit2 : entry2",
    );
  });

  it("returns the direct override when present", () => {
    expect(
      mergeTextEntries({ h1: "entry1", [DIRECT_KEY]: "edited text" }, names),
    ).toBe("edited text");
  });

  it("falls back to merge when override is blank", () => {
    expect(mergeTextEntries({ h1: "entry1", [DIRECT_KEY]: "   " }, names)).toBe(
      "habit1 : entry1",
    );
  });

  it("falls back to the key when the habit name is unknown", () => {
    expect(mergeTextEntries({ unknown: "x" }, names)).toBe("unknown : x");
  });

  it("skips empty entries and returns undefined when none remain", () => {
    expect(mergeTextEntries({ h1: "" }, names)).toBeUndefined();
    expect(mergeTextEntries(undefined, names)).toBeUndefined();
  });
});

describe("textEntryRows", () => {
  it("returns one labeled row per non-empty habit entry, excluding the override", () => {
    expect(
      textEntryRows({ h1: "entry1", h2: "entry2", [DIRECT_KEY]: "edited" }, names),
    ).toEqual([
      { key: "h1", label: "habit1", text: "entry1" },
      { key: "h2", label: "habit2", text: "entry2" },
    ]);
  });
});
