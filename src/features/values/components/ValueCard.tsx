import { Trash2, Link2 } from "lucide-react";
import type { ValueTracker } from "@/lib/schema";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { selectValueEntry, selectHabitStatus } from "@/store/selectors";
import { useSelectedDate } from "@/common/hooks/useSelectedDate";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/data/card";
import { Badge } from "@/common/components/ui/data/badge";
import { Button } from "@/common/components/ui/data/button";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { NumericCounter } from "@/features/values/components/NumericCounter";
import { TextboxLog } from "@/features/values/components/TextboxLog";
import { ValueHistory } from "@/features/values/components/ValueHistory";

type Props = { value: ValueTracker; handle?: React.ReactNode };

export function ValueCard({ value, handle }: Props) {
  const selectedDate = useSelectedDate();
  const editMode = useAppStore((state) => state.settings.editMode);
  const entry = useAppStore(selectValueEntry(value.id, selectedDate));
  const linkedStatus = useAppStore(selectHabitStatus(value.linkedHabitId ?? "", selectedDate));
  const habits = useAppStore((state) => state.habits);
  const setValueEntryToday = useAppStore((state) => state.setValueEntryToday);
  const updateValue = useAppStore((state) => state.updateValue);
  const deleteValue = useAppStore((state) => state.deleteValue);
  const linkHabitToValue = useAppStore((state) => state.linkHabitToValue);

  const synced = Boolean(value.linkedHabitId) && linkedStatus === "done";
  const numericValue = typeof entry === "number" ? entry : 0;
  const textValue = typeof entry === "string" ? entry : "";

  return (
    <Card className={cn(synced && "ring-1 ring-success")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            {handle}
            <EditableTitle
              value={value.name}
              editMode={editMode}
              onRename={(name) => updateValue(value.id, { name })}
            />
          </span>
          <span className="flex items-center gap-1">
            {synced && <Badge variant="success">Synced</Badge>}
            {editMode && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Delete value"
                onClick={() => deleteValue(value.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.type === "numeric" ? (
          <NumericCounter
            value={numericValue}
            onChange={(next) => setValueEntryToday(value.id, next)}
          />
        ) : (
          <TextboxLog
            name={value.name}
            value={textValue}
            onChange={(next) => setValueEntryToday(value.id, next)}
          />
        )}

        {editMode && (
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="size-3" /> Linked habit
            </label>
            <select
              value={value.linkedHabitId ?? ""}
              onChange={(event) => {
                if (event.target.value) {
                  linkHabitToValue(event.target.value, value.id);
                } else if (value.linkedHabitId) {
                  linkHabitToValue(value.linkedHabitId, null);
                }
              }}
              className="flex h-9 w-full items-center rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">None</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <ValueHistory value={value} />
      </CardContent>
    </Card>
  );
}
