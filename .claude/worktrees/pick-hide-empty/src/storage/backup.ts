import JSZip from "jszip";
import { z } from "zod";
import { appDataSchema, type AppData } from "@/lib/schema";
import { sha256Hex } from "@/lib/checksum";
import { backupTimestamp } from "@/lib/date";
import { SCHEMA_VERSION } from "@/lib/constants";
import { runMigrations } from "@/storage/migrations";
import { getImage } from "@/storage/imageStore";

const manifestSchema = z.object({
  appVersion: z.string(),
  schemaVersion: z.number(),
  exportedAt: z.number(),
  deviceLabel: z.string(),
});

export type ParsedBackup = { data: AppData; images: Map<string, Blob> };

export function backupZipName(): string {
  return `daily_routine_backup_${backupTimestamp()}.zip`;
}

export function backupJsonName(): string {
  return `daily_routine_backup_${backupTimestamp()}.json`;
}

export async function buildBackupZip(data: AppData): Promise<Blob> {
  const zip = new JSZip();
  const dataJson = JSON.stringify(data);
  zip.file("data.json", dataJson);
  zip.file(
    "manifest.json",
    JSON.stringify({
      appVersion: "1.0.0",
      schemaVersion: data.version,
      exportedAt: Date.now(),
      deviceLabel: data.settings.deviceLabel,
    }),
  );
  zip.file("checksum.txt", await sha256Hex(dataJson));

  const images = zip.folder("images");
  if (images) {
    for (const habit of data.habits) {
      if (!habit.imageId) continue;
      const blob = await getImage(habit.imageId);
      if (blob) images.file(`${habit.imageId}.webp`, blob);
    }
  }

  return zip.generateAsync({ type: "blob" });
}

export function buildBackupJson(data: AppData): Blob {
  return new Blob([JSON.stringify(data)], { type: "application/json" });
}

function migrateAndParse(raw: unknown): Promise<AppData> {
  return runMigrations({ ...(raw as Record<string, unknown>) }).then((migrated) =>
    appDataSchema.parse(migrated),
  );
}

export async function parseBackup(file: File): Promise<ParsedBackup> {
  if (file.name.toLowerCase().endsWith(".json")) {
    const data = await migrateAndParse(JSON.parse(await file.text()));
    return { data, images: new Map() };
  }

  const zip = await JSZip.loadAsync(file);
  const dataFile = zip.file("data.json");
  if (!dataFile) throw new Error("Backup is missing data.json");
  const dataJson = await dataFile.async("string");

  const checksumFile = zip.file("checksum.txt");
  if (checksumFile) {
    const expected = (await checksumFile.async("string")).trim();
    const actual = await sha256Hex(dataJson);
    if (expected !== actual) throw new Error("Backup integrity check failed");
  }

  const manifestFile = zip.file("manifest.json");
  if (manifestFile) {
    manifestSchema.parse(JSON.parse(await manifestFile.async("string")));
  }

  const data = await migrateAndParse(JSON.parse(dataJson));
  if (data.version > SCHEMA_VERSION) {
    throw new Error("Backup is from a newer app version");
  }

  const images = new Map<string, Blob>();
  for (const habit of data.habits) {
    if (!habit.imageId) continue;
    const entry = zip.file(`images/${habit.imageId}.webp`);
    if (entry) images.set(habit.imageId, await entry.async("blob"));
  }

  return { data, images };
}
