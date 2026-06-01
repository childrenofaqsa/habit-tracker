import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import { addDays, subDays, format, startOfDay } from "date-fns";
import { toDateKey, parseDateKey, todayKey } from "@/lib/date";
import type { DateKey } from "@/lib/date";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/motionTokens";
import { Button } from "@/common/components/ui/data/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/overlay/popover";
import { Calendar } from "@/common/components/ui/form/calendar";

type Props = {
  selectedDate: DateKey;
  onDateChange: (date: DateKey) => void;
};

const VISIBLE_DAYS = 7;
const LOAD_CHUNK = 7;

function generateDateRange(center: Date, pastDays: number, futureDays: number): DateKey[] {
  const dates: DateKey[] = [];
  for (let i = -pastDays; i <= futureDays; i++) {
    dates.push(toDateKey(addDays(center, i)));
  }
  return dates;
}

export function DateScrollRow({ selectedDate, onDateChange }: Props) {
  const today = todayKey();
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [dates, setDates] = useState<DateKey[]>(() =>
    generateDateRange(parseDateKey(selectedDate), VISIBLE_DAYS, VISIBLE_DAYS),
  );

  const loadMorePast = useCallback(() => {
    setDates((prev) => {
      const earliest = parseDateKey(prev[0]!);
      const newDates = generateDateRange(subDays(earliest, LOAD_CHUNK), 0, LOAD_CHUNK - 1);
      return [...newDates, ...prev];
    });
  }, []);

  const loadMoreFuture = useCallback(() => {
    setDates((prev) => {
      const latest = parseDateKey(prev[prev.length - 1]!);
      const newDates = generateDateRange(addDays(latest, 1), 0, LOAD_CHUNK - 1);
      return [...prev, ...newDates];
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft < 60) loadMorePast();
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft > maxScroll - 60) loadMoreFuture();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMorePast, loadMoreFuture]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedDate]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const key = toDateKey(date);
    const centerDate = startOfDay(date);
    setDates(generateDateRange(centerDate, VISIBLE_DAYS, VISIBLE_DAYS));
    onDateChange(key);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        ref={scrollRef}
        className="no-scrollbar flex flex-1 gap-1 overflow-x-auto scroll-smooth py-1"
      >
        {dates.map((dateKey) => {
          const date = parseDateKey(dateKey);
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === today;
          const dayName = format(date, "EEE");
          const dayNum = format(date, "d");

          return (
            <button
              key={dateKey}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onDateChange(dateKey)}
              className={cn(
                "relative flex shrink-0 flex-col items-center rounded-xl px-3 py-2 text-xs transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isToday
                    ? "bg-muted text-foreground ring-1 ring-primary/40"
                    : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="text-[10px] font-medium uppercase">{dayName}</span>
              <span className="text-sm font-bold">{dayNum}</span>
              {isSelected && (
                <motion.div
                  layoutId="date-scroll-indicator"
                  className="absolute inset-0 rounded-xl bg-primary"
                  style={{ zIndex: -1 }}
                  transition={springs.snappy}
                />
              )}
            </button>
          );
        })}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Pick date">
            <CalendarDays className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={parseDateKey(selectedDate)}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
