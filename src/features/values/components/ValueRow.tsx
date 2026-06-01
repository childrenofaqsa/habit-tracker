import { Minus, Plus, Calendar, Droplet } from "lucide-react";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { selectValueEntry } from "@/store/selectors";
import { todayKey } from "@/lib/date";

type Props = {
  value: ValueTracker;
  handle?: React.ReactNode;
  dragMode?: boolean;
  onNameClick?: () => void;
  onLogClick?: () => void;
};

export function ValueRow({ value, handle, dragMode = false, onNameClick, onLogClick }: Props) {
  const entry = useAppStore(selectValueEntry(value.id, todayKey()));
  const setValueEntryToday = useAppStore((s) => s.setValueEntryToday);

  const numericValue = typeof entry === "number" ? entry : 0;
  const unit = value.unit || "count";
  const goalSubtitle =
    value.type === "numeric" && value.goalTarget
      ? `Goal: ${value.goalTarget} ${unit}`
      : value.type === "text"
        ? "Text log"
        : unit;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
      {dragMode && handle && <div className="shrink-0">{handle}</div>}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Droplet className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onNameClick}
          className="block truncate text-left text-sm font-bold hover:text-primary"
        >
          {value.name}
        </button>
        <p className="text-xs text-muted-foreground">{goalSubtitle}</p>
      </div>
      {value.type === "numeric" ? (
        <div className="flex items-center rounded-xl border border-border bg-muted/50 p-1">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-background"
            onClick={() => setValueEntryToday(value.id, Math.max(0, numericValue - 1))}
            aria-label="Decrease"
          >
            <Minus className="size-4" />
          </button>
          <div className="w-12 text-center">
            <div className="text-sm font-bold text-primary">{numericValue}</div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">{unit}</div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-background"
            onClick={() => setValueEntryToday(value.id, numericValue + 1)}
            aria-label="Increase"
          >
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <input
          type="text"
          className="w-36 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm"
          placeholder="Log entry..."
          value={typeof entry === "string" ? entry : ""}
          onChange={(e) => setValueEntryToday(value.id, e.target.value)}
        />
      )}
      <button
        type="button"
        onClick={onLogClick}
        className="shrink-0 text-primary hover:opacity-70"
        aria-label="View log history"
      >
        <Calendar className="size-5" />
      </button>
    </div>
  );
}

