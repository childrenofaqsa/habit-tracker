import { useState } from "react";
import { ArrowLeft, Trash2, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import type { ValueTracker, GoalType } from "@/lib/schema";

type EditUpdatePageProps = {
  value: ValueTracker;
  onBack: () => void;
};

const FREQUENCY_OPTIONS: { id: GoalType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function EditUpdatePage({ value, onBack }: EditUpdatePageProps) {
  const updateValue = useAppStore((s) => s.updateValue);
  const deleteValue = useAppStore((s) => s.deleteValue);
  const habits = useAppStore((s) => s.habits);

  const [name, setName] = useState(value.name);
  const [unit, setUnit] = useState(value.unit);
  const [inputMode, setInputMode] = useState<"numeric" | "text">(value.type);
  const [goalType, setGoalType] = useState<GoalType | null>(value.goalType);
  const [goalTarget, setGoalTarget] = useState(value.goalTarget ?? 0);

  const linkedHabits = habits.filter((h) => h.linkedValueId === value.id);

  function handleSave() {
    updateValue(value.id, {
      name,
      unit,
      goalType,
      goalTarget: goalTarget || null,
    });
    onBack();
  }

  function handleDelete() {
    deleteValue(value.id);
    onBack();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h2 className="text-lg font-semibold">Edit Update</h2>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="size-4" />
          Delete Update
        </button>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Update Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Unit
        </label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g., cups, ml, pages"
          className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Input Mode
        </label>
        <div className="flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setInputMode("numeric")}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              inputMode === "numeric"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            Counter
          </button>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              inputMode === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            Textbox
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Goal Setting</h3>
        <div className="mb-4 flex rounded-lg bg-muted p-1">
          {FREQUENCY_OPTIONS.map((opt) => (
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
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Value
          </label>
          <input
            type="number"
            value={goalTarget}
            onChange={(e) => setGoalTarget(Number(e.target.value))}
            className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="size-4" />
            Linked Habits
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {linkedHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked habits.</p>
        ) : (
          <div className="space-y-2">
            {linkedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm">
                  ✦
                </div>
                <span className="text-sm font-medium">{habit.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Save Changes
      </button>
    </div>
  );
}
