import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import { selectAppData } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { todayKey } from "@/lib/date";
import { buildHabit, buildTimeframe, buildValue } from "@/test/factories";

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: false });
});

describe("useAppStore", () => {
  describe("hydration", () => {
    it("starts as not hydrated", () => {
      expect(useAppStore.getState().hydrated).toBe(false);
    });

    it("hydrates with provided data", () => {
      const data = emptyAppData();
      data.timeframes.push(buildTimeframe({ id: "tf-1" }));
      useAppStore.getState().hydrate(data);
      expect(useAppStore.getState().hydrated).toBe(true);
      expect(useAppStore.getState().timeframes).toHaveLength(1);
    });
  });

  describe("selectAppData", () => {
    it("excludes hydrated flag", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const appData = selectAppData(useAppStore.getState());
      expect("hydrated" in appData).toBe(false);
    });

    it("includes all data fields", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const appData = selectAppData(useAppStore.getState());
      expect(appData).toHaveProperty("timeframes");
      expect(appData).toHaveProperty("categories");
      expect(appData).toHaveProperty("habits");
      expect(appData).toHaveProperty("values");
      expect(appData).toHaveProperty("todos");
      expect(appData).toHaveProperty("history");
      expect(appData).toHaveProperty("settings");
    });
  });

  describe("habitsSlice", () => {
    it("addTimeframe adds a timeframe", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().addTimeframe("Morning");
      expect(useAppStore.getState().timeframes).toHaveLength(1);
      expect(useAppStore.getState().timeframes[0]!.name).toBe("Morning");
    });

    it("addCategory adds a category to timeframe", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().addTimeframe("Morning");
      const tf = useAppStore.getState().timeframes[0]!;
      useAppStore.getState().addCategory(tf.id, "Health");
      expect(useAppStore.getState().categories).toHaveLength(1);
      expect(useAppStore.getState().categories[0]!.timeframeId).toBe(tf.id);
    });
  });

  describe("todosSlice", () => {
    it("addTodo adds a new todo", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().addTodo({ title: "Buy groceries" });
      const todos = useAppStore.getState().todos;
      expect(todos).toHaveLength(1);
      expect(todos[0]!.title).toBe("Buy groceries");
      expect(todos[0]!.completed).toBe(false);
    });

    it("toggleTodo marks as completed", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().addTodo({ title: "Task" });
      const id = useAppStore.getState().todos[0]!.id;
      useAppStore.getState().toggleTodo(id);
      expect(useAppStore.getState().todos[0]!.completed).toBe(true);
      expect(useAppStore.getState().todos[0]!.completedAt).not.toBeNull();
    });
  });

  describe("settingsSlice", () => {
    it("toggleEditMode flips edit mode", () => {
      useAppStore.getState().hydrate(emptyAppData());
      expect(useAppStore.getState().settings.editMode).toBe(false);
      useAppStore.getState().toggleEditMode();
      expect(useAppStore.getState().settings.editMode).toBe(true);
    });

    it("setTheme updates theme", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().setTheme("dark");
      expect(useAppStore.getState().settings.theme).toBe("dark");
    });
  });

  describe("historySlice", () => {
    it("setHabitStatusToday records status", () => {
      const data = emptyAppData();
      data.habits.push(buildHabit({ id: "h1" }));
      useAppStore.getState().hydrate(data);
      useAppStore.getState().setHabitStatusToday("h1", "done");
      const today = todayKey();
      expect(useAppStore.getState().history[today]?.habitStatus.h1).toBe("done");
    });

    it("setValueEntryToday stores per-habit text entries separately", () => {
      const data = emptyAppData();
      data.habits.push(buildHabit({ id: "h1", title: "habit1" }));
      data.habits.push(buildHabit({ id: "h2", title: "habit2" }));
      data.values.push(buildValue({ id: "v1", type: "text" }));
      useAppStore.getState().hydrate(data);
      useAppStore.getState().setValueEntryToday("v1", "entry1", "h1");
      useAppStore.getState().setValueEntryToday("v1", "entry2", "h2");
      const entries = useAppStore.getState().history[todayKey()]?.valueEntries.v1;
      expect(entries).toEqual({ h1: "entry1", h2: "entry2" });
    });

    it("appends a labeled line to the text override when a new habit logs", () => {
      const data = emptyAppData();
      data.habits.push(buildHabit({ id: "h1", title: "habit1" }));
      data.habits.push(buildHabit({ id: "h2", title: "habit2" }));
      data.values.push(buildValue({ id: "v1", type: "text" }));
      useAppStore.getState().hydrate(data);
      useAppStore.getState().setValueEntryToday("v1", "entry1", "h1");
      useAppStore.getState().setValueEntryToday("v1", "edited text", "__direct__");
      useAppStore.getState().setValueEntryToday("v1", "entry2", "h2");
      const entries = useAppStore.getState().history[todayKey()]?.valueEntries.v1;
      expect(entries?.__direct__).toBe("edited text\nhabit2 : entry2");
      expect(entries?.h2).toBe("entry2");
    });

    it("does not append again when the same habit re-logs", () => {
      const data = emptyAppData();
      data.habits.push(buildHabit({ id: "h1", title: "habit1" }));
      data.values.push(buildValue({ id: "v1", type: "text" }));
      useAppStore.getState().hydrate(data);
      useAppStore.getState().setValueEntryToday("v1", "edited text", "__direct__");
      useAppStore.getState().setValueEntryToday("v1", "entry1", "h1");
      useAppStore.getState().setValueEntryToday("v1", "entry1b", "h1");
      const entries = useAppStore.getState().history[todayKey()]?.valueEntries.v1;
      expect(entries?.__direct__).toBe("edited text\nhabit1 : entry1");
      expect(entries?.h1).toBe("entry1b");
    });

    it("does not append for numeric trackers", () => {
      const data = emptyAppData();
      data.habits.push(buildHabit({ id: "h1", title: "habit1" }));
      data.values.push(buildValue({ id: "v1", type: "numeric" }));
      useAppStore.getState().hydrate(data);
      useAppStore.getState().setValueEntryToday("v1", 5, "__direct__");
      useAppStore.getState().setValueEntryToday("v1", 3, "h1");
      const entries = useAppStore.getState().history[todayKey()]?.valueEntries.v1;
      expect(entries).toEqual({ __direct__: 5, h1: 3 });
    });
  });

  describe("systemSlice", () => {
    it("replaceAllData replaces entire state", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const newData = emptyAppData();
      newData.timeframes.push(buildTimeframe({ id: "replaced" }));
      useAppStore.getState().replaceAllData(newData);
      expect(useAppStore.getState().timeframes[0]!.id).toBe("replaced");
    });
  });

  describe("fieldsSlice", () => {
    it("addField adds a field and returns its id", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const id = useAppStore.getState().addField("protein");
      const fields = useAppStore.getState().fields;
      expect(fields).toHaveLength(1);
      expect(fields[0]!.id).toBe(id);
      expect(fields[0]!.name).toBe("protein");
    });

    it("renameField updates the name", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const id = useAppStore.getState().addField("protien");
      useAppStore.getState().renameField(id, "protein");
      expect(useAppStore.getState().fields[0]!.name).toBe("protein");
    });

    it("deleteField removes it and strips it from entities", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const fieldId = useAppStore.getState().addField("protein");
      const entityId = useAppStore.getState().addEntity("fish");
      useAppStore.getState().toggleEntityField(entityId, fieldId);
      expect(useAppStore.getState().entities[0]!.fieldIds).toContain(fieldId);
      useAppStore.getState().deleteField(fieldId);
      expect(useAppStore.getState().fields).toHaveLength(0);
      expect(useAppStore.getState().entities[0]!.fieldIds).not.toContain(fieldId);
    });
  });

  describe("entitiesSlice", () => {
    it("addEntity adds an entity with no fields", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const id = useAppStore.getState().addEntity("fish");
      const entities = useAppStore.getState().entities;
      expect(entities).toHaveLength(1);
      expect(entities[0]!.id).toBe(id);
      expect(entities[0]!.fieldIds).toEqual([]);
    });

    it("toggleEntityField adds then removes a field", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const fieldId = useAppStore.getState().addField("protein");
      const entityId = useAppStore.getState().addEntity("fish");
      useAppStore.getState().toggleEntityField(entityId, fieldId);
      expect(useAppStore.getState().entities[0]!.fieldIds).toEqual([fieldId]);
      useAppStore.getState().toggleEntityField(entityId, fieldId);
      expect(useAppStore.getState().entities[0]!.fieldIds).toEqual([]);
    });

    it("deleteEntity removes the entity", () => {
      useAppStore.getState().hydrate(emptyAppData());
      const id = useAppStore.getState().addEntity("fish");
      useAppStore.getState().deleteEntity(id);
      expect(useAppStore.getState().entities).toHaveLength(0);
    });
  });
});
