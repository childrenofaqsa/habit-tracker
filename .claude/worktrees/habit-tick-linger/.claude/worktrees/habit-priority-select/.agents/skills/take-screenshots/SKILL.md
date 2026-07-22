---
name: take-screenshots
description: Take authenticated screenshots of the Agent Manager frontend (or any JWT-localStorage app) using Playwright. Use when asked to capture screenshots of the running app for slides, docs, or reports. Handles the JWT-in-localStorage auth problem that breaks naive headless browser approaches.
---

# Take Screenshots

The Agent Manager frontend stores auth in `localStorage` under the key `auth_token`. Headless
browsers start with an empty localStorage on every fresh context, so navigating to any protected
route lands on the login page — unless you inject the token **before** the first navigation.

## The Core Pattern

```js
// 1. Get JWT from the API
const res = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'username=admin&password=admin123',
});
const { access_token } = await res.json();

// 2. Inject into localStorage BEFORE any page.goto()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript((t) => localStorage.setItem('auth_token', t), access_token);

// 3. Now navigate — the app sees a valid token
await page.goto('http://localhost:5173/some-protected-route');
await page.screenshot({ path: 'output.png' });
```

**Why `addInitScript` and not `page.evaluate`?**  
`page.evaluate` runs after the page loads — too late for the React app's auth check on mount.
`addInitScript` runs the snippet before every navigation in the context, so the token is in
localStorage before any JS executes.

## Running Playwright

Playwright is already installed in `e2e/node_modules/`. Write a standalone `.mjs` script and
run it from `e2e/`:

```bash
cd e2e
node take-screenshots.mjs
```

The import must use the default-import pattern (pnpm's playwright copy is CommonJS):

```js
import pkg from './node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.js';
const { chromium } = pkg;
```

## Full Template

See `scripts/take-screenshots.mjs` — copy to `e2e/`, customise the `SHOTS` array, then run.

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- `e2e/node_modules/` present (`cd e2e && pnpm install`)

## Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| Lands on login page | Token not injected in time | Use `addInitScript`, not `page.evaluate` |
| `Icon not found` in Slidev | Missing icon pack | `pnpm add @iconify-json/carbon` in the slides dir |
| `{{VAR}}` treated as Vue template | Mustache in Slidev slide body | Add `v-pre` to the element |
| CJS import error | pnpm playwright is CommonJS | Use `import pkg from '...'` then `const { chromium } = pkg` |
