---
name: premium-motion-system
description: Design and implement a premium, accessible, performance-budgeted micro-interaction and scroll-animation system for a React + Vite + Tailwind + shadcn/ui + Zustand app. Invoke this skill whenever the user asks for: micro-interactions, hover/press animations, glow effects, scroll-driven animations, parallax, smooth scrolling, shared-element transitions, gesture animations, celebration moments, magnetic buttons, count-up numbers, page-load choreography, theme transitions, or wants to make a UI "feel premium / feel like Linear / feel like iOS / feel like Apple / feel polished / feel alive". Also use when reviewing existing UI for missing motion polish or when packaging the app for Tauri 2.
---

# Premium Motion System Skill

## When to use this skill

Trigger this skill when the user:
- Asks to add, design, or audit micro-interactions or animations.
- Mentions specific patterns: glow, hover zoom, press feedback, ripple, parallax, smooth scroll, scroll reveal, magnetic button, count-up, confetti, shared element, view transition, swipe gesture, pull to refresh.
- Compares their app to Linear, Stripe, Vercel, Notion, Apple, Things, Raycast, Arc, Framer, or any Awwwards-tier site.
- Wants the UI to "feel premium," "feel native," "feel alive," or "feel polished."
- Asks for accessibility-safe motion or reduce-motion handling.
- Wants performance-budgeted animation guidance for low-end devices, Tauri, or mobile wrappers.

## Core principles (always apply)

1. **Subtle over flashy.** Motion rewards interaction; it never competes with content.
2. **Animate only `transform`, `opacity`, `filter`, `box-shadow`.** Never animate layout properties.
3. **Honor `prefers-reduced-motion: reduce`** plus an in-app user override (`settings.motion.reduceMotion`).
4. **Hover requires a touch equivalent.** Every `:hover` state must have an `:active` or gesture parallel.
5. **Offline-safe.** No remote Lottie, no CDN assets. CSS keyframes, local Framer Motion, local confetti only.
6. **Composable.** Expose motion as CVA variants, Tailwind utilities, and small `<Motion />` / `<Glow />` wrappers — never inline ad-hoc styles in feature code.
7. **Performance budget**: TBT < 200ms, CLS = 0, max 2 simultaneous infinite animations on screen, pause on `visibilitychange`, auto-downshift on low battery.
8. **Tier intensity**: user-selectable Minimal · Standard · Playful, plus per-category toggles (scroll, parallax, cursor, haptics, sound, confetti).

## Stack defaults

- **Framer Motion v11** — springs, gestures, `layoutId`, `useScroll`, `useTransform`, exit animations.
- **Lenis** (`@studio-freight/lenis`) — one app-root instance for smooth scroll.
- **`@use-gesture/react`** — pointer, drag, pinch, wheel, swipe.
- **`canvas-confetti`** — celebrations.
- **`tailwindcss-animate`** — shadcn default keyframes.
- **View Transitions API** — progressive enhancement for route changes.
- **GSAP + ScrollTrigger** — opt-in, lazy-loaded, desktop bundle only when scroll choreography is complex.

## Required deliverables when implementing

When the user asks you to add motion to a component or view, always produce:

1. **A short rationale** (2–4 bullets) explaining which patterns you're applying and why.
2. **Code** using the stack defaults above, organized into the `src/styles/motion.css`, `src/lib/motionVariants.ts`, `src/hooks/`, and `src/components/motion/` structure.
3. **Reduced-motion fallback** for every animation.
4. **Touch parity** for every hover effect.
5. **Performance note** (which layer, will-change handling, IntersectionObserver if scroll-related).
6. **Settings hook-up** — read from `useAppStore(s => s.settings.motion)` to respect intensity tier.

## The full pattern catalog (reference)

### Pointer-aware (desktop, gated by `matchMedia('(pointer: fine)')`)
- Magnetic buttons, spotlight gradient, 3D tilt, cursor companion, hover-reveal density, animated gradient borders.

### Press & tap (universal)
- Ripple from touch point, spring press (`scale 1 → 0.94 → 1`), haptic pairing (`navigator.vibrate`), double-tap shortcuts.

### State transitions
- Morphing SVG icons (stroke-dashoffset, path interpolation), color cross-fade with spring, optimistic shimmer, loading-button spinner morph.

### Scroll animations
- Lenis smooth scroll baseline.
- IntersectionObserver fade-up with stagger.
- `useScroll` + `useTransform` parallax for headers.
- Sticky section progress bars.
- Scroll-velocity-reactive subtle skew (capped, decays, reduced-motion off).
- Scroll-snap with elastic edge resistance.
- Pull-to-refresh with rubber-band.
- Overscroll edge glow.
- Reveal-on-scroll for chart bars and matrix cells.
- Count-up metrics triggered when entering viewport.

### Shared-element / layout
- Framer `layoutId` for nav pills, sheet-from-card, FLIP list reorder.
- Native View Transitions API for route morphs (progressive enhancement).

### Numbers & text
- CountUp with easing, flip-clock digit roll, text scramble for milestones, slide-in/out for value diffs.

### Idle & ambient
- Breathing glow on the current-timeframe card, drifting gradient empty states, bobbing illustrations, slow pulse on "today" column.

### Celebration tiers
- T1 habit done: micro-confetti + check draw.
- T2 timeframe complete: header glow + toast.
- T3 day complete: full-screen confetti + modal.
- T4 streak milestone: cinematic burst + flip-clock streak + badge.
- Negative: gentle wiggle + soft red glow, never punishing.

### Gestures
- Swipe-to-complete (To-Do) with color reveal underneath.
- Long-press radial menu (Edit Mode).
- Pinch-to-zoom Analytics matrix.
- Two-finger swipe between tabs.
- Edge-swipe back from sheets.

### Polish
- Animated `:focus-visible` ring.
- Theme transition via View Transitions API.
- Skeleton-to-content morph in same position.
- Toast stack physics.
- Page load choreography (header → nav → content cascade).
- `cursor: grab/grabbing` with scale cue.
- Backdrop blur animation on sheet open.

### Sound (opt-in, off by default)
- Web Audio API: tap click (800Hz, 10ms), done chime (ascending 200ms), streak fanfare. Never load audio files.

## Motion tokens (always include in `motion.css`)

```css
:root {
  --ease-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-instant: 80ms; --dur-fast: 150ms; --dur-base: 220ms; --dur-slow: 400ms;
  --scale-press: 0.96; --scale-hover: 1.03; --scale-pop: 1.08;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Settings schema (always wire components to this)

```ts
type MotionSettings = {
  reduceMotion: boolean;          // overrides OS preference both ways
  intensity: 'minimal' | 'standard' | 'playful';
  scrollAnimations: boolean;
  parallax: boolean;
  cursorEffects: boolean;
  haptics: boolean;
  sound: boolean;                 // default false
  confetti: boolean;
  respectSystem: boolean;         // default true
};
```

## Implementation order (always recommend this sequence)

1. Tokens + Tailwind keyframes + reduced-motion guard + settings UI.
2. Lenis + IntersectionObserver reveal hook.
3. shadcn Button/Card CVA `motion` variants.
4. Hero component (e.g., HabitCard) full motion overhaul.
5. Shared-element navigation + sheet-from-card.
6. Scroll reveals + parallax + sticky progress.
7. Pointer-aware effects (desktop bundle only).
8. Number/text animations.
9. Gesture layer.
10. Celebration tier system.
11. Theme + View Transitions.
12. Sound (opt-in).
13. Performance + a11y audit.

## Audit checklist (use when reviewing existing UI)

- [ ] Every interactive element has hover **and** active/touch feedback.
- [ ] No layout properties animated.
- [ ] `prefers-reduced-motion` respected.
- [ ] User settings override available.
- [ ] No more than 2 infinite animations on screen at once.
- [ ] Offscreen elements not animating (IntersectionObserver).
- [ ] `will-change` added on enter, removed on exit.
- [ ] All shared-element transitions have stable `layoutId`s.
- [ ] All celebrations have a text-only fallback.
- [ ] Focus rings animate but remain visible under reduce-motion.
- [ ] Bundle impact measured (Framer + Lenis + use-gesture + confetti ≤ ~55KB gz; GSAP lazy-loaded if used).
- [ ] Battery-saver auto-downshift wired (`navigator.getBattery` where available).
- [ ] Tauri runtime parity verified (no browser-only APIs without fallback).

## Anti-patterns to flag and refactor

- Animating `width`, `height`, `top`, `left`, `margin`.
- Infinite loops on offscreen elements.
- Hover-only interactions with no touch equivalent.
- Animation durations > 500ms for routine feedback (feels sluggish).
- Bouncy springs on destructive actions (feels playful where it shouldn't).
- Confetti on every action (devalues celebration).
- Parallax with no opt-out (motion sickness risk).
- Custom scroll hijacking without Lenis (breaks accessibility).
- Base64 image animations (bloats bundle).
- Loading remote Lottie JSON (breaks offline rule).

## Resources in this skill

- `resources/motion.css` — full tokens + keyframes + reduced-motion guard.
- `resources/tailwind.motion.ts` — Tailwind config extension.
- `resources/useMotion.ts` — settings-aware hook.
- `resources/useReveal.ts` — IntersectionObserver scroll-reveal hook.
- `resources/useMagnetic.ts` — magnetic-button hook.
- `resources/useSpotlight.ts` — cursor-following gradient hook.
- `resources/LenisProvider.tsx` — app-root smooth scroll provider.
- `resources/Motion.tsx` — variant-driven wrapper.
- `resources/Glow.tsx` — one-shot and persistent glow wrapper.
- `resources/CountUp.tsx` — animated number component.
- `resources/celebrate.ts` — tiered confetti orchestrator.
- `resources/motionVariants.ts` — Framer Motion preset library.
- `resources/HabitCard.example.tsx` — reference implementation showing every relevant pattern wired together.
- `resources/audit-checklist.md` — printable review checklist.

## Output format

When asked to implement, produce files in the structure above, ready to paste into the project. When asked to audit, return a table with: pattern · current state · recommendation · effort (S/M/L) · accessibility note.

When asked to design, return:
1. Rationale (2–4 bullets).
2. Pattern list with rationale per pattern.
3. Settings impact.
4. Performance impact estimate.
5. Implementation order.