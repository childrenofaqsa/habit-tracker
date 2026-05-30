import { DEFAULT_TIMEFRAMES, SCHEMA_VERSION } from "@/lib/constants";
import { appDataSchema, type AppData } from "@/lib/schema";
import { newId } from "@/lib/id";

export function createSeedData(): AppData {
  const now = Date.now();
  const timeframes = DEFAULT_TIMEFRAMES.map((name, index) => ({
    id: newId(),
    name,
    order: index,
  }));

  const morning = timeframes[0]!;
  const categoryId = newId();
  const sampleHabits = ["Hydrate", "Stretch", "Read"].map((title, index) => ({
    id: newId(),
    categoryId,
    title,
    details: "",
    imageId: null,
    linkedValueId: null,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));

  return appDataSchema.parse({
    version: SCHEMA_VERSION,
    timeframes,
    categories: [{ id: categoryId, timeframeId: morning.id, name: "Wellness", order: 0 }],
    habits: sampleHabits,
    values: [
      {
        id: newId(),
        name: "Glasses of Water",
        type: "numeric",
        linkedHabitId: null,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    todos: [],
    history: {},
  });
}
