# Enhanced Plan: Offline-First Habit & Routine Tracker

***

## 0. TECH STACK & ARCHITECTURE (NEW)
Always use latest package version of all npm packages

### Core Stack

* **React 19.x + Vite 8.x** — fast HMR dev, optimized production builds, tree-shaking.
* **TypeScript** (strongly recommended) — type-safe `APP_DATA` schema across views.
* **Tailwind CSS** — utility styling (already implied in original).
* **shadcn/ui** — accessible, themeable Radix-based components (Dialog, Sheet, DropdownMenu, Tooltip, Accordion, Toast, Button, Input, Tabs).
* **Zustand** — state managemet solution - single global store for `APP_DATA`, with persistent middleware bridging to **localForage** (IndexedDB).
* **localForage** — primary storage (IndexedDB → WebSQL → LocalStorage fallback chain).
* **dnd-kit** — touch-friendly drag & drop (works inside `overflow-x-auto`, supports horizontal + vertical sortable contexts).
* **Recharts** or **visx** — minimalist analytics bar charts.
* **vite-plugin-pwa (Workbox)** — service worker for fully offline install + asset precache (NOT used as a "lightweight PWA experience" — the SW only serves shell + assets; all data stays local).
* **idb-keyval** (optional) — for binary blob storage (habit images) separate from JSON state.

### Future Native Wrap

* **Tauri 2** for desktop + iOS + Android (replaces Capacitor mention in original).
  * Rust backend, smaller bundle than Electron/Capacitor.
  * Use `@tauri-apps/api` only behind a `runtime.ts` abstraction so the **same codebase** runs in browser and native.
  * File system, notifications, secure storage available natively without rewriting.

### Folder Structure

```
src/
  app/
    App.tsx
    routes.tsx
  views/
    DailyView/
    ValuesView/
    TodoView/
    AnalyticsView/
  components/
    ui/                  # shadcn generated components
    HabitCard/
    EditModeBanner/
    InstallPrompt/
    BackupSettings/
    HistoryMatrix/
  store/
    useAppStore.ts       # Zustand root
    slices/
      habitsSlice.ts
      valuesSlice.ts
      todosSlice.ts
      historySlice.ts
      settingsSlice.ts
  storage/
    localForageAdapter.ts
    imageStore.ts        # blob storage for habit icons
    migrations/
    backup.ts            # export/import
  runtime/
    platform.ts          # detects browser | pwa | tauri | ios | android
    fs.ts                # unified read/write (browser File API <-> Tauri FS)
  hooks/
    useInstallPrompt.ts
    useEditMode.ts
    useResponsiveLayout.ts
    useGesture.ts
  lib/
    schema.ts            # zod schema for APP_DATA validation
    date.ts
    image.ts             # compression util
  styles/
    globals.css
```

***

## 1. GLOBAL LAYOUT & NAVIGATION (Enhanced)

### Top Header

* Left: Current view name (`<h1>` with `text-lg md:text-xl lg:text-2xl`).
* Right (shadcn components):
  * **Edit Mode toggle** — shadcn `Switch` + label, persists in `settings.editMode`.
  * **Backup & Restore** — shadcn `DropdownMenu` opening `Sheet` (mobile) or `Dialog` (desktop).
  * **Install button (NEW)** — only appears when app is **not installed** AND `beforeinstallprompt` is available (or iOS Safari heuristic shows Add-to-Home-Screen instructions).

### Bottom Navigation

* Sticky bottom tab bar (mobile/tablet).
* **Desktop (≥ lg)**: collapses bottom bar and shows a **left sidebar** instead (better desktop UX, no wasted space) — controlled via `useResponsiveLayout`.
* Four tabs: Daily · Values · To-Do · Analytics, with shadcn `Tabs`-style active indicator and a subtle motion underline.

### Responsiveness Breakpoints (NEW — explicit)

| Breakpoint    | Target                             | Layout                                                                                           |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `< 640px`     | Mobile portrait                    | Single column, bottom nav, compact cards `w-20 h-20`                                             |
| `640–1024px`  | Tablet / iPad portrait & landscape | Multi-column categories on landscape, bottom nav, `w-24 h-24` cards                              |
| `1024–1440px` | Small desktop                      | Left sidebar nav, 2-column timeframe sections, `w-28 h-28` cards                                 |
| `≥ 1440px`    | Large desktop                      | Centered max-width container (`max-w-7xl`), 3-column timeframes optional, wider analytics matrix |

### Touch & Input Safety

* Min touch target: `44×44px` (iOS HIG) — enforced via Tailwind utility class `touch-target`.
* `viewport-fit=cover` + `env(safe-area-inset-*)` padding for iOS notches.
* `visualViewport` listener to scroll focused input into view above the keyboard.

***

## 2. INSTALL AS WEB APP BUTTON (NEW SECTION)

### Detection Logic (`useInstallPrompt` hook)

```
isInstalled =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true ||      // iOS
  isRunningInTauri()                            // native wrapper
```

### Behavior

* **If installed (PWA standalone, iOS home-screen, or Tauri)** → Hide install button entirely.
* **If browser tab AND installable (Chrome/Edge/Android)** → Show shadcn `Button` "Install App" in the header → fires saved `beforeinstallprompt`.
* **If iOS Safari (not installable via prompt)** → Button opens a shadcn `Dialog` with illustrated instructions: *Tap Share → Add to Home Screen*.
* **If desktop Safari/Firefox (no install API)** → Show instructions dialog with browser-specific steps.
* After successful install → fire `appinstalled` listener → store `settings.installedAt` so the button never re-appears.

### Service Worker Config (vite-plugin-pwa)

* `registerType: 'autoUpdate'`
* `workbox.globPatterns`: precache all JS/CSS/fonts/icons.
* `runtimeCaching`: none for user data (data is IndexedDB, not network).
* Manifest: `display: 'standalone'`, theme/background colors, full icon set (192, 512, maskable, apple-touch).

***

## 3. DAILY VIEW (Enhanced — all original rules kept)

* Same structure: Timeframes → Categories → Habits in single horizontal row with `flex-row overflow-x-auto`.
* **Habit Card** stays fixed size; rendered by `<HabitCard />` using shadcn `Card` primitive with strict `aspect-square` + Tailwind size classes per breakpoint.
* **Detail view** uses shadcn `Sheet` (bottom sheet on mobile, side sheet on desktop) instead of ad-hoc tooltip — better accessibility.
* **Done state**: solid `bg-green-500`, white `<Check />` lucide icon.
* **Missed state**: solid `bg-red-500`, white `<X />` lucide icon.
* **Gesture handling** via a unified `useGesture` hook:
  * tap → toggle done
  * long-press (≥500ms) → toggle missed
  * tap on text region → open detail sheet (event stops propagation)
  * prevent gesture firing while Edit Mode is on
* **Edit Mode** uses **dnd-kit** `SortableContext`:
  * `horizontalListSortingStrategy` for habits inside a category.
  * `verticalListSortingStrategy` for categories inside a timeframe.
  * Drag handles only render when `editMode === true`.
* **Image upload pipeline** (`lib/image.ts`):
  1. Read file → `createImageBitmap`.
  2. Resize to max 128×128 (cover).
  3. Encode as WebP (`canvas.toBlob('image/webp', 0.85)`).
  4. Store blob in `imageStore` (idb-keyval) keyed by `habit.id`; reference via blob URL on load.
  5. Avoid Base64 in JSON; backup serializes blobs separately (see §7).

***

## 4. VALUES VIEW (Enhanced)

All original rules kept. Enhancements:

* Numeric counter uses shadcn `Input type="number"` + +/− buttons (large touch targets).
* Textbox log uses shadcn `Textarea` inside a `Sheet`.
* Linked-habit sync triggers a shadcn `Dialog` quick-input modal.
* Reverting a linked habit emits a Zustand action that only flips the `syncedToday` flag — historical entries untouched.

***

## 5. TO-DO VIEW (Enhanced)

* Sections use shadcn `Accordion` (animated expand/collapse).
* "Today / Overdue" computed via a memoized selector in Zustand (`selectOverdueTodos`).
* Date picker: shadcn `Popover` + `Calendar`.
* Swipe-to-complete on mobile (optional polish, via `useGesture`).

***

## 6. ANALYTICS VIEW (Enhanced)

* **Today summary banner**: shadcn `Card` with 4 stats; on desktop expands into a 4-column grid with sparkline mini-charts.
* **180-day history matrix**:
  * Virtualized horizontal scroll using `@tanstack/react-virtual` (avoids rendering 180 columns at once — critical for performance on mobile).
  * First column sticky (`position: sticky; left: 0`).
  * Strict reverse-chronological order: `today | yesterday | …`.
  * Text-log cells show a shadcn `Tooltip` icon → clicking opens a `Dialog` with full content.
* **Completion chart**: Recharts `BarChart`, responsive container, minimalist (no grid, small ticks, theme-aware colors).
* **Tablet/Desktop**: matrix expands to wider cells; on desktop, optional toggle to view 30/90/180 days.

***

## 7. BACKUP & RESTORE — EXPORT/IMPORT WITH FILES (Enhanced — addresses your new requirement)

### Why this matters

Original plan only exported JSON. Habit images are now **blobs** in IndexedDB, so a JSON-only backup would lose images when switching devices. The new system bundles everything.

### Export ("Backup Data")

Produces a single **`.zip`** (using `jszip`) named:
`daily_routine_backup_[YYYY-MM-DD_HHmm].zip`

Contents:

```
/manifest.json          # { appVersion, schemaVersion, exportedAt, deviceLabel }
/data.json              # full APP_DATA (without inline image data)
/images/
  <habitId>.webp        # one file per habit image
  <habitId>.webp
/checksum.txt           # SHA-256 of data.json (integrity verification)
```

* Tauri runtime: writes via `@tauri-apps/plugin-fs` → native save dialog.
* Browser runtime: uses `showSaveFilePicker` (File System Access API) where supported, fallback to anchor download.
* Optional: **plain JSON export** still available as a "Lite backup (no images)" choice for quick transfers.

### Import ("Restore Data")

* Accepts `.zip` (full) **or** `.json` (legacy/lite).
* Pipeline:
  1. Parse archive.
  2. Validate `manifest.json` (zod schema).
  3. Verify checksum of `data.json`.
  4. Run migrations if `schemaVersion` is older.
  5. **Restore mode picker** (shadcn `RadioGroup` in a Dialog):
     * **Replace all** (with explicit "type RESTORE to confirm" guard).
     * **Merge** (preserve existing user data; newer items by `updatedAt` win; never delete history).
  6. Write blobs back into `imageStore`, then commit JSON to Zustand → localForage in a single transaction.
  7. On any failure → **rollback**, existing data preserved, toast shows precise error.

### Cross-device portability flow (NEW)

1. Old device → "Backup Data" → save `.zip` to cloud drive / AirDrop / email.
2. New device → install app (via Install button) → "Restore Data" → pick `.zip` → Merge or Replace.
3. All habits, history, values, todos, settings, and **images** appear identical.

***

## 8. DATABASE & STORAGE (Enhanced, all original safety rules kept)

* Zustand store wraps localForage via `persist` middleware with custom storage adapter.
* `APP_DATA` schema validated via **zod** on load — corrupt fields isolated, not wiped.
* Migrations live in `storage/migrations/` as ordered functions (`v1→v2`, `v2→v3`); run inside a try/catch with snapshot-before-migrate (kept for 7 days as `APP_DATA_PREMIGRATION_v{n}`).
* 180-day retention runs as a background task on app start, only on the `history` slice.
* Storage keys are **frozen constants** in `storage/keys.ts` — never renamed.

***

## 9. UI / UX QUALITY (Enhanced)

* shadcn theming: light/dark/system via `next-themes`-style provider, persisted in `settings.theme`.
* Framer Motion (optional, lightweight) for accordion + sheet transitions if shadcn defaults feel insufficient.
* Skeleton loaders (shadcn `Skeleton`) during initial localForage hydration to avoid layout flash.
* Toast feedback (shadcn `Sonner`) for all backup/restore/sync actions.
* Reduced-motion respect: honors `prefers-reduced-motion`.

***

## 10. RUNTIME ABSTRACTION (NEW — enables Tauri 2 wrap without rewrite)

A single `runtime/platform.ts` exposes:

```ts
export const platform = {
  isTauri: boolean,
  isPWAInstalled: boolean,
  isIOS: boolean,
  isAndroid: boolean,
  saveFile(name, blob): Promise<void>,
  openFile(accept): Promise<File>,
  notify(title, body): Promise<void>,
}
```

* Browser implementation uses File System Access API + Notification API.
* Tauri implementation uses `@tauri-apps/plugin-fs` + `plugin-notification`.
* Views consume only `platform.*` — switching to Tauri 2 requires only swapping the implementation file.

***

## 11. INITIAL IMPLEMENTATION ORDER (suggested)

1. Scaffold Vite + React + TS + Tailwind + shadcn init.
2. Set up Zustand store + localForage adapter + zod schema + migrations skeleton.
3. Build `runtime/platform.ts` (browser impl only for now).
4. Layout shell: header, bottom nav, responsive sidebar.
5. DailyView with HabitCard, gestures, image pipeline.
6. Edit Mode + dnd-kit sorting.
7. ValuesView + linking logic.
8. TodoView + overdue rollover.
9. AnalyticsView + virtualized matrix + chart.
10. Backup/Restore (.zip with images).
11. PWA manifest + service worker + Install prompt.
12. Polish: themes, toasts, skeletons, reduced motion.
13. Later: add Tauri 2 wrapper, swap platform impl.

***

