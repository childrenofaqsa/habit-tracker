import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Bell, Plus, Settings, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { useHabitImage } from "@/features/habits/hooks/useHabitImage";
import { deleteImage, revokeImageUrl } from "@/storage/imageStore";
import type { Habit, Priority } from "@/lib/schema";

type EditHabitPageProps = {
  habit: Habit;
  onBack: () => void;
};

const DAY_OPTIONS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" },
];

export function EditHabitPage({ habit, onBack }: EditHabitPageProps) {
  const updateHabit = useAppStore((s) => s.updateHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const addCategory = useAppStore((s) => s.addCategory);
  const categories = useAppStore((s) => s.categories);
  const timeframes = useAppStore((s) => s.timeframes);
  const values = useAppStore((s) => s.values);
  const { uploadImage } = useHabitActions();
  const imageUrl = useHabitImage(habit.imageId);
  const fileRef = useRef<HTMLInputElement>(null);

  const sortedTimeframes = useMemo(
    () => [...timeframes].sort((a, b) => a.order - b.order),
    [timeframes],
  );
  const currentCategory = categories.find((c) => c.id === habit.categoryId);

  const [title, setTitle] = useState(habit.title);
  const [details, setDetails] = useState(habit.details);
  const [selectedTimeframeId, setSelectedTimeframeId] = useState<string>(
    currentCategory?.timeframeId ?? sortedTimeframes[0]?.id ?? "",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    habit.categoryId,
  );
  const [recurrence, setRecurrence] = useState<string[]>(habit.recurrence);
  const [scheduledTime, setScheduledTime] = useState(habit.scheduledTime ?? "07:30");
  const [notifications, setNotifications] = useState(habit.notifications);
  const [priority, setPriority] = useState<Priority>(habit.priority);
  const [linkedValueId, setLinkedValueId] = useState(habit.linkedValueId ?? "");

  const isEveryday = recurrence.includes("everyday");

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((c) => c.timeframeId === selectedTimeframeId)
        .sort((a, b) => a.order - b.order),
    [categories, selectedTimeframeId],
  );

  const canSave = selectedCategoryId !== "" && title.trim() !== "";

  function handleTimeframeChange(timeframeId: string) {
    setSelectedTimeframeId(timeframeId);
    const stillValid = categories.some(
      (c) => c.id === selectedCategoryId && c.timeframeId === timeframeId,
    );
    if (!stillValid) {
      const firstInTimeframe = categories
        .filter((c) => c.timeframeId === timeframeId)
        .sort((a, b) => a.order - b.order)[0];
      setSelectedCategoryId(firstInTimeframe?.id ?? "");
    }
  }

  function handleAddCategory() {
    if (!selectedTimeframeId) return;
    const id = addCategory(selectedTimeframeId, "New Category");
    setSelectedCategoryId(id);
  }

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
    if (!canSave) return;
    updateHabit(habit.id, {
      title,
      details,
      categoryId: selectedCategoryId,
      scheduledTime,
      recurrence,
      notifications,
      priority,
      linkedValueId: linkedValueId || null,
    });
    onBack();
  }

  function handleDelete() {
    if (habit.imageId) {
      revokeImageUrl(habit.imageId);
      void deleteImage(habit.imageId);
    }
    deleteHabit(habit.id);
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
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label={imageUrl ? "Change habit image" : "Upload habit image"}
            className={cn(
              "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl",
              imageUrl
                ? "border border-border"
                : "border-2 border-dashed border-border bg-primary/5 text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <Upload className="size-6" />
            )}
            {imageUrl && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
                Change
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(habit, file);
              event.target.value = "";
            }}
          />
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
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add a note or description"
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Ideal Timeframe</h3>
        {sortedTimeframes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No timeframes yet. Turn on Edit Mode to add one.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedTimeframes.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => handleTimeframeChange(tf.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  selectedTimeframeId === tf.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {tf.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="flex flex-wrap items-center gap-2">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategoryId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
          {selectedTimeframeId && (
            <button
              type="button"
              onClick={handleAddCategory}
              aria-label="Add category"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-3.5" />
              Category
            </button>
          )}
        </div>
        {visibleCategories.length === 0 && selectedTimeframeId && (
          <p className="mt-2 text-xs text-muted-foreground">
            No categories in this timeframe. Create one to save.
          </p>
        )}
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
                onClick={() => toggleDay(DAY_CODES[i]!)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  !isEveryday && recurrence.includes(DAY_CODES[i]!)
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
        <h3 className="mb-3 text-sm font-semibold">Priority</h3>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={cn(
                "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-colors",
                priority === p.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-primary py-3.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Habit Changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" /> Delete habit
        </button>
      </div>
    </div>
  );
}
