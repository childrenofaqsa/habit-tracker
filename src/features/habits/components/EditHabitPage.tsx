import { useState } from "react";
import { ArrowLeft, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import type { Habit } from "@/lib/schema";

type EditHabitPageProps = {
  habit: Habit;
  onBack: () => void;
};

const TIMEFRAME_OPTIONS = ["Morning", "Noon", "Evening", "Night"];
const CATEGORY_OPTIONS = ["Mindset", "Health", "Productivity", "Creativity"];
const DAY_OPTIONS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function EditHabitPage({ habit, onBack }: EditHabitPageProps) {
  const updateHabit = useAppStore((s) => s.updateHabit);
  const categories = useAppStore((s) => s.categories);
  const timeframes = useAppStore((s) => s.timeframes);
  const values = useAppStore((s) => s.values);

  const currentCategory = categories.find((c) => c.id === habit.categoryId);
  const currentTimeframe = timeframes.find(
    (t) => t.id === currentCategory?.timeframeId,
  );

  const [title, setTitle] = useState(habit.title);
  const [selectedTimeframe, setSelectedTimeframe] = useState(
    currentTimeframe?.name ?? "Morning",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    currentCategory?.name ?? "Health",
  );
  const [recurrence, setRecurrence] = useState<string[]>(habit.recurrence);
  const [scheduledTime, setScheduledTime] = useState(habit.scheduledTime ?? "07:30");
  const [notifications, setNotifications] = useState(habit.notifications);
  const [linkedValueId, setLinkedValueId] = useState(habit.linkedValueId ?? "");

  const isEveryday = recurrence.includes("everyday");

  function toggleDay(dayCode: string) {
    if (isEveryday) {
      setRecurrence([dayCode]);
      return;
    }
    setRecurrence((prev) =>
      prev.includes(dayCode)
        ? prev.filter((d) => d !== dayCode)
        : [...prev, dayCode],
    );
  }

  function toggleEveryday() {
    setRecurrence(isEveryday ? [] : ["everyday"]);
  }

  function handleSave() {
    updateHabit(habit.id, {
      title,
      scheduledTime,
      recurrence,
      notifications,
      linkedValueId: linkedValueId || null,
    });
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
        <h2 className="text-lg font-semibold">Edit Habit</h2>
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-muted-foreground" />
          <Settings className="size-5 text-muted-foreground" />
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            ✦
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Habit Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Ideal Timeframe</h3>
        <div className="flex gap-2">
          {TIMEFRAME_OPTIONS.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setSelectedTimeframe(tf)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                selectedTimeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Recurrence</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleEveryday}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isEveryday
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            Everyday
          </button>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((day, i) => (
              <button
                key={DAY_CODES[i]}
                type="button"
                onClick={() => toggleDay(DAY_CODES[i])}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  !isEveryday && recurrence.includes(DAY_CODES[i])
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Scheduled Time</h3>
        <div className="flex items-center justify-between">
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          />
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Link Update</h3>
        <select
          value={linkedValueId}
          onChange={(e) => setLinkedValueId(e.target.value)}
          className="w-full rounded-lg bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select an update name...</option>
          {values.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Save Habit Changes
      </button>
    </div>
  );
}
