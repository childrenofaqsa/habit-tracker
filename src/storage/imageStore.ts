import { createStore, set, get, del, keys } from "idb-keyval";
import { IMAGE_STORE } from "@/lib/constants";

const imageDb = createStore(IMAGE_STORE.dbName, IMAGE_STORE.storeName);

export async function putImage(id: string, blob: Blob): Promise<void> {
  await set(id, blob, imageDb);
}

export async function getImage(id: string): Promise<Blob | undefined> {
  return get<Blob>(id, imageDb);
}

export async function deleteImage(id: string): Promise<void> {
  await del(id, imageDb);
}

export async function listImageIds(): Promise<string[]> {
  return (await keys(imageDb)) as string[];
}

const urlCache = new Map<string, string>();

export async function getImageUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getImage(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export function revokeImageUrl(id: string): void {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
}
