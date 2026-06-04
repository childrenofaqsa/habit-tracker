import type { StateCreator } from "zustand";
import type {
  AppData,
  HabitStatus,
  Habit,
  ValueTracker,
  ValueType,
  Todo,
  TodoStatus,
  Project,
  MotionSettings,
  Settings,
} from "@/lib/schema";

export type AppDataState = AppData & { hydrated: boolean };

export type HistoryActions = {
  setHabitStatusToday: (habitId: string, status: HabitStatus | null) => void;
  cycleHabitDone: (habitId: string) => void;
  cycleHabitMissed: (habitId: string) => void;
  setValueEntryToday: (valueId: string, value: number | string | null, habitId?: string) => void;
  setValueEntry: (valueId: string, dateKey: string, value: number | string | null, habitId?: string) => void;
};

export type HabitsActions = {
  addTimeframe: (name: string) => string;
  renameTimeframe: (id: string, name: string) => void;
  deleteTimeframe: (id: string) => void;
  reorderTimeframes: (orderedIds: string[]) => void;
  addCategory: (timeframeId: string, name: string) => string;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (timeframeId: string, orderedIds: string[]) => void;
  moveCategoryToTimeframe: (categoryId: string, timeframeId: string) => void;
  addHabit: (categoryId: string, title: string) => string;
  updateHabit: (
    id: string,
    patch: Partial<Pick<Habit, "title" | "details" | "categoryId" | "imageId" | "linkedValueId" | "priority" | "motivation" | "scheduledTime" | "recurrence" | "notifications">>,
  ) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (categoryId: string, orderedIds: string[]) => void;
};

export type ValuesActions = {
  addValue: (name: string, type: ValueType) => string;
  updateValue: (
    id: string,
    patch: Partial<Pick<ValueTracker, "name" | "linkedHabitId" | "unit" | "goalType" | "goalTarget" | "type">>,
  ) => void;
  deleteValue: (id: string) => void;
  reorderValues: (orderedIds: string[]) => void;
  linkHabitToValue: (habitId: string, valueId: string | null) => void;
};

export type AddTodoInput = {
  title: string;
  date?: string | null;
  tag?: string;
  priority?: Todo["priority"];
  time?: string | null;
  location?: string | null;
  notes?: string;
  projectId?: string | null;
  listId?: string | null;
  status?: TodoStatus;
  plan?: string;
  goalCurrent?: number;
  goalTarget?: number;
};

export type TodosActions = {
  addTodo: (input: AddTodoInput) => string;
  updateTodo: (
    id: string,
    patch: Partial<Pick<Todo, "title" | "notes" | "date" | "priority" | "tag" | "time" | "location" | "projectId" | "listId" | "status" | "plan" | "goalCurrent" | "goalTarget">>,
  ) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;
};

export type AddProjectInput = {
  name: string;
  description?: string;
  deadlineDate?: string | null;
  deadlineTime?: string | null;
  priority?: Project["priority"];
  breadcrumb?: string[];
};

export type ProjectsActions = {
  addProject: (input: AddProjectInput) => string;
  updateProject: (
    id: string,
    patch: Partial<Pick<Project, "name" | "description" | "deadlineDate" | "deadlineTime" | "priority" | "breadcrumb">>,
  ) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (orderedIds: string[]) => void;
};

export type TodoListsActions = {
  addTodoList: (name: string) => string;
  renameTodoList: (id: string, name: string) => void;
  deleteTodoList: (id: string) => void;
  reorderTodoLists: (orderedIds: string[]) => void;
};

export type SettingsActions = {
  setEditMode: (value: boolean) => void;
  toggleEditMode: () => void;
  setTheme: (theme: Settings["theme"]) => void;
  updateMotion: (patch: Partial<MotionSettings>) => void;
  setInstalledAt: (timestamp: number) => void;
  setDeviceLabel: (label: string) => void;
};

export type SystemActions = {
  hydrate: (data: AppData) => void;
  replaceAllData: (data: AppData) => void;
  mergeData: (incoming: AppData) => void;
};

export type StoreState = AppDataState &
  HistoryActions &
  HabitsActions &
  ValuesActions &
  TodosActions &
  ProjectsActions &
  TodoListsActions &
  SettingsActions &
  SystemActions;

export type AppSlice<T> = StateCreator<StoreState, [["zustand/immer", never]], [], T>;
