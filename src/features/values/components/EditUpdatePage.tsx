import { useState } from "react";
import { ArrowLeft, Trash2, Link2, Plus, X, Flag, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import type { ValueTracker, GoalType } from "@/lib/schema";
import { Switch } from "@/common/components/ui/form/switch";
import { HabitPickerSheet } from "./HabitPickerSheet";

type Props = {
  value: ValueTracker;
  onBack: () => void;
};

const GOAL_TYPES: { id: GoalType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function EditUpdatePage({ value, onBack }: Props) {
  const updateValue = useAppStore((s) => s.updateValue);
  const deleteValue = useAppStore((s) => s.deleteValue);
  const linkHabitToValue = useAppStore((s) => s.linkHabitToValue);
  const habits = useAppStore((s) => s.habits);
  const categories = useAppStore((s) => s.categories);

  const linkedHabits = habits.filter((h) => h.linkedValueId === value.id);

  const [name, setName] = useState(value.name);
  const [unit, setUnit] = useState(value.unit);
  const [inputMode, setInputMode] = useState<"numeric" | "text">(value.type);
  const [goalType, setGoalType] = useState<GoalType>(value.goalType ?? "daily");
  const [goalTarget, setGoalTarget] = useState(value.goalTarget ?? 0);
  const [analyzerEnabled, setAnalyzerEnabled] = useState(value.analyzerEnabled);
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(linkedHabits.map((h) => h.id));
  const [pickerOpen, setPickerOpen] = useState(false);

  function toggleHabit(habitId: string) {
    setLinkedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    );
  }

  function getCategoryName(catId: string) {
    return categories.find((c) => c.id === catId)?.name ?? "";
  }

  function handleSave() {
    updateValue(value.id, {
      name: name.trim() || value.name,
      unit: unit.trim(),
      type: inputMode,
      goalType,
      goalTarget: goalTarget > 0 ? goalTarget : null,
      analyzerEnabled,
    });
    const originalIds = linkedHabits.map((h) => h.id);
    for (const id of originalIds) {
      if (!linkedHabitIds.includes(id)) linkHabitToValue(id, null);
    }
    for (const id of linkedHabitIds) {
      if (!originalIds.includes(id)) linkHabitToValue(id, value.id);
    }
    onBack();
  }

  function handleDelete() {
    deleteValue(value.id);
    onBack();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h2 className="text-2xl font-bold">Edit Tracker</h2>
          <p className="text-sm text-muted-foreground">Customize how you track your progress.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-xl border border-destructive px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </header>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Tracker Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Unit
          </label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="cups, ml, pages..."
            className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Input Mode
        </label>
        <div className="flex rounded-lg bg-muted p-1">
          {(["numeric", "text"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                inputMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {mode === "numeric" ? "Counter" : "Textbox"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Flag className="size-4 text-primary" /> Goal Setting
        </h3>
        <div className="mb-4 flex rounded-lg bg-muted p-1">
          {GOAL_TYPES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setGoalType(opt.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase transition-colors",
                goalType === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Target Value
          </label>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
            <span className="text-sm text-muted-foreground">{unit || "value"}</span>
            <input
              type="number"
              min={0}
              value={goalTarget || ""}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
              className="w-20 bg-transparent text-right text-sm font-semibold focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Turn on Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Analyze this tracker's values by field and entity.
              </p>
            </div>
          </div>
          <Switch checked={analyzerEnabled} onCheckedChange={setAnalyzerEnabled} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="size-4 text-primary" /> Linked Habits
          </h3>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="rounded-lg p-1.5 text-primary hover:bg-primary/10"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {linkedHabitIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked habits. Tap + to add.</p>
        ) : (
          <div className="space-y-2">
            {linkedHabitIds.map((id) => {
              const habit = habits.find((h) => h.id === id);
              if (!habit) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5"
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
                  <button
                    type="button"
                    onClick={() => toggleHabit(id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HabitPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={linkedHabitIds}
        onToggle={toggleHabit}
      />
    </div>
  );
}
