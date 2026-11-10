import { expect, test as base } from '@playwright/test';

import { collectConsoleProblems } from './helpers';

/**
 * `test` com um guarda automático: ao fim de CADA teste, o console não pode ter warnings/erros e o app não
 * pode ficar escondido de leitores de tela (`aria-hidden` preso no outlet, bug clássico de overlays encadeados).
 */
export const test = base.extend<{ guard: undefined }>({
  guard: [
    async ({ page }, use) => {
      const problems = collectConsoleProblems(page);
      await use(undefined);
      expect(problems, 'warnings/erros no console').toEqual([]);
      await expect(page.locator('ion-router-outlet[aria-hidden="true"]')).toHaveCount(0);
    },
    { auto: true },
  ],
});

export { expect };
