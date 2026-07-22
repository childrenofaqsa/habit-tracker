type RawData = Record<string, unknown>;

export function migrateV5ToV6(data: RawData): RawData {
  const values = (data.values as Array<Record<string, unknown>> | undefined) ?? [];
  const upgradedValues = values.map((v) => ({ analyzerEnabled: false, ...v }));
  return {
    ...data,
    values: upgradedValues,
    fields: data.fields ?? [],
    entities: data.entities ?? [],
  };
}
