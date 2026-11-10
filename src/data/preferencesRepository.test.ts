import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createScoreState } from '../model/scoreState';
import { createSeriesState } from '../model/seriesState';
import { createSettingsState } from '../model/settingsState';
import { TEAM_ONE, TEAM_TWO } from '../model/truco';

import {
  clearAll,
  loadSession,
  loadSettings,
  saveSession,
  saveSettings,
  SESSION_KEY,
  SETTINGS_KEY,
} from './preferencesRepository';

const store = new Map<string, string>();
let failReads = false;

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }: { key: string }) => {
      if (failReads) throw new Error('storage indisponível');
      return { value: store.get(key) ?? null };
    },
    set: async ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
    },
    clear: async () => {
      store.clear();
    },
  },
}));

const DEFAULT = { active: false, series: createSeriesState() };

describe('preferencesRepository', () => {
  beforeEach(() => {
    store.clear();
    failReads = false;
  });

  it('sem nada salvo, devolve o padrão', async () => {
    expect(await loadSession()).toEqual(DEFAULT);
    expect(await loadSettings()).toEqual(createSettingsState());
  });

  it('salvar e recuperar a sessão (round-trip)', async () => {
    const session = {
      active: true,
      series: createSeriesState({
        gamesToWin: 2,
        currentGame: createScoreState({
          team1Name: 'Nós',
          team2Name: 'Eles',
          team1Score: 7,
          team2Score: 3,
          history: [
            { team: TEAM_ONE, points: 7, timestamp: 10 },
            { team: TEAM_TWO, points: 3, timestamp: 11 },
          ],
        }),
        completedGames: [{ team1Score: 12, team2Score: 5, winner: TEAM_ONE, timestamp: 5 }],
      }),
    };
    await saveSession(session);
    expect(await loadSession()).toEqual(session);
  });

  it('salvar e recuperar as preferências', async () => {
    const settings = createSettingsState({ themeMode: 'dark', hapticsEnabled: false, soundEnabled: true });
    await saveSettings(settings);
    expect(await loadSettings()).toEqual(settings);
  });

  it('JSON corrompido começa do zero sem quebrar', async () => {
    store.set(SESSION_KEY, '{"active": tru');
    store.set(SETTINGS_KEY, 'isso não é json');
    expect(await loadSession()).toEqual(DEFAULT);
    expect(await loadSettings()).toEqual(createSettingsState());
  });

  it('JSON válido, mas com a forma errada, volta ao padrão', async () => {
    store.set(SESSION_KEY, '[1,2,3]');
    store.set(SETTINGS_KEY, '"texto"');
    expect(await loadSession()).toEqual(DEFAULT);
    expect(await loadSettings()).toEqual(createSettingsState());
    store.set(SESSION_KEY, 'null');
    expect(await loadSession()).toEqual(DEFAULT);
  });

  it('sanitiza valores inválidos: nomes, placar, gamesToWin e itens ruins', async () => {
    store.set(
      SESSION_KEY,
      JSON.stringify({
        active: 'sim',
        series: {
          gamesToWin: 99,
          currentGame: {
            team1Name: '   ',
            team2Name: 42,
            team1Score: 50,
            team2Score: -4,
            history: [{ team: 9, points: 1 }, { team: 1, points: 'x' }, { team: 2, points: 2, timestamp: 1 }, null],
          },
          completedGames: [
            { winner: 7, team1Score: 12, team2Score: 0 },
            { winner: 2, team1Score: 3, team2Score: 12 },
          ],
        },
      }),
    );
    const { active, series } = await loadSession();
    expect(active).toBe(false);
    expect(series.gamesToWin).toBe(3);
    expect(series.currentGame.team1Name).toBe('Nossa Dupla');
    expect(series.currentGame.team2Name).toBe('Adversários');
    expect(series.currentGame.team1Score).toBe(12);
    expect(series.currentGame.team2Score).toBe(0);
    expect(series.currentGame.history).toEqual([{ team: TEAM_TWO, points: 2, timestamp: 1 }]);
    expect(series.completedGames).toEqual([{ team1Score: 3, team2Score: 12, winner: TEAM_TWO, timestamp: 0 }]);
  });

  it('preferências inválidas usam o padrão campo a campo', async () => {
    store.set(SETTINGS_KEY, JSON.stringify({ themeMode: 'roxo', hapticsEnabled: 'x', soundEnabled: true }));
    expect(await loadSettings()).toEqual(createSettingsState({ soundEnabled: true }));
  });

  it('erro de leitura do armazenamento não quebra', async () => {
    failReads = true;
    expect(await loadSession()).toEqual(DEFAULT);
    expect(await loadSettings()).toEqual(createSettingsState());
  });

  it('clearAll apaga série e preferências', async () => {
    await saveSession({ active: true, series: createSeriesState() });
    await saveSettings(createSettingsState({ themeMode: 'light' }));
    await clearAll();
    expect(await loadSession()).toEqual(DEFAULT);
    expect(await loadSettings()).toEqual(createSettingsState());
  });
});
