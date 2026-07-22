---
name: zustand-selector-safety
description: Prevent infinite re-render loops caused by Zustand selectors returning new array/object references. Use this skill when creating or reviewing Zustand selectors, when debugging "Maximum update depth exceeded" errors, or when adding new useAppStore subscriptions in components. Triggers on: Zustand selectors, useAppStore, useShallow, infinite loop, maximum update depth, selector memoization.
---

# Zustand Selector Safety

## The Rule

**Any Zustand selector that returns an array or object MUST be consumed with `useShallow`.**

```tsx
import { useShallow } from "zustand/react/shallow";

// CORRECT - stable reference via shallow comparison
const items = useAppStore(useShallow(selectItems));

// BROKEN - infinite loop, new reference every render
const items = useAppStore(selectItems);
```

## When useShallow Is Required

A selector needs `useShallow` if it does ANY of:
- `[...array].sort()` or `array.slice().sort()`
- `array.filter(fn)`
- `array.map(fn)`
- Returns an object literal `{ a, b, c }`
- Any operation that creates a new reference

## When useShallow Is NOT Needed

- Selector returns a **primitive**: `string`, `number`, `boolean`, `undefined`, `null`
- Selector returns a **direct store reference** without transformation: `s.settings.theme`

## Why It Breaks

1. Zustand uses `Object.is` to compare previous and next selector results
2. `Object.is([1,2], [1,2])` → `false` (different references)
3. React thinks state changed → re-render → selector returns ANOTHER new array → infinite loop
4. After ~50 cycles: `Maximum update depth exceeded`

## Pattern For New Selectors

```tsx
// In selectors.ts - define the selector
export const selectMyItems = (s: StoreState) =>
  s.items.filter(i => i.active).sort((a, b) => a.order - b.order);

// In component - ALWAYS wrap with useShallow for array/object returns
const items = useAppStore(useShallow(selectMyItems));
```

## Curried Selectors

```tsx
// Curried selector (returns new array)
export const selectItemsByGroup = (groupId: string) => (s: StoreState) =>
  s.items.filter(i => i.groupId === groupId).sort((a, b) => a.order - b.order);

// Component usage - useShallow wraps the inner selector
const items = useAppStore(useShallow(selectItemsByGroup(groupId)));
```

## Testing Selector Stability

Always add a stability test for new array/object selectors:

```tsx
import { renderHook } from "@testing-library/react";
import { useShallow } from "zustand/react/shallow";

it("returns stable reference with useShallow", () => {
  const { result, rerender } = renderHook(() =>
    useAppStore(useShallow(selectMyItems)),
  );
  const first = result.current;
  rerender();
  expect(result.current).toBe(first); // same reference = no re-render
});
```

## Common Mistakes

1. **Mocking child components hides the bug** — if a parent's test mocks children, those children's broken selectors won't trigger in tests
2. **Fixing only the top component** — the bug propagates through the tree; ALL components with array/object selectors need the fix
3. **Assuming primitives are safe when they're wrapped in objects** — `selectSummary` returning `{ done: 3, total: 5 }` is NOT safe

## Debugging Checklist

When you see "Maximum update depth exceeded" from `forceStoreRerender`:

1. Find the component in the stack trace
2. Look for `useAppStore(selectX)` calls without `useShallow`
3. Check if `selectX` returns an array or object
4. Wrap with `useShallow`
5. Check ALL child components too — not just the one in the stack trace
