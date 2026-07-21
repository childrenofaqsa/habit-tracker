---
name: coding-guidelines
description: Enforce simple coding guidelines for React 19, TypeScript, Zustand, Framer Motion, and shadcn/ui projects. Covers meaningful naming, no comments, strict file/function/folder size limits, and stack-specific best practices.
---

# Simple Coding Guidelines

## Core Principles

When writing, refactoring, or reviewing code, strictly adhere to the following guidelines:

### 1. No Comments
- **Never add comments in code.**
- The code must be entirely self-explanatory.
- If a piece of code feels complex enough to need a comment, refactor it to make the logic clear.
- Function and variable names should communicate intent without explanation.

### 2. Meaningful Naming
- **Variables, functions, components, buttons:** Use clear, descriptive, and meaningful names.
  - Event handlers: `handleClick`, `handleSubmit`, `onToggle`, `onChange`
  - Boolean values: `isLoading`, `isVisible`, `hasError`, `canDelete`
  - States: `status` (use discriminated unions: `'idle' | 'loading' | 'success' | 'error'`)
  - Zustand actions: `toggleSidebar`, `updateSettings`, `resetState`
- **Folders and Subfolders:** Directory names must accurately reflect their contents and purpose.
  - Feature folders: `features/auth/`, `features/habits/`, `features/analytics/`
  - Shared code: `common/`, `shared/`
  - Utilities: `lib/`, `utils/`, `helpers/`

### 3. File Size Limits
- **Absolute Maximum:** Never cross 350 lines in a single file.
- **Target Limit:** Try to accommodate all code within 300 lines.
- If a file grows beyond these limits, split the logic across multiple files and components.
- Consider splitting when: a component has 2+ responsibilities, file handles multiple concerns.

### 4. Function Size Limits
- **Maximum Length:** Each function must not cross 100 lines.
- Break larger functions down into smaller, composable helper functions.
- Aim for functions under 50 lines for readability; exceptions only for clear, linear operations.

### 5. Folder Size Limits
- **Maximum Files:** Each folder should not contain more than 11 files.
- If a folder exceeds this limit, categorize and group files into logical subfolders.
- Use feature-based structure: group by domain (e.g., `auth/`, `checkout/`) not by file type (e.g., all hooks together).

---

## React 19 & TypeScript Best Practices

### Component Structure
- **One component per file** unless components are tightly coupled (e.g., compound components).
- **Colocate tests and types** with components:
  ```
  features/auth/
    LoginForm/
      LoginForm.tsx
      LoginForm.test.tsx
      LoginForm.types.ts
      index.ts
  ```
- **Use feature-based folder structure** instead of type-based:
  - ✅ `features/habits/`, `features/analytics/`, `features/values/`
  - ❌ `components/`, `hooks/`, `utils/`

### TypeScript Strictness
- Use **strict tsconfig settings**: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitAny: true`.
- Prefer `type` over `interface` unless declaration merging is needed.
- Use **Discriminated Unions** for state variations: `status: 'idle' | 'loading' | 'success' | 'error'`.
- Never use `any`; use `unknown` if necessary, then narrow the type.
- Always run `tsc --noEmit` to verify full type safety before builds.

### React Hooks & Data Fetching
- **Strictly forbidden:** Using `useEffect` for data fetching. Use TanStack Query hooks instead.
- **Preferred:** Use `use` hook for reading contexts and promises conditionally.
- **Optimistic updates:** Use `useOptimistic` for immediate UI feedback during mutations.
- **Selectors only:** When accessing context or store state, use selector functions to extract only needed data.
- **Composition over props:** Prefer `children` prop and composition to avoid deep prop drilling.
- **Memoization:** Rely on React Compiler for automatic memoization; use `useMemo`/`useCallback` only for referential stability in heavy computations.

### React Compiler (React 19)
- React Compiler is **mandatory** in CI/CD pipeline.
- Configure ESLint rule: `'react-compiler/react-compiler': 'error'`.
- Fix any compiler bailouts immediately (treat as performance regressions).

---

## Zustand State Management (Client State Only)

### Store Organization
- **Use the slice pattern** for large stores—compose multiple slice creators into one.
- **Never mix concerns:** Client UI state in Zustand, server data in TanStack Query.
- **One store per domain:** `useAuthStore`, `useUIStore`, `useHabitsStore` (not one monolithic god store).
- **Selectors prevent re-renders:** Always use selectors; never subscribe to the entire store:
  ```tsx
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  ```
- **Use `useShallow` for objects:** When selecting object/array properties:
  ```tsx
  const { isSidebarOpen, toggleSidebar } = useUIStore(
    useShallow((state) => ({ 
      isSidebarOpen: state.isSidebarOpen, 
      toggleSidebar: state.toggleSidebar 
    }))
  );
  ```

### Actions & Mutations
- Keep actions synchronous when possible; batch state updates into single `set()` calls.
- Use **immer middleware** for mutable-style logic if readability improves (optional).
- Server data mutations: dispatch to TanStack Query, not Zustand.

---

## Framer Motion Performance (Animation Library)

### GPU-Accelerated Properties Only
- **Always animate only:** `transform` (x, y, scale, rotate), `opacity`.
- **Never animate:** `width`, `height`, `top`, `left`, `padding`, `margin` (triggers expensive layout recalculations).
- Use `motion.div` from `motion/react` with `LazyMotion` for code-splitting.

### High-Frequency Updates
- For scroll tracking, mouse following, or parallax: use `useMotionValue` + `useTransform` to bypass React's render cycle.
- Apply `{ passive: true }` flag to scroll/mouse listeners for browser optimization.
- Cap simultaneous animations: avoid animating 100+ elements at once; use virtual lists instead.

### Exit Animations & Layout
- Wrap animated lists with `AnimatePresence` and use `mode="wait"` to prevent layout thrashing.
- Use `viewport={{ once: true }}` to animate only once on scroll, not on every pass.
- For animations on load, set `initial={false}` to prevent animations before hydration.

### Reduced Motion Respect
- Always check `useReducedMotion()` and disable animations for users with motion preferences.
- Provide text-only fallbacks (e.g., toast) when reduced-motion is enabled.

---

## shadcn/ui Component Composition

### Strict Composition Rules
- **Items inside group containers:** Never render `SelectItem`, `TabsTrigger`, etc. directly; wrap in `SelectGroup`, `TabsList`.
- **Overlay components need titles:** `Dialog`, `Sheet`, `Drawer` must include a `DialogTitle` (use `className="sr-only"` if hidden).
- **Card structure:** Use full composition—don't dump all content into `CardContent`:
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
    <CardFooter>Footer</CardFooter>
  </Card>
  ```
- **Avatar fallbacks:** Always include `AvatarFallback` for image load failures.
- **Use component primitives:** Prefer `Alert` for callouts, `Separator` for dividers, `Badge` for styled labels.

### Accessibility (Inherited from Radix UI)
- Do not override default focus styles or remove outlines.
- Use `aria-describedby` for error messages; leverage built-in keyboard navigation.
- Test interactions with keyboard navigation and screen readers.

---

## File Organization (Feature-Based Structure)

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
  features/
    habits/
      components/
        HabitCard/
        HabitCard.tsx
        HabitCard.test.tsx
      hooks/
        useHabitActions.ts
      types/
        habit.types.ts
      api/
        habit.api.ts
    auth/
      components/
        LoginForm/
      hooks/
        useAuth.ts
      store/
        useAuthStore.ts
  common/
    components/
      ui/
        Button/
        Dialog/
    hooks/
      useResponsiveLayout.ts
      useGesture.ts
    utils/
      date.ts
      image.ts
  store/
    useAppStore.ts
    slices/
      habitsSlice.ts
      valuesSlice.ts
  lib/
    schema.ts
    constants.ts
  styles/
    globals.css
    tailwind.css
```

---

## Vite & Build Optimization

- Always run **`tsc --noEmit` in CI** to perform full-program type checking (Vite does not replace this).
- Use **Environment variables** with zod validation at runtime to prevent silent failures.
- Enable **ESLint flat config** with typescript-eslint for modern linting.
- Use **Vitest** for unit tests (shares Vite config, faster than Jest).
- Tree-shake unused code: avoid barrel exports (`index.ts` aggregating all exports) at scale; use direct imports instead.

---

## Code Review Checklist

Before marking code as complete:

- [ ] No comments—code is self-explanatory.
- [ ] All files ≤ 300 lines (max 350).
- [ ] All functions ≤ 100 lines (aim for ≤50).
- [ ] All folders ≤ 11 files.
- [ ] TypeScript strict mode passes (`tsc --noEmit`).
- [ ] React Compiler passes (no bailouts).
- [ ] Framer Motion uses only transform/opacity.
- [ ] shadcn components follow composition rules.
- [ ] Zustand selectors used (no store subscriptions).
- [ ] No useEffect for data fetching.
- [ ] Feature-based folder structure used.
- [ ] Meaningful, descriptive names throughout.
