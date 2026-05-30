import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import { selectAppData } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { buildHabit, buildTimeframe } from "@/test/factories";

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
      useAppStore.getState().addTodo("Buy groceries", null);
      const todos = useAppStore.getState().todos;
      expect(todos).toHaveLength(1);
      expect(todos[0]!.title).toBe("Buy groceries");
      expect(todos[0]!.completed).toBe(false);
    });

    it("toggleTodo marks as completed", () => {
      useAppStore.getState().hydrate(emptyAppData());
      useAppStore.getState().addTodo("Task", null);
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
      const today = new Date().toISOString().slice(0, 10);
      expect(useAppStore.getState().history[today]?.habitStatus.h1).toBe("done");
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
});
