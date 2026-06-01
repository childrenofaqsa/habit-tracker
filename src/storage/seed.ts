import { DEFAULT_TIMEFRAMES, SCHEMA_VERSION } from "@/lib/constants";
import { appDataSchema, type AppData } from "@/lib/schema";
import { newId } from "@/lib/id";
import { format, subDays } from "date-fns";

function generateHistory(habitIds: string[], days: number) {
  const history: Record<string, { habitStatus: Record<string, "done" | "missed">; valueEntries: Record<string, number | string> }> = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const dateKey = format(subDays(today, i), "yyyy-MM-dd");
    const habitStatus: Record<string, "done" | "missed"> = {};

    for (const id of habitIds) {
      const chance = Math.random();
      if (chance < 0.7) habitStatus[id] = "done";
      else if (chance < 0.85) habitStatus[id] = "missed";
    }

    history[dateKey] = { habitStatus, valueEntries: {} };
  }

  return history;
}

export function createSeedData(): AppData {
  const now = Date.now();
  const timeframes = DEFAULT_TIMEFRAMES.map((name, index) => ({
    id: newId(),
    name,
    order: index,
  }));

  const morning = timeframes[0]!;
  const evening = timeframes[1]!;
  const night = timeframes[2]!;

  const healthCatId = newId();
  const mindCatId = newId();
  const productivityCatId = newId();
  const selfCareCatId = newId();

  const categories = [
    { id: healthCatId, timeframeId: morning.id, name: "Health", order: 0 },
    { id: mindCatId, timeframeId: morning.id, name: "Mind", order: 1 },
    { id: productivityCatId, timeframeId: evening.id, name: "Productivity", order: 0 },
    { id: selfCareCatId, timeframeId: night.id, name: "Self-Care", order: 0 },
  ];

  const habits = [
    { id: newId(), categoryId: healthCatId, title: "Morning Run", priority: "high" as const, motivation: "Stay fit and energized", scheduledTime: "07:00 AM", recurrence: ["everyday"], notifications: true },
    { id: newId(), categoryId: healthCatId, title: "Drink Water", priority: "medium" as const, motivation: "Stay hydrated throughout the day", scheduledTime: "07:30 AM", recurrence: ["everyday"], notifications: false },
    { id: newId(), categoryId: healthCatId, title: "Healthy Breakfast", priority: "medium" as const, motivation: "Fuel body with nutrition", scheduledTime: "08:00 AM", recurrence: ["everyday"], notifications: false },
    { id: newId(), categoryId: mindCatId, title: "Meditation", priority: "high" as const, motivation: "Clarity and inner peace", scheduledTime: "06:30 AM", recurrence: ["everyday"], notifications: true },
    { id: newId(), categoryId: mindCatId, title: "Read 20 Pages", priority: "medium" as const, motivation: "Expand knowledge daily", scheduledTime: "08:30 AM", recurrence: ["everyday"], notifications: false },
    { id: newId(), categoryId: mindCatId, title: "Journaling", priority: "low" as const, motivation: "Process thoughts and feelings", scheduledTime: "09:00 AM", recurrence: ["mon", "wed", "fri"], notifications: false },
    { id: newId(), categoryId: productivityCatId, title: "Deep Work Block", priority: "high" as const, motivation: "Move projects forward", scheduledTime: "10:00 AM", recurrence: ["mon", "tue", "wed", "thu", "fri"], notifications: true },
    { id: newId(), categoryId: productivityCatId, title: "Code Review", priority: "medium" as const, motivation: "Maintain code quality", scheduledTime: "02:00 PM", recurrence: ["mon", "tue", "wed", "thu", "fri"], notifications: false },
    { id: newId(), categoryId: selfCareCatId, title: "Skincare Routine", priority: "low" as const, motivation: "Take care of yourself", scheduledTime: "09:30 PM", recurrence: ["everyday"], notifications: false },
    { id: newId(), categoryId: selfCareCatId, title: "Sleep by 11 PM", priority: "high" as const, motivation: "Quality rest for recovery", scheduledTime: "11:00 PM", recurrence: ["everyday"], notifications: true },
  ].map((h, index) => ({
    ...h,
    details: "",
    imageId: null,
    linkedValueId: null,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const yesterdayKey = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const tomorrowKey = format(subDays(new Date(), -1), "yyyy-MM-dd");

  const todos = [
    { id: newId(), title: "Review project proposal", notes: "", date: yesterdayKey, priority: "high" as const, time: "10:00 AM", location: null, completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Schedule dentist appointment", notes: "", date: yesterdayKey, priority: "medium" as const, time: null, location: null, completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Buy groceries for the week", notes: "", date: todayKey, priority: "medium" as const, time: "06:00 PM", location: "Supermarket", completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Prepare meeting presentation", notes: "", date: todayKey, priority: "high" as const, time: "09:00 AM", location: "Office", completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Call plumber for leak", notes: "", date: todayKey, priority: "low" as const, time: null, location: null, completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Submit expense report", notes: "", date: tomorrowKey, priority: "medium" as const, time: "02:00 PM", location: null, completed: false, completedAt: null, createdAt: now, updatedAt: now },
    { id: newId(), title: "Plan weekend trip", notes: "", date: tomorrowKey, priority: "low" as const, time: null, location: null, completed: false, completedAt: null, createdAt: now, updatedAt: now },
  ];

  const values = [
    { id: newId(), name: "Water Intake", type: "numeric" as const, linkedHabitId: null, unit: "ml", goalType: "daily" as const, goalTarget: 2000, order: 0, createdAt: now, updatedAt: now },
    { id: newId(), name: "Pages Read", type: "numeric" as const, linkedHabitId: null, unit: "pages", goalType: "daily" as const, goalTarget: 20, order: 1, createdAt: now, updatedAt: now },
    { id: newId(), name: "Coffee Cups", type: "numeric" as const, linkedHabitId: null, unit: "cups", goalType: "daily" as const, goalTarget: 3, order: 2, createdAt: now, updatedAt: now },
  ];

  const history = generateHistory(habits.map((h) => h.id), 30);

  return appDataSchema.parse({
    version: SCHEMA_VERSION,
    timeframes,
    categories,
    habits,
    values,
    todos,
    history,
  });
}
