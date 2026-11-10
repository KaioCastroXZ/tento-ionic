/**
 * Persistência local (substitui o DataStore do app Android). Guarda tudo em JSON
 * via @capacitor/preferences (localStorage no navegador, SharedPreferences no Android).
 *
 * Ao carregar, qualquer JSON inválido, truncado ou com tipos errados é higienizado
 * ou descartado: o app nunca quebra por causa de dado salvo.
 */
import { Preferences } from '@capacitor/preferences';

import { coerceInt, loadSeries, normalizeName } from '../engine';
import type { GameResult } from '../model/gameResult';
import type { ScoreEvent } from '../model/scoreEvent';
import { createScoreState, DEFAULT_TEAM_1, DEFAULT_TEAM_2 } from '../model/scoreState';
import { createSeriesState, DEFAULT_GAMES_TO_WIN, type SeriesState } from '../model/seriesState';
import { createSettingsState, THEME_MODES, type SettingsState } from '../model/settingsState';
import { isValidTeam, WINNING_SCORE } from '../model/truco';

export const SESSION_KEY = 'tento.session';
export const SETTINGS_KEY = 'tento.settings';

/**
 * Sessão salva: a série + se há uma série "ativa". O flag é separado do placar porque
 * logo depois de "Nova série" o placar é 0×0 sem lançamentos (indistinguível de "nunca jogou").
 */
export interface Session {
  readonly active: boolean;
  readonly series: SeriesState;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const parseJson = (raw: string | null): unknown => {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const isFiniteInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

const parseEvents = (raw: unknown): ScoreEvent[] =>
  (Array.isArray(raw) ? raw : []).flatMap((e): ScoreEvent[] =>
    isRecord(e) && isValidTeam(e.team) && isFiniteInt(e.points) && e.points !== 0
      ? [{ team: e.team, points: e.points, timestamp: coerceInt(e.timestamp, 0, Number.MAX_SAFE_INTEGER, 0) }]
      : [],
  );

const parseGames = (raw: unknown): GameResult[] =>
  (Array.isArray(raw) ? raw : []).flatMap((g): GameResult[] =>
    isRecord(g) && isValidTeam(g.winner) && isFiniteInt(g.team1Score) && isFiniteInt(g.team2Score)
      ? [
          {
            team1Score: coerceInt(g.team1Score, 0, WINNING_SCORE, 0),
            team2Score: coerceInt(g.team2Score, 0, WINNING_SCORE, 0),
            winner: g.winner,
            timestamp: coerceInt(g.timestamp, 0, Number.MAX_SAFE_INTEGER, 0),
          },
        ]
      : [],
  );

/** Converte um valor desconhecido (JSON) em `SeriesState` válido; o que não presta vira o padrão. */
export const parseSeries = (raw: unknown): SeriesState => {
  if (!isRecord(raw)) return createSeriesState();
  const game = isRecord(raw.currentGame) ? raw.currentGame : {};
  return loadSeries(
    createSeriesState({
      gamesToWin: coerceInt(raw.gamesToWin, 1, 3, DEFAULT_GAMES_TO_WIN),
      currentGame: createScoreState({
        team1Name: normalizeName(game.team1Name, DEFAULT_TEAM_1),
        team2Name: normalizeName(game.team2Name, DEFAULT_TEAM_2),
        team1Score: coerceInt(game.team1Score, 0, WINNING_SCORE, 0),
        team2Score: coerceInt(game.team2Score, 0, WINNING_SCORE, 0),
        history: parseEvents(game.history),
      }),
      completedGames: parseGames(raw.completedGames),
    }),
  );
};

export const parseSettings = (raw: unknown): SettingsState => {
  const defaults = createSettingsState();
  if (!isRecord(raw)) return defaults;
  return {
    themeMode: THEME_MODES.find((m) => m === raw.themeMode) ?? defaults.themeMode,
    hapticsEnabled: typeof raw.hapticsEnabled === 'boolean' ? raw.hapticsEnabled : defaults.hapticsEnabled,
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : defaults.soundEnabled,
  };
};

export const loadSession = async (): Promise<Session> => {
  try {
    const { value } = await Preferences.get({ key: SESSION_KEY });
    const parsed = parseJson(value);
    if (!isRecord(parsed)) return { active: false, series: createSeriesState() };
    return { active: parsed.active === true, series: parseSeries(parsed.series) };
  } catch {
    return { active: false, series: createSeriesState() };
  }
};

export const saveSession = async (session: Session): Promise<void> => {
  await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(session) });
};

export const loadSettings = async (): Promise<SettingsState> => {
  try {
    const { value } = await Preferences.get({ key: SETTINGS_KEY });
    return parseSettings(parseJson(value));
  } catch {
    return createSettingsState();
  }
};

export const saveSettings = async (settings: SettingsState): Promise<void> => {
  await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(settings) });
};

/** Apaga tudo (série, histórico e preferências). */
export const clearAll = async (): Promise<void> => {
  await Preferences.clear();
};
