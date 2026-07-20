import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/overlay/popover";
import { Calendar as DatePicker } from "@/common/components/ui/form/calendar";
import { toDateKey, parseDateKey } from "@/lib/date";

export function DateJumpButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (d: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-xl border border-border bg-card p-2.5 shadow-sm transition-colors hover:bg-muted"
          aria-label="Jump to date"
        >
          <Calendar className="size-5 text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <DatePicker
          mode="single"
          selected={parseDateKey(value)}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateKey(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
