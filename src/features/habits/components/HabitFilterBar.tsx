import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/useUiStore";

export function HabitFilterBar() {
  const hideCompleted = useUiStore((state) => state.dailyHideCompleted);
  const setHideCompleted = useUiStore((state) => state.setDailyHideCompleted);
  const hideEmptyTimeframes = useUiStore((state) => state.dailyHideEmptyTimeframes);
  const setHideEmptyTimeframes = useUiStore((state) => state.setDailyHideEmptyTimeframes);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setHideCompleted(!hideCompleted)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          hideCompleted
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={hideCompleted}
      >
        {hideCompleted ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        {hideCompleted ? "Show completed" : "Hide completed"}
      </button>
      <button
        type="button"
        onClick={() => setHideEmptyTimeframes(!hideEmptyTimeframes)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          hideEmptyTimeframes
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={hideEmptyTimeframes}
      >
        {hideEmptyTimeframes ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        {hideEmptyTimeframes ? "Show empty timeframes" : "Hide empty timeframes"}
      </button>
    </div>
  );
}
