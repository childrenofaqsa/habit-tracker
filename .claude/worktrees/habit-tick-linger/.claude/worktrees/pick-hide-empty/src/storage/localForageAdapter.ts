import localforage from "localforage";

const store = localforage.createInstance({
  name: "habit-tracker",
  storeName: "app_data",
  description: "Offline habit tracker root storage",
  driver: [
    localforage.INDEXEDDB,
    localforage.WEBSQL,
    localforage.LOCALSTORAGE,
  ],
});

export async function readRaw<T>(key: string): Promise<T | null> {
  return store.getItem<T>(key);
}

export async function writeRaw<T>(key: string, value: T): Promise<void> {
  await store.setItem(key, value);
}

export async function removeRaw(key: string): Promise<void> {
  await store.removeItem(key);
}
