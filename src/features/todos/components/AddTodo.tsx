import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { toDateKey, formatShortDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/common/components/ui/form/input";
import { Button } from "@/common/components/ui/data/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/overlay/popover";
import { Calendar } from "@/common/components/ui/form/calendar";
import { Magnetic } from "@/common/components/motion/Magnetic";

export function AddTodo() {
  const addTodo = useAppStore((state) => state.addTodo);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string | null>(null);

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    addTodo(trimmed, date);
    setTitle("");
    setDate(null);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <Input
        value={title}
        placeholder="Add a task"
        onChange={(event) => setTitle(event.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="Pick date">
            <CalendarDays className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={(value) => setDate(value ? toDateKey(value) : null)}
          />
        </PopoverContent>
      </Popover>
      <Magnetic>
        <Button type="submit" size="icon" aria-label="Add task">
          <Plus className="size-4" />
        </Button>
      </Magnetic>
      {date && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {formatShortDate(date)}
        </span>
      )}
    </form>
  );
}
