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

  const todayDate = parseDateKey(today);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full bg-muted text-muted-foreground hover:bg-muted/70"
            aria-label="Pick date"
          >
            <CalendarDays className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDateKey(selectedDate)}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>

      <div
        ref={scrollRef}
        className="no-scrollbar flex flex-1 gap-2 overflow-x-auto scroll-smooth py-1"
      >
        {dates.map((dateKey) => {
          const date = parseDateKey(dateKey);
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === today;
          const diffDays = Math.round(
            (date.getTime() - todayDate.getTime()) / 86_400_000,
          );

          let label: string;
          if (diffDays === 0) label = "Today";
          else if (diffDays === -1) label = "Yesterday";
          else if (diffDays === 1) label = "Tomorrow";
          else label = format(date, "EEE, MMM d");

          return (
            <button
              key={dateKey}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onDateChange(dateKey)}
              className={cn(
                "relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isToday
                    ? "bg-muted text-foreground ring-1 ring-primary/40"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="relative z-10">{label}</span>
              {isSelected && (
                <motion.div
                  layoutId="date-scroll-indicator"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={springs.snappy}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
