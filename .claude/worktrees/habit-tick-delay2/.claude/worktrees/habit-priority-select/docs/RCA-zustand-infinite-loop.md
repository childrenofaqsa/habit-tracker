# Root Cause Analysis: Zustand Selector Infinite Loop

**Date:** 2025-07-24  
**Severity:** P0 — Application crash at startup  
**Error:** `Maximum update depth exceeded`  
**Stack:** React 19.2.6, Zustand 5.0.14, Vite 8.0.14, React Compiler (babel-plugin)

---

## 1. Symptom

The app crashed immediately on boot with:

```
Error: Maximum update depth exceeded. This can happen when a component repeatedly
calls setState inside componentWillUpdate or componentDidUpdate. React limits the
number of nested updates to prevent infinite loops.
```

Stack trace pointed to `forceStoreRerender` → `updateStoreInstance` inside React DOM's `useSyncExternalStore` implementation.

---

## 2. Root Cause

### The Pattern (Broken)

```tsx
// selector returns a NEW array reference every call
const selectTimeframes = (s: StoreState) =>
  [...s.timeframes].sort((a, b) => a.order - b.order);

// component subscribes with default Object.is equality
const timeframes = useAppStore(selectTimeframes);
```

### Why It Loops

1. Component renders → calls `useAppStore(selectTimeframes)`
2. Zustand calls `selectTimeframes(state)` → returns **new array** (spread + sort)
3. React's `useSyncExternalStore` stores this as the "snapshot"
4. On the next synchronous check, Zustand calls `selectTimeframes(state)` again
5. New call returns **another new array** (different reference, same content)
6. `Object.is(prevSnapshot, nextSnapshot)` → `false` (different references)
7. React thinks state changed → triggers re-render → goto step 1
8. After ~50 iterations, React throws `Maximum update depth exceeded`

### Why Spread/Sort/Filter Creates This Bug

All of these create new references on every invocation:
- `[...array].sort()` — spread creates new array
- `array.filter(fn)` — filter always returns new array
- `{ ...obj, computed: value }` — object spread creates new reference
- `array.map(fn)` — map always returns new array

### Affected Selectors

| Selector | Operation | Returns |
|----------|-----------|---------|
| `selectTimeframes` | `[...s.timeframes].sort()` | New array |
| `selectCategories(id)` | `.filter().sort()` | New array |
| `selectHabits(id)` | `.filter().sort()` | New array |
| `selectValues` | `[...s.values].sort()` | New array |
| `selectTodaySummary` | Object literal `{ done, total, ... }` | New object |

### Safe Selectors (No Fix Needed)

| Selector | Returns | Why Safe |
|----------|---------|----------|
| `selectHabitStatusToday` | `string \| undefined` | Primitive — `Object.is` works |
| `selectStreak` | `number` | Primitive |
| `selectValueEntryToday` | `string \| undefined` | Primitive |

---

## 3. The Fix

### Solution: `useShallow` from `zustand/react/shallow`

```tsx
import { useShallow } from "zustand/react/shallow";

// Wraps the selector with shallow equality comparison
const timeframes = useAppStore(useShallow(selectTimeframes));
```

`useShallow` performs element-by-element comparison:
- For arrays: compares length + each element by `Object.is`
- For objects: compares keys + each value by `Object.is`

Since the *contents* of the array don't change between calls (only the container reference), `useShallow` correctly determines nothing changed and prevents the re-render.

### Files Fixed

| File | Selector | 
|------|----------|
| `src/views/DailyView/DailyView.tsx` | `selectTimeframes`, `selectTodaySummary` |
| `src/features/habits/components/TimeframeSection.tsx` | `selectCategories(id)` |
| `src/features/habits/components/HabitRow.tsx` | `selectHabits(id)` |
| `src/views/ValuesView/ValuesView.tsx` | `selectValues` |
| `src/features/analytics/components/SummaryBanner.tsx` | `selectTodaySummary` |
| `src/features/habits/components/HabitCard/HabitDetailSheet.tsx` | `selectValues` |

---

## 4. Why The Unit Test Didn't Catch It

### The Test

```tsx
vi.mock("@/features/habits/components/TimeframeSection", () => ({
  TimeframeSection: ({ timeframe }) => (
    <div data-testid="timeframe-section">{timeframe.name}</div>
  ),
}));
```

The `DailyView.test.tsx` mocked `TimeframeSection`, so the component tree stopped at DailyView. After fixing DailyView's own selectors, the test passed — but the **child components** (TimeframeSection → HabitRow) still had uncached selectors that only manifested at runtime when the full tree rendered.

### Lesson Learned

Mocking child components in unit tests creates a blind spot for render-loop bugs that propagate through the tree. The first fix resolved DailyView but left TimeframeSection (line 28) and HabitRow (line 12) broken.

### Regression Test Added

`src/store/selectorStability.test.ts` directly tests that:
1. Each selector + `useShallow` produces a **stable reference** across re-renders
2. The raw selector produces **unstable references** (documenting the dangerous behavior)
3. Unrelated state changes don't trigger re-renders for `useShallow`-wrapped selectors

---

## 5. Alternative Solutions Considered

| Approach | Pros | Cons |
|----------|------|------|
| **`useShallow` at call site** (chosen) | No selector changes, minimal diff | Every call site must remember to wrap |
| Memoize selectors with `createSelector` (reselect) | Automatic caching | Extra dependency, more complex selector code |
| Store pre-sorted arrays in state | No runtime sorting needed | Mutations must maintain sort order |
| `subscribeWithSelector` middleware | Store-level shallow compare | Affects ALL subscriptions globally |

### Why `useShallow` Was Chosen

- Smallest change surface (6 files, 1 import + 1 wrapper each)
- No new dependencies (ships with `zustand/react/shallow`)
- Explicit about which selectors need shallow comparison
- No risk of stale cache issues that `createSelector` can have with curried selectors

---

## 6. Prevention Rules

1. **Any selector that returns an array or object MUST be consumed with `useShallow`**
2. **Selectors returning primitives (string, number, boolean, undefined) are safe without `useShallow`**
3. **Never mock child components in tests that verify render stability** — the bug propagates through the tree
4. **Add selector stability tests** when introducing new array/object selectors
5. **Consider an ESLint rule** that flags `useAppStore(selectX)` where `selectX` returns non-primitive types without `useShallow`

---

## 7. Timeline

| Step | What Happened |
|------|--------------|
| Initial report | App crashes with "Maximum update depth exceeded" |
| First fix | Added `useShallow` to DailyView's `selectTimeframes` and `selectTodaySummary` |
| Bug persists | Error now at `TimeframeSection.tsx:28` — child components still broken |
| RCA | Identified all 5 array/object selectors across 6 component files |
| Full fix | Applied `useShallow` to all 6 files |
| Verification | 117 unit tests pass, 3 E2E tests pass, app boots successfully |
| Regression test | `selectorStability.test.ts` — 7 tests proving the pattern works |

---

## 8. Metrics

- **Tests before:** 0
- **Tests after:** 117 unit + 12 E2E = 129 total
- **Files changed for fix:** 6
- **Time to full resolution:** ~2 hours (including test infrastructure setup)
- **Risk of recurrence:** Medium — new selectors could reintroduce the pattern. Mitigated by regression tests and this document.
