import { useMemo, useState } from "react";
import {
  ListTodo,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore, type TodoSortMode } from "@/store/useUiStore";
import {
  buildTodoBuckets,
  buildDateGroupedTodos,
} from "@/store/todoSelectors";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/common/components/EmptyState";
import { DateScrollRow } from "@/common/components/DateScrollRow";
import { TodoCard } from "@/features/todos/components/TodoCard";
import { CalendarView } from "@/features/todos/components/CalendarView";
import { EditTodoPage } from "@/features/todos/components/EditTodoPage";
import { FloatingActionButton } from "@/common/components/FloatingActionButton";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";

type ViewMode = "today" | "all" | "calendar";

const SORT_LABELS: Record<TodoSortMode, string> = {
  manual: "Manual",
  time: "Time",
  priority: "Priority",
  createdAt: "Created",
};

export function TodoView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const todos = useAppStore((state) => state.todos);
  const reorderTodos = useAppStore((state) => state.reorderTodos);
  const searchQuery = useUiStore((state) => state.searchQuery);
  const todoSort = useUiStore((state) => state.todoSort);
  const setTodoSort = useUiStore((state) => state.setTodoSort);
  const hideCompleted = useUiStore((state) => state.todoHideCompleted);
  const setHideCompleted = useUiStore((state) => state.setTodoHideCompleted);
  const editingTodoId = useUiStore((state) => state.editingTodoId);
  const setEditingTodoId = useUiStore((state) => state.setEditingTodoId);

  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = todos;
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tag.toLowerCase().includes(q) ||
          (t.location ?? "").toLowerCase().includes(q),
      );
    }
    if (hideCompleted) result = result.filter((t) => !t.completed);
    return result;
  }, [todos, searchQuery, hideCompleted]);

  if (editingTodoId) {
    const editing =
      editingTodoId === "new"
        ? null
        : todos.find((t) => t.id === editingTodoId) ?? null;
    return <EditTodoPage todo={editing} />;
  }

  const buckets = buildTodoBuckets(filteredTodos, todoSort);
  const dateGroups = buildDateGroupedTodos(filteredTodos, todoSort);

  if (viewMode === "calendar") {
    return (
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">To Do</h2>
          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </header>
        <CalendarView onClose={() => setViewMode("today")} />
        <FloatingActionButton onClick={() => setEditingTodoId("new")} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {viewMode === "all" ? "All Tasks" : "To Do"}
        </h2>
        <div className="flex items-center gap-2">
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <CalendarIcon className="size-5" />
          </button>
        </div>
      </header>

      <DateScrollRow selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="flex items-center justify-between gap-2">
        <SortDropdown value={todoSort} onChange={setTodoSort} />
        <button
          type="button"
          onClick={() => setHideCompleted(!hideCompleted)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {hideCompleted ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {hideCompleted ? "Hidden" : "Visible"}
        </button>
      </div>

      {todos.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Nothing to do"
          description="Tap the + button to add a task."
        />
      ) : filteredTodos.length === 0 && searchQuery.trim() ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks found"
          description={`No tasks match "${searchQuery.trim()}".`}
        />
      ) : viewMode === "today" ? (
        <TodayView
          buckets={buckets}
          sortMode={todoSort}
          onReorder={reorderTodos}
        />
      ) : (
        <AllTasksView
          groups={dateGroups}
          sortMode={todoSort}
          onReorder={reorderTodos}
        />
      )}

      <FloatingActionButton onClick={() => setEditingTodoId("new")} />
    </div>
  );
}

function ViewModeToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-muted/50">
      <button
        type="button"
        onClick={() => onChange("today")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
          viewMode === "today"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
          viewMode === "all"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: TodoSortMode;
  onChange: (m: TodoSortMode) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
      <ArrowUpDown className="size-4" />
      <span>Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TodoSortMode)}
        className="bg-transparent text-foreground focus:outline-none"
      >
        {(Object.keys(SORT_LABELS) as TodoSortMode[]).map((mode) => (
          <option key={mode} value={mode}>
            {SORT_LABELS[mode]}
          </option>
        ))}
      </select>
    </label>
  );
}

function TodoList({
  todos,
  sortMode,
  onReorder,
}: {
  todos: import("@/lib/schema").Todo[];
  sortMode: TodoSortMode;
  onReorder: (ids: string[]) => void;
}) {
  if (sortMode === "manual") {
    const ids = todos.map((t) => t.id);
    return (
      <DndList
        ids={ids}
        strategy={verticalListSortingStrategy}
        onReorder={onReorder}
      >
        <div className="space-y-2">
          {todos.map((todo) => (
            <Sortable key={todo.id} id={todo.id}>
              {({ attributes, listeners }) => (
                <TodoCard
                  todo={todo}
                  showDragHandle
                  dragHandle={
                    <span
                      {...attributes}
                      {...listeners}
                      className="cursor-grab touch-none text-muted-foreground/50 active:cursor-grabbing"
                    >
                      <GripVertical className="size-4" />
                    </span>
                  }
                />
              )}
            </Sortable>
          ))}
        </div>
      </DndList>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

function TodayView({
  buckets,
  sortMode,
  onReorder,
}: {
  buckets: ReturnType<typeof buildTodoBuckets>;
  sortMode: TodoSortMode;
  onReorder: (ids: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      {buckets.todayOverdue.length > 0 && (
        <TodoSection label="Overdue / Today" labelColor="text-red-500">
          <TodoList
            todos={buckets.todayOverdue}
            sortMode={sortMode}
            onReorder={onReorder}
          />
        </TodoSection>
      )}
      {buckets.scheduled.length > 0 && (
        <TodoSection label="Scheduled">
          <TodoList
            todos={buckets.scheduled}
            sortMode={sortMode}
            onReorder={onReorder}
          />
        </TodoSection>
      )}
      {buckets.completed.length > 0 &&
        !buckets.todayOverdue.length &&
        !buckets.scheduled.length && (
          <TodoSection label="Completed">
            <div className="space-y-2">
              {buckets.completed.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          </TodoSection>
        )}
    </div>
  );
}

function AllTasksView({
  groups,
  sortMode,
  onReorder,
}: {
  groups: ReturnType<typeof buildDateGroupedTodos>;
  sortMode: TodoSortMode;
  onReorder: (ids: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <TodoSection
          key={group.date}
          label={group.label}
          labelColor={group.isOverdue ? "text-red-500" : undefined}
        >
          <TodoList
            todos={group.todos}
            sortMode={sortMode}
            onReorder={onReorder}
          />
        </TodoSection>
      ))}
    </div>
  );
}

function TodoSection({
  label,
  labelColor,
  children,
}: {
  label: string;
  labelColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h3
          className={cn(
            "text-sm font-bold uppercase",
            labelColor ?? "text-foreground",
          )}
        >
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}
