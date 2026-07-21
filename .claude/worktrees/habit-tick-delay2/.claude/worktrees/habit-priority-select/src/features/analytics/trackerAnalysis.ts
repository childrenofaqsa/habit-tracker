import type { DateKey } from "@/lib/date";
import type { DayRecord, Entity, Field, ValueTracker } from "@/lib/schema";
import { mergeTextEntries } from "@/lib/aggregate";

export type AnalysisCell = {
  count: number;
  entityNames: string[];
};

export type AnalysisFieldRow = {
  fieldId: string;
  fieldName: string;
  cells: Record<DateKey, AnalysisCell>;
};

export type TrackerAnalysis = {
  trackerId: string;
  trackerName: string;
  dateKeys: DateKey[];
  valueText: Record<DateKey, string>;
  fieldRows: AnalysisFieldRow[];
};

function matchEntities(text: string, entities: Entity[]): string[] {
  const haystack = text.toLowerCase();
  const matched: string[] = [];
  for (const entity of entities) {
    const name = entity.name.trim();
    if (name.length === 0) continue;
    if (haystack.includes(name.toLowerCase())) matched.push(entity.name);
  }
  return matched;
}

export function buildTrackerAnalysis(
  tracker: ValueTracker,
  fields: Field[],
  entities: Entity[],
  history: Record<DateKey, DayRecord>,
  habitNames: Record<string, string>,
): TrackerAnalysis {
  const dateKeys = Object.keys(history)
    .filter((key) => history[key]?.valueEntries[tracker.id])
    .sort((a, b) => b.localeCompare(a));

  const valueText: Record<DateKey, string> = {};
  for (const key of dateKeys) {
    valueText[key] =
      mergeTextEntries(history[key]?.valueEntries[tracker.id], habitNames) ?? "";
  }

  const fieldRows: AnalysisFieldRow[] = fields.map((field) => {
    const fieldEntities = entities.filter((entity) =>
      entity.fieldIds.includes(field.id),
    );
    const cells: Record<DateKey, AnalysisCell> = {};
    for (const key of dateKeys) {
      const entityNames = matchEntities(valueText[key] ?? "", fieldEntities);
      cells[key] = { count: entityNames.length, entityNames };
    }
    return { fieldId: field.id, fieldName: field.name, cells };
  });

  return {
    trackerId: tracker.id,
    trackerName: tracker.name,
    dateKeys,
    valueText,
    fieldRows,
  };
}
