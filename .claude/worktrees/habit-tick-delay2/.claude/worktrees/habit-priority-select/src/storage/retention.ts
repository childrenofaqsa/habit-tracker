import { HISTORY_RETENTION_DAYS } from "@/lib/constants";
import { reverseChronologicalKeys } from "@/lib/date";
import type { AppData, DayRecord } from "@/lib/schema";

export function purgeOldHistory(data: AppData): AppData {
  const keep = new Set(reverseChronologicalKeys(HISTORY_RETENTION_DAYS));
  const entries = Object.entries(data.history) as [string, DayRecord][];
  const trimmed: Record<string, DayRecord> = {};
  let changed = false;

  for (const [key, record] of entries) {
    if (keep.has(key)) {
      trimmed[key] = record;
    } else {
      changed = true;
    }
  }

  if (!changed) return data;
  return { ...data, history: trimmed };
}
