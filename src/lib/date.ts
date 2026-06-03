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

export function backupTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd_HHmm");
}
