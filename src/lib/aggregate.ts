import type { ValueType } from "@/lib/schema";

export type ValueEntries = Record<string, number | string>;

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
