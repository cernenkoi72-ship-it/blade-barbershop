const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const widths = [360, 768, 1280, 1440];
const fmt = value => new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, '');
async function captureResponsive(page, slug) {
  fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(__dirname, 'artifacts', slug + '-' + width + '.png'), fullPage: true });
  }
}

test('услуги, цены, длительность, выбор мастера', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#priceOutput')).toContainText(/1\s*800\s*₽/);
  await page.locator('#serviceSelect').selectOption('combo');
  await expect(page.locator('#priceOutput')).toContainText(/2\s*500\s*₽/);
  await expect(page.locator('#durationOutput')).toContainText('90 минут');
  await page.locator('[data-master="alexey"]').first().click();
  await expect(page.locator('#masterSelect')).toHaveValue('alexey');
});
test('запись: ошибочный контакт и демонстрационный результат', async ({ page }) => {
  await page.goto('/');
  await page.locator('#visitDate').fill(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  await page.locator('#visitTime').selectOption('12:00');
  await page.locator('#clientName').fill('Тестовый клиент');
  await page.locator('#clientContact').fill('not-valid');
  await page.locator('#bookingForm button[type="submit"]').click();
  await expect(page.locator('#bookingResult')).toBeHidden();
  await page.locator('#clientContact').fill('@demo_test');
  await page.locator('#bookingForm button[type="submit"]').click();
  await expect(page.locator('#bookingResult')).toBeVisible();
  await expect(page.locator('#resultText')).toHaveValue(/Время не забронировано/);
  await expect(page.locator('#copyStatus')).toContainText('никуда не отправлены');
});
test('мобильное меню доступно с клавиатуры', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const toggle = page.locator('#menuToggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mainNav')).toBeVisible();
  await page.locator('#mainNav a').first().click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
test('адаптивность и полноразмерные базовые скриншоты', async ({ page }) => { await captureResponsive(page, 'blade'); });
