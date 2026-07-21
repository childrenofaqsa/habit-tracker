/**
 * Authenticated screenshot script for Agent Manager frontend.
 *
 * Usage:
 *   1. Copy this file to e2e/ (or run from there directly)
 *   2. Edit SHOTS array with the routes and output paths you need
 *   3. cd e2e && node take-screenshots.mjs
 *
 * Prerequisites: backend on :8000, frontend on :5173, pnpm install run in e2e/
 */

import pkg from './node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.js';
const { chromium } = pkg;

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8000';
const CREDENTIALS = { username: 'admin', password: 'admin123' };
const VIEWPORT = { width: 1440, height: 900 };

/** Edit this array to capture the pages you need. */
const SHOTS = [
  { route: '/skills', file: 'skills-list.png', waitFor: '[data-testid="skill-card"]' },
  // { route: '/skills/my-skill', file: 'skill-editor.png', waitFor: '.monaco-editor' },
  // { route: '/agent-configurations/my-config', file: 'agent-config.png' },
];

async function getToken() {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${CREDENTIALS.username}&password=${CREDENTIALS.password}`,
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

async function main() {
  const token = await getToken();
  console.log('✓ Token obtained');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  // Inject token before ANY navigation — this is the key trick for localStorage-JWT apps
  await page.addInitScript((t) => localStorage.setItem('auth_token', t), token);

  for (const { route, file, waitFor } of SHOTS) {
    console.log(`  → ${route}`);
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    if (waitFor) await page.waitForSelector(waitFor, { timeout: 10_000 });
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  ✓ Saved ${file}`);
  }

  await browser.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
