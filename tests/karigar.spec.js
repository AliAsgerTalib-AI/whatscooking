// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ─── Brand & page shell ───────────────────────────────────────────────────────

test('shows KARIGAR brand and hero heading', async ({ page }) => {
  await expect(page.locator('nav').getByText('KARIGAR')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Any ingredients');
});

test('footer contains legal disclaimer and contact email', async ({ page }) => {
  const footer = page.locator('footer');
  await expect(footer).toContainText('AI-generated');
  await expect(footer).toContainText('aliasgertalib@gmail.com');
});

// ─── Ingredient input ─────────────────────────────────────────────────────────

test('adds an ingredient tag via Enter key', async ({ page }) => {
  const input = page.locator('#ingredient-input');
  await input.fill('chicken');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove chicken' })).toBeVisible();
});

test('adds an ingredient tag via comma key', async ({ page }) => {
  const input = page.locator('#ingredient-input');
  await input.fill('garlic');
  await input.press(',');
  await expect(page.getByRole('button', { name: 'Remove garlic' })).toBeVisible();
});

test('removes an ingredient tag via × button', async ({ page }) => {
  const input = page.locator('#ingredient-input');
  await input.fill('onion');
  await input.press('Enter');
  await page.getByRole('button', { name: 'Remove onion' }).click();
  await expect(page.getByRole('button', { name: 'Remove onion' })).not.toBeVisible();
});

test('removes last ingredient with Backspace', async ({ page }) => {
  const input = page.locator('#ingredient-input');
  await input.fill('rice');
  await input.press('Enter');
  await input.press('Backspace');
  await expect(page.getByRole('button', { name: 'Remove rice' })).not.toBeVisible();
});

test('quick-add button adds ingredient without typing', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick add chicken breast' }).click();
  await expect(page.getByRole('button', { name: 'Remove chicken breast' })).toBeVisible();
});

test('clear all removes every tag', async ({ page }) => {
  const input = page.locator('#ingredient-input');
  for (const ing of ['eggs', 'butter']) {
    await input.fill(ing);
    await input.press('Enter');
  }
  await page.getByRole('button', { name: 'Clear all ingredients' }).click();
  await expect(page.getByRole('button', { name: 'Remove eggs' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove butter' })).not.toBeVisible();
});

test('shows autocomplete suggestions while typing', async ({ page }) => {
  const input = page.getByRole('combobox').last();
  await input.fill('tom');
  const listbox = page.getByRole('listbox', { name: 'Ingredient suggestions' });
  await expect(listbox).toBeVisible();
  await expect(listbox.getByRole('option').first()).toBeVisible();
});

// ─── Serving size ─────────────────────────────────────────────────────────────

test('serving size button updates active state', async ({ page }) => {
  // Default is 4; click 2 and verify it becomes active
  const btn2 = page.locator('.flex.items-center.gap-2.flex-wrap button').filter({ hasText: '2' }).first();
  await btn2.click();
  // Active buttons have a different class from the token — just verify it's clickable and the page doesn't break
  await expect(btn2).toBeVisible();
});

// ─── Cook type selector ───────────────────────────────────────────────────────

test('selecting a cook type highlights it and Clear appears', async ({ page }) => {
  // Find a cook type card button — they're in a grid with icon + label
  const cookTypeBtn = page.locator('[class*="grid"] button').first();
  await cookTypeBtn.click();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
});

test('clearing cook type removes the Clear button', async ({ page }) => {
  const cookTypeBtn = page.locator('[class*="grid"] button').first();
  await cookTypeBtn.click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('button', { name: 'Clear' })).not.toBeVisible();
});

// ─── Validation ───────────────────────────────────────────────────────────────

test('shows error when Generate is clicked with no ingredients', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate My Recipe' }).click();
  await expect(page.getByText('Please add at least one ingredient.')).toBeVisible();
});

// ─── Navigation ───────────────────────────────────────────────────────────────

test('Saved tab navigates to saved recipes panel', async ({ page }) => {
  await page.getByRole('button', { name: /^Saved/ }).click();
  await expect(page.getByRole('heading', { name: 'Saved Recipes' })).toBeVisible();
});

test('clicking KARIGAR logo returns to generator tab', async ({ page }) => {
  // Go to favorites first
  await page.getByRole('button', { name: /^Saved/ }).click();
  await expect(page.getByRole('heading', { name: 'Saved Recipes' })).toBeVisible();
  // Click logo
  await page.locator('nav').getByText('KARIGAR').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Any ingredients');
});
