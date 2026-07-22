import { STORAGE_KEYS } from "@/lib/constants";

export const APP_DATA_KEY = STORAGE_KEYS.appData;

export function premigrationKey(fromVersion: number): string {
  return `${STORAGE_KEYS.premigrationPrefix}${fromVersion}`;
}
