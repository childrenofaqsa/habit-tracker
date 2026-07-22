import type {
  AppData,
  Habit,
  Todo,
  Timeframe,
  Category,
  ValueTracker,
  Field,
  Entity,
  Project,
  TodoList,
  DayRecord,
} from "@/lib/schema";
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
    analyzerEnabled: false,
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildField(overrides: Partial<Field> = {}): Field {
  const n = seq();
  return {
    id: `field-${n}`,
    name: `Field ${n}`,
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildEntity(overrides: Partial<Entity> = {}): Entity {
  const n = seq();
  return {
    id: `entity-${n}`,
    name: `Entity ${n}`,
    fieldIds: [],
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
    priority: null,
    tag: "",
    time: null,
    location: null,
    completed: false,
    completedAt: null,
    order: n,
    projectId: null,
    listId: null,
    status: "todo" as const,
    plan: "",
    goalCurrent: 0,
    goalTarget: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildProject(overrides: Partial<Project> = {}): Project {
  const n = seq();
  return {
    id: `proj-${n}`,
    name: `Project ${n}`,
    description: "",
    deadlineDate: null,
    deadlineTime: null,
    priority: null,
    breadcrumb: [],
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildTodoList(overrides: Partial<TodoList> = {}): TodoList {
  const n = seq();
  return {
    id: `list-${n}`,
    name: `List ${n}`,
    order: n,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function buildDayRecord(overrides: Partial<DayRecord> = {}): DayRecord {
  return { habitStatus: {}, valueEntries: {}, pickedHabitIds: [], ...overrides };
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
