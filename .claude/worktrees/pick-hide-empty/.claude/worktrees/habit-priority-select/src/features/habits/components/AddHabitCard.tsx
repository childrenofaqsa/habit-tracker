import { useState } from "react";
import { Plus } from "lucide-react";
import { CARD_SIZE } from "@/features/habits/cardSize";
import { cn } from "@/lib/cn";
import { Input } from "@/common/components/ui/form/input";

export function AddHabitCard({ onAdd }: { onAdd: (title: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed) onAdd(trimmed);
    setText("");
    setEditing(false);
  };

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn(CARD_SIZE, "flex shrink-0 items-center justify-center")}
      >
        <Input
          autoFocus
          value={text}
          placeholder="Habit"
          onBlur={submit}
          onChange={(event) => setText(event.target.value)}
          className="h-9 text-center text-xs"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        CARD_SIZE,
        "flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
      )}
    >
      <Plus className="size-6" />
      <span className="text-[11px]">Add</span>
    </button>
  );
}
