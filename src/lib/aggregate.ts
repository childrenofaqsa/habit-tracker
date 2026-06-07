import type { ValueType } from "@/lib/schema";

export type ValueEntries = Record<string, number | string>;

export const DIRECT_KEY = "__direct__";

export type TextEntryRow = { key: string; label: string; text: string };

export function aggregateValueEntries(
  entries: ValueEntries | undefined,
  valueType: ValueType,
): number | string | undefined {
  if (!entries) return undefined;
  const items = Object.values(entries);
  if (items.length === 0) return undefined;
  if (valueType === "numeric") {
    let total = 0;
    let any = false;
    for (const item of items) {
      const n = typeof item === "number" ? item : Number(item);
      if (Number.isFinite(n)) {
        total += n;
        any = true;
      }
    }
    return any ? total : undefined;
  }
  const texts = items
    .map((item) => (typeof item === "string" ? item : String(item)))
    .filter((s) => s.trim().length > 0);
  if (texts.length === 0) return undefined;
  return texts.join("\n");
}

function asText(value: number | string): string {
  return typeof value === "string" ? value : String(value);
}

export function textEntryRows(
  entries: ValueEntries | undefined,
  habitNames: Record<string, string>,
): TextEntryRow[] {
  if (!entries) return [];
  const rows: TextEntryRow[] = [];
  for (const [key, raw] of Object.entries(entries)) {
    const text = asText(raw);
    if (text.trim().length === 0) continue;
    if (key === DIRECT_KEY) continue;
    rows.push({ key, label: habitNames[key] ?? key, text });
  }
  return rows;
}

export function mergeTextEntries(
  entries: ValueEntries | undefined,
  habitNames: Record<string, string>,
): string | undefined {
  if (!entries) return undefined;
  const override = entries[DIRECT_KEY];
  if (typeof override === "string" && override.trim().length > 0) return override;
  const rows = textEntryRows(entries, habitNames);
  if (rows.length === 0) return undefined;
  return rows.map((row) => `${row.label} : ${row.text}`).join("\n");
}
