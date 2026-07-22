import { SCHEMA_VERSION } from "@/lib/constants";
import { writeRaw } from "@/storage/localForageAdapter";
import { premigrationKey } from "@/storage/keys";
import { migrateV1ToV2 } from "./v1ToV2";
import { migrateV2ToV3 } from "./v2ToV3";
import { migrateV3ToV4 } from "./v3ToV4";
import { migrateV4ToV5 } from "./v4ToV5";
import { migrateV5ToV6 } from "./v5ToV6";
import { migrateV6ToV7 } from "./v6ToV7";

type RawData = Record<string, unknown>;
type Migration = (data: RawData) => RawData;

const migrations: Record<number, Migration> = {
  1: migrateV1ToV2,
  2: migrateV2ToV3,
  3: migrateV3ToV4,
  4: migrateV4ToV5,
  5: migrateV5ToV6,
  6: migrateV6ToV7,
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
