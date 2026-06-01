import { SCHEMA_VERSION } from "@/lib/constants";
import { writeRaw } from "@/storage/localForageAdapter";
import { premigrationKey } from "@/storage/keys";
import { migrateV1ToV2 } from "./v1ToV2";

type RawData = Record<string, unknown>;
type Migration = (data: RawData) => RawData;

const migrations: Record<number, Migration> = {
  1: migrateV1ToV2,
};

export async function runMigrations(raw: RawData): Promise<RawData> {
  let current = typeof raw.version === "number" ? raw.version : 0;
  let data = raw;

  while (current < SCHEMA_VERSION) {
    const migrate = migrations[current];
    if (!migrate) {
      data = { ...data, version: SCHEMA_VERSION };
      break;
    }
    await writeRaw(premigrationKey(current), data);
    data = { ...migrate(data), version: current + 1 };
    current += 1;
  }

  return data;
}
