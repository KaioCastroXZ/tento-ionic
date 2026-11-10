import { expect, test } from '@playwright/test';

import { collectConsoleProblems, expectScore, startSeries, tab } from './helpers';

test('tela inicial, 4 abas e sem warnings no console', async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TENTO' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nova partida' })).toBeVisible();
  for (const name of ['Placar', 'Histórico', 'Regras', 'Ajustes']) {
    await expect(page.locator('ion-tab-button', { hasText: name })).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test('fluxo completo: marcar, truco, menu rápido, fim de partida, desfazer e persistência', async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await startSeries(page, 'Nós', 'Eles', '3');

  // + e TRUCO
  await page.getByRole('button', { name: 'Adicionar um tento para Nós' }).click();
  await expectScore(page, 'Nós', 1);
  await page.getByRole('button', { name: 'Truco: adicionar três tentos para Nós' }).click();
  await expectScore(page, 'Nós', 4);
  await page.getByRole('button', { name: 'Remover um tento de Nós' }).click();
  await expectScore(page, 'Nós', 3);
  await expect(page.getByText('Nós na frente: 3 / 12')).toBeVisible();

  // Persistência: recarregar volta exatamente onde estava
  await page.reload();
  await expectScore(page, 'Nós', 3);

  // Menu rápido passando de 12 pede confirmação; cancelar não altera
  await page.getByRole('button', { name: /^Nós tem 3 de 12 tentos/ }).click();
  await page.getByRole('button', { name: /Adicionar 12 tentos/ }).click();
  await expect(page.getByText('ultrapassaria 12')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expectScore(page, 'Nós', 3);

  // +9 chega exatamente a 12 → fim da partida 1
  await page.getByRole('button', { name: /^Nós tem 3 de 12 tentos/ }).click();
  await page.getByRole('button', { name: /Adicionar 9 tentos/ }).click();
  const gameOver = page.locator('ion-alert.tento-alert:not(.overlay-hidden)');
  await expect(gameOver).toContainText('Partida 1 encerrada');
  await expect(gameOver).toContainText('Nós venceu 12 x 0.');
  await expect(gameOver).toContainText('Série: 1 x 0 — próxima é a partida 2.');

  // Desfazer partida → desfaz o +9 (volta para 3 × 0) e apaga o registro da partida
  await gameOver.getByRole('button', { name: 'Desfazer partida' }).click();
  await expect(gameOver).toHaveCount(0);
  await expectScore(page, 'Nós', 3);
  await expect(page.getByText(/Série 0 x 0 · partida 1/)).toBeVisible();

  // Vence de novo e avança
  await page.getByRole('button', { name: /^Nós tem 3 de 12 tentos/ }).click();
  await page.getByRole('button', { name: /Adicionar 9 tentos/ }).click();
  await page.getByRole('button', { name: 'Próxima partida' }).click();
  await expectScore(page, 'Nós', 0);
  await expect(page.getByText(/Série 1 x 0 · partida 2/)).toBeVisible();

  // Desfazer com a partida zerada reabre a última partida em 12 × 0
  await page.getByRole('button', { name: 'Desfazer: reabrir a última partida encerrada' }).click();
  await expectScore(page, 'Nós', 12);
  await expect(page.locator('ion-alert.tento-alert:not(.overlay-hidden)')).toHaveCount(0); // reaberta: não reabre o alerta de fim

  // Histórico
  await tab(page, 'Histórico');
  await expect(page.getByText('Lançamentos da partida atual')).toBeVisible();
  await expect(page.getByText('Nenhum lançamento nesta partida ainda.')).toBeVisible();

  expect(problems).toEqual([]);
});

test('série de partida única termina e oferece Nova partida / Desfazer', async ({ page }) => {
  await startSeries(page, 'Nós', 'Eles', 'Única');
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Truco: adicionar três tentos para Eles' }).click();
  const alert = page.locator('ion-alert.tento-alert:not(.overlay-hidden)');
  await expect(alert).toContainText('Eles venceu!');
  await alert.getByRole('button', { name: 'Nova partida' }).click();
  await expect(page.getByRole('button', { name: /Começar partida/ })).toBeVisible();
});

test('série até 2 termina com "venceu a série" e Desfazer des-encerra', async ({ page }) => {
  await startSeries(page, 'Nós', 'Eles', '2');
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < 4; i++)
      await page.getByRole('button', { name: 'Truco: adicionar três tentos para Nós' }).click();
    if (g === 0) await page.getByRole('button', { name: 'Próxima partida' }).click();
  }
  const alert = page.locator('ion-alert.tento-alert:not(.overlay-hidden)');
  await expect(alert).toContainText('Nós venceu a série!');
  await alert.getByRole('button', { name: 'Desfazer' }).click();
  await expectScore(page, 'Nós', 9);
  await expect(page.getByText(/Série 1 x 0/)).toBeVisible();
});

test('editar nome da dupla e nome limitado a 24 caracteres', async ({ page }) => {
  await startSeries(page, 'Nós', 'Eles');
  await page.getByRole('button', { name: 'Editar o nome de Nós' }).click();
  await expect(page.locator('ion-alert[header="Nome da dupla"]:not(.overlay-hidden)')).toBeVisible();
  await page.getByRole('textbox', { name: 'Nome da dupla' }).fill('A'.repeat(40));
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('region', { name: 'A'.repeat(24) })).toBeVisible();
});

test('Zerar (com confirmação) mantém nomes e formato', async ({ page }) => {
  await startSeries(page, 'Nós', 'Eles');
  await page.getByRole('button', { name: 'Adicionar um tento para Nós' }).click();
  await page.getByRole('button', { name: 'Mais opções' }).click();
  await page.getByRole('button', { name: 'Zerar série' }).click();
  await page.getByRole('button', { name: 'Zerar', exact: true }).click();
  await expectScore(page, 'Nós', 0);
  await expect(page.getByRole('region', { name: 'Nós' })).toBeVisible();
});

test('Ajustes: tema escuro aplica ion-palette-dark e Resetar dados volta ao início', async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await startSeries(page, 'Nós', 'Eles');
  await tab(page, 'Ajustes');
  await page.locator('ion-segment-button', { hasText: 'Escuro' }).click();
  await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
  await page.locator('ion-segment-button', { hasText: 'Claro' }).click();
  await expect(page.locator('html')).not.toHaveClass(/ion-palette-dark/);

  await page.getByRole('button', { name: 'Resetar dados' }).click();
  await page.getByRole('button', { name: 'Resetar', exact: true }).click();
  await tab(page, 'Placar');
  await expect(page.getByRole('button', { name: 'Nova partida' })).toBeVisible();

  await tab(page, 'Regras');
  await page.locator('ion-segment-button', { hasText: 'Mineiro' }).click();
  await expect(page.getByText('Zap — 4 de paus')).toBeVisible();
  expect(problems).toEqual([]);
});
