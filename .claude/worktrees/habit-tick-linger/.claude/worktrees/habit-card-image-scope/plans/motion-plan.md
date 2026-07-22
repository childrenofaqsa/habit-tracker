# Comprehensive Micro-Interaction & Scroll Animation System

## Expanded Tech Additions

| Library                                                        | Role                                                                           | Why it wins                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Framer Motion v11**                                          | Springs, gestures, layout, exit, `useScroll`, `useTransform`, `useMotionValue` | Industry standard for React motion                                   |
| **Lenis** (`@studio-freight/lenis`)                            | Smooth scroll engine (RAF-based)                                               | Used by every Awwwards site; \~3 KB; works with native scrollbars    |
| **GSAP** + **ScrollTrigger** *(optional, only desktop bundle)* | Complex scroll choreography                                                    | Lazy-load only on desktop where needed; not shipped to mobile bundle |
| **`@use-gesture/react`**                                       | Pointer, drag, pinch, wheel, swipe primitives                                  | Pairs perfectly with Framer Motion                                   |
| **`react-aria` / `@radix-ui` (already via shadcn)**            | Accessible focus & keyboard handling                                           | Free with shadcn                                                     |
| **`canvas-confetti`**                                          | Celebration bursts                                                             | Already planned                                                      |
| **`motion-number`** or custom CountUp                          | Animated digits / flip clock                                                   | Premium feel for streaks & stats                                     |
| **View Transitions API** (native)                              | Cross-route morphs (Chrome/Edge/Safari TP)                                     | Progressive enhancement; no JS cost                                  |
| **`tailwindcss-motion`** *(optional)*                          | Pre-baked motion utilities                                                     | Saves writing keyframes; nice DX                                     |

> Total added bundle for the recommended core (Framer + Lenis + use-gesture + confetti): **\~55 KB gzip**. GSAP is opt-in for desktop only.

## The Full Catalog of Micro-Interactions to Add

### A. Pointer-Aware Effects (desktop polish)

1. **Magnetic buttons** — primary CTAs subtly pull toward the cursor within a 40px radius (Framer Motion + `useMotionValue`).
2. **Spotlight gradient** — cards have a soft radial gradient that follows the mouse, revealing border glow (CSS custom properties updated on `pointermove`).
3. **3D tilt on hover** — habit cards and analytics tiles tilt ±6° based on cursor position (perspective transform).
4. **Cursor companion** — a tiny dot that follows the cursor and scales up on interactive elements (desktop only, toggleable).
5. **Hover-reveal density** — secondary info (last-completed date on a habit) fades in on hover after 250ms delay.
6. **Gradient border trace** — Edit Mode active controls have an animated conic-gradient border (CSS `@property` + rotation).

### B. Press & Tap Feedback (mobile + desktop)

7. **Ripple from touch point** — Material-style ripple originating at the exact tap coordinates (one-shot canvas or pseudo-element).
8. **Spring press** — `scale 1 → 0.94 → 1` with spring overshoot, not linear ease.
9. **Haptic pairing** — `navigator.vibrate(8)` on tap, `vibrate([12, 40, 12])` on long-press complete (Tauri native equivalent later).
10. **Double-tap heart-burst** — double-tap a habit card to immediately mark done with a burst animation (shortcut gesture).

### C. State Transitions

11. **Morphing icons** — checkmark draws via `stroke-dashoffset`; X draws after the check fades; menu↔close icon morphs via SVG path interpolation.
12. **Color cross-fade** — Done/Missed background uses `background-color` transition with a 220ms spring, not instant swap.
13. **Optimistic shimmer** — while a write is pending, a faint shimmer overlay plays; removed when persisted.
14. **Loading button** — button label slides up out, spinner slides in; on success, spinner morphs to check, then back to label.

### D. Scroll Animations (the big new category)

15. **Smooth scroll baseline** — Lenis everywhere for buttery, momentum-aware scroll.
16. **Scroll-triggered fade-up** — sections, cards, list items enter with `opacity 0 → 1` + `y: 20 → 0` when crossing the viewport (IntersectionObserver, one-shot).
17. **Staggered list reveal** — habit categories cascade in with 40ms stagger when scrolling into view.
18. **Parallax headers** — timeframe titles drift slower than their content (`useScroll` + `useTransform`).
19. **Sticky section progress** — when a timeframe section is sticky-pinned, a tiny progress bar fills as the user scrolls through its habits.
20. **Scroll-velocity-reactive subtle skew** — fast scrolling adds ±1.5° skew to cards (Active Theory–style); subtle, capped, decays smoothly. Auto-disabled on `reduceMotion`.
21. **Scroll-snap habit rows** — horizontal habit rows snap to card boundaries with elastic resistance at edges.
22. **Pull-to-refresh** with elastic rubber-band, custom indicator that morphs into a checkmark on release.
23. **Edge-glow on overscroll** — when user scrolls past the boundary, edges show a soft glow proportional to overscroll distance.
24. **Scroll progress bar** — thin gradient bar at top of Analytics view showing read progress through 180-day history.
25. **Scrollytelling Analytics intro** *(optional)* — when first opening Analytics, summary banner numbers count up *as you scroll past them*.
26. **Reveal-on-scroll for chart bars** — bars grow only when their column enters the viewport (not all at once on mount).

### E. Layout & Shared-Element Transitions

27. **`layoutId` shared element** — bottom-nav active pill, Edit Mode jiggle handles, modal open-from-card transitions.
28. **View Transitions API** for route changes — Daily ↔ Analytics morph smoothly (progressive enhancement).
29. **FLIP animations** for list reordering after drag — Framer's `layout` prop handles this automatically; ensure it's enabled.
30. **Modal-from-element** — when tapping a habit's text area, the detail sheet visually springs *from* the card (shared `layoutId`).

### F. Number, Text & Data Animations

31. **Count-up metrics** — Today's "73% complete" counts from 0 → 73 with easing on first render and on every change.
32. **Flip-clock digits** for streak counter (e.g., "🔥 7 day streak" — digits flip when streak increments).
33. **Text scramble** for milestone reveals ("MILESTONE UNLOCKED" scrambles in).
34. **Animated diff** — when a value tracker changes, the old number slides up/out and the new slides in.

### G. Idle & Ambient Motion

35. **Breathing glow** on the current timeframe card (e.g., Morning glows gently from 6am–12pm).
36. **Drifting gradient backgrounds** for empty states (Daily view with no habits yet shows a slow gradient drift).
37. **Floating illustrations** in empty states — illustration bobs `y: 0 → -4 → 0` over 4s.
38. **Today column pulse** in the Analytics matrix — gentle 3s glow loop so eyes find it immediately.

### H. Celebration Tiers

39. **Tier 1 — Habit done**: card flash + check draw + 8-particle micro-confetti from card center.
40. **Tier 2 — Timeframe complete**: timeframe header glow-success + toast "Morning complete ✨".
41. **Tier 3 — All-day complete**: full-screen confetti (40 particles) + spring-in modal "Day complete!".
42. **Tier 4 — Streak milestone (7/30/100)**: cinematic burst + flip-clock streak counter + shareable badge.
43. **Negative celebrations** — gentle wiggle + soft red glow for Missed, never punishing.

### I. Gesture Richness

44. **Swipe-to-complete** on To-Do items (right swipe = done, left swipe = delete, both with elastic resistance and color reveal underneath).
45. **Long-press radial menu** on habit cards in Edit Mode — radial buttons fan out for Rename / Replace Image / Delete.
46. **Pinch-to-zoom** Analytics matrix for tablet/desktop.
47. **Two-finger swipe** between tabs on mobile (iOS-style).
48. **Edge-swipe back** from detail sheets.

### J. Polish Layer

49. **Focus ring animation** — `box-shadow` grows from 0 → 3px ring with spring on `:focus-visible`.
50. **Theme transition** — `<html>` gets a `view-transition-name`; theme swap cross-fades the entire UI in 300ms.
51. **Skeleton → content morph** — skeleton block fades to content in the same position with a slight scale-up (0.98 → 1).
52. **Toast stacking physics** — multiple toasts stack with spring offset, dismissing one springs the others up.
53. **Page load choreography** — header lands first (120ms), then bottom nav slides up (160ms), then content fades up (200ms).
54. **Cursor change on draggable** — `cursor: grab` → `cursor: grabbing` with a subtle scale cue.
55. **Backdrop blur intensifies** — when a sheet opens, blur animates from 0 → 8px over 220ms.

### K. Sound Design Hooks (optional, off by default)

56. **Tap click** (10ms, 800Hz), **Done chime** (200ms, ascending), **Streak fanfare** — Web Audio API, no asset downloads, off by default in settings.

## 2.3 Performance Architecture for All of This

* **Tier the cost**: CSS-only animations on mobile by default; Framer/GSAP-enhanced on desktop. Detect via `matchMedia('(pointer: fine)')`.
* **IntersectionObserver everywhere** — never animate offscreen elements.
* **Pause on hidden tab** — `document.visibilitychange` halts all loops.
* **Battery saver mode** — auto-downshift to "Minimal" intensity if `battery.level < 0.2 && !charging`.
* **GPU layer hygiene** — `will-change` added on enter, removed on exit. No global `will-change`.
* **One Lenis instance** at the app root; views just `useScroll` from it.
* **Bundle splitting** — GSAP lazy-loaded only when entering Analytics on desktop.
* **CLS guard** — every scroll animation uses transform, never layout properties.

## 2.4 Accessibility (non-negotiable additions)

* Three-level user setting: **Minimal / Standard / Playful** (already planned, expand it).
* A separate **"Disable scroll animations"** toggle (some users tolerate hover micro-interactions but get sick from parallax).
* All celebration motion has a **text-only fallback** (toast with message) when reduced.
* Focus ring animations remain even in reduced-motion (accessibility wins over preference).
* All gesture shortcuts have an equivalent button (swipe-to-complete also has a checkbox).

## 2.5 Settings UI (expanded "Motion" section)

```
Motion & Animation
├── Intensity: ( Minimal · Standard · Playful )
├── Scroll animations         [toggle]
├── Parallax effects          [toggle]
├── Cursor effects (desktop)  [toggle]
├── Haptic feedback           [toggle]
├── Sound effects             [toggle, default OFF]
├── Celebration confetti      [toggle]
└── Respect system reduce-motion [toggle, default ON]
```

## 2.6 Implementation Order (revised, additive)

1. Foundation: motion tokens, Tailwind keyframes, `useMotion`, settings UI.
2. Lenis smooth scroll + IntersectionObserver reveal hook.
3. shadcn Button/Card CVA `motion` variants.
4. HabitCard full motion overhaul (press, done, missed, edit jiggle, double-tap).
5. Shared-element bottom nav + sheet-from-card.
6. Scroll reveals + parallax + sticky progress.
7. Pointer-aware effects (magnetic, spotlight, tilt) — desktop bundle only.
8. Number/text animations (CountUp, flip streak).
9. Gesture layer (swipe-to-complete, long-press radial, pull-to-refresh).
10. Celebration tier system.
11. Theme transition + View Transitions API.
12. Sound design (opt-in).
13. Performance pass + a11y audit.

***