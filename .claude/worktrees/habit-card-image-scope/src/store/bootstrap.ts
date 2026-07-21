import { loadAppData, type LoadStatus } from "@/storage/loadAppData";
import { useAppStore } from "@/store/useAppStore";

export async function bootstrapStore(): Promise<LoadStatus> {
  const { data, status } = await loadAppData();
  useAppStore.getState().hydrate(data);
  return status;
}
