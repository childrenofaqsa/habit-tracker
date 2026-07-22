import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { AppData } from "@/lib/schema";
import { emptyAppData } from "@/lib/schema";
import type { StoreState } from "@/store/types";

export function renderWithStore(
  ui: ReactElement,
  { initialData, ...options }: RenderOptions & { initialData?: Partial<AppData> } = {},
) {
  const data = { ...emptyAppData(), ...initialData };
  useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

  const result = render(ui, options);
  return {
    ...result,
    store: useAppStore,
  };
}

export function setStoreState(data: Partial<AppData>) {
  useAppStore.setState({ ...emptyAppData(), ...data, hydrated: true } as Partial<StoreState>);
}
