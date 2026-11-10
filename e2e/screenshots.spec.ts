/** Gera os prints do README em docs/screenshots (rodar: npx playwright test screenshots). */
import { test, type Page } from '@playwright/test';

import { startSeries, tab } from './helpers';

const OUT = 'docs/screenshots';
const shot = (page: Page, name: string): Promise<Buffer> => page.screenshot({ path: `${OUT}/${name}.png` });

for (const scheme of ['light', 'dark'] as const) {
  test(`placar tema ${scheme}`, async ({ browser }) => {
    const ctx = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await startSeries(page, 'Nossa Dupla', 'Adversários');
    await page.getByRole('button', { name: 'Truco: adicionar três tentos para Nossa Dupla' }).click();
    await page.getByRole('button', { name: 'Truco: adicionar três tentos para Nossa Dupla' }).click();
    await page.getByRole('button', { name: 'Adicionar um tento para Adversários' }).click();
    await page.waitForTimeout(400);
    await shot(page, `scoreboard-${scheme}`);
    await ctx.close();
  });
}

test('telas: início, nova partida, menu rápido, fim de partida, histórico, regras, ajustes', async ({ browser }) => {
  const ctx = await browser.newContext({
    colorScheme: 'dark',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(400);
  await shot(page, 'start');

  await page.getByRole('button', { name: 'Nova partida' }).click();
  await page.waitForTimeout(500);
  await shot(page, 'new-game');
  await page.getByRole('button', { name: /Começar série/ }).click();

  await page.getByRole('button', { name: 'Truco: adicionar três tentos para Nossa Dupla' }).click();
  await page.getByRole('button', { name: 'Adicionar um tento para Adversários' }).click();
  await page.getByRole('button', { name: /^Nossa Dupla tem 3 de 12 tentos/ }).click();
  await page.waitForTimeout(500);
  await shot(page, 'quick-add');
  await page.getByRole('button', { name: /Adicionar 9 tentos/ }).click();
  await page.locator('ion-alert.tento-alert:not(.overlay-hidden)').waitFor();
  await page.waitForTimeout(900);
  await shot(page, 'game-over');
  await page.getByRole('button', { name: 'Próxima partida' }).click();
  await page.getByRole('button', { name: 'Truco: adicionar três tentos para Adversários' }).click();

  await tab(page, 'Histórico');
  await page.waitForTimeout(400);
  await shot(page, 'history');
  await tab(page, 'Regras');
  await page.waitForTimeout(400);
  await shot(page, 'rules');
  await tab(page, 'Ajustes');
  await page.waitForTimeout(400);
  await shot(page, 'settings');
  await ctx.close();
});
