import type { AppSlice, SettingsActions } from "@/store/types";

export const createSettingsSlice: AppSlice<SettingsActions> = (set) => ({
  setEditMode: (value) =>
    set((draft) => {
      draft.settings.editMode = value;
    }),

  toggleEditMode: () =>
    set((draft) => {
      draft.settings.editMode = !draft.settings.editMode;
    }),

  setTheme: (theme) =>
    set((draft) => {
      draft.settings.theme = theme;
    }),

  updateMotion: (patch) =>
    set((draft) => {
      Object.assign(draft.settings.motion, patch);
    }),

  setInstalledAt: (timestamp) =>
    set((draft) => {
      draft.settings.installedAt = timestamp;
    }),

  setDeviceLabel: (label) =>
    set((draft) => {
      draft.settings.deviceLabel = label;
    }),
});
