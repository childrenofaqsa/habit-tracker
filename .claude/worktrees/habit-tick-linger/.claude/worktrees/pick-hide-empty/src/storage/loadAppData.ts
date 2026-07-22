import { appDataSchema, emptyAppData, type AppData } from "@/lib/schema";
import { readRaw, writeRaw } from "@/storage/localForageAdapter";
import { APP_DATA_KEY, premigrationKey } from "@/storage/keys";
import { runMigrations } from "@/storage/migrations";
import { purgeOldHistory } from "@/storage/retention";
import { createSeedData } from "@/storage/seed";

export type LoadStatus = "seeded" | "loaded" | "recovered";

export type LoadResult = {
  data: AppData;
  status: LoadStatus;
};

function recoverPartial(raw: Record<string, unknown>): AppData {
  const base = emptyAppData();
  const recovered: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base) as (keyof AppData)[]) {
    if (key in raw) {
      const candidate = { ...base, [key]: raw[key] };
      const result = appDataSchema.safeParse(candidate);
      if (result.success) recovered[key] = raw[key];
    }
  }
  return appDataSchema.parse(recovered);
}

export async function loadAppData(): Promise<LoadResult> {
  const raw = await readRaw<Record<string, unknown>>(APP_DATA_KEY);

  if (raw === null || raw === undefined) {
    const seed = createSeedData();
    await writeRaw(APP_DATA_KEY, seed);
    return { data: seed, status: "seeded" };
  }

  const migrated = await runMigrations(raw);
  const parsed = appDataSchema.safeParse(migrated);

  if (parsed.success) {
    const purged = purgeOldHistory(parsed.data);
    if (purged !== parsed.data) await writeRaw(APP_DATA_KEY, purged);
    return { data: purged, status: "loaded" };
  }

  await writeRaw(premigrationKey(999), raw);
  const recovered = purgeOldHistory(recoverPartial(migrated));
  await writeRaw(APP_DATA_KEY, recovered);
  return { data: recovered, status: "recovered" };
}

export async function saveAppData(data: AppData): Promise<void> {
  await writeRaw(APP_DATA_KEY, data);
}
