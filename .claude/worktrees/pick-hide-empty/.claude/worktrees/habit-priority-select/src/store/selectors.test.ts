import { describe, it, expect } from "vitest";
import {
  selectTimeframes,
  selectCategories,
  selectHabits,
  selectValues,
  selectHabitStatusToday,
  selectValueEntryToday,
  selectTodaySummary,
  selectStreak,
  selectDayCompletion,
} from "@/store/selectors";
import type { StoreState } from "@/store/types";
import { emptyAppData } from "@/lib/schema";
import { toDateKey } from "@/lib/date";
import { buildTimeframe, buildCategory, buildHabit, buildValue } from "@/test/factories";

function stateWith(): StoreState {
  const data = emptyAppData();
  data.habits.push(
    {
      id: "h1",
      categoryId: "c1",
      title: "A",
      details: "",
      imageId: null,
      linkedValueId: null,
      priority: "medium" as const,
      motivation: "",
      scheduledTime: null,
      recurrence: ["everyday"],
      notifications: false,
      order: 0,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: "h2",
      categoryId: "c1",
      title: "B",
      details: "",
      imageId: null,
      linkedValueId: null,
      priority: "medium" as const,
      motivation: "",
      scheduledTime: null,
      recurrence: ["everyday"],
      notifications: false,
      order: 1,
      createdAt: 0,
      updatedAt: 0,
    },
  );
  return { ...data, hydrated: true } as StoreState;
}

describe("selectTimeframes", () => {
  it("returns timeframes sorted by order", () => {
    const state = stateWith();
    state.timeframes = [
      buildTimeframe({ id: "tf-b", order: 2 }),
      buildTimeframe({ id: "tf-a", order: 1 }),
    ];
    const result = selectTimeframes(state);
    expect(result[0]!.id).toBe("tf-a");
    expect(result[1]!.id).toBe("tf-b");
  });

  it("returns empty array when no timeframes", () => {
    const state = stateWith();
    state.timeframes = [];
    expect(selectTimeframes(state)).toHaveLength(0);
  });
});

describe("selectCategories", () => {
  it("filters categories by timeframeId and sorts by order", () => {
    const state = stateWith();
    state.categories = [
      buildCategory({ id: "c1", timeframeId: "tf-1", order: 3 }),
      buildCategory({ id: "c2", timeframeId: "tf-2", order: 1 }),
      buildCategory({ id: "c3", timeframeId: "tf-1", order: 1 }),
    ];
    const result = selectCategories("tf-1")(state);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("c3");
    expect(result[1]!.id).toBe("c1");
  });

  it("returns empty array when no matching categories", () => {
    const state = stateWith();
    state.categories = [];
    expect(selectCategories("tf-x")(state)).toHaveLength(0);
  });
});

describe("selectHabits", () => {
  it("filters habits by categoryId and sorts by order", () => {
    const state = stateWith();
    state.habits = [
      buildHabit({ id: "h-a", categoryId: "c1", order: 2 }),
      buildHabit({ id: "h-b", categoryId: "c1", order: 1 }),
      buildHabit({ id: "h-c", categoryId: "c2", order: 0 }),
    ];
    const result = selectHabits("c1")(state);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("h-b");
  });
});

describe("selectValues", () => {
  it("returns values sorted by order", () => {
    const state = stateWith();
    state.values = [
      buildValue({ id: "v-b", order: 5 }),
      buildValue({ id: "v-a", order: 1 }),
    ];
    const result = selectValues(state);
    expect(result[0]!.id).toBe("v-a");
    expect(result[1]!.id).toBe("v-b");
  });
});

describe("selectHabitStatusToday", () => {
  it("returns status when record exists", () => {
    const state = stateWith();
    state.history[toDateKey(new Date())] = {
      habitStatus: { h1: "done" },
      valueEntries: {},
    };
    expect(selectHabitStatusToday("h1")(state)).toBe("done");
  });

  it("returns undefined when no record for today", () => {
    const state = stateWith();
    expect(selectHabitStatusToday("h1")(state)).toBeUndefined();
  });

  it("returns undefined for untracked habit", () => {
    const state = stateWith();
    state.history[toDateKey(new Date())] = {
      habitStatus: { h1: "done" },
      valueEntries: {},
    };
    expect(selectHabitStatusToday("h-unknown")(state)).toBeUndefined();
  });
});

describe("selectValueEntryToday", () => {
  it("returns numeric entry", () => {
    const state = stateWith();
    state.history[toDateKey(new Date())] = {
      habitStatus: {},
      valueEntries: { v1: { __direct__: 42 } },
    };
    expect(selectValueEntryToday("v1")(state)).toBe(42);
  });

  it("returns string entry", () => {
    const state = stateWith();
    state.values.push({
      id: "v1",
      name: "Note",
      type: "text",
      linkedHabitId: null,
      unit: "",
      goalType: "daily",
      goalTarget: null,
      analyzerEnabled: false,
      order: 0,
      createdAt: 1,
      updatedAt: 1,
    });
    state.history[toDateKey(new Date())] = {
      habitStatus: {},
      valueEntries: { v1: { __direct__: "journal entry" } },
    };
    expect(selectValueEntryToday("v1")(state)).toBe("journal entry");
  });

  it("returns undefined when no record", () => {
    const state = stateWith();
    expect(selectValueEntryToday("v1")(state)).toBeUndefined();
  });
});

describe("selectTodaySummary", () => {
  it("computes completion percentage", () => {
    const state = stateWith();
    state.history[toDateKey(new Date())] = {
      habitStatus: { h1: "done", h2: "missed" },
      valueEntries: {},
    };
    const summary = selectTodaySummary(state);
    expect(summary.done).toBe(1);
    expect(summary.missed).toBe(1);
    expect(summary.total).toBe(2);
    expect(summary.completion).toBe(50);
  });

  it("returns 0 completion when no habits", () => {
    const state = stateWith();
    state.habits = [];
    const summary = selectTodaySummary(state);
    expect(summary.completion).toBe(0);
    expect(summary.total).toBe(0);
  });

  it("returns 100 when all habits done", () => {
    const state = stateWith();
    state.history[toDateKey(new Date())] = {
      habitStatus: { h1: "done", h2: "done" },
      valueEntries: {},
    };
    expect(selectTodaySummary(state).completion).toBe(100);
  });

  it("returns 0 when no history for today", () => {
    const state = stateWith();
    expect(selectTodaySummary(state).completion).toBe(0);
  });
});

describe("selectStreak", () => {
  it("counts consecutive fully completed days", () => {
    const state = stateWith();
    const today = new Date();
    for (let offset = 0; offset < 3; offset++) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      state.history[toDateKey(day)] = {
        habitStatus: { h1: "done", h2: "done" },
        valueEntries: {},
      };
    }
    expect(selectStreak(state)).toBe(3);
  });

  it("returns 0 when no habits", () => {
    const state = stateWith();
    state.habits = [];
    expect(selectStreak(state)).toBe(0);
  });

  it("breaks streak on incomplete day (not today)", () => {
    const state = stateWith();
    const today = new Date();
    // Today: complete
    state.history[toDateKey(today)] = {
      habitStatus: { h1: "done", h2: "done" },
      valueEntries: {},
    };
    // Yesterday: incomplete
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    state.history[toDateKey(yesterday)] = {
      habitStatus: { h1: "done" },
      valueEntries: {},
    };
    expect(selectStreak(state)).toBe(1);
  });

  it("skips today if not completed without breaking", () => {
    const state = stateWith();
    const today = new Date();
    // Today: not complete
    state.history[toDateKey(today)] = {
      habitStatus: { h1: "done" },
      valueEntries: {},
    };
    // Yesterday: complete
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    state.history[toDateKey(yesterday)] = {
      habitStatus: { h1: "done", h2: "done" },
      valueEntries: {},
    };
    expect(selectStreak(state)).toBe(1);
  });
});

describe("selectDayCompletion", () => {
  it("returns 0 for missing record", () => {
    const state = stateWith();
    expect(selectDayCompletion(state, "2024-01-01")).toBe(0);
  });

  it("returns 100 for all done", () => {
    const state = stateWith();
    state.history["2024-01-01"] = {
      habitStatus: { h1: "done", h2: "done" },
      valueEntries: {},
    };
    expect(selectDayCompletion(state, "2024-01-01")).toBe(100);
  });

  it("returns 50 for half done", () => {
    const state = stateWith();
    state.history["2024-01-01"] = {
      habitStatus: { h1: "done", h2: "missed" },
      valueEntries: {},
    };
    expect(selectDayCompletion(state, "2024-01-01")).toBe(50);
  });

  it("returns 0 for empty habitStatus", () => {
    const state = stateWith();
    state.history["2024-01-01"] = { habitStatus: {}, valueEntries: {} };
    expect(selectDayCompletion(state, "2024-01-01")).toBe(0);
  });
});
