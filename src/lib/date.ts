import { format, parseISO, subDays, startOfDay, isBefore, isToday } from "date-fns";

export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function parseDateKey(key: DateKey): Date {
  return parseISO(key);
}

export function reverseChronologicalKeys(days: number): DateKey[] {
  const today = startOfDay(new Date());
  const keys: DateKey[] = [];
  for (let offset = 0; offset < days; offset++) {
    keys.push(toDateKey(subDays(today, offset)));
  }
  return keys;
}

export function isDateKeyBeforeToday(key: DateKey): boolean {
  return isBefore(startOfDay(parseDateKey(key)), startOfDay(new Date()));
}

export function isDateKeyToday(key: DateKey): boolean {
  return isToday(parseDateKey(key));
}

export function formatHumanDate(key: DateKey): string {
  return format(parseDateKey(key), "EEE, MMM d");
}

export function formatShortDate(key: DateKey): string {
  return format(parseDateKey(key), "d MMM");
}

export function formatDayMonth(key: DateKey): string {
  return format(parseDateKey(key), "d MMM");
}

export function formatMatrixDate(key: DateKey): string {
  return format(parseDateKey(key), "d MMM");
}

export function formatMatrixDayNumber(key: DateKey): string {
  return format(parseDateKey(key), "d");
}

export function formatMatrixMonthShort(key: DateKey): string {
  return format(parseDateKey(key), "MMM").toUpperCase();
}

export function formatClockTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function backupTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd_HHmm");
}
