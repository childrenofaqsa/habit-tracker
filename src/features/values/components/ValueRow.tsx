import { Minus, Plus, Calendar, Trash2, Droplet } from "lucide-react";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { selectValueEntry } from "@/store/selectors";
import { useSelectedDate } from "@/common/hooks/useSelectedDate";
import { Button } from "@/common/components/ui/data/button";
import { EditableTitle } from "@/features/editmode/EditableTitle";

type PastDay = { key: string; label: string };

type Props = {
  value: ValueTracker;
  pastDays: PastDay[];
  handle?: React.ReactNode;
  onEdit?: () => void;
};

function PastDayCell({ valueId, dateKey }: { valueId: string; dateKey: string }) {
  const entry = useAppStore(selectValueEntry(valueId, dateKey));
  if (entry === undefined) return <span className="text-xs text-gray-300">—</span>;
  if (typeof entry === "number") {
    return (
      <div className="text-center">
        <span className="text-xs font-bold text-gray-400">{entry}</span>
      </div>
    );
  }
  return (
    <div className="text-center">
      <span className="text-xs font-bold text-gray-400 truncate max-w-[60px] inline-block">
        {entry || "—"}
      </span>
    </div>
  );
}

export function ValueRow({ value, pastDays, handle, onEdit }: Props) {
  const selectedDate = useSelectedDate();
  const editMode = useAppStore((state) => state.settings.editMode);
  const entry = useAppStore(selectValueEntry(value.id, selectedDate));
  const setValueEntryToday = useAppStore((state) => state.setValueEntryToday);
  const updateValue = useAppStore((state) => state.updateValue);
  const deleteValue = useAppStore((state) => state.deleteValue);

  const numericValue = typeof entry === "number" ? entry : 0;

  return (
    <div className="grid grid-cols-[1fr] items-center gap-4 rounded-3xl border border-gray-50 bg-white p-4 shadow-sm dark:border-border dark:bg-card lg:grid-cols-[2fr_1.5fr_repeat(6,0.8fr)_0.5fr] lg:p-6">
      <div className="flex items-center gap-4">
        {handle}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-primary/10 dark:text-primary">
          <Droplet className="size-6" />
        </div>
        <div className="min-w-0">
          <EditableTitle
            value={value.name}
            editMode={editMode}
            onRename={(name) => updateValue(value.id, { name })}
            className="text-sm font-bold"
          />
          <p className="text-xs text-gray-400">
            {value.type === "numeric" ? `Value: ${numericValue}` : "Text log"}
          </p>
        </div>
        {editMode && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 shrink-0"
            aria-label="Delete value"
            onClick={() => deleteValue(value.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      {value.type === "numeric" ? (
        <div className="flex justify-center">
          <div className="flex w-44 items-center rounded-xl border border-gray-100 bg-gray-50 p-1 dark:border-border dark:bg-muted">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white dark:hover:bg-background"
              onClick={() => setValueEntryToday(value.id, Math.max(0, numericValue - 1))}
              aria-label="Decrease"
            >
              <Minus className="size-4" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-sm font-bold text-[#633DF7]">{numericValue}</div>
              <div className="text-[10px] font-bold uppercase text-gray-400">count</div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white dark:hover:bg-background"
              onClick={() => setValueEntryToday(value.id, numericValue + 1)}
              aria-label="Increase"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <input
            type="text"
            className="w-44 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-border dark:bg-muted"
            placeholder="Log entry..."
            value={typeof entry === "string" ? entry : ""}
            onChange={(e) => setValueEntryToday(value.id, e.target.value)}
          />
        </div>
      )}

      {pastDays.map((d) => (
        <div key={d.key} className="hidden text-center lg:block">
          <PastDayCell valueId={value.id} dateKey={d.key} />
        </div>
      ))}

      <div className="hidden text-right lg:block">
        <button
          type="button"
          className="text-[#633DF7] hover:opacity-70"
          aria-label="View history"
        >
          <Calendar className="size-6" />
        </button>
      </div>
    </div>
  );
}
