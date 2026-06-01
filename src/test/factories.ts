import type { AppData, Habit, Todo, Timeframe, Category, ValueTracker, DayRecord } from "@/lib/schema";
import { emptyAppData } from "@/lib/schema";
import { toDateKey } from "@/lib/date";

let counter = 0;
function seq() {
  return ++counter;
}

export function buildTimeframe(overrides: Partial<Timeframe> = {}): Timeframe {
  const n = seq();
  return { id: `tf-${n}`, name: `Timeframe ${n}`, order: n, ...overrides };
}

export function buildCategory(overrides: Partial<Category> = {}): Category {
  const n = seq();
  return { id: `cat-${n}`, timeframeId: "tf-1", name: `Category ${n}`, order: n, ...overrides };
}

export function buildHabit(overrides: Partial<Habit> = {}): Habit {
  const n = seq();
  return {
    id: `h-${n}`,
    categoryId: "cat-1",
    title: `Habit ${n}`,
    details: "",
    imageId: null,
    linkedValueId: null,
    priority: "medium" as const,
    motivation: "",
    scheduledTime: null,
    recurrence: ["everyday"],
    notifications: false,
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildValue(overrides: Partial<ValueTracker> = {}): ValueTracker {
  const n = seq();
  return {
    id: `v-${n}`,
    name: `Value ${n}`,
    type: "numeric" as const,
    linkedHabitId: null,
    unit: "",
    goalType: null,
    goalTarget: null,
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildTodo(overrides: Partial<Todo> = {}): Todo {
  const n = seq();
  return {
    id: `todo-${n}`,
    title: `Todo ${n}`,
    notes: "",
    date: null,
    priority: "medium" as const,
    time: null,
    location: null,
    completed: false,
    completedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildDayRecord(overrides: Partial<DayRecord> = {}): DayRecord {
  return { habitStatus: {}, valueEntries: {}, ...overrides };
}

export function buildAppData(overrides: Partial<AppData> = {}): AppData {
  return { ...emptyAppData(), ...overrides };
}

export function todayStr(): string {
  return toDateKey(new Date());
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateKey(d);
}

export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

export function resetFactoryCounter() {
  counter = 0;
}
