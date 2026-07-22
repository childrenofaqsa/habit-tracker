import { z } from "zod";
import { SCHEMA_VERSION } from "./constants";

export const habitStatusSchema = z.enum(["done", "missed"]);
export type HabitStatus = z.infer<typeof habitStatusSchema>;

export const valueTypeSchema = z.enum(["numeric", "text"]);
export type ValueType = z.infer<typeof valueTypeSchema>;

export const timeframeSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});

export const categorySchema = z.object({
  id: z.string(),
  timeframeId: z.string(),
  name: z.string(),
  order: z.number(),
});

export const prioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof prioritySchema>;

export const habitSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  title: z.string(),
  details: z.string().default(""),
  imageId: z.string().nullable().default(null),
  linkedValueId: z.string().nullable().default(null),
  priority: prioritySchema.default("medium"),
  motivation: z.string().default(""),
  scheduledTime: z.string().nullable().default(null),
  recurrence: z.array(z.string()).default(["everyday"]),
  notifications: z.boolean().default(false),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const goalTypeSchema = z.enum(["daily", "weekly", "monthly"]);
export type GoalType = z.infer<typeof goalTypeSchema>;

export const valueTrackerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: valueTypeSchema,
  linkedHabitId: z.string().nullable().default(null),
  unit: z.string().default(""),
  goalType: goalTypeSchema.nullable().default(null),
  goalTarget: z.number().nullable().default(null),
  analyzerEnabled: z.boolean().default(false),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const fieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const entitySchema = z.object({
  id: z.string(),
  name: z.string(),
  fieldIds: z.array(z.string()).default([]),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const todoStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
export type TodoStatus = z.infer<typeof todoStatusSchema>;

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string().default(""),
  date: z.string().nullable().default(null),
  priority: prioritySchema.nullable().default(null),
  tag: z.string().default(""),
  time: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  completed: z.boolean().default(false),
  completedAt: z.number().nullable().default(null),
  order: z.number().default(0),
  projectId: z.string().nullable().default(null),
  listId: z.string().nullable().default(null),
  status: todoStatusSchema.default("todo"),
  plan: z.string().default(""),
  goalCurrent: z.number().default(0),
  goalTarget: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  deadlineDate: z.string().nullable().default(null),
  deadlineTime: z.string().nullable().default(null),
  priority: prioritySchema.nullable().default(null),
  breadcrumb: z.array(z.string()).default([]),
  order: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const todoListSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const dayRecordSchema = z.object({
  habitStatus: z.record(z.string(), habitStatusSchema).default({}),
  habitStatusTimes: z.record(z.string(), z.string()).optional(),
  valueEntries: z
    .record(z.string(), z.record(z.string(), z.union([z.number(), z.string()])))
    .default({}),
  pickedHabitIds: z.array(z.string()).optional(),
});

export const motionSettingsSchema = z.object({
  intensity: z.enum(["minimal", "standard", "playful"]).default("standard"),
  scrollAnimations: z.boolean().default(true),
  parallax: z.boolean().default(true),
  cursorEffects: z.boolean().default(true),
  haptics: z.boolean().default(true),
  sound: z.boolean().default(false),
  confetti: z.boolean().default(true),
  respectReducedMotion: z.boolean().default(true),
});

export const settingsSchema = z.object({
  editMode: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  installedAt: z.number().nullable().default(null),
  deviceLabel: z.string().default("My Device"),
  motion: motionSettingsSchema.default(motionSettingsSchema.parse({})),
  /**
   * How long (in seconds) a just-ticked/crossed habit lingers on My Day —
   * shown in its performed (done/missed) state — before the completed/discarded
   * filters are allowed to hide it. 0 filters immediately (old behavior).
   */
  myDayLingerSeconds: z.number().min(0).default(30),
});

export const appDataSchema = z.object({
  version: z.number().default(SCHEMA_VERSION),
  timeframes: z.array(timeframeSchema).default([]),
  categories: z.array(categorySchema).default([]),
  habits: z.array(habitSchema).default([]),
  values: z.array(valueTrackerSchema).default([]),
  fields: z.array(fieldSchema).default([]),
  entities: z.array(entitySchema).default([]),
  todos: z.array(todoSchema).default([]),
  projects: z.array(projectSchema).default([]),
  todoLists: z.array(todoListSchema).default([]),
  history: z.record(z.string(), dayRecordSchema).default({}),
  settings: settingsSchema.default(settingsSchema.parse({})),
});

export type Timeframe = z.infer<typeof timeframeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Habit = z.infer<typeof habitSchema>;
export type ValueTracker = z.infer<typeof valueTrackerSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Todo = z.infer<typeof todoSchema>;
export type Project = z.infer<typeof projectSchema>;
export type TodoList = z.infer<typeof todoListSchema>;
export type DayRecord = z.infer<typeof dayRecordSchema>;
export type MotionSettings = z.infer<typeof motionSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type AppData = z.infer<typeof appDataSchema>;

export function emptyAppData(): AppData {
  return appDataSchema.parse({});
}
