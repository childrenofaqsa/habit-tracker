import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/overlay/sheet";
import { Button } from "@/common/components/ui/data/button";
import { Input } from "@/common/components/ui/form/input";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onToggle: (habitId: string) => void;
};

export function HabitPickerSheet({ open, onOpenChange, selectedIds, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const habits = useAppStore((s) => s.habits);
  const categories = useAppStore((s) => s.categories);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.title.toLowerCase().includes(q));
  }, [habits, query]);

  function getCategoryName(catId: string) {
    return categories.find((c) => c.id === catId)?.name ?? "";
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[80vh] flex-col gap-4 pb-8">
        <SheetHeader>
          <SheetTitle>Link Habits</SheetTitle>
        </SheetHeader>
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No habits found</p>
          ) : (
            filtered.map((habit) => {
              const isSelected = selectedIds.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => onToggle(habit.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "bg-muted/40 hover:bg-muted",
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {habit.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{habit.title}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {getCategoryName(habit.categoryId)}
                    </p>
                  </div>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <Button className="w-full shrink-0" onClick={() => onOpenChange(false)}>
          Done
        </Button>
      </SheetContent>
    </Sheet>
  );
}
