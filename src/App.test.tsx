import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import App from './App';

test('abre na aba Placar com a tela inicial e as 4 abas', async () => {
  render(<App />);
  expect(await screen.findByText('Nova partida')).toBeInTheDocument();
  for (const label of ['Placar', 'Histórico', 'Regras', 'Ajustes']) {
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  }
});
