export const SCHEMA_VERSION = 6;

export const STORAGE_KEYS = {
  appData: "APP_DATA",
  premigrationPrefix: "APP_DATA_PREMIGRATION_v",
} as const;

export const IMAGE_STORE = {
  dbName: "habit-tracker-images",
  storeName: "habit-images",
} as const;

export const HISTORY_RETENTION_DAYS = 180;
export const ANALYTICS_MATRIX_DAYS = 180;
export const MAX_IMAGE_SIZE = 128;
export const LONG_PRESS_MS = 500;

export const VIEW_IDS = ["daily", "values", "todo", "analytics"] as const;
export type ViewId = (typeof VIEW_IDS)[number];

export const MOTION_INTENSITIES = ["minimal", "standard", "playful"] as const;
export type MotionIntensity = (typeof MOTION_INTENSITIES)[number];

export const DEFAULT_TIMEFRAMES = ["Morning", "Evening", "Night"] as const;
