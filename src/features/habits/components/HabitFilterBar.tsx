import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Priority } from "@/lib/schema";
import { Switch } from "@/common/components/ui/form/switch";
import { Input } from "@/common/components/ui/form/input";
import { useUiStore } from "@/store/useUiStore";
import { useAppStore } from "@/store/useAppStore";

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

/**
 * Routine filter controls. Rendered inside Edit Mode (above the timeframes),
 * but the filters they drive only take effect on the My Day view — Edit Mode
 * itself always shows every habit and timeframe.
 */
export function HabitFilterBar() {
  const showCompleted = useUiStore((state) => state.dailyShowCompleted);
  const setShowCompleted = useUiStore((state) => state.setDailyShowCompleted);
  const showDiscarded = useUiStore((state) => state.dailyShowDiscarded);
  const setShowDiscarded = useUiStore((state) => state.setDailyShowDiscarded);
  const showEmptyCategories = useUiStore((state) => state.dailyShowEmptyCategories);
  const setShowEmptyCategories = useUiStore((state) => state.setDailyShowEmptyCategories);
  const showEmptyTimeframes = useUiStore((state) => state.dailyShowEmptyTimeframes);
  const setShowEmptyTimeframes = useUiStore((state) => state.setDailyShowEmptyTimeframes);
  const priorityFilter = useUiStore((state) => state.dailyPriorityFilter);
  const togglePriority = useUiStore((state) => state.toggleDailyPriorityFilter);
  const lingerSeconds = useAppStore((state) => state.settings.myDayLingerSeconds);
  const setLingerSeconds = useAppStore((state) => state.setMyDayLingerSeconds);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ToggleControl
          label="Show completed"
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
        />
        <ToggleControl
          label="Show discarded"
          checked={showDiscarded}
          onCheckedChange={setShowDiscarded}
        />
        <ToggleControl
          label="Show empty category"
          checked={showEmptyCategories}
          onCheckedChange={setShowEmptyCategories}
        />
        <ToggleControl
          label="Show empty timeframes"
          checked={showEmptyTimeframes}
          onCheckedChange={setShowEmptyTimeframes}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PRIORITIES.map(({ value, label }) => (
          <CheckboxControl
            key={value}
            label={label}
            checked={priorityFilter.includes(value)}
            onToggle={() => togglePriority(value)}
          />
        ))}
      </div>
      <LingerControl seconds={lingerSeconds} onChange={setLingerSeconds} />
    </div>
  );
}

/**
 * How long a just-ticked/crossed habit lingers (in its performed state) on My
 * Day before the "Show completed"/"Show discarded" filters hide it. Only has a
 * visible effect while those filters are off. 0 = filter out immediately.
 */
function LingerControl({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <label
        htmlFor="myd_linger"
        className="text-sm font-medium text-foreground"
      >
        Keep ticked/crossed habits visible for
      </label>
      <Input
        id="myd_linger"
        type="number"
        min={0}
        inputMode="numeric"
        value={String(seconds)}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(next) ? Math.max(0, next) : 0);
        }}
        className="h-8 w-20 text-sm"
      />
      <span className="text-sm text-muted-foreground">
        seconds before filtering out
      </span>
    </div>
  );
}

function ToggleControl({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}

function CheckboxControl({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
