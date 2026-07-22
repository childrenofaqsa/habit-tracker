type RawData = Record<string, unknown>;

type FlatRecord = {
  habitStatus?: Record<string, "done" | "missed">;
  valueEntries?: Record<string, number | string>;
};

export function migrateV3ToV4(data: RawData): RawData {
  const history = (data.history as Record<string, FlatRecord> | undefined) ?? {};
  const nextHistory: Record<string, unknown> = {};
  for (const [dateKey, record] of Object.entries(history)) {
    const flat = record.valueEntries ?? {};
    const nested: Record<string, Record<string, number | string>> = {};
    for (const [valueId, value] of Object.entries(flat)) {
      nested[valueId] = { __direct__: value };
    }
    nextHistory[dateKey] = {
      habitStatus: record.habitStatus ?? {},
      valueEntries: nested,
    };
  }
  return { ...data, history: nextHistory };
}
