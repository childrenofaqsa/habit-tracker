type RawData = Record<string, unknown>;

/**
 * v7 introduces per-day picked habits. Existing day records simply gain an
 * empty `pickedHabitIds` list; the schema default also covers records that
 * predate this field, so this migration is mostly for explicitness/parity.
 */
export function migrateV6ToV7(data: RawData): RawData {
  const history = (data.history as Record<string, Record<string, unknown>> | undefined) ?? {};
  const upgradedHistory: Record<string, Record<string, unknown>> = {};
  for (const [day, record] of Object.entries(history)) {
    upgradedHistory[day] = { pickedHabitIds: [], ...record };
  }
  return { ...data, history: upgradedHistory };
}
