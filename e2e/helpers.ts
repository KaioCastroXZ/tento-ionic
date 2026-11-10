import { expect, type Page } from '@playwright/test';

/** Coleta warnings/erros do console (o app tem que rodar sem nenhum). */
export const collectConsoleProblems = (page: Page): string[] => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
};

export const startSeries = async (
  page: Page,
  team1 = 'Nós',
  team2 = 'Eles',
  format: 'Única' | '2' | '3' = '3',
): Promise<void> => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nova partida' }).click();
  await page.getByLabel('Nome da sua dupla').fill(team1);
  await page.getByLabel('Nome dos adversários').fill(team2);
  await page.locator('ion-segment-button', { hasText: format }).click();
  await page.getByRole('button', { name: /Começar (série|partida)/ }).click();
  await expect(page.getByRole('region', { name: team1 })).toBeVisible();
};

/** Espera (com retry) o placar da dupla chegar ao valor esperado. */
export const expectScore = (page: Page, team: string, value: number): Promise<void> =>
  expect(page.getByRole('region', { name: team }).locator('.team-panel__score')).toHaveText(String(value));

export const tab = (page: Page, name: string): Promise<void> =>
  page.locator('ion-tab-button', { hasText: name }).click();
