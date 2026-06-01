import { useState } from "react";
import { ListTodo, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { buildTodoBuckets, buildDateGroupedTodos } from "@/store/todoSelectors";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/common/components/EmptyState";
import { DateScrollRow } from "@/common/components/DateScrollRow";
import { AddTodo } from "@/features/todos/components/AddTodo";
import { TodoCard } from "@/features/todos/components/TodoCard";
import { CalendarView } from "@/features/todos/components/CalendarView";
import { FloatingActionButton } from "@/common/components/FloatingActionButton";

type ViewMode = "today" | "all" | "calendar";

export function TodoView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [showAddTodo, setShowAddTodo] = useState(false);
  const todos = useAppStore((state) => state.todos);
  const buckets = buildTodoBuckets(todos);
  const dateGroups = buildDateGroupedTodos(todos);

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

      {showAddTodo && (
        <AddTodo
          defaultDate={selectedDate !== todayKey() ? selectedDate : null}
        />
      )}

      {todos.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Nothing to do"
          description="Add one-time tasks. Assign a date or leave them in your inbox."
        />
      ) : viewMode === "today" ? (
        <TodayView buckets={buckets} />
      ) : (
        <AllTasksView groups={dateGroups} />
      )}

      <FloatingActionButton onClick={() => setShowAddTodo((p) => !p)} />
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

function TodayView({ buckets }: { buckets: ReturnType<typeof buildTodoBuckets> }) {
  return (
    <div className="space-y-6">
      {buckets.todayOverdue.length > 0 && (
        <TodoSection
          label="Overdue"
          labelColor="text-red-500"
          todos={buckets.todayOverdue}
        />
      )}
      {buckets.todayOverdue.length > 0 || buckets.inbox.length > 0 ? (
        <TodoSection label="Today" todos={buckets.todayOverdue.length > 0 ? [] : buckets.inbox} />
      ) : null}
      {buckets.scheduled.length > 0 && (
        <TodoSection label="Scheduled" todos={buckets.scheduled} />
      )}
      {buckets.inbox.length > 0 && (
        <TodoSection label="Inbox" todos={buckets.inbox} />
      )}
    </div>
  );
}

function AllTasksView({
  groups,
}: {
  groups: ReturnType<typeof buildDateGroupedTodos>;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <TodoSection
          key={group.date}
          label={group.label}
          sublabel={group.date !== "inbox" ? format(new Date(group.date), "EEE, MMM d, yyyy") : undefined}
          labelColor={group.isOverdue ? "text-red-500" : undefined}
          todos={group.todos}
        />
      ))}
    </div>
  );
}

function TodoSection({
  label,
  sublabel,
  labelColor,
  todos,
}: {
  label: string;
  sublabel?: string;
  labelColor?: string;
  todos: import("@/lib/schema").Todo[];
}) {
  if (todos.length === 0 && label !== "Today") return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h3 className={cn("text-sm font-bold uppercase", labelColor ?? "text-foreground")}>
          {label}
        </h3>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}
