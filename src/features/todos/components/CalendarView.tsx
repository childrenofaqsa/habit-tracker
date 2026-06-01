import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { selectTodosByDate } from "@/store/todoSelectors";
import { TodoCard } from "./TodoCard";

type CalendarViewProps = {
  onClose: () => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ onClose }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const todos = useAppStore((s) => s.todos);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const selectedDateKey = format(selectedDay, "yyyy-MM-dd");
  const todosForDay = selectTodosByDate(todos, selectedDateKey);

  function hasTodos(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    return todos.some((t) => t.date === key && !t.completed);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">
              {format(currentMonth, "MMMM")}
            </h3>
            <span className="text-sm text-muted-foreground">
              {format(currentMonth, "yyyy")}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-1 text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const hasTodo = hasTodos(day);
            const isPast = isBefore(day, new Date()) && !isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday(day) && !isSelected && "ring-2 ring-primary",
                  !isSelected && "hover:bg-muted",
                )}
              >
                {format(day, "d")}
                {hasTodo && !isSelected && (
                  <span className="absolute bottom-0.5 size-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Planned Tasks</h3>
            <p className="text-sm text-muted-foreground">
              {format(selectedDay, "EEEE, MMM d")}
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-primary"
          >
            <Plus className="mr-1 inline size-4" />
            Add New Event
          </button>
        </div>

        {todosForDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks planned.</p>
        ) : (
          <div className="space-y-2">
            {todosForDay.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
