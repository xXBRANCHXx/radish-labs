import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const routes = ['/', '/work/', '/work/northline/', '/work/atlas/', '/work/relay/', '/approach/', '/studio/', '/start/'];

for (const route of routes) {
  test(`${route} renders without browser errors or horizontal overflow`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.site-header')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(pageErrors).toEqual([]);
  });
}

test('every page is usable at a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${route} overflows the mobile viewport`).toBeLessThanOrEqual(1);
  }
});

test('the mobile navigation opens, closes, and stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const toggle = page.locator('[data-nav-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-nav]')).toHaveClass(/is-open/);
  await expect(page.locator('[data-nav] a[href="/work/"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('the home system finder updates the recommendation and brief link', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('[data-finder-option="admin"]').click();

  await expect(page.locator('[data-finder-title]')).toHaveText('Operations tool');
  await expect(page.locator('[data-finder-shape]')).toHaveText('Internal web application');
  await expect(page.locator('[data-finder-link]')).toHaveAttribute('href', '/start/?goal=admin');
  await expect(page.locator('[data-finder-option="admin"]')).toHaveAttribute('aria-pressed', 'true');
});

test('the homepage capability strip moves left in direct response to scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const track = page.locator('[data-scroll-marquee-track]');
  const before = await track.evaluate((node) => getComputedStyle(node).transform);
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => track.evaluate((node) => getComputedStyle(node).transform)).not.toBe(before);
});

test('Northline recalculates the configuration and generates a specification', async ({ page }) => {
  await page.goto('/work/northline/', { waitUntil: 'networkidle' });
  await page.locator('input[name="size"][value="extended"]').check();
  await page.locator('input[name="use"][value="workshop"]').check();
  await page.locator('input[name="module"][value="solar"]').check();
  await expect(page.locator('[data-northline-price]')).toHaveText('$154,800');
  await expect(page.locator('[data-northline-code]')).toContainText('58W');
  await page.locator('[data-generate-spec]').click();
  await expect(page.locator('[data-northline-spec]')).toBeVisible();
  await expect(page.locator('[data-spec-output]')).toContainText('Solar pack');
  await expect(page.locator('[data-spec-output]')).toContainText('$154,800');
});

test('Atlas keeps the mission, map, status, and optimization state synchronized', async ({ page }) => {
  await page.goto('/work/atlas/', { waitUntil: 'networkidle' });
  await page.locator('[data-mission="power"]').click();
  await expect(page.locator('[data-atlas-title]')).toHaveText('Power relay replacement');
  await expect(page.locator('[data-route="power"]')).not.toHaveAttribute('hidden', '');
  await page.locator('[data-atlas-advance]').click();
  await expect(page.locator('[data-atlas-status]')).toHaveText('En route');
  await page.locator('[data-atlas-optimize]').click();
  await expect(page.locator('[data-atlas-risk]')).toHaveText('01');
  await expect(page.locator('[data-atlas-optimization]')).toContainText('19 min recovered');
});

test('Relay runs an explainable multi-stage workflow to completion', async ({ page }) => {
  await page.goto('/work/relay/', { waitUntil: 'networkidle' });
  await page.locator('[data-relay-scenario]').selectOption('change');
  await expect(page.locator('[data-relay-flow-name]')).toHaveText('HIGH-VALUE CHANGE REQUEST');
  await page.locator('[data-relay-run]').click();
  await expect(page.locator('[data-relay-outcome]')).toBeVisible({ timeout: 7000 });
  await expect(page.locator('[data-relay-run-status]')).toHaveText('COMPLETE');
  await expect(page.locator('[data-relay-stage].is-complete')).toHaveCount(5);
  await expect(page.locator('[data-relay-log]')).toContainText('Workflow completed without an unhandled exception');
});

test('the project brief builder validates, generates, copies, and downloads locally', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/start/?goal=admin', { waitUntil: 'networkidle' });

  await expect(page.locator('input[name="goal"]:checked')).toHaveValue('Replace a manual internal workflow');
  await page.locator('[data-step="1"] [data-next]').click();
  await page.locator('input[name="pressure"]').first().check();
  await page.locator('[data-step="2"] [data-next]').click();

  await page.locator('select[name="timing"]').selectOption({ label: 'Within 1–2 months' });
  await page.locator('select[name="budget"]').selectOption({ label: 'Full custom build' });
  await page.locator('textarea[name="context"]').fill('Orders are copied between three spreadsheets and nobody can see which handoff is currently blocked.');
  await page.locator('[data-step="3"] [data-next]').click();

  await page.locator('input[name="name"]').fill('Ari Example');
  await page.locator('input[name="company"]').fill('Example Works');
  await page.locator('input[name="email"]').fill('ari@example.com');
  await page.locator('[data-step="4"] button[type="submit"]').click();

  const result = page.locator('[data-brief-result]');
  await expect(result).toBeVisible();
  await expect(page.locator('[data-brief-output]')).toContainText('Example Works');
  await expect(page.locator('[data-brief-output]')).toContainText('Replace a manual internal workflow');
  await expect(page.locator('[data-email-brief]')).toHaveAttribute('href', /^mailto:\?subject=/);

  await page.locator('[data-copy-brief]').click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('RADISH LABS / PROJECT BRIEF');

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-download-brief]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('radish-labs-brief-example-works.txt');
});

test('the source site works when index.html is opened directly through file://', async ({ page }) => {
  const fileUrl = pathToFileURL(resolve(import.meta.dirname, '../../index.html')).href;
  await page.goto(fileUrl, { waitUntil: 'load' });
  await expect.poll(() => page.locator('html').evaluate((node) => node.classList.contains('js'))).toBe(true);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 5, 5)');
  await expect.poll(() => page.locator('.brand img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);

  await page.locator('[data-finder-option="admin"]').click();
  await expect(page.locator('[data-finder-title]')).toHaveText('Operations tool');

  await page.locator('.site-nav a[href*="work/index.html"]').click();
  await expect(page).toHaveURL(/\/work\/index\.html$/);
  await expect(page.locator('h1')).toContainText('WORKING PROOF');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 5, 5)');
});
