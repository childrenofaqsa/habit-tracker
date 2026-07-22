import { useLayoutEffect, useRef } from "react";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { selectValueTextDisplay } from "@/store/selectors";
import { todayKey } from "@/lib/date";

type Props = { value: ValueTracker };

export function TextTrackerField({ value }: Props) {
  const text = useAppStore(selectValueTextDisplay(value.id, todayKey()));
  const setValueEntryToday = useAppStore((s) => s.setValueEntryToday);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={text}
      placeholder="Log entry..."
      onChange={(e) => setValueEntryToday(value.id, e.target.value)}
      className="w-44 resize-none whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}
