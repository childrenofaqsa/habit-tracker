import { useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Check, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatShortDate, toDateKey, isDateKeyBeforeToday } from "@/lib/date";
import type { Todo } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useHaptics } from "@/common/hooks/useHaptics";
import { Input } from "@/common/components/ui/form/input";
import { Badge } from "@/common/components/ui/data/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/overlay/popover";
import { Calendar } from "@/common/components/ui/form/calendar";

export function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useAppStore((state) => state.toggleTodo);
  const deleteTodo = useAppStore((state) => state.deleteTodo);
  const updateTodo = useAppStore((state) => state.updateTodo);
  const haptic = useHaptics();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const x = useMotionValue(0);
  const underlay = useTransform(
    x,
    [-110, 0, 110],
    ["var(--color-destructive)", "var(--color-card)", "var(--color-success)"],
  );

  const overdue = !todo.completed && todo.date !== null && isDateKeyBeforeToday(todo.date);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <motion.div
        style={{ backgroundColor: underlay }}
        className="absolute inset-0 flex items-center justify-between px-4 text-white"
      >
        <Check className="size-5" />
        <Trash2 className="size-5" />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        dragMomentum={false}
        onDragEnd={(_event, info) => {
          if (info.offset.x > 100) {
            haptic("success");
            toggleTodo(todo.id);
          } else if (info.offset.x < -100) {
            haptic("warning");
            deleteTodo(todo.id);
          }
        }}
        style={{ x }}
        className="relative flex touch-pan-y items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
      >
        <button
          type="button"
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
          onClick={() => toggleTodo(todo.id)}
          className={cn(
            "grid size-6 shrink-0 touch-target place-items-center rounded-full border-2 transition-colors",
            todo.completed
              ? "border-success bg-success text-success-foreground"
              : "border-muted-foreground/40",
          )}
        >
          {todo.completed && <Check className="size-4" />}
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <Input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                updateTodo(todo.id, { title: draft.trim() || todo.title });
                setEditing(false);
              }}
              className="h-8"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(todo.title);
                setEditing(true);
              }}
              className={cn(
                "block w-full truncate text-left text-sm",
                todo.completed && "text-muted-foreground line-through",
              )}
            >
              {todo.title}
            </button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="shrink-0"
              aria-label="Change date"
            >
              {todo.date ? (
                <Badge variant={overdue ? "destructive" : "secondary"}>
                  {formatShortDate(todo.date)}
                </Badge>
              ) : (
                <CalendarDays className="size-4 text-muted-foreground" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={todo.date ? new Date(todo.date) : undefined}
              onSelect={(value) =>
                updateTodo(todo.id, { date: value ? toDateKey(value) : null })
              }
            />
          </PopoverContent>
        </Popover>
      </motion.div>
    </div>
  );
}
